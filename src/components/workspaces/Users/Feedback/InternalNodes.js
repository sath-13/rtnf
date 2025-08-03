import React, { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import { Button, message } from "antd";
import { useParams } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import "./InternalNodes.css";

import { submitInternalNode } from "../../../../api/feedbackapi";
import { toastError, toastSuccess, toastWarning } from "../../../../Utility/toast";

const InternalNodes = ({ selectedUser, onClose }) => {
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const givenBy = user?.id || user?._id;
  const { workspacename } = useParams();

  useEffect(() => {
    setDescription(selectedUser?.content || "");
  }, [selectedUser]);

  const handleChange = (value) => {
    setDescription(value);
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      // message.warning("Description cannot be empty.");
      toastWarning({ title: "Warning", description: "Description cannot be empty." });
      return;
    }

    const nodeData = {
      givenTo: selectedUser._id,
      givenBy: givenBy,
      description: description,
      workspacename,
    };

    try {
      setLoading(true);
      await submitInternalNode(nodeData);
      // message.success("Internal node submitted successfully.");
      toastSuccess({ title: "Success", description: "Internal node submitted successfully." });
      setDescription("");
      onClose();
    } catch (error) {
      // message.error("Failed to submit internal node.");
      toastError({ title: "Error", description: "Failed to submit internal node." });
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="internal-node-modal">
      <ReactQuill
        value={description}
        onChange={handleChange}
        placeholder="Write your internal note here..."
        className="internal-node-editor"
      />

      <div className="internal-node-action-buttons">
        <Button
          type="primary"
          onClick={handleSubmit}
          loading={loading}
          className="internal-node-submit-btn custom-button"
        >
          Submit Internal Node
        </Button>
      </div>
    </div>
  );
};

export default InternalNodes;
