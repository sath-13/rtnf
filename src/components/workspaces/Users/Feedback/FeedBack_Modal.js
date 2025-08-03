import React, { useState } from "react";
import { Input, Select, Button } from "antd";
import { useParams } from "react-router-dom";
const FeedbackModal = ({ onClose, onSubmit, selectedUser, hideFeedbackType }) => {
  const [description, setDescription] = useState("");
  const [feedbackType, setFeedbackType] = useState("direct");
  const user = JSON.parse(localStorage.getItem("user"));
  const currentUser = user?.id || user?._id;
  const { workspacename } = useParams();
  const currentUserModel = user?.role === "admin" ? "Admin" : "User"; // Identify role
  const handleSubmit = () => {
    if (!description.trim()) {
      alert("Feedback description cannot be empty.");
      return;
    }
    const feedbackData = {
      userId: selectedUser._id, // Recipient
      userModel: selectedUser.role === "admin" ? "Admin" : "User", // Identify recipient type
      givenBy: currentUser,
      givenByModel: currentUserModel,
      description,
      feedbackType,
      workspacename,
    };
    onSubmit(feedbackData); // Send feedback
    setDescription(""); // Clear input
    onClose();
  };
  return (
    <div  >
      {/* <p>Giving feedback for: <strong>{selectedUser.username}</strong></p> */}
      <Input.TextArea
        rows={4}
        placeholder="Write your feedback here..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {/* Conditionally render the feedback type dropdown */}
      {!hideFeedbackType && (
        <Select
          value={feedbackType}
          onChange={setFeedbackType}
          className="!w-full !mt-2.5"
        >
          <Select.Option value="anonymous">Anonymous</Select.Option>
          <Select.Option value="direct">Direct</Select.Option>
        </Select>
      )}

      <Button type="primary" onClick={handleSubmit} className="!mt-2.5">
        Submit Feedback
      </Button>
    </div>
  );
};
export default FeedbackModal;