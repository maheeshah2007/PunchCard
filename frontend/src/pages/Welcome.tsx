import { useNavigate } from "react-router-dom";

const PIXEL = "'Press Start 2P', monospace";
const MONO  = "'Space Mono', monospace";

/* SVG-based + grid background */
const GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-size='13' font-family='sans-serif' fill='%23C0C0C0'%3E%2B%3C/text%3E%3C/svg%3E")`;

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EBEBEB",
        backgroundImage: GRID_BG,
        backgroundRepeat: "repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px 48px",
        fontFamily: MONO,
      }}
    >
      {/* Big black card */}
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          background: "#0D0D0D",
          borderRadius: 36,
          padding: "28px 24px 32px",
          marginBottom: 40,
        }}
      >
        {/* Stacked cards */}
        <div style={{ position: "relative", height: 200, marginBottom: 24 }}>
          {/* Back card */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-48%) rotate(-9deg)",
              width: "86%",
              height: 138,
              borderRadius: 20,
              background: "linear-gradient(160deg, #888 0%, #555 100%)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.6)",
            }}
          />
          {/* Middle card */}
          <div
            style={{
              position: "absolute",
              top: 24,
              left: "50%",
              transform: "translateX(-50%) rotate(-3deg)",
              width: "90%",
              height: 138,
              borderRadius: 20,
              background: "linear-gradient(160deg, #C0C0C0 0%, #888 100%)",
              boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
            }}
          />
          {/* Front card */}
          <div
            style={{
              position: "absolute",
              top: 46,
              left: "50%",
              transform: "translateX(-52%) rotate(2deg)",
              width: "92%",
              height: 138,
              borderRadius: 20,
              background: "linear-gradient(160deg, #E8E8E8 0%, #B0B0B0 100%)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.55)",
            }}
          >
            {/* Gold chip */}
            <div
              style={{
                position: "absolute",
                top: 18,
                left: 18,
                width: 36,
                height: 28,
                borderRadius: 7,
                background: "linear-gradient(135deg, #D4AF37, #B8860B)",
                opacity: 0.85,
              }}
            />
          </div>
        </div>

        {/* Brand text */}
        <div style={{ color: "#fff" }}>
          <div style={{ fontFamily: PIXEL, fontSize: 18, letterSpacing: "0.02em", marginBottom: 10, lineHeight: 1.3 }}>
            PUNCHCARD
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.45)", letterSpacing: "0.06em" }}>
            SHOP SMALL. PUNCH BIG {"{;)"}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ width: "100%", maxWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={() => navigate("/register")}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: 999,
            border: "none",
            background: "#0D0D0D",
            color: "#fff",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            cursor: "pointer",
            fontFamily: MONO,
          }}
        >
          GET STARTED
        </button>
        <button
          onClick={() => navigate("/login")}
          style={{
            width: "100%",
            padding: "17px",
            borderRadius: 999,
            border: "2px solid #0D0D0D",
            background: "transparent",
            color: "#0D0D0D",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            cursor: "pointer",
            fontFamily: MONO,
          }}
        >
          I HAVE AN ACCOUNT
        </button>
      </div>
    </div>
  );
}
