import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Typography, Button, Space, message, Spin } from "antd";
import { getAcknowledgementById, updateAcknowledgementStatus } from "../../api/assetAcknowledgeApi";
import { toastError, toastSuccess } from "../../Utility/toast";

const { Title, Text } = Typography;

const AcknowledgeAssetPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ack, setAck] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcknowledgement = async () => {
      try {
        const data = await getAcknowledgementById(id);
        setAck(data.acknowledgement);
      } catch (err) {
        // message.error("Failed to load acknowledgement");
        toastError({ title: "Error", description: "Failed to load acknowledgement" });
      } finally {
        setLoading(false);
      }
    };
    fetchAcknowledgement();
  }, [id]);

  const handleAction = async (action) => {
    try {
      await updateAcknowledgementStatus(action, id);
      // message.success(`Asset ${action}ed successfully`);
      toastSuccess({ title: "Success", description: `Asset ${action}ed successfully` });
      navigate("/acknowledgement");
    } catch (err) {
      // message.error("Action failed");
      toastError({ title: "Error", description: "Action failed" });
    }
  };

  if (loading) return <Spin />;

  if (!ack) return <Text>Invalid acknowledgement ID</Text>;

  return (
    <div className="max-w-[600px] mx-auto p-6">
      <Title level={3}>Acknowledge Asset</Title>
      <Space direction="vertical" size="middle">
        <Text><strong>Asset:</strong> {ack.accessoriesName}</Text>
        <Text><strong>Type:</strong> {ack.productTypeName}</Text>
        <Text><strong>Assigned To:</strong> {ack.firstName} {ack.lastName} ({ack.email})</Text>
        <Text><strong>Status:</strong> {ack.status.toUpperCase()}</Text>
        {ack.status === "pending" && (
          <Space>
            <Button type="primary" onClick={() => handleAction("accept")}>Accept</Button>
            <Button danger onClick={() => handleAction("decline")}>Decline</Button>
          </Space>
        )}
      </Space>
    </div>
  );
};

export default AcknowledgeAssetPage;
