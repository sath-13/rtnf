import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Spinner from "./components/Spinner/Spinner";

function ProtectedRoute({ children, requiredRole }) {
  const { user, checkAuthOnLoad } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Check if the user is authenticated on initial load only
  useEffect(() => {
    if (!hasCheckedAuth) {
      checkAuthOnLoad();
      setHasCheckedAuth(true);
    }
    setIsLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasCheckedAuth]);

  // Allow access to the register page without authentication
  if (location.pathname === "/register") {
    return children;
  }

  // Loading state or undefined user
  if (isLoading || user?.isAuthenticated === undefined) {
    return <Spinner />; // You can replace this with a loading spinner
  }

  // Not Authenticated
  if (!user.isAuthenticated) {
    return <Navigate to="/" />;
  }

  // Role Mismatch - only check if requiredRole is specified
  if (requiredRole && user?.role) {
    // Handle both string and array of roles
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!allowedRoles.includes(user.role)) {
      console.warn(`Unauthorized: User role "${user.role}" does not match ${allowedRoles}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Authenticated and Authorized (or no role restriction)
  return children;
}

export default ProtectedRoute;
