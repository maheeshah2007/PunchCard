import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCards, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const BG = "#0E0E0E";
const TEXT = "#F9F9F9";
const TEXT2 = "#B7B7B7";
const MONO = "'DM Mono', 'Space Mono', monospace";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💇", Retail: "🛍️", Other: "🏪",
  "BEAUTY & PERSONAL CARE": "💇", "EDUCATION & TUTORING": "📚",
  "ENTERTAINMENT": "🎵", "FITNESS & RECREATIONAL": "💪",
  "FOOD & BEVERAGE": "🍕", "HEALTH & WELLNESS": "🌿",
  "HOME SERVICES": "🏠", "TECHNOLOGY SERVICES": "💻", "OTHER": "🏪",
};

function WalletCard({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const { business, template, stamps_collected, is_completed } = card;
  const total = template.total_stamps;
  const cardBg = template.card_color ?? "#1A1A1A";
  const stampFill = template.stamp_color ?? "#C8A090";
  const stampIcon = template.stamp_icon ?? (CAT_EMOJI[business.category] ?? "◉");
  const isLight = ["#ffffff", "#EAB308", "#F97316", "#fff"].includes(cardBg.toLowerCase());
  const ct = isLight ? "#1A1A1A" : TEXT;
  const isLightStamp = ["#ffffff", "#EAB308", "#F97316"].includes(stampFill);

  return (
    <div
      onClick={onClick}
      style={{ background: cardBg, borderRadius: 20, padding: "18px 16px 14px", cursor: "pointer", marginBottom: 14 }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 8, fontFamily: MONO, color: ct, opacity: 0.55, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 3 }}>
            {is_completed ? "EARNED" : "YOUR CARD"}
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: MONO, color: ct, letterSpacing: "-0.3px" }}>
            {business.name}
          </div>
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: `2px solid ${stampFill}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {stampIcon}
        </div>
      </div>

      {/* Stamp grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 14 }}>
        {Array.from({ length: Math.min(total, 9) }).map((_, i) => {
          const filled = i < stamps_collected;
          const isLast = i === Math.min(total, 9) - 1;
          return (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                borderRadius: "50%",
                background: filled ? stampFill : "transparent",
                border: `2px solid ${filled ? stampFill : `${ct}30`}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: filled ? 22 : (isLast ? 14 : 9),
                fontFamily: MONO,
                color: filled ? (isLightStamp ? "#1A1A1A" : TEXT) : (isLast ? `${ct}25` : `${ct}55`),
                fontWeight: 700,
              }}
            >
              {filled ? stampIcon : (isLast ? stampIcon : (i + 1).toString().padStart(2, "0"))}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ height: 1, background: `${ct}20`, marginBottom: 10 }} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, fontFamily: MONO, color: ct, opacity: 0.8, flex: 1, marginRight: 8 }}>
          {template.reward_description}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: ct, background: `${ct}18`, padding: "4px 10px", borderRadius: 999, fontWeight: 700, whiteSpace: "nowrap" }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

export default function UserWallet() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [cards, setCards] = useState<UserPunchCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    UserCards.list(authHeaders())
      .then(setCards)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active = cards.filter(c => !c.is_completed);
  const completed = cards.filter(c => c.is_completed);

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: BG, paddingTop: 56 }}>
        {/* Header */}
        <div style={{ padding: "20px 20px 24px" }}>
          <div style={{ fontSize: 44, fontFamily: MONO, fontWeight: 500, color: TEXT, letterSpacing: "-1px", lineHeight: 1.1, textTransform: "lowercase", marginBottom: 6 }}>
            wallet
          </div>
          <div style={{ fontSize: 13, fontFamily: MONO, color: TEXT2, letterSpacing: "0.02em" }}>
            {cards.length} active punchcard{cards.length !== 1 ? "s." : "."}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, fontFamily: MONO, fontSize: 11, color: TEXT2 }}>
            LOADING...
          </div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", fontFamily: MONO }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>◉</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              No punchcards yet
            </div>
            <div style={{ fontSize: 11, color: TEXT2, marginBottom: 24, letterSpacing: "0.04em" }}>
              Visit a local business to get started
            </div>
            <button
              onClick={() => navigate("/browse")}
              style={{ padding: "14px 28px", borderRadius: 999, border: "none", background: TEXT, color: BG, fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase" }}
            >
              Browse →
            </button>
          </div>
        ) : (
          <div style={{ padding: "0 20px 100px" }}>
            {active.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: TEXT2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14, paddingTop: 4 }}>
                  Active
                </div>
                {active.map(card => (
                  <WalletCard key={card.id} card={card} onClick={() => navigate(`/businesses/${card.business.id}`)} />
                ))}
              </div>
            )}

            {completed.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: TEXT2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                  Earned
                </div>
                {completed.map(card => (
                  <WalletCard key={card.id} card={card} onClick={() => navigate(`/businesses/${card.business.id}`)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
