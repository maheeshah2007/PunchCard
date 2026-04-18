import { useNavigate } from "react-router-dom";
import MobileShell from "../components/MobileShell";
import cardStack from "../assets/wallet-and-cards.png";

const PIXEL = "'Press Start 2P', monospace";
const MONO  = "'Space Mono', monospace";
const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13' font-family='sans-serif' fill='%23BBBBBB'%3E%2B%3C/text%3E%3C/svg%3E")`;

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <MobileShell bg="#EBEBEB">
      <div
        style={{
          minHeight: "100vh",
          backgroundImage: GRID_BG,
          backgroundRepeat: "repeat",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 32px 56px",
          fontFamily: MONO,
        }}
      >
        {/* Card stack — exact Figma export */}
        <img
          src={cardStack}
          alt="Punchcard"
          style={{
            width: "100%",
            maxWidth: 300,
            marginBottom: 48,
            display: "block",
          }}
        />

        {/* Buttons */}
        <div style={{ width: "100%", maxWidth: 320, display: "flex", flexDirection: "column", gap: 12 }}>
          <button
            onClick={() => navigate("/register")}
            style={{
              width: "100%", padding: "18px", borderRadius: 999,
              border: "none", background: "#0D0D0D", color: "#fff",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.12em",
              cursor: "pointer", fontFamily: MONO,
            }}
          >
            GET STARTED
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              width: "100%", padding: "17px", borderRadius: 999,
              border: "2px solid #0D0D0D", background: "transparent",
              color: "#0D0D0D", fontSize: 12, fontWeight: 700,
              letterSpacing: "0.12em", cursor: "pointer", fontFamily: MONO,
            }}
          >
            I HAVE AN ACCOUNT
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
