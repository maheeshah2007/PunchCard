"""
NeighborGood PunchCard backend — FastAPI + SQLite
Run with: uvicorn app:app --reload --port 8001
"""

import random
import string
import traceback
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from sqlalchemy import (
    create_engine, Column, String, Integer, Boolean,
    DateTime, Float, ForeignKey, Text
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session, relationship

DATABASE_URL = "sqlite:///./neighborgood.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class UserDB(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True)
    email = Column(String, nullable=True)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    role = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    business = relationship("BusinessDB", back_populates="owner", uselist=False, foreign_keys="BusinessDB.owner_id")
    punchcards = relationship("UserPunchCardDB", back_populates="user")


class BusinessDB(Base):
    __tablename__ = "businesses"
    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String, nullable=True)
    address = Column(String, nullable=True)
    logo_color = Column(String, default="#6B48FF")
    cover_color = Column(String, default="#EDE9FF")
    logo_image = Column(Text, nullable=True)
    rating = Column(Float, default=0.0)
    is_mock = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("UserDB", back_populates="business", foreign_keys=[owner_id])
    templates = relationship("PunchCardTemplateDB", back_populates="business")
    auth_codes = relationship("AuthCodeDB", back_populates="business")


class PunchCardTemplateDB(Base):
    __tablename__ = "punchcard_templates"
    id = Column(Integer, primary_key=True, autoincrement=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    name = Column(String, nullable=False)
    total_stamps = Column(Integer, default=10)
    reward_description = Column(String, nullable=False)
    style = Column(String, default="classic")
    card_color = Column(String, default="#1A1A1A")
    stamp_color = Column(String, default="#C8A090")
    stamp_icon = Column(String, default="⭕")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    business = relationship("BusinessDB", back_populates="templates")
    user_punchcards = relationship("UserPunchCardDB", back_populates="template")


class UserPunchCardDB(Base):
    __tablename__ = "user_punchcards"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("punchcard_templates.id"), nullable=False)
    stamps_collected = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    is_redeemed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    user = relationship("UserDB", back_populates="punchcards")
    template = relationship("PunchCardTemplateDB", back_populates="user_punchcards")


class AuthCodeDB(Base):
    __tablename__ = "auth_codes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    business_id = Column(Integer, ForeignKey("businesses.id"), nullable=False)
    template_id = Column(Integer, ForeignKey("punchcard_templates.id"), nullable=False)
    code = Column(String(4), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False)
    used_by_user_id = Column(String, nullable=True)
    used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    business = relationship("BusinessDB", back_populates="auth_codes")


SEED_OWNER_ID = "seed_owner_00001"

