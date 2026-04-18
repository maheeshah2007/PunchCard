import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Businesses, Business } from "../api";
import UserLayout from "./Layout";

const IBM = "'IBM Plex Mono', monospace";
const BITCOUNT = "'Bitcount Grid Single', 'DM Mono', monospace";
const INTER = "'Inter', sans-serif";
const DM = "'DM Mono', monospace";

// Figma category chips — 2 rows of 4
const CHIPS = [
  { emoji: "🍕", label: "Food",      cat: "FOOD & BEVERAGE" },
  { emoji: "💪", label: "Fitness",   cat: "FITNESS & RECREATIONAL" },
  { emoji: "💄", label: "Beauty",    cat: "BEAUTY & PERSONAL CARE" },
  { emoji: "🎵", label: "Fun",       cat: "ENTERTAINMENT" },
  { emoji: "🛍️", label: "Retail",   cat: "RETAIL" },
  { emoji: "🌿", label: "Wellness",  cat: "HEALTH & WELLNESS" },
  { emoji: "📚", label: "Education", cat: "EDUCATION & TUTORING" },
  { emoji: "🏪", label: "Other",     cat: "OTHER" },
];

const CAT_EMOJI: Record<string, string> = {
  "BEAUTY & PERSONAL CARE": "💄", "EDUCATION & TUTORING": "📚",
  "ENTERTAINMENT": "🎵", "FITNESS & RECREATIONAL": "💪",
  "FOOD & BEVERAGE": "🍕", "HEALTH & WELLNESS": "🌿",
  "HOME SERVICES": "🏠", "RETAIL": "🛍️", "TECHNOLOGY SERVICES": "💻",
  "OTHER": "🏪",
};

