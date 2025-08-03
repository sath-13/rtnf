import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { registerUser } from "../../api/registerApi";
import { Form, Input, Button, Typography } from "antd";
import { UserOutlined, MailOutlined, LockOutlined } from "@ant-design/icons";
import { RegisterMessages } from "../../constants/constants";
import { toastError, toastSuccess } from "../../Utility/toast";

const { Text } = Typography;

const Register = ({ switchToLogin }) => {
  const navigate = useNavigate();
  const { workspace_name } = useParams();

  const onFinish = async (values) => {
    try {
      const res = await registerUser(values, workspace_name);

      toastSuccess({
        title: "Registration Success!",
        description: "You have registered successfully!",
      });

      setTimeout(() => {
        switchToLogin();
      }, 2000);
    } catch (err) {
      toastError({
        title: "Error!",
        description: err.response?.data?.msg || RegisterMessages.REGISTER_ERR,
      });
    }
  };

  return (
    <div className="w-full px-4 h-screen">
      {/* Register Form Box */}
      <div className="flex flex-col justify-center gap-2 lg:gap-4 h-full">
        <h1 className="auth-title text-center text-xl lg:text-2xl text-primary-text font-rubik font-semibold mb-2">
          Register to ReteamNow
        </h1>

        <Form layout="vertical" onFinish={onFinish} className="auth-form">
          <div className="flex gap-3">
            <Form.Item
              name="fname"
              rules={[{ required: true, message: RegisterMessages.FIRST_NAME }]}
              className="flex-1"
            >
              <Input
                size="small"
                prefix={<UserOutlined className="input-icon" />}
                placeholder="First Name"
                className="auth-input text-sm py-1"
              />
            </Form.Item>

            <Form.Item
              name="lname"
              rules={[{ required: true, message: RegisterMessages.LAST_NAME }]}
              className="flex-1"
            >
              <Input
                size="small"
                prefix={<UserOutlined className="input-icon" />}
                placeholder="Last Name"
                className="auth-input text-sm py-1"
              />
            </Form.Item>
          </div>

          <Form.Item
            name="username"
            rules={[
              { required: true, message: RegisterMessages.USERNAME },
              {
                max: 10,
                message: "Max 10 chars",
              },
              {
                pattern: /^[a-zA-Z0-9_]+$/,
                message: "Use letters, numbers, or _",
              },
            ]}
            className=" font-inter"
          >
            <Input
              size="small"
              prefix={<UserOutlined className="input-icon" />}
              placeholder="Username"
              className="auth-input text-sm py-1"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: RegisterMessages.EMAIL },
              { type: "email", message: RegisterMessages.EMAIL_INVALID },
            ]}
            className=""
          >
            <Input
              size="small"
              prefix={<MailOutlined className="input-icon" />}
              placeholder="Enter your email"
              className="auth-input text-sm py-1"
            />
          </Form.Item>

          <div className="flex gap-3">
            <Form.Item
              name="password"
              rules={[
                { required: true, message: RegisterMessages.PASSWORD },
                { min: 6, message: "Password must be at least 6 characters" },
              ]}
              hasFeedback
              className="flex-1"
            >
              <Input.Password
                size="small"
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Enter your password"
                className="auth-input text-sm py-1"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: RegisterMessages.CONFIRM_PASSWORD },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match!"));
                  },
                }),
              ]}
              hasFeedback
              className="flex-1 mb-4"
            >
              <Input.Password
                size="small"
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Confirm Password"
                className="auth-input text-sm py-1"
              />
            </Form.Item>
          </div>

          <Button
            size="large"
            type="primary"
            htmlType="submit"
            className="custom-button text-white text-sm font-medium mb-2 text-center font-inter"
            block
          >
            Register
          </Button>
        </Form>

        <Text className="switch-text text-center text-sm space-x-1 text-primary-text font-inter">
          <span>Already have an account?</span>
          <span
            onClick={switchToLogin}
            className="auth-link text-primary-color font-inter cursor-pointer hover:underline ml-1"
          >
            Login here
          </span>
        </Text>

        <div className="text-center  text-secondary-text font-inter mt-2 sm:pt-0 lg:pt-4 text-[10px] sm:text-xs">
          © 2014–2025 SJInnovation, LLC. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default Register;
