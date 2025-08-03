import React, { useState } from "react";
import Login from "../Login/Login";
import Register from "../Register/Register";
import loginImage from "../../assests/images/login.jpg";

const AuthTabs = () => {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <div className=" flex items-center h-screen bg-[#F6F7FF]">
      <div
        style={{ backgroundImage: `url(${loginImage})` }}
        className="login-left-panel bg-cover bg-center bg-no-repeat w-0 lg:w-7/12 xl:w-4/6 h-screen flex flex-col justify-center items-center "
      ></div>
      <div className=" flex-1">
        {activeTab === "login" ? (
          <Login switchToRegister={() => setActiveTab("register")} />
        ) : (
          <Register switchToLogin={() => setActiveTab("login")} />
        )}
      </div>
    </div>
  );
};

export default AuthTabs;
