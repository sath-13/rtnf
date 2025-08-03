import React from "react";
import { useNavigate } from "react-router-dom";
import { Dropdown, Menu, Tooltip } from "antd";
import { CgProfile } from "react-icons/cg";
import { RiLogoutCircleLine, RiSettingsLine, 
 // RiDashboardLine, RiTeamLine 
} from "react-icons/ri";
//import { AiOutlineUser, AiOutlineSetting } from "react-icons/ai";
//import { FaProjectDiagram } from "react-icons/fa";
import { MdOutlineWorkspaces } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext"; // Import the useAuth hook
import "./MainWorkspaceSidebar.css";

const SideBar = ({user, onSelect }) => {
  const { logout } = useAuth(); // Access the logout function from context
  const navigate = useNavigate(); // Hook to navigate after logout
 /* const [user, setUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);
*/

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    logout(); // Call logout from the context to clear user data
    navigate("/"); // Redirect to login page
  };

  const menu = (
    <Menu>
      <Menu.Item key="logout" onClick={handleLogout} className="logout-item">
        <RiLogoutCircleLine className="logout-icon" /> Logout
      </Menu.Item>
      <Menu.Item key="settings" 
      onClick={() => onSelect("Settings")}
       className="logout-item">
        <RiSettingsLine className="logout-icon" /> Settings
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="sidebar">
      {/* Logo or Icon Placeholder */}
      <div className="sidebar-header">
        <div className="sidebar-logo">A</div>
      </div>

      {/* Navigation Options */}
      <div className="sidebar-options">
        <Tooltip title="Workspaces" placement="right">
          <div className="sidebar-item" onClick={() => onSelect("workspace")}>
            <MdOutlineWorkspaces className="sidebar-icon" />
            <p>Workspaces</p>
          </div>
        </Tooltip>
        {/* You can add more sidebar options like Settings, Dashboard, etc. */}
      </div>

      {/* User Profile & Logout */}
      {user && (
        <Dropdown overlay={menu} trigger={["click"]} placement="top">
          <div className="sidebar-user-profile-btn">
          {user.userLogo ? (
              <img
                src={user.userLogo}
                alt="User"
                className="user-icon"
              />
            ) : (
              <CgProfile size={30} className="user-icon" />
            )}
            <p className="user-name">{user.fname || "Admin"}</p>
          </div>
        </Dropdown>
      )}
    </div>
  );
};

export default SideBar;
