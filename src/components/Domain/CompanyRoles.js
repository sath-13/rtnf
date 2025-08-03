import React, { useState, useCallback } from "react";
import { Form, Input, Button, Spin, Typography } from "antd";
import { createRolesInCompany } from "../../api/domainapi";
import { LoadingOutlined } from "@ant-design/icons";
import "./CompanyRoles.css"; // Make sure this path matches your file
import { toastError, toastSuccess } from "../../Utility/toast";

const { Title } = Typography;
const CompanyRole = () => {
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem("user"));
  const companyId = user?.companyId;

  const onFinish = useCallback(async (values) => {
    const { roleName, description } = values;
    setLoading(true);

    try {
      const result = await createRolesInCompany(companyId, roleName, description);
      if (result.success) {
        // message.success("Role created successfully!");
        toastSuccess({ title: "Success", description: "Role created successfully!" });
      } else {
        // message.error(result.message || "Failed to create role.");
        toastError({ title: "Error", description: result.message || "Failed to create role." });
      }
    } catch (error) {
      // message.error(error.response?.data?.message || "Error creating role");
      toastError({ title: "Error", description: error.response?.data?.message || "Error creating role" });
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // .create-role-container {
  //   width: 100%;
  //   max-width: 600px;
  //   margin: 0 auto;
  //   /* padding: 30px; */
  //   background-color: #f7f7f7;
  // }

  return (
    <div className="py-[18px]">
      <div className="w-full max-w-[600px] mx-auto bg-[#fff] rounded-lg shadow-md border border-border-color">
        <h1 className="!text-center !text-2xl text-primary-text font-rubik font-semibold !px-0 !py-5">Create New Job Role</h1>
        {loading ? (
          <div className="spin-container">
            <Spin indicator={<LoadingOutlined className="text-2xl" spin />} />
          </div>
        ) : (
          <Form className="!pb-5 !px-5 " onFinish={onFinish} layout="vertical">
            <Form.Item
              label="Role Name"
              name="roleName"
              rules={[{ required: true, message: "Please enter role name!" }]}
            >
              <Input placeholder="e.g., Software Engineer, Project Manager, QA Lead" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
            >
              <Input.TextArea rows={4} placeholder="Optional description" />
            </Form.Item>

            <Form.Item>
              <Button size="large" className="custom-button !font-inter" type="primary" htmlType="submit" block loading={loading}>
                {loading ? "Creating..." : "Create Job Role"}
              </Button>
            </Form.Item>
          </Form>
        )}
      </div>
    </div>

  );
};

export default CompanyRole;
