import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  Avatar,
  message,
  Button,
  Spin,
  Form,
  Input,
  DatePicker,
  Typography,
} from "antd";
import moment from "moment";
import { getRemindersByWorkspace, createReminder } from "../../api/reminderapi";
import { useParams } from "react-router-dom";
import * as FaIcons from "react-icons/fa";
import "./ReminderFeed.css";
import { toastError, toastSuccess } from "../../Utility/toast";

const { Title } = Typography;
const CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const SCOPES = "https://www.googleapis.com/auth/calendar.events";

const ReminderFeed = () => {
  const [reminders, setReminders] = useState([]);
  const [displayedReminders, setDisplayedReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { workspacename } = useParams();
  const [form] = Form.useForm();

  const remindersToShow = 5;

  // Google token client ref
  const tokenClient = useRef(null);
  const [googleToken, setGoogleToken] = useState(
    localStorage.getItem("google_oauth_access_token") || null
  );

  // Initialize Google Token Client for OAuth
  useEffect(() => {
    if (!window.google) {
      console.error("Google Identity Services SDK not loaded.");
      return;
    }

    tokenClient.current = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse) => {
        if (tokenResponse.error) {
          // message.error("Google OAuth error: " + tokenResponse.error);
          toastError({
            title: "Error",
            description: "Google OAuth error: " + tokenResponse.error,
          });
          return;
        }
        localStorage.setItem(
          "google_oauth_access_token",
          tokenResponse.access_token
        );
        setGoogleToken(tokenResponse.access_token);
        // message.success("Google Calendar access granted!");
        toastSuccess({
          title: "Success",
          description: "Google Calendar access granted!",
        });
      },
    });
  }, []);

  // Fetch reminders
  const fetchReminders = useCallback(async () => {
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const companyId = user.companyId;
      const userId = user.id || user._id;

      if (!companyId || !userId) {
        // message.error("Missing company ID or user ID");
        toastError({
          title: "Error",
          description: "Missing company ID or user ID",
        });
        setLoading(false);
        return;
      }

      const res = await getRemindersByWorkspace(workspacename, companyId, userId);
      console.log("Fetched reminders:", res);

      setReminders(res);
      setDisplayedReminders(res.slice(0, remindersToShow));
    } catch (err) {
      console.error("Failed to load reminders", err);
      // message.error("Failed to load reminders");
      toastError({ title: "Error", description: "Failed to load reminders" });
    } finally {
      setLoading(false);
    }
  }, [workspacename]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const loadMoreReminders = () => {
    setDisplayedReminders(reminders.slice(0, displayedReminders.length + 5));
  };

  const getReminderIcon = (iconName) => {
    const IconComponent = FaIcons[iconName];
    return IconComponent ? (
      <IconComponent size={24} className="badge-icon" />
    ) : (
      <FaIcons.FaRegBell size={24} className="badge-icon" />
    );
  };

  // Request Google Calendar access token interactively
  const requestGoogleCalendarAccess = () => {
    if (!tokenClient.current) {
      // message.error("Google Identity Services not initialized.");
      toastError({
        title: "Error",
        description: "Google Identity Services not initialized.",
      });
      return;
    }
    tokenClient.current.requestAccessToken();
  };

  // Create event in Google Calendar using REST API & OAuth token
  const createEventInGoogleCalendar = async (reminder) => {
    if (!googleToken) {
      throw new Error(
        "Google access token missing. Please grant calendar permission."
      );
    }

    const event = {
      summary: reminder.title,
      description: reminder.description,
      start: {
        dateTime: new Date(reminder.remindAt).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: new Date(
          new Date(reminder.remindAt).getTime() + 30 * 60000
        ).toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };

    const response = await fetch(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      }
    );

    if (!response.ok) {
      if (response.status === 401) {
        // Token probably expired, clear it and ask user to login again
        localStorage.removeItem("google_oauth_access_token");
        setGoogleToken(null);
        throw new Error(
          "Unauthorized. Please grant Google Calendar access again."
        );
      }
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || "Failed to create calendar event."
      );
    }

    return response.json();
  };

  // Handle form submit for creating reminder
  const onFinish = async (values) => {
    setCreating(true);
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const companyId = user.companyId;
      const userId = user.id || user._id;

      if (!companyId || !userId) {
        // message.error("Missing company ID or user ID");
        // toastError({ title: "Error", description: "Missing company ID or user ID" });
        toastError({
          title: "Error",
          description: "Missing company ID or user ID",
        });
        setCreating(false);
        return;
      }

      const reminderData = {
        title: values.title,
        description: values.description,
        remindAt: values.remindAt.toISOString(),
        workspaceName: workspacename,
        companyId,
        userId,
      };

      if (!googleToken) {
        message.info("Please grant Google Calendar access first.");
        requestGoogleCalendarAccess();
        setCreating(false);
        return;
      }

      await createEventInGoogleCalendar(reminderData);

      const createdReminder = await createReminder(reminderData);

      // Immediate UI update without waiting for refetch
      setReminders((prev) => [createdReminder, ...prev]);
      setDisplayedReminders((prev) => [
        createdReminder,
        ...prev.slice(0, remindersToShow - 1),
      ]);

      // message.success("Reminder created and added to Google Calendar!");
      toastSuccess({
        title: "Success",
        description: "Reminder created and added to Google Calendar!",
      });
      form.resetFields();
    } catch (error) {
      console.error("Failed to create reminder or add to calendar:", error);
      // message.error(error.message || "Failed to create reminder or add to calendar.");
      toastError({
        title: "Error",
        description:
          error.message || "Failed to create reminder or add to calendar.",
      });
    } finally {
      setCreating(false);
    }
  };

  // Add event manually to calendar from existing reminder
  const requestCalendarPermissionAndCreateEvent = async (reminder) => {
    try {
      if (!googleToken) {
        message.info("Please grant Google Calendar access first.");
        requestGoogleCalendarAccess();
        return;
      }
      await createEventInGoogleCalendar(reminder);
      // message.success("Reminder added to your Google Calendar!");
      toastSuccess({
        title: "Success",
        description: "Reminder added to your Google Calendar!",
      });
    } catch (error) {
      console.error("Error creating calendar event:", error);
      // message.error(error.message || "Failed to add reminder to Google Calendar.");
      toastError({
        title: "Error",
        description:
          error.message || "Failed to add reminder to Google Calendar.",
      });
    }
  };

  return (
    <>
      <div className="rf-organization-feed-container !py-5">
        <div className="rf-organization-feed border border-border-color !px-2 md:!px-5 !py-5">
          <h1
            className="!text-xl md:!text-2xl !text-center text-primary-text font-rubik !mb-5"
          >
            ⏰ Reminders
          </h1>
          {!googleToken && (
            <div className="text-center">
              <Button
                className="google-calendar-button !mb-[20px]"
                type="primary"
                onClick={requestGoogleCalendarAccess}
              >
                Grant Google Calendar Access
              </Button>
            </div>

          )}

          {loading ? (
            <Spin size="large" tip="Loading reminders..." />
          ) : (
            <>
              <Card className="rf-feed-card mb-[20px]">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  disabled={creating}
                >
                  <Form.Item
                    label="Title"
                    name="title"
                    rules={[
                      { required: true, message: "Please enter a title" },
                    ]}
                  >
                    <Input placeholder="Reminder title" />
                  </Form.Item>
                  <Form.Item
                    label="Description"
                    name="description"
                    rules={[
                      { required: true, message: "Please enter description" },
                    ]}
                  >
                    <Input.TextArea
                      rows={3}
                      placeholder="Reminder description"
                    />
                  </Form.Item>
                  <Form.Item
                    label="Remind At"
                    name="remindAt"
                    rules={[
                      { required: true, message: "Please select date & time" },
                    ]}
                  >
                    <DatePicker
                      showTime
                      format="YYYY-MM-DD HH:mm"
                      disabledDate={(current) =>
                        current && current < moment().startOf("day")
                      }
                    />
                  </Form.Item>

                  <Form.Item>
                    <Button
                      type="primary"
                      className="custom-button font-inter"
                      htmlType="submit"
                      loading={creating}
                      disabled={!googleToken}
                    >
                      Create Reminder
                    </Button>
                  </Form.Item>
                </Form>
              </Card>

              {displayedReminders.length === 0 ? (
                <p className="text-center text-secondary-text text-base lg:text-lg font-inter">No reminders found.</p>
              ) : (
                displayedReminders.map((reminder, index) => (
                  <Card key={`reminder-${index}`} className="rf-feed-card">
                    <div className="rf-feed-header">
                      <Avatar
                        size={45}
                        src={reminder.createdBy?.userLogo}
                        className="rf-feed-avatar"
                      >
                        {!reminder.createdBy?.userLogo &&
                          reminder.createdBy?.fname?.charAt(0).toUpperCase()}
                      </Avatar>
                      <div className="rf-feed-info">
                        <p>
                          <strong>
                            {reminder.createdBy?.fname}{" "}
                            {reminder.createdBy?.lname}
                          </strong>{" "}
                          set a reminder
                        </p>
                        <span className="rf-feed-time">
                          {moment(reminder.createdAt).fromNow()}
                        </span>
                      </div>
                    </div>

                    <div className="rf-badge-container">
                      {getReminderIcon(reminder.icon || "FaRegBell")}
                      <div>
                        <h4 className="rf-badge-title">{reminder.title}</h4>
                      </div>
                    </div>

                    <p className="rf-feed-description">
                      {reminder.description}
                    </p>
                    <p>
                      <strong>Remind at:</strong>{" "}
                      {moment(reminder.remindAt).format("MMMM Do YYYY, h:mm a")}
                    </p>

                    <Button
                      type="primary"
                      className="mt-[10px]"
                      onClick={() =>
                        requestCalendarPermissionAndCreateEvent(reminder)
                      }
                      disabled={!googleToken}
                    >
                      Add to Google Calendar
                    </Button>
                  </Card>
                ))
              )}

              {!loading && displayedReminders.length < reminders.length && (
                <p className="rf-load-more" onClick={loadMoreReminders}>
                  Load More...
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ReminderFeed;
