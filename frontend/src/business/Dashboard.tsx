import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, BusinessStats, Business, Dev } from "../api";
import BusinessLayout from "./Layout";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCard {
  label: string;
  value: string | number;
  change: string;
  positive: boolean;
}

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

  const engagementRate = stats && stats.unique_customers > 0
    ? Math.round((stats.completed_cards / stats.unique_customers) * 100)
    : 0;

  const statCards: StatCard[] = [
    { label: "Follower Count",    value: stats?.unique_customers ?? 0,    change: "+10%",   positive: true },
    { label: "Rewards Collected", value: stats?.completed_cards ?? 0,     change: "+13.1%", positive: true },
    { label: "Stamps Issued",     value: stats?.total_stamps_given ?? 0,  change: "+18.2%", positive: true },
    { label: "Engagement Rate",   value: `${engagementRate}%`,            change: "-3.6%",  positive: false },
  ];

  return (
    <BusinessLayout>
      {/* Page title */}
      <div style={{ marginBottom: 8 }}>
        <h1 style={{ fontSize: 48, fontWeight: 500, fontFamily: "Roboto, sans-serif", color: "#000", margin: 0, lineHeight: 1.17 }}>
          {business?.name ?? "Your Business"}
        </h1>
      </div>
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 16, fontFamily: "Lato, sans-serif", fontWeight: 400, color: "#676464", textTransform: "uppercase", letterSpacing: "0.04em", margin: 0 }}>
          Here&apos;s a snapshot of your business performance.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: "flex", gap: 24, marginBottom: 28, flexWrap: "wrap" }}>
        {statCards.map((card) => (
          <div
            key={card.label}
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: "22px 28px",
              minWidth: 200,
              flex: "1 1 200px",
              boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 500, fontFamily: "Inter, sans-serif", color: "#000", marginBottom: 12 }}>
              {card.label}
            </div>
            <div style={{ fontSize: 46, fontWeight: 500, fontFamily: "sans-serif", color: "#000", lineHeight: 1.2, marginBottom: 16 }}>
              {card.value}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {card.positive
                ? <TrendingUp size={20} color="#24C55F" />
                : <TrendingDown size={20} color="#FF0000" />
              }
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "Inter, sans-serif", color: card.positive ? "#24C55F" : "#FF0000" }}>
                {card.change}
              </span>
              <span style={{ fontSize: 14, fontWeight: 500, fontFamily: "Inter, sans-serif", color: "#000" }}>
                last week
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Stamp Performance */}
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: "22px 28px",
          marginBottom: 24,
          boxShadow: "0px 4px 4px rgba(0,0,0,0.25)",
        }}
      >
        <div style={{ fontSize: 18, fontWeight: 500, fontFamily: "Inter, sans-serif", color: "#000", marginBottom: 18 }}>
          Stamp Performance
        </div>
        <div
          style={{
            background: "#D9D9D9",
            borderRadius: 20,
            height: 320,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#9CA3AF",
            fontSize: 14,
          }}
        >
          Chart coming soon
        </div>
      </div>

      {/* Download Report */}
      <div style={{ marginBottom: 32 }}>
        <button
          style={{
            background: "none",
            border: "none",
            fontSize: 28,
            fontWeight: 700,
            fontFamily: "Inter, sans-serif",
            color: "#000",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Download Report
        </button>
      </div>

      {/* Dev Tools */}
      <div style={{ borderTop: "1px solid #E5E7EB", paddingTop: 24 }}>
        <div style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 12, fontWeight: 600, letterSpacing: "0.06em" }}>DEV TOOLS</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            onClick={async () => {
              if (!confirm("Reset YOUR BUSINESS only? You'll re-run the 3-page onboarding. Customer data stays.")) return;
              await Dev.resetBusiness();
              window.location.href = "/business/dashboard";
            }}
            style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid #FCA5A5", background: "#FEF2F2", color: "#DC2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            🏪 Reset My Business
          </button>
          <button
            onClick={async () => {
              if (!confirm("Reset ALL data? Clears every card, business, and user except seed data.")) return;
              await Dev.reset();
              window.location.href = "/business/dashboard";
            }}
            style={{ padding: "10px 20px", borderRadius: 9, border: "1.5px solid #FBBF24", background: "#FFFBEB", color: "#B45309", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
          >
            🗑 Reset Everything
          </button>
        </div>
      </div>
    </BusinessLayout>
  );
}
