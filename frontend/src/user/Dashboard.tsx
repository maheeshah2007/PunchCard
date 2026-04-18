import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, UserCards, Business, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const DM = "'DM Mono', monospace";
const SYNE = "'Syne Mono', monospace";
const BITCOUNT = "'Bitcount Grid Single', 'DM Mono', monospace";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💇", Retail: "🛍️", Other: "🏪",
  "BEAUTY & PERSONAL CARE": "💇", "EDUCATION & TUTORING": "📚",
  "ENTERTAINMENT": "🎵", "FITNESS & RECREATIONAL": "💪",
  "FOOD & BEVERAGE": "🍕", "HEALTH & WELLNESS": "🌿",
  "HOME SERVICES": "🏠", "TECHNOLOGY SERVICES": "💻",
  "OTHER": "🏪",
};

// Perforated edge between dark header and white body
function PerforatedEdge() {
  const circles = 20;
  const r = 10;
  const w = 393;
  const spacing = w / circles;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${r}`} style={{ display: "block", marginBottom: -1 }}>
      <rect width={w} height={r} fill="#F9F9F9" />
      {Array.from({ length: circles }).map((_, i) => (
        <circle key={i} cx={spacing * i + spacing / 2} cy={0} r={r} fill="#0E0E0E" />
      ))}
    </svg>
  );
}

function PunchCard({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const { business, template, stamps_collected } = card;
  const total = template.total_stamps;
  const cardBg = template.card_color ?? "#50555F";
  const accentColor = template.stamp_color ?? "#E0E0E0";
  const stampIcon = template.stamp_icon ?? (CAT_EMOJI[business.category] ?? "★");

  // 5 columns × rows grid
  const cols = 5;
  const rows = Math.ceil(total / cols);
  const cells = cols * rows;

  return (
    <div
      onClick={onClick}
      style={{
        background: cardBg,
        borderRadius: 5,
        padding: "16px 14px",
        cursor: "pointer",
        boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
        border: "1px solid rgba(128,128,128,0.2)",
      }}
    >
      {/* Business name + label pill */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 }}>
        <div style={{ fontFamily: SYNE, fontSize: 32, fontWeight: 400, color: accentColor, lineHeight: 1, letterSpacing: "0.02em" }}>
          {business.name}
        </div>
        <div style={{ border: `0.8px solid ${accentColor}`, borderRadius: 20, padding: "2px 8px", fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: accentColor, textTransform: "uppercase", whiteSpace: "nowrap", marginTop: 4 }}>
          {business.name}
        </div>
      </div>

      {/* Stamp grid */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 42px)`, gap: "11px", marginBottom: 12 }}>
        {Array.from({ length: cells }).map((_, i) => {
          const isLast = i === total - 1;
          const isFilled = i < stamps_collected;
          const isWithinTotal = i < total;

          if (!isWithinTotal) return null;

          return (
            <div
              key={i}
              style={{
                width: 42,
                height: 42,
                borderRadius: "50%",
                border: `2px solid ${isFilled ? accentColor : accentColor + "60"}`,
                background: isFilled ? accentColor + "22" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: SYNE,
                fontSize: 14,
                color: isFilled ? accentColor : accentColor + "80",
                textTransform: "uppercase",
              }}
            >
              {isLast ? stampIcon : (i + 1).toString().padStart(2, "0")}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${accentColor}20`, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: DM, fontSize: 9, color: accentColor, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {template.reward_description}
        </span>
        <span style={{ fontFamily: SYNE, fontSize: 12, color: accentColor }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

function RewardRow({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const { business, stamps_collected, template } = card;
  const accentColor = template.stamp_color ?? "#E0E0E0";
  const cardBg = template.card_color ?? "#50555F";
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 14px", background: cardBg, borderRadius: 999,
        cursor: "pointer", border: "1px solid rgba(128,128,128,0.2)",
      }}
    >
      <span style={{ fontFamily: DM, fontSize: 9, fontWeight: 700, color: accentColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {business.name}
      </span>
      <span style={{ fontFamily: SYNE, fontSize: 10, color: accentColor }}>
        {stamps_collected.toString().padStart(2, "0")}/{template.total_stamps.toString().padStart(2, "0")}
      </span>
    </div>
  );
}

function StoryCircle({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const color = card.business.logo_color ?? "#444";
  return (
    <div onClick={onClick} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}>
      <div style={{
        width: 66, height: 66, borderRadius: "50%",
        border: "2px solid #F9F9F9",
        background: `linear-gradient(135deg, ${color}44, ${color}22)`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, overflow: "hidden",
      }}>
        {CAT_EMOJI[card.business.category] ?? card.business.name[0]}
      </div>
      <span style={{ fontFamily: DM, fontSize: 8, color: "#F9F9F9", textAlign: "center", maxWidth: 66, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", letterSpacing: "0.04em" }}>
        {card.business.name.toLowerCase().slice(0, 10)}
      </span>
    </div>
  );
}

function BusinessTile({ biz, onClick }: { biz: Business; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ flex: "0 0 130px", borderRadius: 12, overflow: "hidden", cursor: "pointer", background: "#1a1a1a", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div style={{ height: 80, background: `linear-gradient(160deg, ${biz.logo_color}99, ${biz.logo_color}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34 }}>
        {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
      </div>
      <div style={{ padding: "7px 10px 9px" }}>
        <div style={{ fontFamily: DM, fontSize: 9, fontWeight: 700, color: "#F9F9F9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{biz.name}</div>
        <div style={{ fontFamily: DM, fontSize: 8, color: "#6B7280" }}>★ {biz.rating}</div>
      </div>
    </div>
  );
}

const ALL_CATEGORIES = [
  "FOOD & BEVERAGE", "FITNESS & RECREATIONAL", "BEAUTY & PERSONAL CARE",
  "ENTERTAINMENT", "HEALTH & WELLNESS", "EDUCATION & TUTORING",
  "HOME SERVICES", "RETAIL", "TECHNOLOGY SERVICES", "OTHER",
  "Coffee", "Food", "Books", "Fitness", "Beauty", "Retail",
];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userCards, setUserCards] = useState<UserPunchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([Businesses.list(), UserCards.list(authHeaders())]).then(([biz, cards]) => {
      setBusinesses(biz);
      setUserCards(cards);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "Friend";
  const myCards = userCards.filter(c => !c.is_completed);
  const firstCard = myCards[0] ?? null;
  const restCards = myCards.slice(1, 3);

  const presentCategories = ALL_CATEGORIES.filter(cat => businesses.some(b => b.category === cat));
  const filtered = businesses.filter(b => {
    const matchesSearch = !search || b.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !activeCategory || b.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#0E0E0E" }}>

        {/* ── Dark header ── */}
        <div style={{ padding: "52px 20px 24px" }}>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", background: "rgba(249,249,249,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>📍</div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#F9F9F9" }}>Carnegie Mellon</span>
            <span style={{ fontSize: 8, color: "#F9F9F9", opacity: 0.4 }}>▾</span>
          </div>

          {/* Greeting */}
          <div style={{ fontFamily: BITCOUNT, fontWeight: 500, fontSize: 40, color: "#F9F9F9", textTransform: "uppercase", lineHeight: 1.1, marginBottom: 4 }}>
            Hi {firstName}!
          </div>
          <div style={{ fontFamily: DM, fontSize: 11, color: "#F9F9F9", textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.75, marginBottom: 20 }}>
            Thanks for shopping locally &amp; sustainably.
          </div>

          {/* Search bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, border: "1px solid rgba(255,255,255,0.5)", borderRadius: 15, padding: "11px 14px", marginBottom: 22 }}>
            <svg width="10" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Punchcard..."
              style={{ border: "none", background: "transparent", outline: "none", fontFamily: DM, fontSize: 12, fontWeight: 500, color: "#F9F9F9", flex: 1 }}
            />
          </div>

          {/* Story circles */}
          {myCards.length > 0 && (
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              {myCards.map(card => (
                <StoryCircle key={card.id} card={card} onClick={() => navigate(`/businesses/${card.business.id}`)} />
              ))}
            </div>
          )}
        </div>

        {/* ── Perforated edge ── */}
        <PerforatedEdge />

        {/* ── White body ── */}
        <div style={{ background: "#F9F9F9", padding: "20px 20px 100px" }}>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, fontFamily: DM, fontSize: 11, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.06em" }}>Loading...</div>
          ) : (
            <>
              {/* Your Rewards */}
              {firstCard ? (
                <div style={{ marginBottom: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
                    <span style={{ fontFamily: DM, fontSize: 14, fontWeight: 500, color: "#0E0E0E", textTransform: "uppercase", letterSpacing: "0.05em" }}>Your Rewards</span>
                    <button onClick={() => navigate("/wallet")} style={{ background: "none", border: "none", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#727272", cursor: "pointer", padding: 0 }}>
                      View all
                    </button>
                  </div>
                  <PunchCard card={firstCard} onClick={() => navigate(`/businesses/${firstCard.business.id}`)} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                    {restCards.map(card => (
                      <RewardRow key={card.id} card={card} onClick={() => navigate(`/businesses/${card.business.id}`)} />
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center", padding: "32px 0 40px", fontFamily: DM, color: "#9CA3AF" }}>
                  <div style={{ fontSize: 32, marginBottom: 10 }}>🃏</div>
                  <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em" }}>No rewards yet — join a business!</div>
                </div>
              )}

              {/* Category filter */}
              {presentCategories.length > 0 && (
                <div style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 14, scrollbarWidth: "none" }}>
                  <button
                    onClick={() => setActiveCategory(null)}
                    style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 999, border: `1.5px solid ${activeCategory === null ? "#0E0E0E" : "#D1D5DB"}`, background: activeCategory === null ? "#0E0E0E" : "transparent", color: activeCategory === null ? "#F9F9F9" : "#6B7280", fontFamily: DM, fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    ALL
                  </button>
                  {presentCategories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                      style={{ flexShrink: 0, padding: "5px 14px", borderRadius: 999, border: `1.5px solid ${activeCategory === cat ? "#0E0E0E" : "#D1D5DB"}`, background: activeCategory === cat ? "#0E0E0E" : "transparent", color: activeCategory === cat ? "#F9F9F9" : "#6B7280", fontFamily: DM, fontSize: 8, fontWeight: 700, letterSpacing: "0.06em", cursor: "pointer", whiteSpace: "nowrap" }}
                    >
                      {CAT_EMOJI[cat] ?? ""} {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Near You */}
              {filtered.length > 0 && (
                <>
                  <div style={{ fontFamily: DM, fontSize: 11, fontWeight: 700, color: "#0E0E0E", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>
                    Near You
                  </div>
                  <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
                    {filtered.map(biz => (
                      <BusinessTile key={biz.id} biz={biz} onClick={() => navigate(`/businesses/${biz.id}`)} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
