import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, BusinessStats, Business } from "../api";
import BusinessLayout from "./Layout";

const STATS = [
  { key: "unique_customers",  label: "Total Customers",  color: "#6B48FF", bg: "#F0EEFF", icon: "👥" },
  { key: "total_stamps_given", label: "Stamps Given",    color: "#FF9B3D", bg: "#FFF7ED", icon: "🏷️" },
  { key: "completed_cards",  label: "Completed Cards",   color: "#00C896", bg: "#E6FFF9", icon: "✅" },
  { key: "total_transactions", label: "Transactions",    color: "#FF6B35", bg: "#FFF2EC", icon: "🔄" },
];

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      Businesses.getStats(authHeaders()),
      Businesses.getMine(authHeaders()),
    ])
      .then(([s, b]) => { setStats(s); setBusiness(b); setLoading(false); })
      .catch(() => navigate("/business/setup"));
  }, []);

  if (loading) {
    return (
      <BusinessLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#9CA3AF", fontSize: 18 }}>
          Loading...
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout>
      {/* Page header */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.5px" }}>
          Dashboard
        </h1>
        <p style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>
          {business?.name} — loyalty program overview
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20, marginBottom: 40 }}>
        {STATS.map(s => (
          <div key={s.key} style={{ background: "#fff", borderRadius: 18, padding: "24px 20px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, marginBottom: 14 }}>
              {s.icon}
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-1px", marginBottom: 4 }}>
              {stats?.[s.key as keyof BusinessStats] ?? 0}
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E", marginBottom: 16 }}>Quick Actions</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 40 }}>
        {[
          { icon: "🔑", title: "Get Code",        desc: "Generate transaction code", path: "/business/generate-code",    bg: "#F0EEFF", color: "#6B48FF" },
          { icon: "👥", title: "Customers",       desc: "See loyalty members",       path: "/business/customers",        bg: "#E6FFF9", color: "#00C896" },
          { icon: "🃏", title: "Create Card",     desc: "Design punchcard program",  path: "/business/punchcard/create", bg: "#FFF7ED", color: "#FF9B3D" },
        ].map(a => (
          <button
            key={a.path}
            onClick={() => navigate(a.path)}
            style={{
              display: "flex", flexDirection: "column", gap: 10,
              padding: "22px 20px", borderRadius: 18, border: "none",
              background: "#fff", cursor: "pointer", textAlign: "left",
              boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(0,0,0,0.05)"; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{a.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#1A1A2E" }}>{a.title}</div>
              <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{a.desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Active punchcard */}
      {business?.active_template && (
        <>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1A1A2E", marginBottom: 16 }}>Active Loyalty Card</h2>
          <div style={{ background: "#fff", borderRadius: 18, padding: "24px", boxShadow: "0 2px 16px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 20 }}>
            {/* Mini punchcard visual */}
            <div style={{ background: `linear-gradient(135deg, ${business.logo_color ?? "#3F3CA8"}, ${business.logo_color ?? "#252178"}BB)`, borderRadius: 14, width: 72, height: 72, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, flexShrink: 0 }}>
              🃏
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E" }}>{business.active_template.name}</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginTop: 3 }}>
                {business.active_template.total_stamps} stamps → {business.active_template.reward_description}
              </div>
            </div>
            <button
              onClick={() => navigate("/business/punchcard/create")}
              style={{ padding: "9px 18px", borderRadius: 9, border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Edit
            </button>
          </div>
        </>
      )}

      {!business?.active_template && (
        <div style={{ background: "#F8F7FF", borderRadius: 18, padding: "32px", textAlign: "center", border: "2px dashed #E0DEFF" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🃏</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#1A1A2E", marginBottom: 6 }}>No loyalty card yet</div>
          <div style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>Create a punchcard to start rewarding customers</div>
          <button onClick={() => navigate("/business/punchcard/create")} style={{ padding: "12px 24px", borderRadius: 10, border: "none", background: "linear-gradient(180deg, #3F3CA8 0%, #252178 100%)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Create Punchcard →
          </button>
        </div>
      )}
    </BusinessLayout>
  );
}
