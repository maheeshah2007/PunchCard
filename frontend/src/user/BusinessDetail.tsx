import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, UserCards, Business, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const BG = "#0E0E0E";
const SURFACE = "#1A1A1A";
const TEXT = "#F9F9F9";
const TEXT2 = "#B7B7B7";
const MONO = "'DM Mono', 'Space Mono', monospace";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💅", Retail: "🛍️", Other: "🏪",
  "BEAUTY & PERSONAL CARE": "💄", "EDUCATION & TUTORING": "📚",
  "ENTERTAINMENT": "🎵", "FITNESS & RECREATIONAL": "💪",
  "FOOD & BEVERAGE": "🍕", "HEALTH & WELLNESS": "🌿",
  "HOME SERVICES": "🏠", "TECHNOLOGY SERVICES": "💻", "OTHER": "🏪",
};

function PunchCardVisual({ card }: { card: UserPunchCard }) {
  const { business, template, stamps_collected } = card;
  const total = template.total_stamps;
  const cardBg = template.card_color ?? "#1A1A1A";
  const stampFill = template.stamp_color ?? "#C8A090";
  const stampIcon = template.stamp_icon ?? (CAT_EMOJI[business.category] ?? "◉");
  const isLight = ["#ffffff", "#EAB308", "#F97316", "#fff"].includes(cardBg.toLowerCase());
  const ct = isLight ? "#1A1A1A" : TEXT;
  const isLightStamp = ["#ffffff", "#EAB308", "#F97316"].includes(stampFill);

  return (
    <div style={{ background: cardBg, borderRadius: 20, padding: "18px 16px 14px", margin: "0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 8, fontFamily: MONO, color: ct, opacity: 0.55, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>YOUR CARD</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: MONO, color: ct, letterSpacing: "-0.3px" }}>{business.name}</div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${stampFill}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {stampIcon}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
        {Array.from({ length: Math.min(total, 9) }).map((_, i) => {
          const filled = i < stamps_collected;
          const isLast = i === Math.min(total, 9) - 1;
          return (
            <div key={i} style={{ aspectRatio: "1", borderRadius: "50%", background: filled ? stampFill : "transparent", border: `2px solid ${filled ? stampFill : `${ct}30`}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: filled ? 22 : (isLast ? 14 : 9), fontFamily: MONO, color: filled ? (isLightStamp ? "#1A1A1A" : TEXT) : (isLast ? `${ct}25` : `${ct}55`), fontWeight: 700 }}>
              {filled ? stampIcon : (isLast ? stampIcon : (i + 1).toString().padStart(2, "0"))}
            </div>
          );
        })}
      </div>
      <div style={{ height: 1, background: `${ct}20`, marginBottom: 10 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, fontFamily: MONO, color: ct, opacity: 0.8, flex: 1, marginRight: 8 }}>{template.reward_description}</div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: ct, background: `${ct}18`, padding: "4px 10px", borderRadius: 999, fontWeight: 700, whiteSpace: "nowrap" }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

function NearbySection({ businesses, currentId }: { businesses: Business[]; currentId: number }) {
  const navigate = useNavigate();
  const others = businesses.filter(b => b.id !== currentId).slice(0, 4);
  if (others.length === 0) return null;
  return (
    <div style={{ padding: "24px 20px 0" }}>
      <div style={{ fontSize: 11, fontFamily: MONO, fontWeight: 700, color: TEXT, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 14 }}>
        Also Nearby
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {others.map(biz => (
          <div key={biz.id} onClick={() => navigate(`/businesses/${biz.id}`)} style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
            <div style={{ height: 80, background: `linear-gradient(135deg, ${biz.logo_color ?? "#333"}AA, ${biz.logo_color ?? "#333"}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}>
              {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
            </div>
            <div style={{ padding: "8px 10px 10px", background: SURFACE }}>
              <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: TEXT, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biz.name}</div>
              <div style={{ fontSize: 8, fontFamily: MONO, color: TEXT2 }}>★ {biz.rating}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [userCard, setUserCard] = useState<UserPunchCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showPunched, setShowPunched] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([Businesses.get(Number(id)), Businesses.list(), UserCards.list(authHeaders())]).then(([biz, all, cards]) => {
      setBusiness(biz);
      setAllBusinesses(all);
      setUserCard(cards.find(c => c.business.id === biz.id) ?? null);
      setLoading(false);
    });
  }, [id]);

  async function join() {
    if (!business?.active_template) return;
    setJoining(true);
    try {
      const card = await UserCards.join(business.active_template.id, authHeaders());
      setUserCard(card);
    } finally { setJoining(false); }
  }

  if (loading) {
    return <UserLayout><div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh", color: TEXT2, fontFamily: MONO, fontSize: 12 }}>LOADING...</div></UserLayout>;
  }

  if (!business) {
    return <UserLayout><div style={{ padding: 20, textAlign: "center", fontFamily: MONO, color: TEXT2, fontSize: 12 }}>NOT FOUND</div></UserLayout>;
  }

  /* ── PUNCHED success screen ── */
  if (showPunched && userCard) {
    return (
      <UserLayout>
        <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "52px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <button onClick={() => setShowPunched(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: TEXT, fontFamily: MONO }}>✕</button>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: TEXT, letterSpacing: "0.05em" }}>{business.name}</div>
            </div>
            <div style={{ fontSize: 10, fontFamily: MONO, color: TEXT2, textAlign: "center", letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase" }}>
              {userCard.stamps_collected}/{userCard.template.total_stamps} punches complete
              {userCard.template.total_stamps - userCard.stamps_collected > 0
                ? ` · ${userCard.template.total_stamps - userCard.stamps_collected} to go!`
                : " · Reward ready!"}
            </div>
            <PunchCardVisual card={userCard} />
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: TEXT, fontFamily: MONO, letterSpacing: "-1px", marginBottom: 14 }}>PUNCHED!</div>
            <div style={{ fontSize: 11, color: TEXT2, fontFamily: MONO, letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.8 }}>
              THANKS FOR SHOPPING LOCALLY<br />&amp; SUSTAINABLY.
            </div>
            <button onClick={() => setShowPunched(false)} style={{ marginTop: 32, padding: "14px 32px", borderRadius: 999, border: "none", background: TEXT, color: BG, fontSize: 12, fontFamily: MONO, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer" }}>
              CONTINUE →
            </button>
          </div>
          <NearbySection businesses={allBusinesses} currentId={business.id} />
          <div style={{ height: 100 }} />
        </div>
      </UserLayout>
    );
  }

  const template = business.active_template;

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: BG }}>
        {/* Header */}
        <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: TEXT, fontFamily: MONO }}>←</button>
          <div style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, color: TEXT, letterSpacing: "0.02em", textTransform: "uppercase" }}>{business.name}</div>
        </div>

        {/* Business hero */}
        <div style={{ margin: "0 20px 20px", height: 160, borderRadius: 20, background: `linear-gradient(160deg, ${business.logo_color ?? "#333"}CC, ${business.logo_color ?? "#333"}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64 }}>
          {CAT_EMOJI[business.category ?? ""] ?? business.name[0]}
        </div>

        {/* Punchcard */}
        {template && userCard && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontFamily: MONO, color: TEXT2, textAlign: "center", letterSpacing: "0.1em", marginBottom: 12, textTransform: "uppercase" }}>
              {userCard.stamps_collected}/{template.total_stamps} punches
              {template.total_stamps - userCard.stamps_collected > 0
                ? ` · ${template.total_stamps - userCard.stamps_collected} to go!`
                : " · Reward ready!"}
            </div>
            <PunchCardVisual card={userCard} />
          </div>
        )}

        {template && !userCard && (
          <div style={{ margin: "0 20px 20px", background: SURFACE, borderRadius: 20, padding: "20px", textAlign: "center" }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>{CAT_EMOJI[business.category ?? ""] ?? "🏪"}</div>
            <div style={{ fontSize: 12, fontFamily: MONO, color: TEXT, fontWeight: 700, marginBottom: 4, textTransform: "uppercase" }}>{template.name}</div>
            <div style={{ fontSize: 10, fontFamily: MONO, color: TEXT2 }}>{template.total_stamps} stamps → {template.reward_description}</div>
          </div>
        )}

        {/* Business info */}
        <div style={{ margin: "0 20px 20px" }}>
          <div style={{ background: SURFACE, borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, color: TEXT, letterSpacing: "-0.3px" }}>{business.name}</div>
              <div style={{ fontSize: 11, fontFamily: MONO, color: TEXT2 }}>★ {business.rating}</div>
            </div>
            <div style={{ fontSize: 10, fontFamily: MONO, color: TEXT2, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {business.category}{business.address ? ` · ${business.address}` : ""}
            </div>
            {business.description && (
              <div style={{ fontSize: 12, color: TEXT2, lineHeight: 1.6 }}>{business.description}</div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: "0 20px 20px" }}>
          {!template ? (
            <div style={{ textAlign: "center", padding: "20px", fontFamily: MONO, fontSize: 11, color: TEXT2 }}>
              No loyalty program yet
            </div>
          ) : !userCard ? (
            <button onClick={join} disabled={joining} style={{ width: "100%", padding: "17px", borderRadius: 999, border: "none", background: joining ? SURFACE : TEXT, color: joining ? TEXT2 : BG, fontSize: 13, fontWeight: 700, fontFamily: MONO, letterSpacing: "0.1em", cursor: joining ? "not-allowed" : "pointer", textTransform: "uppercase" }}>
              {joining ? "..." : "Join Loyalty Program"}
            </button>
          ) : (
            <button onClick={() => navigate("/authenticate")} style={{ width: "100%", padding: "17px", borderRadius: 999, border: "none", background: TEXT, color: BG, fontSize: 13, fontWeight: 700, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase" }}>
              Authenticate Purchase →
            </button>
          )}
        </div>

        <NearbySection businesses={allBusinesses} currentId={business.id} />
        <div style={{ height: 100 }} />
      </div>
    </UserLayout>
  );
}
