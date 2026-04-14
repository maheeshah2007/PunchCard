import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, UserCards, Business, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const MONO  = "'Space Mono', monospace";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💇", Retail: "🛍️", Other: "🏪",
};

const CATEGORIES = ["All", "Coffee", "Food", "Books", "Fitness", "Beauty", "Retail"];

/* ── Reward circle (story-style) ── */
function RewardCircle({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const { business, stamps_collected, template } = card;
  const pct = stamps_collected / template.total_stamps;
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer", flexShrink: 0 }}>
      <div style={{ position: "relative", width: 64, height: 64 }}>
        {/* Progress ring */}
        <svg width="64" height="64" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
          <circle cx="32" cy="32" r={r} fill="none" stroke="#F0F0F0" strokeWidth="3" />
          <circle cx="32" cy="32" r={r} fill="none" stroke="#0D0D0D" strokeWidth="3"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
        </svg>
        {/* Logo */}
        <div style={{
          position: "absolute", top: 4, left: 4, width: 56, height: 56,
          borderRadius: "50%", background: "#F5F5F5",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, border: "2px solid #fff",
        }}>
          {CAT_EMOJI[business.category] ?? business.name[0].toUpperCase()}
        </div>
      </div>
      <div style={{ fontSize: 8, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.04em", textAlign: "center", maxWidth: 60, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {business.name.toUpperCase().slice(0, 9)}
      </div>
    </div>
  );
}

/* ── Top Pick card ── */
function TopPickCard({ biz, card, onClick }: { biz: Business; card?: UserPunchCard; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ flexShrink: 0, width: 150, borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", cursor: "pointer", border: "1px solid #F0F0F0" }}>
      {/* Cover */}
      <div style={{ height: 88, background: `linear-gradient(135deg, ${biz.logo_color}33, ${biz.logo_color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
        {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
      </div>
      <div style={{ padding: "10px 10px 12px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "-0.2px", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {biz.name}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF" }}>★ {biz.rating}</div>
        {card && (
          <div style={{ marginTop: 6, display: "flex", gap: 2, flexWrap: "wrap" }}>
            {Array.from({ length: Math.min(card.template.total_stamps, 8) }).map((_, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: "50%", background: i < card.stamps_collected ? "#0D0D0D" : "#E5E7EB" }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Student-run grid card ── */
function StudentCard({ biz, card, onClick }: { biz: Business; card?: UserPunchCard; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ borderRadius: 16, overflow: "hidden", background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", border: "1px solid #F0F0F0" }}>
      <div style={{ height: 80, background: `linear-gradient(135deg, ${biz.logo_color}22, ${biz.logo_color}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
        {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
      </div>
      <div style={{ padding: "8px 10px 10px" }}>
        <div style={{ fontSize: 9, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {biz.name}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF" }}>★ {biz.rating} rating</div>
        {card && (
          <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF", marginTop: 3 }}>
            {card.stamps_collected}/{card.template.total_stamps} punches
          </div>
        )}
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userCards, setUserCards] = useState<UserPunchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([
      Businesses.list(),
      UserCards.list(authHeaders()),
    ]).then(([biz, cards]) => {
      setBusinesses(biz);
      setUserCards(cards);
      setLoading(false);
    });
  }, []);

  const myCards = userCards.filter(c => !c.is_completed);
  const filtered = businesses
    .filter(b => category === "All" || b.category === category)
    .filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  const firstName = user?.name?.split(" ")[0]?.toUpperCase() ?? "FRIEND";

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>

        {/* Search bar */}
        <div style={{ background: "#fff", paddingTop: 52, paddingBottom: 12, paddingLeft: 16, paddingRight: 16, borderBottom: "1px solid #F0F0F0" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "#F5F5F5", borderRadius: 12, padding: "10px 14px",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Punchcard..."
              style={{ border: "none", background: "transparent", outline: "none", fontFamily: MONO, fontSize: 11, color: "#0D0D0D", flex: 1 }}
            />
          </div>
        </div>

        {/* Header banner */}
        <div style={{ background: "#0D0D0D", padding: "20px 20px 16px" }}>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", marginBottom: 4 }}>
            THANKS FOR SHOPPING LOCALLY &amp; SUSTAINABLY.
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, fontFamily: MONO, color: "#fff", letterSpacing: "-0.3px" }}>
            HI {firstName}!
          </div>
        </div>

        {/* YOUR REWARDS */}
        {myCards.length > 0 && (
          <div style={{ background: "#fff", padding: "16px 0 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.1em" }}>YOUR REWARDS</div>
              <div
                onClick={() => navigate("/wallet")}
                style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", cursor: "pointer", letterSpacing: "0.06em" }}
              >
                SEE ALL →
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, paddingLeft: 16, paddingRight: 16, overflowX: "auto", paddingBottom: 4 }}>
              {myCards.map(card => (
                <RewardCircle
                  key={card.id}
                  card={card}
                  onClick={() => navigate(`/businesses/${card.business.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", overflowX: "auto", marginTop: myCards.length > 0 ? 8 : 0 }}>
          <div style={{ display: "flex", width: "max-content", padding: "0 4px" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "12px 14px", border: "none", background: "transparent", cursor: "pointer",
                  fontSize: 9, fontFamily: MONO, fontWeight: category === cat ? 700 : 400,
                  color: category === cat ? "#0D0D0D" : "#9CA3AF",
                  letterSpacing: "0.08em", whiteSpace: "nowrap",
                  borderBottom: category === cat ? "2px solid #0D0D0D" : "2px solid transparent",
                }}
              >
                {cat !== "All" && CAT_EMOJI[cat] ? `${CAT_EMOJI[cat]} ` : ""}
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, fontFamily: MONO, fontSize: 11, color: "#9CA3AF", letterSpacing: "0.08em" }}>
            LOADING...
          </div>
        ) : (
          <>
            {/* TOP PICKS NEAR YOU */}
            {filtered.length > 0 && (
              <div style={{ padding: "20px 0 0" }}>
                <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.1em", padding: "0 16px", marginBottom: 14 }}>
                  TOP PICKS NEAR YOU
                </div>
                <div style={{ display: "flex", gap: 12, paddingLeft: 16, paddingRight: 16, overflowX: "auto", paddingBottom: 4 }}>
                  {filtered.slice(0, 6).map(biz => (
                    <TopPickCard
                      key={biz.id}
                      biz={biz}
                      card={userCards.find(c => c.business.id === biz.id)}
                      onClick={() => navigate(`/businesses/${biz.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STUDENT-RUN */}
            {filtered.length > 0 && (
              <div style={{ padding: "24px 16px 100px" }}>
                <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.1em", marginBottom: 14 }}>
                  STUDENT-RUN
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {filtered.map(biz => (
                    <StudentCard
                      key={biz.id}
                      biz={biz}
                      card={userCards.find(c => c.business.id === biz.id)}
                      onClick={() => navigate(`/businesses/${biz.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: MONO }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>◉</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#0D0D0D", letterSpacing: "0.08em", marginBottom: 6 }}>NO BUSINESSES FOUND</div>
                <div style={{ fontSize: 9, color: "#9CA3AF", letterSpacing: "0.04em" }}>TRY A DIFFERENT SEARCH</div>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}
