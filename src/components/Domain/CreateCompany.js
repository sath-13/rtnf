import React, { useState, useCallback } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Spin,
  message,
  Typography,
  Table,
} from "antd";
import {
  createCompany,
  getCompanies,
  checkCompanyName,
} from "../../api/domainapi";
import { LoadingOutlined } from "@ant-design/icons";
import { debounce } from "lodash";
import { CommonMessages, CompanyMessages } from "../../constants/constants";
import { toast } from "react-toastify";
import { toastError, toastSuccess } from "../../Utility/toast";

const { Title } = Typography;

const CreateCompany = () => {
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [view, setView] = useState(null); // 'create' or 'list'
  const [form] = Form.useForm();
  const [companyNameStatus, setCompanyNameStatus] = useState(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getCompanies();
      setCompanies(res.data || []);
      setView("list");
    } catch (error) {
      // message.error(CompanyMessages.COMPANY_FETCH_FAIL);
      toastError({
        title: "Create Company",
        description: CompanyMessages.COMPANY_FETCH_FAIL,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const checkCompanyNameLive = useCallback(
    debounce(async (name) => {
      if (!name) return setCompanyNameStatus(null);
      try {
        await checkCompanyName(name.trim());
        setCompanyNameStatus("available");
      } catch (err) {
        setCompanyNameStatus("exists");
      }
    }, 500),
    []
  );

  const onFinish = useCallback(
    async (values) => {
      const { companyName, domain } = values;
      setLoading(true);
      try {
        await createCompany(companyName, domain);
        // message.success(CompanyMessages.COMPANY_CREATED_SUCC);
        toastSuccess({
          title: "Create Company",
          description: CompanyMessages.COMPANY_CREATED_SUCC,
        });
        form.resetFields();
        setView(null);
      } catch (error) {
        // message.error(error.response?.data?.message || CommonMessages.SOMETHING_WENT_WRONG);
        toastError({
          title: "Create Company",
          description:
            error.response?.data?.message ||
            CommonMessages.SOMETHING_WENT_WRONG,
        });
      } finally {
        setLoading(false);
      }
    },
    [form]
  );

  const companyColumns = [
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Domain",
      dataIndex: "domain",
      key: "domain",
    },
    {
      title: "Company ID (ObjectId)",
      dataIndex: "_id",
      key: "_id",
    },
  ];
  // background - color: #f7f7f7;
  return (
    <div className="!py-[18px] !pb-5">
      <Card bodyStyle={{ paddingRight: 0, paddingLeft: 0 }} className="create-company !shadow-md !bg-[#f7f7f7] max-w-4xl mx-auto !py-4 !px-2 lg:!px-6 lg:!py-6 border border-border-color">
        <div className="flex flex-col md:flex-row justify-center gap-[20px] mb-0 md:mb-[24px]">
          <Button
            size="large"
            className="ant-btn-primary custom-button !font-inter"
            type={view === "create" ? "primary" : "default"}
            onClick={() => setView("create")}
          >
            Create Company
          </Button>
          <Button
            size="large"
            className="ant-btn-primary custom-button !font-inter"
            type={view === "list" ? "primary" : "default"}
            onClick={fetchCompanies}
          >
            Get Companies
          </Button>
        </div>

        {view === "create" && (
          <div className="mt-4 border border-border-color px-2 py-2 rounded-lg">
            <h1 className="text-primary-text text-xl text-center font-rubik font-semibold">Create a New Company</h1>
            <Form onFinish={onFinish} layout="vertical" form={form}>
              <Form.Item
                label="Company Name"
                name="companyName"
                rules={[
                  { required: true, message: CompanyMessages.COMPANY_NAME_REQ },
                  {
                    validator: async (_, value) => {
                      if (companyNameStatus === "exists") {
                        return Promise.reject(
                          CompanyMessages.COMPANY_NAME_ALREADY_EXISTS
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
                validateStatus={
                  companyNameStatus === "exists"
                    ? "error"
                    : companyNameStatus === "available"
                      ? "success"
                      : ""
                }
                help={
                  companyNameStatus === "exists"
                    ? "Company name already exists."
                    : companyNameStatus === "available"
                      ? "Company name is available."
                      : ""
                }
              >
                <Input
                  onChange={(e) => {
                    const value = e.target.value;
                    form.setFieldValue("companyName", value);
                    checkCompanyNameLive(value);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Domain"
                name="domain"
                rules={[
                  { required: true, message: CompanyMessages.DOMAIN_NAME_REQ },
                ]}
              >
                <Input />
              </Form.Item>

              <Button
                className="custom-button"
                type="primary"
                htmlType="submit"
                loading={loading}
                block
              >
                {loading ? "Creating..." : "Create Company"}
              </Button>
            </Form>
          </div>
        )}

        {view === "list" && (
          <div className="mt-4 border border-border-color  py-2 rounded-lg">
            <h1 className="text-primary-text text-xl text-center font-rubik font-semibold">Available Companies</h1>
            {loading ? (
              <Spin
                indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
              />
            ) : (
              <Table
                bordered
                scroll={{ x: "max-content" }}
                dataSource={companies}
                columns={companyColumns}
                rowKey="_id"
                pagination={{ pageSize: 5 }}
              />
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default CreateCompany;
