import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

import api from "../services/api";
import { isTokenValid } from "../services/authService";


const ProtectedRoute = ({ adminOnly = false }) => {

  const location = useLocation();

  const authenticated = isTokenValid();

  const [checkingRole, setCheckingRole] = useState(
    adminOnly
  );

  const [isAdmin, setIsAdmin] = useState(false);


  useEffect(() => {

    if (!adminOnly || !authenticated) {
      setCheckingRole(false);
      return;
    }


    const checkAdminRole = async () => {

      try {

        const response = await api.get(
          "/auth/profile/"
        );

        /*
          The profile endpoint can return the user's role.
          If your current ProfileView doesn't return role yet,
          we'll add it in the next step.
        */

        setIsAdmin(
          response.data?.role === "Admin"
        );

      } catch (error) {

        console.error(
          "Unable to verify admin role:",
          error
        );

        setIsAdmin(false);

      } finally {

        setCheckingRole(false);

      }

    };


    checkAdminRole();

  }, [
    adminOnly,
    authenticated,
  ]);


  /* =====================================================
     NOT LOGGED IN
  ===================================================== */

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


  /* =====================================================
     CHECKING ADMIN ROLE
  ===================================================== */

  if (adminOnly && checkingRole) {

    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "inherit",
          color: "#5b5650",
        }}
      >
        Checking access...
      </div>
    );

  }


  /* =====================================================
     ADMIN-ONLY ROUTE
  ===================================================== */

  if (adminOnly && !isAdmin) {

    return (
      <Navigate
        to="/dashboard"
        replace
      />
    );

  }


  /* =====================================================
     AUTHENTICATED USER
  ===================================================== */

  return <Outlet />;

};


export default ProtectedRoute;