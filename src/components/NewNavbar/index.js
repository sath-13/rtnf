import React, { useState, useEffect, useRef } from "react";
import { getUserRole } from "../../Utility/service";
import { useNavigate, useParams } from "react-router-dom";
import "./style.css";

const NewNavbar = () => {
  const [role, setRole] = useState("");
  const { workspacename: paramWorkspace } = useParams(); // Get workspace name from URL
  const navigate = useNavigate();
  const navbarRef = useRef(null);

  const [selectedWorkspace, setSelectedWorkspace] = useState(
    localStorage.getItem("selectedWorkspace") || paramWorkspace || ""
  );

  useEffect(() => {
    if (paramWorkspace) {
      setSelectedWorkspace(paramWorkspace);
      localStorage.setItem("selectedWorkspace", paramWorkspace);
    }
  }, [paramWorkspace]);

  useEffect(() => {
    setRole(getUserRole()); // Get role from localStorage
  }, []);

  useEffect(() => {
  }, [role]);

  useEffect(() => {
    // Add show class after component mounts with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (navbarRef.current) {
        navbarRef.current.classList.add("show");
      }
    }, 100);
    
    return () => {
      clearTimeout(timer);
      // Cleanup when component unmounts
      if (navbarRef.current) {
        navbarRef.current.classList.remove("show");
      }
    };
  }, []);

  const handleHomeClick = () => {
    localStorage.setItem("activeSection", "Portfolio management"); // Ensure Portfolio Management opens
    if (role === "superadmin") {
      navigate(`/dashboard/workspacename/${selectedWorkspace}`);
    } else {
      navigate(`/${selectedWorkspace}/dashboard`);
    }
  };

  return (
    <div className="new-navbar" ref={navbarRef}>
      <div className="portfolio-name"
        //onClick={() => navigate("/platform-management-feature/portfolio")}
        onClick={handleHomeClick}
      >
        <p>Portfolio</p>
      </div>
      <div className="tabs">
        <div className="tab" onClick={handleHomeClick}>
          Home
        </div>
        {(role === "superadmin" || role === "admin") && (
          <div className="tab" onClick={() => navigate("/platform-management-feature/import")}>
            Add
          </div>
        )}
      </div>
    </div>
  );

  /*
    return (
      <div className="new-navbar">
        <div className="portfolio-name" onClick={() => setActiveTab("portfolio")}>
          <p>Portfolio</p>
        </div>
        <div className="tabs">
          <div className="tab" onClick={() => setActiveTab("portfolio")}>
            Home
          </div>
          {(role === "superadmin" || role === "admin") && (
            <div className="tab" onClick={() => setActiveTab("import")}>
              Add
            </div>
          )}
        </div>
      </div>
    );*/
};


export default NewNavbar;
