import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, AuthCodes, PunchCardTemplate, Business } from "../api";
import BusinessLayout from "./Layout";

export default function GenerateCode() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [template, setTemplate] = useState<PunchCardTemplate | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Businesses.getMine(authHeaders())
      .then(b => { setBusiness(b); if (b.active_template) setTemplate(b.active_template); })
      .catch(() => navigate("/business/setup"));
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  async function generate() {
    if (!template) return;
    setLoading(true); setError("");
    try {
      const result = await AuthCodes.generate(template.id, authHeaders());
      setCode(result.code);
      const exp = new Date(result.expires_at);
      const secs = Math.max(0, Math.round((exp.getTime() - Date.now()) / 1000));
      setSecondsLeft(secs);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setSecondsLeft(s => {
          if (s <= 1) { clearInterval(timerRef.current!); setCode(null); return 0; }
          return s - 1;
        });
      }, 1000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate code");
    } finally { setLoading(false); }
  }

  const digits = code ? code.split("") : ["—", "—", "—", "—", "—", "—"];
  const progress = code ? (secondsLeft / 60) * 100 : 0;
  const isExpiring = secondsLeft > 0 && secondsLeft < 15;

  return (
    <BusinessLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.5px" }}>Generate Code</h1>
        <p style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>Share this one-time code with your customer to add a stamp</p>
      </div>

      <div style={{ maxWidth: 500, margin: "0 auto" }}>
        <div style={{ background: "#fff", borderRadius: 24, padding: "40px 36px", boxShadow: "0 4px 32px rgba(0,0,0,0.08)", textAlign: "center" }}>

          {/* Code display */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 }}>
              {digits.map((d, i) => (
                <div
                  key={i}
                  style={{
                    width: 60, height: 76, borderRadius: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 34, fontWeight: 800,
                    color: code ? "#1A1A2E" : "#D1D5DB",
                    background: code ? (isExpiring ? "#FFF5F5" : "#F5F4FF") : "#F9FAFB",
                    border: `2px solid ${code ? (isExpiring ? "#FCA5A5" : "#6B48FF") : "#E5E7EB"}`,
                    transition: "all 0.3s",
                    boxShadow: code ? `0 4px 12px ${isExpiring ? "rgba(252,165,165,0.3)" : "rgba(107,72,255,0.15)"}` : "none",
                  }}
                >
                  {d}
                </div>
              ))}
            </div>

            {/* Timer bar */}
            {code ? (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6B7280", marginBottom: 8 }}>
                  <span>Code expires in</span>
                  <span style={{ fontWeight: 700, color: isExpiring ? "#EF4444" : "#1A1A2E" }}>
                    {secondsLeft}s
                  </span>
                </div>
                <div style={{ height: 8, background: "#F0F0F0", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    background: isExpiring ? "#EF4444" : "linear-gradient(90deg, #3F3CA8, #6B48FF)",
                    width: `${progress}%`,
                    borderRadius: 999,
                    transition: "width 1s linear, background 0.3s",
                  }} />
                </div>
              </div>
            ) : (
              <p style={{ color: "#9CA3AF", fontSize: 14 }}>
                Press <strong>Get Code</strong> to generate a new transaction code
              </p>
            )}
          </div>

          {/* Active program info */}
          {template ? (
            <div style={{ background: "#F8F7FF", borderRadius: 14, padding: "14px 18px", marginBottom: 28, textAlign: "left" }}>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Active program</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{template.name}</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 2 }}>🎁 {template.reward_description}</div>
            </div>
          ) : (
            <div style={{ background: "#FFF7ED", borderRadius: 14, padding: "14px 18px", marginBottom: 28, textAlign: "left" }}>
              <div style={{ fontSize: 14, color: "#92400E", fontWeight: 600 }}>No active punchcard</div>
              <div style={{ fontSize: 13, color: "#B45309", marginTop: 2 }}>
                <button onClick={() => navigate("/business/punchcard/create")} style={{ background: "none", border: "none", color: "#D97706", fontWeight: 600, cursor: "pointer", textDecoration: "underline", fontSize: 13, padding: 0 }}>
                  Create a punchcard first →
                </button>
              </div>
            </div>
          )}

          {error && <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px 16px", marginBottom: 20, color: "#DC2626", fontSize: 14 }}>{error}</div>}

          <button
            onClick={generate}
            disabled={loading || !template}
            style={{
              width: "100%", padding: "18px", borderRadius: 14, border: "none",
              background: (!template || loading) ? "#E5E7EB" : "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)",
              color: (!template || loading) ? "#9CA3AF" : "#fff",
              fontSize: 17, fontWeight: 800, cursor: (!template || loading) ? "not-allowed" : "pointer",
              letterSpacing: "-0.3px",
            }}
          >
            {loading ? "Generating..." : "Get Code"}
          </button>

          <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 14, lineHeight: 1.5 }}>
            Valid for <strong>60 seconds</strong> · One transaction per code · Previous codes are invalidated
          </p>
        </div>

        {/* Instructions */}
        <div style={{ marginTop: 24, background: "#fff", borderRadius: 18, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 14 }}>How it works</div>
          {[
            { step: "1", text: "Press \"Get Code\" to generate a unique 6-digit code" },
            { step: "2", text: "Show or share the code with your customer" },
            { step: "3", text: "Customer enters the code in their NeighborGood app" },
            { step: "4", text: "A stamp is automatically added to their punchcard" },
          ].map(item => (
            <div key={item.step} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: 12 }}>
              <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#F0EEFF", color: "#6B48FF", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {item.step}
              </div>
              <div style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.5 }}>{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    </BusinessLayout>
  );
}
