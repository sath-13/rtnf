import {useLocation,Navigate,Outlet} from "react-router-dom";
import { getUserRole } from "../../Utility/service";


const AllAdminRoutes= ()=>{
    const role=getUserRole();
    const location=useLocation();

    return(
        role && (role === "admin"||role==="superadmin") ? <Outlet/> :<Navigate to="/404" state={{ from: location }} replace /> 
    );
}

export default AllAdminRoutes;