SEED_BUSINESSES = [
    {
        "name": "Brew & Bloom Coffee",
        "description": "Your cozy neighborhood coffee spot. Fresh brews, warm vibes, and the best pastries on the block.",
        "category": "Coffee",
        "address": "123 Forbes Ave, Pittsburgh, PA",
        "logo_color": "#6B48FF",
        "cover_color": "#EDE9FF",
        "rating": 4.9,
        "template": {"name": "Coffee Loyalty Card", "total_stamps": 10, "reward_description": "Free coffee of your choice!", "style": "coffee"},
    },
    {
        "name": "The Bookworm",
        "description": "Independent bookstore with curated selections, cozy reading nooks, and weekly author events.",
        "category": "Books",
        "address": "456 Craig St, Pittsburgh, PA",
        "logo_color": "#FF6B35",
        "cover_color": "#FFF0E9",
        "rating": 4.8,
        "template": {"name": "Book Club Card", "total_stamps": 8, "reward_description": "20% off your next purchase!", "style": "star"},
    },
    {
        "name": "Slice of Life Pizzeria",
        "description": "Hand-tossed New York style pizza by the slice or whole pie. Open late, always fresh.",
        "category": "Food",
        "address": "789 Murray Ave, Pittsburgh, PA",
        "logo_color": "#FF3535",
        "cover_color": "#FFF0F0",
        "rating": 4.7,
        "template": {"name": "Pizza Lovers Card", "total_stamps": 10, "reward_description": "Free large pizza!", "style": "heart"},
    },
    {
        "name": "FitZone Gym",
        "description": "State-of-the-art equipment, group classes, and personal training. Your fitness journey starts here.",
        "category": "Fitness",
        "address": "101 Baum Blvd, Pittsburgh, PA",
        "logo_color": "#00C896",
        "cover_color": "#E6FFF9",
        "rating": 4.6,
        "template": {"name": "Fitness Rewards Card", "total_stamps": 12, "reward_description": "Free personal training session!", "style": "classic"},
    },
    {
        "name": "Sweet Tooth Bakery",
        "description": "Artisan pastries, custom cakes, and seasonal treats baked fresh daily by our pastry chefs.",
        "category": "Food",
        "address": "222 S Highland Ave, Pittsburgh, PA",
        "logo_color": "#FF9B3D",
        "cover_color": "#FFF7ED",
        "rating": 4.9,
        "template": {"name": "Bakery Loyalty Card", "total_stamps": 9, "reward_description": "Free cupcake box (6 pack)!", "style": "heart"},
    },
    {
        "name": "Noodle House",
        "description": "Authentic Asian noodles and dumplings with recipes from across East Asia. Vegetarian-friendly.",
        "category": "Food",
        "address": "333 Forbes Ave, Pittsburgh, PA",
        "logo_color": "#FF5B5B",
        "cover_color": "#FFF0F0",
        "rating": 4.7,
        "template": {"name": "Noodle Reward Card", "total_stamps": 10, "reward_description": "Free bowl of noodles!", "style": "classic"},
    },
    {
        "name": "Campus Cuts",
        "description": "Affordable haircuts and styling for students and locals. Walk-ins welcome.",
        "category": "Beauty",
        "address": "55 S Craig St, Pittsburgh, PA",
        "logo_color": "#9B59B6",
        "cover_color": "#F5E9FF",
        "rating": 4.5,
        "template": {"name": "Loyalty Cut Card", "total_stamps": 6, "reward_description": "Free haircut!", "style": "star"},
    },
    {
        "name": "Green Bowl",
        "description": "Fresh salads, grain bowls, and smoothies made with locally sourced ingredients.",
        "category": "Food",
        "address": "88 Atwood St, Pittsburgh, PA",
        "logo_color": "#27AE60",
        "cover_color": "#E9FFF0",
        "rating": 4.8,
        "template": {"name": "Healthy Eats Card", "total_stamps": 8, "reward_description": "Free signature bowl!", "style": "classic"},
    },
]


def seed_database(db: Session):
    # Ensure dev bypass users always exist
    for dev_id, dev_role, dev_name in [
        ("dev_user_00001", "user", "Dev Customer"),
        ("dev_business_00001", "business", "Dev Business"),
    ]:
        if not db.query(UserDB).filter(UserDB.id == dev_id).first():
            db.add(UserDB(id=dev_id, email=f"{dev_id}@localhost", name=dev_name, role=dev_role))
    db.flush()

    already_seeded = db.query(BusinessDB).filter(BusinessDB.is_mock == True).first()
    if not already_seeded:
        seed_owner = db.query(UserDB).filter(UserDB.id == SEED_OWNER_ID).first()
        if not seed_owner:
            seed_owner = UserDB(id=SEED_OWNER_ID, email="demo@neighborgood.app", name="NeighborGood Demo", role="business")
            db.add(seed_owner)
            db.flush()
        for biz_data in SEED_BUSINESSES:
            tmpl_data = biz_data.pop("template")
            biz = BusinessDB(owner_id=SEED_OWNER_ID, is_mock=True, **biz_data)
            db.add(biz)
            db.flush()
            db.add(PunchCardTemplateDB(business_id=biz.id, **tmpl_data))
            biz_data["template"] = tmpl_data
        db.commit()

    # Seed dev customer with sample punchcards so the dashboard shows real data
    dev_user = db.query(UserDB).filter(UserDB.id == "dev_user_00001").first()
    if dev_user and not db.query(UserPunchCardDB).filter(UserPunchCardDB.user_id == "dev_user_00001").first():
        templates = db.query(PunchCardTemplateDB).limit(3).all()
        stamps = [4, 3, 4]  # stamps_collected for each card
        for tmpl, s in zip(templates, stamps):
            db.add(UserPunchCardDB(user_id="dev_user_00001", template_id=tmpl.id, stamps_collected=s))
        db.commit()


GOOGLE_CLIENT_ID = "212855412758-c7guc92ug9eloic9a3ib9eknhrapgni1.apps.googleusercontent.com"

app = FastAPI(title="NeighborGood API")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
    # Add new columns to existing DBs without losing data
    from sqlalchemy import text
    with engine.connect() as conn:
        for stmt in [
            "ALTER TABLE businesses ADD COLUMN logo_image TEXT",
        ]:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass  # Column already exists
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


class GoogleCredential(BaseModel):
    credential: str

