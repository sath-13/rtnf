import { Button, Input, Select, Form, notification, Space } from "antd";
import { checkEmailAvailability, checkUsernameAvailability, createUser } from "../../../../api/usersapi";
import { getAllTeams } from "../../../../api/teamapi";
import { getAllBranches } from "../../../../api/companyapi";
import { fetchRolesByCompanyId } from "../../../../api/domainapi";
import "./UserAdditionForm.css";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserMessages } from "../../../../constants/constants";
import { STATUS, ROLES } from "../../../../constants/enums";
import { toastError, toastSuccess } from "../../../../Utility/toast";

const { Option } = Select;



const UserAdditionForm = ({ onClose, refreshModels }) => {
    const [form] = Form.useForm();
    const { workspacename } = useParams();
    const [teams, setTeams] = useState([]);
    const [branches, setBranches] = useState([]);
    const [jobRoles, setJobRoles] = useState([]);
    const [loading, setLoading] = useState(false);

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

        const fetchJobRoles = async () => {
            try {
                const user = JSON.parse(localStorage.getItem("user"));
                const companyId = user?.companyId;
                if (companyId) {
                    const res = await fetchRolesByCompanyId(companyId);
                    if (res.success && Array.isArray(res.data)) {
                        setJobRoles(res.data);
                    }
                }
            } catch {
                // ignore error
            }
        };

        fetchTeams();
        fetchBranches();
        fetchJobRoles();
    }, [workspacename]);

    const validateUsername = async (_, value) => {
        if (!value) return Promise.resolve();
        try {
            const res = await checkUsernameAvailability(value);
            return res?.error ? Promise.reject(res.error) : Promise.resolve();
        } catch {
            return Promise.reject("Error checking username");
        }
    };

    const validateEmail = async (_, value) => {
        if (!value) return Promise.resolve();
        try {
            const res = await checkEmailAvailability(value, workspacename);
            return res?.error ? Promise.reject(res.error) : Promise.resolve();
        } catch {
            return Promise.reject("Error checking email");
        }
    };

    const validatePassword = (_, value) => {
        if (!value) return Promise.resolve();
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
        return regex.test(value)
            ? Promise.resolve()
            : Promise.reject("Password must have 8+ chars, uppercase, lowercase, number, special char.");
    };

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            await createUser({
                ...values,
                password: values.password || " ",
                workspaceName: [workspacename], // still a single workspace
            });
            // notification.success({ message: UserMessages.USER_CREATE_SUCC_MSG, description: UserMessages.USER_CREATE_SUCC });
            toastSuccess({ title: UserMessages.USER_CREATE_SUCC_MSG, description: UserMessages.USER_CREATE_SUCC });
            refreshModels();
            form.resetFields();
            onClose();
        } catch (error) {
            // notification.error({
            //     message: UserMessages.USER_ERR_MSG,
            //     description: error.response?.data?.message || UserMessages.USER_CREATE_ERR,
            // });
            toastError({ title: UserMessages.USER_ERR_MSG, description: error.response?.data?.message || UserMessages.USER_CREATE_ERR });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Form form={form} onFinish={handleSubmit} layout="vertical">
            <Form.Item label="First Name" name="fname" rules={[{ required: true }]}>
                <Input placeholder="Enter Firstname" />
            </Form.Item>

            <Form.Item label="Last Name" name="lname" rules={[{ required: true }]}>
                <Input placeholder="Enter Lastname" />
            </Form.Item>

            <Form.Item label="Username" name="username" rules={[{ required: true }, { validator: validateUsername }]}>
                <Input placeholder="Enter Username" />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ required: true, type: "email" }, { validator: validateEmail }]}>
                <Input placeholder="Enter Email" />
            </Form.Item>

            <Form.Item label="Password" name="password" rules={[{ validator: validatePassword }]} hasFeedback>
                <Input.Password placeholder="Password (optional)" />
            </Form.Item>

            <Form.Item label="Confirm Password" name="confirmPassword" dependencies={["password"]} hasFeedback
                rules={[
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            return !getFieldValue("password") || getFieldValue("password") === value
                                ? Promise.resolve()
                                : Promise.reject("Passwords do not match.");
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="Confirm Password" />
            </Form.Item>

            <Form.Item label="Team Name" name="teamTitle">
                <Select placeholder="Select Team">
                    {teams.map((team) => (
                        <Option key={team._id} value={team.teamTitle}>{team.teamTitle}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Role" name="role">
                <Select placeholder="Select Role">
                    {Object.values(ROLES).map((role) => (
                        <Option key={role} value={role}>{role}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Branch" name="branch">
                <Select placeholder="Select Branch">
                    {branches.map((branch) => (
                        <Option key={branch} value={branch}>{branch}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Status" name="status">
                <Select placeholder="Select Status">
                    {Object.values(STATUS).map((status) => (
                        <Option key={status} value={status}>{status}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="Job Role" name="jobRole">
                <Select placeholder="Select Job Role">
                    {jobRoles.map((role, idx) => (
                        <Option key={role._id || role} value={role.roleName || role}>{role.roleName || role}</Option>
                    ))}
                </Select>
            </Form.Item>

            <Form.Item label="User Logo (URL)" name="userLogo">
                <Input placeholder="Enter logo URL" />
            </Form.Item>

            <Form.Item label="Company ID" name="companyId" rules={[{ required: true }]}>
                <Input placeholder="Enter Company ID" />
            </Form.Item>

            <Form.Item label="Imported" name="imported">
                <Select placeholder="Is user imported?">
                    <Option value={true}>Yes</Option>
                    <Option value={false}>No</Option>
                </Select>
            </Form.Item>

            <Form.Item label="Direct Manager ID" name="directManager">
                <Input placeholder="Enter Direct Manager ID" />
            </Form.Item>

            <Form.Item label="Dotted Line Manager ID" name="dottedLineManager">
                <Input placeholder="Enter Dotted Line Manager ID" />
            </Form.Item>

            <Space>
                <Button className="custom-button" type="primary" htmlType="submit" loading={loading}>
                    {loading ? "Creating User..." : "Create User"}
                </Button>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
            </Space>
        </Form>
    );
};

export default UserAdditionForm;


