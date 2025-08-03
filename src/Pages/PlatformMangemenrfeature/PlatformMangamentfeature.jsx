/*
 <div className="my-feature-content">
        {activeTab === "portfolio" && <PortfolioHome />}
        {activeTab === "import" && <Upload />}
      </div>
      */


import React from 'react';
import NewNavbar from '../../components/NewNavbar';
import './style.css';
import Chatbot from '../../components/ChatBotPortfolio/chatbot';

const PlatformManagementfeature = ({ children }) => {
  return (
    <>
      <NewNavbar />
      <div className="my-feature-content">
        {children}
      </div>
      <Chatbot />
    </>
  );
};

export default PlatformManagementfeature;
