import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Typography,
  DatePicker,
  Checkbox,
} from "antd";
import './styles.css';
import { getAllUsers, submitHiringRequest } from "../../api/hiringApi";
import { toastError, toastSuccess } from "../../Utility/toast";
import { getAllTeams } from "../../api/teamapi";
import { useParams } from "react-router-dom";
import { UserMessages } from "../../constants/constants";
import { getAllBranches } from "../../api/companyapi";
import { getUsersInWorkspace } from "../../api/usersapi";

const { Title } = Typography;
const { Option } = Select;


const HiringRequestForm = () => {
  const [form] = Form.useForm();
  const [sendToUser, setSendToUser] = useState(false);


  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        filledBy: values.filledBy.format("YYYY-MM-DD"),
      };

      if (payload.userId) {
        delete payload.jobRole; // remove this so backend sets correct role
      }

      await submitHiringRequest(payload);
      toastSuccess({ title: "Success", description: "Hiring Request Saved Successfully" });
      form.resetFields();
    } catch (err) {
      console.error("Error submitting hiring request:", err);
    }
  };

  const { workspacename } = useParams();
const { workspaceId } = useParams();
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

  const [teams, setTeams] = useState([]);
  const [branches, setBranches] = useState([]);
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await getAllTeams(workspacename);
        setTeams(response?.data || []);
      } catch {
        // notification.error({ message: "Error", description: UserMessages.USER_TEAM_FETCH_ERR_MSG });
        toastError({ title: "Error", description: UserMessages.USER_TEAM_FETCH_ERR_MSG });
      }
    };

        const fetchBranches = async () => {
            try {
                const response = await getAllBranches();
                
                const branchList = Array.isArray(response) ? response : response?.branches ?? [];
                setBranches(branchList);
            } catch {
                // notification.error({ message: "Error", description: UserMessages.USER_BRANCH_FETCH_FAIL });
                toastError({ title: "Error", description: UserMessages.USER_BRANCH_FETCH_FAIL });
            }
        };

    fetchTeams();
    fetchBranches();
  }, [workspacename]);


  return (
    <div className="form border border-border-color rounded-lg shadow-md !mt-5">
      <Title level={3}>Hiring Request Form</Title>
      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        initialValues={{ positionType: "Full-time" }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: "Please enter name" }]}
            >
              <Input placeholder="Enter name" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="location"
              label="Location"
              rules={[{ required: true, message: "Please select location" }]}
            >
              <Select placeholder="Select Location">
                {branches.map((branch) => (
                  <Option key={branch} value={branch}>
                    {branch}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="podName"
              label="POD Name"
              rules={[{ required: true, message: "Please select POD" }]}
            >
              <Select placeholder="Select POD">
                {teams.map((team) => (
                  <Option key={team._id} value={team.teamTitle}>
                    {team.teamTitle}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="designation"
              label="Designation to be filled"
              rules={[{ required: true, message: "Please enter designation" }]}
            >
              <Input placeholder="Enter designation" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="vacancies"
              label="Number of Vacancies"
              rules={[{ required: true, message: "Please enter number of vacancies" }]}
            >
              <Input type="number" placeholder="Enter number" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="positionType"
              label="Position Type"
              rules={[{ required: true, message: "Please select position type" }]}
            >
              <Select placeholder="Select position type">
                <Option value="Replacement">Replacement</Option>
                <Option value="New request">New request</Option>
                <Option value="Paid Internship">Paid Internship</Option>
                <Option value="Unpaid Internship">Unpaid Internship</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="experience"
              label="Experience"
              rules={[{ required: true, message: "Please enter experience" }]}
            >
              <Input placeholder="Enter experience" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="reason"
              label="Reason/Project"
              rules={[{ required: true, message: "Please enter reason/project" }]}
            >
              <Input placeholder="Enter reason/project" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="shift"
              label="Shift Requirement"
              rules={[{ required: true, message: "Please enter shift requirement" }]}
            >
              <Input placeholder="Enter shift" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item name="jobRole" label="Send To">
              <Select placeholder="Select roles">
                <Option value="HR">HR</Option>
              </Select>
            </Form.Item>
          </Col>

          <Col xs={15}>
            <Checkbox onChange={(e) => setSendToUser(e.target.checked)}>
              Send To Particular User
            </Checkbox>
          </Col>

          {sendToUser && (
            <Col xs={24} sm={12}>
              <Form.Item
                name="userId"
                label="Select User"
                rules={[{ required: true, message: "Please select user" }]}
              >
                <Select placeholder="Select user">
                  {users.map((user) => (
                    <Option key={user._id} value={user._id}>
                      {user.fname}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          )}



          <Col xs={24}>
            <Form.Item
              className="pt-3"
              name="candidateProfile"
              label="Candidate Profile Requirement Details"
              rules={[{ required: true, message: "Please enter candidate profile" }]}
            >
              <Input.TextArea rows={4} placeholder="Enter details" />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              name="filledBy"
              label="To Be Filled By"
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker className="date" format="YYYY-MM-DD" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item name="comments" label="Comments">
              <Input.TextArea rows={3} placeholder="Additional comments" />
            </Form.Item>
          </Col>

          <Col xs={24}>
            <Form.Item>
              <Button className="submit-button" type="primary" htmlType="submit">
                Submit Request
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>

  );
};

export default HiringRequestForm;
