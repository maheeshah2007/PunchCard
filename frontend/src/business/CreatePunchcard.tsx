import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Templates } from "../api";
import BusinessLayout from "./Layout";

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
              fontSize: 14, color: i < filled ? (isLight ? "#1A1A1A" : "#fff") : `${stampColor}88`,
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
                fontSize: f ? 16 : (isLast ? 14 : 10),
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
  const [error, setError] = useState("");
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

  return (
    <BusinessLayout>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.5px" }}>Create Punchcard</h1>
        <p style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>Design your loyalty card program</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }}>
        {/* ── Form ── */}
        <form onSubmit={submit}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Card Name */}
            <div>
              <label style={labelStyle}>Card Name</label>
              <input required value={form.name} onChange={e => upd("name", e.target.value)}
                style={inputStyle} />
            </div>

            {/* Reward */}
            <div>
              <label style={labelStyle}>Reward Description</label>
              <input required value={form.reward_description} onChange={e => upd("reward_description", e.target.value)}
                placeholder="e.g. Free coffee of your choice!"
                style={inputStyle} />
            </div>

            {/* Stamps count */}
            <div>
              <label style={labelStyle}>
                Number of Stamps &nbsp;<span style={{ color: "#3F3CA8", fontWeight: 700 }}>{form.total_stamps}</span>
              </label>
              <input type="range" min={4} max={16} value={form.total_stamps}
                onChange={e => upd("total_stamps", Number(e.target.value))}
                style={{ width: "100%", accentColor: "#3F3CA8" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>
                <span>4</span><span>16</span>
              </div>
            </div>

            {/* Layout */}
            <div>
              <label style={labelStyle}>Layout</label>
              <div style={{ display: "flex", gap: 10 }}>
                {LAYOUTS.map(l => (
                  <button key={l.id} type="button" onClick={() => upd("style", l.id)}
                    style={{ ...chipStyle, ...(form.style === l.id ? chipActive : {}) }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{l.label}</span>
                    <span style={{ fontSize: 11, color: form.style === l.id ? "#3F3CA8" : "#9CA3AF" }}>{l.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card color */}
            <div>
              <label style={labelStyle}>Card Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {CARD_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => upd("card_color", c)}
                    style={{ width: 34, height: 34, borderRadius: "50%", background: c, border: form.card_color === c ? "3px solid #3F3CA8" : "2px solid #E5E7EB", cursor: "pointer", outline: form.card_color === c ? "2px solid #3F3CA8" : "none", outlineOffset: 2 }} />
                ))}
                <input type="color" value={form.card_color} onChange={e => upd("card_color", e.target.value)}
                  title="Custom color"
                  style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #E5E7EB", cursor: "pointer", padding: 2, background: "none" }} />
              </div>
            </div>

            {/* Stamp color */}
            <div>
              <label style={labelStyle}>Stamp Color</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {STAMP_COLORS.map(c => (
                  <button key={c} type="button" onClick={() => upd("stamp_color", c)}
                    style={{ width: 34, height: 34, borderRadius: "50%", background: c, border: form.stamp_color === c ? "3px solid #3F3CA8" : "2px solid #E5E7EB", cursor: "pointer", outline: form.stamp_color === c ? "2px solid #3F3CA8" : "none", outlineOffset: 2 }} />
                ))}
                <input type="color" value={form.stamp_color} onChange={e => upd("stamp_color", e.target.value)}
                  title="Custom color"
                  style={{ width: 34, height: 34, borderRadius: "50%", border: "2px solid #E5E7EB", cursor: "pointer", padding: 2, background: "none" }} />
              </div>
            </div>

            {/* Stamp icon */}
            <div>
              <label style={labelStyle}>Stamp Icon</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {STAMP_EMOJIS.map(e => (
                  <button key={e} type="button" onClick={() => { upd("stamp_icon", e); setCustomEmoji(""); }}
                    style={{ width: 38, height: 38, borderRadius: 10, border: form.stamp_icon === e ? "2px solid #3F3CA8" : "1.5px solid #E5E7EB", background: form.stamp_icon === e ? "#F5F4FF" : "#fff", fontSize: 20, cursor: "pointer" }}>
                    {e}
                  </button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  value={customEmoji}
                  onChange={e => { setCustomEmoji(e.target.value); if (e.target.value) upd("stamp_icon", e.target.value); }}
                  placeholder="Or type any emoji…"
                  maxLength={2}
                  style={{ ...inputStyle, width: 180, fontSize: 18, textAlign: "center" }}
                />
              </div>
            </div>

            {error && <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px 16px", color: "#DC2626", fontSize: 14 }}>{error}</div>}
            {success && <div style={{ background: "#F0FFF4", borderRadius: 10, padding: "12px 16px", color: "#059669", fontSize: 14, fontWeight: 600 }}>✓ Punchcard created! Redirecting...</div>}

            <button type="submit" disabled={loading || success}
              style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: (loading || success) ? "#D1D5DB" : "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: (loading || success) ? "not-allowed" : "pointer" }}>
              {loading ? "Creating..." : success ? "Created!" : "Create Punchcard →"}
            </button>
          </div>
        </form>

        {/* ── Live Preview ── */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 16 }}>Live Preview</div>
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
            <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 12 }}>
              This is how your card appears to customers
            </p>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 };
const inputStyle: React.CSSProperties = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #E5E7EB", fontSize: 14, outline: "none", boxSizing: "border-box" };
const chipStyle: React.CSSProperties = { flex: 1, padding: "12px 14px", borderRadius: 12, border: "1.5px solid #E5E7EB", background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 2 };
const chipActive: React.CSSProperties = { border: "2px solid #3F3CA8", background: "#F5F4FF" };
