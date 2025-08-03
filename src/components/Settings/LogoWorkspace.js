import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Upload, notification } from "antd";
import { getAllWorkspaces, updateWorkspaceLogo } from "../../api/workspaceapi";
import { AiOutlineEdit, AiOutlineUpload } from "react-icons/ai";
import { WorkspaceMessages } from "../../constants/constants";
import { toastError, toastSuccess } from "../../Utility/toast";

const WorkspaceLogoSettings = () => {
  const [workspaceList, setWorkspaceList] = useState([]);
  const [dataLoader, setDataLoader] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [newLogo, setNewLogo] = useState(null);

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setDataLoader(true);
      const response = await getAllWorkspaces();
      setWorkspaceList(response?.data?.workspaces);
      setDataLoader(false);
    } catch (error) {
      console.error(WorkspaceMessages.WORKSPACE_FETCH_ERR, error);
      setDataLoader(false);
    }
  };

  const handleEditClick = (workspace) => {
    setSelectedWorkspace(workspace);
    setEditModal(true);
  };

  const handleUpdateWorkspace = async () => {
    if (!newLogo) {
      // notification.error({ message: WorkspaceMessages.LOGO_UPLOAD });
      toastError({
        title: "Error",
        description: WorkspaceMessages.LOGO_UPLOAD,
      });
      return;
    }

    const formData = new FormData();
    formData.append("logo", newLogo);

    try {
      await updateWorkspaceLogo(selectedWorkspace._id, formData);
      // notification.success({ message: WorkspaceMessages.WORKSPACELOGO_UPDATE_SUCC });
      toastSuccess({
        title: "Success",
        description: WorkspaceMessages.WORKSPACELOGO_UPDATE_SUCC,
      });
      setEditModal(false);
      fetchWorkspaces(); // Refresh data
    } catch (error) {
      console.error(WorkspaceMessages.WORKSPACELOGO_UPDATE_ERR, error);
      // notification.error({ message: error.response?.data?.message || WorkspaceMessages.WORKSPACELOGO_UPDATE_ERR });
      toastError({
        title: "Error",
        description:
          error.response?.data?.message ||
          WorkspaceMessages.WORKSPACELOGO_UPDATE_ERR,
      });
    }
  };

  const handleCloseModal = () => {
    setEditModal(false);
    setSelectedWorkspace(null); // Reset selected workspace
    setNewLogo(null); // Clear uploaded file
  };

  const columns = [
    {
      title: "Workspace Name",
      dataIndex: "workspacename",
      responsive: ["xl", "lg", "md"],
    },
    {
      title: "Logo",
      dataIndex: "logo",
      render: (logo) =>
        logo ? (
          <img
            src={logo}
            alt="Workspace Logo"
            style={{ width: 50, height: 50, borderRadius: "50%" }}
          />
        ) : (
          "No Logo"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <Button
          className="custom-button"
          onClick={() => handleEditClick(record)}
        >
          <AiOutlineEdit /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="container mt-4 ">
      <Table
        className="!border !border-border-color !rounded-lg"
        loading={dataLoader}
        columns={columns}
        dataSource={workspaceList.map((workspace) => ({
          ...workspace,
          key: workspace._id,
        }))}
        pagination={{ pageSize: 6 }}
      />

      <Modal
        title="Edit Workspace Logo"
        open={editModal}
        onCancel={handleCloseModal} // Use the new function
        onOk={handleUpdateWorkspace}
        okText="Update"
        okButtonProps={{ className: "custom-button" }}
      >
        <Upload
          beforeUpload={(file) => {
            setNewLogo(file);
            return false; // Prevent automatic upload
          }}
          maxCount={1}
        >
          <Button icon={<AiOutlineUpload />}>Upload New Logo</Button>
        </Upload>
        <p>
          <i>Only .png and .jpeg images are allowed.</i>
        </p>
      </Modal>
    </div>
  );
};

export default WorkspaceLogoSettings;
