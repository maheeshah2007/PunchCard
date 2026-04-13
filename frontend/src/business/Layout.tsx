import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { icon: "▦", label: "Dashboard",     path: "/business/dashboard" },
  { icon: "◎", label: "Generate Code", path: "/business/generate-code" },
  { icon: "✦", label: "Create Card",   path: "/business/punchcard/create" },
  { icon: "◈", label: "Customers",     path: "/business/customers" },
  { icon: "⊙", label: "Profile",       path: "/business/profile" },
];

export default function BusinessLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F0EFFA" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 220,
          background: "linear-gradient(180deg, #1E1C5E 0%, #252178 60%, #3F3CA8 100%)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: "4px 0 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* Brand */}
        <div style={{ padding: "28px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontSize: 18, fontWeight: 800,
              }}
            >
              N
            </div>
            <div>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, letterSpacing: "-0.3px" }}>NeighborGood</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, marginTop: 1 }}>Business Portal</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px" }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex", alignItems: "center", gap: 10, width: "100%",
                  padding: "11px 14px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: active ? "rgba(255,255,255,0.18)" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  marginBottom: 2, textAlign: "left",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => {
                  if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                }}
                onMouseLeave={e => {
                  if (!active) e.currentTarget.style.background = "transparent";
                  if (!active) e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                <span style={{ fontSize: 16, width: 20, textAlign: "center" }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User footer */}
        <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            {user?.picture ? (
              <img
                src={user.picture}
                style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(255,255,255,0.2)" }}
                alt="avatar"
              />
            ) : (
              <div
                style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: 13, fontWeight: 700,
                }}
              >
                {user?.name?.[0] ?? "U"}
              </div>
            )}
            <div style={{ overflow: "hidden" }}>
              <div style={{ color: "#fff", fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.name ?? "Business Owner"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {user?.email}
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              width: "100%", padding: "8px 0", borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "transparent", color: "rgba(255,255,255,0.6)",
              fontSize: 12, cursor: "pointer", letterSpacing: "0.3px",
            }}
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 220, flex: 1, padding: "36px 40px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
