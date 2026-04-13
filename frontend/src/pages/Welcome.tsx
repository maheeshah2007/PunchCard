import { useNavigate } from "react-router-dom";

const MONO = "'Space Mono', monospace";

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#EBEBEB",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 28px 40px",
        fontFamily: MONO,
      }}
    >
      {/* Big black card */}
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#0D0D0D",
          borderRadius: 32,
          padding: "32px 28px 36px",
          marginBottom: 36,
        }}
      >
        {/* Stacked card visuals */}
        <div style={{ position: "relative", height: 210, marginBottom: 28 }}>
          {/* Card 3 — back, most rotated */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-48%) rotate(-9deg)",
              width: "88%",
              height: 140,
              borderRadius: 18,
              background: "linear-gradient(160deg, #9A9A9A 0%, #6A6A6A 100%)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
              <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 3, marginBottom: 5 }} />
              <div style={{ height: 5, background: "rgba(255,255,255,0.10)", borderRadius: 3, marginBottom: 5 }} />
              <div style={{ height: 5, width: "55%", background: "rgba(255,255,255,0.08)", borderRadius: 3 }} />
            </div>
          </div>

          {/* Card 2 — middle */}
          <div
            style={{
              position: "absolute",
              top: 22,
              left: "50%",
              transform: "translateX(-50%) rotate(-3deg)",
              width: "90%",
              height: 140,
              borderRadius: 18,
              background: "linear-gradient(160deg, #CACACA 0%, #909090 100%)",
              boxShadow: "0 6px 24px rgba(0,0,0,0.45)",
            }}
          >
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
              <div style={{ height: 5, background: "rgba(255,255,255,0.2)", borderRadius: 3, marginBottom: 5 }} />
              <div style={{ height: 5, background: "rgba(255,255,255,0.15)", borderRadius: 3, marginBottom: 5 }} />
              <div style={{ height: 5, width: "60%", background: "rgba(255,255,255,0.1)", borderRadius: 3 }} />
            </div>
          </div>

          {/* Card 1 — front */}
          <div
            style={{
              position: "absolute",
              top: 44,
              left: "50%",
              transform: "translateX(-52%) rotate(2deg)",
              width: "92%",
              height: 140,
              borderRadius: 18,
              background: "linear-gradient(160deg, #E8E8E8 0%, #AEAEAE 100%)",
              boxShadow: "0 10px 32px rgba(0,0,0,0.5)",
            }}
          >
            {/* Chip */}
            <div style={{ position: "absolute", top: 20, left: 20, width: 34, height: 26, borderRadius: 6, background: "linear-gradient(135deg, #D4AF37, #C8A200)", opacity: 0.8 }} />
            <div style={{ position: "absolute", bottom: 16, left: 16, right: 16 }}>
              <div style={{ height: 5, background: "rgba(0,0,0,0.12)", borderRadius: 3, marginBottom: 5 }} />
              <div style={{ height: 5, background: "rgba(0,0,0,0.08)", borderRadius: 3, marginBottom: 5 }} />
              <div style={{ height: 5, width: "65%", background: "rgba(0,0,0,0.06)", borderRadius: 3 }} />
            </div>
          </div>
        </div>

        {/* Brand text */}
        <div style={{ color: "#fff" }}>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "0.04em",
              marginBottom: 10,
              fontFamily: MONO,
              lineHeight: 1.1,
            }}
          >
            PUNCHCARD
          </div>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.08em",
              fontFamily: MONO,
            }}
          >
            SHOP SMALL. PUNCH BIG {"{:}"}
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ width: "100%", maxWidth: 360, display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={() => navigate("/register")}
          style={{
            width: "100%",
            padding: "18px",
            borderRadius: 999,
            border: "none",
            background: "#0D0D0D",
            color: "#fff",
            fontSize: 13,
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
            fontSize: 13,
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
