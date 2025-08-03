import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Upload,
  Row,
  Col,
  message,
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import moment from "moment";
import { createEvent, uploadFileToEvent } from "../../api/eventapi";
import { getUsersInWorkspace } from "../../api/usersapi";
import { toastError, toastSuccess } from "../../Utility/toast";
import { eventMessages } from "../../constants/constants.js";
import './styles.css';
import { getWorkspaceByName } from "../../api/workspaceapi.js";
import { axiosSecureInstance } from "../../api/axios.js";

const { Option } = Select;
const { Dragger } = Upload;

const CreateEventForm = ({ fetchEvents, workspacename }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    if (workspacename) {
      fetchUsers(workspacename);
    }
  }, [workspacename]);

  const fetchUsers = async (id) => {
    try {
      const usersData = await getUsersInWorkspace(workspacename);
      
      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  };


const onFinish = async (values) => {
  setLoading(true);
  try {
    const startTime = values.sessionStart.toISOString();
    const endTime = values.sessionEnd.toISOString();

    if (moment(endTime).isBefore(moment(startTime))) {
      toastError({
        title: "Error",
        description: "Session end time must be after start time.",
      });
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", values.title);
    formData.append("description", values.description);
    formData.append("location", values.location || "");
    formData.append("reminder", values.reminder || "");
    formData.append("sessionTitle", values.title);
    formData.append("startTime", startTime);
    formData.append("endTime", endTime);

    (values.assignedTo || []).forEach(id => {
      formData.append("userAssigned[]", id);
    });

    const fileList = values.attachments?.fileList || [];
    if (fileList.length > 0) {
      formData.append("file", fileList[0].originFileObj);
    }

    await axiosSecureInstance.post("/api/event/create", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    toastSuccess({
      title: "Success",
      description: eventMessages.EVENT_CREATE,
    });

    form.resetFields();
    await fetchEvents();
  } catch (err) {
    console.error(err);
    toastError({
      title: "Error",
      description: eventMessages.FAILED_TO_CREATE_EVENT,
    });
  } finally {
    setLoading(false);
  }
};


  const handleToggleAll = () => {
    const current = form.getFieldValue("assignedTo") || [];
    const allSelected = current.length === users.length;
    const newValue = allSelected ? [] : users.map((user) => user._id);
    form.setFieldsValue({ assignedTo: newValue });
  };

  return (
    <div className="event-bor">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={32}>
          <Col span={16}>
            <h2 className="form-title">Create Event</h2>

            <Form.Item name="title" label="Title" rules={[{ required: true, message: "Please enter event title" }]}>
              <Input placeholder="Title" />
            </Form.Item>

            <Form.Item name="description" label="Description">
              <Input.TextArea placeholder="Add description..." rows={3} />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="sessionStart" label="Session Start" rules={[{ required: true, message: "Select start date and time" }]}>
                  <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item name="sessionEnd" label="Session End" rules={[{ required: true, message: "Select start date and time" }]}>
                  <DatePicker showTime format="YYYY-MM-DD HH:mm" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item name="location" label="Location">
              <Input placeholder="Location" />
            </Form.Item>

            <Form.Item name="attachments" label="Upload Attachments">
              <Dragger
                name="file"
                multiple={false}
                 beforeUpload={() => false}
                 showUploadList={true}>
                <p className="ant-upload-drag-icon"><InboxOutlined /></p>
                <p className="ant-upload-text">Click or drag file to upload</p>
              </Dragger>
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item name="assignedTo" label="Add Members">
              <Select
                mode="multiple"
                placeholder="Select team members"
                popupRender={menu => (
                  <>
                    <div style={{ padding: 8, textAlign: 'center' }}>
                      <Button type="link" onClick={handleToggleAll}>
                        {form.getFieldValue("assignedTo")?.length === users.length ? "Clear All" : "Select All"}
                      </Button>
                    </div>
                    {menu}
                  </>
                )}
              >
                {users.map(user => (
                  <Option key={user._id} value={user._id}>
                    {user.fname} {user.lname}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="reminder" label="Set Reminder">
              <Select placeholder="Choose reminder">
                <Option value="2">2 hours before event</Option>
                <Option value="1">1 hour before event</Option>
                <Option value="0.5">30 minutes before event</Option>
              </Select>
            </Form.Item>

            <Form.Item>
              <Button className="button-one" type="primary" htmlType="submit" block loading={loading}>
                Create Event
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateEventForm;
