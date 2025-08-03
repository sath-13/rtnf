import { useEffect, useState } from "react";
import { Table, Button, Modal, Tooltip, Typography } from "antd";
import {
  getPendingFeedbackRequests,
  submitFeedback,
} from "../../../../api/feedbackapi";
import FeedbackModal from "./Request_FeedBack_Modal";
import { FaComments } from "react-icons/fa";
import { toastError, toastSuccess } from "../../../../Utility/toast";
const { Title } = Typography;

const PendingFeedbackRequests = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null); // reviewee
  const [requesterId, setRequesterId] = useState(null); // requester

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id || user?._id;

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const requests = await getPendingFeedbackRequests(userId);
        setPendingRequests(requests);
      } catch (error) {
        console.error("Failed to load pending feedback requests:", error);
      }
    };

    if (userId) {
      fetchPendingRequests();
    }
  }, [userId]);

  const handleGiveFeedback = (record) => {
    const reviewee =
      typeof record.revieweeId === "object"
        ? record.revieweeId
        : { _id: record.revieweeId };
    const requester =
      typeof record.requesterId === "object"
        ? record.requesterId
        : { _id: record.requesterId };

    const revieweeFullName = `${reviewee.fname
      ?.trim()
      .toLowerCase()} ${reviewee.lname?.trim().toLowerCase()}`;
    const requestedByFullName = `${requester?.fname
      ?.trim()
      .toLowerCase()} ${requester?.lname?.trim().toLowerCase()}`;

    const isSelf = revieweeFullName === requestedByFullName;

    setSelectedUser({
      _id: reviewee._id,
      fname: reviewee.fname || "User",
      lname: reviewee.lname || "",
      email: reviewee.email || "",
      role: reviewee.role || "user",
      requestId: record._id,
      isSelfFeedback: isSelf,
    });

    setRequesterId(requester._id); // set separately
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setRequesterId(null);
  };

  const handleSubmitFeedback = async (feedbackData) => {
    try {
      const updatedFeedbackData = {
        ...feedbackData,
        feedbackType: "request",
      };

      await submitFeedback(updatedFeedbackData);

      // notification.success({
      //   message: "Feedback Submitted",
      //   description: "Your feedback has been submitted successfully.",
      // });
      toastSuccess({
        title: "Feedback Submitted",
        description: "Your feedback has been submitted successfully.",
      });

      setPendingRequests((prev) =>
        prev.filter((req) => req._id !== selectedUser.requestId)
      );

      handleModalClose();
    } catch (error) {
      console.error("Error submitting feedback:", error);
      // notification.error({
      //   message: "Submission Failed",
      //   description: "There was an error submitting your feedback. Please try again.",
      // });
      toastError({
        title: "Submission Failed",
        description:
          "There was an error submitting your feedback. Please try again.",
      });
    }
  };

  const handleDeclineSuccess = (requestId) => {
    setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));
  };

  const handleFeedbackSubmitSuccess = (requestId) => {
    setPendingRequests((prev) => prev.filter((req) => req._id !== requestId));
  };

  const columns = [
    {
      title: "Requested By",
      key: "requesterId",
      render: (_, record) => {
        const requester = record.requesterId;
        return requester ? `${requester.fname} ${requester.lname}` : "N/A";
      },
    },
    {
      title: "Feedback For (Reviewee Name)",
      key: "revieweeId",
      render: (_, record) => {
        const reviewee = record.revieweeId;
        return reviewee ? `${reviewee.fname} ${reviewee.lname}` : "User";
      },
    },
    {
      title: "Reviewee Email",
      key: "email",
      render: (_, record) => record.revieweeId?.email || "N/A",
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Tooltip title="Give Feedback">
          <Button
            shape="circle"
            icon={<FaComments />}
            onClick={() => handleGiveFeedback(record)}
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="!py-5">
      <div className=" bg-[#fff] shadow-lg rounded-lg border border-border-color" >
        <h1 className="!text-center !text-xl lg:!text-2xl text-primary-text font-rubik font-semibold !pt-5 !mb-5">
          Pending Feedback Requests: <strong>{pendingRequests.length}</strong>
        </h1>
        <Table
          className="!font-inter border border-border-color rounded-none lg:rounded-lg"
          columns={columns}
          dataSource={pendingRequests}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
          bordered
          scroll={{ x: "max-content" }}
        />

        {isModalOpen && selectedUser && requesterId && (
          <Modal
            title={`Giving Feedback to ${selectedUser.fname} ${selectedUser.lname}`}
            open={isModalOpen}
            footer={null}
            onCancel={handleModalClose}
            width={720}
          >
            <FeedbackModal
              selectedUser={selectedUser}
              onClose={handleModalClose}
              requesterId={requesterId} // ✅ Use the correct value from state
              isSelfFeedback={selectedUser.isSelfFeedback}
              onSubmit={handleFeedbackSubmitSuccess}
              onDeclineSuccess={handleDeclineSuccess}
            />
          </Modal>
        )}
      </div>
    </div>
  );
};

export default PendingFeedbackRequests;
