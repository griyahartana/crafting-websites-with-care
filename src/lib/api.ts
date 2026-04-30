export type Role = "admin" | "midwife" | "customer";

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string | null;
};

export type AuthSession = {
  token: string;
  user: User;
};

export type Midwife = {
  id: number;
  name: string;
  email: string;
  role: "midwife";
  avatar_url?: string | null;
  specialty?: string;
  clinic?: string;
  distance?: string;
  rating?: number;
  reviews?: number;
};

export type Customer = {
  id: number;
  name: string;
  email: string;
  role: "customer";
  avatar_url?: string | null;
  created_at?: string;
};

export type ChatMessage = {
  id: number;
  thread_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: Role;
  sender_avatar_url?: string | null;
  body: string;
  created_at: string;
};

export type ChatThread = {
  id: number;
  customer_id: number;
  midwife_id: number;
  subject: string;
  customer_name: string;
  midwife_name: string;
  customer_avatar_url?: string | null;
  midwife_avatar_url?: string | null;
  updated_at: string;
};

const TOKEN_KEY = "bidankita_token";
const USER_KEY = "bidankita_user";
const API_ORIGIN =
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "https://bidanktitik.my.id"
    : "";

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY) ?? "";

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
};

export const storeSession = (session: AuthSession) => {
  localStorage.setItem(TOKEN_KEY, session.token);
  localStorage.setItem(USER_KEY, JSON.stringify(session.user));
};

export const storeUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const apiFetch = async <T>(path: string, options: RequestInit = {}) => {
  const token = getStoredToken();
  const headers = new Headers(options.headers);
  if (!headers.has("content-type") && options.body) headers.set("content-type", "application/json");
  if (token) headers.set("authorization", `Bearer ${token}`);

  const response = await fetch(`${API_ORIGIN}${path}`, { ...options, headers });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? "Permintaan gagal diproses");
  }
  return data as T;
};
