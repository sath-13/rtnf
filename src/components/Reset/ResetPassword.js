import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Form, Input, Button, Typography, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import { resetPassword, getVerifyToken } from "../../api/ResetPasswordApi";
import { ResetPasswordMessages } from "../../constants/constants";
import "../../Pages/AuthTabs/Auth.css";
import { toastError, toastSuccess } from "../../Utility/toast";
const { Title, Text } = Typography;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        const response = await getVerifyToken(token);
        
        if (!response?.valid) {
          toastError({ title: "Error", description: "Invalid or expired token." });
          setTimeout(() => navigate("/"), 3000);
        }
      } catch (err) {
        console.error("Token verification error:", err);
        console.error("Error response:", err.response?.data);
        toastError({ title: "Error", description: "Token verification failed." });
        setTimeout(() => navigate("/"), 3000);
      }
    };

    verifyToken();
  }, [token, navigate]);

  const handleSubmit = async () => {
    if (password !== confirmPassword) {
      setError(ResetPasswordMessages.PASS_MATCH_ERR);
      return;
    }

    try {
      await resetPassword(token, password);
      // message.success(ResetPasswordMessages.PASS_RESET_SUCC);
      toastSuccess({ title: "Success", description: ResetPasswordMessages.PASS_RESET_SUCC });
      setTimeout(() => navigate("/"), 2000);
    } catch (error) {
      // message.error(ResetPasswordMessages.PASS_RESET_ERR);
      toastError({ title: "Error", description: ResetPasswordMessages.PASS_RESET_ERR });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Branding Panel */}
      <div className="login-left-panel">
        <img src="/logo192.png" alt="Logo" className="login-logo" />
        <h1 className="login-brand-title">Reteam Now</h1>
      </div>

      {/* Right Reset Form */}
      <div className="login-box">
        <Title level={2} className="auth-title">Reset Your Password</Title>

        {error && <Text className="error-message">{error}</Text>}

        <Form layout="vertical" onFinish={handleSubmit} className="auth-form">
          <Form.Item
            name="password"
            rules={[
              { required: true, message: ResetPasswordMessages.PASS_REQ },
              { min: 8, message: ResetPasswordMessages.PASS_LIMIT },
              {
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
                message: ResetPasswordMessages.PASS_PATTERN,
              },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Enter New Password"
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: ResetPasswordMessages.PASS_CONFIRM },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(ResetPasswordMessages.PASS_MATCH_ERR));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="input-icon" />}
              placeholder="Confirm Password"
              className="auth-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit" className="auth-button" block>
            Reset Password
          </Button>
        </Form>

        {/* Footer */}
        <div className="login-footer">
          © 2014–2025 SJInnovation, LLC. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
