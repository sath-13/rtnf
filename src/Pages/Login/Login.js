import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { loginUser, googleLoginUser } from "../../api/loginApi";
import { Form, Input, Button, Typography } from "antd";
import { MailOutlined, LockOutlined } from "@ant-design/icons";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { LoginMessages } from "../../constants/constants";
import { toastError, toastSuccess } from "../../Utility/toast";
import { Typewriter } from "react-simple-typewriter";
import { useAuth } from "../../contexts/AuthContext";

const { Text } = Typography;

const Login = ({ switchToRegister }) => {
  const navigate = useNavigate();
  const { workspace_name } = useParams();
  const { login } = useAuth(); // Get login function from AuthContext

  const onFinish = async (values) => {
    try {
      const res = await loginUser(values, workspace_name);

      // Use AuthContext login function to set authentication state
      login({
        token: res.token,
        role: res.user.role,
        ...res.user
      });

      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      toastSuccess({
        title: "Login Success!",
        description: "You have logged in successfully!",
      });

      setTimeout(() => {
        navigate(res.user.role === "superadmin" ? "/dashboard" : "/dashboard");
      }, 2000);
    } catch (err) {
      toastError({
        title: "Error!",
        description: err.response?.data?.msg || LoginMessages.LOGIN_ERR,
      });
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const email = decoded.email;
      const res = await googleLoginUser(email);

      if (res.success) {
        // Use AuthContext login function to set authentication state
        login({
          token: res.token,
          role: res.user.role,
          ...res.user
        });

        localStorage.setItem("token", res.token);
        localStorage.setItem("user", JSON.stringify(res.user));
        toastSuccess({
          title: "Login Success!",
          description: "You have logged in successfully!",
        });

        // Here, add this line to save Google token:
        localStorage.setItem(
          "google_access_token",
          credentialResponse.credential
        );

        setTimeout(() => {
          navigate(
            res.user.role === "superadmin" ? "/dashboard" : "/dashboard"
          );
        }, 2000);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toastError({
          title: "Error",
          description: LoginMessages.UNAUTHORIZED_EMAIL_ERR,
        });
      } else {
        toastError({
          title: "Error",
          description: LoginMessages.GOOGLE_LOGIN_FAILED,
        });
        console.error("❌ Full error from Google login:", error);
      }
    }
  };
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="w-full px-4 h-screen">
        {/* Login Form Box */}
        <div className=" flex flex-col justify-center gap-2 lg:gap-4 h-full">
          {/* <h1 className="auth-title text-center text-xl lg:text-2xl text-primary-text font-rubik font-semibold">
            Login to Reteam Now
          </h1> */}

          <h1 className="auth-title text-center text-xl lg:text-2xl text-primary-text font-rubik font-semibold">
            Login to{" "}
            <span className="text-primary-color">
              <Typewriter
                words={["Reteam Now"]}
                loop={0} 
                cursor
                cursorStyle="|"
                typeSpeed={100}
                deleteSpeed={100}
                delaySpeed={3000} 
              />
            </span>
          </h1>



          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() =>
              toastError({
                title: "Error",
                description: "Google login failed.",
              })
            }
            theme="outline"
            size="large"
            text="continue_with"
            prompt="select_account"
            width="100%"
          />

          <div className="or-separator text-center text-sm text-gray-600 font-medium">or</div>

          <Form layout="vertical" onFinish={onFinish} className="auth-form">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: LoginMessages.EMAIL },
                { type: "email", message: LoginMessages.EMAIL_INVALID },
              ]}
            >
              <Input
                className="custom-placeholder"
                prefix={<MailOutlined className="input-icon" />}
                placeholder="Enter your email"

              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: LoginMessages.PASSWORD }]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined className="input-icon" />}
                placeholder="Enter your password"

              />
            </Form.Item>

            <Button
              type="primary"
              htmlType="submit"
              className="custom-button text-white !py-6 text-sm font-medium hover:bg-primary-color font-inter"
              block
            >
              LOGIN
            </Button>
          </Form>

          <Text className="switch-text text-center text-sm text-primary-text font-inter space-x-1">
            <span>
              Do not have an account?
            </span>
            <span onClick={switchToRegister} className=" cursor-pointer text-primary-color hover:underline">
              Register Here
            </span>
          </Text>

          <Text
            className="switch-text text-center text-primary-color font-inter cursor-pointer text-sm"
            onClick={() =>
              navigate(
                workspace_name
                  ? `/${workspace_name}/reset-passworddash`
                  : "/reset-passworddash"
              )
            }
          >
            Forgot Password?
          </Text>

          <div className="login-footer text-center mt-4 lg:mt-8 text-secondary-text font-inter text-xs">
            © 2014–2025 SJInnovation, LLC. All rights reserved.
          </div>
        </div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default Login;