import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses } from "../api";
import BusinessLayout from "./Layout";

const CATEGORIES = ["Coffee", "Food", "Books", "Fitness", "Beauty", "Retail", "Other"];
const COLOR_PRESETS = [
  { hex: "#6B48FF" }, { hex: "#3F3CA8" }, { hex: "#FF6B35" },
  { hex: "#FF3535" }, { hex: "#00C896" }, { hex: "#FF9B3D" },
  { hex: "#9B59B6" }, { hex: "#27AE60" }, { hex: "#3498DB" }, { hex: "#1A1A2E" },
];

const INPUT: React.CSSProperties = {
  width: "100%", padding: "12px 15px", borderRadius: 11,
  border: "1.5px solid #E5E7EB", fontSize: 15, outline: "none",
  background: "#fff", color: "#1A1A2E",
};
const LABEL: React.CSSProperties = {
  display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7,
};

export default function BusinessProfile() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [form, setForm] = useState({
    name: "", description: "", category: "", address: "",
    logo_color: "#6B48FF", cover_color: "#EDE9FF",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Businesses.getMine(authHeaders())
      .then(b => {
        setForm({
          name: b.name ?? "",
          description: b.description ?? "",
          category: b.category ?? "Coffee",
          address: b.address ?? "",
          logo_color: b.logo_color ?? "#6B48FF",
          cover_color: b.cover_color ?? "#EDE9FF",
        });
        setLoading(false);
      })
      .catch(() => navigate("/business/setup"));
  }, []);

  const upd = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      await Businesses.update(form, authHeaders());
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally { setSaving(false); }
  }

  if (loading) {
    return <BusinessLayout><div style={{ color: "#9CA3AF", textAlign: "center", padding: 80 }}>Loading...</div></BusinessLayout>;
  }

  return (
    <BusinessLayout>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.5px" }}>Business Profile</h1>
        <p style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>Update your business information</p>
      </div>

      {/* Preview banner */}
      <div style={{ height: 120, borderRadius: 20, background: `linear-gradient(135deg, ${form.logo_color}, ${form.logo_color}BB)`, display: "flex", alignItems: "center", padding: "0 32px", marginBottom: 28, boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 28, fontWeight: 800 }}>
          {form.name?.[0]?.toUpperCase() ?? "B"}
        </div>
        <div style={{ marginLeft: 20 }}>
          <div style={{ color: "#fff", fontSize: 22, fontWeight: 800 }}>{form.name || "Business Name"}</div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, marginTop: 3 }}>
            {form.category}{form.address ? ` · ${form.address}` : ""}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
        <form onSubmit={save}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ marginBottom: 20 }}>
              <label style={LABEL}>Business Name</label>
              <input required value={form.name} onChange={e => upd("name", e.target.value)} style={INPUT} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={LABEL}>Category</label>
              <select value={form.category} onChange={e => upd("category", e.target.value)} style={{ ...INPUT, background: "#fff" }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={LABEL}>Description</label>
              <textarea value={form.description} onChange={e => upd("description", e.target.value)} rows={3} style={{ ...INPUT, resize: "vertical", lineHeight: 1.5 }} placeholder="Tell customers what makes your business special..." />
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={LABEL}>Address</label>
              <input value={form.address} onChange={e => upd("address", e.target.value)} placeholder="123 Main St, Pittsburgh, PA" style={INPUT} />
            </div>

            {error && <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#DC2626", fontSize: 14 }}>{error}</div>}
            {saved && <div style={{ background: "#F0FFF4", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#059669", fontSize: 14, fontWeight: 600 }}>✓ Profile updated successfully!</div>}

            <button type="submit" disabled={saving} style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: saving ? "#D1D5DB" : "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* Color picker */}
        <div>
          <div style={{ background: "#fff", borderRadius: 20, padding: "24px 28px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1A1A2E", marginBottom: 16 }}>Brand Color</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {COLOR_PRESETS.map(c => (
                <button
                  key={c.hex} type="button" onClick={() => upd("logo_color", c.hex)}
                  style={{ width: 38, height: 38, borderRadius: "50%", background: c.hex, border: "none", cursor: "pointer", boxShadow: form.logo_color === c.hex ? `0 0 0 3px #fff, 0 0 0 5px ${c.hex}` : "none", transition: "box-shadow 0.15s" }}
                />
              ))}
            </div>
          </div>

          <div style={{ background: "#F8F7FF", borderRadius: 20, padding: "20px 24px", marginTop: 16, border: "1px solid #E0DEFF" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>Tip</div>
            <div style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.6 }}>
              Your brand color appears on punchcards and your business listing. Choose a color that matches your business identity.
            </div>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
