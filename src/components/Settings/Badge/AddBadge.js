'use client';

import React, { useState, useEffect } from "react";
import { Form, Input, Button, notification, Tooltip, Row, Col, Badge, Space, Select, Spin } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import * as FaIcons from "react-icons/fa";
import "./AddBadge.css";
import { badgeTypes } from "../../../constants/enums";
import { getAllWorkspaces, getUserWorkspaces } from "../../../api/workspaceapi";
import { createBadgeAPI, deleteBadgeAPI, getAllSuperadminBadges } from "../../../api/Badgeapi";
import { toastError, toastSuccess } from "../../../Utility/toast";

const { Option } = Select;

const AddBadge = () => {
  const [badgeList, setBadgeList] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedScope, setSelectedScope] = useState(null);
  const [form] = Form.useForm();
  const user = JSON.parse(localStorage.getItem("user"));

  const iconList = Object.keys(FaIcons).map((icon) => ({ name: icon, component: FaIcons[icon] }));

  useEffect(() => {
    if (user?.role === "superadmin") {
      fetchAllWorkspaces();
    } else {
      fetchUserWorkspaces(user?.email);
    }
    fetchBadges();
  }, [user?.role, user?.email]);

  const fetchAllWorkspaces = async () => {
    setLoading(true);
    try {
      const response = await getAllWorkspaces();
      setWorkspaces(response?.data?.workspaces || []);
    } catch (error) {
      // notification.error({ message: "Error", description: "Failed to load workspaces." });
      toastError({ title: "Error", description: "Failed to load workspaces." });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserWorkspaces = async (email) => {
    setLoading(true);
    try {
      const response = await getUserWorkspaces(email);
      setWorkspaces(response?.data?.workspaces || []);
    } catch (error) {
      // notification.error({ message: "Error", description: "Failed to load user workspaces." });
      toastError({ title: "Error", description: "Failed to load user workspaces." });
    } finally {
      setLoading(false);
    }
  };

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const response = await getAllSuperadminBadges();
      setBadgeList(response || []);
    } catch (error) {
      // notification.error({ message: "Error", description: "Failed to load badges." });
      toastError({ title: "Error", description: "Failed to load badges." });
    } finally {
      setLoading(false);
    }
  };


  const handleCreateBadge = async (values) => {
    const { badgeName, badgeIcon, badgeType, badgeScope, selectedWorkspace } = values;

    if (badgeList.some((badge) => badge.name.toLowerCase() === badgeName.toLowerCase())) {
      // notification.error({ message: "Error", description: "Badge name already exists." });
      toastError({ title: "Error", description: "Badge name already exists." });
      return;
    }

    const selectedIcon = badgeIcon || "FaTrophy";

    let workspaceNames = [];

    if (badgeScope === "all") {
      // Store all workspaces based on user role
      workspaceNames = workspaces.filter((workspace) => workspace.createdBy === user?.email)
        .map((workspace) => workspace.workspacename);
    } else if (badgeScope === "specific" && selectedWorkspace) {
      // Store only the selected workspace name
      const workspace = workspaces.find((w) => w._id === selectedWorkspace);
      if (workspace) {
        workspaceNames = [workspace.workspacename];
      }
    }

    const badgeData = {
      name: badgeName,
      icon: selectedIcon,
      type: badgeType || "praise",
      workspaceScope: badgeScope,
      selectedWorkspace: badgeScope === "specific" ? selectedWorkspace : null,
      workspaceNames,
    };

    try {
      await createBadgeAPI(badgeData);
      form.resetFields();
      setSelectedScope(null);


      fetchBadges(); // Refresh badge list
    } catch (error) {
      // notification.error({ message: "Error", description: error.response?.data?.message || "Failed to create badge." });
      toastError({ title: "Error", description: error.response?.data?.message || "Failed to create badge." });
    }
  };

  const handleRemoveBadge = async (badgeId, badgeName) => {
    try {
      await deleteBadgeAPI(badgeId);
      setBadgeList(badgeList.filter((badge) => badge._id !== badgeId));
      // notification.success({ message: "Success", description: `Badge "${badgeName}" deleted.` });
      toastSuccess({ title: "Success", description: `Badge "${badgeName}" deleted.` });
    } catch (error) {
      // notification.error({ message: "Error", description: error.message || "Failed to delete badge." });
      toastError({ title: "Error", description: error.message || "Failed to delete badge." });
    }
  };


  return (
    <div className="badge-settings-container">
      {loading && <Spin size="large" className="!block !mx-auto !my-5" />}

      <Form form={form} name="badgeSettingsForm" onFinish={handleCreateBadge} layout="vertical" className="!w-4/5">
        <Form.Item label="Badge Name" name="badgeName" rules={[{ required: true, message: "Please enter a badge name" }]}>
          <Input placeholder="Enter badge name" />
        </Form.Item>

        <Form.Item label="Badge Icon" name="badgeIcon">
          <Select
            showSearch
            placeholder="Choose an icon"
            className="!w-full"
            filterOption={(input, option) =>
              option?.value?.toLowerCase().includes(input.toLowerCase())
            }
          >
            {iconList.map((icon, index) => (
              <Option key={index} value={icon.name}>
                <Space>
                  {React.createElement(icon.component, { size: 20 })} {icon.name}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>


        <Form.Item label="Badge Type" name="badgeType">
          <Select placeholder="Choose badge type" className="!w-full">
            {badgeTypes.map((type, index) => (
              <Option key={index} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Badge Scope" name="badgeScope" rules={[{ required: true, message: "Please select a badge scope" }]}>
          <Select
            placeholder="Choose badge scope"
            className="!w-full"
            onChange={(value) => setSelectedScope(value)}
          >
            <Option value="all">All Workspaces</Option>
            <Option value="specific">Specific Workspace</Option>
          </Select>
        </Form.Item>

        {selectedScope === "specific" && (
          <Form.Item
            label="Select Workspace"
            name="selectedWorkspace"
            rules={[{ required: true, message: "Please select a workspace" }]}
          >
            <Select placeholder="Choose a workspace" className="!w-full" loading={loading}>
              {workspaces.length > 0 ? (
                workspaces.map((workspace) => (
                  <Option key={workspace._id} value={workspace._id}>
                    {workspace.workspacename}
                  </Option>
                ))
              ) : (
                <Option disabled>No workspaces found</Option>
              )}
            </Select>
          </Form.Item>
        )}

        <Form.Item>
          <Button className="custom-button" type="primary" htmlType="submit" icon={<PlusOutlined />}>
            Add Badge
          </Button>
        </Form.Item>
      </Form>

      <div className="badge-list-container">
        <h5>Created Badges</h5>
        <Row gutter={[16, 16]}>
          {badgeList.length > 0 ? (
            badgeList.map((badge, index) => (
              <Col key={index} span={6}>
                <div className="badge-item">
                  <Badge count={React.createElement(FaIcons[badge.icon] || FaIcons.FaTrophy, { size: 40 })} className="!bg-green-500" />
                  <div className="badge-name">{badge.name}</div>
                  <div className="badge-type">{badge.type.charAt(0).toUpperCase() + badge.type.slice(1)}</div>
                  <div className="badge-scope">{badge.workspaceScope === "all" ? "All Workspaces" : `Workspace: ${badge.workspaceNames
                    }`}</div>
                  <Tooltip title="Remove Badge">
                    <Button
                      danger
                      shape="circle"
                      icon={<MinusCircleOutlined />}
                      onClick={() => handleRemoveBadge(badge._id, badge.name)}
                      className="!mt-2.5"
                    />

                  </Tooltip>
                </div>
              </Col>
            ))
          ) : (
            <div>No badges available</div>
          )}
        </Row>
      </div>
    </div>
  );
};

export default AddBadge;
