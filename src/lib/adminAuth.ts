export type AdminSession = {
  farmName: string;
  name: string;
  email: string;
  role: "admin";
  signedInAt: string;
};

const ADMIN_SESSION_KEY = "layerfarm_admin_session";

export const ADMIN_EMAIL = "admin@hartanafarm.my.id";
export const ADMIN_PASSWORD = "hartanafarm123";

export const getAdminSession = (): AdminSession | null => {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return null;

  try {
    const session = JSON.parse(raw) as Partial<AdminSession>;
    return session.role === "admin" && session.email ? (session as AdminSession) : null;
  } catch {
    return null;
  }
};

export const hasAdminSession = () => Boolean(getAdminSession());

export const storeAdminSession = (session: AdminSession) => {
  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.removeItem("layerfarm_session");
};

export const validateAdminLogin = (email: string, password: string) =>
  email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
