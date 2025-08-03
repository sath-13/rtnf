import React, { useState, useEffect } from "react";
import { Modal, Upload, Button, notification } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import * as XLSX from "xlsx";
import { importUsers } from "../../../api/usersapi";
import { UserMessages } from "../../../constants/constants";
import { toastError, toastSuccess, toastWarning } from "../../../Utility/toast";

const { Dragger } = Upload;

const expectedHeaders = [
  "fname",
  "lname",
  "username",
  "email",
  "password",
  "confirmPassword",
  "teamTitle",
  "role",
  "branch",
  "status",
  "jobRole",
  "userLogo",
  "companyId",
  "imported",
  "directManager",
  "dottedLineManager",
  "workspaceName",
];

const UserImportModal = ({ visible, onClose, refreshUsers, workspacename }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!visible) {
      setFile(null);
    }
  }, [visible]);

  const validateExcelHeader = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        const headers = json[0]?.map((h) => h?.toString()?.trim());

        const isValid =
          headers &&
          headers.length === expectedHeaders.length &&
          headers.every((val, index) => val === expectedHeaders[index]);

        if (!isValid) {
          reject(
            "Invalid file format. Please match the name and order of columns in the sample file."
          );
        } else {
          resolve();
        }
      };
      reader.onerror = () => reject("Failed to read file.");
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileChange = async (info) => {
    const file = info.file;
    if (!file) return;

    try {
      await validateExcelHeader(file);
      setFile(file);
    } catch (err) {
      // notification.error({
      //   message: "File Validation Failed",
      //   description: err,
      // });
      toastError({ title: "File Validation Failed", description: err });
      setFile(null); // clear the file if invalid
    }
  };

  const beforeUpload = (file) => {
    const isExcel =
      file.type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";

    if (!isExcel) {
      // notification.warning({
      //   message: UserMessages.INVALID_FILE_TYPE,
      //   description: UserMessages.FILE_EXTENSION_ALLOWED,
      // });
      toastWarning({
        title: UserMessages.INVALID_FILE_TYPE,
        description: UserMessages.FILE_EXTENSION_ALLOWED,
      })
      return Upload.LIST_IGNORE;
    }

    return false; // prevent auto upload
  };

  const handleUpload = async () => {
    if (!file) {
      // notification.error({ message: UserMessages.SELECT_FILE_TO_UPLOAD });
      toastError({
        title: "Error",
        description: UserMessages.SELECT_FILE_TO_UPLOAD,
      });
      return;
    }

    if (!workspacename) {
      // notification.error({ message: UserMessages.WORKSPACENAME_MISSING });
      toastError({
        title: "Error",
        description: UserMessages.WORKSPACENAME_MISSING,
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("workspaceName", workspacename);

    setUploading(true);
    try {
      const response = await importUsers(formData);

      // notification.success({
      //   message: response?.message || UserMessages.USER_IMPORT_SUCC,
      // });
      toastSuccess({
        title: "Success",
        description: response?.message || UserMessages.USER_IMPORT_SUCC,
      });
      refreshUsers();
      onClose();
    } catch (error) {
      // notification.error({
      //   message: UserMessages.IMPORT_USERS_ERR,
      //   description: error.response?.data?.message || error.message,
      // });
      toastError({
        title: UserMessages.IMPORT_USERS_ERR,
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    window.location.href = "/templates/Sample_file.xlsx";
  };

  return (
    <Modal
      title="Import Users"
      open={visible}
      onCancel={onClose}
      footer={null}
      afterClose={() => setFile(null)}
    >
      <Dragger
        beforeUpload={beforeUpload}
        onChange={handleFileChange}
        accept=".xls,.xlsx"
        fileList={file ? [file] : []}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">
          Click or drag an Excel file to this area to upload
        </p>
        <p className="ant-upload-hint">Only .xls or .xlsx files are allowed.</p>
      </Dragger>

      <Button
        className={`${file && "custom-button"} !mt-2.5 !w-full`}
        type="primary"
        onClick={handleUpload}
        disabled={!file}
        loading={uploading}
      >
        Upload
      </Button>

      <Button className="custom-button !mt-2.5 !w-full" onClick={handleDownloadTemplate}>
        Download Sample File
      </Button>
    </Modal>
  );
};

export default UserImportModal;
