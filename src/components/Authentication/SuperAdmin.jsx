import { useLocation, Navigate, Outlet } from "react-router-dom";
import { isLoggedIn, getUserDetails } from "../../service";

const AuthGuardSuperAdmin = () => {
  const location = useLocation();
  const { role = false } = getUserDetails();
  return isLoggedIn() ? (
    role === "superadmin" ? (
      <Outlet />
    ) : (
      <Navigate to="/unauthorised" state={{ from: location }} replace />
    )
  ) : (
    <Navigate to="/" state={{ from: location }} replace />
  );
};

export default AuthGuardSuperAdmin;
