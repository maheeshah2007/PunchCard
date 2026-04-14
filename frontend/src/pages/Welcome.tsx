import { useNavigate } from "react-router-dom";
import MobileShell from "../components/MobileShell";

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
          padding: "0 28px 56px",
          fontFamily: MONO,
        }}
      >
        {/* Card holder */}
        <div
          style={{
            width: "100%",
            maxWidth: 320,
            marginBottom: 44,
            position: "relative",
          }}
        >
          {/* Black container with notch */}
          <div
            style={{
              background: "#0D0D0D",
              borderRadius: 36,
              padding: "28px 20px 0",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Cards area */}
            <div style={{ position: "relative", height: 190 }}>
              {/* Card 3 — back */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%) rotate(-8deg)",
                  width: "84%",
                  height: 130,
                  borderRadius: 18,
                  background: "linear-gradient(160deg, #7A7A7A 0%, #4A4A4A 100%)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
                }}
              />
              {/* Card 2 — middle */}
              <div
                style={{
                  position: "absolute",
                  top: 20,
                  left: "50%",
                  transform: "translateX(-50%) rotate(-2deg)",
                  width: "88%",
                  height: 130,
                  borderRadius: 18,
                  background: "linear-gradient(160deg, #B8B8B8 0%, #7A7A7A 100%)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
                }}
              />
              {/* Card 1 — front */}
              <div
                style={{
                  position: "absolute",
                  top: 38,
                  left: "50%",
                  transform: "translateX(-51%) rotate(2deg)",
                  width: "92%",
                  height: 130,
                  borderRadius: 18,
                  background: "linear-gradient(160deg, #E0E0E0 0%, #A0A0A0 100%)",
                  boxShadow: "0 12px 40px rgba(0,0,0,0.65)",
                }}
              >
                {/* Gold chip */}
                <div
                  style={{
                    position: "absolute",
                    top: 18,
                    left: 18,
                    width: 34,
                    height: 26,
                    borderRadius: 6,
                    background: "linear-gradient(135deg, #D4AF37 0%, #B8860B 100%)",
                    opacity: 0.9,
                  }}
                />
              </div>
            </div>

            {/* Brand text inside black card */}
            <div style={{ padding: "20px 4px 28px", color: "#fff" }}>
              <div style={{ fontFamily: PIXEL, fontSize: 16, letterSpacing: "0.04em", marginBottom: 10, lineHeight: 1.4 }}>
                PUNCHCARD
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: "0.07em" }}>
                SHOP SMALL. PUNCH BIG {"{;)"}
              </div>
            </div>

            {/* Notch cutout at bottom — two arcs */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: 36,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
              }}
            >
              {/* left arc */}
              <div style={{ width: "45%", height: 36, background: "#EBEBEB", borderRadius: "0 50% 0 0" }} />
              {/* right arc */}
              <div style={{ width: "45%", height: 36, background: "#EBEBEB", borderRadius: "50% 0 0 0" }} />
            </div>
          </div>
        </div>

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
