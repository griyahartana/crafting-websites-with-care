import { getAdminAuthHeaders } from "@/lib/adminAuth";

const API_ORIGIN =
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)
    ? "https://hartanafarm.my.id"
    : "";

export type CloudFarmState<T> = {
  state: T | null;
  updatedAt: string | null;
  updatedBy: string;
};

export const loadAdminFarmState = async <T>() => {
  const response = await fetch(`${API_ORIGIN}/api/admin-state`, {
    headers: getAdminAuthHeaders(),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Gagal mengambil data cloud.");
  return (await response.json()) as CloudFarmState<T>;
};

export const saveAdminFarmState = async <T>(state: T) => {
  const response = await fetch(`${API_ORIGIN}/api/admin-state`, {
    method: "PUT",
    headers: {
      "content-type": "application/json",
      ...getAdminAuthHeaders(),
    },
    body: JSON.stringify({ state }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error("Gagal menyimpan data cloud.");
  return (await response.json()) as CloudFarmState<T>;
};
