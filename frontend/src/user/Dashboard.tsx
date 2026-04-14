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

/* Punchcard visual — same format as wireframe */
function PunchCard({ card }: { card: UserPunchCard }) {
  const { business, template, stamps_collected } = card;
  const total = template.total_stamps;
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: "14px", border: "1px solid #E8E8E8", width: 280, flexShrink: 0 }}>
      <div style={{ display: "flex", gap: 12 }}>
        {/* Left */}
        <div style={{ width: 70, flexShrink: 0, display: "flex", flexDirection: "column" }}>
          <div style={{ width: 60, height: 60, borderRadius: 12, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, marginBottom: 6 }}>
            {CAT_EMOJI[business.category] ?? business.name[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#0D0D0D", fontWeight: 700, letterSpacing: "-0.2px", lineHeight: 1.3, marginBottom: 4 }}>
            {business.name}
          </div>
          <div style={{ fontSize: 8, fontFamily: MONO, color: "#6B7280", lineHeight: 1.4, flex: 1 }}>
            {template.reward_description}
          </div>
        </div>
        {/* Right: stamp grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {Array.from({ length: total }).map((_, i) => {
              const filled = i < stamps_collected;
              return (
                <div key={i} style={{
                  aspectRatio: "1", borderRadius: "50%",
                  background: filled ? "#C8A882" : "#F5F5F5",
                  border: filled ? "none" : "1px solid #DEDEDE",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: filled ? 11 : 8, fontFamily: MONO,
                  color: filled ? "#fff" : "#ACACAC",
                }}>
                  {filled ? "◉" : (i + 1).toString().padStart(2, "0")}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, paddingTop: 8, borderTop: "1px solid #F5F5F5" }}>
        <div style={{ fontSize: 7, fontFamily: MONO, color: "#9CA3AF", background: "#F5F5F5", padding: "3px 7px", borderRadius: 999 }}>
          {business.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#0D0D0D", fontWeight: 700 }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

/* Compact reward row (for extra cards below the main one) */
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

/* TOP PICKS card */
function TopPickCard({ biz, onClick }: { biz: Business; onClick: () => void }) {
  const colors = [biz.logo_color + "88", biz.logo_color + "44"];
  return (
    <div onClick={onClick} style={{ flex: 1, minWidth: 0, borderRadius: 16, overflow: "hidden", cursor: "pointer" }}>
      <div style={{ height: 120, background: `linear-gradient(160deg, ${colors[0]}, ${colors[1]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
        {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
      </div>
      <div style={{ padding: "10px 10px 12px", background: "#fff" }}>
        <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {biz.name}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF" }}>0.1 mi away</div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF" }}>★ {biz.rating} rating</div>
      </div>
    </div>
  );
}

/* STUDENT-RUN card */
function StudentCard({ biz, onClick }: { biz: Business; onClick: () => void }) {
  const colors = [biz.logo_color + "66", biz.logo_color + "33"];
  return (
    <div onClick={onClick} style={{ flex: 1, minWidth: 0, borderRadius: 16, overflow: "hidden", cursor: "pointer", position: "relative" }}>
      <div style={{ height: 120, background: `linear-gradient(160deg, ${colors[0]}, ${colors[1]})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>
        {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
      </div>
      {/* Verified badge */}
      <div style={{ position: "absolute", top: 8, left: 8, background: "#fff", borderRadius: 999, padding: "2px 7px", display: "flex", alignItems: "center", gap: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3F3CA8" }} />
        <span style={{ fontSize: 7, fontFamily: MONO, color: "#0D0D0D", fontWeight: 700 }}>VERIFIED</span>
      </div>
      <div style={{ padding: "8px 10px 10px", background: "#fff" }}>
        <div style={{ fontSize: 10, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {biz.name}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF" }}>Verified Student</div>
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
  const restCards = myCards.slice(1);

  const filtered = businesses.filter(b =>
    !search || b.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>

        {/* Search bar */}
        <div style={{ background: "#fff", paddingTop: 52, paddingBottom: 12, paddingLeft: 16, paddingRight: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#F5F5F5", borderRadius: 10, padding: "9px 12px" }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search Punchcard..."
              style={{ border: "none", background: "transparent", outline: "none", fontFamily: MONO, fontSize: 11, color: "#0D0D0D", flex: 1 }}
            />
          </div>
        </div>

        {/* HI [NAME]! header */}
        <div style={{ background: "#fff", padding: "16px 16px 20px", borderBottom: "1px solid #F0F0F0" }}>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "-0.5px", marginBottom: 4 }}>
            HI {firstName}!
          </div>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.08em", lineHeight: 1.6 }}>
            MAKE THE SMARTER, LOCALLY &amp; SUSTAINABLY.
          </div>

          {/* Story circles — businesses with active cards */}
          {myCards.length > 0 && (
            <div style={{ display: "flex", gap: 14, marginTop: 16, overflowX: "auto", paddingBottom: 4 }}>
              {myCards.map(card => (
                <div
                  key={card.id}
                  onClick={() => navigate(`/businesses/${card.business.id}`)}
                  style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer" }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: "#F0F0F0", border: "2.5px solid #0D0D0D",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    overflow: "hidden",
                  }}>
                    {card.business.logo_color
                      ? <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${card.business.logo_color}44, ${card.business.logo_color}88)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                          {CAT_EMOJI[card.business.category] ?? card.business.name[0]}
                        </div>
                      : CAT_EMOJI[card.business.category] ?? card.business.name[0]
                    }
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
              <div style={{ background: "#fff", padding: "16px", marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.08em" }}>YOUR REWARDS</div>
                  <div onClick={() => navigate("/wallet")} style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", cursor: "pointer" }}>View all ❱❱</div>
                </div>
                {/* Main featured card */}
                <div style={{ overflowX: "auto", paddingBottom: 8 }}>
                  <div style={{ display: "flex", gap: 12 }}>
                    <PunchCard card={firstCard} />
                  </div>
                </div>
                {/* Compact rows for rest */}
                {restCards.map(card => (
                  <RewardRow
                    key={card.id}
                    card={card}
                    onClick={() => navigate(`/businesses/${card.business.id}`)}
                  />
                ))}
              </div>
            )}

            {/* TOP PICKS NEAR YOU */}
            {filtered.length > 0 && (
              <div style={{ padding: "20px 16px 0" }}>
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.08em", marginBottom: 14 }}>
                  TOP PICKS NEAR YOU
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  {filtered.slice(0, 2).map(biz => (
                    <TopPickCard
                      key={biz.id}
                      biz={biz}
                      onClick={() => navigate(`/businesses/${biz.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* STUDENT-RUN */}
            {filtered.length > 0 && (
              <div style={{ padding: "20px 16px 100px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.08em", marginBottom: 14 }}>
                  STUDENT-RUN
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {filtered.map(biz => (
                    <StudentCard
                      key={biz.id}
                      biz={biz}
                      onClick={() => navigate(`/businesses/${biz.id}`)}
                    />
                  ))}
                </div>
              </div>
            )}

            {filtered.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px 100px", fontFamily: MONO }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#0D0D0D", letterSpacing: "0.08em", marginBottom: 6 }}>NO RESULTS</div>
                <div style={{ fontSize: 9, color: "#9CA3AF" }}>TRY A DIFFERENT SEARCH</div>
              </div>
            )}
          </>
        )}
      </div>
    </UserLayout>
  );
}
