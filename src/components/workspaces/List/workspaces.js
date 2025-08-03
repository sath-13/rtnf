import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Modal,
  Typography,
  Input,
  notification,
  Upload,
} from "antd";
import { AiOutlineDelete, AiOutlineUpload } from "react-icons/ai";
import {
  createWorkspace,
  getAllWorkspaces,
  deleteWorkspace,
  checkWorkspaceName,
  getUserWorkspaces,
} from "../../../api/workspaceapi";
import { WorkspaceMessages } from "../../../constants/constants";
// import "./workspaces.css";

import debounce from "lodash/debounce"; //  Debounce API calls
import { toastError, toastSuccess } from "../../../Utility/toast";
import "./ListWorkspace.css";

const { Title } = Typography;

const ListWorkspace = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [workspaceList, setWorkspaceList] = useState([]);
  const [dataLoader, setDataLoader] = useState(false);
  const [workspaceName, setWorkspaceName] = useState("");
  const [logo, setLogo] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [workspaceIdToDelete, setWorkspaceIdToDelete] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [user, setUser] = useState(null);

  const [isDuplicate, setIsDuplicate] = useState(false); //  New state for duplicate check

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);

    if (storedUser?.role === "superadmin") {
      fetchAllWorkspaces();
    } else {
      fetchUserWorkspaces(storedUser?.email);
    }
  }, []);

  const fetchAllWorkspaces = async () => {
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

  const fetchUserWorkspaces = async (email) => {
    try {
      setDataLoader(true);
      const response = await getUserWorkspaces(email);
      setWorkspaceList(response?.data?.workspaces);
    } catch (error) {
      console.error("Error fetching user workspaces", error);
    } finally {
      setDataLoader(false);
    }
  };

  //  Debounced function to check workspace name
  const validateWorkspaceName = debounce(async (name) => {
    if (!name || name.length < 4) {
      setIsDuplicate(false);
      return;
    }

    const exists = await checkWorkspaceName(name);
    setIsDuplicate(exists);
  }, 500); // Waits 500ms before calling API

  const handleCreateWorkspace = async () => {
    if (isDuplicate) {
      // notification.error({
      //   message: WorkspaceMessages.ERR_MSG,
      //   description: WorkspaceMessages.WORSKPACENAME_ALREADY_EXISTS,
      // });
      toastError({
        title: WorkspaceMessages.ERR_MSG,
        description: WorkspaceMessages.WORSKPACENAME_ALREADY_EXISTS,
      });
      return; // Exit early before setting loading
    }

    setIsLoading(true); // Show loading

    try {
      const adminId = user?.id || user?._id;

      // if (isDuplicate) {
      //   return notification.error({
      //     message: WorkspaceMessages.ERR_MSG,
      //     description: WorkspaceMessages.WORSKPACENAME_ALREADY_EXISTS,
      //   });
      // }

      const formData = new FormData();
      formData.append("workspacename", workspaceName);
      formData.append("adminId", adminId);
      if (logo) formData.append("logo", logo);

      await createWorkspace(formData);
      setAddModal(false);
      setWorkspaceName("");
      setLogo(null);
      // notification.success({ message: WorkspaceMessages.SUCC_MSG, description: WorkspaceMessages.WORKSPACE_CREATE_SUCC });
      toastSuccess({
        title: WorkspaceMessages.SUCC_MSG,
        description: WorkspaceMessages.WORKSPACE_CREATE_SUCC,
      });

      fetchAllWorkspaces();
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || WorkspaceMessages.WORKSPACE_CREATE_ERR;
      // notification.error({
      //   message: WorkspaceMessages.ERR_MSG,
      //   description: errorMsg,
      // });
      toastError({ title: WorkspaceMessages.ERR_MSG, description: errorMsg });
    } finally {
      setIsLoading(false); // Stop loading in all cases
    }
  };

  const handleDelete = async () => {
    try {
      await deleteWorkspace(workspaceIdToDelete);
      setDeleteModalVisible(false);
      setWorkspaceList((prevList) =>
        prevList.filter((workspace) => workspace._id !== workspaceIdToDelete)
      );
      // notification.success({
      //   message: WorkspaceMessages.DEL_MSG,
      //   description: WorkspaceMessages.WORKSPACE_DELETE_SUCC,
      // });
      toastSuccess({
        title: WorkspaceMessages.DEL_MSG,
        description: WorkspaceMessages.WORKSPACE_DELETE_SUCC,
      });
    } catch (error) {
      console.error(WorkspaceMessages.WORKSPACE_DELETE_ERR, error);
    }
  };

  const columns = [
    {
      title: "Workspace Name",
      dataIndex: "workspacename",
    },
    {
      title: "Logo",
      dataIndex: "logo",
      responsive: ["xl", "lg", "md"],
      render: (logo) =>
        logo ? (
          <img
            src={logo}
            alt="Workspace Logo"
            className="w-[50px] h-[50px] rounded-full"
          />
        ) : (
          "No Logo"
        ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) => (
        <div className="flex flex-col md:flex-row gap-2 items-center justify-center">
          <Button
            className="custom-button font-inter !mr-2.5"
            onClick={() => {
              localStorage.setItem(
                "enteredWorkspaceName",
                record.workspacename
              ); // Store workspace name
              const url =
                user?.role === "superadmin"
                  ? `/dashboard/workspacename/${record.workspacename}`
                  : `/udashboard/workspacename/${record.workspacename}`;

              navigate(url); // Use React Router navigation instead of window.location.href
            }}
          >
            Enter
          </Button>
          {user?.role === "superadmin" && (
            <Button
              shape="circle"
              danger
              onClick={() => {
                setWorkspaceIdToDelete(record._id);
                setDeleteModalVisible(true);
              }}
            >
              <AiOutlineDelete />
            </Button>
          )}
        </div>
      ),
    },
  ];

  //   .workspace-container {
  //   width: 100%;
  //   max-width: 1000px;
  //   background-color: #fff;
  //   padding: 30px;
  //   border-radius: 10px;
  //   box-shadow: 0px 0px 12px rgba(0, 0, 0, 0.08);
  // }

  return (
    <div className="container mx-auto !py-7">
      <div className="flex flex-col md:flex-row items-center justify-between mb-3">
        <div></div>
        <h1 className="text-[32px] text-primary-text font-rubik font-semibold">
          Workspaces
        </h1>
        {user?.role === "superadmin" && (
          <Button
            size="large"
            className="custom-button font-inter"
            onClick={() => setAddModal(true)}
          >
            + Create Workspace
          </Button>
        )}
      </div>
      <Table
        className="workspace-card-container mt-6"
        loading={dataLoader}
        columns={columns}
        dataSource={workspaceList.map((workspace) => ({
          ...workspace,
          key: workspace._id,
        }))}
        pagination={{ pageSize: 6 }}
        bordered
      />

      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okButtonProps={{ className: "custom-button" }}
      >
        Are you sure you want to delete this workspace?
      </Modal>

      <Modal
        title="Create Workspace"
        open={addModal}
        onOk={handleCreateWorkspace}
        onCancel={() => setAddModal(false)}
        // okButtonProps={{ disabled: !workspaceName }}
        okButtonProps={{
          disabled: !workspaceName || workspaceName.length < 4,
          loading: isLoading,
          className: workspaceName.length >= 4 ? "custom-button" : "",
        }} // Add loading
      >
        <Input
          placeholder="Enter workspace name"
          value={workspaceName}
          // onChange={(e) => setWorkspaceName(e.target.value)}
          onChange={(e) => {
            setWorkspaceName(e.target.value);
            validateWorkspaceName(e.target.value); //  Real-time validation
          }}
        />
        <p className={isDuplicate ? "!text-red-500" : "!text-black"}>
          {workspaceName.length < 4
            ? "Workspace name must be at least 4 characters."
            : isDuplicate
              ? "Workspace name already exists! "
              : "Workspace name is available! "}
        </p>
        {/* <p><i>Minimum length should be 4 characters and Workspace name should be unique.</i></p> */}
        <Upload
          beforeUpload={(file) => {
            setLogo(file);
            return false;
          }}
          maxCount={1}
        >
          <Button icon={<AiOutlineUpload />}>Upload Logo</Button>
        </Upload>
        <p>Only .png and .jpeg images are allowed.</p>
      </Modal>
    </div>
  );
};

export default ListWorkspace;