class SetRoleRequest(BaseModel):
    role: str

class CreateBusinessRequest(BaseModel):
    name: str
    description: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    logo_color: Optional[str] = "#6B48FF"
    cover_color: Optional[str] = "#EDE9FF"
    logo_image: Optional[str] = None

class UpdateBusinessRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    address: Optional[str] = None
    logo_color: Optional[str] = None
    cover_color: Optional[str] = None
    logo_image: Optional[str] = None

class CreateTemplateRequest(BaseModel):
    name: str
    total_stamps: int = 10
    reward_description: str
    style: str = "classic"
    card_color: str = "#1A1A1A"
    stamp_color: str = "#C8A090"
    stamp_icon: str = "⭕"

class GenerateCodeRequest(BaseModel):
    template_id: int

class RedeemCodeRequest(BaseModel):
    code: str
    business_id: int


def require_user(x_user_id: str, db: Session) -> UserDB:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(UserDB).filter(UserDB.id == x_user_id).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

def require_business(user: UserDB, db: Session) -> BusinessDB:
    biz = db.query(BusinessDB).filter(BusinessDB.owner_id == user.id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found — create one first")
    return biz

def serialize_template(t: PunchCardTemplateDB) -> dict:
    return {"id": t.id, "name": t.name, "total_stamps": t.total_stamps, "reward_description": t.reward_description, "style": t.style, "is_active": t.is_active, "card_color": t.card_color or "#1A1A1A", "stamp_color": t.stamp_color or "#C8A090", "stamp_icon": t.stamp_icon or "⭕"}

def serialize_business(b: BusinessDB, include_template: bool = True) -> dict:
    active_template = None
    if include_template:
        active = [t for t in b.templates if t.is_active]
        if active:
            active_template = serialize_template(active[0])
    return {"id": b.id, "name": b.name, "description": b.description, "category": b.category, "address": b.address, "logo_color": b.logo_color, "cover_color": b.cover_color, "logo_image": b.logo_image, "rating": b.rating, "active_template": active_template}

def serialize_user_punchcard(upc: UserPunchCardDB) -> dict:
    t = upc.template
    b = t.business
    return {"id": upc.id, "stamps_collected": upc.stamps_collected, "is_completed": upc.is_completed, "is_redeemed": upc.is_redeemed, "template": serialize_template(t), "business": {"id": b.id, "name": b.name, "logo_color": b.logo_color, "category": b.category}}


@app.get("/health")
def health():
    return {"ok": True}

@app.post("/dev/reset")
def dev_reset(db: Session = Depends(get_db)):
    """Dev-only: wipe all non-seed data and reseed fresh."""
    # Delete all auth codes, user punchcards, non-seed businesses
    db.query(AuthCodeDB).delete()
    db.query(UserPunchCardDB).delete()
    non_seed_biz = db.query(BusinessDB).filter(BusinessDB.is_mock == False).all()
    for b in non_seed_biz:
        db.query(PunchCardTemplateDB).filter(PunchCardTemplateDB.business_id == b.id).delete()
        db.delete(b)
    # Reset dev users
    for dev_id in ["dev_user_00001", "dev_business_00001"]:
        db.query(UserDB).filter(UserDB.id == dev_id).delete()
    db.flush()
    # Re-seed dev users
    db.add(UserDB(id="dev_user_00001", email="dev-user@localhost", name="Dev Customer", role="user"))
    db.add(UserDB(id="dev_business_00001", email="dev-business@localhost", name="Dev Business", role="business"))
    db.flush()
    # Re-seed sample punchcards for dev customer
    templates = db.query(PunchCardTemplateDB).limit(3).all()
    for tmpl, s in zip(templates, [4, 3, 4]):
        db.add(UserPunchCardDB(user_id="dev_user_00001", template_id=tmpl.id, stamps_collected=s))
    db.commit()
    return {"ok": True, "message": "Data reset. Dev business needs to re-run onboarding."}

@app.post("/dev/reset-business")
def dev_reset_business(db: Session = Depends(get_db)):
    """Dev-only: delete dev_business_00001's business so they re-run onboarding."""
    biz = db.query(BusinessDB).filter(BusinessDB.owner_id == "dev_business_00001").first()
    if biz:
        template_ids = [t.id for t in biz.templates]
        if template_ids:
            db.query(UserPunchCardDB).filter(UserPunchCardDB.template_id.in_(template_ids)).delete(synchronize_session=False)
            db.query(AuthCodeDB).filter(AuthCodeDB.business_id == biz.id).delete()
            db.query(PunchCardTemplateDB).filter(PunchCardTemplateDB.business_id == biz.id).delete()
        db.delete(biz)
        db.commit()
    return {"ok": True, "message": "Business deleted. Re-run onboarding to create a new one."}

@app.post("/auth/dev-login")
def dev_login(role: str = "user", db: Session = Depends(get_db)):
    """Dev-only bypass — skips Google OAuth for local testing."""
    user_id = f"dev_{role}_00001"
    user = db.query(UserDB).filter(UserDB.id == user_id).first()
    if not user:
        user = UserDB(id=user_id, email=f"dev-{role}@localhost", name=f"Dev {role.capitalize()}", role=role)
        db.add(user)
        db.commit()
        db.refresh(user)
    elif user.role != role:
        user.role = role
        db.commit()
    return {"ok": True, "user": {"sub": user.id, "email": user.email, "name": user.name, "picture": None, "role": user.role}}

@app.post("/auth/google")
def auth_google(payload: GoogleCredential, db: Session = Depends(get_db)):
    try:
        idinfo = id_token.verify_oauth2_token(payload.credential, google_requests.Request(), GOOGLE_CLIENT_ID)
        sub = idinfo["sub"]
        user = db.query(UserDB).filter(UserDB.id == sub).first()
        if not user:
            user = UserDB(id=sub, email=idinfo.get("email"), name=idinfo.get("name"), picture=idinfo.get("picture"))
            db.add(user)
            db.commit()
            db.refresh(user)
        return {"ok": True, "user": {"sub": user.id, "email": user.email, "name": user.name, "picture": user.picture, "role": user.role}}
    except Exception as e:
        print("Google token verification failed:", repr(e))
        traceback.print_exc()
        raise HTTPException(status_code=401, detail="Invalid Google token")

@app.get("/users/me")
def get_me(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    return {"id": user.id, "email": user.email, "name": user.name, "picture": user.picture, "role": user.role}

@app.put("/users/me/role")
def set_role(payload: SetRoleRequest, x_user_id: str = Header(None), db: Session = Depends(get_db)):
    if payload.role not in ("user", "business"):
        raise HTTPException(status_code=400, detail="Role must be 'user' or 'business'")
    user = require_user(x_user_id, db)
    user.role = payload.role
    db.commit()
    return {"ok": True, "role": user.role}

@app.get("/businesses/me")
def get_my_business(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    biz = require_business(user, db)
    return serialize_business(biz)

@app.put("/businesses/me")
def update_my_business(payload: UpdateBusinessRequest, x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    biz = require_business(user, db)
    for k, v in payload.dict(exclude_none=True).items():
        setattr(biz, k, v)
    db.commit()
    db.refresh(biz)
    return serialize_business(biz)

@app.get("/businesses/me/stats")
def get_my_stats(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    biz = require_business(user, db)
    template_ids = [t.id for t in biz.templates]
    cards = db.query(UserPunchCardDB).filter(UserPunchCardDB.template_id.in_(template_ids)).all()
    unique_customers = len({c.user_id for c in cards})
    total_stamps = sum(c.stamps_collected for c in cards)
    completed = sum(1 for c in cards if c.is_completed)
    redeemed_codes = db.query(AuthCodeDB).filter(AuthCodeDB.business_id == biz.id, AuthCodeDB.is_used == True).count()
    return {"unique_customers": unique_customers, "total_stamps_given": total_stamps, "completed_cards": completed, "total_transactions": redeemed_codes}

@app.get("/businesses/me/customers")
def get_my_customers(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    biz = require_business(user, db)
    template_ids = [t.id for t in biz.templates]
    cards = db.query(UserPunchCardDB).filter(UserPunchCardDB.template_id.in_(template_ids)).all()
    by_user: dict = {}
    for card in cards:
        uid = card.user_id
        if uid not in by_user:
            u = db.query(UserDB).filter(UserDB.id == uid).first()
            by_user[uid] = {"name": u.name if u else "Unknown", "email": u.email if u else "", "picture": u.picture if u else None, "stamps": 0, "completed": False}
        by_user[uid]["stamps"] += card.stamps_collected
        if card.is_completed:
            by_user[uid]["completed"] = True
    return list(by_user.values())

@app.get("/businesses/me/templates")
def get_my_templates(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    biz = require_business(user, db)
    return [serialize_template(t) for t in biz.templates]

@app.get("/businesses")
def list_businesses(category: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(BusinessDB)
    if category:
        q = q.filter(BusinessDB.category == category)
    return [serialize_business(b) for b in q.all()]

@app.post("/businesses")
def create_business(payload: CreateBusinessRequest, x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    if db.query(BusinessDB).filter(BusinessDB.owner_id == user.id).first():
        raise HTTPException(status_code=400, detail="You already have a business")
    biz = BusinessDB(owner_id=user.id, **payload.dict())
    db.add(biz)
    db.commit()
    db.refresh(biz)
    return serialize_business(biz)

@app.get("/businesses/{business_id}")
def get_business(business_id: int, db: Session = Depends(get_db)):
    biz = db.query(BusinessDB).filter(BusinessDB.id == business_id).first()
    if not biz:
        raise HTTPException(status_code=404, detail="Business not found")
    return serialize_business(biz)

@app.post("/punchcard-templates")
def create_template(payload: CreateTemplateRequest, x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    biz = require_business(user, db)
    for t in biz.templates:
        if t.is_active:
            t.is_active = False
    tmpl = PunchCardTemplateDB(business_id=biz.id, **payload.dict())
    db.add(tmpl)
    db.commit()
    db.refresh(tmpl)
    return serialize_template(tmpl)

@app.get("/user/punchcards")
def get_user_punchcards(x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    cards = db.query(UserPunchCardDB).filter(UserPunchCardDB.user_id == user.id).all()
    return [serialize_user_punchcard(c) for c in cards]

@app.post("/user/punchcards/{template_id}")
def join_program(template_id: int, x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    tmpl = db.query(PunchCardTemplateDB).filter(PunchCardTemplateDB.id == template_id).first()
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found")
    existing = db.query(UserPunchCardDB).filter(UserPunchCardDB.user_id == user.id, UserPunchCardDB.template_id == template_id).first()
    if existing:
        return serialize_user_punchcard(existing)
    card = UserPunchCardDB(user_id=user.id, template_id=template_id)
    db.add(card)
    db.commit()
    db.refresh(card)
    return serialize_user_punchcard(card)

@app.post("/auth-codes/generate")
def generate_code(payload: GenerateCodeRequest, x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    biz = require_business(user, db)
    tmpl = db.query(PunchCardTemplateDB).filter(PunchCardTemplateDB.id == payload.template_id, PunchCardTemplateDB.business_id == biz.id).first()
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found")
    now = datetime.utcnow()
    db.query(AuthCodeDB).filter(AuthCodeDB.business_id == biz.id, AuthCodeDB.is_used == False, AuthCodeDB.expires_at > now).update({"expires_at": now})
    code = "".join(random.choices(string.digits, k=4))
    expires_at = now + timedelta(minutes=1)
    auth_code = AuthCodeDB(business_id=biz.id, template_id=payload.template_id, code=code, expires_at=expires_at)
    db.add(auth_code)
    db.commit()
    return {"code": code, "expires_at": expires_at.isoformat() + "Z", "template_id": payload.template_id, "business_id": biz.id}

@app.post("/auth-codes/redeem")
def redeem_code(payload: RedeemCodeRequest, x_user_id: str = Header(None), db: Session = Depends(get_db)):
    user = require_user(x_user_id, db)
    now = datetime.utcnow()
    auth_code = db.query(AuthCodeDB).filter(AuthCodeDB.business_id == payload.business_id, AuthCodeDB.code == payload.code, AuthCodeDB.is_used == False).first()
    if not auth_code:
        raise HTTPException(status_code=404, detail="Invalid code — check the code and try again")
    if auth_code.expires_at < now:
        raise HTTPException(status_code=400, detail="This code has expired — ask the business for a new one")
    tmpl_id = auth_code.template_id
    card = db.query(UserPunchCardDB).filter(UserPunchCardDB.user_id == user.id, UserPunchCardDB.template_id == tmpl_id).first()
    if not card:
        card = UserPunchCardDB(user_id=user.id, template_id=tmpl_id)
        db.add(card)
        db.flush()
    tmpl = db.query(PunchCardTemplateDB).filter(PunchCardTemplateDB.id == tmpl_id).first()
    if card.stamps_collected < tmpl.total_stamps:
        card.stamps_collected += 1
        if card.stamps_collected >= tmpl.total_stamps:
            card.is_completed = True
            card.completed_at = now
    auth_code.is_used = True
    auth_code.used_by_user_id = user.id
    auth_code.used_at = now
    db.commit()
    db.refresh(card)
    return {"ok": True, "stamps_collected": card.stamps_collected, "is_completed": card.is_completed, "punchcard": serialize_user_punchcard(card)}
