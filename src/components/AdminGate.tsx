import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { hasAdminSession } from "@/lib/adminAuth";

type AdminGateProps = {
  children: ReactNode;
};

export const AdminGate = ({ children }: AdminGateProps) => {
  const location = useLocation();

  if (!hasAdminSession()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};
