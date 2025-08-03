import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Drawer } from "antd";
import "./AssignItems.css";
import {
  Table,
  Input,
  Dropdown,
  Menu,
  Pagination,
  Checkbox,
  Modal,
  Tooltip,
  Row,
  Col,
  Typography,
  Select,
} from "antd";
import { MdVisibility } from "react-icons/md";
import { BsGear } from "react-icons/bs";
import { UserDeleteOutlined } from "@ant-design/icons";
import Columns from "../../constants/AssigmentColumns.json";
import { useParams } from "react-router-dom";
import {
  getAllAssignedProductByWorkspacename,
  removeAssignedProduct,
} from "../../api/assignedProductapi";
import { getAllTeams } from "../../api/teamapi";
import { getAllBranches } from "../../api/companyapi";
import { toastError, toastSuccess } from "../../Utility/toast";

const { Title, Text } = Typography;
const { Option } = Select;

const AssignItem = () => {
  const alwaysVisible = [
    "firstName",
    "email",
    "status",
    "teamTitle",
    "assignBy",
    "description",
  ];
  const { workspacename } = useParams();

  const initialColumns = Columns.map((col) => ({
    ...col,
    show: alwaysVisible.includes(col.name),
    alwaysVisible: alwaysVisible.includes(col.name),
  }));

  const [columnsConfig, setColumnsConfig] = useState(initialColumns);
  const [assignedDeviceUserList, setAssignedDeviceUserList] = useState([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState(null);
  const [location, setLocation] = useState(null);
  const [employeeStatus, setEmployeeStatus] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [teams, setTeams] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const loggedUser = JSON.parse(localStorage.getItem("user"))?.email || null;

  useEffect(() => {
    if (workspacename) {
      const fetchTeams = async () => {
        const response = await getAllTeams(workspacename);
        setTeams(response?.data || []);
      };
      fetchTeams();
    }
  }, [workspacename]);

  const getAdditionalData = useCallback(async () => {
    try {
      const response = await getAllBranches();
      const branchList = Array.isArray(response)
        ? response
        : response?.branches ?? [];
      setBranches(branchList);
    } catch (error) {
      console.error("Error fetching branches:", error);
      // message.error("Failed to fetch branches");
      toastError({ title: "Error", description: "Failed to fetch branches" });
    }
  }, []);

  const getAssignedDeviceDetails = useCallback(async () => {
    try {
      const data = await getAllAssignedProductByWorkspacename(workspacename);
      const allDevices = data?.assignedDevices || [];
      const filteredDevices = allDevices.filter(
        (device) =>
          device.assignBy === loggedUser || device.email === loggedUser
      );
      setAssignedDeviceUserList(filteredDevices);
    } catch (error) {
      console.error("Error fetching assigned devices:", error);
      // message.error("Failed to fetch assigned devices");
      toastError({
        title: "Error",
        description: "Failed to fetch assigned devices",
      });
    }
  }, [workspacename, loggedUser]);

  useEffect(() => {
    getAssignedDeviceDetails();
    getAdditionalData();
  }, [getAssignedDeviceDetails, getAdditionalData]);

  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setIsDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerVisible(false);
    setSelectedRecord(null);
  };

  const handleSearch = (e) => setSearch(e.target.value);

  const filtered = useMemo(() => {
    let result = assignedDeviceUserList;

    if (search) {
      result = result.filter((r) =>
        r.firstName?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (department) {
      result = result.filter(
        (r) => Array.isArray(r.teamTitle) && r.teamTitle.includes(department)
      );
    }

    if (location) {
      result = result.filter((r) => r.branch === location);
    }

    if (employeeStatus) {
      result = result.filter((r) => r.status === employeeStatus);
    }

    setTotalItems(result.length);
    return result.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  }, [
    assignedDeviceUserList,
    search,
    department,
    location,
    employeeStatus,
    currentPage,
  ]);

  const handleCheckboxChange = (e, colName) => {
    const updatedColumns = columnsConfig.map((col) =>
      !col.alwaysVisible && col.name === colName
        ? { ...col, show: !col.show }
        : col
    );
    setColumnsConfig(updatedColumns);
  };

  const handleUnassignment = async (id) => {
    Modal.confirm({
      title: "Are you sure you want to unassign this device?",
      content: "This action cannot be undone.",
      okText: "Yes, unassign",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        try {
          const response = await removeAssignedProduct(id);
          if (response) {
            // message.success("Unassignment Successful");
            toastSuccess({
              title: "Success",
              description: "Unassignment Successful",
            });
            getAssignedDeviceDetails();
          }
        } catch (err) {
          console.error(err);
          // message.error("Error unassigning device");
          toastError({
            title: "Error",
            description: "Error unassigning device",
          });
        }
      },
    });
  };

  const visibleColumns = columnsConfig.filter(
    (col) => col.alwaysVisible || col.show
  );
  const tableColumns = [
    ...visibleColumns.map(({ fieldName, name }) => ({
      title: fieldName,
      dataIndex: name,
      key: name,
      render: (text) => text || "---",
    })),
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="assign-item-action-icon">
          <Tooltip title="Unassign">
            <UserDeleteOutlined
              onClick={() => handleUnassignment(record._id)}
            />
          </Tooltip>
          <Tooltip title="View Details">
            <MdVisibility
              className="ml-5 text-[18px]"
              onClick={() => handleViewDetails(record)}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const menu = (
    <Menu>
      {columnsConfig
        .filter((col) => !col.alwaysVisible)
        .map((col, index) => (
          <Menu.Item key={index}>
            <Checkbox
              checked={col.show}
              onChange={(e) => handleCheckboxChange(e, col.name)}
            >
              {col.fieldName}
            </Checkbox>
          </Menu.Item>
        ))}
    </Menu>
  );

  return (
    <div className="assign-item-container">
      <h1 className="!text-center text-2xl lg:!text-[32px] text-primary-text font-rubik font-semibold !p-0 !mt-[14px] !mb-5">
        Assigned assets
      </h1>
      <Text
        className="block text-center mb-5"
        type="secondary"
      >
        The following are the employees for whom assets have been assigned.
      </Text>

      <div className="px-2 lg:px-0">
        <Row
          gutter={[16, 16]}
          className="assign-item-filters !border !border-border-color !rounded-lg lg:!rounded-none lg:!border-0 !px-4 lg:!px-0"
        >
          <Col xs={24} sm={8} md={6}>
            <Select
              allowClear
              placeholder="Employee Status"
              onChange={(val) => setEmployeeStatus(val)}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              allowClear
              placeholder="Department"
              onChange={(val) => setDepartment(val)}
            >
              {teams.map((team) => (
                <Option key={team._id} value={team.teamTitle}>
                  {team.teamTitle}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              allowClear
              placeholder="Location"
              onChange={(val) => setLocation(val)}
            >
              {branches.map((branch) => (
                <Option key={branch} value={branch}>
                  {branch}
                </Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={24} md={6}>
            <Tooltip title="Search by employee name">
              <Input.Search placeholder="Search" onChange={handleSearch} />
            </Tooltip>
          </Col>
        </Row>
      </div>

      <div className="assign-item-column-settings">
        <Dropdown overlay={menu} trigger={["click"]}>
          <span className="assign-item-column">
            <BsGear className="mr-2" /> Column Settings
          </span>
        </Dropdown>
      </div>

      <Drawer
        title="🧾 Assigned Asset Details"
        placement="right"
        onClose={handleCloseDrawer}
        open={isDrawerVisible}
        width={500}
        bodyStyle={{ background: "#f5f7fa", padding: 24 }}
      >
        <div className="bg-[#f5f7fa] p-6">
          {selectedRecord && (
            <div className="assigned-card">
              {columnsConfig.map(({ fieldName, name }) => (
                <Row key={name} className="assigned-row" align="middle">
                  <Col span={10}>
                    <Text className="assigned-label">{fieldName}</Text>
                  </Col>
                  <Col span={14}>
                    <Text
                      className={
                        selectedRecord[name]
                          ? "assigned-value"
                          : "assigned-value empty"
                      }
                    >
                      {selectedRecord[name] || "Not provided"}
                    </Text>
                  </Col>
                </Row>
              ))}
            </div>
          )}
        </div>
      </Drawer>

      <Table
        className="!border !border-border-color rounded-lg"
        dataSource={filtered}
        columns={tableColumns}
        rowKey="_id"
        pagination={false}
        bordered
        scroll={{ x: "max-content" }}
      />

      <div className="text-right mt-4">
        <Pagination
          total={totalItems}
          pageSize={ITEMS_PER_PAGE}
          current={currentPage}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default AssignItem;
