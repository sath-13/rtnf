import React, { useState, useEffect, useCallback } from "react";
import {
  Input,
  Select,
  Typography,
  Tabs,
  message,
  notification,
  Button,
  Modal,
  Tooltip,
  DatePicker,
} from "antd";
import { AiOutlineSend } from "react-icons/ai";
import { getUsersByStream, getUsersInWorkspace } from "../../../api/usersapi";
import { getAllStreams } from "../../../api/streamapi";
import { getAllSubStreams } from "../../../api/substreamsapi";
import {
  createAction,
  notifyUser,
  updateAssignedUser,
} from "../../../api/actionapi";
import { useParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import "./ActionDash.css";
import RichTextEditor from "../RightTab/RichTextEditor";
import { fetchActionDetails } from "../../../api/actionapi";
import CommentsSection from "../LeftTab/Comments/CommentsSection";
import InTheLoop from "../LeftTab/InTheLoop";
import HistorySection from "../LeftTab/HistorySection";
import { logHistory } from "../../../api/historyapi";
import {
  ActionMessages,
  CreateActionMessages,
  UserMessages,
} from "../../../constants/constants";
import CustomUpload from "../../uploads/CustomUpload";
// import { UploadOutlined } from '@ant-design/icons';
import moment from "moment";
import { MdOutlineDelete } from "react-icons/md";
import { toast } from "react-toastify";
// import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { deleteComment } from "../../../api/commentapi";
import { addUserToAction } from "../../../api/actionapi";
import { toastError, toastSuccess } from "../../../Utility/toast";

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

const ActionDash = ({
  selectedActionId,
  CreatedBy,
  userAssigned,
  subAssigned,
  isReadOnly,
  loggedInUser,
  onStatusUpdate,
  onDescriptionUpdate,
  setNewActionCreated,
  refreshActions,
  isViewing,
  isFromList,
  isFromNotification,
  isFromCreate,
  disabled,
}) => {
  const { workspacename } = useParams();
  const localWorkspace = JSON.parse(
    localStorage.getItem("user")
  )?.workspaceName;
  const workspaceName =
    workspacename ||
    (Array.isArray(localWorkspace) ? localWorkspace[0] : localWorkspace);

  const user = JSON.parse(localStorage.getItem("user"));
  const CreatedById = user?.id || user?._id || null;
  const role = user?.role || null;
  const CreatedByName = user ? `${user.fname} ${user.lname}`.trim() : null;

  const [selectedUser, setSelectedUser] = useState(CreatedById);
  const [status, setStatus] = useState("Pending"); // Default status
  const [priority, setPriority] = useState("");
  const [description, setDescription] = useState("");
  const statusOptions = ["Pending", "In Progress", "Completed"];
  const priorityOptions = ["Critical", "High", "Medium", "Low", "Trivial"];
  const [actionTitle, setActionTitle] = useState("");
  const [users, setUsers] = useState([]);
  const [streams, setStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState("Personal_Stream");
  const [selectedSubStream, setSelectedSubStream] = useState(null);
  const [selectedStreamOrSub, setSelectedStreamOrSub] =
    useState("Personal_Stream");
  const [loadingStreams, setLoadingStreams] = useState(false);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionData, setActionData] = useState({});
  const [streamSubstreamMap, setStreamSubstreamMap] = useState({});
  const [logHistoryTrigger, setLogHistoryTrigger] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [expectedCompletionDate, setExpectedCompletionDate] = useState(null);
  const [initialComment, setInitialComment] = useState(""); // Store comment from CommentsSection
  const [isUserInLoop, setIsUserInLoop] = useState(false);
  const loggedInUserId =
    JSON.parse(localStorage.getItem("user"))?.id ||
    JSON.parse(localStorage.getItem("user"))?._id ||
    "";

  const [resetKey, setResetKey] = useState(Date.now());

  useEffect(() => {
    const getActionDetails = async () => {
      try {
        const data = await fetchActionDetails(selectedActionId);
        setActionData(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching action details:", error);
        setLoading(false);
      }
    };

    if (selectedActionId) {
      getActionDetails();
    }
  }, [selectedActionId]);

  useEffect(() => {
    if (actionData) {
      // Prefill data if editing an existing action
      setActionTitle(actionData.actionTitle || "");
      setSelectedUser(actionData.userAssigned || "");
      setSelectedStream(actionData.stream || "");
      setSelectedSubStream(actionData.subStreams?.[0] || "");
      setNotes(actionData.description || "");
      setStatus(actionData.status || "Pending");
      setPriority(actionData.priority);
      setExpectedCompletionDate(actionData.expectedCompletionDate);

      // Setting selectedStreamOrSub to display in the dropdown
      if (actionData.subStreams?.[0]) {
        setSelectedStreamOrSub(actionData.subStreams[0]);
      } else if (actionData.stream) {
        setSelectedStreamOrSub(actionData.stream);
      }
    } else {
      setStatus("Pending");
    }
  }, [actionData, loggedInUser]);

  useEffect(() => { }, [selectedActionId, actionData]);

  const fetchUsers = useCallback(
    async (
      fetchAllWorkspaceUsers = false,
      selectedStream = null,
      fetchUnassignedUsers = false
    ) => {
      if (!workspaceName) {
        // message.error('Workspace name not found');
        toastError({ title: "Error", description: "Workspace name not found" });
        return;
      }

      try {
        let usersData = [];

        if (fetchAllWorkspaceUsers) {
          usersData = await getUsersInWorkspace(workspaceName);
        } else if (fetchUnassignedUsers) {
          usersData = await getUsersByStream("unassigned_users", workspaceName);
        } else if (selectedStream) {
          usersData = await getUsersByStream(selectedStream, workspaceName);
        }

        const userList = Array.isArray(usersData) ? usersData : [];
        setUsers(userList);

        // Auto-select logged-in user if present in the list
        // if (!userList.some(user => user._id === selectedUser) && userList.length > 0) {
        //   setSelectedUser(userList[0]._id);
        // }

        // Auto-select logged-in user if present in the list
        if (userList.length > 0) {
          const loggedInUserInList = userList.find(
            (user) => user._id === CreatedById
          );
          if (loggedInUserInList) {
            setSelectedUser(loggedInUserInList._id);
          } else {
            setSelectedUser(userList[0]._id); // Fallback to first user if logged-in user isn't found
          }
        }
      } catch (error) {
        // notification.error({ message: "Error fetching users", description: error.message });
        toastError({
          title: "Error fetching users",
          description: error.message,
        });
      }
    },
    [workspaceName, CreatedById]
  );

  useEffect(() => {
    setSelectedStreamOrSub("Personal_Stream"); // Default selection
    fetchUsers(true); // Fetch all users in the workspace by default
  }, [workspaceName, fetchUsers]);

  useEffect(() => { }, [isFromNotification, isFromList]);

  useEffect(() => {
    if (actionData?.subAssigned) {
      setIsUserInLoop(actionData.subAssigned.includes(loggedInUserId));
    }
  }, [actionData, loggedInUserId]);

  useEffect(() => {
    const fetchStreams = async () => {
      setLoadingStreams(true);
      try {
        const streamsResponse = await getAllStreams(workspaceName);
        const streamsData = streamsResponse?.data || [];

        let streamMap = {};
        for (const stream of streamsData) {
          // const substreamsResponse = await getAllSubStreams(stream.streamTitle);
          const substreamsResponse = await getAllSubStreams(
            stream.streamTitle,
            workspaceName
          );
          streamMap[stream.streamTitle] =
            substreamsResponse?.data?.map((s) => s.subStreamTitle) || [];
        }
        setStreams(streamsData);
        setStreamSubstreamMap(streamMap);
      } catch (error) {
        console.error("Error fetching streams and substreams:", error);
      } finally {
        setLoadingStreams(false);
      }
    };
    fetchStreams();
  }, [workspaceName]);

  const handleCommentChange = (commentText) => {
    setInitialComment(commentText);
  };

  const resetFormFields = () => {
    setActionTitle("");
    setNotes("");
    setSelectedStream(undefined);
    setSelectedSubStream(undefined);
    setPriority(undefined);
    setStatus("Pending");
    setExpectedCompletionDate(null);
    setInitialComment("");
    setResetKey(Date.now());
    setSelectedFiles([]);
  };

  const handleCreateAction = async () => {
    // if (!actionTitle || !notes || !workspaceName || !selectedUser ||!priority ||!expectedCompletionDate) {
    //     message.error(UserMessages.PROVIDE_ALL_FIELDS);
    //     return;
    // }

    //1.ActionTitle
    if (!actionTitle) {
      // message.error(CreateActionMessages.ACTION_TITLE_REQ);
      toastError({
        title: "Error",
        description: CreateActionMessages.ACTION_TITLE_REQ,
      });
      return;
    }

    //2. Description Notes
    if (!notes) {
      // message.error(CreateActionMessages.NOTES_REQ);
      toastError({
        title: "Error",
        description: CreateActionMessages.NOTES_REQ,
      });
      return;
    }

    //3.workspaceName
    if (!workspaceName) {
      // message.error(CreateActionMessages.WORKSPACENAME_REQ);
      toastError({
        title: "Error",
        description: CreateActionMessages.WORKSPACENAME_REQ,
      });
      return;
    }

    //4.selectedUser
    if (!selectedUser) {
      // message.error(CreateActionMessages.SELECTEDUSER_REQ);
      toastError({
        title: "Error",
        description: CreateActionMessages.SELECTEDUSER_REQ,
      });
      return;
    }

    //5.priority
    if (!priority) {
      // message.error(CreateActionMessages.PRIORITY_REQ);
      toastError({
        title: "Error",
        description: CreateActionMessages.PRIORITY_REQ,
      });
      return;
    }

    //6.expectedCompletionDate
    if (!expectedCompletionDate) {
      // message.error(CreateActionMessages.EXPECTED_COMPLETION_DATE_REQ);
      toastError({
        title: "Error",
        description: CreateActionMessages.EXPECTED_COMPLETION_DATE_REQ,
      });
      return;
    }

    setLoading(true);
    try {
      let subStreams = selectedSubStream
        ? [selectedSubStream]
        : streamSubstreamMap[selectedStream] || [];
      const userAssignedData = users.find((user) => user._id === selectedUser);
      const userAssignedName = userAssignedData
        ? `${userAssignedData.fname || userAssignedData.name} ${userAssignedData.lname || " "
        }`
        : "";

      // **Get the Logged-in User's Role (Assuming it's available in state or context)**
      const userRole = role; // Fetch from state or context

      let resolvedStream =
        selectedStream ||
        (selectedStreamOrSub === "Personal_Stream" ? "Personal_Stream" : null);

      if (!resolvedStream) {
        // message.error("Please select a valid stream.");
        toastError({
          title: "Error",
          description: "Please select a valid stream.",
        });
        setLoading(false);
        return;
      }

      // Convert Data to FormData
      const formData = new FormData();
      formData.append("actionTitle", actionTitle);
      formData.append("description", notes);
      formData.append("userAssigned", selectedUser);
      formData.append("userAssignedName", userAssignedName);
      formData.append("workspaceName", workspaceName);
      formData.append("CreatedBy", CreatedById);
      formData.append("CreatedByName", CreatedByName);
      formData.append("CreatedByRole", userRole); // **🔹 Pass User Role**
      // formData.append("stream", selectedStream || "");
      formData.append("stream", resolvedStream);
      formData.append("status", status);
      formData.append("priority", priority);
      formData.append("expectedCompletionDate", expectedCompletionDate);
      // formData.append("initialComment", notes);  // **🔹 Save initial comment as description**
      formData.append("initialComment", initialComment); // 🔹 Comment from comment section

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      const response = await createAction(formData);

      if (response?.data?.action?._id) {
        await notifyUser(response.data.action._id, {
          workspaceName,
          stream: selectedStream,
          subStreams,
        });
      }

      setNewActionCreated((prev) => !prev);
      // message.success(ActionMessages.ACTION_CREATE_SUCCESS);
      toastSuccess({
        title: "Success",
        description: ActionMessages.ACTION_CREATE_SUCCESS,
      });

      resetFormFields();
    } catch (error) {
      console.error(ActionMessages.ACTION_CREATE_ERR, error);
      // notification.error({ message: ActionMessages.ACTION_CREATE_ERR, description: error.message });
      toastError({
        title: "Error",
        description: ActionMessages.ACTION_CREATE_ERR,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    // if (!isAssignedUser) {
    //   message.error(ActionMessages.AUTHORIZED_ERR);
    //   return;
    // }

    const changes = [
      { field: "status", oldValue: status, newValue: newStatus },
    ];
    setStatus(newStatus);

    if (onStatusUpdate) {
      onStatusUpdate(actionData._id, newStatus);
    }

    try {
      await logHistory({
        actionId: actionData._id,
        modifiedBy: CreatedById,
        role: role,
        modifiedByName: CreatedByName,
        changes,
      });

      setLogHistoryTrigger((prev) => !prev);
    } catch (error) {
      console.error("Error logging history:", error);
    }
  };

  const handleTextChange = async (newDescription) => {
    if (!actionData._id) {
      return;
    }
    // if (!isAssignedUser) {
    //   message.error(ActionMessages.AUTHORIZED_ERR);
    //   return;
    // }

    const changes = [
      { field: "description", oldValue: description, newValue: newDescription },
    ];
    setDescription(newDescription);

    if (onDescriptionUpdate) {
      onDescriptionUpdate(actionData._id, newDescription);
    }

    try {
      await logHistory({
        actionId: actionData._id,
        modifiedBy: CreatedById,
        role: role,
        modifiedByName: CreatedByName,
        changes,
      });

      setLogHistoryTrigger((prev) => !prev);
    } catch (error) {
      console.error("Error logging history:", error);
    }
  };

  const handleFilesSelected = (files) => {
    setSelectedFiles(files);
  };

  const handleUserAssign = async (newUserId) => {
    setSelectedUser(newUserId); // Update local state
  };

  const handleUserReassign = async (newUserId) => {
    setSelectedUser(newUserId); // Update local state

    if (!actionData?._id) {
      console.error("Cannot update assigned user: Missing action ID!");
      return;
    }

    if (!newUserId) {
      console.error("No user selected for reassignment!");
      return;
    }

    try {
      //  Reassign user
      await updateAssignedUser(actionData._id, newUserId);
      // message.success("User reassigned successfully!");
      toastSuccess({
        title: "Success",
        description: "User reassigned successfully!",
      });

      await addUserToAction(actionData._id, newUserId);
      triggerLoopRefresh();

      if (refreshActions) {
        refreshActions();
      }
    } catch (error) {
      // message.error("Failed to reassign user.");
      toastError({ title: "Error", description: "Failed to reassign user." });
      console.error(error);
    }
  };

  const [loopRefreshFlag, setLoopRefreshFlag] = useState(false);

  const triggerLoopRefresh = () => {
    setLoopRefreshFlag((prev) => !prev); //
  };

  const handleUserSelection = (newUserId) => {
    if (!actionData?._id || !selectedUser) {
      handleUserAssign(newUserId);
    } else {
      Modal.confirm({
        title: "Confirm Reassignment",
        content: "Are you sure you want to reassign this user?",
        okText: "Yes",
        cancelText: "No",
        onOk: () => handleUserReassign(newUserId),
      });
    }
  };

  const formatDate = (timestamp) => {
    const dateObj = new Date(timestamp);
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = String(dateObj.getFullYear()).slice(2);
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };
  const [comments, setComments] = useState([]);

  const handleDeleteComment = (commentId) => {
    toast.info(
      ({ closeToast }) => (
        <div>
          <p>
            <strong>Are you sure you want to delete this comment?</strong>
          </p>
          <div
            className="flex justify-end gap-[10px] mt-[10px]"
          >
            <button
              onClick={() => {
                confirmDeleteComment(commentId);
                closeToast();
              }}
              className="bg-red-500 text-white border-0 px-[10px] py-[5px] rounded cursor-pointer"
            >
              Yes
            </button>
            <button
              onClick={closeToast}
              className="bg-gray-500 text-white border-0 px-[10px] py-[5px] rounded cursor-pointer"
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
      }
    );
  };

  const confirmDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      const updatedComments = comments.filter(
        (comment) => comment._id !== commentId
      );
      setComments(updatedComments);
      // toast.success("Comment deleted successfully.");
      toastSuccess({
        title: "Success",
        description: "Comment deleted successfully.",
      });
    } catch (error) {
      // toast.error("Failed to delete comment. Please try again.");
      toastError({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
      });
      console.error("Delete comment error:", error);
    }
  };

  return (
    <div className="!py-0 lg:!py-5 mt-[18px] lg:mt-0 mb-5 lg:mb-0 !px-0">
      <div className="action-dash-container border border-border-color rounded-lg" bodyStyle={{ height: "100%" }}>
        <div className="mb-0 lg:mb-5">
          <h4 className="text-base md:text-xl font-rubik font-semibold text-primary-text ">
            {isFromCreate
              ? "Describe the deliverable, action, or result"
              : actionTitle}
          </h4>

          <div className="flex flex-col md:flex-row items-center gap-2 mb-4">
            {/* Action Title - Sirf Create Mode me Editable */}
            {isFromCreate && (
              <Tooltip title="Enter action title...">
                <Input
                  placeholder="Enter action title..."
                  value={actionTitle}
                  onChange={(e) => setActionTitle(e.target.value)}
                />
              </Tooltip>
            )}

            {/* Priority Dropdown - Sirf Create Mode me Editable */}
            <Tooltip title="Priority">
              <Select
                value={priority || undefined}
                placeholder="Select Priority"
                onChange={(value) => setPriority(value)}
                disabled={!isFromCreate}
              >
                {priorityOptions.map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </Tooltip>

            {/* Status Dropdown - Sirf List View me Editable */}
            <Tooltip title="Status">
              <Select
                value={status}
                onChange={handleStatusChange}
                disabled={!isFromList}
              >
                {statusOptions.map((option) => (
                  <Select.Option key={option} value={option}>
                    {option}
                  </Select.Option>
                ))}
              </Select>
            </Tooltip>

            {/* Expected Completion Date - Sirf Create Mode me Editable */}
            <Tooltip title="Expected Date">
              <DatePicker
                className="!w-full"
                placeholder="Select Expected Date"
                value={
                  expectedCompletionDate ? moment(expectedCompletionDate) : null
                }
                onChange={(date, dateString) =>
                  setExpectedCompletionDate(dateString)
                }
                disabled={!isFromCreate}
              />
            </Tooltip>
          </div>
        </div>
        {/* 
        .dropdown-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
} */}

        <div
          className="flex flex-wrap gap-2 !mb-5 lg:!mb-[15px]"
        >
          {/* Assigned User - Sirf List View me Editable */}
          <Tooltip title="Users">
            <Select
              showSearch
              placeholder="Select User"
              className="!flex-1 !w-1/2"
              value={selectedUser || undefined}
              disabled={!(isFromCreate || isFromList)}
              onChange={handleUserSelection}
              filterOption={(input, option) =>
                String(option?.children)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {users.map((user) => (
                <Option key={user._id} value={user._id}>
                  {user.fname} {user.lname || ""}
                </Option>
              ))}
            </Select>
          </Tooltip>

          {/* Stream - SubStream Selection - Sirf Create Mode me Editable */}
          <Tooltip title="Streams">
            <Select
              placeholder="Select Stream"
              value={selectedStreamOrSub}
              onChange={(value) => {
                setSelectedStreamOrSub(value);
                if (value === "Personal_Stream") {
                  setSelectedStream("Personal_Stream");
                  setSelectedSubStream(null);
                  fetchUsers(true); // Fetch all users in the workspace
                } else if (value === "unassigned_users") {
                  setSelectedStream(null);
                  setSelectedSubStream(null);
                  fetchUsers(false, null, true); // Fetch only unassigned users
                } else if (
                  streams.some((stream) => stream.streamTitle === value)
                ) {
                  setSelectedStream(value);
                  setSelectedSubStream(null);
                  fetchUsers(false, value); // Fetch only stream users
                } else {
                  setSelectedSubStream(value);
                  const parentStream = Object.keys(streamSubstreamMap).find(
                    (key) => streamSubstreamMap[key].includes(value)
                  );
                  setSelectedStream(parentStream || null);
                  fetchUsers(false, parentStream); // Fetch users based on sub-stream
                }
              }}
              loading={loadingStreams}
              className="!w-1/2"
              disabled={!(isFromCreate || isFromList)}
            >
              {streams.map((stream) => (
                <React.Fragment key={stream._id}>
                  <Option
                    value={stream.streamTitle}
                    className="!font-bold"
                  >
                    {stream.streamTitle}
                  </Option>
                  {streamSubstreamMap[stream.streamTitle]?.map((substream) => (
                    <Option
                      key={substream}
                      value={substream}
                      className="!pl-10"
                    >
                      {substream}
                    </Option>
                  ))}
                </React.Fragment>
              ))}
            </Select>
          </Tooltip>
        </div>

        {/* .content-section {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  min-height: 300px;
  align-items: stretch;
  flex-grow: 1;
} */}

        {/* Notes & Files Section */}
        <div className="flex flex-col md:flex-row flex-wrap gap-5 mb-5 min-h-[300px] items-stretch flex-1">
          <div className="rich-text-editor">
            <Tabs defaultActiveKey="1">
              {/* Notes - Sirf List View me Editable */}
              <TabPane tab="Notes" key="1">
                <RichTextEditor
                  value={notes}
                  onChange={(value) => setNotes(value)}
                  style={{ marginBottom: 20, height: 240 }}
                  disabled={!(isFromCreate || isFromList)}
                />
              </TabPane>

              {/* Upload/See Files - List View & Notification View dono me Editable */}
              <TabPane tab={isViewing ? "See Files" : "Upload Files"} key="2">
                <CustomUpload
                  onFilesSelected={handleFilesSelected}
                  actionId={selectedActionId}
                  isViewing={isViewing}
                  disabled={
                    !(
                      isFromCreate ||
                      isFromList ||
                      (isFromNotification && isUserInLoop)
                    )
                  }
                />
              </TabPane>
            </Tabs>

            {/* Save/Create Button */}
            <div className="action-button-section">
              <Button
                className="custom-button mx-2 lg:mx-0 !w-[200px]"
                type="primary"
                icon={<AiOutlineSend />}
                onClick={() => {
                  if (isFromList) {
                    handleTextChange(notes); // Save in List View
                  } else {
                    handleCreateAction(); // Create in ActionDash
                  }
                }}
                loading={loading}
              >
                {isFromList ? "Save" : "Create Action"}
              </Button>
            </div>
          </div>

          {/* Comments, History, and In The Loop */}
          <div className="comment-section">
            <Tabs defaultActiveKey="1">
              {/* Comments - List View & Notification View me Editable */}
              <TabPane tab="Comments" key="1">
                <CommentsSection
                  key={resetKey}
                  actionId={selectedActionId}
                  workspaceName={workspaceName}
                  loggedInUser={CreatedById}
                  loggedInUserName={CreatedByName}
                  userRole={role}
                  disabled={
                    !(
                      isFromCreate ||
                      isFromList ||
                      (isFromNotification && isUserInLoop)
                    )
                  }
                  onCommentChange={handleCommentChange}
                />
              </TabPane>
              <div className="replies-list">
                {comments.replies?.map((reply) => (
                  <div key={reply._id} className="reply-item">
                    <div className="comment-header">
                      <p className="reply-text">
                        <b>{reply.createdByName}:</b>
                        <br />
                        {reply.description}
                      </p>
                      <div
                        className="comment-footer flex justify-between items-center mt-2"
                      >
                        <span className="comment-time">
                          {formatDate(reply.createdAt)}
                        </span>
                        <button
                          className="delete-button ml-auto"
                          onClick={() => handleDeleteComment(reply._id)}
                          disabled={disabled}
                        >
                          <MdOutlineDelete />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* /* History - Always Read-Only */}
              {
                <TabPane tab="History" key="2">
                  <HistorySection
                    actionId={selectedActionId}
                    logHistory={logHistoryTrigger}
                    disabled={true} // Always Read-Only
                  />
                </TabPane>
              }

              {/* In The Loop - Sirf List View me Editable */}
              <TabPane tab="In the Loop" key="3">
                <InTheLoop
                  selectedActionId={selectedActionId}
                  disabled={!isFromList}
                  loopRefreshFlag={loopRefreshFlag}
                />
              </TabPane>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionDash;
