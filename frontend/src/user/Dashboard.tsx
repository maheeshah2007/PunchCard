import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, UserCards, Business, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💇", Retail: "🛍️", Other: "🏪",
};

const CATEGORIES = ["All", "Coffee", "Food", "Books", "Fitness", "Beauty", "Retail"];

export default function UserDashboard() {
  const navigate = useNavigate();
  const { user, authHeaders } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [userCards, setUserCards] = useState<UserPunchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");

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

  const filtered = category === "All" ? businesses : businesses.filter(b => b.category === category);
  const activeCards = userCards.filter(c => !c.is_completed);

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(160deg, #252178 0%, #3F3CA8 100%)", paddingTop: 52, paddingBottom: 28, paddingLeft: 20, paddingRight: 20 }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4, fontWeight: 500 }}>Good day,</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>
            {user?.name?.split(" ")[0] ?? "Friend"} 👋
          </div>

          {/* Active cards pill */}
          {activeCards.length > 0 && (
            <div
              onClick={() => navigate("/wallet")}
              style={{ marginTop: 16, background: "rgba(255,255,255,0.12)", borderRadius: 14, padding: "12px 16px", display: "flex", alignItems: "center", cursor: "pointer", backdropFilter: "blur(4px)" }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                  {activeCards.length} active punchcard{activeCards.length !== 1 ? "s" : ""}
                </div>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 1 }}>Tap to view your wallet</div>
              </div>
              <div style={{ color: "rgba(255,255,255,0.8)", fontSize: 22 }}>→</div>
            </div>
          )}
        </div>

        {/* Category filter */}
        <div style={{ padding: "16px 0 8px", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 8, paddingLeft: 20, paddingRight: 20, width: "max-content" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "8px 16px", borderRadius: 999, border: "none", cursor: "pointer",
                  fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                  background: category === cat ? "#3F3CA8" : "#fff",
                  color: category === cat ? "#fff" : "#6B7280",
                  boxShadow: category === cat ? "0 2px 8px rgba(63,60,168,0.3)" : "0 1px 4px rgba(0,0,0,0.06)",
                }}
              >
                {cat !== "All" && CAT_EMOJI[cat] ? `${CAT_EMOJI[cat]} ` : ""}{cat}
              </button>
            ))}
          </div>
        </div>

        {/* Businesses list */}
        <div style={{ padding: "12px 20px 100px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginBottom: 14 }}>
            {category === "All" ? "All Businesses" : `${CAT_EMOJI[category] ?? ""} ${category}`}
            <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3AF", marginLeft: 8 }}>{filtered.length}</span>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🔍</div>
              <div style={{ fontWeight: 600 }}>No businesses in this category</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {filtered.map(biz => {
                const card = userCards.find(c => c.business.id === biz.id);
                const pct = card ? (card.stamps_collected / card.template.total_stamps) * 100 : 0;

                return (
                  <div
                    key={biz.id}
                    onClick={() => navigate(`/businesses/${biz.id}`)}
                    style={{ background: "#fff", borderRadius: 18, overflow: "hidden", boxShadow: "0 2px 16px rgba(0,0,0,0.07)", cursor: "pointer" }}
                  >
                    {/* Color bar */}
                    <div style={{ height: 8, background: `linear-gradient(90deg, ${biz.logo_color}, ${biz.logo_color}88)` }} />

                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        {/* Logo */}
                        <div style={{ width: 48, height: 48, borderRadius: 14, background: `${biz.logo_color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                          {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biz.name}</div>
                            <div style={{ fontSize: 13, color: "#F59E0B", fontWeight: 600, flexShrink: 0, marginLeft: 8 }}>★ {biz.rating}</div>
                          </div>
                          <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                            {biz.category}{biz.address ? ` · ${biz.address}` : ""}
                          </div>

                          {card && (
                            <div style={{ marginTop: 10 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginBottom: 4 }}>
                                <span style={{ fontWeight: 600, color: biz.logo_color }}>
                                  {card.stamps_collected}/{card.template.total_stamps} stamps
                                </span>
                                {card.is_completed && <span style={{ color: "#059669", fontWeight: 700 }}>✓ Complete!</span>}
                              </div>
                              <div style={{ height: 5, background: "#F0F0F0", borderRadius: 999, overflow: "hidden" }}>
                                <div style={{ height: "100%", background: biz.logo_color, width: `${pct}%`, borderRadius: 999, transition: "width 0.3s" }} />
                              </div>
                            </div>
                          )}

                          {!card && biz.active_template && (
                            <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6B48FF", fontWeight: 600 }}>
                              <span>Join loyalty program</span>
                              <span>→</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
