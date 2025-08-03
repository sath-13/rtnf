import { Outlet, useLocation } from "react-router-dom";
import { UserSideSidebar } from "../../components/workspaces/Users/usersidebar";

const PersistentLayout = () => {
  const location = useLocation();
  const isPortfolioRoute = location.pathname.includes("platform-management-feature");

  return (
    <div className="dashboard-container">
      {!isPortfolioRoute && <UserSideSidebar />}
      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
};

export default PersistentLayout;
