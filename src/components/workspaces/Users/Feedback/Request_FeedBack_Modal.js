import React, { useState, useEffect } from "react";
import { Input, Button, notification } from "antd";
import { useParams } from "react-router-dom";
import { declineFeedbackRequest, submitRequestedFeedback } from "../../../../api/feedbackapi";
import "./FeedBackModal.css";
import { toastError, toastSuccess } from "../../../../Utility/toast";

const FeedbackModal = ({
  onClose,
  onSubmit,
  selectedUser,
  requesterId,
  isSelfFeedback,
  onDeclineSuccess,
}) => {
  const [predefinedMessage, setPredefinedMessage] = useState("");
  const [userInput, setUserInput] = useState("");
  const [isDeclining, setIsDeclining] = useState(false);

  const forSelf = `I’d really appreciate your feedback on my performance so far—what’s working well and any areas where I can improve. Your insights will help me continue contributing effectively to the team. Looking forward to your thoughts!`;

  const bySuperAdmin = `Hello! Requesting you to share feedback for ${selectedUser.fname} ${selectedUser.lname} so that we can evaluate and measure their progress. To assist you, you may consider aspects like productivity (quality of work, adherence to deadlines), communication (teamwork, accountability, leadership skills, office behavior), company culture, self-improvement, skill building, and areas of improvement.`;

  const user = JSON.parse(localStorage.getItem("user"));
  const currentUser = user?.id || user?._id;
  const { workspacename } = useParams();
  const fullName = `${user?.fname || ""} ${user?.lname || ""}`.trim();

  useEffect(() => {
    const message = isSelfFeedback ? forSelf : bySuperAdmin;
    setPredefinedMessage(message);
    setUserInput("");
  }, [isSelfFeedback, selectedUser]);

  const handleSubmit = async () => {
    if (!userInput.trim()) {
      alert(isDeclining ? "Please provide a reason to decline." : "Feedback description cannot be empty.");
      return;
    }

    if (isDeclining) {
      try {
        await declineFeedbackRequest(selectedUser.requestId, {
          reason: userInput,
          declinedBy: fullName,
        });

        // notification.success({
        //   message: "Request Declined",
        //   description: "Feedback request declined successfully.",
        // });
        toastSuccess({ title: "Request Declined", description: "Feedback request declined successfully." });

        // ✅ Notify parent to update list
        onDeclineSuccess && onDeclineSuccess(selectedUser.requestId);

        onClose();

      } catch (error) {
        console.error("Decline error:", error);
        // notification.error({
        //   message: "Decline Failed",
        //   description: "Failed to decline feedback request.",
        // });
        toastError({ title: "Decline Failed", description: "Failed to decline feedback request." });
      }
      return;
    }



    const feedbackData = {
      revieweeId: selectedUser._id,
      reviewerId: currentUser,
      requesterId: requesterId,
      description: userInput,
      feedbackType: "request",
      workspacename,
    };

    try {
      await submitRequestedFeedback(feedbackData);
      // notification.success({
      //   message: "Feedback Submitted",
      //   description: "Your feedback has been submitted successfully.",
      // });
      toastSuccess({ title: "Feedback Submitted", description: "Your feedback has been submitted successfully." });

      onSubmit && onSubmit(selectedUser.requestId);

      setUserInput("");
      onClose();

    } catch (err) {
      console.error("Submit error:", err);
      // notification.error({
      //   message: "Submission Failed",
      //   description: "There was an error submitting your feedback.",
      // });
      toastError({ title: "Submission Failed", description: "There was an error submitting your feedback." });
    }
  };

  const handleDecline = () => {
    setIsDeclining(true);
    setUserInput("");
  };

  const handleCancelDecline = () => {
    setIsDeclining(false);
    setUserInput("");
  };

  return (
    <div className="feedback-modal">
      <div className="predefined-message">{predefinedMessage}</div>

      <Input.TextArea
        rows={6}
        placeholder={isDeclining ? "Your reason to decline" : "Write your feedback here..."}
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        className="feedback-textarea"
      />

      <div className="feedback-action-buttons">
        {isDeclining ? (
          <>
            <Button type="default" onClick={handleCancelDecline} className="feedback-btn">
              Cancel
            </Button>
            <Button type="primary" onClick={handleSubmit} className="feedback-submit-btn">
              Decline
            </Button>
          </>
        ) : (
          <>
            <Button type="default" onClick={handleDecline} className="feedback-btn">
              Decline Request
            </Button>
            <Button type="primary" onClick={handleSubmit} className="feedback-submit-btn">
              Submit Feedback
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;
