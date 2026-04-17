import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Businesses, Templates } from "../api";

const STAMP_COUNTS = [6, 7, 8, 9, 10, 11, 12];

const THEMES = [
  { color: "#1a1a2e", label: "Midnight" },
  { color: "#2d4a6e", label: "Navy" },
  { color: "#2d6a4f", label: "Forest" },
  { color: "#6b4c9a", label: "Violet" },
  { color: "#8b3a3a", label: "Crimson" },
  { color: "#5a4a3a", label: "Mocha" },
  { color: "#3a5a6b", label: "Slate" },
  { color: "#1a3a1a", label: "Emerald" },
];

function CardPreview({ name, totalStamps, theme }: { name: string; totalStamps: number; theme: string }) {
  const half = Math.ceil(totalStamps / 2);
  const row1 = Array.from({ length: half });
  const row2 = Array.from({ length: totalStamps - half });

  const Slot = ({ filled, star }: { filled?: boolean; star?: boolean }) => (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: "50%",
        background: filled || star ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.12)",
        border: "1.5px solid rgba(255,255,255,0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: star ? 20 : 16,
        fontWeight: 700,
      }}
    >
      {star ? "★" : filled ? "✓" : ""}
    </div>
  );

  return (
    <div
      style={{
        background: theme,
        borderRadius: 20,
        padding: "24px 22px 20px",
        width: 320,
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
    >
      <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        {row1.map((_, i) => (
          <Slot key={i} filled />
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        {row2.map((_, i) => (
          <Slot key={i} filled={i === 0} star={i === row2.length - 1 && row2.length > 1} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)" }}>
          {name || "Business Name"}
        </span>
        <div style={{ width: 28, height: 16, background: "rgba(255,255,255,0.25)", borderRadius: 4 }} />
      </div>
    </div>
  );
}

export default function CreatePunchcard() {
  const { authHeaders } = useAuth();
  const navigate = useNavigate();

  const [cardName, setCardName] = useState("");
  const [reward, setReward] = useState("");
  const [totalStamps, setTotalStamps] = useState(10);
  const [theme, setTheme] = useState(THEMES[0].color);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (!cardName.trim()) { setError("Card name is required."); return; }
    if (!reward.trim()) { setError("Reward description is required."); return; }
    setLoading(true);
    setError("");
    try {
      await Templates.create(
        { name: cardName.trim(), total_stamps: totalStamps, reward_description: reward.trim(), style: theme },
        authHeaders()
      );
      navigate("/business/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "sans-serif" }}>
      {/* Left Panel — live preview */}
      <div
        style={{
          width: "50%",
          background: "#e8e8e8",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          padding: "32px 40px",
          position: "relative",
        }}
      >
        {/* PunchKard logo pill */}
        <div
          style={{
            background: "#d0d0d0",
            borderRadius: 999,
            padding: "10px 28px",
            fontSize: 13,
            fontWeight: 600,
            color: "#444",
            marginBottom: 80,
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          PunchKard<br />Logo
        </div>

        {/* Card preview centred vertically */}
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
          <CardPreview name={cardName} totalStamps={totalStamps} theme={theme} />
        </div>
      </div>

      {/* Right Panel — form */}
      <div
        style={{
          width: "50%",
          background: "white",
          padding: "60px 56px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 6 }}>Customize your PunchCard!</h1>
        <p style={{ color: "#555", fontSize: 15, marginBottom: 32 }}>Choose your reward.</p>

        {/* Reward description */}
        <input
          placeholder="Reward (e.g. Free coffee)"
          value={reward}
          onChange={(e) => setReward(e.target.value)}
          style={{ border: "none", borderBottom: "1px solid #bbb", outline: "none", fontSize: 15, padding: "10px 0", marginBottom: 32, width: "100%", background: "transparent" }}
        />

        {/* Card name */}
        <label style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, display: "block" }}>
          Create your card name!
        </label>
        <input
          placeholder="Business or reward name"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          style={{ border: "none", borderBottom: "1px solid #bbb", outline: "none", fontSize: 15, padding: "10px 0", marginBottom: 32, width: "100%", background: "transparent" }}
        />

        {/* Stamp count */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
          <label style={{ fontSize: 15, fontWeight: 500, whiteSpace: "nowrap" }}>
            # of stars until reward reached
          </label>
          <select
            value={totalStamps}
            onChange={(e) => setTotalStamps(Number(e.target.value))}
            style={{ border: "1px solid #ccc", borderRadius: 8, padding: "6px 12px", fontSize: 15, outline: "none", cursor: "pointer" }}
          >
            {STAMP_COUNTS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Theme picker */}
        <label style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, display: "block" }}>
          Pick a card theme:
        </label>
        <div
          style={{
            background: "#e8e8e8",
            borderRadius: 14,
            padding: "16px 20px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 40px)",
            gap: 12,
            marginBottom: 32,
          }}
        >
          {THEMES.map(({ color, label }) => (
            <div
              key={color}
              title={label}
              onClick={() => setTheme(color)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: color,
                cursor: "pointer",
                boxShadow: theme === color ? `0 0 0 3px white, 0 0 0 5px ${color}` : "none",
                transition: "box-shadow 0.15s",
              }}
            />
          ))}
        </div>

        {/* Logo upload */}
        <label style={{ fontSize: 15, fontWeight: 500, marginBottom: 12, display: "block" }}>
          Upload a card logo:
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
          <div
            onClick={() => fileRef.current?.click()}
            style={{ width: 48, height: 48, borderRadius: "50%", background: "#ddd", overflow: "hidden", flexShrink: 0, cursor: "pointer" }}
          >
            {logoPreview && (
              <img src={logoPreview} alt="logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", color: "#999", fontSize: 15 }}
          >
            <ImageIcon size={20} color="#999" />
            Upload Image
          </button>
        </div>

        {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

        <button
          onClick={handleCreate}
          disabled={loading}
          style={{ width: "100%", padding: "16px 0", borderRadius: 999, background: "#111", color: "white", border: "none", cursor: loading ? "not-allowed" : "pointer", fontSize: 16, fontWeight: 500, opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Creating…" : "Create Card"}
        </button>
      </div>
    </div>
  );
}
