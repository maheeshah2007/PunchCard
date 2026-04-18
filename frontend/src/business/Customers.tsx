import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, Customer } from "../api";
import BusinessLayout from "./Layout";

export default function BusinessCustomers() {
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [totalStamps, setTotalStamps] = useState(10);

  useEffect(() => {
    Promise.all([
      Businesses.getCustomers(authHeaders()),
      Businesses.getMine(authHeaders()),
    ])
      .then(([data, biz]) => {
        setCustomers(data);
        if (biz.active_template) setTotalStamps(biz.active_template.total_stamps);
        setLoading(false);
      })
      .catch(() => navigate("/business/setup"));
  }, []);

  const filtered = customers.filter(c =>
    !search ||
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <BusinessLayout>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.5px" }}>Customers</h1>
          <p style={{ fontSize: 15, color: "#6B7280", marginTop: 4 }}>
            {customers.length} loyalty member{customers.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Search */}
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 16 }}>🔍</div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search customers..."
            style={{
              paddingLeft: 38, paddingRight: 16, paddingTop: 10, paddingBottom: 10,
              borderRadius: 11, border: "1.5px solid #E5E7EB", fontSize: 14,
              outline: "none", width: 260, background: "#fff",
            }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#9CA3AF", padding: 80, fontSize: 16 }}>Loading customers...</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 80, background: "#fff", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>👥</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#1A1A2E", marginBottom: 6 }}>
            {search ? "No matching customers" : "No customers yet"}
          </div>
          <div style={{ fontSize: 14, color: "#6B7280" }}>
            {search ? "Try a different search term" : "Customers appear here when they join your loyalty program"}
          </div>
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 2px 16px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 200px 160px 120px", padding: "14px 24px", background: "#F9FAFB", borderBottom: "1px solid #F0F0F0" }}>
            {["Customer", "Stamps", "Progress", "Status"].map(h => (
              <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</div>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((c, i) => {
            const pct = Math.min(100, (c.stamps / totalStamps) * 100);
            return (
              <div
                key={i}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 200px 160px 120px",
                  padding: "16px 24px",
                  borderBottom: i < filtered.length - 1 ? "1px solid #F9FAFB" : "none",
                  alignItems: "center",
                }}
              >
                {/* Customer */}
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {c.picture ? (
                    <img src={c.picture} style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }} alt={c.name} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#6B48FF" }}>
                      {c.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{c.email}</div>
                  </div>
                </div>

                {/* Stamps */}
                <div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#6B48FF" }}>{c.stamps}</span>
                  <span style={{ fontSize: 13, color: "#9CA3AF", marginLeft: 4 }}>/ {totalStamps}</span>
                </div>

                {/* Progress bar */}
                <div>
                  <div style={{ height: 8, background: "#F0F0F0", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ height: "100%", background: c.completed ? "#00C896" : "linear-gradient(90deg, #3F3CA8, #6B48FF)", width: `${pct}%`, borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 3 }}>{Math.round(pct)}%</div>
                </div>

                {/* Status */}
                <div>
                  <span style={{
                    padding: "5px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700,
                    background: c.completed ? "#E6FFF9" : "#F5F4FF",
                    color: c.completed ? "#059669" : "#6B48FF",
                  }}>
                    {c.completed ? "✓ Complete" : "Active"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary */}
      {!loading && customers.length > 0 && (
        <div style={{ display: "flex", gap: 16, marginTop: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F0EEFF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>📊</div>
            <div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Avg Stamps</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1A1A2E" }}>
                {(customers.reduce((a, c) => a + c.stamps, 0) / customers.length).toFixed(1)}
              </div>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "#E6FFF9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏆</div>
            <div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase" }}>Completed</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#1A1A2E" }}>
                {customers.filter(c => c.completed).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
