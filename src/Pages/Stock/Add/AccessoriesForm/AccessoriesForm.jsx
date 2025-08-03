import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { AiFillCloseCircle } from "react-icons/ai";
import "./AccessoriesForm.scss";
const AccessoriesForm = ({ handleCloseOption, show = "false", values, errors, handleChange, touched, isValid }) => {
  return (
    <>
      {/* <Form>
        <Row>
          <Col sm={12} md={6} lg={6} xl={5}>
            <FloatingLabel controlId="floatingMouseType" label="Accessories Type" className="mb-3">
              <Form.Control type="text" placeholder="Type eg. Mouse" />
            </FloatingLabel>
          </Col>
        </Row>
      </Form> */}
    </>
  );
};

export default AccessoriesForm;
