import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, getRole } from "./auth";

interface Props {
  children: ReactNode;
}

function PublicRoute({ children }: Props) {
  const location = useLocation();

  // Allow reset-password always
  if (location.pathname.startsWith("/reset-password")) {
    return <>{children}</>;
  }

  if (isLoggedIn()) {
    return <Navigate to={getRole() === "ADMIN" ? "/admin" : "/student"} />;
  }

  return <>{children}</>;
}

export default PublicRoute;
