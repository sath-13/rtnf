import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Input, notification } from "antd";
import { getAllWorkspaces, updateWorkspace, checkWorkspaceEditName } from "../../api/workspaceapi";
import { AiOutlineEdit } from "react-icons/ai";
import { WorkspaceMessages } from "../../constants/constants";
import { toastError, toastSuccess } from "../../Utility/toast";

const WorkspaceSettings = () => {
  const [workspaceList, setWorkspaceList] = useState([]);
  const [dataLoader, setDataLoader] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    try {
      setDataLoader(true);
      const response = await getAllWorkspaces();
      setWorkspaceList(response?.data?.workspaces);
    } catch (error) {
      console.error(WorkspaceMessages.WORKSPACE_FETCH_ERR, error);
    } finally {
      setDataLoader(false);
    }
  };

  const handleEditClick = (workspace) => {
    setSelectedWorkspace(workspace);
    setNewWorkspaceName(workspace.workspacename);
    setEditModal(true);
  };

  const handleUpdateWorkspace = async () => {
    const trimmed = newWorkspaceName.trim();
    if (!trimmed) {
      return toastError({ title: "Error", description: WorkspaceMessages.WORKSPACENAME_EMPTY_ERR }); //notification.error({ message: WorkspaceMessages.WORKSPACENAME_EMPTY_ERR });
    }

    // 1️⃣ check “does name exist already?” (excluding the one we’re editing)
    const exists = await checkWorkspaceEditName(trimmed, selectedWorkspace._id);
    if (exists) {
      return toastError //notification.error({ message: WorkspaceMessages.WORSKPACENAME_ALREADY_EXISTS });
    }

    // 2️⃣ now safe to send update
    try {
      await updateWorkspace(selectedWorkspace._id, { workspacename: trimmed });
      // notification.success({ message: WorkspaceMessages.WORKSPACENAME_UPDATE_SUCC });
      toastSuccess({ title: "Success", description: WorkspaceMessages.WORKSPACENAME_UPDATE_SUCC });
      setEditModal(false);
      fetchWorkspaces();
    } catch (error) {
      console.error(WorkspaceMessages.WORKSPACENAME_UPDATE_ERR, error);
      // notification.error({ message: WorkspaceMessages.WORKSPACENAME_UPDATE_ERR });
      toastError({ title: "Error", description: WorkspaceMessages.WORKSPACENAME_UPDATE_ERR });
    }
  };

  const columns = [
    { title: "Workspace Name", dataIndex: "workspacename" },
    {
      title: "Actions",
      key: "actions",
      render: (_text, record) => (
        <Button className="custom-button" onClick={() => handleEditClick(record)}>
          <AiOutlineEdit /> Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <Table
        className="border border-border-color rounded-lg"
        loading={dataLoader}
        columns={columns}
        dataSource={workspaceList.map(w => ({ ...w, key: w._id }))}
        pagination={{ pageSize: 6 }}

      />

      <Modal
        title="Edit Workspace"
        open={editModal}
        onCancel={() => setEditModal(false)}
        onOk={handleUpdateWorkspace}
        okText="Update"
        okButtonProps={{ className: "custom-button" }}
      >
        <Input
          value={newWorkspaceName}
          onChange={(e) => setNewWorkspaceName(e.target.value)}
          placeholder="Enter new workspace name"
        />
      </Modal>
    </div>
  );
};

export default WorkspaceSettings;
