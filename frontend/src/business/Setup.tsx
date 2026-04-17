import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Businesses } from "../api";

const CATEGORIES = [
  "Entertainment & Sports",
  "Food & Beverages",
  "Beauty Services",
  "Clothing & Accessories",
  "Other",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  borderBottom: "1px solid #bbb",
  outline: "none",
  fontSize: 16,
  padding: "12px 0",
  marginBottom: 28,
  color: "#111",
  background: "transparent",
};

export default function BusinessSetup() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Step 2
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const toggleCategory = (cat: string) =>
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError("Select at least one category.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await Businesses.create(
        {
          name: name.trim(),
          description: description.trim() || undefined,
          category: selected[0],
          address: "",
          logo_color: "#3F3CA8",
          cover_color: "#252178",
        },
        authHeaders()
      );
      navigate("/business/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (step === 1) {
    return (
      <div style={{ minHeight: "100vh", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ width: 520, padding: "40px 16px" }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 10 }}>
            Hi {user?.name?.split(" ")[0] ?? "there"}, create your company profile!
          </h1>
          <p style={{ color: "#555", marginBottom: 40, fontSize: 15 }}>
            This is how your business will appear in X.
          </p>

          {/* Logo Upload */}
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
            <div
              onClick={() => fileRef.current?.click()}
              style={{ width: 52, height: 52, borderRadius: "50%", background: "#ddd", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}
            >
              {logoPreview && (
                <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
            <button
              onClick={() => fileRef.current?.click()}
              style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 16 }}
            >
              <ImageIcon size={22} color="#999" />
              Upload Image
            </button>
          </div>

          <input
            placeholder="Business Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={inputStyle}
          />
          <input
            placeholder="Please enter a brief description about your business!"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, marginBottom: 48 }}
          />

          {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

          <button
            onClick={() => {
              if (!name.trim()) {
                setError("Business name is required.");
                return;
              }
              setError("");
              setStep(2);
            }}
            style={{ width: "100%", padding: "18px 0", borderRadius: 999, background: "#111", color: "white", border: "none", cursor: "pointer", fontSize: 16, fontWeight: 500 }}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "white", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
      <div style={{ width: 520, padding: "40px 16px" }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 10 }}>
          What services do you provide?
        </h1>
        <p style={{ color: "#555", marginBottom: 6, fontSize: 15 }}>Tell us about your products.</p>
        <p style={{ color: "#aaa", fontSize: 13, marginBottom: 28 }}>Select all that apply</p>

        {CATEGORIES.map((cat) => (
          <div
            key={cat}
            onClick={() => toggleCategory(cat)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              border: "1px solid #ddd",
              borderRadius: 14,
              padding: "16px 20px",
              marginBottom: 12,
              cursor: "pointer",
              background: selected.includes(cat) ? "#f7f7f7" : "white",
            }}
          >
            <div
              style={{
                width: 20,
                height: 20,
                border: "1.5px solid #bbb",
                borderRadius: 4,
                background: selected.includes(cat) ? "#111" : "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {selected.includes(cat) && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5l3.5 3.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <span style={{ fontSize: 15 }}>{cat}</span>
          </div>
        ))}

        {error && <p style={{ color: "red", margin: "8px 0" }}>{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "18px 0", borderRadius: 999, background: "#111", color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 16, fontWeight: 500, marginTop: 16, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating…" : "Continue"}
        </button>
      </div>
    </div>
  );
}
