import React, { useState, useEffect } from "react";
import { Input, Select, Button, message } from "antd";
import { useParams } from "react-router-dom";
import { submitFeedback } from "../../../../api/feedbackapi"; // adjust path if needed
import "./FeedBackModal.css";
import { toastError, toastSuccess, toastWarning } from "../../../../Utility/toast";


const DirectFeedbackModal = ({ selectedUser, onClose }) => {
  const [userInput, setUserInput] = useState("");
  const [feedbackType, setFeedbackType] = useState("direct");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUser = user?.id || user?._id;
  const { workspacename } = useParams();

  useEffect(() => {
    setUserInput("");
  }, [selectedUser]);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      // message.warning("Feedback description cannot be empty.");
      toastWarning({ title: "Warning", description: "Feedback description cannot be empty." });
      return;
    }

    const feedbackData = {
      userId: selectedUser._id,
      givenBy: currentUser,
      description: userInput,
      feedbackType,
      workspacename,
    };

    try {
      setLoading(true);
      await submitFeedback(feedbackData);
      // message.success("Feedback submitted successfully.");
      toastSuccess({ title: "Success", description: "Feedback submitted successfully." });
      setUserInput("");
      onClose();
    } catch (error) {
      // message.error("Failed to submit feedback.");
      toastError({ title: "Error", description: "Failed to submit feedback." });
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-modal">
      <Input.TextArea
        rows={6}
        placeholder="Write your feedback here..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="feedback-textarea"
      />

      <Select
        value={feedbackType}
        onChange={setFeedbackType}
        className="feedback-select !w-full !mt-2.5"
      >
        <Select.Option value="anonymous">Anonymous</Select.Option>
        <Select.Option value="direct">Direct</Select.Option>
      </Select>

      <div className="feedback-action-buttons">
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          className="feedback-submit-btn custom-button"
        >
          Submit Feedback
        </Button>
      </div>
    </div>
  );
};

export default DirectFeedbackModal;
