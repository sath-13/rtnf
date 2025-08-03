import { Input, Select, Button, Popconfirm, Tooltip } from "antd";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import { FaComments, FaMedal, FaEnvelopeOpenText, FaAcquisitionsIncorporated, FaUser, FaStickyNote } from "react-icons/fa";


export const getUserTableColumns = ({
  currentUserRole,
  isEditing,
  handleChange,
  selectedTeam,
  setSelectedTeam,
  teams,
  confirmTeamTitleChange,
  selectedStatus,
  setSelectedStatus,
  confirmStatusChange,
  handleSave,
  handleEdit,
  handleDelete,
  handleOpenModal,
  handleOpenFeedbackModal,
  handleOpenReviewModal,
  handleOpenInternalNodeModal,
  handleOpenProfileModal,
  handleOpenUpdateProfile,
  visibleColumns,
  loggedInUserId, // 👈 add this here
}) => {

  // All columns
  const columns = [
    {
      title: "First Name",
      dataIndex: "fname",
      visible: visibleColumns.fname,
      editable: currentUserRole === "superadmin",
      render: (text, record) =>
        isEditing(record) ? (
          <Input
            value={text}
            onChange={(e) => handleChange(e.target.value, record._id, "fname")}
            disabled={currentUserRole !== "superadmin"}
          />
        ) : (
          text
        ),
    },
    {
      title: "Last Name",
      dataIndex: "lname",
      visible: visibleColumns.lname,
      editable: currentUserRole === "superadmin",
      render: (text, record) =>
        isEditing(record) ? (
          <Input
            value={text}
            onChange={(e) => handleChange(e.target.value, record._id, "lname")}
            disabled={currentUserRole !== "superadmin"}
          />
        ) : (
          text
        ),
    },
    {
      title: "Username",
      dataIndex: "username",
      visible: visibleColumns.username,
      editable: currentUserRole === "superadmin",
      render: (text, record) =>
        isEditing(record) ? (
          <Input
            value={text}
            onChange={(e) => handleChange(e.target.value, record._id, "username")}
            disabled={currentUserRole !== "superadmin"}
          />
        ) : (
          text
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      visible: visibleColumns.email,
      editable: currentUserRole === "superadmin",
      render: (text, record) =>
        isEditing(record) ? (
          <Input
            value={text}
            onChange={(e) => handleChange(e.target.value, record._id, "email")}
            disabled={currentUserRole !== "superadmin"}
          />
        ) : (
          text
        ),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      visible: visibleColumns.branch,
      editable: currentUserRole === "superadmin",
      render: (text, record) =>
        isEditing(record) ? (
          <Input
            value={text}
            onChange={(e) => handleChange(e.target.value, record._id, "branch")}
            disabled={currentUserRole !== "superadmin"}
          />
        ) : (
          text
        ),
    },
    {
      title: "Role",
      dataIndex: "role",
      visible: visibleColumns.role,
      filters: [
        { text: "Admin", value: "admin" },
        { text: "User", value: "user" },
        { text: "Super Admin", value: "superadmin" },
      ],
      onFilter: (value, record) => record.role === value,
      editable: currentUserRole === "superadmin",
      render: (text, record) =>
        isEditing(record) ? (
          <Select
            value={text}
            onChange={(value) => handleChange(value, record._id, "role")}
            className="!w-[120px]"
            disabled={currentUserRole !== "superadmin"}
          >
            <Select.Option value="user">User</Select.Option>
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="superadmin">Super Admin</Select.Option>
          </Select>
        ) : (
          text
        ),
    },
    {
      title: "Team Name",
      dataIndex: "teamTitle",
      visible: visibleColumns.teamTitle,
      editable: currentUserRole === "superadmin",
      render: (text, record) => (
        <>
          <Select
            value={selectedTeam[record._id] ?? record.teamTitle}
            className="!w-[120px]"
            onChange={(value) => setSelectedTeam({ ...selectedTeam, [record._id]: value })}
            disabled={currentUserRole !== "superadmin"}
          >
            {teams.map((team) => (
              <Select.Option key={team._id} value={team.teamTitle}>
                {team.teamTitle}
              </Select.Option>
            ))}
          </Select>

          {selectedTeam[record._id] && currentUserRole === "superadmin" && (
            <Popconfirm
              title="Are you sure you want to change the team name?"
              onConfirm={() => confirmTeamTitleChange(record._id)}
              onCancel={() => setSelectedTeam((prev) => ({ ...prev, [record._id]: null }))}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link">Confirm</Button>
            </Popconfirm>
          )}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      visible: visibleColumns.status,
      filters: [
        { text: "Active", value: "active" },
        { text: "Inactive", value: "inactive" },
      ],
      onFilter: (value, record) => record.status === value,
      render: (text, record) => (
        <>
          <Select
            value={selectedStatus[record._id] ?? record.status}
            className="!w-[120px]"
            onChange={(value) => setSelectedStatus({ ...selectedStatus, [record._id]: value })}
            disabled={currentUserRole !== "superadmin"}
          >
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>

          {selectedStatus[record._id] && currentUserRole === "superadmin" && (
            <Popconfirm
              title="Are you sure you want to change the status?"
              onConfirm={() => confirmStatusChange(record._id)}
              onCancel={() => setSelectedStatus((prev) => ({ ...prev, [record._id]: null }))}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link">Confirm</Button>
            </Popconfirm>
          )}
        </>
      ),
    },
    {
      title: "Actions",
      visible: visibleColumns.actions,
      render: (text, record) =>
        isEditing(record) ? (
          <Button type="primary"
            onClick={() => handleSave(record)} disabled={currentUserRole !== "superadmin"}>
            Save
          </Button>
        ) : (
          <div className="flex gap-2">

            {currentUserRole === "superadmin" && (
              <>
                <Button
                  shape="circle"
                  icon={<AiOutlineEdit />}
                  onClick={() => handleOpenUpdateProfile(record)}
                />

                <Popconfirm
                  title={
                    <div className="text-center">
                      <div className="text-lg font-medium text-gray-800 mb-2">
                        Delete User Account
                      </div>
                      <div className="text-sm text-gray-600">
                        Are you sure you want to delete <strong>{record.fname} {record.lname}</strong>?
                        <br />
                        <span className="text-red-500 font-medium">This action cannot be undone.</span>
                      </div>
                    </div>
                  }
                  onConfirm={() => handleDelete(record._id)}
                  okText="Yes, Delete"
                  cancelText="Cancel"
                  okButtonProps={{ 
                    className: "!bg-red-500 !border-red-500 hover:!bg-red-600 hover:!border-red-600",
                    danger: true,
                    size: "large"
                  }}
                  cancelButtonProps={{
                    size: "large"
                  }}
                  placement="topRight"
                  icon={<span className="text-red-500 text-xl">⚠️</span>}
                >
                  <Button shape="circle" danger icon={<AiOutlineDelete />} />
                </Popconfirm>
              </>
            )}

            <Tooltip title="View User Profile">
              <Button
                shape="circle"
                icon={<FaUser />}
                onClick={() => handleOpenProfileModal(record)}
              />
            </Tooltip>
            <Tooltip title="Give Praise">
              <Button
                shape="circle"
                icon={<FaMedal />}
                onClick={() => handleOpenModal(record)}
              />
            </Tooltip>

            <Tooltip title="Give Feedback">
              <Button
                shape="circle"
                icon={<FaComments />}
                onClick={() => handleOpenFeedbackModal(record)}
              />
            </Tooltip>

            <Tooltip title="Give Internal Nodes">
              <Button
                shape="circle"
                icon={<FaStickyNote />}
                onClick={() => handleOpenInternalNodeModal(record)}
              />
            </Tooltip>


            {(currentUserRole === "superadmin" || loggedInUserId === record._id) && (
              <Tooltip title="Request Feedbacks">
                <Button
                  shape="circle"
                  icon={<FaEnvelopeOpenText />}
                  onClick={() => handleOpenReviewModal(record)}
                />
              </Tooltip>
            )}


          </div>
        ),
    },
  ];

  return columns.filter((col) => col.visible);
};
