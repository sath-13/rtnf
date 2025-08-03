"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Modal, Typography, notification, Select, Input, Tooltip, Menu, Checkbox, Dropdown } from "antd";
import { AiOutlineSetting, AiOutlineUserAdd } from "react-icons/ai";
import {
  getUsersInWorkspace, deleteUserFromWorkspace,
  updateUserStatus, AdminsIsUpdatingUser, updateUserTeamTitle, resendResetEmails,
  transferUsersToWorkspace,
  replicaUsersToWorkspace
} from "../../../../api/usersapi";
import UserAdditionForm from "../UserAddition/UserAdditionForm";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { FaFileImport } from "react-icons/fa";
import { ExportOutlined } from "@ant-design/icons";
import "./userdash.css";
import {
  FeedbackMessages,
  UserMessages,
} from "../../../../constants/constants";
import { getAllTeams } from "../../../../api/teamapi";
import UserImportModal from "../../UserImport/UserImportModal";
import { getAllWorkspaces } from "../../../../api/workspaceapi";
import * as XLSX from "xlsx";
import AssignBadges from "../../Praise/AssignBadges/AssignBadges";
import { getUserTableColumns } from "./userColumns";
import ImportListColumns from "./importusersColumns";
import FeedbackModal from "../Feedback/Request_FeedBack_Modal";
import { submitFeedback } from "../../../../api/feedbackapi";
import ReviewModal from "../RequestedReview/ReviewModal"; // Adjust path as needed
import DirectFeedbackModal from "../Feedback/Direct_Feedback_modal";

import InternalNodes from "../Feedback/InternalNodes";
import ViewProfile from "../Profile/ViewProfile";
import UpdateUserProfile from "./UpdateUserProfile.js";
import { toastError, toastSuccess } from "../../../../Utility/toast.js";

const { Title } = Typography;
const { Option } = Select;

