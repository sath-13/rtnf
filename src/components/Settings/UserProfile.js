"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Card,
  Descriptions,
  Typography,
  Avatar,
  Button,
  Modal,
  Tooltip,
  List,
  DatePicker,
  Select,
  Popover,
} from "antd";
import { UserOutlined, FilterOutlined } from "@ant-design/icons";
import { getUserBadgesAPI } from "../../api/Badgeapi";
import UserSettingsDashboard from "./UserSettings";
import * as FaIcons from "react-icons/fa";
import { toastError } from "../../Utility/toast";
import { axiosSecureInstance } from "../../api/axios";

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const UserProfile = ({ user, onUserUpdate }) => {
  const [badges, setBadges] = useState([]);
  const [filteredBadges, setFilteredBadges] = useState([]);
  const [, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dateRange, setDateRange] = useState([]);
  const [badgeType, setBadgeType] = useState("");
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [attendedEvents, setAttendedEvents] = useState([]);

  const loggedUser = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      return user?.id || user?._id || null;
    } catch (e) {
      return null;
    }
  })();

  // Calculate profile completion percentage (including all fields)
  const calculateProfileCompletion = useCallback(() => {
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
  }, [user]);

  // Get border color based on completion percentage
  const getBorderColor = (percentage) => {
    if (percentage <= 20) return '#ff4d4f'; // Red
    if (percentage >= 21 && percentage <= 99) return '#fa8c16'; // Orange
    if (percentage === 100) return '#52c41a'; // Green
    return '#d9d9d9'; // Default gray
  };

  // Get border style for avatar
  const getAvatarBorderStyle = () => {
    const percentage = calculateProfileCompletion();
    const borderColor = getBorderColor(percentage);

    return {
      border: `4px solid ${borderColor}`,
      borderRadius: '50%',
      padding: '4px',
      background: 'white',
      boxShadow: `0 0 0 2px white, 0 0 0 6px ${borderColor}20`,
    };
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const [assigned, attended] = await Promise.all([
          axiosSecureInstance.get(`/api/event/assigned/${loggedUser}`),
          axiosSecureInstance.get(`/api/event/attended/${loggedUser}`),
        ]);
        setAssignedEvents(assigned.data.events || []);
        setAttendedEvents(attended.data.events || []);
      } catch (err) {
        console.error("Error fetching user events", err);
      }
    };

    fetchEvents();
  }, [loggedUser]);

  useEffect(() => {
    if (user && (user.id || user._id)) {
      fetchUserBadges();
    }
  }, [user]);

  const fetchUserBadges = async () => {
    try {
      setLoading(true);
      const userBadges = await getUserBadgesAPI();
      setBadges(userBadges || []);
    } catch (error) {
      // notification.error({ message: "Error", description: "Failed to load badges." });
      toastError({ title: "Error", description: "Failed to load badges." });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let filtered = [...badges];
    if (dateRange.length === 2) {
      const [start, end] = dateRange.map((date) => new Date(date).getTime());
      filtered = filtered.filter((badge) => {
        const badgeDate = new Date(badge.assigned_at).getTime();
        return badgeDate >= start && badgeDate <= end;
      });
    }
    if (badgeType) {
      filtered = filtered.filter(
        (badge) => badge.type?.toLowerCase() === badgeType.toLowerCase()
      );
    }
    setFilteredBadges(filtered);
  }, [badges, dateRange, badgeType]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleEditClick = () => setIsModalVisible(true);
  const handleModalClose = () => setIsModalVisible(false);

  const getBadgeIcon = (iconName) => {
    const IconComponent = FaIcons[iconName];
    return IconComponent ? (
      <IconComponent size={20} className="mr-[5px] text-[#f39c12]" />
    ) : (
      <FaIcons.FaTrophy
        size={20}
        className="mr-[5px] text-[#f39c12]"
      />
    );
  };

  const badgeFilterContent = (
    <div className="w-[250px]">
      <Tooltip title="Date Range">
        <RangePicker
          onChange={(dates) => setDateRange(dates || [])}
          className="!w-full !mb-[10px]"
        />
      </Tooltip>
      <Tooltip title="Select Badge Type">
        <Select
          placeholder="Select Badge Type"
          onChange={setBadgeType}
          allowClear
          className="!w-full"
        >
          <Option value="praise">Praise</Option>
          <Option value="concern">Concern</Option>
        </Select>
      </Tooltip>
    </div>
  );

  if (!user) {
    return (
      <p className="text-center text-red-600">
        User data not available.
      </p>
    );
  }

  return (
    <div className="container border border-border-color rounded-lg my-4 mx-auto p-0">
      <Card>
        <div className="flex justify-between">
          <Title level={3} className="!m-0 !w-auto">
            Profile
          </Title>
          <Button
            type="primary"
            className="custom-button !w-auto"
            onClick={handleEditClick}
          >
            Edit
          </Button>
        </div>

        <div className="text-center mb-[20px]">
          <div className="inline-block relative">
            <div style={getAvatarBorderStyle()}>
              {user.userLogo ? (
                <Avatar src={user.userLogo} size={100} />
              ) : (
                <Avatar size={100} icon={<UserOutlined />} />
              )}
            </div>
            {/* Profile completion percentage */}
            <div
              className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 px-2 py-1 rounded-full text-xs font-semibold text-white shadow-md"
              style={{
                backgroundColor: getBorderColor(calculateProfileCompletion()),
                minWidth: '40px'
              }}
            >
              {calculateProfileCompletion()}%
            </div>
          </div>
          <Title level={3} className="mt-[15px]">
            {user.fname} {user.lname}
          </Title>
          {/* Profile completion status text */}
          {/* <div className="text-sm text-gray-600 mt-1">
            Profile {calculateProfileCompletion()}% complete
          </div> */}
        </div>

        <Descriptions column={1} bordered >
          <Descriptions.Item label="Name">
            {user.fname} {user.lname}
          </Descriptions.Item>
          <Descriptions.Item label="Username">
            {user.username}
          </Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
          <Descriptions.Item label="Workspace Name">
            {user.workspaceName?.join(", ") || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Team Title">
            {user.teamTitle?.join(", ") || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Badges">
            <div
              className="flex items-center justify-between"
            >
              <div
                className="max-h-[100px] overflow-y-auto w-full"
              >
                <List
                  itemLayout="horizontal"
                  dataSource={filteredBadges}
                  renderItem={(badge, index) => (
                    <List.Item key={index}>
                      <Tooltip
                        title={
                          <>
                            <p>
                              <strong>Description:</strong>{" "}
                              {badge.description || "N/A"}
                            </p>
                            <p>
                              <strong>Assigned By:</strong>{" "}
                              {badge.assigned_by_email || "N/A"}
                            </p>
                            <p>
                              <strong>Date:</strong>{" "}
                              {badge.assigned_at || "N/A"}
                            </p>
                          </>
                        }
                      >
                        <span className="flex items-center">
                          {getBadgeIcon(badge.icon)} {badge.name}
                        </span>
                      </Tooltip>
                    </List.Item>
                  )}
                  pagination={false}
                />
              </div>
              <Popover
                content={badgeFilterContent}
                title="Filter Badges"
                trigger="click"
              >
                <Button
                  shape="circle"
                  icon={<FilterOutlined />}
                  size="small"
                  className="ml-[10px]"
                />
              </Popover>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Attended Events">
            <div className="mt-[16px]">
              {assignedEvents.length === 0 ? (
                <p>No events assigned</p>
              ) : (
                <>
                  <p>
                    Attended <strong>{attendedEvents.length}</strong> out of{" "}
                    <strong>{assignedEvents.length}</strong> assigned events
                  </p>
                  <p>
                    Attendance Rate:{" "}
                    <strong>
                      {Math.round(
                        (attendedEvents.length / assignedEvents.length) * 100
                      )}
                      %
                    </strong>
                  </p>
                </>
              )}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Modal
        title="Edit Profile"
        open={isModalVisible}
        onCancel={handleModalClose}
        footer={null}
      >
        <UserSettingsDashboard
          user={user}
          onUserUpdate={onUserUpdate}
          handleModalClose={handleModalClose}
        />
      </Modal>
    </div>
  );
};

export default UserProfile;
