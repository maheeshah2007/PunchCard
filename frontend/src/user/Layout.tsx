import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const BG = "#0E0E0E";
const MONO = "'DM Mono', 'Space Mono', monospace";

const TABS = [
  { label: "Home",    path: "/dashboard",   icon: HomeIcon },
  { label: "Browse",  path: "/browse",      icon: BrowseIcon },
  { label: "Wallet",  path: "/wallet",      icon: WalletIcon },
  { label: "Profile", path: "/profile",     icon: ProfileIcon },
];

function HomeIcon({ active }: { active: boolean }) {
  const c = active ? BG : "#9CA3AF";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" fill={active ? c : "none"} />
      <path d="M9 21V12h6v9" stroke={active ? "#fff" : c} />
    </svg>
  );
}

function BrowseIcon({ active }: { active: boolean }) {
  const c = active ? BG : "#9CA3AF";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function WalletIcon({ active }: { active: boolean }) {
  const c = active ? BG : "#9CA3AF";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <path d="M2 10h20" />
      <circle cx="17" cy="15" r="1.5" fill={active ? BG : "#9CA3AF"} stroke="none" />
    </svg>
  );
}

function ProfileIcon({ active }: { active: boolean }) {
  const c = active ? BG : "#9CA3AF";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function UserLayout({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: BG,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        boxShadow: "0 0 60px rgba(0,0,0,0.5)",
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 82 }}>
        {children}
      </div>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 430,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          display: "flex",
          zIndex: 200,
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {TABS.map(tab => {
          const active = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "10px 0 12px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                gap: 3,
              }}
            >
              <Icon active={active} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: active ? 700 : 400,
                  color: active ? BG : "#9CA3AF",
                  fontFamily: MONO,
                  letterSpacing: "0.02em",
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
