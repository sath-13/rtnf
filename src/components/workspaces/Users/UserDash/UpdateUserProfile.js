import React, { useEffect, useState } from "react";
import {
  Button,
  Form,
  Input,
  Select,
  Upload,
  message,
  Switch,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { getAllUsersFromWorkspaces } from "../../../../api/usersapi";
import { fetchRolesByCompanyId, getAllRoles } from "../../../../api/domainapi";

const { Option } = Select;

const UpdateUserProfile = ({ user, onSave }) => {
  const [form] = Form.useForm();
  const [roleOptions, setRoleOptions] = useState([]);
  const [jobRoleOptions, setJobRoleOptions] = useState([]);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        fname: user.fname,
        lname: user.lname,
        username: user.username,
        email: user.email,
        role: user.role,
        teamTitle: user.teamTitle,
        branch: user.branch,
        jobRole: user.jobRole,
        workspaceName: user.workspaceName?.join(", "),
        companyId: user.companyId,
        imported: user.imported,
        directManager: user.directManager,
        dottedLineManager: user.dottedLineManager,
        status: user.status,
        // Do NOT set userLogo here for Upload, let fileList handle it
      });
      // Set fileList for Upload preview if userLogo exists
      if (user.userLogo) {
        setFileList([
          {
            uid: '-1',
            name: 'Current Avatar',
            status: 'done',
            url: user.userLogo,
          },
        ]);
      } else {
        setFileList([]);
      }
      const fetchRoles = async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem("user"));
          const companyId = currentUser?.companyId;
          
          if (!companyId) {
            console.error("Company ID not found in localStorage");
            return;
          }
          
          const res = await getAllRoles(companyId);
          if (res.success && Array.isArray(res.roles)) {
            setRoleOptions(res.roles);
          }
        } catch (err) {
          console.error("Error fetching roles", err);
        }
      };

      const fetchJobRoles = async () => {
        try {
          const currentUser = JSON.parse(localStorage.getItem("user"));
          const companyId = currentUser?.companyId;
          if (companyId) {
            const res = await fetchRolesByCompanyId(companyId);
            if (res.success && Array.isArray(res.data)) {
              setJobRoleOptions(res.data);
            }
          }
        } catch (err) {
          console.error("Error fetching job roles", err);
        }
      };

      fetchRoles();
      fetchJobRoles();
    }
  }, [user, form]);

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const onFinish = (values) => {
    // Prepare FormData for file upload
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "userLogo" && fileList.length > 0 && fileList[0].originFileObj) {
        formData.append("userIcon", fileList[0].originFileObj);
      } else if (key !== "userLogo") {
        formData.append(key, value);
      }
    });
    // Add user id for update
    if (user && user._id) {
      formData.append("_id", user._id);
    }
    if (onSave) {
      onSave(formData, user?._id);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  return (
    <Form form={form} layout="vertical" onFinish={onFinish}>
      <Form.Item name="fname" label="First Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="lname" label="Last Name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="username" label="Username" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="email" label="Email" rules={[{ required: true }]}>
        <Input />
      </Form.Item>

      <Form.Item name="role" label="Role" rules={[{ required: true }]}>
        <Select placeholder="Select a role" showSearch>
          {roleOptions.length > 0 ? (
            roleOptions.map((role) => (
              <Option key={role} value={role}>
                {role}
              </Option>
            ))
          ) : (
            <Option value="" disabled>
              No roles available for this company
            </Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item name="teamTitle" label="Team Title">
        <Input />
      </Form.Item>

      <Form.Item name="branch" label="Branch">
        <Input />
      </Form.Item>

      <Form.Item name="jobRole" label="Job Role">
        <Select placeholder="Select a job role" allowClear showSearch>
          {jobRoleOptions.length > 0 ? (
            jobRoleOptions.map((jobRole) => (
              <Option key={jobRole} value={jobRole}>
                {jobRole}
              </Option>
            ))
          ) : (
            <Option value="" disabled>
              No job roles available
            </Option>
          )}
        </Select>
      </Form.Item>

      <Form.Item name="workspaceName" label="Workspace Name">
        <Input disabled />
      </Form.Item>

      <Form.Item name="userLogo" label="User Logo" valuePropName="fileList" getValueFromEvent={normFile}>
        <Upload
          beforeUpload={() => false}
          fileList={fileList}
          onChange={handleUploadChange}
          maxCount={1}
        >
          <Button icon={<UploadOutlined />}>Upload</Button>
        </Upload>
      </Form.Item>

      <Form.Item name="companyId" label="Company ID">
        <Input  />
      </Form.Item>

      <Form.Item name="imported" label="Imported">
        <Switch checked={form.getFieldValue("imported")} />
      </Form.Item>

      <Form.Item name="directManager" label="Direct Manager">
        <Input />
      </Form.Item>

      <Form.Item name="dottedLineManager" label="Dotted Line Manager">
        <Input />
      </Form.Item>

      <Form.Item name="status" label="Status">
        <Select>
          <Option value="active">Active</Option>
          <Option value="inactive">Inactive</Option>
        </Select>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Update User
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UpdateUserProfile;
