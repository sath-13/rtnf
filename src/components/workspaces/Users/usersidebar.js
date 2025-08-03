// File: UserSideDashboard.js
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlinePlus, AiOutlineEdit } from "react-icons/ai";
import {
  CloudUploadOutlined,
  ClusterOutlined,
  CommentOutlined,
  UserAddOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import EmployeeHighlightsTabs from "../../Feed/Employeehighli/EmployeeHighlightsTabs";
import { DeleteOutlined } from "@ant-design/icons";
import {
  Dropdown,
  Menu,
  Tooltip,
  Tabs,
  Popover,
  Calendar,
  theme,
  List,
  Card,
  Select,
  Button,
  message,
  Modal,
  Space,
  Switch,
  Spin,
  Typography,
  Tag,
  Input,
  Descriptions,
} from "antd";
import { CgProfile } from "react-icons/cg";
import { RiLogoutCircleLine, RiArrowGoBackLine } from "react-icons/ri";
import {
  FaHome,
  FaUsers,
  FaAssistiveListeningSystems,
  FaCalendarAlt,
} from "react-icons/fa";
import { AiOutlineUserAdd, AiOutlineUsergroupAdd } from "react-icons/ai";
import ListOfActions from "../../Actions/ListOfActions";
import SurveyResponseDashboard from "../../../Pages/SurveyResponses/SurveyResponseDashboard";
import ComplianceDashboard from "../../../Pages/Compliance/ComplianceDashboard";
import UserComplianceTests from "../../../Pages/Compliance/UserComplianceTests";
import ComplySyncForm from "../../../Pages/Compliance/ComplySyncForm";
import ComplianceSurveys from "../../../Pages/Compliance/ComplianceSurveys";
import ComplianceSurveyResponses from "../../../Pages/Compliance/ComplianceSurveyResponses";
import ComplianceSurveyDetail from "../../../Pages/Compliance/ComplianceSurveyDetail";
import UserDashboard from "./UserDash/usersDashbordDisplay";
import TeamDashboard from "../Teams/TeamsDash";
import AnalyticsDashboard from "../Analytics/AnalyticsDashboard.js";
import SurveyDashboard from "../Survey/SurveyDashboard.js";
import StreamDashboard from "../Streams/StreamDash";
import ActionDashboard from "../../Actions/ActionDash/ActionDash";
import { PortfolioHome } from "../../../Pages";
import "./usersidebar.css";
import { getWorkspaceByName } from "../../../api/workspaceapi";
import { eventMessages, UserMessages } from "../../../constants/constants";
import PlatformManagementfeature from "../../../Pages/PlatformMangemenrfeature/PlatformMangamentfeature";
import ProjectDetails from "../../DetailsContent";
import Dashbaord from "../../../Pages/SystemAccessaoriesDashboard";
import ListStock from "../../../Pages/Stock/List";
import AssignItem from "../../../Pages/AssignItems";
import OrganizationFeed from "../../Feed/OrganizationFeed/OrganizationFeed";
import TeamFeed from "../../Feed/TeamFeed";
import FeedbackDisplay from "./Feedback/FeedBack_Display";
import Header from "../../Header/Header";
import UserProfile from "../../Settings/UserProfile";
import CompanyDetailsForm from "../../Settings/CompanyDetailsForm";
import Badge from "../../Settings/Badge/Badge";
import PendingFeedbackRequests from "./Feedback/PendingFeedbackRequets";
import CreateCompany from "../../Domain/CreateCompany";
import CompanyRoles from "../../Domain/CompanyRoles";
import AccessMatrix from "../../Domain/AccessMatrix";
import { getModuleAccess } from "../../../api/domainapi";
import AssetTypeCategory from "../../AssetTypeCategory/AssetCatType";
import AcknowledgementPage from "../../../Pages/AssetAcknowlegemnt/AssetAcknowledgemnt";
import UserProfileImportDashboard from "../../Settings/UserProfileImportDashboard";
import CalendarComponent from "../../ResouceCalendar/ResourceAllocation";
import ReminderFeed from "../../Feed/ReminderFeed";
import TodoListFeed from "../../Feed/TodoListFeed/TodoListFeed";

import { MdEventAvailable } from "react-icons/md";
import CreateEventForm from "../../Events/createEvent";
import {
  getAllEvents,
  markAttendance,
  cancelEvent,
} from "../../../api/eventapi";
import moment from "moment";
import { getUsersInWorkspace } from "../../../api/usersapi";
import TextArea from "antd/es/input/TextArea";
import { toastError, toastSuccess } from "../../../Utility/toast";
import CreateHiring from "../../Hiring/createHiring.jsx";
import { getAllHiring, postDecision } from "../../../api/hiringApi.js";
import Title from "antd/es/skeleton/Title.js";
import { ArrowRightOutlined } from "@ant-design/icons";
import logo from "../../../logo.svg";
import JobFilters from "../../Hiring/JobFilters.jsx";
import { getAllTeams } from "../../../api/teamapi.js";
import { getAllBranches } from "../../../api/companyapi.js";
import HiringDashboard from "../../Hiring/hiringDashboard.jsx";
import { HIRING_ACCESS_ROLES } from "../../../constants/enums.js";
// import AssignBadges from "../../Actions/AssignBadges/AssignBadges";

const { TabPane } = Tabs;

const UserSideSidebar = ({
  user,
  onSelect,
  workspace,
  collapsed,
  accessMap,
}) => {
  const navigate = useNavigate();
  const isSuperAdmin = user?.role === "superadmin";
  const isAdmin = user?.role === "admin";

  const menu = (
    <Menu>
      {isSuperAdmin ? (
        <Menu.Item key="back" onClick={() => navigate(`/dashboard`)}>
          <RiArrowGoBackLine /> Back to Dashboard
        </Menu.Item>
      ) : (
        <Menu.Item key="logout" onClick={() => navigate(`/dashboard`)}>
          <RiLogoutCircleLine /> Back to Dashboard
        </Menu.Item>
      )}
    </Menu>
  );

  const organizationMenu = (
    <Menu selectedKeys={[]} className="custom-popover">
      <Menu.Item
        key="users"
        onClick={() => onSelect("Users")}
        className="sidebar-mitem"
      >
        <UserAddOutlined className="sidebar-micon" />
        <span className="sidebar-mtext"> Users</span>
      </Menu.Item>
      <Menu.Item
        key="feedbacks"
        onClick={() => onSelect("Feedbacks")}
        className="sidebar-mitem"
      >
        <CommentOutlined className="sidebar-micon" />
        <span className="sidebar-mtext"> Feedbacks</span>
      </Menu.Item>
      {isSuperAdmin && (
        <>
          <Menu.Item
            key="teams"
            onClick={() => onSelect("Teams")}
            className="sidebar-mitem"
          >
            <UsergroupAddOutlined className="sidebar-micon" />
            <span className="sidebar-mtext"> Teams</span>
          </Menu.Item>
          <Menu.Item
            key="streams"
            onClick={() => onSelect("Streams")}
            className="sidebar-mitem"
          >
            <CloudUploadOutlined className="sidebar-micon" />
            <span className="sidebar-mtext"> Streams</span>
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-options">
        {
          <div className="sidebar-item" onClick={() => onSelect("Home")}>
            <FaHome className="sidebar-icon" />
            <p className="sidebar-text font-inter">Home</p>
          </div>
        }
        {(user?.role === "superadmin" || user?.role === "admin") && (
          <div className="sidebar-item" onClick={() => onSelect("Analytics")}>
            <svg className="sidebar-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"></path>
            </svg>
            <p className="sidebar-text font-inter">Analytics for PulseSync</p>
          </div>
        )}
        {(user) && (
          <div className="sidebar-item" onClick={() => onSelect("Survey")}>

            <svg className="sidebar-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <rect x="8" y="2" width="8" height="4" rx="1"></rect>
              <path d="M9 18v-4"></path>
              <path d="M12 18V9"></path>
              <path d="M15 18v-6"></path>
            </svg>

            <p className="sidebar-text font-inter">PulseSync(surveys)</p>
          </div>
        )}
        {isSuperAdmin && (
          <div className="sidebar-item" onClick={() => onSelect("Survey Responses")}>
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M7 5h10l1-3-6-2-6 2 1 3z"></path>

  <path d="M17 8H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2z"></path>
  <path d="M15 8V6a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"></path>

  <line x1="9" y1="20" x2="9" y2="16"></line>
  <line x1="12" y1="20" x2="12" y2="14"></line>
  <line x1="15" y1="20" x2="15" y2="18"></line>
</svg>
            <p className="sidebar-text font-inter">Survey Responses</p>
          </div>
        )}
        {(isSuperAdmin || isAdmin) && (
          <div className="sidebar-item" onClick={() => onSelect("Compliance Management")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-shield h-5 w-5 mr-3 flex-shrink-0" data-lov-id="src/components/AppSidebar.tsx:78:22" data-lov-name="item.icon" data-component-path="src/components/AppSidebar.tsx" data-component-line="78" data-component-file="AppSidebar.tsx" data-component-name="item.icon" data-component-content="%7B%22className%22%3A%22h-5%20w-5%20mr-3%20flex-shrink-0%22%7D"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg>



            <p className="sidebar-text font-inter">Compliance Management</p>
          </div>
        )}
        {user && !isSuperAdmin && !isAdmin && (
          <div className="sidebar-item" onClick={() => onSelect("Compliance Tests")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="28" viewBox="0 0 48 28" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">

              <path d="M24 25s-10-5-10-12V5l10-4 10 4v8c0 7-10 12-10 12z" fill="none" stroke="currentColor" stroke-width="2.5" />

              <g transform="translate(4, 14) scale(0.8)">

                <circle cx="5" cy="5" r="5" fill="currentColor" stroke="none" />

                <path d="M10 18v-2a5 5 0 0 0-5-5H5a5 5 0 0 0-5 5v2" fill="currentColor" stroke="none" />
              </g>
            </svg>

            <p className="sidebar-text font-inter">Compliance Tests</p>
          </div>
        )}
        {(isSuperAdmin || user) && (
          <>
            {accessMap["Home"] ? (
              <Tooltip
                overlayClassName="custom-tooltip"
                title="Home"
                placement="right"
              >
                <div className="sidebar-item" onClick={() => onSelect("Home")}>
                  <FaHome className="sidebar-icon" />
                  <p className="sidebar-text font-inter">Home</p>
                </div>
              </Tooltip>
            ) : null}

            {accessMap["My Organization"] ? (
              <Popover
                placement="rightTop"
                overlayClassName="custom-popover"
                content={organizationMenu}
                trigger="hover"
              >
                <Tooltip placement="right">
                  <div className="sidebar-item">
                    <FaUsers className="sidebar-icon" />
                    <p className="sidebar-text font-inter">My Organization</p>
                  </div>
                </Tooltip>
              </Popover>
            ) : null}

            {accessMap["System & Accessories"] ? (
              <Tooltip title="Systems & Accessories Dash" placement="right">
                <div
                  className="sidebar-item"
                  onClick={() => onSelect("Systems & Accesories")}
                >
                  <ClusterOutlined className="sidebar-icon" />
                  <p className="sidebar-text font-inter">
                    Systems & Accesories
                  </p>
                </div>
              </Tooltip>
            ) : null}

            {accessMap["Actions"] ? (
              <Tooltip title="Actions" placement="right">
                <div
                  className="sidebar-item"
                  onClick={() => onSelect("Actions")}
                >
                  <AiOutlinePlus className="sidebar-icon" />
                  <p className="sidebar-text font-inter">Actions</p>
                </div>
              </Tooltip>
            ) : null}

            {accessMap["Domain Setup"] ? (
              <Tooltip title="Domain Setup" placement="right">
                <div
                  className="sidebar-item"
                  onClick={() => onSelect("Domain Setup")}
                >
                  <AiOutlineEdit className="sidebar-icon" />
                  <p className="sidebar-text font-inter">Domain Setup</p>
                </div>
              </Tooltip>
            ) : null}

            {accessMap["Project Calendar"] ? (
              <Tooltip title="Project Calendar" placement="right">
                <div
                  className="sidebar-item"
                  onClick={() => onSelect("Project Calendar")}
                >
                  <FaCalendarAlt className="sidebar-icon" />
                  <p className="sidebar-text font-inter">Project Calendar</p>
                </div>
              </Tooltip>
            ) : null}

            {accessMap["Portfolio"] ? (
              <Tooltip title="Portfolio management" placement="right">
                <div
                  className="sidebar-item"
                  onClick={() => onSelect("Portfolio management")}
                >
                  <FaAssistiveListeningSystems className="sidebar-icon" />
                  <p className="sidebar-text font-inter">Portfolio</p>
                </div>
              </Tooltip>
            ) : null}

            {accessMap["Events"] ? (
              <Tooltip title="Events" placement="right">
                <div
                  className="sidebar-item"
                  onClick={() => onSelect("Events")}
                >
                  <MdEventAvailable className="sidebar-icon" />
                  <p className="sidebar-text">Events</p>
                </div>
              </Tooltip>
            ) : null}

            {accessMap["Hiring"] ? (
              <Tooltip title="Hiring" placement="right">
                <div
                  className="sidebar-item"
                  onClick={() => onSelect("Hiring")}
                >
                  <UsergroupAddOutlined className="sidebar-icon" />
                  <p className="sidebar-text">Hiring</p>
                </div>
              </Tooltip>
            ) : null}
          </>
        )}
      </div>

      <Dropdown overlay={menu} trigger={["click"]} placement="top">
        <div className="sidebar-user-profile-btn">
          {isSuperAdmin ? (
            <>
              {workspace?.logo ? (
                <img
                  src={workspace.logo}
                  alt="Workspace Logo"
                  className="user-icon"
                />
              ) : (
                <CgProfile size={30} className="user-icon" />
              )}
              <p className="user-name">
                {workspace?.workspacename || "Workspace"}
              </p>
            </>
          ) : (
            <>
              {workspace?.logo ? (
                <img
                  src={workspace.logo}
                  alt="Workspace Logo"
                  className="user-icon"
                />
              ) : (
                <CgProfile size={30} className="user-icon" />
              )}
              <p className="user-name font-inter">
                {workspace?.workspacename || "Workspace"}
              </p>
            </>
          )}
        </div>
      </Dropdown>
    </div>
  );
};

const onPanelChange = (value, mode) => {
  console.log(value.format("YYYY-MM-DD"), mode);
};

const onChange = (key) => {
  console.log(key);
};
const items = [
  {
    key: "1",
    label: "Birthdays",
    children: (
      <EmployeeHighlightsTabs
        title={"Birthdays"}
        imgSrc="https://plus.unsplash.com/premium_vector-1683122001866-6064967526e3?q=80&w=675&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
    ),
  },
  {
    key: "2",
    label: "Anniversaries",
    children: (
      <EmployeeHighlightsTabs
        title={"Anniversaries"}
        imgSrc="https://plus.unsplash.com/premium_vector-1682297976073-02cb0566a128?q=80&w=653&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
    ),
  },
  {
    key: "3",
    label: "New joinees",
    children: (
      <EmployeeHighlightsTabs
        title={"New joinees"}
        imgSrc="https://plus.unsplash.com/premium_vector-1682299666311-ef9c9836ae60?q=80&w=768&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      />
    ),
  },
];

const UserSideDashboard = () => {
  const { workspacename } = useParams();

  // Helper function to initialize state from localStorage
  const getInitialSection = () => {
    if (workspacename) {
      const savedSection = localStorage.getItem(`activeSection_${workspacename}`);
      // Check for a valid, non-null saved value before parsing
      if (savedSection && savedSection !== "null") {
        return JSON.parse(savedSection);
      }
    }
    // If nothing is found, default to "Home"
    return "Home";
  };

  const [activeSection, setActiveSection] = useState(getInitialSection);
  const [newActionCreated, setNewActionCreated] = useState(false);
  const [user, setUser] = useState(null);
  const [workspace, setWorkspace] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [settingsTabKey, setSettingsTabKey] = useState("1");
  const [accessMap, setAccessMap] = useState({});
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hiringRequests, setHiringRequests] = useState([]);
  
  // Compliance-related states
  const [complianceView, setComplianceView] = useState('dashboard'); // 'dashboard', 'create', 'surveys', 'responses', 'survey'
  const [selectedComplianceSurvey, setSelectedComplianceSurvey] = useState(null);
  const [complianceAction, setComplianceAction] = useState(null); // 'take', 'responses'

  const { Option } = Select;
  const { Text, Title } = Typography;
  const loggedUser = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.id || user?._id || null;
    } catch (e) {
      return null;
    }
  })();

  const now = new Date();

  const fetchEvents = async () => {
    try {
      const response = await getAllEvents();
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    const fetchRequests = async () => {
      setLoading(true);
      try {
        const data = await getAllHiring(user?.jobRole, user?._id);
        setHiringRequests(data);
      } catch (err) {
        console.error("Failed to load hiring requests:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user && user.jobRole) {
      fetchRequests();
    }
  }, [user]);

  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const handleSettingsClick = () => {
    setActiveSection("settings");
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (!workspacename) return;
    const fetchWorkspace = async () => {
      try {
        const response = await getWorkspaceByName(workspacename);
        setWorkspace(response);
      } catch (error) {
        console.error(UserMessages.USER_WORKSPACE_FETCH_ERR, error);
      }
    };
    fetchWorkspace();
  }, [workspacename]);

  useEffect(() => {
    const fetchAccessMap = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user"));
        if (!userData) return;

        const companyId = userData.companyId;
        const roleName = userData.jobRole;
        const role = userData.role;

        const map = await getModuleAccess(companyId, roleName, role); // Call API
        setAccessMap(map); // Update state
      } catch (error) {
        console.error("Error fetching access map:", error);
      }
    };

    fetchAccessMap(); // Trigger API call
  }, []);

  // This effect runs whenever the active section changes, SAVING the new state
  useEffect(() => {
    if (workspacename) {
      localStorage.setItem(
        `activeSection_${workspacename}`,
        JSON.stringify(activeSection)
      );
    }
  }, [activeSection, workspacename]);

  // Reset compliance view when active section changes
  useEffect(() => {
    if (activeSection !== "Compliance Management") {
      setComplianceView('dashboard');
      setSelectedComplianceSurvey(null);
      setComplianceAction(null);
    }
  }, [activeSection]);

  const { token } = theme.useToken();
  const wrapperStyle = {
    width: "100%",
    borderRadius: token.borderRadiusLG,
  };

  const [selectedAttendance, setSelectedAttendance] = useState({});

  const handleUserSelect = (eventId, userIds) => {
    setSelectedUsers((prev) => ({
      ...prev,
      [eventId]: userIds,
    }));
  };

  const handleAttendanceChange = (eventId, value) => {
    setSelectedAttendance((prev) => ({
      ...prev,
      [eventId]: value,
    }));
  };
  const [attendanceStatus, setAttendanceStatus] = useState({});

  const handleToggleAttendance = async (eventId, checked) => {
    setAttendanceStatus((prev) => ({ ...prev, [eventId]: checked }));

    try {
      await markAttendance(eventId, {
        userIds: [loggedUser],
        isAttending: checked,
      });
      toastSuccess({
        title: "Success",
        description: `Marked as ${checked ? "Present" : "Absent"}`,
      });
    } catch (err) {
      console.error(err);
      toastError({
        title: "Error",
        description: eventMessages.FAILED_TO_MARKATTENDANCE,
      });
    }
  };

  const submitAttendance = async (eventId) => {
    const userIds = selectedUsers[eventId] || [];
    const isAttending = selectedAttendance[eventId];

    if (!userIds.length) return message.warning("Select at least one user");
    if (isAttending === undefined)
      return message.warning("Select attendance status");

    try {
      console.log("Submitting:", { userIds, isAttending });
      const res = await markAttendance(eventId, { userIds, isAttending });
      toastSuccess({
        title: "Success",
        description: eventMessages.ATTENDANCE_UPDATED_SUCCESSFULLY,
      });
    } catch (err) {
      console.error(err);
      message.error("Failed to submit attendance");
      toastError({
        title: "Error",
        description: eventMessages.FAILED_TO_UPDATE_ATTENDANCE,
      });
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await getUsersInWorkspace("workspaces");
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchUsers();
  }, []);

  const handleCancelEvent = async (eventId, reason) => {
    try {
      await cancelEvent(eventId, reason);
      toastSuccess({
        title: "Success",
        description: eventMessages.EVENT_CANCELLED,
      });
      fetchEvents();
    } catch (err) {
      toastError({
        title: "Error",
        description: eventMessages.FAILED_TO_CANCEL_EVENT,
      });
    }
  };
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reasonType, setReasonType] = useState("");

  const handleApplyClick = (request) => {
    setSelectedRequest(request);
    setIsModalVisible(true);
  };

  // state for decision popup
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [reasonText, setReasonText] = useState("");

  // after selecting Accept/Reject:
  const handleDecisionClick = (type) => {
    const lower = type.toLowerCase(); //'accepted' or 'rejected'
    setReasonType(lower); // store for submission
    setReasonModalOpen(true);
  };

  const handleReasonSubmit = async (id, status, reason) => {
    try {
      console.log("Submitting decision:", status, reason);
      const result = await postDecision(id, status, reason);
      console.log("Decision saved:", result);
      toastSuccess({ title: "Success", description: `Request ${status}` });
      setReasonModalOpen(false);
      setIsModalVisible(false);
      // Optionally refresh list here
    } catch (err) {
      console.error("Decision submission error:", err);
      toastError({ title: "Error", description: "Failed to save decision" });
    }
  };


  const [teams, setTeams] = useState([]);
  const [branches, setBranches] = useState([]);
  const [location, setLocation] = useState(null);
  const [pod, setPod] = useState(null);
  const [search, setSearch] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);


  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await getAllTeams(workspacename);

        const teamsArray = Array.isArray(response?.data) ? response.data : [];
        setTeams(teamsArray);
      } catch {
        toastError({
          title: "Error",
          description: UserMessages.USER_TEAM_FETCH_ERR_MSG,
        });
      }
    };


    const fetchBranches = async () => {
      try {
        const response = await getAllBranches();
        console.log(response);

        const branchList = Array.isArray(response) ? response : response?.branches ?? [];
        setBranches(branchList);
      } catch {
        // notification.error({ message: "Error", description: UserMessages.USER_BRANCH_FETCH_FAIL });
        toastError({ title: "Error", description: UserMessages.USER_BRANCH_FETCH_FAIL });
      }
    };

    fetchTeams();
    fetchBranches();
  }, [workspacename]);

  const filteredJobs = hiringRequests.filter((job) => {

    const matchLocation = location ? job.location === location : true;
    const matchPod = pod ? job.podName === pod : true;
    const matchSearch = search ? job.designation.toLowerCase().includes(search.toLowerCase()) : true;

    return matchLocation && matchPod && matchSearch;
  });

  const handleSelectJob = (job) => {
    console.log("Selected job:", job); // <-- this should never be null
    setSelectedJob(job);
    setIsModalVisible(true);
  };

  // Compliance navigation handlers
  const handleComplianceNavigateToCreateTest = () => {
    setComplianceView('create');
  };

  const handleComplianceNavigateToSurveys = () => {
    setComplianceView('surveys');
  };

  const handleComplianceNavigateToSurveyResponses = () => {
    setComplianceView('responses');
  };

  const handleComplianceNavigateToSurvey = (surveyId, action) => {
    setSelectedComplianceSurvey(surveyId);
    setComplianceAction(action);
    setComplianceView('survey');
  };

  const handleComplianceBackToDashboard = () => {
    setComplianceView('dashboard');
    setSelectedComplianceSurvey(null);
    setComplianceAction(null);
  };


  // Guard clause: Show a spinner while loading or if the user is not yet available.
  if (loading || !user) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <Header
        labelPrefix="user"
        user={user}
        workspace={workspace}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/";
        }}
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={toggleSidebar}
        onSettingsClick={handleSettingsClick}
      />
      <UserSideSidebar
        user={user}
        onSelect={setActiveSection}
        workspace={workspace}
        collapsed={sidebarCollapsed}
        accessMap={accessMap}
      />

      <div
        className={`main-content !grid !grid-cols-6 !py-3 h-screen mt-16 overflow-y-auto ${sidebarCollapsed ? "collapsed" : ""
          }`}
      >
        {/* left side container */}
        {activeSection === "Home" && (
          <div className="col-span-2">
            <h1 className="text-primary-text !text-2xl font-rubik mt-2 !mb-10">
              Calendar
            </h1>
            {/* calender */}
            <div className="pr-5 rounded-lg" style={wrapperStyle}>
              <Calendar
                className="custom-calendar"
                fullscreen={false}
                onPanelChange={onPanelChange}
                headerRender={() => null}
              />
            </div>
            {/* tabs of employeeshighlight */}
            <div className="!py-5 !pr-5">
              <Tabs
                className="font-inter"
                defaultActiveKey="1"
                items={items}
                onChange={onChange}
              />
            </div>
          </div>
        )}

        {/* sidebar content container */}
        <div className={activeSection === "Home" ? "col-span-4" : "col-span-6"}>
          {activeSection === "Home" && (
            <Tabs className=" font-inter" defaultActiveKey="1">
              <TabPane tab="Organizations" key="1">
                <OrganizationFeed />
              </TabPane>
              <TabPane
                tab={
                  user?.role === "superadmin" ? "Teams" : user?.teamTitle?.[0]
                }
                key="2"
              >
                <TeamFeed />
              </TabPane>
              <TabPane tab="Reminder" key="3">
                <ReminderFeed />
              </TabPane>
              <TabPane tab="To-Do list" key="4">
                <TodoListFeed />
              </TabPane>
            </Tabs>
          )}

          {activeSection === "Users" && <UserDashboard />}
          {activeSection === "Feedbacks" && (
            <Tabs className=" font-inter" defaultActiveKey="1">
              <TabPane tab="FeedBacks" key="1">
                <FeedbackDisplay userId={user?.id || user?._id} />
              </TabPane>
              <TabPane tab="Pending FeedBack Requests" key="2">
                <PendingFeedbackRequests />
              </TabPane>
            </Tabs>
          )}
          {activeSection === "Teams" && user?.role === "superadmin" && (
            <TeamDashboard />
          )}
          {activeSection === "Analytics" && (user.role === "superadmin" || user.role === "admin") && (
            <AnalyticsDashboard workspace={workspace} />
          )}
          {activeSection === "Survey" && (user) && (
            <SurveyDashboard workspace={workspace} user={user} />
          )}
          {activeSection === "Streams" && user?.role === "superadmin" && (
            <StreamDashboard />
          )}
          {activeSection === "Project Calendar" && (
            <Tabs defaultActiveKey="1">
              {user?.role === "superadmin" && (
                <>
                  <TabPane tab="Calendar " key="1">
                    <CalendarComponent />
                  </TabPane>
                </>
              )}
            </Tabs>
          )}
          {activeSection === "Systems & Accesories" && (
            <Tabs className="font-inter" defaultActiveKey="1">
              {user?.role === "superadmin" && (
                <>
                  <TabPane tab="Summary " key="1">
                    <Dashbaord />
                  </TabPane>
                  <TabPane tab="Assest List" key="2">
                    <ListStock />
                  </TabPane>
                  <TabPane tab="Assest Acknowledgement" key="3">
                    <AcknowledgementPage />
                  </TabPane>
                  <TabPane tab="Assest Category and Assests Types" key="4">
                    <AssetTypeCategory />
                  </TabPane>
                </>
              )}
              <TabPane tab="Assigned Assests" key="5">
                <AssignItem />
              </TabPane>
            </Tabs>
          )}

          {activeSection === "Events" &&
            (() => {
              return (
                <Tabs defaultActiveKey="1">
                  {user?.role === "superadmin" && (
                    <>
                      <TabPane tab="Create Event" key="0">
                        <CreateEventForm fetchEvents={fetchEvents} />
                      </TabPane>

                      <TabPane tab="All Events" key="1">
                        <div style={{ maxHeight: "500px" }}>
                          <List
                            style={{
                              overflowY: "auto",
                              marginTop: "2rem",
                              padding: "16px",
                              backgroundColor: "#f9f9fb",
                              borderRadius: "10px",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                            }}
                            bordered={false}
                            dataSource={events}
                            renderItem={(event) => (
                              <List.Item
                                style={{ marginBottom: "16px", padding: 0 }}
                              >
                                <Card
                                  style={{
                                    width: "100%",
                                    backgroundColor:
                                      event.status === "cancelled"
                                        ? "#fff1f0"
                                        : "#ffffff",
                                    borderRadius: "10px",
                                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                                    border: "1px solid #f0f0f0",
                                  }}
                                  title={
                                    <div
                                      style={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontWeight: 600,
                                          fontSize: "16px",
                                          color: "#333",
                                        }}
                                      >
                                        {event.title}
                                      </span>
                                      {event.status === "cancelled" && (
                                        <span
                                          style={{
                                            color: "#cf1322",
                                            fontWeight: 600,
                                            fontSize: "14px",
                                          }}
                                        >
                                          CANCELLED
                                        </span>
                                      )}
                                    </div>
                                  }
                                  extra={
                                    <Button
                                      danger
                                      size="small"
                                      disabled={event.status === "cancelled"}
                                      icon={<DeleteOutlined />}
                                      style={{
                                        borderRadius: "6px",
                                        fontWeight: 600,
                                        padding: "4px 12px",
                                        backgroundColor:
                                          event.status === "cancelled"
                                            ? "#f5f5f5"
                                            : "#ff4d4f",
                                        color:
                                          event.status === "cancelled"
                                            ? "#aaa"
                                            : "#fff",
                                        border: "none",
                                        cursor:
                                          event.status === "cancelled"
                                            ? "not-allowed"
                                            : "pointer",
                                        boxShadow:
                                          event.status !== "cancelled"
                                            ? "0 2px 8px rgba(255,77,79,0.3)"
                                            : "none",
                                        transition: "all 0.3s ease-in-out",
                                      }}
                                      onClick={() => {
                                        setSelectedEventId(event._id);
                                        setIsModalVisible(true);
                                      }}
                                    // onClick={() => handleCancelEvent(event._id)}
                                    >
                                      Cancel
                                    </Button>
                                  }
                                >
                                  {event.description && (
                                    <p
                                      style={{
                                        marginBottom: 12,
                                        color: "#595959",
                                      }}
                                    >
                                      {event.description}
                                    </p>
                                  )}

                                  {event.sessions?.length > 0 && (
                                    <p
                                      style={{
                                        marginBottom: 8,
                                        color: "#4a4a4a",
                                      }}
                                    >
                                      <strong>Date and Time:</strong>{" "}
                                      {moment(
                                        event.sessions[0].startTime
                                      ).format("YYYY-MM-DD HH:mm")}{" "}
                                      <strong>to</strong>{" "}
                                      {moment(
                                        event.sessions[
                                          event.sessions.length - 1
                                        ].endTime
                                      ).format("YYYY-MM-DD HH:mm")}
                                    </p>
                                  )}

                                  <p
                                    style={{
                                      marginBottom: 8,
                                      color: "#4a4a4a",
                                    }}
                                  >
                                    <strong>Created At:</strong>{" "}
                                    {moment(
                                      event.createdAt || event.date
                                    ).format("YYYY-MM-DD")}
                                  </p>

                                  {event.status === "cancelled" && (
                                    <div
                                      style={{
                                        color: "#cf1322",
                                        fontWeight: 500,
                                        marginTop: 12,
                                      }}
                                    >
                                      <p>This event was cancelled.</p>
                                      <p>
                                        Reason:{" "}
                                        {event.cancelReason || "Not specified"}
                                      </p>
                                    </div>
                                  )}
                                </Card>
                              </List.Item>
                            )}
                          />
                        </div>
                      </TabPane>
                    </>
                  )}

                  <TabPane tab="Upcoming Events" key="2">
                    <div style={{ maxHeight: "500px" }}>
                      <div
                        style={{
                          maxHeight: "500em",
                          padding: "16px",
                          backgroundColor: "#f9f9f9",
                          borderRadius: "8px",
                        }}
                      >
                        {events.filter(
                          (event) =>
                            event.status !== "cancelled" &&
                            (user?.role === "superadmin" ||
                              event.userAssigned?.some(
                                (id) => id?.toString() === loggedUser
                              )) &&
                            event.sessions.some(
                              (session) =>
                                new Date(session.endTime) > new Date()
                            )
                        ).length === 0 ? (
                          <div
                            style={{
                              textAlign: "center",
                            }}
                          >
                            <p
                              style={{ fontSize: "24px", marginBottom: "8px" }}
                            >
                              📅
                            </p>
                            No upcoming events available
                          </div>
                        ) : (
                          events
                            .filter(
                              (event) =>
                                event.status !== "cancelled" &&
                                (user?.role === "superadmin" ||
                                  event.userAssigned?.some(
                                    (id) => id?.toString() === loggedUser
                                  )) &&
                                event.sessions.some(
                                  (session) =>
                                    new Date(session.endTime) > new Date()
                                )
                            )
                            .map((event) => (
                              <div
                                key={event._id}
                                style={{
                                  marginBottom: "16px",
                                  borderRadius: "10px",
                                  backgroundColor: "#fff",
                                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.06)",
                                  padding: "16px 20px",
                                  transition: "box-shadow 0.3s ease",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                  }}
                                >
                                  <h3
                                    style={{
                                      margin: 0,
                                      fontWeight: 600,
                                      fontSize: "18px",
                                      color: "#1f1f1f",
                                    }}
                                  >
                                    {event.title}
                                  </h3>
                                </div>

                                {event.description && (
                                  <p
                                    style={{
                                      margin: "8px 0",
                                      color: "#595959",
                                    }}
                                  >
                                    {event.description}
                                  </p>
                                )}

                                {event.sessions?.length > 0 && (
                                  <p style={{ marginBottom: 6 }}>
                                    <strong style={{ color: "#595959" }}>
                                      Date and Time:
                                    </strong>{" "}
                                    {moment(event.sessions[0].startTime).format(
                                      "YYYY-MM-DD HH:mm"
                                    )}{" "}
                                    <strong>to</strong>{" "}
                                    {moment(
                                      event.sessions[event.sessions.length - 1]
                                        .endTime
                                    ).format("YYYY-MM-DD HH:mm")}
                                  </p>
                                )}

                                <p style={{ marginBottom: 0 }}>
                                  <strong style={{ color: "#595959" }}>
                                    Created At:
                                  </strong>{" "}
                                  {moment(event.createdAt || event.date).format(
                                    "YYYY-MM-DD"
                                  )}
                                </p>
                                <div style={{ marginTop: "10px" }}>
                                  <strong style={{ marginRight: 10 }}>
                                    Attendance:
                                  </strong>
                                  <Switch
                                    checkedChildren="Yes"
                                    unCheckedChildren="No"
                                    checked={
                                      attendanceStatus[event._id] || false
                                    }
                                    onChange={(checked) =>
                                      handleToggleAttendance(event._id, checked)
                                    }
                                  />
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </TabPane>

                  <TabPane tab="Past Events" key="3">
                    <div style={{ maxHeight: "500px" }}>
                      <div
                        style={{
                          maxHeight: "500em",
                          paddingRight: "10px",
                          marginTop: "1.5rem",
                          backgroundColor: "#f9f9f9",
                          padding: "16px",
                          borderRadius: "8px",
                        }}
                      >
                        {events.filter(
                          (event) =>
                            (user?.role === "superadmin" ||
                              event.userAssigned?.some(
                                (id) => id?.toString() === loggedUser
                              )) &&
                            (event.sessions.every(
                              (session) =>
                                new Date(session.endTime) <= new Date()
                            ) ||
                              event.status === "cancelled")
                        ).length === 0 ? (
                          <div
                            style={{
                              textAlign: "center",
                            }}
                          >
                            <p
                              style={{ fontSize: "24px", marginBottom: "8px" }}
                            >
                              🗓️
                            </p>
                            No past events to display
                          </div>
                        ) : (
                          events
                            .filter(
                              (event) =>
                                (user?.role === "superadmin" ||
                                  event.userAssigned?.some(
                                    (id) => id?.toString() === loggedUser
                                  )) &&
                                (event.sessions.every(
                                  (session) =>
                                    new Date(session.endTime) <= new Date()
                                ) ||
                                  event.status === "cancelled")
                            )
                            .map((event) => (
                              <Card
                                key={event._id}
                                title={
                                  <span
                                    style={{ fontSize: 16, fontWeight: 600 }}
                                  >
                                    {event.title}
                                  </span>
                                }
                                style={{
                                  marginBottom: "1.5rem",
                                  backgroundColor:
                                    event.status === "cancelled"
                                      ? "#fff1f0"
                                      : "#ffffff",
                                  border: "1px solid #f0f0f0",
                                  borderRadius: "12px",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
                                  transition: "all 0.3s ease",
                                }}
                                headStyle={{
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                {event.description && (
                                  <p
                                    style={{
                                      marginBottom: 12,
                                      color: "#595959",
                                    }}
                                  >
                                    {event.description}
                                  </p>
                                )}

                                {event.sessions?.length > 0 && (
                                  <p style={{ marginBottom: 8 }}>
                                    <strong>Date and Time:</strong>{" "}
                                    {moment(event.sessions[0].startTime).format(
                                      "YYYY-MM-DD HH:mm"
                                    )}{" "}
                                    <strong>to</strong>{" "}
                                    {moment(
                                      event.sessions[event.sessions.length - 1]
                                        .endTime
                                    ).format("YYYY-MM-DD HH:mm")}
                                  </p>
                                )}

                                <p style={{ marginBottom: 12 }}>
                                  <strong>Created At:</strong>{" "}
                                  {moment(event.createdAt || event.date).format(
                                    "YYYY-MM-DD"
                                  )}
                                </p>

                                {event.status === "cancelled" &&
                                  event.cancelReason && (
                                    <div
                                      style={{
                                        backgroundColor: "#fff2f0",
                                        padding: "10px 14px",
                                        borderRadius: "8px",
                                        border: "1px solid #ffa39e",
                                        marginTop: "12px",
                                      }}
                                    >
                                      <p
                                        style={{
                                          color: "#cf1322",
                                          fontWeight: "bold",
                                          marginBottom: 6,
                                        }}
                                      >
                                        This event was cancelled.
                                      </p>
                                      <p
                                        style={{
                                          color: "#cf1322",
                                          marginBottom: 0,
                                        }}
                                      >
                                        <strong>Reason:</strong>{" "}
                                        {event.cancelReason}
                                      </p>
                                    </div>
                                  )}
                              </Card>
                            ))
                        )}
                      </div>
                    </div>
                  </TabPane>

                  {user?.role === "superadmin" && (
                    <TabPane tab="Completed Events" key="4">
                      <div
                        style={{
                          maxHeight: "500px",
                        }}
                      >
                        <List
                          style={{
                            overflowY: "auto",
                            marginTop: "2rem",
                            padding: "16px",
                            backgroundColor: "#f9f9fb",
                            borderRadius: "10px",
                            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                          }}
                          bordered
                          dataSource={events.filter(
                            (event) =>
                              event.status === "completed" ||
                              event.status === "cancelled" ||
                              event.sessions?.every(
                                (session) =>
                                  new Date(session.endTime) <= new Date()
                              )
                          )}
                          renderItem={(event) => (
                            <List.Item>
                              <Card
                                style={{ width: "100%" }}
                                title={event.title}
                              >
                                <p>{event.description}</p>

                                {event.sessions?.length > 0 && (
                                  <p>
                                    <strong>Date and Time:</strong>{" "}
                                    {moment(event.sessions[0].startTime).format(
                                      "YYYY-MM-DD HH:mm"
                                    )}{" "}
                                    <strong>To</strong>{" "}
                                    {moment(
                                      event.sessions[event.sessions.length - 1]
                                        .endTime
                                    ).format("YYYY-MM-DD HH:mm")}
                                  </p>
                                )}

                                <p>
                                  <strong>Created At:</strong>{" "}
                                  {moment(event.createdAt || event.date).format(
                                    "YYYY-MM-DD"
                                  )}
                                </p>

                                {event.status !== "cancelled" ? (
                                  <>
                                    <Select
                                      mode="multiple"
                                      style={{ width: 200 }}
                                      placeholder="Select Users"
                                      value={selectedUsers[event._id] || []}
                                      onChange={(value) =>
                                        handleUserSelect(event._id, value)
                                      }
                                    >
                                      {Array.isArray(users) &&
                                        users.map((user) => (
                                          <Option
                                            key={user._id}
                                            value={user._id}
                                          >
                                            {user.fname} {user.lname || ""}
                                          </Option>
                                        ))}
                                    </Select>

                                    <Select
                                      style={{ width: 200, marginLeft: 8 }}
                                      placeholder="Mark Attendance"
                                      onChange={(value) =>
                                        handleAttendanceChange(event._id, value)
                                      }
                                    >
                                      <Select.Option value={true}>
                                        Present
                                      </Select.Option>
                                      <Select.Option value={false}>
                                        Absent
                                      </Select.Option>
                                    </Select>

                                    <Button
                                      type="primary"
                                      style={{
                                        marginLeft: 8,
                                        marginTop: 8,
                                        background: "#536dfe",
                                      }}
                                      onClick={() =>
                                        submitAttendance(event._id)
                                      }
                                    >
                                      Submit Attendance
                                    </Button>
                                  </>
                                ) : (
                                  <p
                                    style={{ color: "red", marginTop: "10px" }}
                                  >
                                    <strong>This event was cancelled.</strong>
                                  </p>
                                )}
                              </Card>
                            </List.Item>
                          )}
                        />
                      </div>
                    </TabPane>
                  )}
                </Tabs>
              );
            })()}

          {activeSection === "Hiring" &&
            (loading ? (
              <p>Loading...</p>
            ) : (
              <Tabs defaultActiveKey="1">
                {(HIRING_ACCESS_ROLES.includes(user?.jobRole) || user?.role === "superadmin") && (
                  <TabPane tab="Create" key="1">
                    <CreateHiring />
                  </TabPane>
                )}


                <TabPane className="flex flex-wrap gap-4" tab="Listing" key="2">
                  <div>
                    <JobFilters
                      teams={teams}
                      branches={branches}
                      onBranchChange={setLocation}
                      onTeamChange={setPod}
                      onSearch={setSearch}
                    />
                    <HiringDashboard
                      jobs={filteredJobs}
                      user={user}
                    />
                  </div>


                </TabPane>
              </Tabs>
            ))}

          {activeSection === "Actions" && (
            <Tabs defaultActiveKey="1">
              <TabPane tab="Action Dashboard" key="1">
                <ActionDashboard
                  setNewActionCreated={setNewActionCreated}
                  isFromCreate={true}
                />
              </TabPane>
              <TabPane tab="List of Actions" key="2">
                <ListOfActions
                  newActionCreated={newActionCreated}
                  userAssigned={user?.assignedUser}
                  isFromList={true}
                />
              </TabPane>
            </Tabs>
          )}
          {activeSection === "Domain Setup" && (
            <Tabs className="custom-tabs font-inter" defaultActiveKey="1">
              <TabPane tab="Companies" key="1">
                <CreateCompany />
              </TabPane>
              <TabPane tab="Create Company Roles" key="2">
                <CompanyRoles />
              </TabPane>
              <TabPane tab="Role Access Matrix" key="3">
                <AccessMatrix />
              </TabPane>
            </Tabs>
          )}
          {activeSection === "Portfolio management" && !selectedProjectId && (
            <div className="portfolio-overlay">
              <PlatformManagementfeature>
                <PortfolioHome
                  setSelectedProjectId={setSelectedProjectId}
                  setActiveTab={setActiveSection}
                />
              </PlatformManagementfeature>
            </div>
          )}
          {activeSection === "projectdetails" && selectedProjectId && (
            <ProjectDetails projectId={selectedProjectId} />
          )}
          {activeSection === "Survey Responses" && user?.role === "superadmin" && (
            <SurveyResponseDashboard hideBackButton={true} workspace={workspace} />
          )}
          {activeSection === "Compliance Management" && (user?.role === "superadmin" || user?.role === "admin") && (
            <div>
              {complianceView === 'dashboard' && (
                <ComplianceDashboard 
                  hideBackButton={true}
                  onNavigateToCreateTest={handleComplianceNavigateToCreateTest}
                  onNavigateToSurveys={handleComplianceNavigateToSurveys}
                  onNavigateToSurveyResponses={handleComplianceNavigateToSurveyResponses}
                  onNavigateToSurvey={handleComplianceNavigateToSurvey}
                  onBackToDashboard={handleComplianceBackToDashboard}
                />
              )}
              {complianceView === 'create' && (
                <ComplySyncForm 
                  onBackToDashboard={handleComplianceBackToDashboard}
                  hideBackButton={true}
                />
              )}
              {complianceView === 'surveys' && (
                <ComplianceSurveys 
                  hideBackButton={true}
                  hideCreateButton={true}
                  onBackToDashboard={handleComplianceBackToDashboard}
                  onCreateNewSurvey={handleComplianceNavigateToCreateTest}
                  onSurveyClick={(surveyId) => handleComplianceNavigateToSurvey(surveyId, 'take')}
                  onViewResponses={(surveyId) => handleComplianceNavigateToSurvey(surveyId, 'responses')}
                />
              )}
              {complianceView === 'responses' && (
                <ComplianceSurveyResponses 
                  hideBackButton={true}
                  onBackToDashboard={handleComplianceBackToDashboard}
                />
              )}
              {complianceView === 'survey' && selectedComplianceSurvey && (
                <ComplianceSurveyDetail 
                  surveyId={selectedComplianceSurvey} 
                  action={complianceAction}
                  hideBackButton={true}
                  onBackToDashboard={handleComplianceBackToDashboard}
                />
              )}
            </div>
          )}
          {activeSection === "Compliance Tests" && user && user?.role !== "superadmin" && user?.role !== "admin" && (
            <UserComplianceTests />
          )}
          {activeSection === "settings" && (
            <div>
              <div style={{ marginBottom: "16px" }}>
                <button
                  className="custom-button"
                  onClick={() => setActiveSection("Home")}
                  style={{
                    backgroundColor: "#1890FF",
                    color: "#fff",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ← Back
                </button>
              </div>
              <Tabs
                activeKey={settingsTabKey}
                onChange={setSettingsTabKey}
                type="card"
              >
                <TabPane tab="User Profile" key="1">
                  <UserProfile user={user} onUserUpdate={handleUserUpdate} />
                </TabPane>
                {user?.role?.trim().toLowerCase() === "superadmin" && (
                  <>
                    <TabPane tab="Badge" key="2">
                      <Badge />
                    </TabPane>
                    <TabPane tab="Company Details" key="3">
                      <CompanyDetailsForm />
                    </TabPane>
                    <TabPane tab="Create Company" key="4">
                      <CreateCompany />
                    </TabPane>
                    <TabPane tab="Import User Porifle Data" key="5">
                      <UserProfileImportDashboard />
                    </TabPane>
                  </>
                )}
              </Tabs>
            </div>
          )}
        </div>
      </div>
      <Modal
        title="Cancel Event"
        visible={isModalVisible}
        onOk={async () => {
          if (!cancelReason.trim()) {
            message.warning("Please provide a reason for cancellation");
            return;
          }
          await handleCancelEvent(selectedEventId, cancelReason);
          setIsModalVisible(false);
          setCancelReason("");
          setSelectedEventId(null);
        }}
        onCancel={() => {
          setIsModalVisible(false);
          setCancelReason("");
          setSelectedEventId(null);
        }}
      >
        <TextArea
          rows={4}
          placeholder="Enter reason for cancellation"
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default UserSideDashboard;