import { createContext, useContext, useState, ReactNode } from "react";

export interface AppUser {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
  role?: string | null;
}

interface AuthContextType {
  user: AppUser | null;
  token: string | null;
  setAuth: (u: AppUser, token: string) => void;
  setUser: (u: AppUser | null) => void;
  logout: () => void;
  authHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(() => {
    try {
      const raw = localStorage.getItem("ng_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem("ng_token"));

  const setAuth = (u: AppUser, t: string) => {
    setUserState(u);
    setTokenState(t);
    localStorage.setItem("ng_user", JSON.stringify(u));
    localStorage.setItem("ng_token", t);
  };

  const setUser = (u: AppUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem("ng_user", JSON.stringify(u));
    else {
      localStorage.removeItem("ng_user");
      localStorage.removeItem("ng_token");
      setTokenState(null);
    }
  };

  const logout = () => setUser(null);

  const authHeaders = (): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {}),
  });

  return (
    <AuthContext.Provider value={{ user, token, setAuth, setUser, logout, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
