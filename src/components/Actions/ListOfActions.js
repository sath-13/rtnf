import React, { useState, useEffect, useCallback } from "react";
import {
  Table,
  Button,
  Modal,
  Tag,
  message,
  notification,
  Select,
  DatePicker,
  Dropdown,
  Menu,
  Space,
  Popover,
  Tooltip,
} from "antd";
import { MdVisibility } from "react-icons/md";
import ActionDash from "./ActionDash/ActionDash";
import {
  getActions,
  updateActionText,
  updateActionStatus,
} from "../../api/actionapi";
import {
  CalendarOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { ActionMessages, UserMessages } from "../../constants/constants";
import dayjs from "dayjs";
import "./ListOfActions.css";
import { toastError, toastSuccess } from "../../Utility/toast";

const { RangePicker } = DatePicker;

const priorityOptions = ["Critical", "High", "Medium", "Low", "Trivial"];

const ListOfActions = ({ newActionCreated, userAssigned, isFromList }) => {
  const loggedUser =
    JSON.parse(localStorage.getItem("user"))?.id ||
    JSON.parse(localStorage.getItem("user"))?._id ||
    null;
  const [actions, setActions] = useState([]);
  const [filteredActions, setFilteredActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [statusUpdated, setStatusUpdated] = useState(false);
  const [descriptionUpdated, setDescriptionUpdated] = useState(false);

  const [filterOption, setFilterOption] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dateRange, setDateRange] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("createdDate");
  const [refreshKey] = useState(null);

  const [filterLabel, setFilterLabel] = useState("");

  const fetchActions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getActions(loggedUser);
      if (Array.isArray(response)) {
        const actionsWithPriority = response.filter((action) =>
          priorityOptions.includes(action.priority)
        );
        setActions(actionsWithPriority);
      } else {
        console.error("Invalid API response format:", response);
        setActions([]);
      }
    } catch (error) {
      // notification.error({ message: ActionMessages.ACTION_FETCH_ERR, description: error.message });
      toastError({
        title: "Error",
        description: ActionMessages.ACTION_FETCH_ERR,
      });
    } finally {
      setLoading(false);
    }
  }, [loggedUser]);

  useEffect(() => {
    if (!loggedUser) {
      // message.error(UserMessages.ID_ERR);
      toastError({ title: "Error", description: UserMessages.ID_ERR });
      return;
    }

    fetchActions();
  }, [
    fetchActions,
    loggedUser,
    newActionCreated,
    statusUpdated,
    descriptionUpdated,
    refreshKey,
    userAssigned,
    newActionCreated,
  ]); // ✅ This ensures automatic refresh

  useEffect(() => {
    let result = [...actions];

    // Apply Status or Priority Filters
    if (filterOption) {
      if (filterOption.startsWith("status:")) {
        result = result.filter(
          (action) => action.status === filterOption.split("status:")[1]
        );
      } else if (filterOption.startsWith("priority:")) {
        result = result.filter(
          (action) => action.priority === filterOption.split("priority:")[1]
        );
      }
    }

    // Apply Date Range Filter
    if (dateRange.length === 2 && dateRange[0] && dateRange[1]) {
      const startTime = new Date(dateRange[0]).getTime();
      const endTime = new Date(dateRange[1]).getTime();
      result = result.filter((action) => {
        const actionTime = new Date(action[dateFilterType]).getTime();
        return actionTime >= startTime && actionTime <= endTime;
      });
    }

    // Weekly Actions Filter (Last 7 Days)
    if (filterOption === "weekly") {
      const oneWeekAgo = dayjs().subtract(7, "day").startOf("day").toDate();
      result = result.filter(
        (action) => new Date(action.createdDate) >= oneWeekAgo
      );
    }

    if (filterOption === "overdue") {
      const today = dayjs().format("YYYY-MM-DD");
      result = result.filter(
        (action) =>
          dayjs(action.expectedCompletionDate).format("YYYY-MM-DD") < today
      );
    }

    // Delegated by Me (Actions created by the logged-in user)
    if (filterOption === "delegatedByMe") {
      result = result.filter((action) => action.CreatedBy === loggedUser);
    }

    //Assigned To Me
    if (filterOption === "delegatedToMe") {
      result = result.filter((action) => action.userAssigned === loggedUser);
    }

    // Apply Sorting
    if (sortBy === "priority") {
      result.sort((a, b) => {
        const idxA = priorityOptions.indexOf(a.priority);
        const idxB = priorityOptions.indexOf(b.priority);
        return sortOrder === "asc" ? idxA - idxB : idxB - idxA;
      });
    }

    setFilteredActions(result);
  }, [
    actions,
    filterOption,
    sortBy,
    sortOrder,
    dateRange,
    dateFilterType,
    loggedUser,
  ]);

  const showModal = (action) => {
    setSelectedAction(action);

    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedAction(null);
  };

  const handleStatusUpdate = async (actionId, newStatus) => {
    try {
      await updateActionStatus(actionId, newStatus);
      // message.success(ActionMessages.STATUS_UPDATED_SUCC);
      toastSuccess({
        title: "Success",
        description: ActionMessages.STATUS_UPDATED_SUCC,
      });
      setStatusUpdated((prev) => !prev);
    } catch (error) {
      // notification.error({ message: ActionMessages.STATUS_UPDATED_ERR, description: error.message });
      toastError({
        title: "Error",
        description: ActionMessages.STATUS_UPDATED_ERR,
      });
    }
  };

  const handleDescriptionUpdate = async (actionId, newDescription) => {
    if (!selectedAction || actionId !== selectedAction._id) {
      // message.error(ActionMessages.DESCRIPTION_UPDATE_WARN);
      toastError({
        title: "Error",
        description: ActionMessages.DESCRIPTION_UPDATE_WARN,
      });
      return;
    }
    try {
      await updateActionText(actionId, newDescription);
      // message.success(ActionMessages.DESCRIPTION_UPDATE_SUCC);
      toastSuccess({
        title: "Success",
        description: ActionMessages.DESCRIPTION_UPDATE_SUCC,
      });
      setDescriptionUpdated((prev) => !prev);
    } catch (error) {
      // notification.error({ message: ActionMessages.DESCRIPTION_UPDATE_ERR, description: error.message });
      toastError({
        title: "Error",
        description: ActionMessages.DESCRIPTION_UPDATE_ERR,
      });
    }
  };

  const copyToClipboard = (actionId) => {
    const link = `${window.location.origin}/actions/view/${actionId}`;
    navigator.clipboard.writeText(link);
    // message.success("Link copied to clipboard!");
    toastSuccess({
      title: "Success",
      description: "Link copied to clipboard!",
    });
  };

  const columns = [
    { title: "Action Title", dataIndex: "actionTitle" },
    { title: "Created By", dataIndex: "CreatedByName" },
    { title: "Assigned To", dataIndex: "userAssignedName" },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (priority) => {
        let color =
          priority === "Critical"
            ? "red"
            : priority === "High"
              ? "orange"
              : priority === "Medium"
                ? "blue"
                : "green";
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status) => (
        <Tag
          color={
            status === "Completed"
              ? "green"
              : status === "In Progress"
                ? "blue"
                : "volcano"
          }
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdDate",
      render: (dateString) => dayjs(dateString).format("YYYY-MM-DD"),
    },
    {
      title: "Expected Completion Date",
      dataIndex: "expectedCompletionDate",
      render: (dateString) => dayjs(dateString).format("YYYY-MM-DD"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            shape="circle"
            size="large"
            onClick={() => showModal(record)}
            icon={<MdVisibility />}
          />
          <Tooltip title="Copy">
            <Button
              shape="circle"
              size="large"
              onClick={() => copyToClipboard(record._id)}
              icon={<CopyOutlined />}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const clearFilters = () => {
    setFilterOption("");
    setSortBy("");
    setSortOrder("asc");
    setDateRange([]);
  };

  const handleMenuClick = (e) => {
    setFilterOption(e.key);
    const keyParts = e.key.split(":");
    if (keyParts.length > 1) {
      setFilterLabel(`${keyParts[0]}: ${keyParts[1]}`);
    } else {
      // Map known simple keys to readable labels
      const keyToLabelMap = {
        weekly: "Weekly Actions",
        overdue: "Overdue Actions",
        delegatedByMe: "Delegated by Me",
        delegatedToMe: "Delegated To Me",
      };
      setFilterLabel(keyToLabelMap[e.key] || e.key);
    }
  };

  const filterMenu = (
    <Menu onClick={handleMenuClick}>
      <Menu.Item key="weekly">Weekly Actions</Menu.Item>
      <Menu.Item key="overdue">Overdue Actions</Menu.Item>
      <Menu.Item key="delegatedByMe">Delegated by Me</Menu.Item>
      <Menu.Item key="delegatedToMe">Delegated To Me</Menu.Item>
      <Menu.Divider />
      <Menu.ItemGroup title={<span className="filter-Name">Status</span>}>
        <Menu.Item key="status:Pending">Pending</Menu.Item>
        <Menu.Item key="status:In Progress">In Progress</Menu.Item>
        <Menu.Item key="status:Completed">Completed</Menu.Item>
      </Menu.ItemGroup>
      <Menu.ItemGroup title={<span className="filter-Name">Priority</span>}>
        {priorityOptions.map((option) => (
          <Menu.Item key={`priority:${option}`}>{option}</Menu.Item>
        ))}
      </Menu.ItemGroup>
    </Menu>
  );

  const datePickerContent = (
    <div>
      <Select
        defaultValue="createdDate"
        onChange={setDateFilterType}
        className="!w-full !mb-[10px]"
      >
        <Select.Option value="createdDate">
          Filter by Created Date
        </Select.Option>
        <Select.Option value="expectedCompletionDate">
          Filter by Expected Completion Date
        </Select.Option>
      </Select>
      <RangePicker
        onChange={(dates, dateStrings) => setDateRange(dateStrings)}
        className="!w-full"
      />
    </div>
  );

  const sortMenu = (
    <Menu onClick={({ key }) => setSortBy(key)}>
      <Menu.Item key="priority">Priority</Menu.Item>
    </Menu>
  );

  const orderMenu = (
    <Menu onClick={({ key }) => setSortOrder(key)}>
      <Menu.Item key="asc">Ascending</Menu.Item>
      <Menu.Item key="desc">Descending</Menu.Item>
    </Menu>
  );

  // .listofActions-main-content {
  //     margin-bottom: 20px;
  //     display: flex;
  //     flex-wrap: wrap;
  //     gap: 10px;
  //     align-items: center;
  //     justify-content: flex-end;
  //     width: 100%;
  //   }

  return (
    <div className="py-[18px] px-2 lg:px-5">
      <div className="mb-3 lg:mb-5 flex flex-col flex-wrap lg:flex-row gap-2 justify-end items-center w-full">
        <Dropdown
          className="w-full lg:w-auto"
          overlay={filterMenu}
          trigger={["click"]}
        >
          <Button>
            Filter{filterLabel ? `: ${filterLabel}` : ""} <DownOutlined />
          </Button>
        </Dropdown>

        {/* Sort By */}
        <Dropdown
          className="w-full lg:w-auto"
          overlay={sortMenu}
          trigger={["click"]}
        >
          <Button>
            Sort By: {sortBy} <DownOutlined />
          </Button>
        </Dropdown>

        {/* Sort Order */}
        {sortBy && (
          <Dropdown
            className="w-full lg:w-auto"
            overlay={orderMenu}
            trigger={["click"]}
          >
            <Button>
              Order: {sortOrder === "asc" ? "Ascending" : "Descending"}{" "}
              <DownOutlined />
            </Button>
          </Dropdown>
        )}
        <Popover
          className="w-full lg:w-auto"
          content={datePickerContent}
          title="Select Date Range"
          trigger="click"
        >
          <Button icon={<CalendarOutlined />}> Select Date </Button>
        </Popover>

        <Button
          className="w-full lg:w-auto"
          danger
          onClick={clearFilters}
          icon={<DeleteOutlined />}
        >
          Clear
        </Button>
      </div>

      <Table
        className="border border-border-color rounded-lg"
        scroll={{ x: "max-content" }}
        key={refreshKey} //  Table will refresh when refreshKey changes
        columns={columns}
        dataSource={filteredActions}
        rowKey={(record) => record._id}
        loading={loading}
      />

      <Modal
        title="Action Details"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <ActionDash
          selectedActionId={selectedAction?._id}
          CreatedBy={selectedAction?.CreatedBy}
          userAssigned={selectedAction?.userAssigned}
          subAssigned={selectedAction?.subAssigned || []}
          loggedInUser={loggedUser}
          onStatusUpdate={handleStatusUpdate}
          onDescriptionUpdate={handleDescriptionUpdate}
          refreshActions={fetchActions} //  New prop
          isFromList={true}
          isViewing={true}
        />
      </Modal>
    </div>
  );
};

export default ListOfActions;
