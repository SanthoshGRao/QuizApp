import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, getRole } from "./auth";

interface Props {
  children: ReactNode;
}

function PublicRoute({ children }: Props) {
  const isAuth = isLoggedIn();

  // ✅ If already logged in → redirect away from login
  if (isAuth) {
    const role = getRole();
    return (
      <Navigate
        to={role === "ADMIN" ? "/admin" : "/student"}
        replace
      />
    );
  }

  // ✅ Not logged in → allow access (Login page)
  return <>{children}</>;
}

export default PublicRoute;
