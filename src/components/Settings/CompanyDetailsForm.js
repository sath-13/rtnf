import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  message,
  Space,
  TimePicker,
  Select,
  InputNumber,
} from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { getCompanyById, updateCompanyDetails } from "../../api/companyapi";
import { toastError, toastSuccess } from "../../Utility/toast";

const { Option } = Select;

const CompanyDetailsForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([""]);
  const loggedUserCompanyId = JSON.parse(localStorage.getItem("user"))?.companyId || null;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getCompanyById(loggedUserCompanyId);
        if (data) {
          form.setFieldsValue({
            company_id: data.company_id || "",
            name: data.name || "",
            url: data.url || "",
            linkedin: data.linkedin || "",
            address: data.address || "",
            working_hours: data.working_hours
              ? {
                from: dayjs(data.working_hours.from, "HH:mm"),
                to: dayjs(data.working_hours.to, "HH:mm"),
              }
              : undefined,
            working_days: data.working_days || [],
            working_hours_per_day: data.working_hours_per_day || " ",
          });
          setBranches(data.branches?.length > 0 ? data.branches : [""]);
        }
      } catch (error) {
        console.error("Error fetching company details:", error);
        // message.error(error.message || "Failed to load company details");
        toastError({ title: "Error", description: error.message || "Failed to load company details" });
      }
    };

    fetchData();
  }, [form]);

  const addBranchField = () => {
    setBranches([...branches, ""]);
  };

  const handleBranchChange = (index, value) => {
    const newBranches = [...branches];
    newBranches[index] = value;
    setBranches(newBranches);
  };

  const handleBranchDelete = (index) => {
    const newBranches = [...branches];
    newBranches.splice(index, 1);
    setBranches(newBranches.length > 0 ? newBranches : [""]);
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        company_id: values.company_id,
        name: values.name,
        url: values.url,
        linkedin: values.linkedin,
        address: values.address,
        branches: branches.filter((b) => b.trim() !== ""),
        working_hours: {
          from: values.working_hours?.from?.format("HH:mm"),
          to: values.working_hours?.to?.format("HH:mm"),
        },
        working_days: values.working_days,
        working_hours_per_day: values.working_hours_per_day,
      };

      await updateCompanyDetails(payload);
      // message.success("Company details updated successfully!");
      toastSuccess({ title: "Success", description: "Company details updated successfully!" });
    } catch (error) {
      console.error("Error updating company details:", error);
      // message.error(error.message || "Failed to update company details");
      toastError({ title: "Error", description: error.message || "Failed to update company details" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="!container !mx-auto mt-4 border border-border-color rounded-lg px-3 py-5 bg-[#fff]">
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Company ID"
          name="company_id"
          rules={[{ required: true, message: "Please enter company ID" }]}
        >
          <Input placeholder="Enter Company ID provided to you by SJ Innovation!" />
        </Form.Item>

        <Form.Item
          label="Company Name"
          name="name"
          rules={[{ required: true, message: "Please enter company name" }]}
        >
          <Input placeholder="Enter company name" />
        </Form.Item>

        <Form.Item
          label="Website URL"
          name="url"
          rules={[{ required: true, type: "url", message: "Enter a valid URL" }]}
        >
          <Input placeholder="https://example.com" />
        </Form.Item>

        <Form.Item
          label="LinkedIn Profile"
          name="linkedin"
          rules={[
            { required: true, type: "url", message: "Enter a valid LinkedIn URL" },
          ]}
        >
          <Input placeholder="https://linkedin.com/company/example" />
        </Form.Item>

        <Form.Item
          label="Address"
          name="address"
          rules={[{ required: true, message: "Please enter address" }]}
        >
          <Input placeholder="Enter company address" />
        </Form.Item>

        <div className="mb-4">
          <label>Branches</label>
          {branches.map((branch, index) => (
            <Space
              key={index}
              className="flex mb-2"
              align="start"
            >
              <Input
                value={branch}
                onChange={(e) => handleBranchChange(index, e.target.value)}
                placeholder={`Branch ${index + 1}`}
              />
              {branches.length > 1 && (
                <Button
                  type="text"
                  icon={<MinusCircleOutlined className="text-red-500" />}
                  onClick={() => handleBranchDelete(index)}
                />
              )}
            </Space>
          ))}
          <Button type="dashed" onClick={addBranchField} icon={<PlusOutlined />}>
            Add Branch
          </Button>
        </div>

        {/* Working Hours */}
        <Form.Item
          label="Working Hours"
          required
          className="mb-[16px]"
        >
          <Space>
            <Form.Item
              name={["working_hours", "from"]}
              noStyle
              rules={[{ required: true, message: "Select start time" }]}
            >
              <TimePicker format="hh:mm A" use12Hours placeholder="From" />
            </Form.Item>
            <Form.Item
              name={["working_hours", "to"]}
              noStyle
              rules={[{ required: true, message: "Select end time" }]}
            >
              <TimePicker format="hh:mm A" use12Hours placeholder="To" />
            </Form.Item>
          </Space>
        </Form.Item>


        {/* Working Days */}
        <Form.Item
          label="Working Days"
          name="working_days"
          rules={[{ required: true, message: "Please select working days" }]}
        >
          <Select mode="multiple" placeholder="Select working days">
            {[
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ].map((day) => (
              <Option key={day} value={day}>
                {day}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Working Hours Per Day */}
        <Form.Item
          label="Working Hours Per Day"
          name="working_hours_per_day"
          rules={[
            { required: true, message: "Please enter working hours per day" },
            {
              type: "number",
              min: 0,
              max: 24,
              message: "Working hours must be between 0 and 24",
            },
          ]}
          className="mb-4"
        >
          <InputNumber
            min={0}
            max={24}
            step={0.25}  // Allows 15 minute increments, e.g. 7.5
            placeholder="e.g., 8 or 7.5"
            className="w-[120px]"
          />
        </Form.Item>

        <Form.Item>
          <Button className="custom-button" type="primary" htmlType="submit" loading={loading}>
            Save Details
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default CompanyDetailsForm;
