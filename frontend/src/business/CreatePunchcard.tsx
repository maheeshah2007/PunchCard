import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Templates } from "../api";
import BusinessLayout from "./Layout";

const STYLES = [
  { id: "classic", label: "Classic", icon: "⭕" },
  { id: "star",    label: "Star",    icon: "⭐" },
  { id: "heart",   label: "Heart",   icon: "❤️" },
  { id: "coffee",  label: "Coffee",  icon: "☕" },
];

function StampGrid({ icon, total, filled }: { icon: string; total: number; filled: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center" }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ fontSize: 22, opacity: i < filled ? 1 : 0.2, filter: i < filled ? "none" : "grayscale(1)" }}>
          {icon}
        </span>
      ))}
    </div>
  );
}

export default function CreatePunchcard() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [form, setForm] = useState({
    name: "Loyalty Card",
    total_stamps: 10,
    reward_description: "",
    style: "classic",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const upd = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const icon = STYLES.find(s => s.id === form.style)?.icon ?? "⭕";
  const previewFilled = Math.ceil(form.total_stamps * 0.4);

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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: 28, alignItems: "start" }}>
        {/* Form */}
        <form onSubmit={submit}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px 32px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>Card Name</label>
              <input
                required value={form.name} onChange={e => upd("name", e.target.value)}
                style={{ width: "100%", padding: "12px 15px", borderRadius: 11, border: "1.5px solid #E5E7EB", fontSize: 15, outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>
                Number of Stamps &nbsp;<span style={{ color: "#3F3CA8", fontWeight: 700 }}>{form.total_stamps}</span>
              </label>
              <input
                type="range" min={4} max={16} value={form.total_stamps}
                onChange={e => upd("total_stamps", Number(e.target.value))}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>
                <span>4 stamps</span><span>16 stamps</span>
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 7 }}>Reward Description *</label>
              <input
                required value={form.reward_description} onChange={e => upd("reward_description", e.target.value)}
                placeholder="e.g. Free coffee of your choice!"
                style={{ width: "100%", padding: "12px 15px", borderRadius: 11, border: "1.5px solid #E5E7EB", fontSize: 15, outline: "none" }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 10 }}>Stamp Style</label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
                {STYLES.map(s => (
                  <button
                    key={s.id} type="button" onClick={() => upd("style", s.id)}
                    style={{
                      padding: "14px 8px", borderRadius: 12,
                      border: `2px solid ${form.style === s.id ? "#3F3CA8" : "#E5E7EB"}`,
                      background: form.style === s.id ? "#F5F4FF" : "#fff",
                      cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                    }}
                  >
                    <span style={{ fontSize: 24 }}>{s.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: form.style === s.id ? "#3F3CA8" : "#6B7280" }}>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {error && <div style={{ background: "#FEF2F2", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#DC2626", fontSize: 14 }}>{error}</div>}
            {success && <div style={{ background: "#F0FFF4", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#059669", fontSize: 14, fontWeight: 600 }}>✓ Punchcard created! Redirecting...</div>}

            <button
              type="submit" disabled={loading || success}
              style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: (loading || success) ? "#D1D5DB" : "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: (loading || success) ? "not-allowed" : "pointer" }}
            >
              {loading ? "Creating..." : success ? "Created!" : "Create Punchcard →"}
            </button>
          </div>
        </form>

        {/* Preview */}
        <div style={{ position: "sticky", top: 24 }}>
          <div style={{ background: "#fff", borderRadius: 20, padding: "28px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 16 }}>Live Preview</div>

            {/* Card */}
            <div style={{ background: "linear-gradient(135deg, #3F3CA8 0%, #252178 100%)", borderRadius: 18, padding: "24px 20px", color: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Your Business</div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{form.name || "Loyalty Card"}</div>
                </div>
                <div style={{ fontSize: 28 }}>{icon}</div>
              </div>

              <StampGrid icon={icon} total={form.total_stamps} filled={previewFilled} />

              <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.15)" }}>
                <div style={{ fontSize: 11, opacity: 0.7, marginBottom: 2 }}>Reward</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{form.reward_description || "Your reward here"}</div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.7, marginBottom: 4 }}>
                  <span>{previewFilled} of {form.total_stamps} stamps</span>
                </div>
                <div style={{ height: 5, background: "rgba(255,255,255,0.2)", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "#fff", width: `${(previewFilled / form.total_stamps) * 100}%`, borderRadius: 999 }} />
                </div>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#9CA3AF", textAlign: "center", marginTop: 12 }}>
              This is how your card appears to customers
            </p>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
