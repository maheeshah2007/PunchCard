import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Templates } from "../api";

const PIXEL = "'Press Start 2P', monospace";
const MONO  = "'Space Mono', monospace";

const BG_STYLE: React.CSSProperties = {
  minHeight: "100vh",
  background: "#2D2D2D",
  backgroundImage: [
    "radial-gradient(ellipse 65% 75% at 10% 50%, rgba(155,155,155,0.35) 0%, transparent 65%)",
    "radial-gradient(ellipse 45% 55% at 90% 15%, rgba(110,110,110,0.25) 0%, transparent 65%)",
  ].join(", "),
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "center",
  padding: "40px 32px",
  boxSizing: "border-box",
  overflowY: "auto",
};

const CARD_COLORS = [
  "#1A1A1A", "#3F3CA8", "#1D4ED8", "#0F766E",
  "#7C3AED", "#BE185D", "#B45309", "#166534",
];

const STAMP_COLORS = [
  "#C8A090", "#EF4444", "#F97316", "#EAB308",
  "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899",
  "#ffffff", "#1A1A1A",
];

const STAMP_EMOJIS = [
  "☕", "🍕", "🍔", "🍜", "🍣", "🍰", "🧋",
  "📚", "💪", "💇", "✂️", "🛍️", "🌿", "🎵",
  "⭐", "❤️", "🔥", "🎯", "✿", "◉",
];

const LAYOUTS = [
  { id: "grid", label: "Grid", desc: "3 × 3 circles" },
  { id: "row",  label: "Row",  desc: "Single row" },
];

