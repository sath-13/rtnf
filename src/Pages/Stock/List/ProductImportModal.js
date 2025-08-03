import React, { useState, useEffect } from 'react';
import { Modal, Upload, Button, notification } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { importProductData } from '../../../api/productapi';
import { ImportMessages } from '../../../constants/constants';
import { toastError, toastSuccess, toastWarning } from '../../../Utility/toast';

const { Dragger } = Upload;

const ProductImportModal = ({ visible, onClose, refreshProducts, workspacename }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!visible) setFile(null);
  }, [visible]);

  const beforeUpload = (file) => {
    const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel';
    if (!isExcel) {
      // notification.warning({
      //   message: ImportMessages.INVALID_FILE_TYPE,
      //   description: 'Only Excel (.xls, .xlsx) files are allowed.',
      // });
      toastWarning({
        title: ImportMessages.INVALID_FILE_TYPE,
        description: 'Only Excel (.xls, .xlsx) files are allowed.',
      })
      return false;
    }
    setFile(file);
    return false;
  };

  const handleDownloadTemplate = () => {
    window.location.href = "/templates/sample_products.xlsx";
  };

  const handleFileChange = (info) => {
    if (info.file) setFile(info.file);
  };

  const handleUpload = async () => {
    if (!file) {
      // notification.error({ message: ImportMessages.SELECT_FILE_TO_UPLOAD });
      toastError({ title: "Error", description: ImportMessages.SELECT_FILE_TO_UPLOAD });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append("workspacename", workspacename);

    setUploading(true);
    try {
      const response = await importProductData(formData);
      // notification.success({ message: response.message || ImportMessages.PRODUCTS_IMPORTED_SUCC });
      toastSuccess({ title: "Success", description: response.message || ImportMessages.PRODUCTS_IMPORTED_SUCC });
      refreshProducts?.(); // If passed, refresh data
      onClose();
    } catch (error) {
      // notification.error({
      //   message: ImportMessages.IMPORT_FAILED,
      //   description: error?.response?.data?.message || error.message,
      // });
      toastError({ title: ImportMessages.IMPORT_FAILED, description: error?.response?.data?.message || error.message });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      title="Import Products"
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
        <p className="ant-upload-drag-icon"><InboxOutlined /></p>
        <p className="ant-upload-text">Click or drag an Excel file to upload</p>
        <p className="ant-upload-hint">Only .xls or .xlsx files are allowed.</p>
      </Dragger>

      <Button
        className={`${file && "custom-button"} !mt-2.5 !w-full`}
        type="primary"
        onClick={handleUpload}
        loading={uploading}
        disabled={!file}
      >
        Upload
      </Button>

      <Button
        className='custom-button !mt-2.5 !w-full'
        onClick={handleDownloadTemplate}
      >
        Download Sample File
      </Button>

    </Modal>
  );
};

export default ProductImportModal;
