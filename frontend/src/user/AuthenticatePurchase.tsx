import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { AuthCodes, Businesses, Business, UserPunchCard, UserCards } from "../api";
import UserLayout from "./Layout";

const MONO = "'Space Mono', monospace";

const KEYS = [
  ["1", ""], ["2", "ABC"], ["3", "DEF"],
  ["4", "GHI"], ["5", "JKL"], ["6", "MNO"],
  ["7", "PQRS"], ["8", "TUV"], ["9", "WXYZ"],
  ["*", ""], ["0", ""], ["DEL", ""],
];

function MiniPunchCard({ card }: { card: UserPunchCard }) {
  const { template, business, stamps_collected } = card;
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 16,
        padding: "14px 16px",
        display: "flex",
        gap: 14,
        alignItems: "center",
        boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
        margin: "0 20px",
      }}
    >
      {/* Left: brand */}
      <div style={{ flexShrink: 0 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontFamily: MONO,
            fontWeight: 700,
          }}
        >
          {business.name[0]}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF", textAlign: "center", marginTop: 4, letterSpacing: "0.05em" }}>
          {business.name.toUpperCase().slice(0, 8)}
        </div>
        <div style={{ fontSize: 9, fontFamily: MONO, color: "#0D0D0D", textAlign: "center", marginTop: 1 }}>
          {stamps_collected}/{template.total_stamps}
        </div>
      </div>
      {/* Right: stamp grid */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontFamily: MONO, color: "#0D0D0D", marginBottom: 6, letterSpacing: "0.04em" }}>
          {template.reward_description}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {Array.from({ length: template.total_stamps }).map((_, i) => (
            <div
              key={i}
              style={{
                width: 20, height: 20, borderRadius: "50%",
                border: i < stamps_collected ? "none" : "1.5px solid #CACACA",
                background: i < stamps_collected ? "#0D0D0D" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, color: "#fff",
              }}
            >
              {i < stamps_collected ? "◉" : ""}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

type RedeemResult = {
  ok: boolean;
  stamps_collected: number;
  is_completed: boolean;
  punchcard: UserPunchCard;
};

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
    Promise.all([
      Businesses.list(),
      UserCards.list(authHeaders()),
    ]).then(([bizList, cards]) => {
      const withTemplate = bizList.filter(b => b.active_template);
      setBusinesses(withTemplate);
      if (withTemplate.length > 0) {
        setSelectedId(withTemplate[0].id);
        const card = cards.find(c => c.business.id === withTemplate[0].id) ?? null;
        setSelectedCard(card);
      }
    });
  }, []);

  function handleKey(key: string) {
    if (key === "DEL") {
      setDigits(d => d.slice(0, -1));
      setError("");
    } else if (key === "*") {
      // ignore
    } else if (digits.length < 4) {
      setDigits(d => [...d, key]);
      setError("");
    }
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

  function selectBusiness(id: number, cards: UserPunchCard[]) {
    setSelectedId(id);
    setSelectedCard(cards.find(c => c.business.id === id) ?? null);
    setDigits([]);
    setError("");
  }

  /* ---- Success screen ---- */
  if (result) {
    return (
      <UserLayout>
        <div style={{ minHeight: "100vh", background: "#0D0D0D", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px 80px" }}>
          <div style={{ textAlign: "center" }}>
            <MiniPunchCard card={result.punchcard} />
            <div style={{ marginTop: 40 }}>
              <div style={{ fontSize: 52, fontWeight: 700, color: "#fff", fontFamily: MONO, letterSpacing: "-1px", marginBottom: 16 }}>
                PUNCHED!
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: MONO, letterSpacing: "0.08em", lineHeight: 1.8 }}>
                THANKS FOR SHOPPING LOCALLY<br />& SUSTAINABLY.
              </div>
              {result.is_completed && (
                <div style={{ marginTop: 20, padding: "10px 20px", borderRadius: 999, border: "1px solid rgba(255,255,255,0.3)", display: "inline-block" }}>
                  <span style={{ color: "#fff", fontSize: 11, fontFamily: MONO, letterSpacing: "0.08em" }}>
                    🎁 REWARD UNLOCKED
                  </span>
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 40 }}>
              <button
                onClick={() => { setResult(null); setDigits([]); }}
                style={{ flex: 1, padding: "15px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.3)", background: "transparent", color: "#fff", fontSize: 12, fontFamily: MONO, letterSpacing: "0.08em", cursor: "pointer" }}
              >
                ADD ANOTHER
              </button>
              <button
                onClick={() => navigate("/wallet")}
                style={{ flex: 1, padding: "15px", borderRadius: 999, border: "none", background: "#fff", color: "#0D0D0D", fontSize: 12, fontFamily: MONO, letterSpacing: "0.08em", cursor: "pointer", fontWeight: 700 }}
              >
                MY WALLET
              </button>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#F5F5F5", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 12, background: "#F5F5F5" }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#0D0D0D", fontFamily: MONO }}>✕</button>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.05em" }}>
            {businesses.find(b => b.id === selectedId)?.name ?? "SELECT BUSINESS"}
          </div>
        </div>

        {/* Punchcard preview */}
        <div style={{ paddingBottom: 16 }}>
          {selectedCard ? (
            <MiniPunchCard card={selectedCard} />
          ) : (
            <div style={{ margin: "0 20px", background: "#fff", borderRadius: 16, padding: "16px", textAlign: "center", fontFamily: MONO, fontSize: 11, color: "#9CA3AF" }}>
              {businesses.find(b => b.id === selectedId)
                ? "JOIN THIS PROGRAM TO START COLLECTING STAMPS"
                : "SELECT A BUSINESS ABOVE"}
            </div>
          )}

          {/* Business selector */}
          {businesses.length > 1 && (
            <div style={{ padding: "10px 20px 0" }}>
              <select
                value={selectedId ?? ""}
                onChange={async e => {
                  const id = Number(e.target.value);
                  const cards = await UserCards.list(authHeaders());
                  selectBusiness(id, cards);
                }}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 12, fontFamily: MONO, outline: "none", background: "#fff" }}
              >
                {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Code display */}
        <div style={{ padding: "12px 20px 8px" }}>
          <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.12em", marginBottom: 10 }}>
            VALIDATION CODE
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {[0, 1, 2, 3].map(i => (
              <div
                key={i}
                style={{
                  flex: 1, height: 72, borderRadius: 14,
                  background: "#fff",
                  border: `2px solid ${digits[i] ? "#0D0D0D" : "#E5E7EB"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 32, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D",
                }}
              >
                {digits[i] ?? ""}
              </div>
            ))}
          </div>

          {error && (
            <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "10px 14px", marginBottom: 10, color: "#DC2626", fontSize: 11, fontFamily: MONO }}>
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={digits.length !== 4 || loading}
            style={{
              width: "100%", padding: "16px", borderRadius: 999, border: "none",
              background: digits.length === 4 && !loading ? "#0D0D0D" : "#D1D5DB",
              color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: MONO,
              letterSpacing: "0.1em", cursor: digits.length === 4 && !loading ? "pointer" : "not-allowed",
            }}
          >
            {loading ? "..." : "PUNCH! {;)"}
          </button>
        </div>

        {/* Phone keypad */}
        <div style={{ flex: 1, background: "#E8E8E8", padding: "12px 20px 80px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {KEYS.map(([main, sub]) => (
              <button
                key={main + sub}
                onClick={() => handleKey(main)}
                style={{
                  background: main === "DEL" ? "#D1D5DB" : "#fff",
                  border: "none",
                  borderRadius: 12,
                  padding: "16px 0 14px",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 1,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                }}
              >
                <span style={{ fontSize: main === "DEL" ? 16 : 22, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", lineHeight: 1 }}>
                  {main === "DEL" ? "⌫" : main === "*" ? "✱" : main}
                </span>
                {sub && (
                  <span style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.1em" }}>
                    {sub}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
}
