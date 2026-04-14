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
  setUser: (u: AppUser | null) => void;
  logout: () => void;
  authHeaders: () => Record<string, string>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AppUser | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const setUser = (u: AppUser | null) => {
    setUserState(u);
    if (u) localStorage.setItem("user", JSON.stringify(u));
    else localStorage.removeItem("user");
  };

  const logout = () => setUser(null);

  const authHeaders = (): Record<string, string> => ({
    "Content-Type": "application/json",
    ...(user?.sub ? { "x-user-id": user.sub } : {}),
  });

  return (
    <AuthContext.Provider value={{ user, setUser, logout, authHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
