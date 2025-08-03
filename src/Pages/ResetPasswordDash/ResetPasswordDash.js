import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Input, Button, Typography } from "antd";
import { MailOutlined } from "@ant-design/icons";
import { forgotPassword } from "../../api/ResetPasswordApi";
import { ResetPasswordMessages } from "../../constants/constants";
import loginImage from "../../assests/images/login.jpg";
import { toastError, toastSuccess } from "../../Utility/toast";

const { Text } = Typography;

const ResetPasswordDash = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await forgotPassword(values.email);
      setLoading(false);
      toastSuccess({
        title: "Success",
        description: result.message || ResetPasswordMessages.EMAIL_SENT_SUCC,
      });
      navigate("/");
    } catch (err) {
      setLoading(false);
      
      // Show the actual error message from the backend
      const errorMessage = err.response?.data?.message || err.message || ResetPasswordMessages.EMAIL_SENT_ERR;
      toastError({
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="login-container flex h-screen bg-[#F6F7FF]">
      {/* Left Branding Panel */}
      <div
        style={{ backgroundImage: `url(${loginImage})` }}
        className="login-left-panel bg-cover bg-center bg-no-repeat w-0 lg:w-4/6 h-full flex flex-col justify-center items-center "
      >
      </div>

      {/* Right Form Box */}
      <div className="w-full lg:w-2/6 flex justify-center items-center py-2 px-4">
        <div className="w-full login-box h-screen flex flex-col gap-4 justify-center items-center">
          <h1 className="auth-title text-2xl text-primary-text font-rubik font-semibold">Reset Password</h1>

          <Form layout="vertical" onFinish={onFinish} className="auth-form w-full">
            <Form.Item
              className="w-full"
              name="email"
              rules={[
                { required: true, message: ResetPasswordMessages.EMAIL },
                { type: "email", message: ResetPasswordMessages.EMAIL_INVALID },
              ]}
            >
              <Input
                size="large"
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Enter your email"
                className="auth-input py-[10px]"
              />
            </Form.Item>

            <Button
              size="large"
              type="primary"
              htmlType="submit"
              className="custom-button text-white !py-5 text-sm font-medium font-inter"
              block
              loading={loading}
            >
              Send Reset Link
            </Button>
          </Form>

          <Text className="switch-text text-center text-sm font-inter space-x-1">
            <span>
              Remember your password?
            </span>
            <span
              className="auth-link text-primary-color cursor-pointer hover:underline"
              onClick={() => navigate("/")}
            >
              Login here
            </span>
          </Text>

          {/* Footer */}
          <div className="login-footer text-center mt-8 text-secondary-text text-xs font-inter">
            © 2014–2025 SJInnovation, LLC. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordDash;