function BusinessCard({ biz, onClick }: { biz: Business; onClick: () => void }) {
  const emoji = CAT_EMOJI[biz.category ?? ""] ?? "🏪";
  return (
    <div
      onClick={onClick}
      style={{ flexShrink: 0, width: 179, cursor: "pointer" }}
    >
      {/* Image area */}
      <div style={{
        height: 114,
        borderRadius: 20,
        background: `linear-gradient(160deg, ${biz.logo_color}cc, ${biz.logo_color}55)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 44,
        marginBottom: 6,
        overflow: "hidden",
        position: "relative",
      }}>
        {biz.logo_image ? (
          <img src={biz.logo_image} alt={biz.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          <span>{emoji}</span>
        )}
      </div>

      {/* Business name */}
      <div style={{
        fontFamily: INTER,
        fontWeight: 500,
        fontSize: 12,
        color: "#0E0E0E",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        marginBottom: 2,
        lineHeight: "1.21em",
      }}>
        {biz.name}
      </div>

      {/* Category subtitle */}
      <div style={{
        fontFamily: INTER,
        fontWeight: 500,
        fontSize: 9,
        color: "rgba(0,0,0,0.5)",
        marginBottom: 2,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
        lineHeight: "1.21em",
      }}>
        {biz.category ?? "Local business"}
      </div>

      {/* Rating */}
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="#0E0E0E">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
        <span style={{ fontFamily: INTER, fontWeight: 400, fontSize: 8, color: "#0E0E0E", lineHeight: "1.21em" }}>
          {typeof biz.rating === "number" ? biz.rating.toFixed(1) : "5.0"} rating
        </span>
      </div>
    </div>
  );
}

function Section({ title, businesses, onBizClick }: { title: string; businesses: Business[]; onBizClick: (id: number) => void }) {
  if (businesses.length === 0) return null;
  return (
    <div style={{ padding: "0 0 0 16px" }}>
      {/* Section title */}
      <div style={{
        fontFamily: DM,
        fontWeight: 500,
        fontSize: 14,
        color: "#0E0E0E",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: 15,
        paddingRight: 16,
      }}>
        {title}
      </div>

      {/* Horizontal scroll row */}
      <div style={{
        display: "flex",
        gap: 23,
        overflowX: "auto",
        paddingRight: 16,
        paddingBottom: 4,
        scrollbarWidth: "none",
      }}>
        {businesses.map(biz => (
          <BusinessCard key={biz.id} biz={biz} onClick={() => onBizClick(biz.id)} />
        ))}
      </div>
    </div>
  );
}

export default function UserBrowse() {
  const navigate = useNavigate();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  useEffect(() => {
    Businesses.list().then(setBusinesses).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter(b => {
      const matchesSearch = !search || b.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !activeChip || b.category === activeChip;
      return matchesSearch && matchesCat;
    });
  }, [businesses, search, activeChip]);

  // Group for sections (only when no filter)
  const sections = useMemo(() => {
    if (search || activeChip) {
      return [{ title: activeChip ? (CHIPS.find(c => c.cat === activeChip)?.label ?? activeChip) : "Results", businesses: filtered }];
    }
    const groups: { title: string; businesses: Business[] }[] = [];
    if (businesses.length > 0) {
      groups.push({ title: "Top Picks Near You", businesses: businesses.slice(0, 8) });
    }
    const byCategory = CHIPS.reduce<Record<string, Business[]>>((acc, chip) => {
      const bizInCat = businesses.filter(b => b.category === chip.cat);
      if (bizInCat.length > 0) acc[chip.cat] = bizInCat;
      return acc;
    }, {});
    for (const chip of CHIPS) {
      if (byCategory[chip.cat]) {
        groups.push({ title: chip.label, businesses: byCategory[chip.cat] });
      }
    }
    return groups;
  }, [businesses, filtered, search, activeChip]);

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#0E0E0E", paddingBottom: 100 }}>
        {/* Thin dark status bar strip */}
        <div style={{ height: 52 }} />

        {/* White content area with rounded top */}
        <div style={{
          background: "#F9F9F9",
          borderRadius: "15px 15px 0 0",
          minHeight: "calc(100vh - 52px)",
          paddingBottom: 40,
        }}>
          {/* Header: title + search */}
          <div style={{ padding: "20px 16px 0" }}>
            <div style={{
              fontFamily: BITCOUNT,
              fontWeight: 500,
              fontSize: 40,
              color: "#0E0E0E",
              textTransform: "uppercase",
              lineHeight: 1.1,
              marginBottom: 12,
            }}>
              browse
            </div>

            {/* Search bar — #E2E2E2 bg, 15px radius, 11px 14px padding */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              background: "#E2E2E2",
              borderRadius: 15,
              padding: "11px 14px",
              marginBottom: 28,
            }}>
              <svg width="10" height="12" viewBox="0 0 24 24" fill="none" stroke="#0E0E0E" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search Punchcard..."
                style={{
                  border: "none",
                  background: "transparent",
                  outline: "none",
                  fontFamily: INTER,
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#0E0E0E",
                  flex: 1,
                }}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: "#727272", fontSize: 14, lineHeight: 1 }}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Category chips — 2 rows of 4, large emoji */}
          {!search && (
            <div style={{ padding: "0 16px", marginBottom: 36 }}>
              {[CHIPS.slice(0, 4), CHIPS.slice(4, 8)].map((row, ri) => (
                <div
                  key={ri}
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 0,
                    justifyContent: "space-between",
                    marginBottom: ri === 0 ? 11 : 0,
                  }}
                >
                  {row.map(chip => {
                    const isActive = activeChip === chip.cat;
                    return (
                      <button
                        key={chip.cat}
                        onClick={() => setActiveChip(isActive ? null : chip.cat)}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 5,
                          width: 60,
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          padding: 0,
                          opacity: activeChip && !isActive ? 0.4 : 1,
                          transition: "opacity 0.15s",
                        }}
                      >
                        <span style={{
                          fontFamily: INTER,
                          fontSize: 50,
                          lineHeight: "1.21em",
                          textAlign: "center",
                          filter: isActive ? "none" : undefined,
                        }}>
                          {chip.emoji}
                        </span>
                        <span style={{
                          fontFamily: INTER,
                          fontWeight: 500,
                          fontSize: 12,
                          color: "#0E0E0E",
                          textAlign: "center",
                          lineHeight: "1.21em",
                          textTransform: "capitalize",
                        }}>
                          {chip.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Sections */}
          {loading ? (
            <div style={{ padding: "40px 16px", textAlign: "center", fontFamily: IBM, fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Loading...
            </div>
          ) : sections.every(s => s.businesses.length === 0) ? (
            <div style={{ padding: "40px 16px", textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🔍</div>
              <div style={{ fontFamily: IBM, fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                No businesses found
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 35 }}>
              {sections.map(sec => (
                <Section
                  key={sec.title}
                  title={sec.title}
                  businesses={sec.businesses}
                  onBizClick={id => navigate(`/businesses/${id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
