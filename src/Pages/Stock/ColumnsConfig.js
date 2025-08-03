import React from "react";
import { Button } from "antd";
import { DeleteOutlined, UserOutlined, DownloadOutlined, EditOutlined } from "@ant-design/icons";
import axios from "axios";  // Needed for downloadFile function

// Function to download files
const downloadFile = async (fileUrl, fileName) => {
  try {
    const response = await axios.get(fileUrl, {
      responseType: "blob",
    });
    const blob = new Blob([response.data], { type: response.headers["content-type"] });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading file:", error);
    alert("File download failed.");
  }
};

export const getColumns = (
  setShowRemoveDeviceModal,
  removeDeviceIdRef,
  handleUserSelection,
  openEditModal
) => {
  return [
    { title: "Product Category", dataIndex: "productCategoryName", key: "productCategoryName" },
    { title: "Product Category Id", dataIndex: "productCategory", key: "productCategory" },
    { title: "Location", dataIndex: "branch", key: "branch" },
    { title: "Product Type", dataIndex: "productTypeName", key: "productTypeName" },
    { title: "Product Type Id", dataIndex: "productType", key: "productType" },
    { title: "Asset Name", dataIndex: "accessoriesName", key: "accessoriesName" },
    { title: "Serial Number", dataIndex: "serialNumber", key: "serialNumber" },
    { title: "Date of Purchase", dataIndex: "dateOfPurchase", key: "dateOfPurchase" },
    { title: "Warranty Period", dataIndex: "warrantyPeriod", key: "warrantyPeriod" },
    { title: "Asset Condition", dataIndex: "assetCondition", key: "assetCondition" },
    { title: "Asset Status", dataIndex: "assetStatus", key: "assetStatus" },
    { title: "Asset Description", dataIndex: "assetDescription", key: "assetDescription" },
    { title: "System Brand", dataIndex: "systemBrand", key: "systemBrand" },
    { title: "System Model", dataIndex: "systemModel", key: "systemModel" },
    { title: "Operating System", dataIndex: "operatingSystem", key: "operatingSystem" },
    { title: "RAM", dataIndex: "ram", key: "ram" },
    { title: "Storage", dataIndex: "storage", key: "storage" },
    { title: "MAC Address", dataIndex: "macAddress", key: "macAddress" },
    { title: "IP Address", dataIndex: "ipAddress", key: "ipAddress" },

    // Asset Image - download button
    {
      title: "Asset Image",
      dataIndex: "assetImage",
      key: "assetImage",
      render: (imageUrl) => {
        if (imageUrl) {
          const fileName = imageUrl.split("/").pop();
          return (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(`/${imageUrl}`, fileName)}
              size="small"
            >
              Asset Image
            </Button>
          );
        }
        return <span>No image available</span>;
      },
    },

    // Asset Document - download button
    {
      title: "Asset Document",
      dataIndex: "assetDocument",
      key: "assetDocument",
      render: (documentUrl) => {
        if (documentUrl) {
          const fileName = documentUrl.split("/").pop();
          return (
            <Button
              icon={<DownloadOutlined />}
              onClick={() => downloadFile(`/${documentUrl}`, fileName)}
              size="small"
            >
              Asset Doc
            </Button>
          );
        }
        return <span>No document available</span>;
      },
    },

    { title: "Branch", dataIndex: "branch", key: "branch" },

    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button
            icon={<DeleteOutlined className="!text-red-500" />}
            onClick={() => {
              setShowRemoveDeviceModal(true);
              removeDeviceIdRef.current = record._id;
            }}
            className="!mr-2"
          />
          <Button icon={<EditOutlined />} onClick={() => openEditModal(record._id)} className="!mr-2" />
          <Button
            icon={<UserOutlined />}
            onClick={() => {
              handleUserSelection(record._id);
            }}
          />
        </>
      ),
    },
  ];
};
