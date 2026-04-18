import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import walletImg from "../assets/wallet-and-cards.png";

const BG = "#0E0E0E";
const MONO = "'DM Mono', 'Space Mono', monospace";
const PLEX = "'IBM Plex Mono', 'Space Mono', monospace";

export default function Welcome() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const devLogin = (role: "business" | "user") => {
    setUser({ sub: "dev", email: "dev@test.com", name: "Dev User", role });
    navigate(role === "business" ? "/business/dashboard" : "/dashboard");
  };
  return (
    <div
      style={{
        minHeight: "100vh",
        maxWidth: 430,
        margin: "0 auto",
        background: BG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "60px 28px 48px",
        boxSizing: "border-box",
      }}
    >
      {/* Logo + illustration */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, justifyContent: "center" }}>
        <div style={{ fontSize: 44, fontFamily: MONO, fontWeight: 500, color: "#F9F9F9", letterSpacing: "-1px", lineHeight: 1.1, textTransform: "uppercase", marginBottom: 8 }}>
          PUNCHCARD
        </div>
        <div style={{ fontSize: 13, fontFamily: MONO, color: "#B7B7B7", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 40 }}>
          Shop Small. Punch Big.
        </div>
        <img
          src={walletImg}
          alt="Loyalty cards"
          style={{ width: "85%", maxWidth: 320, height: "auto" }}
        />
      </div>

      {/* CTA buttons */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={() => navigate("/register")}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: 15,
            border: "none",
            background: "#F9F9F9",
            color: BG,
            fontFamily: PLEX,
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          Get Started
        </button>
        <button
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: 15,
            border: "1px solid rgba(249,249,249,0.3)",
            background: "transparent",
            color: "#F9F9F9",
            fontFamily: PLEX,
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            cursor: "pointer",
          }}
        >
          I Have an Account
        </button>
      </div>

      {import.meta.env.DEV && (
        <div style={{ width: "100%", display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={() => devLogin("user")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #333", background: "transparent", color: "#727272", fontFamily: MONO, fontSize: 11, cursor: "pointer", letterSpacing: "0.04em" }}>
            DEV: User
          </button>
          <button onClick={() => devLogin("business")} style={{ flex: 1, padding: "10px", borderRadius: 10, border: "1px solid #333", background: "transparent", color: "#727272", fontFamily: MONO, fontSize: 11, cursor: "pointer", letterSpacing: "0.04em" }}>
            DEV: Business
          </button>
        </div>
      )}
    </div>
  );
}
