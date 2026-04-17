import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, UserCards, Business, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const BG = "#0E0E0E";
const SURFACE = "#1A1A1A";
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

function PunchCard({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const { business, template, stamps_collected } = card;
  const total = template.total_stamps;
  const cardBg = template.card_color ?? "#1A1A1A";
  const stampFill = template.stamp_color ?? "#C8A090";
  const stampIcon = template.stamp_icon ?? (CAT_EMOJI[business.category] ?? "◉");
  const isRowLayout = template.style === "row";
  const gridCount = isRowLayout ? Math.min(total, 10) : Math.min(total, 9);
  const isLightCard = ["#ffffff", "#EAB308", "#F97316", "#fff"].includes(cardBg.toLowerCase());
  const cardText = isLightCard ? "#1A1A1A" : TEXT;
  const isLightStamp = ["#ffffff", "#EAB308", "#F97316"].includes(stampFill);

  return (
    <div onClick={onClick} style={{ background: cardBg, borderRadius: 18, padding: "16px 14px 12px", cursor: "pointer" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 8, fontFamily: MONO, color: cardText, opacity: 0.6, marginBottom: 2, letterSpacing: "0.08em", textTransform: "uppercase" }}>
            YOUR CARD
          </div>
          <div style={{ fontSize: 15, fontWeight: 700, color: cardText, letterSpacing: "-0.3px", fontFamily: MONO }}>
            {business.name}
          </div>
        </div>
        <div style={{ width: 34, height: 34, borderRadius: "50%", border: `2px solid ${stampFill}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
          {stampIcon}
        </div>
      </div>

      {isRowLayout ? (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {Array.from({ length: gridCount }).map((_, i) => {
            const filled = i < stamps_collected;
            return (
              <div key={i} style={{ width: 30, height: 30, borderRadius: "50%", background: filled ? stampFill : "transparent", border: `2px solid ${filled ? stampFill : `${cardText}33`}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: filled ? 14 : 0, color: filled ? (isLightStamp ? "#1A1A1A" : TEXT) : "transparent" }}>
                {filled ? stampIcon : ""}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 7, marginBottom: 14 }}>
          {Array.from({ length: gridCount }).map((_, i) => {
            const filled = i < stamps_collected;
            const isLast = i === gridCount - 1;
            return (
              <div key={i} style={{ aspectRatio: "1", borderRadius: "50%", background: filled ? stampFill : "transparent", border: `2px solid ${filled ? stampFill : `${cardText}33`}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: filled ? 22 : (isLast ? 16 : 9), fontFamily: MONO, color: filled ? (isLightStamp ? "#1A1A1A" : TEXT) : (isLast ? `${cardText}25` : `${cardText}60`), fontWeight: 700 }}>
                {filled ? stampIcon : (isLast ? stampIcon : (i + 1).toString().padStart(2, "0"))}
              </div>
            );
          })}
        </div>
      )}

      <div style={{ height: 1, background: `${cardText}20`, marginBottom: 10 }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 10, fontFamily: MONO, color: cardText, opacity: 0.85, flex: 1, marginRight: 8 }}>
          {template.reward_description}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: cardText, background: `${cardText}18`, padding: "4px 10px", borderRadius: 999, fontWeight: 700, whiteSpace: "nowrap" }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

function RewardRow({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const { business, stamps_collected, template } = card;
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: SURFACE, borderRadius: 999, marginTop: 8, cursor: "pointer" }}>
      <div style={{ fontSize: 9, fontFamily: MONO, fontWeight: 700, color: TEXT, background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 999 }}>
        {business.name.toUpperCase()}
      </div>
      <div style={{ fontSize: 9, fontFamily: MONO, color: TEXT, background: "rgba(255,255,255,0.1)", padding: "4px 12px", borderRadius: 999, fontWeight: 700 }}>
        {stamps_collected.toString().padStart(2, "0")}/{template.total_stamps.toString().padStart(2, "0")}
      </div>
    </div>
  );
}

function StoryCircle({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}>
      <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid rgba(249,249,249,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, background: `linear-gradient(135deg, ${card.business.logo_color ?? "#333"}33, ${card.business.logo_color ?? "#333"}66)` }}>
        {CAT_EMOJI[card.business.category] ?? card.business.name[0]}
      </div>
      <div style={{ fontSize: 7, fontFamily: MONO, color: TEXT2, textAlign: "center", maxWidth: 58, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {card.business.name.toLowerCase().slice(0, 9)}
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

  useEffect(() => {
    Promise.all([Businesses.list(), UserCards.list(authHeaders())])
      .then(([biz, cards]) => { setBusinesses(biz); setUserCards(cards); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0] ?? "Friend";
  const myCards = userCards.filter(c => !c.is_completed);
  const firstCard = myCards[0] ?? null;
  const restCards = myCards.slice(1, 3);

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: BG, paddingTop: 56 }}>

        {/* Greeting */}
        <div style={{ padding: "20px 20px 16px 20px" }}>
          <div style={{ fontSize: 42, fontFamily: MONO, fontWeight: 500, color: TEXT, lineHeight: 1.1, textTransform: "uppercase", letterSpacing: "-1px", marginBottom: 6 }}>
            Hi, {firstName}!
          </div>
          <div style={{ fontSize: 12, fontFamily: MONO, color: TEXT2, letterSpacing: "0.04em", textTransform: "uppercase" }}>
            Thanks for shopping locally &amp; sustainably.
          </div>
        </div>

        {/* Story circles (businesses with cards) */}
        {myCards.length > 0 && (
          <div style={{ paddingLeft: 20, paddingRight: 20, paddingBottom: 16 }}>
            <div style={{ display: "flex", gap: 14, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "none" }}>
              {myCards.map(card => (
                <StoryCircle key={card.id} card={card} onClick={() => navigate(`/businesses/${card.business.id}`)} />
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 20 }} />

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, fontFamily: MONO, fontSize: 11, color: TEXT2 }}>LOADING...</div>
        ) : (
          <>
            {/* YOUR REWARDS */}
            {firstCard ? (
              <div style={{ padding: "0 20px 20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: TEXT, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Your Rewards
                  </div>
                  <div
                    onClick={() => navigate("/wallet")}
                    style={{ fontSize: 10, fontFamily: MONO, color: TEXT2, cursor: "pointer", letterSpacing: "0.04em" }}
                  >
                    View all →
                  </div>
                </div>
                <PunchCard card={firstCard} onClick={() => navigate(`/businesses/${firstCard.business.id}`)} />
                {restCards.map(card => (
                  <RewardRow key={card.id} card={card} onClick={() => navigate(`/businesses/${card.business.id}`)} />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px", fontFamily: MONO }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>◉</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEXT, marginBottom: 8, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  No punchcards yet
                </div>
                <div style={{ fontSize: 11, color: TEXT2, marginBottom: 20, letterSpacing: "0.04em" }}>
                  Visit a local business to get started
                </div>
                <button
                  onClick={() => navigate("/browse")}
                  style={{ padding: "14px 28px", borderRadius: 999, border: "none", background: TEXT, color: BG, fontSize: 11, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer", textTransform: "uppercase" }}
                >
                  Browse Businesses →
                </button>
              </div>
            )}

            {/* Nearby section hint */}
            {businesses.length > 0 && (
              <div style={{ padding: "0 20px 16px" }}>
                <div style={{ height: 1, background: "rgba(255,255,255,0.08)", marginBottom: 20 }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: TEXT, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    Nearby
                  </div>
                  <div onClick={() => navigate("/browse")} style={{ fontSize: 10, fontFamily: MONO, color: TEXT2, cursor: "pointer", letterSpacing: "0.04em" }}>
                    See all →
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, overflowX: "auto", scrollbarWidth: "none" }}>
                  {businesses.slice(0, 5).map(biz => (
                    <div
                      key={biz.id}
                      onClick={() => navigate(`/businesses/${biz.id}`)}
                      style={{ flexShrink: 0, width: 130, borderRadius: 14, overflow: "hidden", cursor: "pointer" }}
                    >
                      <div style={{ height: 90, background: `linear-gradient(160deg, ${biz.logo_color ?? "#333"}AA, ${biz.logo_color ?? "#333"}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>
                        {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
                      </div>
                      <div style={{ padding: "8px 10px 10px", background: SURFACE }}>
                        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: TEXT, marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {biz.name}
                        </div>
                        <div style={{ fontSize: 8, fontFamily: MONO, color: TEXT2 }}>★ {biz.rating}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}
