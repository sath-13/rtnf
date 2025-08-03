import { useEffect, useMemo } from "react";
import { SettingOutlined } from "@ant-design/icons";
import { Checkbox, Dropdown, Menu, Tooltip } from "antd";
import { getColumns } from "./ColumnsConfig";

const ColumnSettings = ({ visibleColumns, setVisibleColumns, showSystemDetails }) => {
  // Get all columns from the getColumns function with dynamic system details
  const allColumns = useMemo(() => {
    return getColumns(
      null,
      null,
      null,
      null,
      showSystemDetails
    ).map((col) => col.title);
  }, [showSystemDetails]);

  // Define the default visible columns
  const DEFAULT_VISIBLE_COLUMNS = useMemo(() => [
    "Serial Number",
    "Date Of Purchase",
    "Branch",
    "Action",
    "Asset Name",
    "Product Category",
    "Product Type",
    "Asset Status",
    "Asset Image",
    "Asset Document",
  ], []);

  useEffect(() => {
    // Set the default visible columns if no columns are visible
    setVisibleColumns((prev) =>
      prev.length === 0 ? DEFAULT_VISIBLE_COLUMNS : prev
    );
  }, [DEFAULT_VISIBLE_COLUMNS, setVisibleColumns]);

  const handleColumnChange = (column, checked) => {
    // Update visible columns when checkbox is toggled
    if (checked) {
      setVisibleColumns((prev) => [...prev, column]);
    } else {
      setVisibleColumns((prev) => prev.filter((col) => col !== column));
    }
  };

  // Column menu for selecting which columns to display
  const columnMenu = (
    <Menu>
      {allColumns.map((col) => (
        <Menu.Item key={col}>
          <Checkbox
            checked={visibleColumns.includes(col)} // Whether the column is visible
            disabled={DEFAULT_VISIBLE_COLUMNS.includes(col)} // Lock essential columns
            onChange={(e) => handleColumnChange(col, e.target.checked)} // Toggle visibility
          >
            {col}
          </Checkbox>
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <Dropdown overlay={columnMenu} trigger={["click"]}>
      <Tooltip title="Column Settings">
        <SettingOutlined className="!text-xl !cursor-pointer" />
      </Tooltip>
    </Dropdown>
  );
};

export default ColumnSettings;
