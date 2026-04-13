import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthCodes, Businesses, Business, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const STYLE_ICON: Record<string, string> = {
  classic: "⭕", star: "⭐", heart: "❤️", coffee: "☕",
};

type RedeemResult = {
  ok: boolean;
  stamps_collected: number;
  is_completed: boolean;
  punchcard: UserPunchCard;
};

export default function AuthenticatePurchase() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [error, setError] = useState("");
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    Businesses.list().then(data => {
      const withCard = data.filter(b => b.active_template);
      setBusinesses(withCard);
      if (withCard.length > 0) setSelectedId(withCard[0].id);
    });
  }, []);

  function handleInput(i: number, val: string) {
    const v = val.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = v;
    setDigits(next);
    if (v && i < 5) refs.current[i + 1]?.focus();
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        setDigits(next);
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const text = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (text.length === 6) {
      setDigits(text.split(""));
      refs.current[5]?.focus();
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const code = digits.join("");
    if (code.length !== 6 || !selectedId) return;
    setLoading(true); setError("");
    try {
      const res = await AuthCodes.redeem(code, selectedId, authHeaders());
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid or expired code");
      setDigits(["", "", "", "", "", ""]);
      refs.current[0]?.focus();
    } finally { setLoading(false); }
  }

  function reset() {
    setResult(null);
    setDigits(["", "", "", "", "", ""]);
    setError("");
    setTimeout(() => refs.current[0]?.focus(), 100);
  }

  /* ---- Success screen ---- */
  if (result) {
    const icon = STYLE_ICON[result.punchcard.template.style] ?? "⭕";
    const stamps = result.stamps_collected;
    const total = result.punchcard.template.total_stamps;

    return (
      <UserLayout>
        <div style={{ minHeight: "100vh", background: "#F8F7FF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 80px" }}>
          <div style={{ textAlign: "center", maxWidth: 340, width: "100%" }}>

            <div style={{ fontSize: 72, marginBottom: 4, animation: "scaleIn 0.4s ease" }}>
              {result.is_completed ? "🎉" : "✅"}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.5px", marginBottom: 8 }}>
              {result.is_completed ? "You earned a reward!" : "Stamp added!"}
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.6, marginBottom: 24 }}>
              {result.is_completed
                ? `Your reward is ready: ${result.punchcard.template.reward_description}`
                : `${stamps} of ${total} stamps collected`
              }
            </p>

            {/* Punchcard visual */}
            <div style={{ background: "linear-gradient(135deg, #252178 0%, #3F3CA8 100%)", borderRadius: 22, padding: "22px 20px", marginBottom: 24, color: "#fff", boxShadow: "0 8px 32px rgba(63,60,168,0.25)" }}>
              <div style={{ fontSize: 14, opacity: 0.7, marginBottom: 12 }}>{result.punchcard.business.name}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", background: "rgba(0,0,0,0.1)", borderRadius: 14, padding: "14px 10px", marginBottom: 14 }}>
                {Array.from({ length: total }).map((_, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 22,
                      opacity: i < stamps ? 1 : 0.2,
                      filter: i < stamps ? "none" : "grayscale(1)",
                      transform: i === stamps - 1 ? "scale(1.2)" : "scale(1)",
                      transition: "transform 0.3s",
                    }}
                  >
                    {icon}
                  </span>
                ))}
              </div>
              <div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "#fff", width: `${(stamps / total) * 100}%`, borderRadius: 999 }} />
              </div>
              <div style={{ fontSize: 12, opacity: 0.75, marginTop: 10 }}>🎁 {result.punchcard.template.reward_description}</div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={reset}
                style={{ flex: 1, padding: "15px", borderRadius: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Add Another
              </button>
              <button
                onClick={() => navigate("/wallet")}
                style={{ flex: 1, padding: "15px", borderRadius: 13, border: "none", background: "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                View Wallet
              </button>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  /* ---- Code entry screen ---- */
  const codeComplete = digits.join("").length === 6;

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#fff" }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(160deg, #252178 0%, #3F3CA8 100%)", paddingTop: 52, paddingBottom: 28, paddingLeft: 20, paddingRight: 20 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>Add Stamp</h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", marginTop: 4 }}>Enter the 6-digit code from the business</p>
        </div>

        <div style={{ padding: "28px 20px" }}>
          {/* Business selector */}
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 8 }}>Select Business</label>
            <select
              value={selectedId ?? ""}
              onChange={e => setSelectedId(Number(e.target.value))}
              style={{ width: "100%", padding: "13px 16px", borderRadius: 13, border: "1.5px solid #E5E7EB", fontSize: 15, outline: "none", background: "#fff", color: "#1A1A2E", appearance: "auto" }}
            >
              {businesses.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              {businesses.length === 0 && <option value="">No businesses available</option>}
            </select>
          </div>

          {/* Code input */}
          <form onSubmit={submit}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#374151", marginBottom: 14 }}>Transaction Code</label>

            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 28 }} onPaste={handlePaste}>
              {digits.map((d, i) => (
                <input
                  key={i}
                  ref={el => { refs.current[i] = el; }}
                  value={d}
                  onChange={e => handleInput(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  maxLength={1}
                  inputMode="numeric"
                  style={{
                    width: 48, height: 62, textAlign: "center",
                    fontSize: 26, fontWeight: 800, borderRadius: 13,
                    border: `2px solid ${d ? "#6B48FF" : error ? "#FCA5A5" : "#E5E7EB"}`,
                    outline: "none", color: "#1A1A2E",
                    background: d ? "#F5F4FF" : "#FAFAFA",
                    transition: "border-color 0.15s, background 0.15s",
                    boxShadow: d ? "0 2px 8px rgba(107,72,255,0.15)" : "none",
                  }}
                />
              ))}
            </div>

            {error && (
              <div style={{ background: "#FEF2F2", borderRadius: 13, padding: "14px 16px", marginBottom: 20, color: "#DC2626", fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 8 }}>
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !codeComplete || !selectedId}
              style={{
                width: "100%", padding: "18px", borderRadius: 15, border: "none",
                background: (loading || !codeComplete || !selectedId) ? "#E5E7EB" : "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)",
                color: (loading || !codeComplete || !selectedId) ? "#9CA3AF" : "#fff",
                fontSize: 17, fontWeight: 800, cursor: (!codeComplete || !selectedId || loading) ? "not-allowed" : "pointer",
                letterSpacing: "-0.3px",
                boxShadow: codeComplete && !loading ? "0 4px 16px rgba(63,60,168,0.3)" : "none",
              }}
            >
              {loading ? "Verifying..." : "Submit Code →"}
            </button>
          </form>

          <div style={{ marginTop: 24, background: "#F8F7FF", borderRadius: 16, padding: "16px 18px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#6B7280", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.5px" }}>How it works</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
              Ask the business to generate a code. Enter the 6-digit code here — it's valid for 60 seconds. A stamp will be added to your punchcard automatically.
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
