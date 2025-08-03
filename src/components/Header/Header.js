import React, { useState } from "react";
import { Dropdown, Menu } from "antd";
import { CgProfile } from "react-icons/cg";
import { LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { HiMenu, HiArrowLeft } from "react-icons/hi";
import "./Header.css";
import NotificationModal from "../Notification/NotificationModal";

const Header = ({
  user,
  onLogout,
  onToggleSidebar,
  sidebarCollapsed,
  minimal = false,
  onSettingsClick,
  labelPrefix,
  workspace,
}) => {
  const [newActionCreated] = useState(false);

  const menu = (
    <Menu>
      <Menu.Item key="settings" onClick={onSettingsClick}>
        <div className="space-x-2">
          <SettingOutlined />
          <span>{labelPrefix === "user" ? "User Settings" : "Settings"}</span>
        </div>
      </Menu.Item>

      <Menu.Item key="logout" onClick={onLogout}>
        <div className="space-x-2">

          <LogoutOutlined /> <span>Logout</span>
        </div>
      </Menu.Item>

    </Menu>
  );

  /* Menu icon wrapper */
  // .menu-container {
  //   display: flex;
  //   align-items: center;
  //   cursor: pointer;
  //   margin-right: 12px;
  // }
  // padding: 12px 40px 12px 40px;

  return (
    <div className="header px-4 md:px-10 py-3">
      <div className="header-left">
        {!minimal && (
          <div className="hidden lg:flex lg:items-center lg:cursor-pointer lg:mr-3" onClick={onToggleSidebar}>
            {sidebarCollapsed ? (
              <HiMenu size={24} className="menu-icon" />
            ) : (
              <HiArrowLeft size={24} className="menu-icon" />
            )}
          </div>
        )}

        {/* App Logo Added */}
        <div className="flex justify-center gap-2 items-center ">
          <img src="/logo.png" alt="App Logo" className="app-logo h-5 w-5 lg:h-8 lg:w-8" />
          <span className="text-xl font-inter text-white hidden md:block">reteam<span className="text-[#F64787]">now</span></span>
        </div>
      </div>

      <div className="header-right">
        <div className="header-icons gap-2 md:gap-4">
          <div className="hidden md:flex">
            <NotificationModal newActionCreated={newActionCreated} />
          </div>
          <Dropdown overlay={menu} trigger={["click"]}>
            <div className="user-profile">
              {user?.userLogo ? (
                <img src={user.userLogo} alt="User" className="user-icon sm:h-5 sm:w-5 md:h-9 md:w-9 " />
              ) : (
                <CgProfile size={30} className="user-icon" />
              )}
              <p className="userside-name font-inter">
                {user?.fname || "User"}
              </p>
            </div>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};

export default Header;