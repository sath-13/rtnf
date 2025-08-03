import React, { useContext, useState, useEffect } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import { Form, Input, Button, DatePicker, Row, Col, Select, message } from "antd";
import moment from "moment";
import { StockContext } from "../../../../contexts/StockContext";
import { createProduct } from "../../../../api/productapi";
import { useParams } from "react-router-dom";
import { DeviceFormMessages, ValidationMessages } from "../../../../constants/constants";
import { getAllBranches } from "../../../../api/companyapi";
import { toastError, toastSuccess } from "../../../../Utility/toast";

// Extract the first value from BRANCHES dynamically

const { Option } = Select;

const validationSchema = yup.object().shape({
  branch: yup.string().required(ValidationMessages.BRANCH_REQ),
  systemBrand: yup.string().required(ValidationMessages.SYSTEMBRAND_REQ),
  systemModel: yup.string().required(ValidationMessages.SYSTEMMODEL_REQ),
  systemName: yup.string().required(ValidationMessages.SYSTEMNAME_REQ),
  os: yup.string().required(ValidationMessages.OS_REQ),
  cpu: yup.string().required(ValidationMessages.CPU_REQ),
  ram: yup.string()
    .matches(/^\d+(GB|MB|TB)$/, ValidationMessages.RAM_PATTERN)
    .required(ValidationMessages.RAM_REQ),
  storageType: yup.string().required(ValidationMessages.STORAGETYPE_REQ),
  storageCapacity: yup.string()
    .matches(/^\d+(GB|TB)$/, ValidationMessages.STORAGE_CAPACITY_FORMAT)
    .required(ValidationMessages.STORAGE_CAPACITY_REQ),
  macAddress: yup.string()
    .matches(/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/, ValidationMessages.INV_MAC_ADDRESS)
    .required(ValidationMessages.MAC_ADDRESS_REQ),
  ipAddress: yup.string()
    .matches(
      /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$/,
      ValidationMessages.INV_IP_ADDRESS
    )
    .required(ValidationMessages.IP_ADDRESS_REQ),
  productKey: yup.string()
    .matches(/^[A-Z0-9-]{10,25}$/, ValidationMessages.PRODUCT_KET_FORMAT)
    .required(ValidationMessages.PRODUCT_KEY_REQ),
  serialNumber: yup.string()
    .matches(/^[a-zA-Z0-9-]+$/, ValidationMessages.SERIAL_NUMBER_PATTERN)
    .required(ValidationMessages.SERIAL_NUMBER_REQ),
  warrantyPeriod: yup.string()
    .matches(/^\d+(months|years)$/, ValidationMessages.WARRANTY_PERIOD_PATTERN)
    .required(ValidationMessages.WARRANTY_PERIOD_REQ),
  dateOfPurchase: yup.date()
    .max(new Date(), ValidationMessages.DATE_OF_PURCHASE_MAX)
    .required(ValidationMessages.DATE_OF_PURCHASE_REQ),
});


