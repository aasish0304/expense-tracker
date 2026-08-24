import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isTokenValid } from "../services/authService";

const ProtectedRoute = () => {
  const location = useLocation();

  const authenticated = isTokenValid();

  if (!authenticated) {
    return (
      <Navigate
        to="/"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;