import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as AuthAPI } from "../api";
import { useAuth } from "../context/AuthContext";
import MobileShell from "../components/MobileShell";

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (c: object) => void; renderButton: (el: HTMLElement, o: object) => void } } };
  }
}

const GOOGLE_CLIENT_ID = "212855412758-c7guc92ug9eloic9a3ib9eknhrapgni1.apps.googleusercontent.com";
const PIXEL = "'Press Start 2P', monospace";
const MONO  = "'Space Mono', monospace";
const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13' font-family='sans-serif' fill='%23BBBBBB'%3E%2B%3C/text%3E%3C/svg%3E")`;

export default function Auth({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeEmails, setAgreeEmails] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  useEffect(() => {
    const init = () => {
      if (!window.google?.accounts?.id || !googleBtnRef.current) return false;
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (response: { credential: string }) => {
          try {
            const { user } = await AuthAPI.google(response.credential);
            const appUser = { sub: user.sub ?? "", email: user.email, name: user.name, picture: user.picture, role: user.role };
            setUser(appUser);
            if (!appUser.role) navigate("/role-select");
            else if (appUser.role === "business") navigate("/business/dashboard");
            else navigate("/dashboard");
          } catch (e) { setError(e instanceof Error ? e.message : "Google login failed"); }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, { theme: "outline", size: "large", width: 140, text: "continue_with" });
      return true;
    };
    if (!init()) {
      const interval = setInterval(() => { if (init()) clearInterval(interval); }, 200);
      return () => clearInterval(interval);
    }
  }, [navigate, setUser]);

  // ── LOGIN MODE (unchanged) ──────────────────────────────────────────────────
  if (mode === "login") {
    return (
      <MobileShell bg="#EBEBEB">
        <div
          style={{
            minHeight: "100vh",
            backgroundImage: GRID_BG,
            backgroundRepeat: "repeat",
            display: "flex",
            flexDirection: "column",
            padding: "0 32px 48px",
            fontFamily: MONO,
          }}
        >
          {/* Pixel title */}
          <div style={{ paddingTop: 80, paddingBottom: 56, textAlign: "center" }}>
            <div style={{ fontFamily: PIXEL, fontSize: 20, color: "#0D0D0D", letterSpacing: "0.04em", lineHeight: 1.6 }}>
              LOGIN
            </div>
          </div>

          {/* Underline fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32, marginBottom: 48 }}>
            <div>
              <div style={{ fontSize: 10, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.1em", marginBottom: 10 }}>USERNAME/EMAIL</div>
              <div style={{ height: 1, background: "#0D0D0D" }} />
            </div>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 10, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.1em" }}>PASSWORD</div>
                <div style={{ fontSize: 10, fontFamily: MONO, color: "#0D0D0D" }}>Forgot?</div>
              </div>
              <div style={{ height: 1, background: "#0D0D0D" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 15, height: 15, border: "1.5px solid #0D0D0D", borderRadius: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 11, fontFamily: MONO, color: "#0D0D0D" }}>Remember me</span>
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* LOG IN button */}
          <button
            style={{
              width: "100%", padding: "18px", borderRadius: 999, border: "none",
              background: "#0D0D0D", color: "#fff", fontSize: 12,
              fontFamily: MONO, fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer",
              marginBottom: 14,
            }}
          >
            LOG IN
          </button>

          <div style={{ textAlign: "center", fontSize: 10, fontFamily: MONO, color: "#6B7280", marginBottom: 14 }}>
            or log in with
          </div>

          {/* Google + Apple */}
          <div style={{ display: "flex", gap: 10, marginBottom: 32 }}>
            <div ref={googleBtnRef} style={{ flex: 1 }} />
            <button
              style={{
                flex: 1, padding: "12px", borderRadius: 999,
                border: "1.5px solid #0D0D0D", background: "#fff",
                cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", gap: 7,
                fontFamily: MONO, fontSize: 11, fontWeight: 700, color: "#0D0D0D",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0D0D0D">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>

          {error && <p style={{ color: "#EF4444", fontSize: 11, fontFamily: MONO, textAlign: "center", marginBottom: 12 }}>{error}</p>}

          {/* Dev bypass */}
          <div style={{ borderTop: "1px solid #D1D5DB", paddingTop: 14, marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", textAlign: "center", marginBottom: 10, letterSpacing: "0.08em" }}>DEV BYPASS</div>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={() => { setUser({ sub: "dev_user_00001", email: "dev-user@localhost", name: "Dev Customer", picture: undefined, role: "user" }); navigate("/dashboard"); }}
                style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", background: "#0D0D0D", color: "#fff", fontSize: 9, fontFamily: MONO, cursor: "pointer" }}
              >CUSTOMER</button>
              <button
                onClick={() => { setUser({ sub: "dev_business_00001", email: "dev-business@localhost", name: "Dev Business", picture: undefined, role: "business" }); navigate("/business/dashboard"); }}
                style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", background: "#3F3CA8", color: "#fff", fontSize: 9, fontFamily: MONO, cursor: "pointer" }}
              >BUSINESS</button>
            </div>
          </div>

          <div style={{ textAlign: "center", fontSize: 10, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.06em" }}>
            DON'T HAVE AN ACCOUNT?{" "}<a href="/register" style={{ color: "#0D0D0D", textDecoration: "underline", fontWeight: 700 }}>SIGN UP</a>
          </div>
        </div>
      </MobileShell>
    );
  }

  // ── REGISTER MODE ──────────────────────────────────────────────────────────
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#2A2A2A",
        backgroundImage: "radial-gradient(ellipse 55% 80% at -5% 50%, rgba(140,140,140,0.4) 0%, transparent 65%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        fontFamily: MONO,
        padding: "0 5vw",
        boxSizing: "border-box",
      }}
    >
      {/* Right-side card */}
      <div
        style={{
          background: "#CACACA",
          borderRadius: 24,
          padding: "48px 44px",
          width: 560,
          maxWidth: "95vw",
          boxSizing: "border-box",
        }}
      >
        {/* Heading */}
        <div style={{ fontFamily: PIXEL, fontSize: 14, color: "#1A1A1A", lineHeight: 1.8, marginBottom: 10 }}>
          CREATE YOUR PUNCHCARD ACCOUNT
        </div>

        {/* Already have account */}
        <div style={{ fontFamily: MONO, fontSize: 11, color: "#4B4B4B", letterSpacing: "0.08em", marginBottom: 28 }}>
          ALREADY HAVE AN ACCOUNT?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{ textDecoration: "underline", cursor: "pointer", color: "#1A1A1A", fontWeight: 700 }}
          >
            SIGN IN
          </span>
        </div>

        {/* Google + Apple side by side */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <div ref={googleBtnRef} style={{ flex: 1, minWidth: 0 }} />
          <button
            style={{
              flex: 1, padding: "11px 16px", borderRadius: 999,
              border: "1.5px solid #1A1A1A", background: "transparent",
              cursor: "pointer", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 7,
              fontFamily: MONO, fontSize: 11, fontWeight: 700, color: "#1A1A1A",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#1A1A1A">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            Apple
          </button>
        </div>

        {/* Divider gap */}
        <div style={{ height: 8, marginBottom: 16 }} />

        {/* First + Last name row */}
        <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
          <input
            placeholder="FIRST NAME"
            style={{
              flex: 1, minWidth: 0,
              padding: "10px 0",
              border: "none",
              borderBottom: "1.5px solid #8A8A8A",
              background: "transparent",
              fontFamily: MONO, fontSize: 12,
              color: "#1A1A1A", outline: "none",
            }}
          />
          <input
            placeholder="LAST NAME"
            style={{
              flex: 1, minWidth: 0,
              padding: "10px 0",
              border: "none",
              borderBottom: "1.5px solid #8A8A8A",
              background: "transparent",
              fontFamily: MONO, fontSize: 12,
              color: "#1A1A1A", outline: "none",
            }}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: 24 }}>
          <input
            placeholder="EMAIL"
            type="email"
            style={{
              width: "100%",
              padding: "10px 0",
              border: "none",
              borderBottom: "1.5px solid #8A8A8A",
              background: "transparent",
              fontFamily: MONO, fontSize: 12,
              color: "#1A1A1A", outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: 28, position: "relative" }}>
          <input
            placeholder="PASSWORD"
            type={showPassword ? "text" : "password"}
            style={{
              width: "100%",
              padding: "10px 32px 10px 0",
              border: "none",
              borderBottom: "1.5px solid #8A8A8A",
              background: "transparent",
              fontFamily: MONO, fontSize: 12,
              color: "#1A1A1A", outline: "none",
              boxSizing: "border-box",
            }}
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            style={{
              position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer",
              fontSize: 16, lineHeight: 1, padding: 0, color: "#6B6B6B",
            }}
            aria-label="Toggle password visibility"
          >
            {showPassword ? "🙈" : "👁"}
          </button>
        </div>

        {/* Checkboxes */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <div
              onClick={() => setAgreeEmails(v => !v)}
              style={{
                width: 15, height: 15, borderRadius: 3,
                border: "1.5px solid #5A5A5A",
                background: agreeEmails ? "#1A1A1A" : "transparent",
                flexShrink: 0, marginTop: 1,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              {agreeEmails && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "#3A3A3A", letterSpacing: "0.04em", lineHeight: 1.5 }}>
              I agree to receive occasional emails with updates and news.
            </span>
          </label>

          <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
            <div
              onClick={() => setAgreeTerms(v => !v)}
              style={{
                width: 15, height: 15, borderRadius: 3,
                border: "1.5px solid #5A5A5A",
                background: agreeTerms ? "#1A1A1A" : "transparent",
                flexShrink: 0, marginTop: 1,
                display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
              }}
            >
              {agreeTerms && (
                <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                  <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 10, color: "#3A3A3A", letterSpacing: "0.04em", lineHeight: 1.5 }}>
              I agree with the Terms of Use. I acknowledge the Privacy Policy.
            </span>
          </label>
        </div>

        {error && <p style={{ color: "#EF4444", fontSize: 11, fontFamily: MONO, marginBottom: 12 }}>{error}</p>}

        {/* CREATE ACCOUNT button */}
        <button
          style={{
            width: "100%", padding: "18px", borderRadius: 999, border: "none",
            background: "#1A1A1A", color: "#fff", fontSize: 12,
            fontFamily: MONO, fontWeight: 700, letterSpacing: "0.12em", cursor: "pointer",
            marginBottom: 24,
          }}
        >
          CREATE ACCOUNT
        </button>

        {/* Dev bypass */}
        <div style={{ borderTop: "1px solid #B0B0B0", paddingTop: 14 }}>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", textAlign: "center", marginBottom: 10, letterSpacing: "0.08em" }}>DEV BYPASS</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => { setUser({ sub: "dev_user_00001", email: "dev-user@localhost", name: "Dev Customer", picture: undefined, role: "user" }); navigate("/dashboard"); }}
              style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", background: "#0D0D0D", color: "#fff", fontSize: 9, fontFamily: MONO, cursor: "pointer" }}
            >CUSTOMER</button>
            <button
              onClick={() => { setUser({ sub: "dev_business_00001", email: "dev-business@localhost", name: "Dev Business", picture: undefined, role: "business" }); navigate("/business/dashboard"); }}
              style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", background: "#3F3CA8", color: "#fff", fontSize: 9, fontFamily: MONO, cursor: "pointer" }}
            >BUSINESS</button>
          </div>
        </div>
      </div>
    </div>
  );
}