const SytemDetailsForm = ({ onClose }) => {
  const { setDeviceCategory, toggleRefresh } = useContext(StockContext);
  const [, setLoadingBtn] = useState(false);
  const [branches, setBranches] = useState([]);
  const { workspacename } = useParams(); // Get workspaceName from URL params

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

  const initialValues = {
    systemBrand: "",
    systemModel: "",
    systemName: "",
    os: "",
    cpu: "",
    ram: "",
    storageType: "",
    storageCapacity: "",
    macAddress: "",
    ipAddress: "",
    productKey: "",
    serialNumber: "",
    dateOfPurchase: null,
    warrantyPeriod: "",
    branch: "", // Set the first branch as the default
  };

  const onSubmit = async (values, { setSubmitting, resetForm, setFieldValue }) => {
    setLoadingBtn(true);
    try {
      const productData = {
        workspacename,
        productCategory: "System",
        productType: "Laptop",
        branch: values.branch, // Send the selected branch
        systemBrand: values.systemBrand,
        systemModel: values.systemModel,
        systemName: values.systemName,
        os: values.os,
        cpu: values.cpu,
        ram: values.ram,
        storageType: values.storageType,
        storageCapacity: values.storageCapacity,
        macAddress: values.macAddress,
        ipAddress: values.ipAddress,
        productKey: values.productKey,
        serialNumber: values.serialNumber,
        dateOfPurchase: values.dateOfPurchase, // Expected in YYYY-MM-DD format
        warrantyPeriod: values.warrantyPeriod,
      };

      await createProduct(productData); // Store product in the database
      setDeviceCategory("System");
      // message.success(DeviceFormMessages.SYSTEM_ADD_SUCC);
      toastSuccess({ title: "Success", description: DeviceFormMessages.SYSTEM_ADD_SUCC });

      resetForm();
      // Trigger refresh in ListStock by toggling the refresh flag
      toggleRefresh();
      // Always call onClose after success
      onClose();
    } catch (error) {
      // message.error(error.response?.data?.msg || DeviceFormMessages.SYSTEM_ADD_ERR );
      toastError({ title: "Error", description: error.response?.data?.msg || DeviceFormMessages.SYSTEM_ADD_ERR });
    }
    setSubmitting(false);
    setLoadingBtn(false);
  };

  return (
    <div className="p-6">
      <h3 className="mb-6">System Details</h3>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({
          handleSubmit,
          handleChange,
          setFieldValue,
          values,
          touched,
          errors,
          isSubmitting,
        }) => (
          <Form layout="vertical" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Branch"
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
              <Col span={12}>
                <Form.Item
                  label="System Brand"
                  validateStatus={touched.systemBrand && errors.systemBrand ? "error" : ""}
                  help={touched.systemBrand && errors.systemBrand ? errors.systemBrand : null}
                >
                  <Input
                    name="systemBrand"
                    placeholder="Enter System Brand"
                    value={values.systemBrand}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="System Model"
                  validateStatus={touched.systemModel && errors.systemModel ? "error" : ""}
                  help={touched.systemModel && errors.systemModel ? errors.systemModel : null}
                >
                  <Input
                    name="systemModel"
                    placeholder="Enter System Model"
                    value={values.systemModel}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="System Name"
                  validateStatus={touched.systemName && errors.systemName ? "error" : ""}
                  help={touched.systemName && errors.systemName ? errors.systemName : null}
                >
                  <Input
                    name="systemName"
                    placeholder="Enter System Name"
                    value={values.systemName}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Operating System"
                  validateStatus={touched.os && errors.os ? "error" : ""}
                  help={touched.os && errors.os ? errors.os : null}
                >
                  <Input
                    name="os"
                    placeholder="Enter OS"
                    value={values.os}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="CPU"
                  validateStatus={touched.cpu && errors.cpu ? "error" : ""}
                  help={touched.cpu && errors.cpu ? errors.cpu : null}
                >
                  <Input
                    name="cpu"
                    placeholder="Enter CPU"
                    value={values.cpu}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="RAM"
                  validateStatus={touched.ram && errors.ram ? "error" : ""}
                  help={touched.ram && errors.ram ? errors.ram : null}
                >
                  <Input
                    name="ram"
                    placeholder="Enter RAM"
                    value={values.ram}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Storage Type"
                  validateStatus={touched.storageType && errors.storageType ? "error" : ""}
                  help={touched.storageType && errors.storageType ? errors.storageType : null}
                >
                  <Input
                    name="storageType"
                    placeholder="Enter Storage Type"
                    value={values.storageType}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Storage Capacity"
                  validateStatus={touched.storageCapacity && errors.storageCapacity ? "error" : ""}
                  help={touched.storageCapacity && errors.storageCapacity ? errors.storageCapacity : null}
                >
                  <Input
                    name="storageCapacity"
                    placeholder="Enter Storage Capacity"
                    value={values.storageCapacity}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="MAC Address"
                  validateStatus={touched.macAddress && errors.macAddress ? "error" : ""}
                  help={touched.macAddress && errors.macAddress ? errors.macAddress : null}
                >
                  <Input
                    name="macAddress"
                    placeholder="Enter MAC Address"
                    value={values.macAddress}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="IP Address"
                  validateStatus={touched.ipAddress && errors.ipAddress ? "error" : ""}
                  help={touched.ipAddress && errors.ipAddress ? errors.ipAddress : null}
                >
                  <Input
                    name="ipAddress"
                    placeholder="Enter IP Address"
                    value={values.ipAddress}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Product Key"
                  validateStatus={touched.productKey && errors.productKey ? "error" : ""}
                  help={touched.productKey && errors.productKey ? errors.productKey : null}
                >
                  <Input
                    name="productKey"
                    placeholder="Enter Product Key"
                    value={values.productKey}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Serial Number"
                  validateStatus={touched.serialNumber && errors.serialNumber ? "error" : ""}
                  help={touched.serialNumber && errors.serialNumber ? errors.serialNumber : null}
                >
                  <Input
                    name="serialNumber"
                    placeholder="Enter Serial Number"
                    value={values.serialNumber}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Warranty Period"
                  validateStatus={touched.warrantyPeriod && errors.warrantyPeriod ? "error" : ""}
                  help={touched.warrantyPeriod && errors.warrantyPeriod ? errors.warrantyPeriod : null}
                >
                  <Input
                    name="warrantyPeriod"
                    placeholder="Enter Warranty Period"
                    value={values.warrantyPeriod}
                    onChange={handleChange}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Date Of Purchase"
                  validateStatus={touched.dateOfPurchase && errors.dateOfPurchase ? "error" : ""}
                  help={touched.dateOfPurchase && errors.dateOfPurchase ? errors.dateOfPurchase : null}
                >
                  <DatePicker
                    name="dateOfPurchase"
                    className="!w-full"
                    placeholder="Select Date Of Purchase"
                    value={values.dateOfPurchase ? moment(values.dateOfPurchase) : null}
                    onChange={(date, dateString) =>
                      setFieldValue("dateOfPurchase", dateString)
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item className="text-center">
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add System"}
              </Button>
            </Form.Item>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default SytemDetailsForm;
