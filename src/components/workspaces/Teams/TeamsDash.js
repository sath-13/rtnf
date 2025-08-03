import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Typography,
  Select,
  Input,
  notification,
} from "antd";
import {
  AiOutlineDelete,
  AiOutlineEdit,
  AiOutlineUsergroupAdd,
} from "react-icons/ai";
import { createTeam, getAllTeams, deleteTeam } from "../../../api/teamapi";
import { getAllStreams } from "../../../api/streamapi";
import { getAllSubStreams } from "../../../api/substreamsapi";
import { updateTeam } from "../../../api/teamapi";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { MdVisibility } from "react-icons/md";
import { StreamMessages, TeamMessages } from "../../../constants/constants";
import { toastError, toastSuccess } from "../../../Utility/toast";

const { Title, Text } = Typography;
const { Option } = Select;

const ListTeams = () => {
  const { workspacename } = useParams();
  const [teamList, setTeamList] = useState([]);
  const [dataLoader] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teamIdToDelete, setTeamIdToDelete] = useState(null);
  const [selectedTeamTitle, setSelectedTeamTitle] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [streams, setStreams] = useState([]);
  const [subStreams, setSubStreams] = useState([]);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedSubStreams, setSelectedSubStreams] = useState([]);
  const [editingTeam, setEditingTeam] = useState(null);
  const [viewModal, setViewModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (editingTeam) {
      form.setFieldsValue({
        teamTitle: editingTeam.teamTitle,
        stream: editingTeam.stream,
        subStreams: editingTeam.subStreams,
        teamDescriptions: editingTeam.teamDescriptions,
      });
    }
  }, [editingTeam, form]);

  const fetchTeams = useCallback(async () => {
    try {
      const response = await getAllTeams(workspacename);
      setTeamList(response?.data);
    } catch (error) {
      // notification.error({
      //   message: TeamMessages.TEAM_ERR_MSG,
      //   description: TeamMessages.TEAM_FETCH_ERR
      // });
      toastError({
        title: TeamMessages.TEAM_ERR_MSG,
        description: TeamMessages.TEAM_FETCH_ERR,
      });
    }
  }, [workspacename]); //  Ensures it always has the latest workspacename

  const fetchStreams = useCallback(async () => {
    try {
      const response = await getAllStreams(workspacename);
      setStreams(response?.data);
    } catch (error) {
      console.error(TeamMessages.TEAM_STREAM_FETCH_ERR_MSG, error);
    }
  }, [workspacename]);

  useEffect(() => {
    fetchTeams();
    fetchStreams();
  }, [fetchTeams, fetchStreams]); //  No ESLint warnings

  const handleViewClick = async (team) => {
    try {
      const response = await getAllTeams(workspacename);
      const selectedTeam = response?.data.find(
        (t) => t.teamTitle === team.teamTitle
      );

      if (selectedTeam) {
        setSelectedTeamTitle(selectedTeam.teamTitle);
        setSubStreams(
          selectedTeam.subStreams.map((sub) => ({
            subStreams: sub,
            stream: selectedTeam.stream,
          }))
        );
        setViewModal(true);
      } else {
        // notification.error({ message: TeamMessages.TEAM_ERR_MSG, description: TeamMessages.TEAM_NOT_FOUND });
        toastError({
          title: TeamMessages.TEAM_ERR_MSG,
          description: TeamMessages.TEAM_NOT_FOUND,
        });
      }
    } catch (error) {
      // notification.error({ message: TeamMessages.TEAM_ERR_MSG, description: TeamMessages.TEAM_DETAILS_FETCH_ERR });
      toastError({
        title: TeamMessages.TEAM_ERR_MSG,
        description: TeamMessages.TEAM_DETAILS_FETCH_ERR,
      });
    }
  };

  const handleStreamChange = async (streamTitle) => {
    setSelectedStream(streamTitle);
    setSelectedSubStreams([]);
    try {
      // const response = await getAllSubStreams(streamTitle);
      const response = await getAllSubStreams(streamTitle, workspacename);
      setSubStreams(response?.data);
    } catch (error) {
      console.error(StreamMessages.SUBSTREAM_FETCH_ERR_MSG, error);
    }
  };

  const handleCreateTeam = async (values) => {
    try {
      // Get the logged-in admin's id from localStorage
      const adminId =
        JSON.parse(localStorage.getItem("user"))?.id ||
        JSON.parse(localStorage.getItem("user"))?._id;
      const finalSubStreams =
        selectedSubStreams.length > 0
          ? selectedSubStreams
          : subStreams.map((s) => s.subStreamTitle);
      const payload = {
        teamTitle: values.teamTitle,
        workspaceName: workspacename,
        stream: selectedStream,
        subStreams: finalSubStreams,
        teamDescriptions: values.teamDescriptions,
        adminId, // Pass adminId so that the controller can update the Admin model
      };

      await createTeam(payload);
      // notification.success({ message: TeamMessages.TEAM_SUCC_MSG, description: TeamMessages.TEAM_CREATE_SUCC });
      toastSuccess({
        title: TeamMessages.TEAM_SUCC_MSG,
        description: TeamMessages.TEAM_CREATE_SUCC,
      });
      form.resetFields();
      setAddModal(false);
      fetchTeams();
    } catch (error) {
      // notification.error({ message: TeamMessages.TEAM_ERR_MSG, description: TeamMessages.TEAM_CREATE_ERR });
      toastError({
        title: TeamMessages.TEAM_ERR_MSG,
        description: TeamMessages.TEAM_CREATE_ERR,
      });
    }
  };

  const handleEditTeam = async (values) => {
    try {
      const finalSubStreams =
        selectedSubStreams.length > 0
          ? selectedSubStreams
          : subStreams.map((s) => s.subStreamTitle);
      const payload = {
        ...editingTeam,
        teamTitle: values.teamTitle,
        stream: selectedStream,
        subStreams: finalSubStreams,
        teamDescriptions: values.teamDescriptions,
      };

      // API call to update team here (updateTeam function needed in API)
      await updateTeam(editingTeam._id, payload);

      // notification.success({ message: TeamMessages.TEAM_SUCC_MSG, description: TeamMessages.TEAM_UPDATE_SUCC });
      toastSuccess({
        title: TeamMessages.TEAM_SUCC_MSG,
        description: TeamMessages.TEAM_UPDATE_SUCC,
      });
      fetchTeams();
      form.resetFields();
      setEditModal(false);
    } catch (error) {
      // notification.error({ message: TeamMessages.TEAM_ERR_MSG, description: TeamMessages.TEAM_UPDATE_ERR });
      toastError({
        title: TeamMessages.TEAM_ERR_MSG,
        description: TeamMessages.TEAM_UPDATE_ERR,
      });
    }
  };

  const handleEditClick = (team) => {
    setEditingTeam(team);
    setSelectedStream(team.stream);
    setSelectedSubStreams(team.subStreams);

    // Reset form values to the selected team's data
    form.setFieldsValue({
      teamTitle: team.teamTitle,
      stream: team.stream,
      subStreams: team.subStreams,
      teamDescriptions: team.teamDescriptions,
    });

    setEditModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteTeam(teamIdToDelete);
      setDeleteModalVisible(false);
      setTeamList((prevList) =>
        prevList.filter((team) => team._id !== teamIdToDelete)
      );
      // notification.success({ message: TeamMessages.TEAM_DELETE_MSG, description: TeamMessages.TEAM_DELETE_SUCC });
      toastSuccess({
        title: TeamMessages.TEAM_DELETE_MSG,
        description: TeamMessages.TEAM_DELETE_SUCC,
      });
    } catch (error) {
      console.error(TeamMessages.TEAM_DELETE_ERR, error);
    }
  };

  return (
    <motion.div
      className="container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div className="ghost-div hidden lg:block"></div>
        <div className="flex flex-col lg:flex-row justify-between items-center flex-1 !mt-16 md:!mt-2 lg:!mt-2">
          <h1 className="!text-center text-2xl lg:!text-[32px] text-primary-text font-rubik font-semibold !p-0 !mt-2 !mb-[18px] !w-auto">
            Teams in {workspacename}
          </h1>
          <Button
            className="custom-button !font-inter !w-full lg:!w-auto"
            size="large"
            icon={<AiOutlineUsergroupAdd />}
            onClick={() => setAddModal(true)}
          >
            Create Team
          </Button>
        </div>
      </div>

      <Table
        scroll={{ x: "max-content" }}
        loading={dataLoader}
        columns={[
          {
            title: "Team Title",
            dataIndex: "teamTitle",
            render: (text) => <Text strong>{text}</Text>,
          },
          {
            title: "Team Description",
            dataIndex: "teamDescriptions",
            render: (text) => <Text strong>{text}</Text>,
          },
          {
            title: "Actions",
            key: "actions",
            render: (text, record) => (
              <motion.div className="d-flex align-items-center justify-content-start gap-2">
                <Button
                  shape="circle"
                  size="large"
                  // style={{ marginLeft: "10px" }}
                  onClick={() => handleEditClick(record)}
                  icon={<AiOutlineEdit />}
                />
                <Button
                  onClick={() => handleViewClick(record)}
                  shape="circle"
                  size="large"
                  icon={<MdVisibility />}
                ></Button>
                <Button
                  shape="circle"
                  danger
                  size="large"
                  onClick={() => {
                    setTeamIdToDelete(record._id);
                    setDeleteModalVisible(true);
                  }}
                  icon={<AiOutlineDelete />}
                />
              </motion.div>
            ),
          },
        ]}
        dataSource={teamList.map((team) => ({ ...team, key: team._id }))}
        pagination={{ pageSize: 6 }}
        bordered
        className="mt-4 rounded-[10px] overflow-hidden"
      />

      <Modal
        title={`Streams of ${selectedTeamTitle}`}
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
      >
        <Table
          dataSource={subStreams.map((sub) => ({ ...sub, key: sub._id }))}
          columns={[
            { title: "Stream", dataIndex: "stream" },
            { title: "Sub-Stream", dataIndex: "subStreams" },
          ]}
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      <Modal
        title="Create Team"
        open={addModal}
        onCancel={() => setAddModal(false)}
        footer={null}
      >
        <Form layout="vertical" form={form} onFinish={handleCreateTeam}>
          <Form.Item
            label="Team Title"
            name="teamTitle"
            rules={[{ required: true, message: TeamMessages.TEAM_TITLE }]}
          >
            <Input placeholder="Enter team title" />
          </Form.Item>

          <Form.Item
            label="Team Description"
            name="teamDescriptions"
            rules={[{ required: true, message: TeamMessages.TEAM_DESCRIPTION }]}
          >
            <Input placeholder="Enter team descrptions" />
          </Form.Item>

          {/* Stream and Substreams inside a flex container */}
          <div className="flex gap-2.5">
            <Form.Item label="Select Stream" className="flex-1">
              <Select
                placeholder="Select a Stream"
                onChange={handleStreamChange}
                value={selectedStream}
              >
                {streams.map((stream) => (
                  <Option key={stream._id} value={stream.streamTitle}>
                    {stream.streamTitle}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            {selectedStream && (
              <Form.Item label="Select Substreams" className="flex-1">
                <Select
                  mode="multiple"
                  placeholder="Select Substreams"
                  value={selectedSubStreams}
                  onChange={setSelectedSubStreams}
                >
                  {subStreams.map((sub) => (
                    <Option key={sub._id} value={sub.subStreamTitle}>
                      {sub.subStreamTitle}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
          </div>

          <Button className="custom-button" type="primary" htmlType="submit">
            Create Team
          </Button>
        </Form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <Title level={4} className="mb-0">
            Confirm Deletion
          </Title>
        }
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okButtonProps={{ className: "custom-button" }}
        className={!{ danger: true } ? "custom-button" : ""}
        centered
      >
        <Text>
          Are you sure you want to delete this team? This action cannot be
          undone.
        </Text>
      </Modal>

      {/* Edit Team Modal */}
      <Modal
        title="Edit Team"
        open={editModal}
        onCancel={() => setEditModal(false)}
        footer={null}
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleEditTeam}
          initialValues={{ teamTitle: editingTeam?.teamTitle }}
        >
          <Form.Item
            label="Team Title"
            name="teamTitle"
            rules={[{ required: true, message: TeamMessages.TEAM_TITLE }]}
          >
            <Input placeholder="Enter team title" />
          </Form.Item>
          <Form.Item
            label="Team Descriptions"
            name="teamDescriptions"
            rules={[{ required: true, message: TeamMessages.TEAM_DESCRIPTION }]}
          >
            <Input placeholder="Enter team descriptions" />
          </Form.Item>
          <Form.Item label="Select Stream">
            <Select
              placeholder="Select a Stream"
              onChange={handleStreamChange}
              value={selectedStream}
            >
              {streams.map((stream) => (
                <Option key={stream._id} value={stream.streamTitle}>
                  {stream.streamTitle}
                </Option>
              ))}
            </Select>
          </Form.Item>
          {selectedStream && (
            <Form.Item label="Select Substreams">
              <Select
                mode="multiple"
                placeholder="Select Substreams"
                value={selectedSubStreams}
                onChange={setSelectedSubStreams}
              >
                {subStreams.map((sub) => (
                  <Option key={sub._id} value={sub.subStreamTitle}>
                    {sub.subStreamTitle}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Button className="custom-button" type="primary" htmlType="submit">
            Update Team
          </Button>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default ListTeams;
