const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8001";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers as Record<string, string>) },
    ...options,
  });
  const text = await res.text();
  let data: unknown;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = data as Record<string, string> | null;
    throw new Error(err?.detail ?? err?.message ?? `Request failed (${res.status})`);
  }
  return data as T;
}

export interface GoogleUser { sub?: string; email?: string; name?: string; picture?: string; role?: string | null; }
export interface PunchCardTemplate { id: number; name: string; total_stamps: number; reward_description: string; style: string; is_active?: boolean; card_color?: string; stamp_color?: string; stamp_icon?: string; }
export interface Business { id: number; name: string; description?: string; category?: string; address?: string; logo_color: string; cover_color: string; rating: number; active_template?: PunchCardTemplate | null; }
export interface UserPunchCard { id: number; stamps_collected: number; is_completed: boolean; is_redeemed: boolean; template: PunchCardTemplate; business: { id: number; name: string; logo_color: string; category: string }; }
export interface BusinessStats { unique_customers: number; total_stamps_given: number; completed_cards: number; total_transactions: number; }
export interface Customer { name: string; email: string; picture?: string; stamps: number; completed: boolean; }
export interface AuthCodeResult { code: string; expires_at: string; template_id: number; business_id: number; }

export const Auth = {
  google: (credential: string) => request<{ ok: boolean; user: GoogleUser }>("/auth/google", { method: "POST", body: JSON.stringify({ credential }) }),
  devLogin: (role: "user" | "business") => request<{ ok: boolean; user: GoogleUser }>(`/auth/dev-login?role=${role}`, { method: "POST" }),
};

export const Users = {
  me: (headers: Record<string, string>) => request<GoogleUser>("/users/me", { headers }),
  setRole: (role: string, headers: Record<string, string>) => request<{ ok: boolean; role: string }>("/users/me/role", { method: "PUT", body: JSON.stringify({ role }), headers }),
};

export const Businesses = {
  list: (category?: string) => request<Business[]>(`/businesses${category ? `?category=${encodeURIComponent(category)}` : ""}`),
  get: (id: number) => request<Business>(`/businesses/${id}`),
  getMine: (headers: Record<string, string>) => request<Business>("/businesses/me", { headers }),
  create: (data: Omit<Business, "id" | "rating" | "active_template">, headers: Record<string, string>) => request<Business>("/businesses", { method: "POST", body: JSON.stringify(data), headers }),
  update: (data: Partial<Business>, headers: Record<string, string>) => request<Business>("/businesses/me", { method: "PUT", body: JSON.stringify(data), headers }),
  getStats: (headers: Record<string, string>) => request<BusinessStats>("/businesses/me/stats", { headers }),
  getCustomers: (headers: Record<string, string>) => request<Customer[]>("/businesses/me/customers", { headers }),
  getMyTemplates: (headers: Record<string, string>) => request<PunchCardTemplate[]>("/businesses/me/templates", { headers }),
};

export const Templates = {
  create: (data: { name: string; total_stamps: number; reward_description: string; style: string; card_color: string; stamp_color: string; stamp_icon: string }, headers: Record<string, string>) =>
    request<PunchCardTemplate>("/punchcard-templates", { method: "POST", body: JSON.stringify(data), headers }),
};

export const UserCards = {
  list: (headers: Record<string, string>) => request<UserPunchCard[]>("/user/punchcards", { headers }),
  join: (templateId: number, headers: Record<string, string>) => request<UserPunchCard>(`/user/punchcards/${templateId}`, { method: "POST", headers }),
};

export const Dev = {
  reset: () => request<{ ok: boolean; message: string }>("/dev/reset", { method: "POST" }),
};

export const AuthCodes = {
  generate: (templateId: number, headers: Record<string, string>) => request<AuthCodeResult>("/auth-codes/generate", { method: "POST", body: JSON.stringify({ template_id: templateId }), headers }),
  redeem: (code: string, businessId: number, headers: Record<string, string>) => request<{ ok: boolean; stamps_collected: number; is_completed: boolean; punchcard: UserPunchCard }>("/auth-codes/redeem", { method: "POST", body: JSON.stringify({ code, business_id: businessId }), headers }),
};
