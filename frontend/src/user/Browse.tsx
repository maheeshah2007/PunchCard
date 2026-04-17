import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Businesses, Business } from "../api";
import UserLayout from "./Layout";

const BG = "#0E0E0E";
const SURFACE = "#1A1A1A";
const TEXT = "#F9F9F9";
const TEXT2 = "#B7B7B7";
const TEXT3 = "#727272";
const MONO = "'DM Mono', 'Space Mono', monospace";

const CATEGORIES = [
  { label: "bakery",   emoji: "🥐", key: "FOOD & BEVERAGE" },
  { label: "boba",     emoji: "🧋", key: "FOOD & BEVERAGE" },
  { label: "food",     emoji: "🥟", key: "FOOD & BEVERAGE" },
  { label: "desserts", emoji: "🍧", key: "FOOD & BEVERAGE" },
  { label: "thrift",   emoji: "👖", key: "RETAIL" },
  { label: "beauty",   emoji: "💄", key: "BEAUTY & PERSONAL CARE" },
  { label: "grocery",  emoji: "🥬", key: "FOOD & BEVERAGE" },
  { label: "pets",     emoji: "🐾", key: "OTHER" },
];

const ALL_CAT_EMOJIS: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💇", Retail: "🛍️", Other: "🏪",
  "BEAUTY & PERSONAL CARE": "💄", "EDUCATION & TUTORING": "📚",
  "ENTERTAINMENT": "🎵", "FITNESS & RECREATIONAL": "💪",
  "FOOD & BEVERAGE": "🥐", "HEALTH & WELLNESS": "🌿",
  "HOME SERVICES": "🏠", "TECHNOLOGY SERVICES": "💻",
  "RETAIL": "👖", "OTHER": "🏪",
};

function BusinessCard({ biz, onClick }: { biz: Business; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ flex: "0 0 140px", borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ height: 100, background: `linear-gradient(160deg, ${biz.logo_color ?? "#333"}CC, ${biz.logo_color ?? "#333"}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
        {ALL_CAT_EMOJIS[biz.category ?? ""] ?? biz.name[0]}
      </div>
      <div style={{ padding: "8px 10px 10px", background: SURFACE }}>
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: TEXT, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {biz.name}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: TEXT2 }}>★ {biz.rating ?? "—"}</div>
      </div>
    </div>
  );
}

function GridBusinessCard({ biz, onClick }: { biz: Business; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ height: 100, background: `linear-gradient(160deg, ${biz.logo_color ?? "#333"}AA, ${biz.logo_color ?? "#333"}44)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, position: "relative" }}>
        {ALL_CAT_EMOJIS[biz.category ?? ""] ?? biz.name[0]}
        <div style={{ position: "absolute", top: 8, right: 8, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>♡</div>
      </div>
      <div style={{ padding: "8px 10px 10px", background: SURFACE }}>
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: TEXT, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {biz.name}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#5B8FFF", marginBottom: 2 }}>Verified Student</div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: TEXT2 }}>★ {biz.rating ?? "—"}</div>
      </div>
    </div>
  );
}

export default function Browse() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Businesses.list().then(setBusinesses).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = businesses.filter(b => {
    const matchSearch = !search || b.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = !activeCategory || b.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: BG, paddingTop: 56 }}>
        {/* Header + search */}
        <div style={{ padding: "20px 20px 16px" }}>
          <div style={{ fontSize: 44, fontFamily: MONO, fontWeight: 500, color: TEXT, letterSpacing: "-1px", lineHeight: 1.1, textTransform: "lowercase", marginBottom: 16 }}>
            browse
          </div>

          {/* Search bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#2A2A2A", borderRadius: 15, padding: "11px 14px", border: "1px solid rgba(255,255,255,0.08)" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={TEXT3} strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Punchcard..."
              style={{ border: "none", background: "transparent", outline: "none", fontFamily: MONO, fontSize: 12, color: TEXT, flex: 1 }}
            />
          </div>
        </div>

        {/* Category grid */}
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
            {CATEGORIES.map(cat => {
              const isActive = activeCategory === cat.key && cat.label === activeCategory;
              return (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(activeCategory === cat.key ? null : cat.key)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                    padding: "12px 4px",
                    borderRadius: 14,
                    border: "none",
                    background: SURFACE,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 24 }}>{cat.emoji}</div>
                  <div style={{ fontSize: 9, fontFamily: MONO, color: TEXT2, textTransform: "lowercase", letterSpacing: "0.02em" }}>
                    {cat.label}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40, fontFamily: MONO, fontSize: 11, color: TEXT2 }}>LOADING...</div>
        ) : (
          <>
            {/* Top Picks Near You */}
            {filtered.length > 0 && (
              <div style={{ paddingBottom: 24 }}>
                <div style={{ padding: "0 20px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: TEXT, letterSpacing: "0.02em", textTransform: "uppercase" }}>
                    Top Picks Near You
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, paddingLeft: 20, paddingRight: 20, overflowX: "auto", scrollbarWidth: "none" }}>
                  {filtered.slice(0, 6).map(biz => (
                    <BusinessCard key={biz.id} biz={biz} onClick={() => navigate(`/businesses/${biz.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* Student-run grid */}
            {filtered.length > 0 && (
              <div style={{ padding: "0 20px 100px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: TEXT, letterSpacing: "0.02em", textTransform: "uppercase", marginBottom: 12 }}>
                  Student-Run
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {filtered.map(biz => (
                    <GridBusinessCard key={biz.id} biz={biz} onClick={() => navigate(`/businesses/${biz.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 20px", fontFamily: MONO }}>
                <div style={{ fontSize: 13, color: TEXT2 }}>No businesses found.</div>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}
