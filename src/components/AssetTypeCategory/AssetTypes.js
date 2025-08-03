import React, { useState } from "react";
import {
  Typography,
  Button,
  Modal,
  Input,
  Table,
  Space,
  Tooltip,
  message,
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { AssetMessages } from '../../constants/constants';
import { toastError, toastSuccess } from '../../Utility/toast';

const { Title, Paragraph } = Typography;

const AssetTypes = ({
  selectedCategory,
  types,
  newType,
  setNewType,
  handleAddType,
  handleEditType,
  handleDeleteType,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [editRecord, setEditRecord] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const handleSubmit = () => {
    if (!newType.trim()) return toastError({ title: "Error", description: "Please enter a type name." }); //message.error('Please enter a type name.');
    handleAddType({ name: newType, description });
    setNewType("");
    setDescription("");
    setIsAddModalOpen(false);
    // message.success('Asset type added successfully!');
    toastSuccess({ title: "Success", description: "Asset type added successfully!" });
  };

  const openEditModal = (record) => {
    setEditRecord(record);
    setEditName(record.name);
    setEditDescription(record.description || "");
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editName.trim()) return toastError({ title: "Error", description: AssetMessages.ASSET_TYPENAME_REQ }); //message.error(AssetMessages.ASSET_TYPENAME_REQ);
    await handleEditType({ ...editRecord, name: editName, description: editDescription });
    setIsEditModalOpen(false);
    // message.success(AssetMessages.ASSET_TYPE_UPDATE_SUCC);
    toastSuccess({ title: "Success", description: AssetMessages.ASSET_TYPE_UPDATE_SUCC });
  };

  if (!selectedCategory) return null;

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "-",
    },
    {
      title: "Asset Count",
      dataIndex: "assetCount",
      align: "center",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit">
            <Button
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDeleteType(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <main className="p-4 w-full lg:w-4/5" >
      <Title level={4}>
        {selectedCategory.name || "Asset Category and Types"}
      </Title>
      <Paragraph type="secondary">
        {selectedCategory.description || "No description"}
      </Paragraph>

      <Button
        className="custom-button !mb-4"
        type="primary"
        onClick={() => setIsAddModalOpen(true)}
      >
        + Add Asset Type
      </Button>

      <Table
        className="!border !border-border-color rounded-lg"
        scroll={{ x: "max-content" }}
        columns={columns}
        dataSource={types.map((type) => ({ ...type, key: type._id }))}
        pagination={false}
        bordered
      />

      {/* Add Modal */}
      <Modal
        title="Add New Asset Type"
        open={isAddModalOpen}
        onCancel={() => setIsAddModalOpen(false)}
        onOk={handleSubmit}
        okText="Add"
        okButtonProps={{ className: "custom-button" }}
      >
        <Input
          placeholder="Enter asset type name"
          value={newType}
          onChange={(e) => setNewType(e.target.value)}
          className="!mb-4"
        />
        <Input.TextArea
          placeholder="Enter description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Edit Asset Type"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onOk={handleEditSubmit}
        okText="Update"
      >
        <Input
          placeholder="Type name"
          value={editName}
          onChange={(e) => setEditName(e.target.value)}
          className="!mb-4"
        />
        <Input.TextArea
          placeholder="Description"
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          rows={3}
        />
      </Modal>
    </main>
  );
};

export default AssetTypes;
