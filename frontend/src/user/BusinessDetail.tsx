import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Businesses, UserCards, Business, UserPunchCard } from "../api";
import UserLayout from "./Layout";

const MONO = "'Space Mono', monospace";

const CAT_EMOJI: Record<string, string> = {
  Coffee: "☕", Food: "🍕", Books: "📚", Fitness: "💪",
  Beauty: "💅", Retail: "🛍️", Other: "🏪",
};

function PunchCardVisual({ card, business }: { card: UserPunchCard; business: Business }) {
  const { template, stamps_collected } = card;
  const total = template.total_stamps;

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 18,
        padding: "16px",
        display: "flex",
        gap: 14,
        boxShadow: "0 2px 20px rgba(0,0,0,0.1)",
        margin: "0 20px",
      }}
    >
      {/* Left: brand info */}
      <div style={{ flexShrink: 0, width: 70, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            width: 52, height: 52, borderRadius: 14,
            background: business.logo_color + "18",
            border: `2px solid ${business.logo_color}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 24,
          }}
        >
          {CAT_EMOJI[business.category ?? ""] ?? business.name[0]}
        </div>
        <div style={{ fontSize: 8, fontFamily: MONO, color: "#9CA3AF", textAlign: "center", letterSpacing: "0.04em", marginTop: 6 }}>
          {business.name.toUpperCase()}
        </div>
        <div style={{ fontSize: 9, fontFamily: MONO, color: "#0D0D0D", fontWeight: 700, marginTop: 2 }}>
          {stamps_collected.toString().padStart(2, "0")}/{total.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, background: "#F0F0F0", alignSelf: "stretch" }} />

      {/* Right: stamp grid */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 9, fontFamily: MONO, color: "#6B7280", marginBottom: 10, letterSpacing: "0.04em", lineHeight: 1.5 }}>
          {template.reward_description}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
          {Array.from({ length: total }).map((_, i) => (
            <div
              key={i}
              style={{
                aspectRatio: "1",
                borderRadius: "50%",
                border: i < stamps_collected ? "none" : "1.5px solid #DEDEDE",
                background: i < stamps_collected ? "#F5F0FF" : "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: i < stamps_collected ? 16 : 10,
                color: i < stamps_collected ? "#0D0D0D" : "#CACACA",
                fontFamily: MONO,
              }}
            >
              {i < stamps_collected ? "◉" : (i + 1).toString().padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentRunSection({ businesses, currentId }: { businesses: Business[]; currentId: number }) {
  const navigate = useNavigate();
  const others = businesses.filter(b => b.id !== currentId).slice(0, 4);
  if (others.length === 0) return null;

  return (
    <div style={{ padding: "24px 20px 0" }}>
      <div style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, color: "#0D0D0D", letterSpacing: "0.12em", marginBottom: 14 }}>
        STUDENT-RUN
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {others.map(biz => (
          <div
            key={biz.id}
            onClick={() => navigate(`/businesses/${biz.id}`)}
            style={{ borderRadius: 16, overflow: "hidden", cursor: "pointer", background: "#F5F5F5", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
          >
            <div
              style={{ height: 80, background: `linear-gradient(135deg, ${biz.logo_color}, ${biz.logo_color}99)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32 }}
            >
              {CAT_EMOJI[biz.category ?? ""] ?? biz.name[0]}
            </div>
            <div style={{ padding: "8px 10px 10px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "-0.2px", marginBottom: 2 }}>
                {biz.name}
              </div>
              <div style={{ fontSize: 9, color: "#9CA3AF", fontFamily: MONO }}>★ {biz.rating}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BusinessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { authHeaders } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [allBusinesses, setAllBusinesses] = useState<Business[]>([]);
  const [userCard, setUserCard] = useState<UserPunchCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [showPunched, setShowPunched] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      Businesses.get(Number(id)),
      Businesses.list(),
      UserCards.list(authHeaders()),
    ]).then(([biz, all, cards]) => {
      setBusiness(biz);
      setAllBusinesses(all);
      setUserCard(cards.find(c => c.business.id === biz.id) ?? null);
      setLoading(false);
    });
  }, [id]);

  async function join() {
    if (!business?.active_template) return;
    setJoining(true);
    try {
      const card = await UserCards.join(business.active_template.id, authHeaders());
      setUserCard(card);
    } finally { setJoining(false); }
  }

  if (loading) {
    return (
      <UserLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "70vh", color: "#9CA3AF", fontFamily: MONO, fontSize: 12 }}>
          LOADING...
        </div>
      </UserLayout>
    );
  }

  if (!business) {
    return (
      <UserLayout>
        <div style={{ padding: 20, textAlign: "center", fontFamily: MONO, color: "#9CA3AF", fontSize: 12 }}>NOT FOUND</div>
      </UserLayout>
    );
  }

  /* ── PUNCHED success screen ── */
  if (showPunched && userCard) {
    return (
      <UserLayout>
        <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
          {/* Punchcard at top */}
          <div style={{ background: "#F5F5F5", padding: "52px 0 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px 16px" }}>
              <button onClick={() => setShowPunched(false)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", fontFamily: MONO }}>✕</button>
              <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.05em" }}>{business.name}</div>
            </div>

            <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF", textAlign: "center", letterSpacing: "0.1em", marginBottom: 12 }}>
              [{userCard.stamps_collected.toString().padStart(2,"0")}/{userCard.template.total_stamps.toString().padStart(2,"0")} PUNCHES COMPLETE
              {userCard.template.total_stamps - userCard.stamps_collected > 0
                ? `. ${userCard.template.total_stamps - userCard.stamps_collected} TO GO!`
                : ". REWARD READY!"}
              ]
            </div>
            <PunchCardVisual card={userCard} business={business} />
          </div>

          {/* PUNCHED! */}
          <div style={{ flex: 1, background: "#0D0D0D", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 28px" }}>
            <div style={{ fontSize: 52, fontWeight: 700, color: "#fff", fontFamily: MONO, letterSpacing: "-1px", marginBottom: 14 }}>
              PUNCHED!
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: MONO, letterSpacing: "0.08em", textAlign: "center", lineHeight: 1.8 }}>
              THANKS FOR SHOPPING LOCALLY<br />& SUSTAINABLY.
            </div>
            <button
              onClick={() => setShowPunched(false)}
              style={{ marginTop: 32, padding: "14px 32px", borderRadius: 999, border: "none", background: "#fff", color: "#0D0D0D", fontSize: 12, fontFamily: MONO, fontWeight: 700, letterSpacing: "0.1em", cursor: "pointer" }}
            >
              CONTINUE →
            </button>
          </div>

          {/* Student-run */}
          <div style={{ background: "#fff", paddingBottom: 100 }}>
            <StudentRunSection businesses={allBusinesses} currentId={business.id} />
          </div>
        </div>
      </UserLayout>
    );
  }

  /* ── Normal detail view ── */
  const template = business.active_template;

  return (
    <UserLayout>
      <div style={{ minHeight: "100vh", background: "#F5F5F5" }}>
        {/* Header */}
        <div style={{ padding: "52px 20px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => navigate(-1)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", fontFamily: MONO }}>✕</button>
          <div style={{ fontSize: 13, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "0.05em" }}>{business.name}</div>
        </div>

        {/* Punchcard */}
        {template && userCard ? (
          <>
            <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF", textAlign: "center", letterSpacing: "0.1em", marginBottom: 12 }}>
              [{userCard.stamps_collected.toString().padStart(2,"0")}/{template.total_stamps.toString().padStart(2,"0")} PUNCHES COMPLETE
              {template.total_stamps - userCard.stamps_collected > 0
                ? `. ${template.total_stamps - userCard.stamps_collected} TO GO!`
                : ". REWARD READY!"}
              ]
            </div>
            <PunchCardVisual card={userCard} business={business} />
          </>
        ) : template ? (
          <div style={{ margin: "0 20px", background: "#fff", borderRadius: 18, padding: "24px", textAlign: "center", boxShadow: "0 2px 20px rgba(0,0,0,0.08)" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{CAT_EMOJI[business.category ?? ""] ?? "🏪"}</div>
            <div style={{ fontSize: 12, fontFamily: MONO, color: "#0D0D0D", fontWeight: 700, marginBottom: 4, letterSpacing: "0.04em" }}>
              {template.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF", letterSpacing: "0.04em" }}>
              {template.total_stamps} STAMPS → {template.reward_description}
            </div>
          </div>
        ) : null}

        {/* Business info */}
        <div style={{ padding: "20px 20px 0" }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px 18px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 700, fontFamily: MONO, color: "#0D0D0D", letterSpacing: "-0.3px" }}>{business.name}</div>
              <div style={{ fontSize: 11, fontFamily: MONO, color: "#9CA3AF" }}>★ {business.rating}</div>
            </div>
            <div style={{ fontSize: 10, fontFamily: MONO, color: "#9CA3AF", marginBottom: 8, letterSpacing: "0.04em" }}>
              {business.category?.toUpperCase()}{business.address ? ` · ${business.address}` : ""}
            </div>
            {business.description && (
              <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.6 }}>
                {business.description}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ padding: "16px 20px 0" }}>
          {!template ? (
            <div style={{ textAlign: "center", padding: "20px", fontFamily: MONO, fontSize: 11, color: "#9CA3AF" }}>
              NO LOYALTY PROGRAM AVAILABLE YET
            </div>
          ) : !userCard ? (
            <button
              onClick={join} disabled={joining}
              style={{ width: "100%", padding: "17px", borderRadius: 999, border: "none", background: joining ? "#D1D5DB" : "#0D0D0D", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: MONO, letterSpacing: "0.1em", cursor: joining ? "not-allowed" : "pointer" }}
            >
              {joining ? "..." : "JOIN LOYALTY PROGRAM"}
            </button>
          ) : (
            <button
              onClick={() => navigate("/authenticate")}
              style={{ width: "100%", padding: "17px", borderRadius: 999, border: "none", background: "#0D0D0D", color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: MONO, letterSpacing: "0.1em", cursor: "pointer" }}
            >
              AUTHENTICATE PURCHASE →
            </button>
          )}
        </div>

        {/* Student-run */}
        <StudentRunSection businesses={allBusinesses} currentId={business.id} />
        <div style={{ height: 100 }} />
      </div>
    </UserLayout>
  );
}
