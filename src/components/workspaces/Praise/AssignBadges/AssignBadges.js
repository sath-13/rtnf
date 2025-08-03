import React, { useState, useEffect, useCallback } from "react";
import { Select, Input, Button, message, Typography } from "antd";
import { getBadgesAPI, assignBadge } from "../../../../api/Badgeapi";
import { VISIBILITY_OPTIONS } from "../../../../constants/enums";
import { useParams } from "react-router-dom";
import { toastError, toastSuccess } from "../../../../Utility/toast";

const { Option } = Select;
const { Text } = Typography;

const AssignBadges = ({ selectedUser, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [badges, setBadges] = useState([]);
  const [selectedBadge, setSelectedBadge] = useState(null);
  const { workspacename } = useParams();
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState(VISIBILITY_OPTIONS[0].value);
  const [loggedInUser, setLoggedInUser] = useState(null);



  const fetchData = useCallback(async () => {
    try {
      const badgesData = await getBadgesAPI(workspacename);
      setBadges(badgesData || []);
    } catch (error) {
      // message.error("Error fetching badges");
      toastError({ title: "Error", description: "Error fetching badges" });
    }
  }, [workspacename]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setLoggedInUser(user);
    fetchData();
  }, [fetchData]);

  const handleAssignBadge = async () => {
    setLoading(true);
    if (!selectedUser || !selectedBadge) {
      // message.error("Please select a badge.");
      toastError({ title: "Error", description: "Please select a badge." });
      return;
    }
    if (!loggedInUser || !(loggedInUser.id || loggedInUser._id)) {
      // message.error("User not logged in.");
      toastError({ title: "Error", description: "User not logged in." });
      return;
    }


    let assignedTeam = "No Team";
    if (visibility === "in_team") {
      assignedTeam =
        loggedInUser.role === "superadmin"
          ? selectedUser?.teamTitle[0] || "No Team"
          : loggedInUser?.teamTitle[0] || "No Team";
    }

    try {
      const requestData = {
        badge: selectedBadge,
        assigned_by: loggedInUser.id || loggedInUser._id,
        assigned_to: selectedUser._id,
        team: assignedTeam,
        description,
        workspacename,
        visibility,
      };

      const response = await assignBadge(requestData);
      if (!response || response.error) {
        throw new Error(response?.error || "Unknown error occurred");
      }

      // message.success("Badge assigned successfully!");
      toastSuccess({ title: "Success", description: "Badge assigned successfully!" });
      setSelectedBadge(null);
      setDescription("");
      setVisibility(VISIBILITY_OPTIONS[0].value);
      onClose();
    } catch (error) {
      // message.error("Failed to assign badge");
      toastError({ title: "Error", description: "Failed to assign badge" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5">
      <Text strong>User:</Text>
      <Input
        value={`${selectedUser?.fname} ${selectedUser?.lname}`}
        disabled
        className="!w-full !mb-4"
      />

      <Text strong>Select Badge:</Text>
      <Select
        placeholder="Select Badge"
        value={selectedBadge || undefined}
        onChange={setSelectedBadge}
        className="!w-full !mb-4"
      >
        {badges.length > 0 ? (
          badges.map((badge) => (
            <Option key={badge._id} value={badge._id}>
              {badge.name}
            </Option>
          ))
        ) : (
          <Option disabled>No badges available</Option>
        )}
      </Select>

      <Text strong>Description:</Text>
      <Input.TextArea
        placeholder="Enter description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="!mb-4"
      />

      <Text strong>Select Visibility:</Text>
      <Select
        placeholder="Select Visibility"
        value={visibility}
        onChange={setVisibility}
        className="!w-full !mb-4"
      >
        {VISIBILITY_OPTIONS.map((option) => (
          <Option key={option.value} value={option.value}>
            {option.label === "In Team"
              ? `${loggedInUser?.role === "superadmin"
                ? selectedUser?.teamTitle[0] || "No Team"
                : loggedInUser?.teamTitle[0] || "No Team"
              }`
              : option.label}
          </Option>
        ))}
      </Select>

      <Button className="custom-button" type="primary" loading={loading} onClick={handleAssignBadge} block>
        Assign Badge
      </Button>
    </div>
  );
};

export default AssignBadges;
