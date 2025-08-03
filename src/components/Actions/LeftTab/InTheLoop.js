import React, { useState, useEffect, useCallback } from "react";
import { Select, Button, message } from "antd";
import { getUsersInWorkspace } from "../../../api/usersapi";
import {
  getActionDetails,
  addUserToAction,
  getUsernamesByIds,
  removeUserFromAction,
} from "../../../api/actionapi";
import { useParams } from "react-router-dom";
import { AiOutlineDelete } from "react-icons/ai";
import { logHistory } from "../../../api/historyapi";
import { UserMessages } from "../../../constants/constants";
import { toastError, toastSuccess } from "../../../Utility/toast";

const { Option } = Select;

const InTheLoop = ({ selectedActionId, disabled, loopRefreshFlag }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [subAssignedUsers, setSubAssignedUsers] = useState([]);

  const { workspacename } = useParams();
  const localWorkspace = JSON.parse(localStorage.getItem("user"))?.workspaceName;
  const workspaceName = workspacename || (Array.isArray(localWorkspace) ? localWorkspace[0] : localWorkspace);

  const loggedUserData = JSON.parse(localStorage.getItem("user")) || {};
  const loggedUser = loggedUserData.id || loggedUserData._id;
  const loggedUserName = `${loggedUserData.fname || ""} ${loggedUserData.lname || ""}`.trim();
  const role = loggedUserData.role;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsersInWorkspace(workspaceName);
        const userNames = usersData.map((user) => ({
          _id: user._id,
          name: `${user.fname} ${user.lname || ""}`.trim(),
        }));
        setUsers(userNames);
      } catch (error) {
        console.error("Error fetching users:", error);
        // message.error(UserMessages.USER_FETCH_FAIL);
        toastError({ title: "Error", description: UserMessages.USER_FETCH_FAIL });
      }
    };
    fetchUsers();
  }, [workspaceName]);

  const handleFetchSubAssignedUsers = useCallback(async () => {
    if (!selectedActionId) return;
    try {
      const actionData = await getActionDetails(selectedActionId);
      if (actionData.data.subAssigned) {
        const subAssignedIds = actionData.data.subAssigned;
        const userMap = await getUsernamesByIds(subAssignedIds);
        const subAssignedObjects = subAssignedIds.map((id) => ({
          _id: id,
          name: userMap[id] || "Unknown User",
        }));
        setSubAssignedUsers(subAssignedObjects);
      } else {
        setSubAssignedUsers([]);
      }
    } catch (error) {
      console.error("Error fetching subAssigned users:", error);
      // message.error(UserMessages.SUBASSIGNED_USER_FETCH_ERR);
      toastError({ title: "Error", description: UserMessages.SUBASSIGNED_USER_FETCH_ERR });
    }
  }, [selectedActionId]);

  useEffect(() => {
    handleFetchSubAssignedUsers();
  }, [handleFetchSubAssignedUsers]);

  const handleRemoveFromLoop = async (userId) => {
    try {
      await removeUserFromAction(selectedActionId, userId);
      const updated = subAssignedUsers.filter((user) => user._id !== userId);
      setSubAssignedUsers(updated);
      // message.success(UserMessages.USER_REMOVE_SUCC);
      toastSuccess({ title: "Success", description: UserMessages.USER_REMOVE_SUCC });

      const changes = [{
        field: "subAssigned",
        oldValue: subAssignedUsers.map((u) => u._id),
        newValue: updated.map((u) => u._id),
      }];

      await logHistory({
        actionId: selectedActionId,
        modifiedBy: loggedUser,
        modifiedByName: loggedUserName,
        changes,
        role,
      });
    } catch (error) {
      // message.error(UserMessages.USER_REMOVE_ERR);
      toastSuccess({ title: "Error", description: UserMessages.USER_REMOVE_ERR });
      console.error(error);
    }
  };

  const handleAddToLoop = async () => {
    if (selectedUser && !subAssignedUsers.some((user) => user._id === selectedUser._id)) {
      try {
        await addUserToAction(selectedActionId, selectedUser._id);
        const newSubAssigned = [...subAssignedUsers, selectedUser];
        setSubAssignedUsers(newSubAssigned);
        setSelectedUser(null);
        // message.success(UserMessages.USER_ADD_SUCC);
        toastSuccess({ title: "Success", description: UserMessages.USER_ADD_SUCC });

        const changes = [{
          field: "subAssigned",
          oldValue: subAssignedUsers.map((u) => u._id),
          newValue: newSubAssigned.map((u) => u._id),
        }];

        await logHistory({
          actionId: selectedActionId,
          modifiedBy: loggedUser,
          modifiedByName: loggedUserName,
          changes,
          role,
        });
      } catch (error) {
        // message.error(UserMessages.USER_ADD_ERR);
        toastSuccess({ title: "Error", description: UserMessages.USER_ADD_ERR });
        console.error(error);
      }
    } else {
      // message.error(UserMessages.USER_ERR);
      toastError({ title: "Error", description: UserMessages.USER_ERR });
    }
  };

  useEffect(() => {
    handleFetchSubAssignedUsers(); // already defined in InTheLoop
  }, [loopRefreshFlag]);

  return (
    <div className="p-[10px] border border-gray-300 rounded-[5px] mb-[10px]">
      <h3>Users in Loop</h3>

      <div className="max-h-[200px] overflow-y-auto mb-[10px]">
        {subAssignedUsers.map((user) => (
          <div key={user._id} className="flex items-center my-[5px]">
            <p className="flex-1 m-0">{user.name}</p>
            <Button
              type="link"
              size="small"
              disabled={disabled}
              onClick={() => handleRemoveFromLoop(user._id)}
              icon={<AiOutlineDelete />}
            />
          </div>
        ))}
      </div>

      <Select
        placeholder="Select user"
        disabled={disabled}
        showSearch
        value={selectedUser ? selectedUser._id : undefined}
        onChange={(value) => setSelectedUser(users.find((user) => user._id === value))}
        filterOption={(input, option) =>
          (option?.children || "").toLowerCase().includes(input.toLowerCase())
        }
        className="!w-full !mb-[10px]"
      >
        {users.map((user) => (
          <Option key={user._id} value={user._id}>
            {user.name}
          </Option>
        ))}
      </Select>

      <Button disabled={disabled} type="primary" onClick={handleAddToLoop} className="!w-full">
        Add to Loop
      </Button>
    </div>
  );
};

export default InTheLoop;
