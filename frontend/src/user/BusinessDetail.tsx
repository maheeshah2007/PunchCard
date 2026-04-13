import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, UserCards, Business, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💇", Retail: "🛍️", Other: "🏪",
};
const STYLE_ICON: Record<string, string> = {
  classic: "⭕", star: "⭐", heart: "❤️", coffee: "☕",
};

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [userCard, setUserCard] = useState<UserPunchCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");

  useEffect(() => {
    if (!id) return;
    Promise.all([
      Businesses.get(Number(id)),
      UserCards.list(authHeaders()),
    ]).then(([biz, cards]) => {
      setBusiness(biz);
      setUserCard(cards.find(c => c.business.id === biz.id) ?? null);
      setLoading(false);
    });
  }, [id]);

  async function join() {
    if (!business?.active_template) return;
    setJoining(true); setJoinError("");
    try {
      const card = await UserCards.join(business.active_template.id, authHeaders());
      setUserCard(card);
    } catch (e) {
      setJoinError(e instanceof Error ? e.message : "Failed to join");
    } finally { setJoining(false); }
  }

  if (loading) {
    return (
      <UserLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh", color: "#9CA3AF" }}>Loading...</div>
      </UserLayout>
    );
  }

  if (!business) {
    return (
      <UserLayout>
        <div style={{ padding: 20, textAlign: "center", color: "#9CA3AF" }}>Business not found</div>
      </UserLayout>
    );
  }

  const template = business.active_template;
  const icon = STYLE_ICON[template?.style ?? "classic"] ?? "⭕";
  const stamps = userCard?.stamps_collected ?? 0;
  const total = template?.total_stamps ?? 10;
  const pct = (stamps / total) * 100;

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#F8F7FF" }}>
        {/* Hero */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              height: 200,
              background: `linear-gradient(160deg, ${business.logo_color} 0%, ${business.logo_color}BB 100%)`,
            }}
          />
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: "absolute", top: 52, left: 16,
              width: 38, height: 38, borderRadius: 12,
              background: "rgba(255,255,255,0.2)", border: "none",
              color: "#fff", fontSize: 20, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
            }}
          >
            ←
          </button>

          {/* Logo */}
          <div
            style={{
              position: "absolute", bottom: -28, left: 20,
              width: 64, height: 64, borderRadius: 18,
              background: "#fff",
              boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 30,
            }}
          >
            {CAT_EMOJI[business.category ?? ""] ?? "🏪"}
          </div>
        </div>

        <div style={{ padding: "44px 20px 100px" }}>
          {/* Info */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6 }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.5px", flex: 1 }}>
                {business.name}
              </h1>
              <div style={{ display: "flex", alignItems: "center", gap: 3, flexShrink: 0, marginLeft: 12 }}>
                <span style={{ fontSize: 16, color: "#F59E0B" }}>★</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{business.rating}</span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 14 }}>
              {business.category}{business.address ? ` · ${business.address}` : ""}
            </div>
            {business.description && (
              <p style={{ fontSize: 14, color: "#4B5563", lineHeight: 1.65 }}>{business.description}</p>
            )}
          </div>

          {/* Loyalty section */}
          {template ? (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E", marginBottom: 14 }}>Loyalty Program</div>

              {/* Punchcard visual */}
              <div style={{ background: "linear-gradient(135deg, #252178 0%, #3F3CA8 100%)", borderRadius: 22, padding: "22px 20px", marginBottom: 18, color: "#fff", boxShadow: "0 8px 32px rgba(63,60,168,0.25)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", right: -20, top: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 11, opacity: 0.65, marginBottom: 2 }}>{business.name}</div>
                    <div style={{ fontSize: 16, fontWeight: 800 }}>{template.name}</div>
                  </div>
                  <div style={{ fontSize: 28 }}>{icon}</div>
                </div>

                {userCard ? (
                  <>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", background: "rgba(0,0,0,0.1)", borderRadius: 14, padding: "14px 10px", marginBottom: 14 }}>
                      {Array.from({ length: total }).map((_, i) => (
                        <span key={i} style={{ fontSize: 22, opacity: i < stamps ? 1 : 0.2, filter: i < stamps ? "none" : "grayscale(1)" }}>
                          {icon}
                        </span>
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, opacity: 0.75, marginBottom: 6 }}>
                      <span>{stamps} of {total} stamps</span>
                      {userCard.is_completed
                        ? <span style={{ color: "#00C896", fontWeight: 700 }}>Reward ready! 🎉</span>
                        : <span>{total - stamps} more to go</span>
                      }
                    </div>
                    <div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 999, overflow: "hidden" }}>
                      <div style={{ height: "100%", background: "#fff", width: `${pct}%`, borderRadius: 999, transition: "width 0.5s" }} />
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: "center", padding: "20px 0" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center", marginBottom: 10 }}>
                      {Array.from({ length: Math.min(total, 10) }).map((_, i) => (
                        <span key={i} style={{ fontSize: 20, opacity: 0.2, filter: "grayscale(1)" }}>{icon}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: 13, opacity: 0.7 }}>Collect {total} stamps to earn your reward</div>
                  </div>
                )}

                <div style={{ marginTop: 12, fontSize: 12, opacity: 0.8 }}>🎁 {template.reward_description}</div>
              </div>

              {joinError && <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px", marginBottom: 14, color: "#DC2626", fontSize: 14 }}>{joinError}</div>}

              {!userCard ? (
                <button
                  onClick={join}
                  disabled={joining}
                  style={{ width: "100%", padding: "17px", borderRadius: 15, border: "none", background: joining ? "#D1D5DB" : "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: joining ? "not-allowed" : "pointer", letterSpacing: "-0.3px", boxShadow: "0 4px 16px rgba(63,60,168,0.3)" }}
                >
                  {joining ? "Joining..." : "Join Loyalty Program →"}
                </button>
              ) : (
                <button
                  onClick={() => navigate("/authenticate")}
                  style={{ width: "100%", padding: "17px", borderRadius: 15, border: "none", background: "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)", color: "#fff", fontSize: 16, fontWeight: 800, cursor: "pointer", letterSpacing: "-0.3px", boxShadow: "0 4px 16px rgba(63,60,168,0.3)" }}
                >
                  Authenticate Purchase →
                </button>
              )}
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 18, padding: "32px", textAlign: "center", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🃏</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#6B7280" }}>No loyalty program available yet</div>
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
