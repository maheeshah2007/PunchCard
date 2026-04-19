import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Auth } from "../api";
import { useAuth } from "../context/AuthContext";

export default function DevLogin() {
  const [params] = useSearchParams();
  const role = (params.get("role") ?? "user") as "user" | "business";
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Auth.devLogin(role)
      .then(({ user }) => {
        setUser(user as Parameters<typeof setUser>[0]);
        navigate(role === "business" ? "/business/dashboard" : "/dashboard", { replace: true });
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <p style={{ padding: "2rem", color: "red" }}>Login failed: {error}</p>;
  return <p style={{ padding: "2rem" }}>Logging in as {role}…</p>;
}
