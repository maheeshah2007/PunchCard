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

/* Same punchcard visual as AuthenticatePurchase */
function PunchCard({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const { business, template, stamps_collected } = card;
  const total = template.total_stamps;
  return (
    <div onClick={onClick} style={{ background: "#fff", borderRadius: 16, padding: "14px 12px 10px", border: "1px solid #E0E0E0", boxShadow: "0 1px 8px rgba(0,0,0,0.06)", cursor: "pointer" }}>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ width: 88, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ width: 72, height: 72, borderRadius: 14, background: "#F5F0F0", border: "1px solid #E8E0E0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 6 }}>
            {CAT_EMOJI[business.category] ?? business.name[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 9, fontFamily: MONO, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.3, marginBottom: 4 }}>{business.name}</div>
          <div style={{ fontSize: 8, fontFamily: MONO, color: "#6B7280", lineHeight: 1.4, flex: 1 }}>{template.reward_description}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {Array.from({ length: total }).map((_, i) => {
              const filled = i < stamps_collected;
              return (
                <div key={i} style={{ aspectRatio: "1", borderRadius: "50%", background: filled ? "#C8A090" : "#F8F8F8", border: `1.5px solid ${filled ? "#C8A090" : "#DEDEDE"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: filled ? 13 : 9, fontFamily: MONO, color: filled ? "#fff" : "#ACACAC", fontWeight: 700 }}>
                  {filled ? "◉" : (i + 1).toString().padStart(2, "0")}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 6, borderTop: "1px solid #F0F0F0" }}>
        <div style={{ fontSize: 7, fontFamily: MONO, color: "#9CA3AF", background: "#F5F5F5", padding: "3px 8px", borderRadius: 999, border: "1px solid #E5E5E5" }}>
          {business.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 9, fontFamily: MONO, color: "#1A1A1A", fontWeight: 700 }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

/* Compact row for additional reward cards */
function RewardRow({ card, onClick }: { card: UserPunchCard; onClick: () => void }) {
  const { business, stamps_collected, template } = card;
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F5F5F5", cursor: "pointer" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: "#F0F0F0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
          {CAT_EMOJI[business.category] ?? business.name[0]}
        </div>
        <div style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, color: "#0D0D0D" }}>{business.name}</div>
      </div>
      <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF" }}>
        {stamps_collected.toString().padStart(2, "0")}/{template.total_stamps.toString().padStart(2, "0")}
      </div>
    </div>
  );
}

/* TOP PICKS card — photo style */
function TopPickCard({ biz, onClick }: { biz: Business; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ flex: 1, borderRadius: 14, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
      <div style={{ height: 110, background: `linear-gradient(160deg, ${biz.logo_color}AA, ${biz.logo_color}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44, position: "relative" }}>
        {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
      </div>
      <div style={{ padding: "8px 10px 10px", background: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biz.name}</div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF" }}>0.1 mi away</div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF" }}>★ {biz.rating} rating</div>
      </div>
    </div>
  );
}

/* STUDENT-RUN card with verified badge */
function StudentCard({ biz, onClick }: { biz: Business; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.08)", position: "relative" }}>
      <div style={{ height: 110, background: `linear-gradient(160deg, ${biz.logo_color}88, ${biz.logo_color}33)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>
        {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
      </div>
      {/* Heart icon */}
      <div style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: "50%", background: "rgba(255,255,255,0.85)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>♡</div>
      <div style={{ padding: "8px 10px 10px", background: "#fff" }}>
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biz.name}</div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#3F3CA8", marginBottom: 1 }}>Verified CMU Student</div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF" }}>★ {biz.rating} rating</div>
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
  const [search, setSearch] = useState("");

  useEffect(() => {
    Promise.all([Businesses.list(), UserCards.list(authHeaders())]).then(([biz, cards]) => {
      setBusinesses(biz);
      setUserCards(cards);
      setLoading(false);
    });
  }, []);

  const firstName = user?.name?.split(" ")[0]?.toUpperCase() ?? "FRIEND";
  const myCards = userCards.filter(c => !c.is_completed);
  const firstCard = myCards[0] ?? null;
  const restCards = myCards.slice(1, 3);
  const filtered = businesses.filter(b => !search || b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>

        {/* Search bar */}
        <div style={{ background: "#fff", paddingTop: 52, paddingBottom: 10, paddingLeft: 14, paddingRight: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F0F0F0", borderRadius: 10, padding: "9px 12px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search Punchcard..." style={{ border: "none", background: "transparent", outline: "none", fontFamily: MONO, fontSize: 11, color: "#0D0D0D", flex: 1 }} />
          </div>
        </div>

        {/* HI [NAME]! */}
        <div style={{ background: "#fff", padding: "14px 16px 16px", borderBottom: "1px solid #F0F0F0" }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: "#0D0D0D", letterSpacing: "-1px", marginBottom: 4, lineHeight: 1.1 }}>
            HI {firstName}!
          </div>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.06em", marginBottom: myCards.length > 0 ? 14 : 0 }}>
            MAKE THE SMARTER, LOCALLY &amp; SUSTAINABLY.
          </div>

          {/* Story circles */}
          {myCards.length > 0 && (
            <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 4 }}>
              {myCards.map(card => (
                <div key={card.id} onClick={() => navigate(`/businesses/${card.business.id}`)} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                  <div style={{ width: 54, height: 54, borderRadius: "50%", border: "2px solid #0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, background: `linear-gradient(135deg, ${card.business.logo_color}33, ${card.business.logo_color}66)`, overflow: "hidden" }}>
                    {CAT_EMOJI[card.business.category] ?? card.business.name[0]}
                  </div>
                  <div style={{ fontSize: 7, fontFamily: MONO, color: "#0D0D0D", textAlign: "center", maxWidth: 56, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {card.business.name.toLowerCase().slice(0, 9)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 60, fontFamily: MONO, fontSize: 11, color: "#9CA3AF" }}>LOADING...</div>
        ) : (
          <>
            {/* YOUR REWARDS */}
            {firstCard && (
              <div style={{ background: "#fff", padding: "14px 14px 8px", marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.06em" }}>YOUR REWARDS</div>
                  <div onClick={() => navigate("/wallet")} style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", cursor: "pointer" }}>View all ❱❱</div>
                </div>
                <PunchCard card={firstCard} onClick={() => navigate(`/businesses/${firstCard.business.id}`)} />
                {restCards.map(card => (
                  <RewardRow key={card.id} card={card} onClick={() => navigate(`/businesses/${card.business.id}`)} />
                ))}
              </div>
            )}

            {/* TOP PICKS NEAR YOU */}
            {filtered.length > 0 && (
              <div style={{ padding: "16px 14px 0" }}>
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.06em", marginBottom: 12 }}>TOP PICKS NEAR YOU</div>
                <div style={{ display: "flex", gap: 10 }}>
                  {filtered.slice(0, 2).map(biz => (
                    <TopPickCard key={biz.id} biz={biz} onClick={() => navigate(`/businesses/${biz.id}`)} />
                  ))}
                </div>
              </div>
            )}

            {/* STUDENT-RUN */}
            {filtered.length > 0 && (
              <div style={{ padding: "16px 14px 100px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.06em", marginBottom: 12 }}>STUDENT-RUN</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {filtered.map(biz => (
                    <StudentCard key={biz.id} biz={biz} onClick={() => navigate(`/businesses/${biz.id}`)} />
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
