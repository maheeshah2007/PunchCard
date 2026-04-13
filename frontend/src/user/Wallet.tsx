import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCards, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const STYLE_ICON: Record<string, string> = {
  classic: "⭕", star: "⭐", heart: "❤️", coffee: "☕",
};

function PunchCard({ card }: { card: UserPunchCard }) {
  const navigate = useNavigate();
  const { template, business, stamps_collected, is_completed } = card;
  const icon = STYLE_ICON[template.style] ?? "⭕";
  const pct = (stamps_collected / template.total_stamps) * 100;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #252178 0%, #3F3CA8 100%)",
        borderRadius: 22, padding: "22px 20px", marginBottom: 18, color: "#fff",
        position: "relative", overflow: "hidden",
        boxShadow: "0 8px 32px rgba(63,60,168,0.25)",
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: "absolute", right: -24, top: -24, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
      <div style={{ position: "absolute", right: 20, bottom: -30, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

      {/* Completed badge */}
      {is_completed && (
        <div style={{ position: "absolute", top: 16, right: 16, background: "#00C896", color: "#fff", borderRadius: 999, padding: "4px 12px", fontSize: 11, fontWeight: 800, letterSpacing: "0.5px" }}>
          REWARD READY ✓
        </div>
      )}

      {/* Business info */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 700 }}>
          {business.name[0]}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: "-0.3px" }}>{business.name}</div>
          <div style={{ fontSize: 12, opacity: 0.65 }}>{template.name}</div>
        </div>
      </div>

      {/* Stamps grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 18, background: "rgba(0,0,0,0.1)", borderRadius: 14, padding: "16px 12px" }}>
        {Array.from({ length: template.total_stamps }).map((_, i) => (
          <span
            key={i}
            style={{
              fontSize: 22,
              opacity: i < stamps_collected ? 1 : 0.2,
              filter: i < stamps_collected ? "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "grayscale(1)",
              transform: i < stamps_collected ? "scale(1)" : "scale(0.85)",
              transition: "all 0.2s",
            }}
          >
            {icon}
          </span>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
          <span>{stamps_collected} of {template.total_stamps} stamps</span>
          <span>{is_completed ? "Complete!" : `${template.total_stamps - stamps_collected} more to go`}</span>
        </div>
        <div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 999, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#fff", width: `${pct}%`, borderRadius: 999, transition: "width 0.5s ease" }} />
        </div>
      </div>

      {/* Reward */}
      <div style={{ fontSize: 12, opacity: 0.8 }}>🎁 {template.reward_description}</div>

      {!is_completed && (
        <button
          onClick={() => navigate("/authenticate")}
          style={{ marginTop: 16, width: "100%", padding: "11px", borderRadius: 12, border: "2px solid rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.1)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "-0.2px", backdropFilter: "blur(4px)" }}
        >
          Add Stamp →
        </button>
      )}
    </div>
  );
}

export default function UserWallet() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [cards, setCards] = useState<UserPunchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "completed">("active");

  useEffect(() => {
    UserCards.list(authHeaders()).then(data => {
      setCards(data);
      setLoading(false);
    });
  }, []);

  const active    = cards.filter(c => !c.is_completed);
  const completed = cards.filter(c => c.is_completed);
  const shown     = tab === "active" ? active : completed;

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(160deg, #252178 0%, #3F3CA8 100%)", paddingTop: 52, paddingBottom: 24, paddingLeft: 20, paddingRight: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>My Wallet</h1>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>
            {cards.length} loyalty card{cards.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", background: "#fff", borderBottom: "1px solid #F0F0F0", position: "sticky", top: 0, zIndex: 10 }}>
          {(["active", "completed"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: "14px 0", border: "none", background: "transparent", cursor: "pointer",
                fontSize: 14, fontWeight: 700,
                color: tab === t ? "#3F3CA8" : "#9CA3AF",
                borderBottom: `3px solid ${tab === t ? "#3F3CA8" : "transparent"}`,
              }}
            >
              {t === "active" ? `Active (${active.length})` : `Completed (${completed.length})`}
            </button>
          ))}
        </div>

        <div style={{ padding: "20px 20px 100px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF" }}>Loading...</div>
          ) : shown.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{tab === "active" ? "💳" : "🏆"}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>
                {tab === "active" ? "No active cards" : "No rewards earned yet"}
              </div>
              <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6, marginBottom: 24 }}>
                {tab === "active"
                  ? "Visit a local business and join their loyalty program to get started"
                  : "Keep collecting stamps to earn your first reward!"}
              </div>
              {tab === "active" && (
                <button
                  onClick={() => navigate("/dashboard")}
                  style={{ padding: "13px 28px", borderRadius: 12, border: "none", background: "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
                >
                  Explore Businesses →
                </button>
              )}
            </div>
          ) : (
            shown.map(card => <PunchCard key={card.id} card={card} />)
          )}
        </div>
      </div>
    </UserLayout>
  );
}
