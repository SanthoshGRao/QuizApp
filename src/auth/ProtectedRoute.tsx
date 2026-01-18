import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isLoggedIn, getRole } from "./auth";

interface Props {
  children: ReactNode;
  role?: "ADMIN" | "STUDENT";
}

function ProtectedRoute({ children, role }: Props) {
  const location = useLocation();

  const isAuth = isLoggedIn();
  const mustReset =
    localStorage.getItem("mustChangePassword") === "true";

  // 🚪 Not logged in → Login
  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  // 🔐 Force password reset (only once, safe)
  if (
    mustReset &&
    !location.pathname.startsWith("/reset-password")
  ) {
    return <Navigate to="/reset-password" replace />;
  }

  // 🚫 Block reset page if reset already done
  if (
    !mustReset &&
    location.pathname.startsWith("/reset-password")
  ) {
    const role = getRole();
    return (
      <Navigate
        to={role === "ADMIN" ? "/admin" : "/student"}
        replace
      />
    );
  }

  // 🔒 Role-based access
  if (role && getRole() !== role) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;
