import React, { useState, useEffect, useCallback } from "react";
import { Button, Modal, Table, Badge, Spin, message } from "antd";
import { AiOutlineBell, AiOutlineDelete } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import {
  getNotifications,
  deleteNotification,
  markAllNotificationsAsRead
} from "../../api/notificationapi";
import { MdVisibility } from "react-icons/md";
import ActionDash from "../Actions/ActionDash/ActionDash";
import "./NotificationModal.css";
import { toastError } from "../../Utility/toast";

const socket = io(process.env.REACT_APP_BASE_URL);

const NotificationModal = ({ newActionCreated }) => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedAction, setSelectedAction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const loggedUser = JSON.parse(localStorage.getItem("user"))?.id || JSON.parse(localStorage.getItem("user"))?._id || null;

  useEffect(() => {
    if (loggedUser) {
      socket.emit("join", { userId: loggedUser });
    }
  }, [loggedUser]);

  useEffect(() => {
    const handleNewNotification = (data) => {
      const newNotification = { ...data, read: false };
      setNotifications((prev) => [...prev, newNotification]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleSurveyNotification = (data) => {
      const newNotification = { 
        ...data, 
        read: false,
        actionTitle: data.title,
        description: data.description,
        CreatedByName: data.createdByName,
        notificationType: data.type || 'survey_launch',
        surveyId: data.surveyId
      };
      setNotifications((prev) => [...prev, newNotification]);
      setUnreadCount((prev) => prev + 1);
      
      // Show a toast notification for survey events
      if (data.type === 'survey_launch') {
        message.success(`📊 New survey available: "${data.title.replace('📊 New Survey: ', '')}"`);
      } else if (data.type === 'comment_reply') {
        message.info(`💬 Admin replied to your survey comment`);
      }
    };

    socket.on("newAction", handleNewNotification);
    socket.on("newSubAssignedAction", handleNewNotification);
    // 🆕 Add survey notification listeners
    socket.on("new_survey", handleSurveyNotification);
    socket.on("comment_reply", handleSurveyNotification);

    return () => {
      socket.off("newAction", handleNewNotification);
      socket.off("newSubAssignedAction", handleNewNotification);
      socket.off("new_survey", handleSurveyNotification);
      socket.off("comment_reply", handleSurveyNotification);
    };
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!loggedUser) return;
    setLoading(true);
    try {
      const data = await getNotifications({ userId: loggedUser });

      const formattedData = data.map((n) => ({
        ...n,
        read: n.read || false,
      }));

      setNotifications(formattedData);

      const unread = formattedData.filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch (error) {
      // message.error(error.message);
      toastError({ title: "Error", description: error.message });
    } finally {
      setLoading(false);
    }
  }, [loggedUser]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications, newActionCreated]);

  const handleOpenModal = async () => {
    setModalVisible(true);

    if (!loggedUser) return;

    try {
      await markAllNotificationsAsRead({ userId: loggedUser });

      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch (error) {
      // message.error(error.message);
      toastError({ title: "Error", description: error.message });
    }
  };

  const markAllAsReadHandler = async () => {
    if (!loggedUser) return;
    try {
      await markAllNotificationsAsRead({ userId: loggedUser });
      const updated = notifications.map((n) => ({ ...n, read: true }));
      setNotifications(updated);
      setUnreadCount(0);
    } catch (error) {
      // message.error(error.message);
      toastError({ title: "Error", description: error.message });
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      const updated = notifications.filter((n) => (n.id || n._id) !== notificationId);
      setNotifications(updated);
      const newUnread = updated.filter((n) => !n.read).length;
      setUnreadCount(newUnread);
    } catch (error) {
      // message.error(error.message);
      toastError({ title: "Error", description: error.message });
    }
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedAction(null);
  };


  const showModal = (notification) => {
    // Handle survey notifications differently
    if (notification?.notificationType === 'survey_launch' && notification?.surveyId) {
      // Navigate to survey response page
      navigate(`/response/${notification.surveyId}`);
      setModalVisible(false);
      return;
    }
    
    if (notification?.notificationType === 'comment_reply') {
      // For comment replies, could navigate to feedback section or show a simple message
      message.info('Admin has replied to your survey comment!');
      return;
    }
    
    // Handle regular action notifications
    const userHasEditAccess =
      notification?.CreatedById === loggedUser ||  // Creator
      notification?.userAssignedId === loggedUser ||  // Assigned user
      (notification?.editUsers && notification?.editUsers.includes(loggedUser));  // In The Loop users

    setSelectedAction({
      _id: notification?.actionId,
      isEditable: userHasEditAccess
    });

    setIsModalVisible(true);
  };


  const columns = [
    {
      dataIndex: "message",
      key: "message",
      render: (text, record) => {
        // Handle survey notifications
        if (record.notificationType === 'survey_launch') {
          return (
            <span>
              🔔 <strong>{record.CreatedByName}</strong> launched a new survey: <strong>"{record.actionTitle.replace('📊 New Survey: ', '')}"</strong>
            </span>
          );
        }
        
        if (record.notificationType === 'comment_reply') {
          return (
            <span>
              💬 <strong>{record.CreatedByName}</strong> replied to your survey comment
            </span>
          );
        }
        
        // Handle regular action notifications
        return (
          <span>
            {record.CreatedByName} has assigned action "{record.actionTitle}" to {record.userAssignedName}
          </span>
        );
      },
    },
    {
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="text" danger onClick={() => handleDelete(record.id || record._id)}>
            <AiOutlineDelete />
          </Button>
          <Button 
            shape="circle" 
            size="large" 
            onClick={() => showModal(record)} 
            icon={<MdVisibility />}
            title={
              record.notificationType === 'survey_launch' ? 'Open Survey' :
              record.notificationType === 'comment_reply' ? 'View Reply' :
              'View Action'
            }
          >
          </Button>
        </>
      ),
    },
  ];

  return (
    <>

      <div className="notification-button">
        <Badge
          count={unreadCount}
          offset={[6, 0]}
          className="custom-badge"
        >
          <Button
            type="text"
            icon={<AiOutlineBell className="bell-icon" />}
            onClick={handleOpenModal} />
        </Badge>
      </div>


      <Modal
        title={<div className="flex justify-between items-center">
          <span className="text-[18px]">Notifications</span>
          <Button className="custom-button !mr-[27px]" type="default" onClick={markAllAsReadHandler}>
            Mark All as Read
          </Button>
        </div>}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
      >
        {loading ? (
          <Spin />
        ) : (
          <Table columns={columns} dataSource={notifications} rowKey={(record) => record.id || record._id} pagination={{ pageSize: 6 }} showHeader={false} />
        )}
      </Modal>

      <Modal title="Action Details" visible={isModalVisible} onCancel={handleCancel} footer={null} width={800}>

        <ActionDash
          selectedActionId={selectedAction?._id}
          isReadOnly={!selectedAction?.isEditable}  // Now dynamically controls edit access
          isFromNotification={true}
          loggedInUser={loggedUser}

        />

      </Modal>
    </>
  );
};

export default NotificationModal;

