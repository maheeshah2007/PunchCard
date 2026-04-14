import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, UserCards, Business, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const MONO = "'Space Mono', monospace";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💇", Retail: "🛍️", Other: "🏪",
};

const CATEGORIES = ["All", "Coffee", "Food", "Books", "Fitness", "Beauty", "Retail"];

function BusinessCard({ biz, card, onClick }: { biz: Business; card?: UserPunchCard; onClick: () => void }) {
  const stamps = card?.stamps_collected ?? 0;
  const total = card?.template.total_stamps ?? 0;
  const hasCard = !!card;

  return (
    <div
      onClick={onClick}
      style={{
        background: "#fff",
        borderRadius: 18,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
        cursor: "pointer",
        border: "1px solid #F0F0F0",
      }}
    >
      {/* Color header */}
      <div
        style={{
          height: 72,
          background: `linear-gradient(135deg, ${biz.logo_color}22, ${biz.logo_color}44)`,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          gap: 12,
          borderBottom: "1px solid #F5F5F5",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "-0.3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {biz.name.toUpperCase()}
          </div>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.06em", marginTop: 2 }}>
            {biz.category?.toUpperCase()}{biz.address ? ` · ${biz.address}` : ""}
          </div>
        </div>
        <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF" }}>★ {biz.rating}</div>
      </div>

      {/* Stamp row or join prompt */}
      <div style={{ padding: "12px 16px" }}>
        {hasCard ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.08em" }}>
                {card!.is_completed ? "REWARD READY 🎁" : `${stamps}/${total} PUNCHES`}
              </div>
              <div style={{ fontSize: 9, fontFamily: MONO, color: card!.is_completed ? "#0D0D0D" : "#9CA3AF" }}>
                {card!.is_completed ? "COMPLETE" : `${total - stamps} TO GO`}
              </div>
            </div>
            {/* Punch dots */}
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    border: i < stamps ? "none" : "1.5px solid #DEDEDE",
                    background: i < stamps ? "#0D0D0D" : "transparent",
                  }}
                />
              ))}
            </div>
          </div>
        ) : biz.active_template ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.06em" }}>
              {biz.active_template.total_stamps} STAMPS → {biz.active_template.reward_description}
            </div>
            <div style={{ fontSize: 9, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.08em", fontWeight: 700, whiteSpace: "nowrap", marginLeft: 8 }}>
              JOIN →
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 10, fontFamily: MONO, color: "#CACACA", letterSpacing: "0.06em" }}>
            NO LOYALTY PROGRAM YET
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
      <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>

        {/* Header */}
        <div style={{ background: "#fff", padding: "52px 20px 20px", borderBottom: "1px solid #F0F0F0" }}>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.12em", marginBottom: 4 }}>
            NEIGHBORGOOD
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "-0.5px" }}>
            {user?.name?.split(" ")[0]?.toUpperCase() ?? "WELCOME"}
          </div>

          {/* Active cards summary */}
          {activeCards.length > 0 && (
            <div
              onClick={() => navigate("/wallet")}
              style={{
                marginTop: 14,
                background: "#0D0D0D",
                borderRadius: 12,
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 10, fontFamily: MONO, color: "#fff", letterSpacing: "0.08em" }}>
                {activeCards.length} ACTIVE PUNCHCARD{activeCards.length !== 1 ? "S" : ""}
              </div>
              <div style={{ fontSize: 10, fontFamily: MONO, color: "rgba(255,255,255,0.5)", letterSpacing: "0.08em" }}>
                VIEW WALLET →
              </div>
            </div>
          )}
        </div>

        {/* Category filter */}
        <div style={{ background: "#fff", borderBottom: "1px solid #F0F0F0", overflowX: "auto" }}>
          <div style={{ display: "flex", gap: 0, padding: "0 4px", width: "max-content" }}>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                style={{
                  padding: "12px 14px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 10,
                  fontFamily: MONO,
                  fontWeight: category === cat ? 700 : 400,
                  color: category === cat ? "#0D0D0D" : "#9CA3AF",
                  letterSpacing: "0.08em",
                  borderBottom: category === cat ? "2px solid #0D0D0D" : "2px solid transparent",
                  whiteSpace: "nowrap",
                }}
              >
                {cat !== "All" && CAT_EMOJI[cat] ? `${CAT_EMOJI[cat]} ` : ""}
                {cat.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Businesses */}
        <div style={{ padding: "16px 16px 100px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em" }}>
              LOADING...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", fontFamily: MONO }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>◉</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#0D0D0D", letterSpacing: "0.08em", marginBottom: 6 }}>
                NO BUSINESSES HERE
              </div>
              <div style={{ fontSize: 10, color: "#9CA3AF", letterSpacing: "0.04em" }}>
                CHECK BACK SOON
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filtered.map(biz => {
                const card = userCards.find(c => c.business.id === biz.id);
                return (
                  <BusinessCard
                    key={biz.id}
                    biz={biz}
                    card={card}
                    onClick={() => navigate(`/businesses/${biz.id}`)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
