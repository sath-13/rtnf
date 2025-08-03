// src/pages/AcknowledgementPage.jsx

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Tag,
  message,
  Modal,
  Typography,
  Timeline,
  Space,
} from "antd";
import { getAllAcknowledgements } from "../../api/assetAcknowledgeApi";
import { toastError } from "../../Utility/toast";

const { Title, Text } = Typography;

const AcknowledgementPage = () => {
  const [acknowledgements, setAcknowledgements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchAcknowledgements = async () => {
    setLoading(true);
    try {
      const acknowledgements = await getAllAcknowledgements();
      setAcknowledgements(acknowledgements);
    } catch (err) {
      // message.error("Could not load requests");
      toastError({ title: "Error", description: "Could not load requests" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAcknowledgements();
  }, []);

  const formatDate = (iso) => (iso ? new Date(iso).toLocaleString() : "--");

  const handleViewRequest = (record) => {
    setSelectedRequest(record);
    setIsModalVisible(true);
  };

  const columns = [
    { title: "User Email", dataIndex: "email" },
    { title: "Asset Name", dataIndex: "accessoriesName" },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => (
        <Tag
          color={
            s === "accepted" ? "green" : s === "declined" ? "red" : "orange"
          }
        >
          {s.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Actions",
      render: (_, rec) => (
        <Button type="link" onClick={() => handleViewRequest(rec)}>
          View Request
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 className="!text-center !text-2xl lg:!text-[32px] text-primary-text font-rubik font-semibold !p-0 !mt-[14px] !mb-8">
        Asset Acknowledgement Requests
      </h1>
      <Table
        columns={columns}
        dataSource={acknowledgements}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 8 }}
        scroll={{ x: "max-content" }}
        className="border border-border-color rounded-lg"
      />

      <Modal
        title="View Asset Request"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        {selectedRequest && (
          <>
            <Text>
              <strong>Asset:</strong> {selectedRequest.accessoriesName}
            </Text>
            <br />
            <Text>
              <strong>Type:</strong> {selectedRequest.productTypeName}
            </Text>

            <Timeline className="!mt-4">
              <Timeline.Item>
                Requested on: {formatDate(selectedRequest.requestDate)}
              </Timeline.Item>

              {selectedRequest.status !== "pending" && (
                <Timeline.Item
                  color={
                    selectedRequest.status === "accepted" ? "green" : "red"
                  }
                >
                  {selectedRequest.status === "accepted"
                    ? `Accepted on: ${formatDate(selectedRequest.responseDate)}`
                    : `Declined on: ${formatDate(
                      selectedRequest.responseDate
                    )}`}
                </Timeline.Item>
              )}
            </Timeline>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AcknowledgementPage;
