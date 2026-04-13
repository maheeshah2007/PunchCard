import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses } from "../api";

const CATEGORIES = ["Coffee", "Food", "Books", "Fitness", "Beauty", "Retail", "Other"];

const COLOR_PRESETS = [
  { hex: "#6B48FF" }, { hex: "#3F3CA8" }, { hex: "#FF6B35" },
  { hex: "#FF3535" }, { hex: "#00C896" }, { hex: "#FF9B3D" },
  { hex: "#9B59B6" }, { hex: "#27AE60" }, { hex: "#3498DB" }, { hex: "#1A1A2E" },
];

const INPUT: React.CSSProperties = {
  width: "100%", padding: "13px 16px", borderRadius: 12,
  border: "1.5px solid #E5E7EB", fontSize: 15, outline: "none",
  background: "#fff", color: "#1A1A2E",
};
const LABEL: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7,
};

export default function BusinessSetup() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "", description: "", category: "Coffee",
    address: "", logo_color: "#6B48FF", cover_color: "#EDE9FF",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function submit() {
    setLoading(true); setError("");
    try {
      await Businesses.create(form, authHeaders());
      navigate("/business/punchcard/create");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally { setLoading(false); }
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #1E1C5E 0%, #3F3CA8 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 40px 36px", width: "100%", maxWidth: 540, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg, #3F3CA8, #252178)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 22, fontWeight: 800 }}>N</div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1A1A2E" }}>Set up your business</h1>
            <p style={{ fontSize: 13, color: "#9CA3AF" }}>Step {step} of 2</p>
          </div>
        </div>

        {/* Progress */}
        <div style={{ height: 4, background: "#F0F0F0", borderRadius: 999, marginBottom: 28, overflow: "hidden" }}>
          <div style={{ height: "100%", background: "linear-gradient(90deg, #3F3CA8, #6B48FF)", width: step === 1 ? "50%" : "100%", transition: "width 0.4s", borderRadius: 999 }} />
        </div>

        {step === 1 && (
          <div>
            <div style={{ marginBottom: 18 }}>
              <label style={LABEL}>Business Name *</label>
              <input value={form.name} onChange={e => upd("name", e.target.value)} placeholder="e.g. Brew & Bloom Coffee" style={INPUT} required />
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={LABEL}>Category *</label>
              <select value={form.category} onChange={e => upd("category", e.target.value)} style={{ ...INPUT, background: "#fff" }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 18 }}>
              <label style={LABEL}>Description</label>
              <textarea value={form.description} onChange={e => upd("description", e.target.value)} placeholder="What makes your business special?" rows={3} style={{ ...INPUT, resize: "vertical", lineHeight: 1.5 }} />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={LABEL}>Address</label>
              <input value={form.address} onChange={e => upd("address", e.target.value)} placeholder="123 Main St, Pittsburgh, PA" style={INPUT} />
            </div>
            <button onClick={() => { if (form.name.trim()) setStep(2); }} disabled={!form.name.trim()} style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: form.name.trim() ? "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)" : "#E5E7EB", color: form.name.trim() ? "#fff" : "#9CA3AF", fontSize: 15, fontWeight: 700, cursor: form.name.trim() ? "pointer" : "not-allowed" }}>
              Continue →
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            {/* Preview */}
            <div style={{ height: 96, borderRadius: 16, background: `linear-gradient(135deg, ${form.logo_color}, ${form.logo_color}BB)`, display: "flex", alignItems: "center", padding: "0 24px", marginBottom: 24 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 24, fontWeight: 800 }}>
                {form.name[0] ?? "B"}
              </div>
              <div style={{ marginLeft: 16 }}>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>{form.name}</div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>{form.category}</div>
              </div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={LABEL}>Brand Color</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {COLOR_PRESETS.map(c => (
                  <button key={c.hex} type="button" onClick={() => upd("logo_color", c.hex)} style={{ width: 38, height: 38, borderRadius: "50%", background: c.hex, border: "none", cursor: "pointer", boxShadow: form.logo_color === c.hex ? `0 0 0 3px #fff, 0 0 0 5px ${c.hex}` : "none", transition: "box-shadow 0.15s" }} />
                ))}
              </div>
            </div>

            {error && <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#DC2626", fontSize: 14 }}>{error}</div>}

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setStep(1)} style={{ flex: 1, padding: "15px", borderRadius: 13, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
                ← Back
              </button>
              <button onClick={submit} disabled={loading} style={{ flex: 2, padding: "15px", borderRadius: 13, border: "none", background: loading ? "#D1D5DB" : "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Creating..." : "Create Business →"}
              </button>
            </div>
            <p style={{ textAlign: "center", fontSize: 12, color: "#9CA3AF", marginTop: 12 }}>Next: design your loyalty punchcard</p>
          </div>
        )}
      </div>
    </div>
  );
}
