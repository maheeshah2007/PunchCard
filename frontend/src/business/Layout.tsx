import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Users, QrCode, HelpCircle, Settings } from "lucide-react";

const NAV_ITEMS = [
  { icon: Home,   label: "Homepage",             path: "/business/dashboard" },
  { icon: Users,  label: "Customers",             path: "/business/customers" },
  { icon: QrCode, label: "Authenticate Purchase", path: "/business/generate-code" },
];

const BOTTOM_ITEMS = [
  { icon: HelpCircle, label: "Help",     path: "/business/help" },
  { icon: Settings,   label: "Settings", path: "/business/profile" },
];

export default function BusinessLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F4F4" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: 306,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
          boxShadow: "4px 0px 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* Brand */}
        <div style={{ padding: "21px 28px 0", marginBottom: 24 }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontFamily: "'Bitcount Grid Single', 'DM Mono', monospace", fontWeight: 400, fontSize: 28, letterSpacing: "0.04em", textTransform: "uppercase", color: "#1a1a1a", lineHeight: 1.2 }}>
              PUNCHCARD
            </span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 8, letterSpacing: "0.07em", textTransform: "uppercase", color: "#1a1a1a", marginTop: 2 }}>
              Shop Small. Punch Big
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "0 28px", display: "flex", flexDirection: "column", gap: 30, marginTop: 166 - 21 - 60 }}>
          {NAV_ITEMS.map(item => {
            const active = location.pathname === item.path ||
              (item.path === "/business/dashboard" && location.pathname === "/business/dashboard");
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: active ? "rgba(0,0,0,0.25)" : "transparent",
                  color: "#fff",
                  fontSize: 14,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: active ? 500 : 400,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textAlign: "left",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = "rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={22} color={active ? "#fff" : "#000"} strokeWidth={1.5} />
                <span style={{ color: active ? "#fff" : "#000" }}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Divider */}
        <div style={{ margin: "0 22px", borderTop: "1px solid #7B7B7B" }} />

        {/* Bottom nav */}
        <div style={{ padding: "16px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          {BOTTOM_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  width: "100%",
                  padding: "10px 16px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  background: "transparent",
                  fontSize: 16,
                  fontFamily: "'DM Mono', monospace",
                  fontWeight: 400,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textAlign: "left",
                  color: "#000",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,0,0,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                <Icon size={22} color="#000" strokeWidth={1.5} />
                {item.label}
              </button>
            );
          })}

          {/* User info */}
          <div style={{ borderTop: "1px solid rgba(0,0,0,0.1)", paddingTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {user?.picture ? (
                <img src={user.picture} style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover" }} alt="avatar" />
              ) : (
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>
                  {user?.name?.[0] ?? "U"}
                </div>
              )}
              <div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 500, fontSize: 13, letterSpacing: "0.02em" }}>{user?.name ?? "Business Owner"}</div>
                <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 400, fontSize: 11, color: "#6B7280" }}>Admin</div>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "1px solid #D1D5DB", background: "transparent", fontSize: 12, cursor: "pointer", fontWeight: 600 }}
            >
              👤 Customer View
            </button>
            <button
              onClick={logout}
              style={{ width: "100%", padding: "7px 0", borderRadius: 8, border: "1px solid #D1D5DB", background: "transparent", color: "#6B7280", fontSize: 12, cursor: "pointer" }}
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ marginLeft: 306, flex: 1, padding: "36px 40px", minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}
