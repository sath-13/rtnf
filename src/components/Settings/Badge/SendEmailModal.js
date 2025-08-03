import React, { useState, useEffect } from "react";
import {
  Modal,
  Button,
  Input,
  notification,
  Select,
  Row,
  Col,
  Checkbox,
  Typography,
  Card,
} from "antd";
import { getAllTeams } from "../../../api/teamapi";
import { sendEmailWithAttachment } from "../../../api/emailapi";
import { getAllWorkspaces } from "../../../api/workspaceapi";
import { getAllUsersFromWorkspaces } from "../../../api/usersapi";
import { convertToCSV } from "./ExportsData";
import { toastError, toastSuccess, toastWarning } from "../../../Utility/toast";

const { Option } = Select;
const { Title } = Typography;

const SendEmailModal = ({ isOpen, onClose, csvData }) => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [teamFilter, setTeamFilter] = useState(null);
  const [teams, setTeams] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const workspacesData = await getAllWorkspaces();
        setWorkspaces(workspacesData?.data?.workspaces || []);
      } catch (error) {
        // notification.error({
        //   message: "Error",
        //   description: "Failed to fetch workspaces.",
        // });
        toastError({ title: "Error", description: "Failed to fetch workspaces." });
      }
    };
    fetchWorkspaces();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await getAllUsersFromWorkspaces(user?.email);
        const allUsers = response?.users || [];
        setUsers(allUsers);
        setFilteredUsers(allUsers);
      } catch (error) {
        // notification.error({ message: "Error", description: "Failed to load users." });
        toastError({ title: "Error", description: "Failed to load users." });
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchUsers();
  }, [isOpen]);

  useEffect(() => {
    if (selectedWorkspace) {
      const fetchTeams = async () => {
        try {
          const response = await getAllTeams(selectedWorkspace);
          setTeams(response?.data || []);
        } catch (error) {
          // notification.error({
          //   message: "Error",
          //   description: "Failed to load teams.",
          // });
          toastError({ title: "Error", description: "Failed to load teams." });
        }
      };
      fetchTeams();
    }
  }, [selectedWorkspace]);

  useEffect(() => {
    let filtered = [...users];
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
    if (searchText) {
      filtered = filtered.filter((user) =>
        user.email.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    setFilteredUsers(filtered);
  }, [users, selectedWorkspace, teamFilter, searchText]);

  const handleSendEmail = async () => {
    setLoading(true);
    try {
      if (selectedUsers.length === 0) {
        // notification.warning({
        //   message: "Warning",
        //   description: "Please select at least one user.",
        // });
        toastWarning({ title: "Warning", description: "Please select at least one user." });
        return;
      }

      const csvString = convertToCSV(csvData);
      await sendEmailWithAttachment(selectedUsers, csvString);

      // notification.success({
      //   message: "Success",
      //   description: "Email sent successfully.",
      // });
      toastSuccess({ title: "Success", description: "Email sent successfully." });
      onClose();
    } catch (error) {
      // notification.error({
      //   message: "Error",
      //   description: "Failed to send email.",
      // });
      toastError({ title: "Error", description: "Failed to send email." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Send Email with CSV"
      open={isOpen}
      onCancel={onClose}
      centered
      width={600}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button className="custom-button" key="send" type="primary" onClick={handleSendEmail} loading={loading}>
          Send Email
        </Button>,
      ]}
    >
      <Card bordered={false}>
        <div className="!mb-4">
          <Title level={5}>Select Workspace</Title>
          <Select
            placeholder="Choose a workspace"
            className="!w-full"
            onChange={(value) => {
              setSelectedWorkspace(value);
              setTeamFilter(null);
            }}
            allowClear
          >
            {workspaces.map((workspace) => (
              <Option key={workspace._id} value={workspace.workspacename}>
                {workspace.workspacename}
              </Option>
            ))}
          </Select>
        </div>

        {selectedWorkspace && (
          <div className="!mb-4">
            <Title level={5}>Select Team</Title>
            <Select
              placeholder="Choose a team"
              className="!w-full"
              onChange={setTeamFilter}
              allowClear
            >
              {teams.map((team) => (
                <Option key={team._id} value={team.teamTitle}>
                  {team.teamTitle}
                </Option>
              ))}
            </Select>
          </div>
        )}

        <div className="!mb-4">
          <Title level={5}>Search Users</Title>
          <Input.Search
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by email"
            allowClear
          />
        </div>

        <div
          className="!max-h-[300px] !overflow-y-auto !p-2 !border !border-gray-100 !rounded"
        >
          <Title level={5}>Select Recipients</Title>

          {/* Select All Checkbox */}
          <div className="!mb-2">
            <Checkbox
              indeterminate={
                selectedUsers.length > 0 &&
                selectedUsers.length < filteredUsers.filter((u) => u.role !== "superadmin").length
              }
              onChange={(e) => {
                const allFiltered = filteredUsers
                  .filter((user) => user.role !== "superadmin")
                  .map((user) => user.email);
                setSelectedUsers(e.target.checked ? allFiltered : []);
              }}
              checked={
                filteredUsers.length > 0 &&
                selectedUsers.length ===
                filteredUsers.filter((u) => u.role !== "superadmin").length
              }
            >
              Select All
            </Checkbox>
          </div>

          <Checkbox.Group onChange={setSelectedUsers} value={selectedUsers}>
            <Row gutter={[0, 8]}>
              {filteredUsers
                .filter((user) => user.role !== "superadmin")
                .map((user) => (
                  <Col span={24} key={user._id}>
                    <Checkbox value={user.email}>{user.email}</Checkbox>
                  </Col>
                ))}
            </Row>
          </Checkbox.Group>
        </div>
      </Card>
    </Modal>
  );
};

export default SendEmailModal;
