import { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, Categories } from "../api";

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
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
};

const OUTER_PANEL: React.CSSProperties = {
  background: "#CACACA",
  borderRadius: 24,
  padding: "48px 44px",
  width: "100%",
  maxWidth: 560,
};

const UNDERLINE_INPUT: React.CSSProperties = {
  width: "100%",
  padding: "10px 0",
  border: "none",
  borderBottom: "1.5px solid #8A8A8A",
  background: "transparent",
  fontFamily: MONO,
  fontSize: 13,
  color: "#1A1A1A",
  outline: "none",
  boxSizing: "border-box",
};

const SUBMIT_BTN: React.CSSProperties = {
  width: "100%",
  padding: "18px",
  borderRadius: 999,
  border: "none",
  background: "#1A1A1A",
  color: "#fff",
  fontFamily: MONO,
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.12em",
  cursor: "pointer",
  marginTop: 32,
};

export default function BusinessSetup() {
  const navigate = useNavigate();
  const { authHeaders, user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep]               = useState(1);
  const [name, setName]               = useState("");
  const [phone, setPhone]             = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]       = useState("");
  const [logoImage, setLogoImage]     = useState<string | null>(null);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [categories, setCategories]   = useState<string[]>([]);
  const [catsLoading, setCatsLoading] = useState(false);
  const [catsError, setCatsError]     = useState("");

  useEffect(() => {
    setCatsLoading(true);
    Categories.list()
      .then(res => setCategories(res.categories))
      .catch(() => setCatsError("Failed to load categories. Please refresh."))
      .finally(() => setCatsLoading(false));
  }, []);

  const firstName = user?.name?.split(" ")[0]?.toUpperCase() ?? "USER";

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogoImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function submitStep2() {
    setLoading(true);
    setError("");
    try {
      await Businesses.create(
        {
          name,
          description,
          category,
          address: "",
          logo_color: "#1A1A1A",
          cover_color: "#E0E0E0",
          logo_image: logoImage ?? undefined,
        },
        authHeaders(),
      );
      navigate("/business/punchcard/create");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={BG_STYLE}>
      <div style={OUTER_PANEL}>

        {/* ── STEP 1 ── */}
        {step === 1 && (
          <div>
            {/* Heading — two lines */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontFamily: PIXEL, fontSize: 18, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.7 }}>
                HI {firstName}!
              </div>
              <div style={{ fontFamily: PIXEL, fontSize: 18, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.7 }}>
                PLEASE CREATE YOUR COMPANY PROFILE!
              </div>
            </div>

            {/* Subtitle */}
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em", color: "#4B4B4B", marginBottom: 32 }}>
              THIS IS HOW YOUR BUSINESS WILL APPEAR IN X.
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />

            {/* Avatar row — clickable to upload */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 32 }}>
              {/* Circle avatar — shows preview or placeholder */}
              <div
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: 56, height: 56, borderRadius: "50%",
                  background: logoImage ? "transparent" : "#ABABAB",
                  flexShrink: 0, cursor: "pointer", overflow: "hidden",
                  border: logoImage ? "2px solid #6A6A6A" : "none",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {logoImage ? (
                  <img src={logoImage} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="logo preview" />
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6B6B6B" strokeWidth="1.8" strokeLinecap="round">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                )}
              </div>
              {/* Upload text */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", padding: 0 }}
              >
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="18" height="18" rx="3" stroke="#6B6B6B" strokeWidth="1.5" fill="none"/>
                  <circle cx="7.5" cy="7.5" r="2" stroke="#6B6B6B" strokeWidth="1.2" fill="none"/>
                  <path d="M2 15l5-5 4 4 3-3 6 6" stroke="#6B6B6B" strokeWidth="1.2" fill="none" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontFamily: MONO, fontSize: 11, color: "#7A7A7A", letterSpacing: "0.06em" }}>
                  {logoImage ? "Change Image" : "Upload Image"}
                </span>
              </button>
            </div>

            {/* Underline inputs */}
            <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="BUSINESS NAME"
                style={UNDERLINE_INPUT}
              />
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="PHONE NUMBER"
                style={UNDERLINE_INPUT}
              />
              <input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="PLEASE ENTER A BRIEF DESCRIPTION ABOUT YOUR BUSINESS!"
                style={UNDERLINE_INPUT}
              />
            </div>

            <button
              onClick={() => { if (name.trim()) setStep(2); }}
              disabled={!name.trim()}
              style={{
                ...SUBMIT_BTN,
                background: name.trim() ? "#1A1A1A" : "#9A9A9A",
                cursor: name.trim() ? "pointer" : "not-allowed",
              }}
            >
              SUBMIT
            </button>
          </div>
        )}

        {/* ── STEP 2 ── */}
        {step === 2 && (
          <div>
            {/* Heading */}
            <div style={{
              fontFamily: PIXEL, fontSize: 16, fontWeight: 700,
              color: "#1A1A1A", textAlign: "center",
              lineHeight: 1.8, marginBottom: 10,
            }}>
              SELECT THE CATEGORY THAT BEST DESCRIBES YOUR BUSINESS:
            </div>

            {/* Subtitle */}
            <div style={{
              fontFamily: MONO, fontSize: 11, letterSpacing: "0.08em",
              color: "#4B4B4B", textAlign: "center", marginBottom: 28,
            }}>
              THIS HELPS CUSTOMERS DISCOVER YOUR BUSINESS.
            </div>

            {/* Inner dark panel with 2-column checkbox grid */}
            <div style={{ background: "#9A9A9A", borderRadius: 14, padding: "20px 16px" }}>
              {catsLoading && (
                <div style={{ fontFamily: MONO, fontSize: 11, color: "#4B4B4B", textAlign: "center", padding: "16px 0" }}>
                  LOADING CATEGORIES...
                </div>
              )}
              {catsError && (
                <div style={{ fontFamily: MONO, fontSize: 11, color: "#DC2626", textAlign: "center", padding: "8px 0" }}>
                  {catsError}
                </div>
              )}
              {!catsLoading && !catsError && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {categories.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      style={{
                        background: "#B0B0B0",
                        borderRadius: 8,
                        padding: "13px 16px",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        textAlign: "left",
                      }}
                    >
                      <div style={{
                        width: 14, height: 14, borderRadius: 3,
                        border: "1.5px solid #5A5A5A",
                        background: category === cat ? "#1A1A1A" : "transparent",
                        flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {category === cat && (
                          <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                      <span style={{ fontFamily: MONO, fontSize: 10, color: "#1A1A1A", letterSpacing: "0.04em" }}>
                        {cat}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div style={{
                background: "#FEE2E2", borderRadius: 8,
                padding: "10px 14px", color: "#DC2626",
                fontFamily: MONO, fontSize: 11, marginTop: 16,
              }}>
                {error}
              </div>
            )}

            <button
              onClick={submitStep2}
              disabled={!category || loading}
              style={{
                ...SUBMIT_BTN,
                background: category && !loading ? "#1A1A1A" : "#9A9A9A",
                cursor: category && !loading ? "pointer" : "not-allowed",
              }}
            >
              {loading ? "CREATING..." : "SUBMIT"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
