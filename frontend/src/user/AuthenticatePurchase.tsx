import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthCodes, Businesses, Business, UserPunchCard, UserCards } from "../api";
import UserLayout from "./Layout";

const IBM = "'IBM Plex Mono', monospace";
const BITCOUNT = "'Bitcount Grid Single', 'DM Mono', monospace";
const SYNE = "'Syne Mono', monospace";

const KEYS = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["", ""], ["0", "+"], ["DEL", ""],
];

// Punchcard matching the Figma frame-137 — light card, 3-col circles, numbered
function PunchCardVisual({ card, business }: { card: UserPunchCard; business: Business }) {
  const { template, stamps_collected } = card;
  const total = template.total_stamps;
  const cols = 3;
  const rows = Math.ceil(total / cols);

  return (
    <div style={{
      background: "#F0F0F0",
      borderRadius: 5,
      padding: "14px 12px",
      boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
      border: "1px solid rgba(128,128,128,0.2)",
      width: "100%",
      boxSizing: "border-box",
    }}>
      {/* Top: business name + stamp grid side by side */}
      <div style={{ display: "flex", gap: 10 }}>
        {/* Left: large name */}
        <div style={{ flex: "0 0 auto", maxWidth: "45%" }}>
          <div style={{ fontFamily: SYNE, fontSize: 26, fontWeight: 400, color: "#000", lineHeight: 0.85, letterSpacing: "-0.02em", marginBottom: 8 }}>
            {business.name}
          </div>
          <div style={{ fontFamily: IBM, fontSize: 7, color: "#000", textTransform: "uppercase", letterSpacing: "0.06em", opacity: 0.6 }}>
            {template.reward_description}
          </div>
        </div>

        {/* Right: stamp grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 6 }}>
            {Array.from({ length: total }).map((_, i) => {
              const filled = i < stamps_collected;
              return (
                <div key={i} style={{
                  aspectRatio: "1",
                  borderRadius: "50%",
                  border: `2px solid ${filled ? "#000" : "rgba(0,0,0,0.25)"}`,
                  background: filled ? "rgba(0,0,0,0.08)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: SYNE, fontSize: 10,
                  color: filled ? "#000" : "rgba(0,0,0,0.35)",
                  fontWeight: 700,
                }}>
                  {(i + 1).toString().padStart(2, "0")}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Pills row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10 }}>
        <div style={{ border: "0.8px solid #000", borderRadius: 20, padding: "2px 8px", fontFamily: IBM, fontSize: 8, color: "#000", textTransform: "uppercase" }}>
          {business.name}
        </div>
        <div style={{ border: "0.8px solid #000", borderRadius: 20, padding: "2px 8px", fontFamily: IBM, fontSize: 8, color: "#000" }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

type RedeemResult = { ok: boolean; stamps_collected: number; is_completed: boolean; punchcard: UserPunchCard };

export default function AuthenticatePurchase() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [digits, setDigits] = useState<string[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedCard, setSelectedCard] = useState<UserPunchCard | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RedeemResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([Businesses.list(), UserCards.list(authHeaders())]).then(([bizList, cards]) => {
      const withTemplate = bizList.filter(b => b.active_template);
      setBusinesses(withTemplate);
      if (withTemplate.length > 0) {
        setSelectedId(withTemplate[0].id);
        setSelectedCard(cards.find(c => c.business.id === withTemplate[0].id) ?? null);
      }
    });
  }, []);

  function handleKey(key: string) {
    if (key === "DEL") { setDigits(d => d.slice(0, -1)); setError(""); }
    else if (key === "" || key === "+") { /* ignore */ }
    else if (digits.length < 4) { setDigits(d => [...d, key]); setError(""); }
  }

  async function submit() {
    if (digits.length !== 4 || !selectedId) return;
    setLoading(true); setError("");
    try {
      const res = await AuthCodes.redeem(digits.join(""), selectedId, authHeaders());
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid or expired code");
      setDigits([]);
    } finally { setLoading(false); }
  }

  const selectedBusiness = businesses.find(b => b.id === selectedId) ?? null;

  // ── Success screen ──
  if (result && selectedBusiness) {
    const card = result.punchcard;
    const remaining = card.template.total_stamps - result.stamps_collected;
    return (
      <UserLayout>
        <div style={{
          minHeight: "100vh",
          background: "#0E0E0E",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          paddingBottom: 100,
        }}>
          {/* Blurred overlay (Figma: rgba(0,0,0,0.2), blur 60px) */}
          <div style={{
            position: "absolute", inset: 0,
            background: "rgba(0,0,0,0.2)",
            backdropFilter: "blur(60px)",
            pointerEvents: "none",
            zIndex: 0,
          }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 1, width: "100%", padding: "0 20px" }}>
            {/* Business name top */}
            <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: "#F9F9F9", textAlign: "center", paddingTop: 52, marginBottom: 20 }}>
              {selectedBusiness.name}
            </div>

            {/* Stamp progress label */}
            <div style={{ fontFamily: IBM, fontSize: 12, fontWeight: 500, color: "#F9F9F9", textTransform: "uppercase", textAlign: "center", marginBottom: 8, letterSpacing: "0.04em" }}>
              [{result.stamps_collected.toString().padStart(2, "0")}/{card.template.total_stamps.toString().padStart(2, "0")} punches complete.{remaining > 0 ? ` ${remaining} to go!` : " Card complete!"}]
            </div>

            {/* Punchcard */}
            <PunchCardVisual card={card} business={selectedBusiness} />

            {/* PUNCHED! */}
            <div style={{ fontFamily: BITCOUNT, fontWeight: 500, fontSize: 39, color: "#F9F9F9", textTransform: "uppercase", textAlign: "center", lineHeight: 1.1, marginTop: 40 }}>
              punched!
            </div>

            {/* Subtitle */}
            <div style={{ fontFamily: IBM, fontSize: 12, fontWeight: 500, color: "#F9F9F9", textTransform: "uppercase", textAlign: "left", marginTop: 10, lineHeight: 1.3, letterSpacing: "0.04em" }}>
              Thanks for shopping locally &amp; sustainably.
            </div>

            {result.is_completed && (
              <div style={{ marginTop: 16, border: "1px solid rgba(249,249,249,0.4)", borderRadius: 999, padding: "10px 20px", display: "inline-block" }}>
                <span style={{ fontFamily: IBM, fontSize: 10, color: "#F9F9F9", textTransform: "uppercase", letterSpacing: "0.06em" }}>🎁 Reward unlocked</span>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, marginTop: 40 }}>
              <button
                onClick={() => { setResult(null); setDigits([]); }}
                style={{ flex: 1, padding: "14px", borderRadius: 999, border: "1.5px solid rgba(249,249,249,0.3)", background: "transparent", color: "#F9F9F9", fontFamily: IBM, fontSize: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
              >
                Add Another
              </button>
              <button
                onClick={() => navigate("/wallet")}
                style={{ flex: 1, padding: "14px", borderRadius: 999, border: "none", background: "#F9F9F9", color: "#0E0E0E", fontFamily: IBM, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", cursor: "pointer" }}
              >
                My Wallet
              </button>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  // ── Code entry screen ──
  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#0E0E0E", display: "flex", flexDirection: "column", paddingBottom: 80 }}>

        {/* Header */}
        <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#F9F9F9", lineHeight: 1, padding: 0 }}>✕</button>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, fontWeight: 500, color: "#F9F9F9", flex: 1, textAlign: "center", marginRight: 32 }}>
            {selectedBusiness?.name ?? "Select Business"}
          </div>
        </div>

        {/* Instruction */}
        <div style={{ padding: "0 20px 16px", textAlign: "center" }}>
          <div style={{ fontFamily: IBM, fontSize: 9, fontWeight: 500, color: "#F9F9F9", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Ask {selectedBusiness?.name ?? "the business"} for the 4 digit validation code.
          </div>
        </div>

        {/* Business selector */}
        {businesses.length > 1 && (
          <div style={{ padding: "0 20px 12px" }}>
            <select
              value={selectedId ?? ""}
              onChange={async e => {
                const id = Number(e.target.value);
                setSelectedId(id); setDigits([]); setError("");
                const cards = await UserCards.list(authHeaders());
                setSelectedCard(cards.find(c => c.business.id === id) ?? null);
              }}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid rgba(249,249,249,0.2)", background: "rgba(249,249,249,0.06)", color: "#F9F9F9", fontFamily: IBM, fontSize: 11, outline: "none" }}
            >
              {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
        )}

        {/* Punchcard preview */}
        <div style={{ padding: "0 20px 20px" }}>
          {selectedCard && selectedBusiness ? (
            <PunchCardVisual card={selectedCard} business={selectedBusiness} />
          ) : selectedBusiness ? (
            <div style={{ background: "rgba(249,249,249,0.06)", borderRadius: 10, padding: 16, textAlign: "center", fontFamily: IBM, fontSize: 10, color: "rgba(249,249,249,0.4)", textTransform: "uppercase" }}>
              Join this program first
            </div>
          ) : null}
        </div>

        {/* Digit display */}
        <div style={{ padding: "0 20px 10px" }}>
          <div style={{ fontFamily: IBM, fontSize: 9, fontWeight: 500, color: "rgba(249,249,249,0.4)", textTransform: "uppercase", textAlign: "center", letterSpacing: "0.1em", marginBottom: 10 }}>
            Validation Code
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                flex: 1, height: 60, borderRadius: 10,
                background: "rgba(249,249,249,0.08)",
                border: `1.5px solid ${i < digits.length ? "rgba(249,249,249,0.5)" : "rgba(249,249,249,0.15)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: SYNE, fontSize: 28, color: "#F9F9F9",
              }}>
                {digits[i] ?? (i === digits.length ? <span style={{ opacity: 0.3, fontSize: 20 }}>|</span> : "")}
              </div>
            ))}
          </div>
          {error && (
            <div style={{ marginTop: 8, fontFamily: IBM, fontSize: 10, color: "#EF4444", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {error}
            </div>
          )}
        </div>

        {/* PUNCH! button */}
        <div style={{ padding: "8px 20px 0" }}>
          <button
            onClick={submit}
            disabled={digits.length !== 4 || loading}
            style={{
              width: "100%", padding: "15px", borderRadius: 999, border: "none",
              background: digits.length === 4 && !loading ? "#F9F9F9" : "rgba(249,249,249,0.15)",
              color: digits.length === 4 && !loading ? "#0E0E0E" : "rgba(249,249,249,0.3)",
              fontFamily: IBM, fontSize: 12, fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.1em",
              cursor: digits.length === 4 && !loading ? "pointer" : "not-allowed",
              transition: "all 0.15s",
            }}
          >
            {loading ? "..." : "Punch! {;)"}
          </button>
        </div>

        {/* Keypad — iOS style on dark */}
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end" }}>
          <div style={{ width: "100%", padding: "12px 20px 0", background: "#1A1A1A", borderTop: "1px solid rgba(249,249,249,0.06)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
              {KEYS.map(([main, sub], idx) => (
                <button
                  key={idx}
                  onClick={() => main && handleKey(main)}
                  style={{
                    background: "transparent",
                    border: "none",
                    padding: "14px 0 12px",
                    cursor: main ? "pointer" : "default",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
                    borderRadius: 6,
                    transition: "background 0.1s",
                  }}
                  onMouseDown={e => { if (main) (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,249,249,0.1)"; }}
                  onMouseUp={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  onTouchStart={e => { if (main) (e.currentTarget as HTMLButtonElement).style.background = "rgba(249,249,249,0.1)"; }}
                  onTouchEnd={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                  {main === "DEL" ? (
                    <svg width="22" height="16" viewBox="0 0 24 18" fill="none">
                      <path d="M9 3H21a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-6-6 6-6z" stroke="#F9F9F9" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M13 8l4 4M17 8l-4 4" stroke="#F9F9F9" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : main ? (
                    <>
                      <span style={{ fontSize: 24, fontWeight: 300, color: "#F9F9F9", lineHeight: 1, fontFamily: "'Inter', sans-serif" }}>{main}</span>
                      {sub && <span style={{ fontSize: 8, color: "rgba(249,249,249,0.4)", letterSpacing: "0.1em", fontFamily: IBM }}>{sub}</span>}
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
