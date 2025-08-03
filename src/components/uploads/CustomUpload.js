import React, { useState, useEffect } from "react";
import { Upload, Button, List, message } from "antd";
import { UploadOutlined, DeleteOutlined, DownloadOutlined } from "@ant-design/icons";
import axios from "axios";
import "./CustomUpload.css";
import { getActionFiles } from "../../api/actionapi";
import { uploadFile } from "../../api/uploadapi";
import { toastError, toastSuccess } from "../../Utility/toast";

const CustomUpload = ({ onFilesSelected, actionId, isViewing }) => {
  const [fileList, setFileList] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Fetch previously uploaded files when viewing an action
  useEffect(() => {
    if (actionId) {
      getActionFiles(actionId)
        .then((files) => {
          setUploadedFiles(files);
        })
        .catch((error) => {
          console.error("Error fetching files:", error);
        });
    }
  }, [actionId]);

  // Handle new file selection for upload
  const handleChange = ({ file, fileList }) => {
    setFileList(fileList);
    setTimeout(() => {
      const filesToSend = fileList.map((f) => f.originFileObj);
      if (onFilesSelected) {
        onFilesSelected(filesToSend);
      }
    }, 100);
  };

  // Handle file removal from upload list
  const handleRemove = (file) => {
    const newFileList = fileList.filter((item) => item.uid !== file.uid);
    setFileList(newFileList);
    onFilesSelected(newFileList.map((f) => f.originFileObj));
  };

  // Upload files to existing action
  const handleUpload = async () => {
    if (!actionId || fileList.length === 0) {
      // message.error("No files selected or invalid action ID");
      toastError({ title: "Error", description: "No files selected or invalid action ID" });
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    try {
      const uploadFiles = await uploadFile(actionId, formData);

      // message.success("Files uploaded successfully");
      toastSuccess({ title: "Success", description: "Files uploaded successfully" });
      setFileList([]);

      // Refresh uploaded files
      getActionFiles(actionId).then((files) => setUploadedFiles(files));
    } catch (error) {
      console.error("Error uploading files:", error);
      // message.error("File upload failed");
      toastError({ title: "Error", description: "File upload failed" });
    }
  };

  // Function to download the file
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

  return (
    <div className="custom-upload-container">
      {/* Show previously uploaded files with download option */}
      {uploadedFiles.length > 0 && (
        <List
          className="file-list"
          header={<strong>Uploaded Files</strong>}
          dataSource={uploadedFiles}
          renderItem={(file) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  icon={<DownloadOutlined />}
                  onClick={() => downloadFile(file.url, file.name)}
                />,
              ]}
            >

              {/* {file.name} */}
              {file.name.replace(/^uploads[\\/]/, "")}

            </List.Item>
          )}
        />
      )}

      {/* File upload section, enabled in both viewing and non-viewing modes */}
      <Upload
        multiple
        beforeUpload={() => false}
        fileList={fileList}
        onChange={handleChange}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />} className="!w-full">
          Select Files
        </Button>
      </Upload>

      {/* Show newly selected files with remove option */}
      {fileList.length > 0 && (
        <List
          className="file-list"
          header={<strong>New Files to Upload</strong>}
          dataSource={fileList}
          renderItem={(file) => (
            <List.Item
              actions={[
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleRemove(file)}
                />,
              ]}
            >
              {/* {file.name} */}
              {file.name.replace(/^uploads[\\/]/, "")}

            </List.Item>
          )}
        />
      )}

      {/* Upload Button */}
      {fileList.length > 0 && (
        <Button type="primary"
          disabled={!actionId}
          onClick={handleUpload} className="!mt-[10px] !w-full">
          Upload Files
        </Button>
      )}
    </div>
  );
};

export default CustomUpload;