const UserDashboard = () => {
  const [userList, setUserList] = useState([]);
  const [teams, setTeams] = useState([]);
  const [dataLoader, setDataLoader] = useState(false);
  const [isFormVisible, setFormVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(""); // Track which user is being edited
  const { workspacename } = useParams();
  const [isImportVisible, setImportVisible] = useState(false);
  const [isImportVisibleList, setImportVisibleList] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState({});
  const [selectedTeam, setSelectedTeam] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [isFeedbackModalVisible, setIsFeedbackModalVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [filteredStatus] = useState(null);
  const [filteredRole] = useState(null);
  const [loading, setLoading] = useState(false); // Track loading state
  const [statusFilter, setStatusFilter] = useState(null);

  const [transferModalVisible, setTransferModalVisible] = useState(false);
  const [workspaces, setWorkspaces] = useState([]);
  const [targetWorkspace, setTargetWorkspace] = useState(null);
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [isInternalNodeModalVisible, setInternalNodeModalVisible] = useState(false);
  const [isViewProfileModalVisible, setViewProfileModalVisible] = useState(false);
  const [isUpdateProfileModalVisible, setIsUpdateProfileModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [visibleColumns, setVisibleColumns] = useState({
    fname: true,
    lname: true,
    username: true,
    email: true,
    branch: false,
    role: true,
    teamTitle: false,
    status: true,
    actions: true,
  });

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUserRole = user?.role;
  const currentUserId = user?.id;
  console.log("selectedUser is", selectedUser);

  useEffect(() => {
    async function fetchWorkspaces() {
      try {
        const response = await getAllWorkspaces();
        // Extract the correct array
        setWorkspaces(response.data.workspaces || []);
      } catch (error) {
        console.error("Error fetching workspaces:", error);
      }
    }
    fetchWorkspaces();
  }, []);

  useEffect(() => {
  }, [isReviewModalVisible]);

  useEffect(() => {
    if (currentUserRole !== "superadmin") return;

    const fetchTeams = async () => {
      try {
        const response = await getAllTeams(workspacename);
        setTeams(response?.data || []);
      } catch (error) {
        console.error(UserMessages.USER_TEAM_FETCH_ERR, error);
        // notification.error({
        //   message: UserMessages.USER_ERR_MSG,
        //   description: UserMessages.USER_TEAM_FETCH_ERR_MSG,
        // });
        toastError({
          title: UserMessages.USER_ERR_MSG,
          description: UserMessages.USER_TEAM_FETCH_ERR_MSG,
        });
      }
    };
    fetchTeams();
  }, [workspacename, currentUserRole]);

  const fetchUsers = useCallback(async () => {
    setDataLoader(true);
    try {
      const users = await getUsersInWorkspace(workspacename);
      setUserList(users);
    } catch (error) {
      // notification.error({
      //   message: UserMessages.USER_ERR_MSG,
      //   description: error.message
      // });
      toastError({ title: UserMessages.USER_ERR_MSG, description: error.message });
    } finally {
      setDataLoader(false);
    }
  }, [workspacename]); //  Ensures latest workspacename is used

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); //  No ESLint warnings

  // Filter Users
  const normalUsers = userList;
  const importedUsers = userList.filter((user) => user.imported); // Imported users list

  const handleDelete = async (id) => {
    try {
      // await deleteUserFromWorkspace(id);
      await deleteUserFromWorkspace(id, workspacename);
      // notification.success({ message: UserMessages.USER_SUCC_MSG, description: UserMessages.USER_DELETE_SUCC_DESCR });
      toastSuccess({ title: UserMessages.USER_SUCC_MSG, description: UserMessages.USER_DELETE_SUCC_DESCR });
      fetchUsers();
    } catch (error) {
      // notification.error({ message: UserMessages.USER_ERR_MSG, description: error.message });
      toastError({ title: UserMessages.USER_ERR_MSG, description: error.message });
    }
  };

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
  };

  const handleOpenFeedbackModal = (user) => {
    setSelectedUser(user);
    setIsFeedbackModalVisible(true);
  };

  const handleCloseFeedbackModal = () => {
    setIsFeedbackModalVisible(false);
    setSelectedUser(null);
  };

  const handleOpenInternalNodeModal = (user) => {
    setInternalNodeModalVisible(true);
    setSelectedUser(user);
  };

  const handleCloseInternalNodeModal = () => {
    setInternalNodeModalVisible(false);
    setSelectedUser(null);
  };

  const handleOpenReviewModal = (user) => {
    setSelectedUser(user);
    setIsReviewModalVisible(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalVisible(false);
    setSelectedUser(null);
  };

  const handleOpenProfileModal = (user) => {
    setSelectedUser(user);
    setViewProfileModalVisible(true);
  }


  const handleCloseProfileModal = () => {
    setSelectedUser(null);
    setViewProfileModalVisible(false);
  };






  const handleSubmitFeedback = async (feedbackData) => {
    try {
      await submitFeedback(feedbackData);
      // notification.success({
      //   message: FeedbackMessages.FEEDBACK_SUBMIT,
      //   description: FeedbackMessages.FEEDBACK_SUBMIT_SUCC,
      // });
      toastSuccess({ title: FeedbackMessages.FEEDBACK_SUBMIT, description: FeedbackMessages.FEEDBACK_SUBMIT_SUCC });
      handleCloseModal();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // notification.error({
      //   message: FeedbackMessages.SUBMISSION_FAILED,
      //   description: FeedbackMessages.ERR_TRY_AGAIN,
      // });
      toastError({ title: FeedbackMessages.SUBMISSION_FAILED, description: FeedbackMessages.ERR_TRY_AGAIN });
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateUserStatus(id, newStatus);
      // notification.success({ message: UserMessages.USER_SUCC_MSG, description: UserMessages.USER_STATUS_SUCC_DESCR });
      toastSuccess({ title: UserMessages.USER_SUCC_MSG, description: UserMessages.USER_STATUS_SUCC_DESCR });
      fetchUsers();
    } catch (error) {
      // notification.error({ message: UserMessages.USER_ERR_MSG, description: error.message });
      toastError({ title: UserMessages.USER_ERR_MSG, description: error.message });
    }
  };

  const handleTeamTitleChange = async (id, newTeamTitle) => {
    try {
      await updateUserTeamTitle(id, newTeamTitle);
      // notification.success({ message: UserMessages.USER_SUCC_MSG, description: UserMessages.USER_TEAM_TITLE_SUCC_DESCR });
      toastSuccess({ title: UserMessages.USER_SUCC_MSG, description: UserMessages.USER_TEAM_TITLE_SUCC_DESCR });
      fetchUsers();
    } catch (error) {
      // notification.error({ message: UserMessages.USER_ERR_MSG, description: error.message });
      toastError({ title: UserMessages.USER_ERR_MSG, description: error.message });
    }
  };

  // Handle status change
  const confirmStatusChange = async (id) => {
    if (selectedStatus[id]) {
      await handleStatusChange(id, selectedStatus[id]);
      setSelectedStatus((prev) => ({ ...prev, [id]: null })); // Reset state after confirmation
    }
  };

  // Handle team title change
  const confirmTeamTitleChange = async (id) => {
    if (selectedTeam[id]) {
      await handleTeamTitleChange(id, selectedTeam[id]);
      setSelectedTeam((prev) => ({ ...prev, [id]: null })); // Reset state after confirmation
    }
  };

  const isEditing = (record) => record._id === editingKey;

  const handleEdit = (record) => {
    setEditingKey(record._id);
  };

  const handleOpenUpdateProfile = (user) => {
    setEditingUser(user);
    setIsUpdateProfileModalVisible(true);
  };

  const handleCloseUpdateProfile = () => {
    setEditingUser(null);
    setIsUpdateProfileModalVisible(false);
  };

  const handleUpdateUser = async (formData, userId) => {
    try {
      await AdminsIsUpdatingUser(userId, formData);
      toastSuccess({ title: "Success", description: UserMessages.USER_UPDATED_SUCC });
      fetchUsers();
      handleCloseUpdateProfile(); // Close the modal after update
    } catch (error) {
      console.error("Error updating user:", error);
      toastError({ title: UserMessages.USER_UPDATE_ERR, description: error.message });
    }
  };

  const handleChange = (value, key, dataIndex) => {
    setUserList((prevList) =>
      prevList.map((item) =>
        item._id === key ? { ...item, [dataIndex]: value } : item
      )
    );
  };

  // Column settings menu
  const columnSettingsMenu = (
    <Menu>
      {Object.keys(visibleColumns).map((key) => (
        <Menu.Item key={key}>
          <Checkbox
            checked={visibleColumns[key]}
            onChange={(e) => setVisibleColumns({ ...visibleColumns, [key]: e.target.checked })}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  const columns = getUserTableColumns({
    currentUserRole,
    isEditing,
    handleChange,
    selectedTeam,
    setSelectedTeam,
    teams,
    confirmTeamTitleChange,
    selectedStatus,
    setSelectedStatus,
    confirmStatusChange,
    handleEdit,
    handleDelete,
    handleOpenModal,
    handleOpenFeedbackModal,
    handleOpenReviewModal,
    handleOpenInternalNodeModal,
    handleOpenProfileModal,
    handleOpenUpdateProfile,
    visibleColumns,
    setVisibleColumns,
    loggedInUserId: currentUserId, // 👈 add this line
  });


  const Listcolumns = ImportListColumns({
    handleDelete
  });

  // const Listcolumns = ImportListColumns({
  //   handleDelete,
  // });

  const handleResendEmails = async () => {
    setLoading(true); // Show loading indicator

    try {
      const response = await resendResetEmails(workspacename);
      // notification.success({ message: response.message });
      toastSuccess({ title: "Success", description: response.message });
    } catch (error) {
      // notification.error({ message: error.response?.data?.message || "Failed to resend emails" });
      toastError({ title: "Error", description: error.response?.data?.message || "Failed to resend emails" });
    }

    setLoading(false); // Hide loading indicator
  };

  const filteredUsers = normalUsers
    // .filter((user) => user.role !== "superadmin") // Exclude Super Admins
    .filter((user) =>
      searchEmail ? user.email.toLowerCase().includes(searchEmail.toLowerCase()) : true
    )
    .filter((user) => (filteredStatus ? user.status === filteredStatus : true))
    .filter((user) => (filteredRole ? user.role === filteredRole : true))
    .map((user) => ({ ...user, key: user._id }));

  const handleUserTransfer = async () => {
    if (!targetWorkspace) {
      // notification.error({ message: UserMessages.PLEASE_SELECT_WORKSPACE });
      toastError({ title: "Error", description: UserMessages.PLEASE_SELECT_WORKSPACE });
      return;
    }

    const selectedUserIds = userList.map((user) => user._id); // Select all users
    try {
      await transferUsersToWorkspace(selectedUserIds, targetWorkspace);
      // notification.success({ message: UserMessages.USER_TRANSFERRED_SUCC });
      toastSuccess({ title: "Success", description: UserMessages.USER_TRANSFERRED_SUCC });
      setTransferModalVisible(false);
      fetchUsers(); // Refresh users
    } catch (error) {
      // notification.error({ message: error.message });
      toastError({ title: "Error", description: error.message });
    }
  };

  const handleUserReplica = async () => {
    if (!targetWorkspace) {
      // notification.error({ message: UserMessages.PLEASE_SELECT_WORKSPACE });
      toastError({ title: "Error", description: UserMessages.PLEASE_SELECT_WORKSPACE });
      return;
    }

    const selectedUserIds = userList.map((user) => user._id);

    try {
      await replicaUsersToWorkspace(selectedUserIds, targetWorkspace);
      // notification.success({ message: UserMessages.USER_REPLICATED_SUCC });
      toastSuccess({ title: "Success", description: UserMessages.USER_REPLICATED_SUCC });
      setTransferModalVisible(false);
    } catch (error) {
      // notification.error({ message: error.message });
      toastError({ title: "Error", description: error.message });
    }
  };

  const handleExportUsers = () => {
    if (userList.length === 0) {
      // notification.error({ message: UserMessages.NO_USERS_AVAILABLE_TO_EXPORT });
      toastError({ title: "Error", description: UserMessages.NO_USERS_AVAILABLE_TO_EXPORT });
      return;
    }

    // Filter out superadmin users
    const filteredUsers = userList.filter(user => user.role !== "superadmin");

    if (filteredUsers.length === 0) {
      // notification.error({ message: UserMessages.NO_VALID_USERSPTO_EXPORT });
      toastError({ title: "Error", description: UserMessages.NO_VALID_USERSPTO_EXPORT });
      return;
    }

    const exportData = filteredUsers.map(({ fname, lname, email, role, branch }) => ({
      fname: fname,
      lname: lname,
      email: email,
      branch: branch,
      role: role,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    XLSX.writeFile(wb, "UsersList.xlsx");
    // notification.success({ message: UserMessages.USER_EXPORT_SUCC });
    toastSuccess({ title: "Success", description: UserMessages.USER_EXPORT_SUCC });
  };


  return (
    <motion.div
      className="container "
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto !mt-[72px] md:!mt-0">

        <h1 className="!text-center !text-2xl lg:!text-[32px] text-primary-text font-rubik font-semibold !p-0 !mt-[14px] !mb-3" >
          Users in {workspacename}
        </h1>

        {/* Toolbar with reduced bottom margin for tight spacing with table */}
        <div className="flex flex-col lg:flex-row items-center gap-2 lg:gap-x-4 w-full mb-2">
          {/* Left: Action Buttons */}
          {currentUserRole === "superadmin" && (
            <div className="flex flex-col lg:flex-row gap-2 lg:gap-5 w-full lg:w-auto justify-center lg:justify-start items-center">
              <Button
                className="w-full lg:w-auto"
                size="large"
                icon={<AiOutlineUserAdd />}
                onClick={() => setFormVisible(true)}
              >
                Create Users
              </Button>
              <Button
                className="w-full lg:w-auto"
                size="large"
                icon={<FaFileImport />}
                onClick={() => setImportVisible(true)}
              >
                Import Users
              </Button>
              <Button
                className="w-full lg:w-auto"
                size="large"
                onClick={() => setImportVisibleList(true)}
              >
                Imported Users List
              </Button>
              <Button
                className="w-full lg:w-auto"
                size="large"
                icon={<ExportOutlined />}
                onClick={() => setTransferModalVisible(true)}
              >
                Export Replica
              </Button>
            </div>
          )}
          {/* Right: Search and Settings */}
          <div className="flex flex-row gap-4 items-center w-full lg:w-auto lg:ml-auto mt-2 lg:mt-0">
            <Tooltip title="Enter email to search">
              <Input.Search
                placeholder="Search by Email"
                value={searchEmail}
                allowClear
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full lg:w-[220px]"
              />
            </Tooltip>
            {/* Settings Button Above the Table */}
            <Dropdown overlay={columnSettingsMenu} trigger={["click"]}>
              <Tooltip title="Column Settings">
                <Button
                  type="link"
                  className="w-full lg:w-auto"
                  icon={<AiOutlineSetting />} />
              </Tooltip>
            </Dropdown>
          </div>
        </div>

        <UserImportModal
          visible={isImportVisible}
          workspacename={workspacename}
          onClose={() => setImportVisible(false)} refreshUsers={fetchUsers} />

        <Modal
          title="Imported Users List"
          open={isImportVisibleList}
          onCancel={() => setImportVisibleList(false)}
          footer={null}
          width={1000}
        >
          <div className="!flex !justify-between !my-2.5">
            <Select
              placeholder="Filter by status"
              className="!w-[200px]"
              allowClear
              onChange={(value) => setStatusFilter(value)}
            >
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>

            <Button
              className="custom-button"
              loading={loading}
              onClick={handleResendEmails}
            >
              Resend Activation Email
            </Button>
          </div>
          <Table
            scroll={{ x: "max-content" }}
            columns={Listcolumns}
            dataSource={importedUsers
              .filter((user) => !statusFilter || user.status === statusFilter)
              .map((user) => ({ ...user, key: user._id }))}
            pagination={{ pageSize: 4 }}
            bordered
          />

          {/* Count User's by Status */}
          <div className="!mt-2.5 !text-left !font-bold">
            <p>Total Imported Users: {importedUsers.length}</p>
            <p>
              Active Users: {importedUsers.filter((user) => user.status === "active").length}
            </p>
            <p>
              Inactive Users: {importedUsers.filter((user) => user.status === "inactive").length}
            </p>
          </div>
        </Modal>

        <Modal
          title="Transfer Users"
          open={transferModalVisible}
          onCancel={() => setTransferModalVisible(false)}
          footer={null}
        >
          <Select
            placeholder="Select Target Workspace"
            className="!w-full"
            onChange={(value) => setTargetWorkspace(value)}
          >
            {workspaces.length > 0 ? (
              workspaces.map((ws) => (
                <Option key={ws._id} value={ws.workspacename}>
                  {ws.workspacename}
                </Option>
              ))
            ) : (
              <Option disabled>No workspaces found</Option>
            )}
          </Select>

          <Button
            className="custom-button !mt-2.5"
            type="primary"
            onClick={handleUserTransfer}
          >
            Transfer Users
          </Button>

          <Button
            type="default"
            className="!mt-2.5 !ml-2.5"
            onClick={handleUserReplica}
          >
            Replica Users
          </Button>

          <Button
            type="default"
            className="!mt-2.5 !ml-2.5 !flex !justify-end"
            icon={<ExportOutlined />}
            onClick={handleExportUsers}
          >
            Export Users (XLSX)
          </Button>
        </Modal>

        <div className="table-container">
          <Table
            loading={dataLoader}
            columns={columns}
            dataSource={filteredUsers}
            pagination={{ pageSize: 6 }}
            scroll={{ x: "max-content" }}
            // style={{ marginTop: "8px", width: "95%" }}
            bordered
          />
        </div>

        <Modal
          title="Add User"
          open={isFormVisible}
          onCancel={() => setFormVisible(false)}
          footer={null}
        >
          <UserAdditionForm
            onClose={() => setFormVisible(false)}
            refreshModels={fetchUsers}
          />
        </Modal>
      </div>

      {/*Update User Profile*/}
      <Modal
        title="Update User Profile"
        open={isUpdateProfileModalVisible}
        onCancel={handleCloseUpdateProfile}
        footer={null}
        destroyOnClose
      >
        <UpdateUserProfile
          visible={isUpdateProfileModalVisible}
          onCancel={handleCloseUpdateProfile}
          onSave={handleUpdateUser}
          user={editingUser}
        />
      </Modal>

      {/*ViewProfile Modal*/}
      <Modal
        title={`Profile`}
        visible={isViewProfileModalVisible}
        onCancel={handleCloseProfileModal}
        footer={null}
        width="90%" // Set the width to 90% of the screen
      >
        {selectedUser && (
          <ViewProfile
            visible={isViewProfileModalVisible}
            onClose={handleCloseProfileModal}
            selectedUser={selectedUser}
            workspaceName={workspacename}
          />
        )}
      </Modal>

      {/* Assign Badge Modal */}
      <Modal
        title={`Assigning Badge to ${selectedUser?.fname} ${selectedUser?.lname}`}
        visible={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
      >
        <AssignBadges selectedUser={selectedUser} onClose={handleCloseModal} />
      </Modal>

      <Modal
        title={`Giving Feedback to ${selectedUser?.fname} ${selectedUser?.lname}`}
        visible={isFeedbackModalVisible}
        onCancel={handleCloseFeedbackModal}
        footer={null}
      >
        {selectedUser && (
          <DirectFeedbackModal
            visible={isFeedbackModalVisible}
            onClose={handleCloseFeedbackModal}
            selectedUser={selectedUser}
          />
        )}
      </Modal>

      {/* Internal Nodes */}
      <Modal
        title={`Giving Internal Notes  to ${selectedUser?.fname} ${selectedUser?.lname}`}
        visible={isInternalNodeModalVisible}
        onCancel={handleCloseInternalNodeModal}
        footer={null}
      >
        {selectedUser && (
          <InternalNodes
            visible={isInternalNodeModalVisible}
            selectedUser={selectedUser}
            onClose={handleCloseInternalNodeModal}
          />
        )}
      </Modal>

      {/* Review Modal */}
      <Modal
        title={`Reviewing ${selectedUser?.fname} ${selectedUser?.lname}`}
        visible={isReviewModalVisible}
        onCancel={handleCloseReviewModal}
        footer={null}
      >
        {selectedUser && (
          <ReviewModal
            visible={isReviewModalVisible}
            onClose={handleCloseReviewModal}
            selectedUser={selectedUser}
          />
        )}
      </Modal>
    </motion.div>
  );
};

export default UserDashboard;
