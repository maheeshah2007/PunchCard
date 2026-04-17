import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, TrendingUp, Megaphone, HelpCircle, Settings, Menu, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { Businesses } from "../api";
import type { Business, BusinessStats } from "../api";

const NAV_TOOLS = [
  { id: "homepage", label: "Homepage", icon: Home },
  { id: "analytics", label: "Analytics", icon: TrendingUp },
  { id: "promotions", label: "Promotions", icon: Megaphone },
];

const NAV_BOTTOM = [
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function BusinessDashboard() {
  const { user, authHeaders } = useAuth();
  const navigate = useNavigate();
  const [business, setBusiness] = useState<Business | null>(null);
  const [stats, setStats] = useState<BusinessStats | null>(null);
  const [activeNav, setActiveNav] = useState("homepage");

  useEffect(() => {
    const h = authHeaders();
    Businesses.getMine(h).then(setBusiness).catch(() => {});
    Businesses.getStats(h).then(setStats).catch(() => {});
  }, []);

  const handleDownload = () => {
    if (!stats || !business) return;
    const csv = [
      ["Metric", "Value"],
      ["Business", business.name],
      ["Unique Customers", stats.unique_customers],
      ["Total Stamps Given", stats.total_stamps_given],
      ["Completed Cards", stats.completed_cards],
      ["Total Transactions", stats.total_transactions],
    ]
      .map((r) => r.join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${business.name.replace(/\s+/g, "_")}_report.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", flexDirection: "column", fontFamily: "sans-serif" }}>
      {/* Top Navbar */}
      <nav style={{ height: 60, background: "#efefef", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px", borderBottom: "1px solid #ddd", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Menu size={20} style={{ cursor: "pointer", color: "#333" }} />
          <span style={{ fontWeight: 600, fontSize: 15 }}>Home</span>
        </div>

        <div style={{ width: 44, height: 44, borderRadius: "50%", background: business?.logo_color ?? "#f87171", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 12, letterSpacing: 0.5 }}>
          LOGO
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a1a1a", overflow: "hidden", flexShrink: 0 }}>
            {user?.picture && <img src={user.picture} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          </div>
          <span style={{ fontWeight: 500, fontSize: 14 }}>{user?.name ?? "Account Name"}</span>
        </div>
      </nav>

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        <aside style={{ width: 220, background: "#efefef", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "28px 0", borderRight: "1px solid #ddd", flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#222", padding: "0 20px", marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Tools</p>
            {NAV_TOOLS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: activeNav === id ? "#e0e0e0" : "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#111", borderRadius: 8, marginBottom: 2 }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          <div>
            {NAV_BOTTOM.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveNav(id)}
                style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", background: "transparent", border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500, color: "#111", borderRadius: 8, marginBottom: 2 }}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "40px 48px", overflowY: "auto" }}>
          <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 28, color: "#111" }}>
            {business?.name ?? "Business Name"}
          </h1>

          {/* Stamp Performance */}
          <div style={{ background: "#ebebeb", borderRadius: 16, padding: 24, marginBottom: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 16, color: "#333" }}>Stamp Performance</p>
            <div style={{ background: "#d8d8d8", borderRadius: 12, height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUp size={72} strokeWidth={2.5} color="#111" />
            </div>
          </div>

          {/* Stats Row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 48 }}>
            {/* Follower Count */}
            <div style={{ background: "#ebebeb", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 32, color: "#333" }}>Follower Count</p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 56, fontWeight: 700, letterSpacing: 4, color: "#111" }}>
                  {stats?.unique_customers ?? "XXX"}
                </span>
                <span style={{ fontSize: 13, color: "#666", textAlign: "center", lineHeight: 1.4 }}>
                  {stats
                    ? `${stats.total_stamps_given} stamps given total`
                    : "increase X% from last week"}
                </span>
              </div>
            </div>

            {/* Rewards Collected */}
            <div style={{ background: "#ebebeb", borderRadius: 16, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ fontSize: 15, fontWeight: 500, marginBottom: 32, color: "#333" }}>Rewards Collected</p>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 56, fontWeight: 700, color: "#111" }}>
                  {stats?.completed_cards ?? "—"}
                </span>
                <span style={{ fontSize: 13, color: "#666", textAlign: "center" }}>
                  completed punch cards
                </span>
              </div>
            </div>
          </div>

          {/* Download Report */}
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16, color: "#111" }}>Download Report</h2>
          <div style={{ background: "#ebebeb", borderRadius: 16, padding: 32, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <button
              onClick={handleDownload}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 32px", borderRadius: 999, background: "#1a1a1a", color: "white", border: "none", cursor: "pointer", fontSize: 15, fontWeight: 500 }}
            >
              <Download size={18} />
              Download CSV
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
