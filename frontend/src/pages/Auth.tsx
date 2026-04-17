import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as AuthAPI } from "../api";
import { useAuth } from "../context/AuthContext";

declare global {
  interface Window {
    google?: { accounts: { id: { initialize: (c: object) => void; renderButton: (el: HTMLElement, o: object) => void } } };
  }
}

const GOOGLE_CLIENT_ID = "212855412758-c7guc92ug9eloic9a3ib9eknhrapgni1.apps.googleusercontent.com";
const BG = "#0E0E0E";
const MONO = "'DM Mono', 'Space Mono', monospace";
const PLEX = "'IBM Plex Mono', 'Space Mono', monospace";

export default function Auth({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const googleBtnRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");

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
      window.google.accounts.id.renderButton(googleBtnRef.current, {
        theme: "outline", size: "large", width: 320, text: mode === "register" ? "signup_with" : "continue_with",
      });
      return true;
    };
    if (!init()) {
      const interval = setInterval(() => { if (init()) clearInterval(interval); }, 200);
      return () => clearInterval(interval);
    }
  }, [navigate, setUser, mode]);

  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 430,
        margin: "0 auto",
        background: BG,
        display: "flex",
        flexDirection: "column",
        padding: "60px 28px 48px",
        boxSizing: "border-box",
      }}
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{ background: "none", border: "none", color: "#B7B7B7", fontFamily: MONO, fontSize: 13, cursor: "pointer", padding: 0, textAlign: "left", marginBottom: 40 }}
      >
        ← back
      </button>

      {/* Heading */}
      <div style={{ fontSize: 44, fontFamily: MONO, fontWeight: 500, color: "#F9F9F9", letterSpacing: "-1px", lineHeight: 1.1, textTransform: "uppercase", marginBottom: 8 }}>
        {mode === "login" ? "Login" : "Sign Up"}
      </div>
      <div style={{ fontSize: 13, fontFamily: MONO, color: "#B7B7B7", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 48 }}>
        {mode === "login" ? "Welcome back." : "Create your account."}
      </div>

      {/* Google sign-in */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <div style={{ fontSize: 12, fontFamily: MONO, color: "#727272", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>
          {mode === "login" ? "log in with" : "sign up with"}
        </div>
        <div ref={googleBtnRef} style={{ width: "100%", display: "flex", justifyContent: "center" }} />
        {error && <p style={{ color: "#EF4444", fontSize: 13, fontFamily: MONO, textAlign: "center" }}>{error}</p>}
      </div>

      {/* Switch mode */}
      <div style={{ marginTop: "auto", textAlign: "center", fontFamily: PLEX, fontSize: 13, color: "#727272" }}>
        {mode === "login" ? (
          <>Don't have an account?{" "}
            <span onClick={() => navigate("/register")} style={{ color: "#F9F9F9", cursor: "pointer", textDecoration: "underline" }}>
              Sign up
            </span>
          </>
        ) : (
          <>Already have an account?{" "}
            <span onClick={() => navigate("/login")} style={{ color: "#F9F9F9", cursor: "pointer", textDecoration: "underline" }}>
              Log in
            </span>
          </>
        )}
      </div>
    </div>
  );
}
