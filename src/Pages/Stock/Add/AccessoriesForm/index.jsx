import React, { useState, useEffect, useContext, useRef } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { Form, Input, Button, DatePicker, Row, Col, Select, message } from "antd";
import moment from "moment";
import { StockContext } from "../../../../contexts/StockContext";
import { createProduct } from "../../../../api/productapi";
import { getAllBranches } from "../../../../api/companyapi";
import { useParams } from "react-router-dom";
import { DeviceFormMessages, ValidationMessages } from "../../../../constants/constants";
import { fetchCategories, fetchTypes } from "../../../../api/assetAPI";
import { toastError, toastSuccess } from "../../../../Utility/toast";

const { Option } = Select;

// Validation Schema
const validationSchema = yup.object().shape({
  category: yup.string().required("Category is required"),
  accessoriesType: yup.string().required(ValidationMessages.ACCESSORIES_TYPE_REQ),
  accessoriesName: yup
    .string()
    .min(3, ValidationMessages.ACCESSORY_NAME_LIM)
    .required(ValidationMessages.ACCESSORY_NAME_REQ),
  serialNumber: yup
    .string()
    .matches(/^[a-zA-Z0-9-]+$/, ValidationMessages.SERIAL_NUMBER_PATTERN)
    .required(ValidationMessages.SERIAL_NUMBER_REQ),
  dateOfPurchase: yup
    .date()
    .typeError(ValidationMessages.INV_DATE_FORMAT)
    .required(ValidationMessages.DATE_OF_PURCHASE_REQ),
  warrantyPeriod: yup
    .number()
    .typeError(ValidationMessages.WARRANTY_PERIOD_FORMAT)
    .positive(ValidationMessages.WARRANTY_PERIOD_MIN)
    .required(ValidationMessages.WARRANTY_PERIOD_REQ),
  branch: yup.string().required(ValidationMessages.BRANCH_REQ),
  assetCondition: yup.string().required("Asset condition is required"),
  assetStatus: yup.string().required("Asset status is required"),

  showSystemDetails: yup.boolean(),

  systemBrand: yup.string().when("showSystemDetails", {
    is: true,
    then: (schema) => schema.required("System brand is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  systemModel: yup.string().when("showSystemDetails", {
    is: true,
    then: (schema) => schema.required("System model is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  operatingSystem: yup.string().when("showSystemDetails", {
    is: true,
    then: (schema) => schema.required("Operating system is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  ram: yup.string().when("showSystemDetails", {
    is: true,
    then: (schema) =>
      schema
        .required("RAM is required")
        .matches(/^\d+$/, "RAM must be a number (in GB)"),
    otherwise: (schema) => schema.notRequired(),
  }),

  storage: yup.string().when("showSystemDetails", {
    is: true,
    then: (schema) =>
      schema
        .required("Storage is required")
        .matches(/^\d+$/, "Storage must be a number (in GB)"),
    otherwise: (schema) => schema.notRequired(),
  }),

  macAddress: yup.string().when("showSystemDetails", {
    is: true,
    then: (schema) =>
      schema
        .required("MAC address is required")
        .matches(
          /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/,
          "Invalid MAC address format"
        ),
    otherwise: (schema) => schema.notRequired(),
  }),

  ipAddress: yup.string().when("showSystemDetails", {
    is: true,
    then: (schema) =>
      schema
        .required("IP address is required")
        .matches(
          /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(?!$)|$){4}$/,
          "Invalid IP address"
        ),
    otherwise: (schema) => schema.notRequired(),
  }),
});

const AccessoriesFormContainer = ({ onRefresh, onClose, reloadTypes, selectedCategory }) => {
  const { setDeviceCategory, toggleRefresh } = useContext(StockContext);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [branches, setBranches] = useState([]);
  const { workspacename } = useParams();
  const [showSystemDetails, setShowSystemDetails] = useState(false);
  const [assetTypes, setAssetTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const assetImageRef = useRef(null);
  const assetDocRef = useRef(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await getAllBranches();
        const branchList = Array.isArray(response) ? response : response?.branches ?? [];
        setBranches(branchList);
      } catch (error) {
        // message.error(DeviceFormMessages.FAILED_LOAD_BRANCHED);
        toastError({ title: "Error", description: DeviceFormMessages.FAILED_LOAD_BRANCHED });
      }
    };
    fetchBranches();
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetchCategories();
        const data = Array.isArray(response?.data) ? response.data : [];
        setCategories(data);
      } catch (error) {
        // message.error("Failed to load categories");
        toastError({ title: "Error", description: "Failed to load categories" });
      }
    };
    fetchCategory();
  }, []);


  const initialValues = {
    category: "",
    accessoriesType: "",
    accessoriesName: "",
    serialNumber: "",
    dateOfPurchase: null,
    warrantyPeriod: "",
    branch: branches.length > 0 ? branches[0] : "",
    assetCondition: "",
    assetStatus: "",
    assetDescription: "",
    showDescription: false,
    systemBrand: "",
    systemModel: "",
    operatingSystem: "",
    ram: "",
    storage: "",
    macAddress: "",
    ipAddress: "",
    showSystemDetails: false,
  };

  const handleCategoryChange = async (categoryId, setFieldValue) => {
    setFieldValue("category", categoryId);
    try {
      const response = await fetchTypes(categoryId);
      const data = Array.isArray(response?.data) ? response.data : [];
      setAssetTypes(data);
      setFieldValue("accessoriesType", "");
    } catch (error) {
      // message.error("Failed to fetch types for the selected category");
      toastError({ title: "Error", description: "Failed to fetch types for the selected category" });
    }
  };

  const onSubmit = async (values, { setSubmitting, resetForm }) => {
    setLoadingBtn(true);

    const selectedCategoryObj = categories.find((cat) => cat._id === values.category);
    const selectedTypeObj = assetTypes.find((type) => type._id === values.accessoriesType);

    const formData = new FormData();

    // Append non-file fields
    formData.append("workspacename", workspacename);
    formData.append("productCategory", selectedCategoryObj?._id);
    formData.append("productCategoryName", selectedCategoryObj?.name);
    formData.append("branch", values.branch);
    formData.append("productType", selectedTypeObj?._id);
    formData.append("productTypeName", selectedTypeObj?.name);
    formData.append("accessoriesName", values.accessoriesName);
    formData.append("serialNumber", values.serialNumber);
    formData.append("dateOfPurchase", values.dateOfPurchase);
    formData.append("warrantyPeriod", values.warrantyPeriod);
    formData.append("assetCondition", values.assetCondition);
    formData.append("assetStatus", values.assetStatus);
    if (values.assetDescription) {
      formData.append("assetDescription", values.assetDescription);
    }

    // Append file fields if available
    if (values.assetImage) {
      formData.append("assetImage", values.assetImage);
    }
    if (values.assetDocument) {
      formData.append("assetDocument", values.assetDocument);
    }

    if (values.showSystemDetails) {
      formData.append("systemBrand", values.systemBrand);
      formData.append("systemModel", values.systemModel);
      formData.append("operatingSystem", values.operatingSystem);
      formData.append("ram", values.ram);
      formData.append("storage", values.storage);
      formData.append("macAddress", values.macAddress);
      formData.append("ipAddress", values.ipAddress);
    }
    try {

      const response = await createProduct(formData);

      if (response) {
        setDeviceCategory("Accessories");
        // message.success(DeviceFormMessages.ACCESSORIES_ADD_SUCC);
        toastSuccess({ title: "Success", description: DeviceFormMessages.ACCESSORIES_ADD_SUCC });
        resetForm();
        assetImageRef.current.value = null;
        assetDocRef.current.value = null
        toggleRefresh();
        onRefresh && onRefresh();
        onClose && onClose();

        // 🆕 REFRESH TYPES FOR UPDATED ASSET COUNT
        if (selectedCategory && reloadTypes) {
          reloadTypes(selectedCategory._id);
        }
      }
    } catch (error) {
      // message.error(error.response?.data?.msg || DeviceFormMessages.ADDING_ERR);
      toastError({ title: "Error", description: error.response?.data?.msg || DeviceFormMessages.ADDING_ERR });
    }
    setSubmitting(false);
    setLoadingBtn(false);
  };

  const handleFileChange = (e, fieldName, setFieldValue) => {
    const file = e.target.files[0];

    // Check if file exceeds the 10MB limit 
    if (file && file.size > 10 * 1024 * 1024) {
      alert("File size exceeds the 10MB limit");
      return;
    }

    // Set the selected file to Formik's field value
    setFieldValue(fieldName, file);
  };



  return (
    <div className="p-5">
      <Formik
        validationSchema={validationSchema}
        initialValues={initialValues}
        onSubmit={onSubmit}
        enableReinitialize
      >
        {({ handleSubmit, handleChange, setFieldValue, values, touched, errors }) => (
          <Form layout="vertical" onFinish={handleSubmit}>
            {/* Section 1: Asset Details */}
            <h5 className="mb-3 mt-4 fw-semibold">Asset Details</h5>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Asset Category"
                  validateStatus={touched.category && errors.category ? "error" : ""}
                  help={touched.category && errors.category}
                >
                  <Select
                    name="category"
                    value={values.category}
                    onChange={(value) => handleCategoryChange(value, setFieldValue)}
                    placeholder="Select category"
                  >
                    <Option value="" disabled hidden>Select</Option>
                    {categories.map((cat) => (
                      <Option key={cat._id} value={cat._id}>
                        {cat.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Asset Type"
                  validateStatus={touched.accessoriesType && errors.accessoriesType ? "error" : ""}
                  help={touched.accessoriesType && errors.accessoriesType}
                >
                  <Select
                    name="accessoriesType"
                    value={values.accessoriesType}
                    onChange={(value) => setFieldValue("accessoriesType", value)}
                    placeholder="Select Asset type"
                    disabled={!values.category}
                  >
                    {assetTypes.map((type) => (
                      <Option key={type._id} value={type._id}>
                        {type.name}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Asset Name"
                  validateStatus={touched.accessoriesName && errors.accessoriesName ? "error" : ""}
                  help={touched.accessoriesName && errors.accessoriesName}
                >
                  <Input
                    name="accessoriesName"
                    value={values.accessoriesName}
                    onChange={handleChange}
                    placeholder="Enter accessory name"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Serial Number"
                  validateStatus={touched.serialNumber && errors.serialNumber ? "error" : ""}
                  help={touched.serialNumber && errors.serialNumber}
                >
                  <Input
                    name="serialNumber"
                    value={values.serialNumber}
                    onChange={handleChange}
                    placeholder="Enter serial number"
                  />
                </Form.Item>
              </Col>
            </Row>


            {/* Toggle Description Field */}
            <Row gutter={16}>
              <Col xs={24}>
                <Button
                  type="dashed"
                  onClick={() => setFieldValue("showDescription", !values.showDescription)}
                  className="!mb-3"
                >
                  {values.showDescription ? "- Hide" : "+ Add"} Description
                </Button>
                {values.showDescription && (
                  <Form.Item label="Asset Description">
                    <Input.TextArea
                      rows={3}
                      name="assetDescription"
                      value={values.assetDescription}
                      onChange={handleChange}
                      placeholder="Enter asset description (optional)"
                    />
                  </Form.Item>
                )}
              </Col>
            </Row>

            {/* Section 6: Optional System Details */}
            <h5 className="mb-3 mt-4 fw-semibold">Additional System Details</h5>
            <Row gutter={16}>
              <Col xs={24}>
                <Button
                  type="dashed"
                  onClick={() => {
                    setShowSystemDetails(!showSystemDetails);
                    setFieldValue("showSystemDetails", !showSystemDetails);
                  }}
                  className="!mb-3"
                >
                  {showSystemDetails ? "- Remove System Details" : "+ Add System Details"}
                </Button>
              </Col>
            </Row>

            {showSystemDetails && (
              <>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="System Brand">
                      <Input
                        name="systemBrand"
                        value={values.systemBrand}
                        onChange={handleChange}
                        placeholder="Enter brand (e.g., Dell)"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="System Model">
                      <Input
                        name="systemModel"
                        value={values.systemModel}
                        onChange={handleChange}
                        placeholder="Enter model"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Operating System">
                      <Input
                        name="operatingSystem"
                        value={values.operatingSystem}
                        onChange={handleChange}
                        placeholder="e.g., Windows 11"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="RAM (GB)">
                      <Input
                        name="ram"
                        value={values.ram}
                        onChange={handleChange}
                        placeholder="e.g., 16"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Storage (GB)">
                      <Input
                        name="storage"
                        value={values.storage}
                        onChange={handleChange}
                        placeholder="e.g., 512"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="MAC Address">
                      <Input
                        name="macAddress"
                        value={values.macAddress}
                        onChange={handleChange}
                        placeholder="e.g., 00:1A:2B:3C:4D:5E"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item label="IP Address">
                      <Input
                        name="ipAddress"
                        value={values.ipAddress}
                        onChange={handleChange}
                        placeholder="e.g., 192.168.1.1"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {/* Section 2: Purchase Details */}
            <h5 className="mb-3 mt-4 fw-semibold">Purchase & Warranty</h5>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Date of Purchase"
                  validateStatus={touched.dateOfPurchase && errors.dateOfPurchase ? "error" : ""}
                  help={touched.dateOfPurchase && errors.dateOfPurchase}
                >
                  <DatePicker
                    format="YYYY-MM-DD"
                    value={values.dateOfPurchase ? moment(values.dateOfPurchase) : null}
                    onChange={(date, dateString) => setFieldValue("dateOfPurchase", dateString)}
                    placeholder="Select date of purchase"
                    className="!w-full"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  label="Warranty Period"
                  validateStatus={touched.warrantyPeriod && errors.warrantyPeriod ? "error" : ""}
                  help={touched.warrantyPeriod && errors.warrantyPeriod}
                >
                  <Input
                    name="warrantyPeriod"
                    value={values.warrantyPeriod}
                    onChange={handleChange}
                    placeholder="Enter warranty in months"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Section 3: Branch */}
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Location"
                  validateStatus={touched.branch && errors.branch ? "error" : ""}
                  help={touched.branch && errors.branch}
                >
                  <Select name="branch" value={values.branch} onChange={(value) => setFieldValue("branch", value)} placeholder="Select a branch">
                    {branches.map((branch) => (
                      <Option key={branch} value={branch}>{branch}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>


            {/* Section 4: Asset Metadata */}
            <h5 className="mb-3 mt-4 fw-semibold">Asset Condition and Status</h5>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Asset Condition"
                  validateStatus={touched.assetCondition && errors.assetCondition ? "error" : ""}
                  help={touched.assetCondition && errors.assetCondition}
                >
                  <Select
                    name="assetCondition"
                    value={values.assetCondition}
                    onChange={(value) => setFieldValue("assetCondition", value)}
                    placeholder="Select asset condition"
                  >
                    <Option value="Excellent">Excellent</Option>
                    <Option value="Good">Good</Option>
                    <Option value="Fair">Fair</Option>
                    <Option value="Poor">Poor</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Asset Status"
                  validateStatus={touched.assetStatus && errors.assetStatus ? "error" : ""}
                  help={touched.assetStatus && errors.assetStatus}
                >
                  <Select
                    name="assetStatus"
                    value={values.assetStatus}
                    onChange={(value) => setFieldValue("assetStatus", value)}
                    placeholder="Select asset status"
                  >
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
              <Col xs={24} md={12}>
                <Form.Item label="Asset Image">
                  <Input
                    type="file"
                    ref={assetImageRef}
                    onChange={(e) => handleFileChange(e, "assetImage", setFieldValue)}
                    accept="image/*"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item label="Asset Document">
                  <Input
                    type="file"
                    ref={assetDocRef}
                    onChange={(e) => handleFileChange(e, "assetDocument", setFieldValue)}
                    accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                  />
                </Form.Item>
              </Col>
            </Row>

            {/* Submit */}
            <Row>
              <Col>
                <Button
                  className="custom-button"
                  type="primary"
                  htmlType="submit"
                  loading={loadingBtn}
                >
                  Add Accessory
                </Button>
              </Col>
            </Row>


          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AccessoriesFormContainer;
