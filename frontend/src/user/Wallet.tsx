import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCards, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const MONO = "'Space Mono', monospace";

const CAT_EMOJI: Record<string, string> = {
  classic: "◉", star: "★", heart: "♥", coffee: "✿",
};

function PunchDots({ collected, total, style }: { collected: number; total: number; style: string }) {
  const icon = CAT_EMOJI[style] ?? "◉";
  // Show up to 9 dots max in the row
  const display = Math.min(total, 9);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxWidth: 180 }}>
      {Array.from({ length: display }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: i < collected ? "none" : "1.5px solid #CACACA",
            background: i < collected ? "#0D0D0D" : "transparent",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            color: "#fff",
          }}
        >
          {i < collected ? icon : ""}
        </div>
      ))}
    </div>
  );
}

function WalletRow({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const { business, template, stamps_collected, is_completed } = card;
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 0",
        borderBottom: "1px solid #F0F0F0",
        cursor: "pointer",
        gap: 12,
      }}
    >
      {/* Left: logo + name */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 18,
            flexShrink: 0,
            fontFamily: MONO,
          }}
        >
          {business.name[0].toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#0D0D0D",
              fontFamily: MONO,
              letterSpacing: "-0.3px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: 110,
            }}
          >
            {business.name}
          </div>
          {is_completed && (
            <div
              style={{
                marginTop: 3,
                display: "inline-block",
                background: "#0D0D0D",
                color: "#fff",
                fontSize: 9,
                fontFamily: MONO,
                letterSpacing: "0.08em",
                padding: "2px 7px",
                borderRadius: 999,
              }}
            >
              EARNED
            </div>
          )}
        </div>
      </div>

      {/* Right: punch dots + count */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <PunchDots collected={stamps_collected} total={template.total_stamps} style={template.style} />
        <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: MONO, minWidth: 32, textAlign: "right" }}>
          {stamps_collected}/{template.total_stamps}
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
    UserCards.list(authHeaders()).then(data => {
      setCards(data);
      setLoading(false);
    });
  }, []);

  const active = cards.filter(c => !c.is_completed);
  const completed = cards.filter(c => c.is_completed);

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        {/* Header */}
        <div style={{ padding: "56px 24px 16px" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#0D0D0D", fontFamily: MONO, letterSpacing: "-0.5px" }}>
            WALLET
          </div>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: MONO, marginTop: 4, letterSpacing: "0.06em" }}>
            {cards.length} ACTIVE PUNCHCARD{cards.length !== 1 ? "S" : ""}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#9CA3AF", fontFamily: MONO, fontSize: 12 }}>
            LOADING...
          </div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", fontFamily: MONO }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>◉</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0D0D0D", marginBottom: 8, letterSpacing: "0.05em" }}>
              NO PUNCHCARDS YET
            </div>
            <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 24, letterSpacing: "0.04em" }}>
              VISIT A LOCAL BUSINESS TO GET STARTED
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ padding: "14px 28px", borderRadius: 999, border: "none", background: "#0D0D0D", color: "#fff", fontSize: 12, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer" }}
            >
              EXPLORE →
            </button>
          </div>
        ) : (
          <div style={{ padding: "0 24px 100px" }}>
            {/* Active */}
            {active.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.1em", marginBottom: 4, paddingTop: 8 }}>
                  ACTIVE
                </div>
                {active.map(card => (
                  <WalletRow
                    key={card.id}
                    card={card}
                    onClick={() => navigate(`/businesses/${card.business.id}`)}
                  />
                ))}
              </div>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.1em", marginBottom: 4 }}>
                  EARNED
                </div>
                {completed.map(card => (
                  <WalletRow
                    key={card.id}
                    card={card}
                    onClick={() => navigate(`/businesses/${card.business.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
