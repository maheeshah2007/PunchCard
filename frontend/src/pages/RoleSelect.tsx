import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users } from "../api";
import MobileShell from "../components/MobileShell";

const MONO = "'Space Mono', monospace";

export default function RoleSelect() {
  const navigate = useNavigate();
  const { user, setUser, authHeaders } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function choose(role: "user" | "business") {
    if (!user) return;
    setLoading(true);
    try {
      await Users.setRole(role, authHeaders());
      setUser({ ...user, role });
      navigate(role === "business" ? "/business/setup" : "/dashboard");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong"); }
    finally { setLoading(false); }
  }

  return (
    <MobileShell bg="#fff">
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 28px", fontFamily: MONO }}>
        <div style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "#0D0D0D", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24, color: "#fff", fontFamily: MONO, fontWeight: 700 }}>N</div>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 8, letterSpacing: "-0.3px" }}>WELCOME TO NEIGHBORGOOD</div>
          <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: MONO, marginBottom: 36, letterSpacing: "0.04em" }}>HOW WILL YOU BE USING THE APP?</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <button
              onClick={() => choose("user")} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 18, border: "2px solid #E5E7EB", background: "#fff", cursor: "pointer", textAlign: "left", width: "100%" }}
            >
              <span style={{ fontSize: 32 }}>🛍️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 4 }}>I'M A CUSTOMER</div>
                <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF" }}>Collect punches & earn rewards</div>
              </div>
            </button>
            <button
              onClick={() => choose("business")} disabled={loading}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 18, border: "2px solid #0D0D0D", background: "#F5F5F5", cursor: "pointer", textAlign: "left", width: "100%" }}
            >
              <span style={{ fontSize: 32 }}>🏪</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", marginBottom: 4 }}>I'M A BUSINESS OWNER</div>
                <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF" }}>Create loyalty programs for customers</div>
              </div>
            </button>
          </div>

          {error && <p style={{ color: "#EF4444", marginTop: 16, fontSize: 11, fontFamily: MONO }}>{error}</p>}
        </div>
      </div>
    </MobileShell>
  );
}
