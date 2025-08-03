import { Descriptions, Tag, Button, Input, Space, message } from "antd";
import { useState } from "react";
import { postDecision } from "../../api/hiringApi";
import { HIRING_ACCESS_ROLES } from "../../constants/enums";

const JobDetail = ({ job, onBack, user }) => {
  const [action, setAction] = useState(null);
  const [reason, setReason] = useState("");

  const isDecisionSubmitted = !!job?.decisionStatus;
  const isAssignedUser = job?.assignedToUserId === user?._id;

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return alert("Please enter a reason before submitting.");
    }
    try {
      await postDecision(job._id, action, reason);
      message.success("Decision submitted successfully");

      // force local re-render by modifying job (optional: fetch again)
      job.decisionStatus = action;
      job.decisionReason = reason;
      job.decisionDate = new Date();

      setAction(null);
      setReason("");
    } catch (err) {
      console.error("Error submitting decision:", err);
      message.error("Failed to submit decision");
    }
  };

  return (

    <div className="max-w-4xl mx-auto">
      <Button type="link" onClick={onBack}>
        ← Back to all jobs
      </Button>

      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Hiring Request - {job.designation}
      </h2>

      <Descriptions
        column={1}
        bordered
        size="middle"
        className="mb-6 !font-semibold"
      >
        <Descriptions.Item label="Pod Name">{job.podName}</Descriptions.Item>
        <Descriptions.Item label="Location">{job.location}</Descriptions.Item>
        <Descriptions.Item label="Requirements">{job.candidateProfile}</Descriptions.Item>
        <Descriptions.Item label="Type">{job.positionType}</Descriptions.Item>
        <Descriptions.Item label="Experience">{job.experience}</Descriptions.Item>
        <Descriptions.Item label="Designation">{job.designation}</Descriptions.Item>
        <Descriptions.Item label="Vacancies">{job.vacancies}</Descriptions.Item>
        <Descriptions.Item label="Reason / Project">{job.reason}</Descriptions.Item>
        <Descriptions.Item label="Shift">{job.shift}</Descriptions.Item>
        <Descriptions.Item label="Sent To">{job.jobRole}</Descriptions.Item>
        <Descriptions.Item label="To Be Filled By">{job.filledBy}</Descriptions.Item>
        <Descriptions.Item label="Comments">{job.comments}</Descriptions.Item>
        {isDecisionSubmitted && (
          <>
            <Descriptions.Item label="Status">
              <Tag color={job.decisionStatus === "accepted" ? "green" : "red"}>
                {job.decisionStatus.toUpperCase()}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Decision Reason">
              {job.decisionReason || "N/A"}
            </Descriptions.Item>
          </>
        )}
      </Descriptions>

      {(isAssignedUser || HIRING_ACCESS_ROLES) && !isDecisionSubmitted && !action && (
        <Space>
          <Button type="primary" onClick={() => setAction("accepted")}>
            Accept
          </Button>
          <Button danger onClick={() => setAction("rejected")}>
            Reject
          </Button>
        </Space>
      )}



      {action && !isDecisionSubmitted && (
        <div className="mt-6">
          <p className="mb-2 font-medium">
            Reason for {action === "accepted" ? "Accepting" : "Rejecting"}
          </p>
          <Input.TextArea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={`Enter reason for ${action}`}
          />
          <Space className="mt-4">
            <Button onClick={() => { setAction(null); setReason(""); }}>
              Cancel
            </Button>
            <Button type="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
