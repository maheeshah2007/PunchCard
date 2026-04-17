import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthCodes, Businesses, Business, UserPunchCard, UserCards } from "../api";
import UserLayout from "./Layout";

const MONO = "'Space Mono', monospace";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💇", Retail: "🛍️", Other: "🏪",
};

const KEYS = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["+", "* #"], ["0", ""], ["DEL", ""],
];

/* ── Exact punchcard visual matching frame-137 ── */
function PunchCardVisual({ card, business }: { card: UserPunchCard; business: Business }) {
  const { template, stamps_collected } = card;
  const total = template.total_stamps;

  return (
    <div style={{
      background: "#fff",
      borderRadius: 16,
      padding: "14px 12px 10px",
      margin: "0 16px",
      border: "1px solid #E0E0E0",
      boxShadow: "0 1px 8px rgba(0,0,0,0.06)",
    }}>
      <div style={{ display: "flex", gap: 10 }}>
        {/* Left: logo + name + reward */}
        <div style={{ width: 88, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <div style={{
            width: 72, height: 72, borderRadius: 14,
            background: "#F5F0F0", border: "1px solid #E8E0E0",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36, marginBottom: 6,
          }}>
            {CAT_EMOJI[business.category ?? ""] ?? business.name[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 9, fontFamily: "'Space Mono', monospace", fontWeight: 700, color: "#1A1A1A", lineHeight: 1.3, marginBottom: 4 }}>
            {business.name}
          </div>
          <div style={{ fontSize: 8, fontFamily: MONO, color: "#6B7280", lineHeight: 1.4, flex: 1 }}>
            {template.reward_description}
          </div>
        </div>

        {/* Right: 3×3 stamp grid */}
        <div style={{ flex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {Array.from({ length: total }).map((_, i) => {
              const filled = i < stamps_collected;
              return (
                <div key={i} style={{
                  aspectRatio: "1",
                  borderRadius: "50%",
                  background: filled ? "#C8A090" : "#F8F8F8",
                  border: `1.5px solid ${filled ? "#C8A090" : "#DEDEDE"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: filled ? 13 : 9,
                  fontFamily: MONO,
                  color: filled ? "#fff" : "#ACACAC",
                  fontWeight: 700,
                }}>
                  {filled ? "◉" : (i + 1).toString().padStart(2, "0")}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 6, borderTop: "1px solid #F0F0F0" }}>
        <div style={{ fontSize: 7, fontFamily: MONO, color: "#9CA3AF", background: "#F5F5F5", padding: "3px 8px", borderRadius: 999, border: "1px solid #E5E5E5" }}>
          {business.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 9, fontFamily: MONO, color: "#1A1A1A", fontWeight: 700 }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

/* ── Student-run section below keypad ── */
function StudentRunSection({ businesses, currentId }: { businesses: Business[]; currentId: number }) {
  const navigate = useNavigate();
  const others = businesses.filter(b => b.id !== currentId).slice(0, 4);
  if (others.length === 0) return null;
  return (
    <div style={{ background: "#fff", padding: "16px 16px 24px", borderTop: "8px solid #F0F0F0" }}>
      <div style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, color: "#0D0D0D", letterSpacing: "0.1em", marginBottom: 12 }}>STUDENT-RUN</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {others.map(biz => (
          <div key={biz.id} onClick={() => navigate(`/businesses/${biz.id}`)} style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer", background: "#F5F5F5" }}>
            <div style={{ height: 70, background: `linear-gradient(135deg, ${biz.logo_color}33, ${biz.logo_color}66)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
              {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
            </div>
            <div style={{ padding: "7px 9px 9px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biz.name}</div>
              <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF" }}>★ {biz.rating} rating</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

type RedeemResult = { ok: boolean; stamps_collected: number; is_completed: boolean; punchcard: UserPunchCard; };

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
    else if (key === "+") { /* ignore */ }
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

  /* ── Success screen ── */
  if (result) {
    return (
      <UserLayout>
        <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px 80px" }}>
          <div style={{ textAlign: "center", width: "100%" }}>
            {selectedBusiness && <PunchCardVisual card={result.punchcard} business={selectedBusiness} />}
            <div style={{ marginTop: 40 }}>
              <div style={{ fontSize: 42, fontWeight: 700, color: "#fff", fontFamily: MONO, letterSpacing: "-1px", marginBottom: 14 }}>PUNCHED!</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: MONO, letterSpacing: "0.08em", lineHeight: 1.8 }}>
                THANKS FOR SHOPPING LOCALLY<br />& SUSTAINABLY.
              </div>
              {result.is_completed && (
                <div style={{ marginTop: 18, padding: "10px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", display: "inline-block" }}>
                  <span style={{ color: "#fff", fontSize: 10, fontFamily: MONO }}>🎁 REWARD UNLOCKED</span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 40 }}>
              <button onClick={() => { setResult(null); setDigits([]); }} style={{ flex: 1, padding: "14px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 10, fontFamily: MONO, cursor: "pointer" }}>ADD ANOTHER</button>
              <button onClick={() => navigate("/wallet")} style={{ flex: 1, padding: "14px", borderRadius: 999, border: "none", background: "#fff", color: "#0D0D0D", fontSize: 10, fontFamily: MONO, cursor: "pointer", fontWeight: 700 }}>MY WALLET</button>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div style={{ background: "#fff", display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ padding: "52px 16px 10px", display: "flex", alignItems: "center", gap: 14 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#0D0D0D", fontFamily: MONO, lineHeight: 1 }}>✕</button>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0D0D0D", fontFamily: MONO }}>
            {selectedBusiness?.name ?? "Select Business"}
          </div>
        </div>

        {/* Instruction */}
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.06em", fontStyle: "italic" }}>
            ASK {selectedBusiness?.name?.toUpperCase() ?? "THE BUSINESS"} FOR THE 4 DIGIT VALIDATION CODE.
          </div>
        </div>

        {/* Punchcard preview */}
        <div style={{ paddingBottom: 14 }}>
          {selectedCard && selectedBusiness ? (
            <PunchCardVisual card={selectedCard} business={selectedBusiness} />
          ) : (
            <div style={{ margin: "0 16px", background: "#F8F8F8", borderRadius: 14, padding: "16px", textAlign: "center", fontFamily: MONO, fontSize: 10, color: "#9CA3AF" }}>
              {selectedBusiness ? "JOIN THIS PROGRAM FIRST" : "SELECT A BUSINESS"}
            </div>
          )}
          {businesses.length > 1 && (
            <div style={{ padding: "10px 16px 0" }}>
              <select value={selectedId ?? ""} onChange={async e => { const id = Number(e.target.value); setSelectedId(id); setDigits([]); setError(""); const cards = await UserCards.list(authHeaders()); setSelectedCard(cards.find(c => c.business.id === id) ?? null); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #E0E0E0", fontSize: 11, fontFamily: MONO, outline: "none", background: "#fff" }}>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* VALIDATION CODE label */}
        <div style={{ padding: "6px 16px 8px", background: "#F8F8F8" }}>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.12em", textAlign: "center" }}>VALIDATION CODE</div>
        </div>

        {/* Digit boxes — light gray, matching frame-137 */}
        <div style={{ background: "#F8F8F8", padding: "10px 20px 12px" }}>
          <div style={{ display: "flex", gap: 10 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                flex: 1, height: 60, borderRadius: 14,
                background: "#EEEEEE",
                border: "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 28, fontWeight: 700, fontFamily: MONO, color: "#1A1A1A",
              }}>
                {i === 0 && digits.length === 0 ? <span style={{ color: "#ACACAC", fontWeight: 300, fontSize: 20 }}>|</span> : (digits[i] ?? "")}
              </div>
            ))}
          </div>
          {error && <div style={{ marginTop: 8, background: "#FEF2F2", borderRadius: 8, padding: "8px 12px", color: "#DC2626", fontSize: 10, fontFamily: MONO, textAlign: "center" }}>{error}</div>}
        </div>

        {/* PUNCH! button */}
        <div style={{ background: "#F8F8F8", padding: "0 20px 14px" }}>
          <button
            onClick={submit}
            disabled={digits.length !== 4 || loading}
            style={{
              width: "100%", padding: "15px", borderRadius: 999, border: "none",
              background: digits.length === 4 && !loading ? "#555555" : "#CACACA",
              color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: MONO,
              letterSpacing: "0.08em", cursor: digits.length === 4 && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "..." : "PUNCH! {;)"}
          </button>
        </div>

        {/* Phone keypad — white keys on gray bg */}
        <div style={{ background: "#D1D1D6", padding: "8px 6px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
            {KEYS.map(([main, sub]) => (
              <button
                key={main + sub}
                onClick={() => handleKey(main)}
                style={{
                  background: main === "DEL" ? "#ADB5BD" : "#fff",
                  border: "none", borderRadius: 10,
                  padding: "16px 0 13px",
                  cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 0,
                  boxShadow: "0 1px 0 rgba(0,0,0,0.2)",
                }}
              >
                <span style={{ fontSize: main === "DEL" ? 17 : 22, fontWeight: 400, color: "#0D0D0D", lineHeight: 1 }}>
                  {main === "DEL" ? "⌫" : main === "+" ? "✱" : main}
                </span>
                {sub && <span style={{ fontSize: 8, color: "#6B7280", letterSpacing: "0.08em", marginTop: 2 }}>{sub}</span>}
              </button>
            ))}
          </div>
        </div>

        <StudentRunSection businesses={businesses} currentId={selectedId ?? 0} />
        <div style={{ height: 80 }} />
      </div>
    </UserLayout>
  );
}
