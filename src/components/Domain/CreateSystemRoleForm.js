import React, { useState } from "react";
import { Form, Input, Button, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { createSystemRole } from "../../api/domainapi";
import { toastError, toastSuccess } from "../../Utility/toast";

const CreateSystemRoleForm = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const { newRoleName, newRoleDescription } = values;
    setLoading(true);

    try {
      // Get company ID from localStorage
      const user = JSON.parse(localStorage.getItem("user"));
      const companyId = user?.companyId;
      
      if (!companyId) {
        toastError({ title: "Error", description: "Company ID not found. Please log in again." });
        return;
      }

      const result = await createSystemRole(newRoleName, newRoleDescription, companyId);
      if (result.success) {
        toastSuccess({ 
          title: "Success", 
          description: "System role created successfully! Please refresh the Role Access Matrix to see the new role." 
        });
        form.resetFields();
      } else {
        toastError({ title: "Error", description: result.message || "Failed to create system role." });
      }
    } catch (error) {
      toastError({ title: "Error", description: error.response?.data?.message || "Error creating system role" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item
        label="Role Name"
        name="newRoleName"
        rules={[
          { required: true, message: "Please enter role name!" },
          { pattern: /^[a-zA-Z0-9_-]+$/, message: "Only letters, numbers, hyphens and underscores allowed" }
        ]}
      >
        <Input placeholder="e.g., manager, lead, consultant, analyst" />
      </Form.Item>

      <Form.Item
        label="Description"
        name="newRoleDescription"
        rules={[{ required: true, message: "Please enter role description!" }]}
      >
        <Input.TextArea rows={3} placeholder="Role description and permissions" />
      </Form.Item>

      <Form.Item>
        <Button 
          size="large" 
          className="custom-button !font-inter" 
          type="primary" 
          htmlType="submit"
          loading={loading}
          block
        >
          {loading ? "Creating..." : "Add Role"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default CreateSystemRoleForm; 