import React from "react";
import { Popconfirm, Button } from "antd";
import { AiOutlineDelete } from "react-icons/ai";

const ImportListColumns = ( handleDelete) => [
  {
    title: "First Name",
    dataIndex: "fname",
    render: (text) => <span>{text}</span>,
  },
  {
    title: "Last Name",
    dataIndex: "lname",
    render: (text) => <span>{text}</span>,
  },
  {
    title: "Email",
    dataIndex: "email",
    render: (text) => <span>{text}</span>,
  },
  {
    title: "Role",
    dataIndex: "role",
    render: (text) => <span>{text}</span>,
  },
  {
    title: "Branch",
    dataIndex: "branch",
    render: (text) => <span>{text}</span>,
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (text) => <span>{text}</span>,
  },
  {
    title: "Actions",
    render: (text, record) => (
      <Popconfirm
        title="Are you sure to delete this user?"
        onConfirm={() => handleDelete(record._id)}
        okText="Yes"
        cancelText="No"
      >
        <Button shape="circle" danger icon={<AiOutlineDelete />} />
      </Popconfirm>
    ),
  },
];

export default ImportListColumns;
