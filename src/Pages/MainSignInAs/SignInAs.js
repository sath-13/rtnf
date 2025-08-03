import React from "react";
import { Button, Typography, Card } from "antd";
import { useNavigate } from "react-router-dom";
import "./SignInAs.css"; // Import the CSS file

const { Title } = Typography;

const SignInAs = () => {
  const navigate = useNavigate();

  const handleAdminLogin = () => {
    navigate("/login");
  };

  const handleUserLogin = () => {
    navigate("/workspacesignin");
  };

  return (
    <div className="signin-landing-container">
      <div className="signin-landing-card-wrapper">
        <Card className="signin-landing-card" bordered={false}>
          <div className="sidebar-header">
            <div className="sidebar-logo">A</div>
          </div>
          <Title level={2} className="login-title">Sign In to ReteamNow</Title>
          <Button
            type="primary"
            onClick={handleAdminLogin}
            className="login-button !mb-5"
            block
          >
            Sign In As SuperAdmin
          </Button>
          <Button type="default" onClick={handleUserLogin} className="login-button" block>
            Sign In As User/Admin
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default SignInAs;
