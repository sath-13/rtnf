"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Table,
  Button,
  Modal,
  notification,
  Spin,
  Select,
  Tooltip,
  DatePicker,
} from "antd";
import { getAllUsersFromWorkspaces } from "../../../api/usersapi";
import { getAllWorkspaces } from "../../../api/workspaceapi";
import * as FaIcons from "react-icons/fa";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import AddBadge from "./AddBadge";
import ViewBadgesModal from "./ViewBadgeModal";
import { DownloadOutlined } from "@ant-design/icons";
import { CSVLink } from "react-csv";
import { getAllTeams } from "../../../api/teamapi";
import { prepareCSVData } from "./ExportsData";
import SendEmailModal from "./SendEmailModal";
import { toastError } from "../../../Utility/toast";

dayjs.extend(isBetween);

const UserListWithBadges = () => {
  const [users, setUsers] = useState([]);
  const [admin, setAdmin] = useState(null);
  const [workspaces, setWorkspaces] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isAddBadgeModalOpen, setIsAddBadgeModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState(null);
  const [teamFilter, setTeamFilter] = useState(null);
  const [teams, setTeams] = useState([]);
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const exportData = prepareCSVData(filteredUsers, dateRange);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllUsersFromWorkspaces(user?.email);
      const allUsers = response?.users || [];
      setUsers(allUsers);
      setAdmin(response?.admin || null);
      setFilteredUsers([response?.admin, ...allUsers].filter(Boolean));
    } catch (error) {
      // notification.error({ message: "Error", description: "Failed to load users." });
      toastError({ title: "Error", description: "Failed to load users." });
    } finally {
      setLoading(false);
    }
  }, [user?.email]);

  const fetchWorkspaces = async () => {
    try {
      const response = await getAllWorkspaces();
      setWorkspaces(response?.data?.workspaces || []);
    } catch (error) {
      // notification.error({ message: "Error", description: "Failed to load workspaces." });
      toastError({ title: "Error", description: "Failed to load workspaces." });
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchWorkspaces();
  }, [fetchUsers]);

  useEffect(() => {
    let filtered = [admin, ...users].filter(Boolean);

    if (selectedWorkspace) {
      filtered = filtered.filter((user) =>
        Array.isArray(user.workspaceName)
          ? user.workspaceName.includes(selectedWorkspace)
          : user.workspaceName === selectedWorkspace
      );
    }

    if (teamFilter) {
      filtered = filtered.filter((user) =>
        Array.isArray(user.teamTitle)
          ? user.teamTitle.includes(teamFilter)
          : user.teamTitle === teamFilter
      );
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const [start, end] = dateRange.map((d) => dayjs(d));
      filtered = filtered.filter((user) =>
        user?.assignedBadges?.some((badge) =>
          dayjs(badge?.assignedAt).isBetween(start, end, null, "[]")
        )
      );
    }

    setFilteredUsers(filtered);
  }, [admin, users, selectedWorkspace, teamFilter, dateRange]);

  const handleWorkspaceFilter = async (value) => {
    setSelectedWorkspace(value);
    setTeamFilter(null);
    setTeams([]);
    if (value) {
      try {
        const response = await getAllTeams(value);
        setTeams(response?.data || []);
      } catch (error) {
        // notification.error({ message: "Error", description: "Failed to load teams." });
        toastError({ title: "Error", description: "Failed to load teams." });
      }
    }
  };

  const getBadgeIcon = (iconName) => {
    const IconComponent = FaIcons[iconName];
    return IconComponent ? (
      <IconComponent size={30} color="#ff9800" />
    ) : (
      <FaIcons.FaTrophy size={30} color="#ff9800" />
    );
  };

  const showBadgeModal = (user) => {
    setSelectedUser(user);
    setIsBadgeModalOpen(true);
  };

  const openSendEmailModal = () => setIsSendEmailModalOpen(true);
  const closeSendEmailModal = () => setIsSendEmailModalOpen(false);

  const columns = useMemo(() => {
    const baseColumns = [
      { title: "First Name", dataIndex: "fname", key: "fname" },
      { title: "Last Name", dataIndex: "lname", key: "lname" },
      { title: "Email", dataIndex: "email", key: "email" },
      { title: "Branch", dataIndex: "branch", key: "branch" },
      {
        title: "Teams",
        dataIndex: "teamTitle",
        key: "teamTitle",
        render: (teamTitle) =>
          Array.isArray(teamTitle)
            ? teamTitle.map((team, i) => <div key={i}>{team}</div>)
            : teamTitle || "N/A",
      },
      {
        title: "Workspaces",
        dataIndex: "workspaceName",
        key: "workspaceName",
        render: (workspaceName) =>
          Array.isArray(workspaceName)
            ? workspaceName.map((ws, i) => <div key={i}>{ws}</div>)
            : workspaceName || "N/A",
      },
      { title: "Role", dataIndex: "role", key: "role" },
    ];

    // Only show Action column if date filter is not applied
    if (!(dateRange && dateRange[0] && dateRange[1])) {
      baseColumns.push({
        title: "Action",
        key: "action",
        render: (_, record) => (
          <Tooltip title="View Assigned Badges">
            <Button
              icon={<FaIcons.FaEye />}
              onClick={() => showBadgeModal(record)}
            />
          </Tooltip>
        ),
      });
    }

    return baseColumns;
  }, [dateRange]);

  return (
    <div className="container border border-border-color rounded-lg my-4 mx-auto p-3 bg-[#fff]">
      <div
        className="!flex !gap-3 !flex-wrap !mb-4"
      >
        <Select
          className="!w-[200px]"
          placeholder="Filter by Workspace"
          onChange={handleWorkspaceFilter}
          allowClear
        >
          {workspaces.map((ws) => (
            <Select.Option key={ws._id} value={ws.workspacename}>
              {ws.workspacename}
            </Select.Option>
          ))}
        </Select>

        <Select
          className="!w-[200px]"
          placeholder="Filter by Team"
          value={teamFilter}
          onChange={setTeamFilter}
          allowClear
        >
          {teams.map((team) => (
            <Select.Option key={team._id} value={team.teamTitle}>
              {team.teamTitle}
            </Select.Option>
          ))}
        </Select>

        <Tooltip title="Filter By Assigned Badge Date">
          <DatePicker.RangePicker
            onChange={(dates) => setDateRange(dates)}
            className="!w-[280px]"
            format="YYYY-MM-DD"
            allowClear
          />
        </Tooltip>

        <CSVLink
          data={exportData}
          filename="filtered-users-with-badges.csv"
          className="!no-underline"
        >
          <Button
            className="custom-button"
            type="primary"
            icon={<DownloadOutlined />}
          >
            Export CSV
          </Button>
        </CSVLink>

        <Button
          className="custom-button !w-auto"
          type="primary"
          onClick={openSendEmailModal}
        >
          Send Email
        </Button>

        <Button
          className="custom-button !w-auto"
          type="primary"
          onClick={() => setIsAddBadgeModalOpen(true)}
        >
          Add Badge
        </Button>
      </div>

      <SendEmailModal
        isOpen={isSendEmailModalOpen}
        onClose={closeSendEmailModal}
        csvData={exportData}
      />

      <Modal
        title="Add New Badge"
        open={isAddBadgeModalOpen}
        onCancel={() => setIsAddBadgeModalOpen(false)}
        footer={null}
        width={750}
      >
        <AddBadge />
      </Modal>

      {loading && (
        <Spin size="large" className="!block !mx-auto !my-5" />
      )}

      <Table
        className="rounded-lg"
        dataSource={filteredUsers}
        columns={columns}
        rowKey="email"
        pagination={{ pageSize: 5 }}
        scroll={{ x: "max-content" }}
      />

      <ViewBadgesModal
        isOpen={isBadgeModalOpen}
        onClose={() => setIsBadgeModalOpen(false)}
        selectedUser={selectedUser}
        getBadgeIcon={getBadgeIcon}
      />
    </div>
  );
};

export default UserListWithBadges;
