import React, { useState, useRef } from "react";
import { Form, Input, DatePicker, Row, Col, Button, Select } from "antd";

const { Option } = Select;

const ProductEditForm = ({ form }) => {
  const [showSystemDetails, setShowSystemDetails] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  return (
    <Form form={form} layout="vertical">
      {/* Section 1: Asset Details */}
      <h5 className="mb-3 mt-4 fw-semibold">Asset Details</h5>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Asset Category" name="productCategoryName">
            <Input placeholder="Category Name" disabled />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Asset Type" name="productTypeName">
            <Input placeholder="Enter Asset Type" disabled />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Serial Number" name="serialNumber">
            <Input placeholder="Serial Number" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Asset Name" name="accessoriesName">
            <Input placeholder="Enter accessory name" />
          </Form.Item>
        </Col>
      </Row>

      {/* Section 2: Toggle Asset Description */}
      <Row gutter={16}>
        <Col xs={24}>
          <Button
            type="dashed"
            onClick={() => setShowDescription(!showDescription)}
            className="!mb-3"
          >
            {showDescription ? "- Hide" : "+ Add"} Description
          </Button>
          {showDescription && (
            <Form.Item label="Asset Description" name="assetDescription">
              <Input.TextArea
                rows={3}
                placeholder="Enter asset description (optional)"
              />
            </Form.Item>
          )}
        </Col>
      </Row>

      {/* Toggle System Details Section */}
      <Row gutter={16}>
        <h5 className="mb-3 mt-4 fw-semibold">System Details</h5>
        <Col span={24}>
          <Button
            type="dashed"
            onClick={() => setShowSystemDetails(!showSystemDetails)}
            className="!mb-3"
          >
            {showSystemDetails ? "- Remove System Details" : "+ Add System Details"}
          </Button>
        </Col>
      </Row>

      {/* Optional System Details */}
      {showSystemDetails && (
        <>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="System Brand" name="systemBrand">
                <Input placeholder="System Brand" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="System Model" name="systemModel">
                <Input placeholder="System Model" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Operating System" name="os">
                <Input placeholder="Operating System" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="CPU" name="cpu">
                <Input placeholder="CPU" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="RAM" name="ram">
                <Input placeholder="RAM" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Storage Type" name="storageType">
                <Input placeholder="Storage Type" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Storage Capacity" name="storageCapacity">
                <Input placeholder="Storage Capacity" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="MAC Address" name="macAddress">
                <Input placeholder="MAC Address" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="IP Address" name="ipAddress">
                <Input placeholder="IP Address" />
              </Form.Item>
            </Col>
          </Row>
        </>
      )}

      {/* Section 3: Purchase & Warranty */}
      <h5 className="mb-3 mt-4 fw-semibold">Purchase & Warranty</h5>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Date of Purchase" name="dateOfPurchase">
            <DatePicker
              className="!w-full"
              placeholder="Select Date"
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Warranty Period" name="warrantyPeriod">
            <Input placeholder="Warranty Period (months)" />
          </Form.Item>
        </Col>
      </Row>

      {/* Section 3: Branch */}
      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Location"
            name="branch"
          >
            <Input placeholder="Location" disabled />
          </Form.Item>
        </Col>
      </Row>

      {/* Section 4: Asset Metadata */}
      <h5 className="mb-3 mt-4 fw-semibold">Asset Condition and Status</h5>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item label="Asset Condition" name="assetCondition">
            <Select placeholder="Select Condition">
              <Option value="Excellent">Excellent</Option>
              <Option value="Good">Good</Option>
              <Option value="Fair">Fair</Option>
              <Option value="Poor">Poor</Option>
            </Select>
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Asset Status" name="assetStatus">
            <Select placeholder="Select Status">
              <Option value="Available">Available</Option>
              <Option value="Assigned">Assigned</Option>
              <Option value="Not Available">Not Available</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      {/* Section 5: Attachments */}
      <h5 className="mb-3 mt-4 fw-semibold">Attachments</h5>
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="assetImage"
            label="Asset Image"
            valuePropName="file"
            getValueFromEvent={(e) => e?.target?.files?.[0]}
          >
            <Input type="file" accept="image/*" />
          </Form.Item>

        </Col>
        <Col span={12}>
          <Form.Item
            name="assetDocument"
            label="Asset Document"
            valuePropName="file"
            getValueFromEvent={(e) => e?.target?.files?.[0]}
          >
            <Input
              type="file"
              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
            />
          </Form.Item>

        </Col>
      </Row>
    </Form>
  );
};

export default ProductEditForm;
