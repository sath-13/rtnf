import React, { useState, useEffect, useRef, useCallback } from "react";
import { Table, Button, Modal, Typography, Input } from "antd";
import { AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import {
  createStream,
  deleteStream,
  getAllStreams,
  updateStream,
} from "../../../api/streamapi";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CloudUploadOutlined } from "@ant-design/icons";
import { MdVisibility } from "react-icons/md";
import SubStreamAdditionForm from "./SubStreamAddition";
import {
  getAllSubStreams,
  deleteSubStreams,
  updateSubStreams,
} from "../../../api/substreamsapi";
import { StreamMessages } from "../../../constants/constants";
import { toastError, toastSuccess } from "../../../Utility/toast";

const { Title, Text } = Typography;

const ListStreams = () => {
  const { workspacename } = useParams();
  const [streamList, setStreamList] = useState([]);
  const [dataLoader, setDataLoader] = useState(false);
  const [isFormVisible, setFormVisible] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  // const [subStreamTitle, setSubStreamTitle] = useState("");
  const [, setDeleteModalVisible] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedStream, setSelectedStream] = useState(null);
  const [selectedSubStream, setSelectedSubStream] = useState(null);
  const [selectedStreamTitle, setSelectedStreamTitle] = useState(null);
  const [editStreamModal, setEditStreamModal] = useState(false);
  const [editSubStreamModal, setEditSubStreamModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [subStreams, setSubStreams] = useState([]);

  // useEffect(() => {
  //   fetchStreams();
  // }, [addModal, workspacename]);

  const isCreatingPersonalStream = useRef(false);

  const fetchStreams = useCallback(async () => {
    try {
      setDataLoader(true);
      const response = await getAllStreams(workspacename);
      const streams = response?.data || [];

      setStreamList(streams);

      if (
        !streams.some((stream) => stream.streamTitle === "Personal_Stream") &&
        !isCreatingPersonalStream.current
      ) {
        isCreatingPersonalStream.current = true;
        await createStream({
          streamTitle: "Personal_Stream",
          workspaceName: workspacename,
        });
        isCreatingPersonalStream.current = false;
      }
    } catch (error) {
      // notification.error({ message: StreamMessages.ERR_MSG, description: StreamMessages.STREAM_FETCH_ERR });
      toastError({
        title: StreamMessages.ERR_MSG,
        description: StreamMessages.STREAM_FETCH_ERR,
      });
    } finally {
      setDataLoader(false);
    }
  }, [workspacename]);

  useEffect(() => {
    fetchStreams();
  }, [
    // streamList.length,
    fetchStreams,
  ]); // Trigger when stream list changes

  const fetchSubStreams = async (streamTitle) => {
    try {
      setSelectedStreamTitle(streamTitle); // Set the stream title here
      const response = await getAllSubStreams(streamTitle, workspacename);
      setSubStreams(response?.data);
      setViewModal(true);
    } catch (error) {
      // notification.error({ message: StreamMessages.ERR_MSG, description: StreamMessages.SUBSTREAM_FETCH_ERR });
      toastError({
        title: StreamMessages.ERR_MSG,
        description: StreamMessages.SUBSTREAM_FETCH_ERR,
      });
      console.error(error);
    }
  };

  const handleCreateStream = async () => {
    try {
      const newStream = await createStream({
        streamTitle,
        workspaceName: workspacename,
      });

      // Close modal and clear input
      setAddModal(false);
      setStreamTitle("");
      // notification.success({ message: StreamMessages.SUCC_MSG, description: StreamMessages.STREAM_CREATE_SUCC });
      toastSuccess({
        title: StreamMessages.SUCC_MSG,
        description: StreamMessages.STREAM_CREATE_SUCC,
      });

      // Update stream list manually instead of calling fetchStreams()
      setStreamList((prevStreams) => [...prevStreams, newStream.data.stream]);
    } catch (error) {
      const errorMsg = error.response?.data?.msg || "Something went wrong!";
      // notification.error({ message: StreamMessages.ERR_MSG, description: errorMsg });
      toastError({ title: StreamMessages.ERR_MSG, description: errorMsg });
      console.error(error);
    }
  };

  const handleDeleteSubStream = async (id) => {
    try {
      await deleteSubStreams(id);
      setSubStreams(subStreams.filter((sub) => sub._id !== id));
      // notification.success({
      //   message: StreamMessages.DEL_MSG,
      //   description: StreamMessages.SUBSTREAM_DELETE_SUCC,
      //   duration: 2
      // });
      toastSuccess({
        title: StreamMessages.DEL_MSG,
        description: StreamMessages.SUBSTREAM_DELETE_SUCC,
      });
    } catch (error) {
      // notification.error({ message: StreamMessages.ERR_MSG, description: StreamMessages.SUBSTREAM_DELETE_ERR });
      toastError({
        title: StreamMessages.ERR_MSG,
        description: StreamMessages.SUBSTREAM_DELETE_ERR,
      });
      console.error(error);
    }
  };

  const handleDeleteStream = async (id) => {
    try {
      await deleteStream(id);
      setStreamList((prevStreams) =>
        prevStreams.filter((stream) => stream._id !== id)
      );
      // notification.success({
      //   message: StreamMessages.DEL_MSG,
      //   description: StreamMessages.STREAM_DELETE_SUCC,
      //   duration: 2
      // });
      toastSuccess({
        title: StreamMessages.DEL_MSG,
        description: StreamMessages.STREAM_DELETE_SUCC,
      });
    } catch (error) {
      // notification.error({ message: StreamMessages.ERR_MSG, description: StreamMessages.STREAM_DELETE_ERR });
      toastError({
        title: StreamMessages.ERR_MSG,
        description: StreamMessages.STREAM_DELETE_ERR,
      });
      console.error(error);
    }
  };

  const handleUpdateStream = async () => {
    if (selectedStream) {
      try {
        await updateStream(selectedStream._id, {
          streamTitle: selectedStream.streamTitle,
        });
        // notification.success({
        //   message: StreamMessages.SUCC_MSG,
        //   description: StreamMessages.STREAM_UPDATE_SUCC,
        //   duration: 2
        // });
        toastSuccess({
          title: StreamMessages.SUCC_MSG,
          description: StreamMessages.STREAM_UPDATE_SUCC,
        });
        setEditStreamModal(false);
        fetchStreams();
      } catch (error) {
        // notification.error({
        //   message: StreamMessages.ERR_MSG,
        //   description: StreamMessages.STREAM_UPDATE_FAIL_MSG,
        //   duration: 2
        // });
        toastError({
          title: StreamMessages.ERR_MSG,
          description: StreamMessages.STREAM_UPDATE_FAIL_MSG,
        });
        console.error(error);
      }
    }
  };

  const handleUpdateSubStream = async () => {
    if (selectedSubStream) {
      try {
        await updateSubStreams(selectedSubStream._id, {
          subStreamTitle: selectedSubStream.subStreamTitle,
          description: selectedSubStream.description,
        });
        // notification.success({
        //   message: StreamMessages.SUCC_MSG,
        //   description: StreamMessages.SUBSTREAM_UPDATE_SUCC,
        //   duration: 2
        // });
        toastSuccess({
          title: StreamMessages.SUCC_MSG,
          description: StreamMessages.SUBSTREAM_UPDATE_SUCC,
        });

        setSubStreams((prevSubStreams) =>
          prevSubStreams.map((sub) =>
            sub._id === selectedSubStream._id
              ? { ...sub, ...selectedSubStream }
              : sub
          )
        );

        setEditSubStreamModal(false);
      } catch (error) {
        // notification.error({
        //   message: StreamMessages.ERR_MSG,
        //   description: StreamMessages.SUB_STREAM_UPDATE_FAIL_MSG,
        //   duration: 2
        // });
        toastError({
          title: StreamMessages.ERR_MSG,
          description: StreamMessages.SUB_STREAM_UPDATE_FAIL_MSG,
        });
        console.error(error);
      }
    }
  };

  const handleEditSubStream = (substream) => {
    setSelectedSubStream({ ...substream }); // Ensures reactivity
    setEditSubStreamModal(true);
  };

  const handleEditStream = (stream) => {
    setSelectedStream({ ...stream }); // Ensures reactivity
    setEditStreamModal(true);
  };

  const columns = [
    {
      title: "Stream Title",
      dataIndex: "streamTitle",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (text, record) =>
        record.streamTitle === "Personal_Stream" ? (
          <Text type="secondary">No Actions Available</Text>
        ) : (
          <motion.div className="d-flex align-items-center gap-2">
            <Button
              className="custom-button"
              // style={{ marginRight: 10 }}
              onClick={() => {
                setSelectedStreamTitle(record.streamTitle);
                setFormVisible(true);
              }}
            >
              Add SubStreams
            </Button>
            <Button
              // style={{ marginRight: 10 }}
              onClick={() => fetchSubStreams(record.streamTitle)}
              shape="circle"
              size="large"
              icon={<MdVisibility />}
            />
            <Button
              onClick={() => handleEditStream(record)}
              shape="circle"
              size="large"
              icon={<AiOutlineEdit />}
            />
            <Button
              shape="circle"
              danger
              size="large"
              onClick={() => {
                handleDeleteStream(record._id);
                setDeleteModalVisible(true);
              }}
              icon={<AiOutlineDelete />}
            />
          </motion.div>
        ),
    },
  ];


  //   .content{
  //   display: flex;
  //   justify-content: space-between;
  //   align-items: center;
  //   flex:1
  // }
  return (
    <motion.div
      className="container mt-[100px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}

    >
      <div className="flex items-center justify-between">
        <div className="ghost-div hidden lg:block"></div>
        <div className="flex flex-col lg:flex-row justify-between items-center flex-1 !mt-16 md:!mt-2 lg:!mt-2">
          <h1 className="!text-center text-2xl lg:!text-[32px] text-primary-text font-rubik font-semibold !p-0 !mt-2 !mb-[18px] w-auto">
            Streams in {workspacename}
          </h1>
          <Button
            className="custom-button !font-inter w-full lg:!w-auto"
            size="large"
            icon={<CloudUploadOutlined />}
            onClick={() => setAddModal(true)}
          >
            Create Stream
          </Button>
        </div>
      </div>

      <Table
        loading={dataLoader}
        columns={columns}
        dataSource={streamList.map((stream) => ({
          ...stream,
          key: stream._id,
        }))}
        pagination={{ pageSize: 6 }}
        bordered
        className="mt-4 rounded-[10px] overflow-hidden"
      />


      <Modal
        title="Add SubStreams"
        open={isFormVisible}
        onCancel={() => {
          setFormVisible(false);
          setSelectedStreamTitle(null); // Reset selected stream
        }}
        footer={null}
      >
        <SubStreamAdditionForm
          onClose={() => {
            setFormVisible(false);
            setSelectedStreamTitle(null); // Reset selected stream
          }}
          streamTitle={selectedStreamTitle}
        />
      </Modal>

      <Modal
        okButtonProps={{ className: "custom-button" }}
        title="Edit Stream Title"
        open={editStreamModal}
        onOk={handleUpdateStream}
        onCancel={() => setEditStreamModal(false)}
      >
        <Input
          value={selectedStream?.streamTitle}
          onChange={(e) =>
            setSelectedStream({
              ...selectedStream,
              streamTitle: e.target.value,
            })
          }
        />
      </Modal>

      <Modal
        title={`Edit Sub-Stream of ${selectedSubStream?.subStreamTitle}`}
        open={editSubStreamModal}
        onOk={handleUpdateSubStream}
        onCancel={() => setEditSubStreamModal(false)}
      >
        <Input
          placeholder="Sub-Stream Title"
          value={selectedSubStream?.subStreamTitle}
          onChange={(e) =>
            setSelectedSubStream({
              ...selectedSubStream,
              subStreamTitle: e.target.value,
            })
          }
        />
        <Input
          placeholder="Description"
          value={selectedSubStream?.description}
          onChange={(e) =>
            setSelectedSubStream({
              ...selectedSubStream,
              description: e.target.value,
            })
          }
          className="mt-2.5" // 10px ~ 2.5 * 4px
        />
      </Modal>

      <Modal
        title={`Sub-Streams of ${selectedStreamTitle}`}
        open={viewModal}
        onCancel={() => setViewModal(false)}
        footer={null}
        width={800}
      >
        <Table
          dataSource={subStreams.map((sub) => ({ ...sub, key: sub._id }))}
          columns={[
            { title: "Sub-Streams Title", dataIndex: "subStreamTitle" },
            { title: "Description", dataIndex: "description" },
            {
              title: "Actions",
              render: (text, record) => (
                <>
                  <Button
                    onClick={() => handleEditSubStream(record)}
                    shape="circle"
                    size="large"
                    icon={<AiOutlineEdit />}
                  />
                  <Button
                    danger
                    onClick={() => handleDeleteSubStream(record._id)}
                  >
                    <AiOutlineDelete />
                  </Button>
                </>
              ),
            },
          ]}
          pagination={{ pageSize: 5 }}
        />
      </Modal>

      {/* Create Stream Modal */}
      <Modal
        title={
          <Title level={4} className="mb-0">
            Create Stream
          </Title>
        }
        open={addModal}
        onOk={handleCreateStream}
        onCancel={() => {
          setAddModal(false);
          setStreamTitle(""); // Reset input when modal closes
        }}
        okButtonProps={{
          disabled: !streamTitle || streamTitle.length < 4,
          className: streamTitle.length >= 4 ? "custom-button" : "",
        }}
        centered
      >
        <Input
          placeholder="Enter stream title"
          value={streamTitle}
          onChange={(e) => setStreamTitle(e.target.value)}
          size="large"
          className="mb-3 rounded-lg"
        />
        <Text type="secondary">
          <i>
            Minimum length should be 4 characters and Stream title should be
            unique.
          </i>
        </Text>
      </Modal>
    </motion.div>
  );
};

export default ListStreams;
