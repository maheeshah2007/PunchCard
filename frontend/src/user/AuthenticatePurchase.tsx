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

function PunchCardVisual({ card, business }: { card: UserPunchCard; business: Business }) {
  const { template, stamps_collected } = card;
  const total = template.total_stamps;
  return (
    <div style={{ background: "#fff", borderRadius: 18, padding: "14px 14px 12px", margin: "0 16px", boxShadow: "0 2px 16px rgba(0,0,0,0.08)", border: "1px solid #F0F0F0" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0, width: 64, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: "#F5F5F5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, border: "1.5px solid #E8E8E8" }}>
            {CAT_EMOJI[business.category ?? ""] ?? business.name[0].toUpperCase()}
          </div>
          <div style={{ fontSize: 7, fontFamily: MONO, color: "#9CA3AF", textAlign: "center", letterSpacing: "0.04em", lineHeight: 1.4 }}>
            {business.name.toUpperCase().slice(0, 10)}
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#0D0D0D", marginBottom: 10, letterSpacing: "0.02em", lineHeight: 1.5 }}>
            {template.reward_description}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
            {Array.from({ length: total }).map((_, i) => {
              const filled = i < stamps_collected;
              return (
                <div key={i} style={{ aspectRatio: "1", borderRadius: "50%", background: filled ? "#C8A882" : "#F5F5F5", border: filled ? "none" : "1px solid #E0E0E0", display: "flex", alignItems: "center", justifyContent: "center", fontSize: filled ? 12 : 8, fontFamily: MONO, color: filled ? "#fff" : "#ACACAC" }}>
                  {filled ? "◉" : (i + 1).toString().padStart(2, "0")}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, paddingTop: 8, borderTop: "1px solid #F5F5F5" }}>
        <div style={{ fontSize: 7, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.06em" }}>{business.name.toUpperCase()}</div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#0D0D0D", fontWeight: 700 }}>{stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}</div>
      </div>
    </div>
  );
}

function StudentRunSection({ businesses, currentId }: { businesses: Business[]; currentId: number }) {
  const navigate = useNavigate();
  const others = businesses.filter(b => b.id !== currentId).slice(0, 4);
  if (others.length === 0) return null;
  return (
    <div style={{ background: "#fff", padding: "20px 16px 24px", borderTop: "8px solid #F5F5F5" }}>
      <div style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, color: "#0D0D0D", letterSpacing: "0.12em", marginBottom: 14 }}>STUDENT-RUN</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {others.map(biz => (
          <div key={biz.id} onClick={() => navigate(`/businesses/${biz.id}`)} style={{ borderRadius: 14, overflow: "hidden", cursor: "pointer", background: "#F5F5F5" }}>
            <div style={{ height: 72, background: `linear-gradient(135deg, ${biz.logo_color}22, ${biz.logo_color}55)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>
              {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
            </div>
            <div style={{ padding: "7px 9px 9px" }}>
              <div style={{ fontSize: 9, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{biz.name}</div>
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

  if (result) {
    return (
      <UserLayout>
        <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px 80px" }}>
          <div style={{ textAlign: "center" }}>
            {selectedBusiness && <PunchCardVisual card={result.punchcard} business={selectedBusiness} />}
            <div style={{ marginTop: 40 }}>
              <div style={{ fontSize: 42, fontWeight: 700, color: "#fff", fontFamily: MONO, letterSpacing: "-1px", marginBottom: 14 }}>PUNCHED!</div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", fontFamily: MONO, letterSpacing: "0.08em", lineHeight: 1.8 }}>THANKS FOR SHOPPING LOCALLY<br />& SUSTAINABLY.</div>
              {result.is_completed && (
                <div style={{ marginTop: 18, padding: "10px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", display: "inline-block" }}>
                  <span style={{ color: "#fff", fontSize: 10, fontFamily: MONO, letterSpacing: "0.08em" }}>🎁 REWARD UNLOCKED</span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 40 }}>
              <button onClick={() => { setResult(null); setDigits([]); }} style={{ flex: 1, padding: "14px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 10, fontFamily: MONO, letterSpacing: "0.08em", cursor: "pointer" }}>ADD ANOTHER</button>
              <button onClick={() => navigate("/wallet")} style={{ flex: 1, padding: "14px", borderRadius: 999, border: "none", background: "#fff", color: "#0D0D0D", fontSize: 10, fontFamily: MONO, letterSpacing: "0.08em", cursor: "pointer", fontWeight: 700 }}>MY WALLET</button>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#F5F5F5", display: "flex", flexDirection: "column" }}>
        <div style={{ background: "#fff", padding: "52px 16px 12px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #F0F0F0" }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#0D0D0D", fontFamily: MONO }}>✕</button>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D" }}>{selectedBusiness?.name ?? "SELECT BUSINESS"}</div>
        </div>

        <div style={{ background: "#fff", padding: "8px 16px 14px" }}>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.08em" }}>
            ASK {selectedBusiness?.name?.toUpperCase() ?? "THE BUSINESS"} FOR THE 4 DIGIT VALIDATION CODE.
          </div>
        </div>

        <div style={{ background: "#fff", paddingBottom: 14 }}>
          {selectedCard && selectedBusiness ? (
            <PunchCardVisual card={selectedCard} business={selectedBusiness} />
          ) : (
            <div style={{ margin: "0 16px", background: "#F5F5F5", borderRadius: 14, padding: "16px", textAlign: "center", fontFamily: MONO, fontSize: 10, color: "#9CA3AF" }}>
              {selectedBusiness ? "JOIN THIS PROGRAM TO START COLLECTING STAMPS" : "SELECT A BUSINESS"}
            </div>
          )}
          {businesses.length > 1 && (
            <div style={{ padding: "10px 16px 0" }}>
              <select value={selectedId ?? ""} onChange={async e => { const id = Number(e.target.value); setSelectedId(id); setDigits([]); setError(""); const cards = await UserCards.list(authHeaders()); setSelectedCard(cards.find(c => c.business.id === id) ?? null); }} style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 11, fontFamily: MONO, outline: "none", background: "#fff" }}>
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
        </div>

        <div style={{ background: "#F5F5F5", padding: "14px 16px 6px" }}>
          <div style={{ fontSize: 9, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.12em" }}>VALIDATION CODE</div>
        </div>

        <div style={{ background: "#F5F5F5", padding: "8px 16px 10px" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{ flex: 1, height: 64, borderRadius: 12, background: "#fff", border: `2px solid ${digits[i] ? "#0D0D0D" : "#E5E7EB"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D" }}>
                {digits[i] ?? ""}
              </div>
            ))}
          </div>
          {error && <div style={{ marginTop: 8, background: "#FEF2F2", borderRadius: 8, padding: "8px 12px", color: "#DC2626", fontSize: 10, fontFamily: MONO }}>{error}</div>}
        </div>

        <div style={{ background: "#F5F5F5", padding: "0 16px 10px" }}>
          <button onClick={submit} disabled={digits.length !== 4 || loading} style={{ width: "100%", padding: "15px", borderRadius: 999, border: "none", background: digits.length === 4 && !loading ? "#0D0D0D" : "#D1D5DB", color: "#fff", fontSize: 12, fontWeight: 700, fontFamily: MONO, letterSpacing: "0.1em", cursor: digits.length === 4 && !loading ? "pointer" : "not-allowed" }}>
            {loading ? "..." : "PUNCH! {;)"}
          </button>
        </div>

        <div style={{ background: "#E8E8E8", padding: "10px 16px 14px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
            {KEYS.map(([main, sub]) => (
              <button key={main + sub} onClick={() => handleKey(main)} style={{ background: main === "DEL" ? "#D1D5DB" : "#fff", border: "none", borderRadius: 10, padding: "14px 0 12px", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
                <span style={{ fontSize: main === "DEL" ? 15 : 20, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", lineHeight: 1 }}>{main === "DEL" ? "⌫" : main === "+" ? "✱" : main}</span>
                {sub && <span style={{ fontSize: 7, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.1em" }}>{sub}</span>}
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
