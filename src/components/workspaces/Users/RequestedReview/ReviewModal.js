import React, { useState, useEffect } from "react";
import { Form, Button, notification, Typography, Checkbox, Row, Col, Input, Tooltip } from "antd";
import { useParams } from "react-router-dom";
import { getUsersInWorkspace } from "../../../../api/usersapi";
import { sendRequestedFeedbacks } from "../../../../api/feedbackapi";
import { CommonMessages, FeedbackMessages } from "../../../../constants/constants";
import { toastError, toastSuccess, toastWarning } from "../../../../Utility/toast";

const { Title } = Typography;

const ReviewModal = ({ selectedUser, onClose }) => {
  const [loading, setLoading] = useState(false);
  const { workspacename } = useParams();
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchText, setSearchText] = useState("");

  const loggedInUser = JSON.parse(localStorage.getItem("user")); // Logged-in user

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsersInWorkspace(workspacename);
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        // notification.error({
        //   message: "Error",
        //   description: "There was an error fetching the users.",
        // });
        toastError({ title: "Error", description: "There was an error fetching the users." });
      }
    };

    fetchUsers();
  }, [workspacename]);




  const handleUserChange = (checkedValues) => {
    setSelectedUsers(checkedValues);
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };


  const handleSubmit = async () => {
    setLoading(true);
    try {
      const loggedInUserId = loggedInUser?.id || loggedInUser?._id;
      const isSelfFeedback = selectedUser._id === loggedInUserId;

      if (selectedUsers.length === 0) {
        // notification.warning({
        //   message: "No Users Selected",
        //   description: "Please select at least one user to send the feedback request.",
        // });
        toastWarning({ title: "No Users Selected", description: "Please select at least one user to send the feedback request." });
        setLoading(false);
        return;
      }

      const reviewData = {
        reviewerIds: selectedUsers,
        revieweeId: selectedUser._id,
        workspacename,
        requesterId: loggedInUserId,
        isSelfFeedback,
      };



      const response = await sendRequestedFeedbacks(reviewData);

      if (response.success) {
        // notification.success({
        //   message: FeedbackMessages.REVIEW_REQUEST_SUCC,
        //   description: FeedbackMessages.SELECTED_USERS_GOT_NOTIFIED,
        // });
        toastSuccess({ title: FeedbackMessages.REVIEW_REQUEST_SUCC, description: FeedbackMessages.SELECTED_USERS_GOT_NOTIFIED });
        onClose();
      } else {
        // notification.error({
        //   message: CommonMessages.ERR_MSG,
        //   description: response.data?.message || FeedbackMessages.ERROR_NOTIFYING,
        // });
        toastError({ title: CommonMessages.ERR_MSG, description: response.data?.message || FeedbackMessages.ERROR_NOTIFYING });
      }
    } catch (error) {

      // notification.error({
      //   message: CommonMessages.ERR_MSG,
      //   description: FeedbackMessages.ERROR,
      // });
      toastError({ title: CommonMessages.ERR_MSG, description: FeedbackMessages.ERROR });
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="p-5">
      <div className="flex justify-between items-center mb-[15px]">
        <Title level={5}>
          <b><sup className="text-red-500 text-[15px]">*</sup></b> Select Users to Give Feedback
        </Title>
        <Tooltip title="Search by email">
          <Input.Search
            value={searchText}
            onChange={handleSearch}
            className="!w-[170px]"
          />
        </Tooltip>
      </div>

      <Form layout="vertical" onFinish={handleSubmit}>
        {/* Self-feedback checkbox - visible only when logged-in user is requesting feedback for self */}
        {loggedInUser && selectedUser && selectedUser._id === loggedInUser.id && (
          <Form.Item>
            <Checkbox checked disabled>
              Request feedback for myself
            </Checkbox>
          </Form.Item>
        )}

        <Form.Item
          name="users"
          rules={[{ required: true, message: "Please select at least one user" }]}
          className="!max-h-[200px] !overflow-y-auto !p-2.5 !rounded-[5px]"
        >
          <Checkbox.Group onChange={handleUserChange} value={selectedUsers}>
            <Row>
              {users
                .filter(user =>
                  user.email.toLowerCase().includes(searchText.toLowerCase()) &&
                  user.role !== "superadmin"
                )
                .map(user => (
                  <Col span={24} key={user._id}>
                    <Checkbox value={user._id}>{user.email}</Checkbox>
                  </Col>
                ))}
            </Row>
          </Checkbox.Group>
        </Form.Item>

        <Form.Item className="!text-center !mt-5">
          <Button className="custom-button !w-full" type="primary" htmlType="submit" loading={loading}>
            Send
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReviewModal;
