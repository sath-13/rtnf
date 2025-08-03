import { useLocation, Navigate, Outlet } from "react-router-dom";
import { isLoggedIn, getUserDetails } from "../../service";

const AuthGuardAdmin = () => {
    const location = useLocation();
    const { role } = getUserDetails();
    return (isLoggedIn() ? role === 'admin' ? <Outlet /> :  <Navigate to="/unauthorised" state={{ from: location }} replace />  : <Navigate to="/" state={{ from: location }} replace />);
}

export default AuthGuardAdmin;
