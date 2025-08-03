import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Select,
  Upload,
  Typography,
} from "antd";
import {
  UserOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { updateUser } from "../../api/usersapi";
import { UserMessages } from "../../constants/constants";
import { toastError, toastSuccess } from "../../Utility/toast";

const { Title } = Typography;
const { Option } = Select;

const UserSettingsDashboard = ({ user, onUserUpdate, handleModalClose }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [iconFile, setIconFile] = useState(null);

  // Calculate profile completion percentage (including all fields)
  const calculateProfileCompletion = () => {
    if (!user) return 0;

    const fields = [
      user.fname,
      user.lname,
      user.username,
      user.email,
      user.userLogo,
      user.role,
      user.workspaceName?.length > 0 ? user.workspaceName : null,
      user.teamTitle?.length > 0 ? user.teamTitle : null,
      user.jobRole,
      user.branch,
      user.companyId,
      user.directManager,
      user.dottedLineManager,
    ];

    const completedFields = fields.filter(field =>
      field !== null &&
      field !== undefined &&
      field !== '' &&
      field !== 'USER' // Exclude default role
    ).length;

    const totalFields = fields.length;
    return Math.round((completedFields / totalFields) * 100);
  };

  // Get completion status color
  const getCompletionColor = (percentage) => {
    if (percentage <= 20) return '#ff4d4f'; // Red
    if (percentage >= 21 && percentage <= 99) return '#fa8c16'; // Orange
    if (percentage === 100) return '#52c41a'; // Green
    return '#d9d9d9'; // Default gray
  };

  // Get missing fields for user guidance
  const getMissingFields = () => {
    const fieldLabels = {
      fname: 'First Name',
      lname: 'Last Name',
      username: 'Username',
      email: 'Email',
      userLogo: 'Profile Picture',
      role: 'Role',
      workspaceName: 'Workspace Name',
      teamTitle: 'Team Title',
      jobRole: 'Job Role',
      branch: 'Branch',
      companyId: 'Company ID',
      directManager: 'Direct Manager',
      dottedLineManager: 'Dotted Line Manager'
    };

    const missingFields = [];

    if (!user.fname) missingFields.push(fieldLabels.fname);
    if (!user.lname) missingFields.push(fieldLabels.lname);
    if (!user.username) missingFields.push(fieldLabels.username);
    if (!user.email) missingFields.push(fieldLabels.email);
    if (!user.userLogo) missingFields.push(fieldLabels.userLogo);
    if (!user.role || user.role === 'USER') missingFields.push(fieldLabels.role);
    if (!user.workspaceName?.length) missingFields.push(fieldLabels.workspaceName);
    if (!user.teamTitle?.length) missingFields.push(fieldLabels.teamTitle);
    if (!user.jobRole) missingFields.push(fieldLabels.jobRole);
    if (!user.branch) missingFields.push(fieldLabels.branch);
    if (!user.companyId) missingFields.push(fieldLabels.companyId);
    if (!user.directManager) missingFields.push(fieldLabels.directManager);
    if (!user.dottedLineManager) missingFields.push(fieldLabels.dottedLineManager);

    return missingFields;
  };

  useEffect(() => {
    if (user) {
      try {
        form.setFieldsValue({
          fname: user.fname,
          lname: user.lname,
          username: user.username,
          email: user.email,
          role: user.role,
          workspaceName: user.workspaceName?.join(", ") || "",
          teamTitle: user.teamTitle?.join(", ") || "",
          status: user.status,
          branch: user.branch || "",
          jobRole: user.jobRole || "",
          companyId:
            typeof user.companyId === "string"
              ? user.companyId
              : user.companyId?._id || "",
          directManager: user.directManager || "",
          dottedLineManager: user.dottedLineManager || "",
        });
      } catch (error) {
        console.error(UserMessages.USERDATA_PARSE_ERR, error);
      }
    }
  }, [user, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const formData = new FormData();
      if (iconFile) {
        formData.append("userIcon", iconFile);
      }

      const fields = [
        "fname",
        "lname",
        "branch",
        "jobRole",
        "companyId",
        "directManager",
        "dottedLineManager",
      ];
      fields.forEach((field) => {
        if (values[field]) formData.append(field, values[field]);
      });

      const response = await updateUser(user.id || user._id, formData);
      // message.success(UserMessages.USERDATA_UPDATED_SUCC);
      toastSuccess({ title: "Success", description: UserMessages.USERDATA_UPDATED_SUCC });

      const updatedUser = {
        ...user,
        ...response.user,
      };

      onUserUpdate(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      handleModalClose();
    } catch (error) {
      console.error(UserMessages.USERDATA_UPDATED_ERR, error);
      // message.error(UserMessages.USERDATA_UPDATED_ERR);
      toastError({ title: "Error", description: UserMessages.USERDATA_UPDATED_ERR });
    } finally {
      setLoading(false);
    }
  };




  return (
    <div className="!max-w-[600px] !mx-auto !my-5 !p-5">
      <Title className="!text-center !mb-5" level={2}>
        User Settings Dashboard
      </Title>

      <div className="!text-center !mb-5">
        <div className="inline-block relative">
          <div
            style={{
              border: `4px solid ${getCompletionColor(calculateProfileCompletion())}`,
              borderRadius: '50%',
              padding: '4px',
              background: 'white',
              boxShadow: `0 0 0 2px white, 0 0 0 6px ${getCompletionColor(calculateProfileCompletion())}20`,
            }}
          >
            {user?.userLogo ? (
              <img
                src={user.userLogo}
                alt="User Icon"
                className="!w-[100px] !h-[100px] !rounded-full !object-cover"
              />
            ) : (
              <div
                className="!w-[100px] !h-[100px] !rounded-full !bg-gray-300 !inline-block !leading-[100px]"
              >
                <UserOutlined className="!text-5xl !text-white" />
              </div>
            )}
          </div>
          {/* Profile completion percentage */}
          <div
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-semibold text-white shadow-md"
            style={{
              backgroundColor: getCompletionColor(calculateProfileCompletion()),
              minWidth: '40px'
            }}
          >
            {calculateProfileCompletion()}%
          </div>
        </div>

        {/* Profile completion guidance */}
        <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: `${getCompletionColor(calculateProfileCompletion())}10` }}>
          <div className="text-sm font-medium mb-2" style={{ color: getCompletionColor(calculateProfileCompletion()) }}>
            Profile {calculateProfileCompletion()}% Complete
          </div>
          {getMissingFields().length > 0 && (
            <div className="text-xs text-gray-600">
              <div className="mb-1">Complete these fields to improve your profile:</div>
              <div className="flex flex-wrap gap-1">
                {getMissingFields().map((field, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-gray-100 rounded text-xs"
                    style={{
                      borderLeft: `3px solid ${getCompletionColor(calculateProfileCompletion())}`,
                      fontSize: '10px'
                    }}
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>
          )}
          {calculateProfileCompletion() === 100 && (
            <div className="text-xs text-green-600 font-medium">
              🎉 Your profile is complete!
            </div>
          )}
        </div>
      </div>

      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="First Name" name="fname" rules={[{ required: true }]}>
          <Input placeholder="First Name" />
        </Form.Item>

        <Form.Item label="Last Name" name="lname" rules={[{ required: true }]}>
          <Input placeholder="Last Name" />
        </Form.Item>

        <Form.Item label="Username" name="username">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Email" name="email">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Role" name="role">
          <Select disabled>
            <Option value="admin">Admin</Option>
            <Option value="user">User</Option>
            <Option value="superadmin">Super Admin</Option>
          </Select>
        </Form.Item>

        <Form.Item label="Workspace Name" name="workspaceName">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Team Title" name="teamTitle">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Branch" name="branch">
          <Input placeholder="Branch" />
        </Form.Item>

        <Form.Item label="Job Role" name="jobRole">
          <Input disabled />
        </Form.Item>

        <Form.Item label="Company ID" name="companyId">
          <Input placeholder="MongoDB Company ObjectId" />
        </Form.Item>






        <Form.Item label="Direct Manager (User ID)" name="directManager">
          <Input placeholder="MongoDB ObjectId of direct manager" />
        </Form.Item>

        <Form.Item
          label="Dotted Line Manager (User ID)"
          name="dottedLineManager"
        >
          <Input placeholder="MongoDB ObjectId of dotted line manager" />
        </Form.Item>

        <Form.Item label="Update User Icon">
          <Upload
            beforeUpload={(file) => {
              setIconFile(file);
              return false;
            }}
            maxCount={1}
          >
            <Button icon={<UploadOutlined />}>Select New Icon</Button>
          </Upload>
        </Form.Item>

        <p>
          <i>Only .png and .jpeg images are allowed.</i>
        </p>

        <Form.Item>
          <Button type="primary" className="custom-button" htmlType="submit" loading={loading}>
            Update Settings
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserSettingsDashboard;
