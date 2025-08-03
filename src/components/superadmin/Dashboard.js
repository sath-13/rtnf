import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, Layout } from "antd";
import ListWorkspace from "../workspaces/List/workspaces";
import WorkspaceSettings from "../Settings/EditWorkspace";
import WorkspaceLogoSettings from "../Settings/LogoWorkspace";
import CompanyDetailsForm from "../Settings/CompanyDetailsForm";
import Badge from "../Settings/Badge/Badge";
import UserProfile from "../Settings/UserProfile";
import Header from "../Header/Header";
// REMOVE this for now (just testing)
import "./Dashboard.css";
const { TabPane } = Tabs;
const { Content } = Layout;
const Dashboard = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("workspace");
  const [user, setUser] = useState(null);
  const [settingsTabKey, setSettingsTabKey] = useState("1");
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      navigate("/");
    } else {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    }
  }, [navigate]);
  const handleUserUpdate = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const handleSettingsClick = () => {
    setActiveSection("settings");
    setSettingsTabKey("1");
  };
  if (!user) return null;

  return (
    <Layout className="min-h-screen">
      <Header labelPrefix="dashboard"
        user={user}
        onLogout={handleLogout}
        minimal={true}
        onSettingsClick={handleSettingsClick}
      />
      <Content className="" >
        {activeSection === "workspace" && <ListWorkspace />}
        {activeSection === "settings" && (
          <div className="!py-8 bg-transparent">
            <div className="container mx-auto mb-4">
              <button
                className="custom-button bg-[#1890FF] text-white border-none px-4 py-2 rounded cursor-pointer"
                onClick={() => setActiveSection("workspace")}
              >
                ← Back to Workspace
              </button>
            </div>
            <Tabs
              className="container mx-auto"
              activeKey={settingsTabKey}
              onChange={(key) => setSettingsTabKey(key)}
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
                  <TabPane tab="Workspace-Name Settings" key="3">
                    <WorkspaceSettings />
                  </TabPane>
                  <TabPane tab="Workspace-Logo Settings" key="4">
                    <WorkspaceLogoSettings />
                  </TabPane>
                  <TabPane tab="Company Details" key="5">
                    <CompanyDetailsForm />
                  </TabPane>
                </>
              )}
            </Tabs>
          </div>
        )}
      </Content>
    </Layout>
  );
};
export default Dashboard; 