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
      window.google.accounts.id.renderButton(googleBtnRef.current, { theme: "outline", size: "large", width: 320, text: "continue_with" });
      return true;
    };
    if (!init()) {
      const interval = setInterval(() => { if (init()) clearInterval(interval); }, 200);
      return () => clearInterval(interval);
    }
  }, [navigate, setUser]);

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #3F3CA8 0%, #252178 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 32px", width: "100%", maxWidth: 380, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #3F3CA8, #252178)", color: "#fff", fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>N</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#1A1A2E", margin: "0 0 8px" }}>NeighborGood</h1>
        <p style={{ fontSize: 15, color: "#6B7280", margin: 0 }}>{mode === "register" ? "Create your account" : "Welcome back"}</p>
        <div style={{ marginTop: 24 }}>
          <div ref={googleBtnRef} />
          {error && <p style={{ color: "#EF4444", marginTop: 12, fontSize: 14 }}>{error}</p>}
        </div>

        {/* ── Dev bypass ── */}
        <div style={{ marginTop: 20, padding: "16px", background: "#F9FAFB", borderRadius: 12, border: "1px dashed #D1D5DB" }}>
          <p style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 10, fontWeight: 600, letterSpacing: "0.05em" }}>DEV BYPASS</p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => {
                setUser({ sub: "dev_user_00001", email: "dev-user@localhost", name: "Dev Customer", picture: undefined, role: "user" });
                navigate("/dashboard");
              }}
              style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", background: "#3F3CA8", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              👤 Customer
            </button>
            <button
              onClick={() => {
                setUser({ sub: "dev_business_00001", email: "dev-business@localhost", name: "Dev Business", picture: undefined, role: "business" });
                navigate("/business/dashboard");
              }}
              style={{ flex: 1, padding: "10px 8px", borderRadius: 8, border: "none", background: "#252178", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              🏪 Business
            </button>
          </div>
        </div>

        <p style={{ marginTop: 16, fontSize: 14, color: "#6B7280" }}>
          {mode === "register" ? <>Already have an account? <a href="/login" style={{ color: "#3F3CA8", fontWeight: 600, textDecoration: "none" }}>Log in</a></> : <>New here? <a href="/register" style={{ color: "#3F3CA8", fontWeight: 600, textDecoration: "none" }}>Sign up</a></>}
        </p>
      </div>
    </div>
  );
}
