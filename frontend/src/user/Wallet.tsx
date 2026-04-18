import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCards, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const IBM = "'IBM Plex Mono', monospace";
const SYNE = "'Syne Mono', monospace";
const BITCOUNT = "'Bitcount Grid Single', 'DM Mono', monospace";
const DM = "'DM Mono', monospace";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💇", Retail: "🛍️", Other: "🏪",
  "BEAUTY & PERSONAL CARE": "💇", "EDUCATION & TUTORING": "📚",
  "ENTERTAINMENT": "🎵", "FITNESS & RECREATIONAL": "💪",
  "FOOD & BEVERAGE": "🍕", "HEALTH & WELLNESS": "🌿",
  "HOME SERVICES": "🏠", "TECHNOLOGY SERVICES": "💻",
  "OTHER": "🏪",
};

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
  const { business, template, stamps_collected, is_completed } = card;
  const total = template.total_stamps;
  const cardBg = template.card_color ?? "#F0F0F0";
  const accentColor = template.stamp_color ?? "#000000";
  const stampIcon = template.stamp_icon ?? (CAT_EMOJI[business.category] ?? "★");
  const cols = 3;
  const rows = Math.ceil(total / cols);
  const isDark = isColorDark(cardBg);

  return (
    <div
      onClick={onClick}
      style={{
        background: cardBg,
        borderRadius: 5,
        cursor: "pointer",
        boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
        border: `1px solid ${isDark ? "rgba(128,128,128,0.2)" : "rgba(0,0,0,0.2)"}`,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        minHeight: 215,
      }}
    >
      {is_completed && (
        <div style={{
          position: "absolute", top: 8, right: 8, zIndex: 2,
          background: accentColor, color: cardBg,
          fontFamily: IBM, fontSize: 7, fontWeight: 700,
          textTransform: "uppercase", letterSpacing: "0.08em",
          padding: "3px 8px", borderRadius: 999,
        }}>
          Earned ✓
        </div>
      )}

      {/* Main content: left info + right stamp grid */}
      <div style={{ display: "flex", flex: 1, minHeight: 0 }}>

        {/* Left: business info */}
        <div style={{
          width: "45%",
          padding: "16px 12px 12px 16px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 8,
        }}>
          <div>
            <div style={{ fontSize: 22, lineHeight: 1, marginBottom: 8 }}>
              {CAT_EMOJI[business.category] ?? "🏪"}
            </div>
            <div style={{
              fontFamily: SYNE,
              fontSize: 24,
              fontWeight: 400,
              color: accentColor,
              lineHeight: "0.9em",
              letterSpacing: "-0.02em",
              wordBreak: "break-word",
            }}>
              {business.name}
            </div>
          </div>
          <div style={{
            fontFamily: "'Helvetica Neue', Arial, sans-serif",
            fontSize: 11,
            fontWeight: 500,
            color: accentColor,
            lineHeight: "1.25em",
            opacity: 0.85,
          }}>
            {template.reward_description}
          </div>
        </div>

        {/* Divider */}
        <div style={{
          width: 1,
          margin: "16px 0",
          background: `${accentColor}20`,
          flexShrink: 0,
        }} />

        {/* Right: stamp grid */}
        <div style={{
          flex: 1,
          padding: "16px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 42px)`,
            gap: "10px",
          }}>
            {Array.from({ length: rows * cols }).map((_, i) => {
              if (i >= total) return <div key={i} />;
              const isLast = i === total - 1;
              const isFilled = i < stamps_collected;
              return (
                <div key={i} style={{
                  width: 42,
                  height: 42,
                  borderRadius: "50%",
                  border: `2px solid ${accentColor}`,
                  background: isFilled ? `${accentColor}25` : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: SYNE,
                  fontSize: 12,
                  fontWeight: 700,
                  color: accentColor,
                  textTransform: "uppercase",
                  opacity: isFilled ? 1 : 0.35,
                  transition: "opacity 0.15s",
                }}>
                  {isLast ? stampIcon : (i + 1).toString().padStart(2, "0")}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom pill bar */}
      <div style={{
        borderTop: `1px solid ${accentColor}20`,
        padding: "6px 10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{
          border: `0.8px solid ${accentColor}`,
          borderRadius: 20,
          padding: "2px 9px",
          fontFamily: IBM,
          fontSize: 9,
          fontWeight: 500,
          color: accentColor,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          maxWidth: "55%",
        }}>
          {business.name}
        </div>
        <div style={{
          border: `0.8px solid ${accentColor}`,
          borderRadius: 20,
          padding: "2px 9px",
          fontFamily: IBM,
          fontSize: 9,
          fontWeight: 500,
          color: accentColor,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

function isColorDark(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 < 128;
}

export default function UserWallet() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [cards, setCards] = useState<UserPunchCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "earned">("active");

  useEffect(() => {
    UserCards.list(authHeaders()).then(setCards).catch(console.error).finally(() => setLoading(false));
  }, []);

  const active = cards.filter(c => !c.is_completed);
  const earned = cards.filter(c => c.is_completed);
  const displayed = tab === "active" ? active : earned;

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#0E0E0E", paddingBottom: 100 }}>

        {/* Dark header */}
        <div style={{ padding: "52px 20px 28px" }}>
          <div style={{ fontFamily: BITCOUNT, fontWeight: 500, fontSize: 40, color: "#F9F9F9", textTransform: "uppercase", lineHeight: 1.1, marginBottom: 4 }}>
            Wallet
          </div>
          <div style={{ fontFamily: DM, fontSize: 12, fontWeight: 500, color: "#F9F9F9", textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.6 }}>
            {active.length} active punchcard{active.length !== 1 ? "s" : ""}.
          </div>
        </div>

        {/* Perforated edge */}
        <PerforatedEdge />

        {/* White body */}
        <div style={{ background: "#F9F9F9", padding: "20px 20px 40px" }}>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1.5px solid #0E0E0E", borderRadius: 999, overflow: "hidden" }}>
            {(["active", "earned"] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  flex: 1, padding: "9px 0",
                  border: "none",
                  background: tab === t ? "#0E0E0E" : "transparent",
                  color: tab === t ? "#F9F9F9" : "#0E0E0E",
                  fontFamily: IBM, fontSize: 10, fontWeight: 500,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                {t} {t === "active" ? `(${active.length})` : `(${earned.length})`}
              </button>
            ))}
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 60, fontFamily: IBM, fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Loading...
            </div>
          ) : displayed.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 0" }}>
              <div style={{ fontSize: 36, marginBottom: 12 }}>🃏</div>
              <div style={{ fontFamily: IBM, fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
                {tab === "active" ? "No active cards yet" : "No earned rewards yet"}
              </div>
              {tab === "active" && (
                <button
                  onClick={() => navigate("/dashboard")}
                  style={{ padding: "12px 24px", borderRadius: 999, border: "none", background: "#0E0E0E", color: "#F9F9F9", fontFamily: IBM, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", cursor: "pointer" }}
                >
                  Explore →
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              {displayed.map(card => (
                <PunchCard
                  key={card.id}
                  card={card}
                  onClick={() => navigate(`/businesses/${card.business.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
