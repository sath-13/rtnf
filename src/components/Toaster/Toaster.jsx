import React from "react";
import { Toast, ToastContainer } from "react-bootstrap";
import { BiCheckCircle } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
export const Toaster = ({ title, bg, showToaster, setShowToaster, to }) => {
  const navigate = useNavigate();
  return (
    <ToastContainer position="bottom-end" className="me-5 mb-5">
      <Toast
        bg={bg}
        onClose={() => {
          navigate(`/${to}`, { replace: true });
          setShowToaster(!showToaster);
        }}
        show={showToaster}
        delay={2000}
        autohide
      >
        <div className="info-container d-flex align-items-center">
          &nbsp;
          <BiCheckCircle className="info-icon ms-3 text-white fs-5" />
          <Toast.Body className={`${bg} text-white`}>{title}</Toast.Body>
        </div>
      </Toast>
    </ToastContainer>
  );
};
