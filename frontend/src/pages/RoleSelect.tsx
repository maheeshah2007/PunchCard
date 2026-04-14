import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Users } from "../api";

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
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #3F3CA8 0%, #252178 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#fff", borderRadius: 24, padding: "40px 32px", width: "100%", maxWidth: 420, textAlign: "center", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg, #3F3CA8, #252178)", color: "#fff", fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>N</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1A1A2E", margin: "0 0 8px" }}>Welcome to NeighborGood</h1>
        <p style={{ fontSize: 15, color: "#6B7280", margin: "0 0 28px" }}>How will you be using the app?</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <button style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 16, border: "2px solid #E5E7EB", background: "#fff", cursor: "pointer", textAlign: "left", width: "100%" }} onClick={() => choose("user")} disabled={loading}>
            <span style={{ fontSize: 32 }}>🛍️</span>
            <div><div style={{ fontSize: 16, fontWeight: 600, color: "#1A1A2E", marginBottom: 4 }}>I'm a Customer</div><div style={{ fontSize: 13, color: "#6B7280" }}>Collect punches & earn rewards</div></div>
          </button>
          <button style={{ display: "flex", alignItems: "center", gap: 16, padding: "20px 24px", borderRadius: 16, border: "2px solid #3F3CA8", background: "#F5F4FF", cursor: "pointer", textAlign: "left", width: "100%" }} onClick={() => choose("business")} disabled={loading}>
            <span style={{ fontSize: 32 }}>🏪</span>
            <div><div style={{ fontSize: 16, fontWeight: 600, color: "#1A1A2E", marginBottom: 4 }}>I'm a Business Owner</div><div style={{ fontSize: 13, color: "#6B7280" }}>Create loyalty programs for customers</div></div>
          </button>
        </div>
        {error && <p style={{ color: "#EF4444", marginTop: 16, fontSize: 14 }}>{error}</p>}
      </div>
    </div>
  );
}
