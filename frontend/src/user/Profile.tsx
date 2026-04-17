import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { UserCards, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const BG = "#0E0E0E";
const SURFACE = "#1A1A1A";
const TEXT = "#F9F9F9";
const TEXT2 = "#B7B7B7";
const TEXT3 = "#727272";
const MONO = "'DM Mono', 'Space Mono', monospace";
const PLEX = "'IBM Plex Mono', 'Space Mono', monospace";

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { authHeaders } = useAuth();
  const [cards, setCards] = useState<UserPunchCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    UserCards.list(authHeaders()).then(setCards).catch(console.error).finally(() => setLoading(false));
  }, []);

  const completed = cards.filter(c => c.is_completed).length;
  const active = cards.filter(c => !c.is_completed).length;
  const handle = user?.email?.split("@")[0] ?? "user";
  const displayName = user?.name ?? "User";

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: BG, paddingTop: 56 }}>
        {/* Profile hero */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
            {/* Avatar */}
            {user?.picture ? (
              <img
                src={user.picture}
                alt={displayName}
                style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.15)" }}
              />
            ) : (
              <div style={{ width: 72, height: 72, borderRadius: "50%", background: SURFACE, border: "2px solid rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: TEXT }}>
                {displayName[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 22, fontFamily: MONO, fontWeight: 500, color: TEXT, textTransform: "uppercase", letterSpacing: "-0.5px", lineHeight: 1.1, marginBottom: 4 }}>
                {displayName}
              </div>
              <div style={{ fontSize: 12, fontFamily: MONO, color: TEXT3 }}>@{handle}</div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 0, marginBottom: 28 }}>
            {[
              { value: active, label: "Active" },
              { value: completed, label: "Earned" },
            ].map((stat, i) => (
              <div
                key={stat.label}
                style={{
                  flex: 1,
                  textAlign: "center",
                  padding: "16px 0",
                  borderRight: i === 0 ? "1px solid rgba(255,255,255,0.08)" : "none",
                }}
              >
                <div style={{ fontSize: 28, fontFamily: MONO, fontWeight: 500, color: TEXT, letterSpacing: "-1px" }}>
                  {loading ? "—" : stat.value}
                </div>
                <div style={{ fontSize: 10, fontFamily: MONO, color: TEXT2, textTransform: "uppercase", letterSpacing: "0.06em", marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Completed punchcards banner */}
          {completed > 0 && (
            <div
              style={{
                background: SURFACE,
                borderRadius: 16,
                padding: "16px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 20,
              }}
            >
              <div style={{ fontSize: 32 }}>🎉</div>
              <div>
                <div style={{ fontSize: 28, fontFamily: MONO, fontWeight: 500, color: TEXT, letterSpacing: "-0.5px" }}>
                  {completed}
                </div>
                <div style={{ fontSize: 11, fontFamily: MONO, color: TEXT2 }}>Punchcards completed!</div>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.08)", margin: "0 0 8px" }} />

        {/* Menu items */}
        <div style={{ padding: "0 20px" }}>
          {[
            { label: "My Wallet", action: () => navigate("/wallet"), icon: "◑" },
            { label: "Explore Businesses", action: () => navigate("/browse"), icon: "◎" },
            { label: "Authenticate Purchase", action: () => navigate("/authenticate"), icon: "⊞" },
          ].map(item => (
            <button
              key={item.label}
              onClick={item.action}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 0",
                background: "transparent",
                border: "none",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                cursor: "pointer",
                fontFamily: MONO,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 16, color: TEXT2 }}>{item.icon}</span>
                <span style={{ fontSize: 13, color: TEXT }}>{item.label}</span>
              </div>
              <span style={{ fontSize: 14, color: TEXT3 }}>›</span>
            </button>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: "24px 20px 100px" }}>
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: 15,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "transparent",
              color: TEXT2,
              fontFamily: PLEX,
              fontSize: 13,
              letterSpacing: "0.04em",
              cursor: "pointer",
              textTransform: "uppercase",
            }}
          >
            Log Out
          </button>
        </div>
      </div>
    </UserLayout>
  );
}
