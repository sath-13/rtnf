import React, { useState } from "react";
import { Button } from "antd";
import ProductImportModal from "./ProductImportModal"; // adjust the path if needed
import { useParams } from "react-router-dom";

const ImportProductButton = ({ refreshProducts }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const { workspacename } = useParams();

  return (
    <>
      <Button
        className="custom-button !mb-4 lg:!mb-0 "
        type="primary"
        onClick={() => setModalVisible(true)}
      >
        Import Products
      </Button>
      <ProductImportModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        refreshProducts={refreshProducts}
        workspacename={workspacename}
      />
    </>
  );
};

export default ImportProductButton;
