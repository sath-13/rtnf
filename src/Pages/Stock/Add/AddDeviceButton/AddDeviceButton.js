import React, { useState } from "react";
import { Button, Modal } from "antd";
import AccessoriesFormContainer from "../AccessoriesForm";

const AddDeviceButton = ({ deviceCategory, selectedCategory, loadTypes,
}) => {
  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <Button
        className="custom-button w-full !mb-1 lg:!mb-4"
        type="primary"
        onClick={openModal}
      >
        Add {deviceCategory}
      </Button>

      <Modal
        open={showModal}
        onCancel={closeModal}
        footer={null}
        centered
        width={700}
      >
        <AccessoriesFormContainer
          selectedCategory={selectedCategory}
          reloadTypes={loadTypes}
          onClose={closeModal} />
      </Modal>
    </>
  );
};

export default AddDeviceButton;
