import React from "react";
import { useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: "100vh", background: "#f3f4ff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
      <img src="/assets/group58.svg" alt="Welcome" style={{ width: 360, maxWidth: "90vw", height: "auto", marginBottom: 40 }} />
      <button style={{ width: 220, height: 52, borderRadius: 999, border: "none", background: "linear-gradient(180deg, #3f3ca8 0%, #252178 100%)", color: "white", fontSize: 16, cursor: "pointer", marginBottom: 16 }} onClick={() => navigate("/register")}>
        Get started
      </button>
      <button style={{ width: 240, height: 52, borderRadius: 999, background: "transparent", border: "2px solid rgba(52,44,140,0.6)", color: "rgba(52,44,140,1)", fontSize: 16, cursor: "pointer" }} onClick={() => navigate("/login")}>
        I have an account
      </button>
    </div>
  );
}