function LivePreview({
  name, reward, total, cardColor, stampColor, stampIcon, layout, filled,
}: {
  name: string; reward: string; total: number;
  cardColor: string; stampColor: string; stampIcon: string;
  layout: string; filled: number;
}) {
  const stamps = Array.from({ length: Math.min(total, layout === "row" ? 10 : 9) });
  const isLight = ["#ffffff", "#EAB308", "#F97316"].includes(stampColor);
  const cardTextColor = cardColor === "#ffffff" ? "#1A1A1A" : "#fff";

  return (
    <div style={{ borderRadius: 20, padding: "22px 18px", background: cardColor, color: cardTextColor, boxShadow: "0 4px 24px rgba(0,0,0,0.18)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 3, fontWeight: 600, letterSpacing: "0.06em" }}>YOUR BUSINESS</div>
          <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.3px" }}>{name || "Loyalty Card"}</div>
        </div>
        <div style={{ width: 38, height: 38, borderRadius: "50%", border: `2.5px solid ${stampColor}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
          {stampIcon}
        </div>
      </div>

      {/* Stamps */}
      {layout === "row" ? (
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
          {stamps.map((_, i) => (
            <div key={i} style={{
              width: 32, height: 32, borderRadius: "50%",
              background: i < filled ? stampColor : "transparent",
              border: `2px solid ${i < filled ? stampColor : `${stampColor}55`}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: i < filled ? 18 : 0, color: i < filled ? (isLight ? "#1A1A1A" : "#fff") : `${stampColor}88`,
            }}>
              {i < filled ? stampIcon : ""}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 18 }}>
          {stamps.map((_, i) => {
            const f = i < filled;
            const isLast = i === stamps.length - 1;
            return (
              <div key={i} style={{
                aspectRatio: "1", borderRadius: "50%",
                background: f ? stampColor : "transparent",
                border: `2px solid ${f ? stampColor : `${cardTextColor}33`}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: f ? 26 : (isLast ? 18 : 10),
                color: f ? (isLight ? "#1A1A1A" : "#fff") : (isLast ? `${cardTextColor}30` : `${cardTextColor}60`),
                fontWeight: 700,
              }}>
                {f ? stampIcon : (isLast ? stampIcon : (i + 1).toString().padStart(2, "0"))}
              </div>
            );
          })}
        </div>
      )}

      {/* Divider */}
      <div style={{ height: 1, background: `${cardTextColor}20`, marginBottom: 14 }} />

      {/* Reward */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 3, fontWeight: 600, letterSpacing: "0.06em" }}>REWARD</div>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{reward || "Your reward here"}</div>
      </div>

      {/* Progress */}
      <div>
        <div style={{ fontSize: 10, opacity: 0.6, marginBottom: 6 }}>{filled} of {total} stamps</div>
        <div style={{ height: 4, background: `${cardTextColor}20`, borderRadius: 999 }}>
          <div style={{ height: "100%", background: stampColor, width: `${(filled / total) * 100}%`, borderRadius: 999 }} />
        </div>
      </div>
    </div>
  );
}

export default function CreatePunchcard() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [form, setForm] = useState({
    name: "Loyalty Card",
    total_stamps: 9,
    reward_description: "",
    style: "grid",
    card_color: "#1A1A1A",
    stamp_color: "#C8A090",
    stamp_icon: "☕",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState(false);
  const [customEmoji, setCustomEmoji] = useState("");

  const upd = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));
  const previewFilled = Math.ceil(form.total_stamps * 0.45);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await Templates.create({ ...form, total_stamps: Number(form.total_stamps) }, authHeaders());
      setSuccess(true);
      setTimeout(() => navigate("/business/dashboard"), 1500);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create punchcard");
    } finally { setLoading(false); }
  }

  /* ── shared label style for the dark right panel ── */
  const darkLabel: React.CSSProperties = {
    display: "block",
    fontFamily: MONO,
    fontSize: 10,
    color: "#D0D0D0",
    letterSpacing: "0.08em",
    marginBottom: 8,
  };

  const underlineInput: React.CSSProperties = {
    width: "100%",
    padding: "10px 0",
    border: "none",
    borderBottom: "1.5px solid #6A6A6A",
    background: "transparent",
    fontFamily: MONO,
    fontSize: 13,
    color: "#F0F0F0",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={BG_STYLE}>
      <div style={{
        background: "#CACACA",
        borderRadius: 24,
        padding: "44px 40px",
        width: "100%",
        maxWidth: 960,
        boxSizing: "border-box",
      }}>
        {/* Page heading */}
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontFamily: PIXEL, fontSize: 18, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.7 }}>
            GENERATE YOUR PUNCHCARD
          </div>
        </div>
        <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "#4B4B4B", marginBottom: 32 }}>
          CREATE A CUSTOMIZED PUNCHCARD FOR YOUR AUDIENCE
        </div>

        {/* Two sub-panels side by side */}
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, alignItems: "start", marginBottom: 28 }}>

            {/* ── LEFT: Live Preview ── */}
            <div style={{ background: "#9A9A9A", borderRadius: 14, padding: "28px 24px" }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: "#3A3A3A", letterSpacing: "0.08em", marginBottom: 16 }}>
                LIVE PREVIEW
              </div>
              <LivePreview
                name={form.name}
                reward={form.reward_description}
                total={form.total_stamps}
                cardColor={form.card_color}
                stampColor={form.stamp_color}
                stampIcon={form.stamp_icon}
                layout={form.style}
                filled={previewFilled}
              />
              <p style={{ fontSize: 10, fontFamily: MONO, color: "#5A5A5A", textAlign: "center", marginTop: 14, letterSpacing: "0.04em" }}>
                THIS IS HOW YOUR CARD APPEARS TO CUSTOMERS
              </p>
            </div>

            {/* ── RIGHT: Form fields ── */}
            <div style={{ background: "#9A9A9A", borderRadius: 14, padding: "28px 24px", display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Card Name */}
              <div>
                <label style={darkLabel}>CARD NAME</label>
                <input
                  required
                  value={form.name}
                  onChange={e => upd("name", e.target.value)}
                  placeholder="CARD NAME"
                  style={underlineInput}
                />
              </div>

              {/* Reward Description */}
              <div>
                <label style={darkLabel}>REWARD DESCRIPTION</label>
                <input
                  required
                  value={form.reward_description}
                  onChange={e => upd("reward_description", e.target.value)}
                  placeholder="E.G. FREE COFFEE OF YOUR CHOICE!"
                  style={underlineInput}
                />
              </div>

              {/* Stamps slider */}
              <div>
                <label style={darkLabel}>
                  NUMBER OF STAMPS &nbsp;
                  <span style={{ color: "#F0F0F0", fontWeight: 700 }}>{form.total_stamps}</span>
                </label>
                <input
                  type="range" min={4} max={16}
                  value={form.total_stamps}
                  onChange={e => upd("total_stamps", Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#1A1A1A" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 10, color: "#AAAAAA", marginTop: 2 }}>
                  <span>4</span><span>16</span>
                </div>
              </div>

              {/* Layout toggle */}
              <div>
                <label style={darkLabel}>LAYOUT</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {LAYOUTS.map(l => (
                    <button
                      key={l.id} type="button"
                      onClick={() => upd("style", l.id)}
                      style={{
                        flex: 1, padding: "10px 12px", borderRadius: 10,
                        border: form.style === l.id ? "2px solid #1A1A1A" : "1.5px solid #7A7A7A",
                        background: form.style === l.id ? "#1A1A1A" : "transparent",
                        cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2,
                      }}
                    >
                      <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 700, color: form.style === l.id ? "#fff" : "#D0D0D0" }}>{l.label}</span>
                      <span style={{ fontFamily: MONO, fontSize: 9, color: form.style === l.id ? "#AAAAFF" : "#888888" }}>{l.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Card color swatches */}
              <div>
                <label style={darkLabel}>CARD COLOR</label>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {CARD_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => upd("card_color", c)}
                      style={{
                        width: 30, height: 30, borderRadius: "50%", background: c,
                        border: form.card_color === c ? "3px solid #F0F0F0" : "2px solid #6A6A6A",
                        cursor: "pointer", outline: form.card_color === c ? "2px solid #F0F0F0" : "none",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                  <input type="color" value={form.card_color} onChange={e => upd("card_color", e.target.value)}
                    title="Custom color"
                    style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid #6A6A6A", cursor: "pointer", padding: 2, background: "none" }}
                  />
                </div>
              </div>

              {/* Stamp color swatches */}
              <div>
                <label style={darkLabel}>STAMP COLOR</label>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {STAMP_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => upd("stamp_color", c)}
                      style={{
                        width: 30, height: 30, borderRadius: "50%", background: c,
                        border: form.stamp_color === c ? "3px solid #F0F0F0" : "2px solid #6A6A6A",
                        cursor: "pointer", outline: form.stamp_color === c ? "2px solid #F0F0F0" : "none",
                        outlineOffset: 2,
                      }}
                    />
                  ))}
                  <input type="color" value={form.stamp_color} onChange={e => upd("stamp_color", e.target.value)}
                    title="Custom color"
                    style={{ width: 30, height: 30, borderRadius: "50%", border: "2px solid #6A6A6A", cursor: "pointer", padding: 2, background: "none" }}
                  />
                </div>
              </div>

              {/* Emoji picker */}
              <div>
                <label style={darkLabel}>STAMP ICON</label>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                  {STAMP_EMOJIS.map(e => (
                    <button key={e} type="button"
                      onClick={() => { upd("stamp_icon", e); setCustomEmoji(""); }}
                      style={{
                        width: 34, height: 34, borderRadius: 8,
                        border: form.stamp_icon === e ? "2px solid #F0F0F0" : "1.5px solid #7A7A7A",
                        background: form.stamp_icon === e ? "#1A1A1A" : "transparent",
                        fontSize: 18, cursor: "pointer",
                      }}
                    >
                      {e}
                    </button>
                  ))}
                </div>
                <input
                  value={customEmoji}
                  onChange={e => { setCustomEmoji(e.target.value); if (e.target.value) upd("stamp_icon", e.target.value); }}
                  placeholder="OR TYPE ANY EMOJI…"
                  maxLength={2}
                  style={{ ...underlineInput, width: 180, fontSize: 18, textAlign: "center" }}
                />
              </div>
            </div>
          </div>

          {error && (
            <div style={{
              background: "#FEE2E2", borderRadius: 8,
              padding: "10px 14px", color: "#DC2626",
              fontFamily: MONO, fontSize: 11, marginBottom: 16,
            }}>
              {error}
            </div>
          )}
          {success && (
            <div style={{
              background: "#D1FAE5", borderRadius: 8,
              padding: "10px 14px", color: "#059669",
              fontFamily: MONO, fontSize: 11, fontWeight: 700, marginBottom: 16,
            }}>
              PUNCHCARD CREATED! REDIRECTING...
            </div>
          )}

          {/* CREATE PUNCHCARD button — full width, below panels */}
          <button
            type="submit"
            disabled={loading || success}
            style={{
              width: "100%", padding: "18px", borderRadius: 999, border: "none",
              background: loading || success ? "#9A9A9A" : "#1A1A1A",
              color: "#fff", fontFamily: MONO, fontSize: 12,
              fontWeight: 700, letterSpacing: "0.12em",
              cursor: loading || success ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "CREATING..." : success ? "CREATED!" : "CREATE PUNCHCARD"}
          </button>
        </form>
      </div>
    </div>
  );
}
