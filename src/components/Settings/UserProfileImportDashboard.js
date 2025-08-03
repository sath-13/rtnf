import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";
import {
  Button,
  Typography,
  Checkbox,
  Modal,
  notification,
  Tooltip,
  DatePicker,
  Input,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import {
  importUsersProfileData,
  getImportUserDetails,
} from "../../api/usersapi";
import UserProfileChartModal from "./UserProfileChartModal.js";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { toastError, toastSuccess, toastWarning } from "../../Utility/toast.js";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { Title } = Typography;

const UserProfileImportDashboard = () => {
  const [columns, setColumns] = useState([]);
  const [fileHeaders, setFileHeaders] = useState([]); // <-- add this line
  const [data, setData] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importedUsers, setImportedUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState([]);
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [isRangeView, setIsRangeView] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchImportedData = async () => {
      try {
        const users = await getImportUserDetails();
        setImportedUsers(users);
        setData(users);
        if (users && users.length > 0) {
          const exclude = ["_id", "createdAt", "updatedAt", "__v"];
          // Dynamically get all unique keys from all user objects
          const allKeys = Array.from(new Set(users.flatMap(user => Object.keys(user)))).filter(key => !exclude.includes(key));
          setColumns(allKeys);
          setFileHeaders(allKeys); // <-- ensure table headers match all DB columns
        }
      } catch (error) {
        toastError({ title: "Fetch Error", description: error.message });
      }
    };
    fetchImportedData();
  }, []);

  useEffect(() => {
    let filteredUsers = [...importedUsers];

    // Filter by search term
    if (searchTerm) {
      filteredUsers = filteredUsers.filter((user) =>
        user.employeeName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      const isSameMonth = dayjs(start).isSame(end, "month");

      if (isSameMonth) {
        const finalData = filteredUsers.filter((user) => {
          const userDate = dayjs(user.monthAndYear, "MMMM YYYY");
          return userDate.isValid() && userDate.isSame(start, "month");
        });
        setData(finalData);
        setIsRangeView(false);
      } else {
        const aggregatedData = aggregateData(
          filteredUsers,
          dayjs(start),
          dayjs(end)
        );
        setData(aggregatedData);
        setIsRangeView(true);
      }
    } else {
      setData(filteredUsers);
      setIsRangeView(false);
    }
  }, [searchTerm, dateRange, importedUsers]);

  const handleDownloadSampleFile = () => {
    // Create sample data with HR team's mandatory column names
    const sampleData = [
      {
        "Timestamp": "2024-01-31 10:00:00",
        "Email Address": "john.doe@company.com",
        "Employee ID": "EMP001",
        "Employee Name": "John Doe",
        "Month and Year (choose last day of every month)": "January 2024",
        "POM": "YES",
        "DHS %": "85.5",
        "Culture session": "YES",
        "PDC": "YES",
        "Tech PDC": "YES",
        "Planned leave - PL": "2",
        "Unplanned leave - UL": "0",
        "Restricted holiday - RH": "1",
        "No of WFH": "8",
        "Feedback in Keka": "Good performance",
        "No of Anonymous feedback if any": "0",
        "No of Good Praises in Keka": "3",
        "No of Concern Praises in Keka": "0",
        "Missing Swipes": "2",
        "Emp Monitor hrs": "160",
        "Missed hours log": "0"
      },
      {
        "Timestamp": "2024-01-31 10:00:00",
        "Email Address": "jane.smith@company.com",
        "Employee ID": "EMP002",
        "Employee Name": "Jane Smith",
        "Month and Year (choose last day of every month)": "January 2024",
        "POM": "YES",
        "DHS %": "92.0",
        "Culture session": "YES",
        "PDC": "YES",
        "Tech PDC": "NO",
        "Planned leave - PL": "1",
        "Unplanned leave - UL": "1",
        "Restricted holiday - RH": "0",
        "No of WFH": "12",
        "Feedback in Keka": "Excellent work",
        "No of Anonymous feedback if any": "1",
        "No of Good Praises in Keka": "5",
        "No of Concern Praises in Keka": "0",
        "Missing Swipes": "0",
        "Emp Monitor hrs": "168",
        "Missed hours log": "0"
      }
    ];

    // Create workbook and worksheet
    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sample Data");

    // Write to file
    XLSX.writeFile(wb, "sample_data_for_userdashboard.xlsx");
  };

  const handleFileUpload = (file) => {
    if (!selectedMonth?.length) {
      toastWarning({ title: "Select Month", description: "Please select the month for which you're uploading data." });
      return false;
    }

    // Mandatory fields as they appear in the Excel file (human-friendly headers)
    const mandatoryFields = [
      "Timestamp",
      "Email Address",
      "Employee ID",
      "Employee Name",
      "Month and Year (choose last day of every month)",
      "POM",
      "DHS %",
      "Culture session",
      "PDC",
      "Tech PDC",
      "Planned leave - PL",
      "Unplanned leave - UL",
      "Restricted holiday - RH",
      "No of WFH",
      "Feedback in Keka",
      "No of Anonymous feedback if any",
      "No of Good Praises in Keka",
      "No of Concern Praises in Keka",
      "Missing Swipes",
      "Emp Monitor hrs",
      "Missed hours log"
    ];

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const headers = rawData[0]?.map((h) =>
        h?.toString()?.trim().replace(/\s+/g, ' ')
      );
      setFileHeaders(headers);

      // Use all headers from Excel for columns/selectedColumns
      setColumns(headers);
      setSelectedColumns(headers);

      // Check if all mandatory fields are present in the uploaded file headers (case-insensitive)
      const lowerHeaders = headers.map(h => h.toLowerCase());
      const missingHeaders = mandatoryFields.filter(
        (field) => !lowerHeaders.includes(field.toLowerCase())
      );
      if (missingHeaders.length > 0) {
        toastError({ title: "Missing Required Columns", description: `The following required columns are missing: ${missingHeaders.join(", ")}. Please match the sample file.` });
        return false;
      }

      const rows = rawData.slice(1);
      let invalidRows = [];
      const jsonData = rows
        .map((row, rowIndex) => {
          const rowData = {};
          let isEmpty = true;
          let invalidMonthYear = false;

          // First, check if the row is empty (all cells are empty)
          headers.forEach((header, index) => {
            let cellValue = row[index] !== undefined ? row[index] : "";
            if (cellValue !== "") {
              isEmpty = false;
            }
            rowData[header] = cellValue;
          });

          // Skip validation for empty rows
          if (isEmpty) return null;

          // Now do month-year validation only for non-empty rows
          headers.forEach((header, index) => {
            let cellValue = row[index] !== undefined ? row[index] : "";
            if (header.toLowerCase().includes("month and year")) {
              const monthYearRegex = /^(january|february|march|april|may|june|july|august|september|october|november|december) \d{4}$/i;
              if (typeof cellValue === "number") {
                const date = XLSX.SSF.parse_date_code(cellValue);
                if (date) {
                  const monthNames = [
                    "January", "February", "March", "April", "May", "June", "July",
                    "August", "September", "October", "November", "December"
                  ];
                  cellValue = `${monthNames[date.m - 1]} ${date.y}`;
                }
              }
              if (typeof cellValue === "string") {
                cellValue = dayjs(cellValue).format("MMMM YYYY");
              }
              if (!monthYearRegex.test(cellValue)) {
                invalidMonthYear = true;
              }
            }
          });

          if (invalidMonthYear) {
            invalidRows.push(rowIndex + 2); // Excel rows are 1-indexed, +1 for header
            return null;
          }

          return rowData;
        })
        .filter(Boolean);

      if (invalidRows.length > 0) {
        toastError({
          title: "Invalid Month Format",
          description: `Rows ${invalidRows.join(", ")}: Month and Year must be in the format 'March 2025'. Please match the sample file.`
        });
        return false; // Block upload if any invalid rows
      }

      if (!jsonData.length) {
        toastError({ title: "Import Error", description: "Excel file is empty or invalid." });
        return false;
      }

      setData(jsonData);
      setIsModalOpen(true);
    };

    reader.readAsBinaryString(file);
    return false;
  };

  const handleCheckboxChange = (column, checked) => {
    setSelectedColumns((prev) =>
      checked ? [...prev, column] : prev.filter((col) => col !== column)
    );
  };
  

  const handleImport = async () => {
    if (!selectedColumns.length) {
      return toastWarning({ title: "Warning", description: "Please select at least one column to import." });
    }

    // Mapping from Excel headers to backend keys
    const columnMapping = {
      "Timestamp": "timestamp",
      "Email Address": "emailAddress",
      "Employee ID": "employeeId",
      "Employee Name": "employeeName",
      "Month and Year (choose last day of every month)": "monthAndYear",
      "POM": "pom",
      "DHS %": "dhsPercent",
      "Culture session": "cultureSession",
      "PDC": "pdc",
      "Tech PDC": "techPdc",
      "Planned leave - PL": "plannedLeavePl",
      "Unplanned leave - UL": "unplannedLeaveUl",
      "Restricted holiday - RH": "restrictedHolidayRh",
      "No of WFH": "noOfWfh",
      "Feedback in Keka": "feedbackInKeka",
      "No of Anonymous feedback if any": "noOfAnonymousFeedbackIfAny",
      "No of Good Praises in Keka": "noOfGoodPraisesInKeka",
      "No of Concern Praises in Keka": "noOfConcernPraisesInKeka",
      "Missing Swipes": "missingSwipes",
      "Emp Monitor hrs": "empMonitorHrs",
      "Missed hours log": "missedHoursLog"
    };

    try {
      // Map selectedColumns to backend keys if possible, else keep as-is (for dynamic columns)
      const backendColumns = selectedColumns.map(col => columnMapping[col] || col);
      const filteredData = data.map((row) => {
        const filtered = {};
        selectedColumns.forEach((col) => {
          const backendKey = columnMapping[col] || col; // Use mapping or keep as-is for dynamic
          filtered[backendKey] = row[col] !== undefined ? row[col] : "";
        });
        filtered["monthAndYear"] = selectedMonth?.[0] || "";
        return filtered;
      });

      // 🔍 Log the payload
      console.log("📤 Payload to Backend", {
        columns: backendColumns,
        data: filteredData,
        month: selectedMonth?.[0] || "",
      });

      setIsImporting(true);

      await importUsersProfileData({
        columns: backendColumns,
        data: filteredData,
        month: selectedMonth?.[0] || "",
      });

      toastSuccess({ title: "Import Successful", description: "User profiles imported successfully." });

      setImportedUsers(filteredData);
      setIsModalOpen(false);

      if (filteredData.length > 0) {
        const exclude = ["_id", "createdAt", "updatedAt", "__v"];
        // Dynamically get all unique keys from all imported rows
        const allKeys = Array.from(new Set(filteredData.flatMap(user => Object.keys(user)))).filter(key => !exclude.includes(key));
        setColumns(allKeys);
        setFileHeaders(allKeys);
        setSelectedColumns(allKeys);
      }
    } catch (error) {
      console.error("❌ Import Error Response:", error?.response || error);
      const errMsg = error?.response?.data?.message || "Import failed. Please try again.";
      toastError({ title: "Import Error", description: errMsg });
    } finally {
      setIsImporting(false);
    }
  };
  

  const aggregateData = (users, startDate, endDate) => {
    const aggregated = {};

    users.forEach(user => {
      const userDate = dayjs(user.monthAndYear, "MMMM YYYY");
      if (
        userDate.isValid() &&
        userDate.isSameOrAfter(startDate, "month") &&
        userDate.isSameOrBefore(endDate, "month")
      ) {
        const key = user.employeeId;

        if (!aggregated[key]) {
          aggregated[key] = {
            ...user,
            dhsPercent: 0,
            plannedLeavePl: 0,
            unplannedLeaveUl: 0,
            restrictedHolidayRh: 0,
            noOfWfh: 0,
            cultureSession: 0,
            pdc: 0,
            techPdc: 0,
            noOfAnonymousFeedbackIfAny: 0,
            noOfGoodPraisesInKeka: 0,
            noOfConcernPraisesInKeka: 0,
            count: 0,
          };
        }

        // Sum numeric fields
        aggregated[key].dhsPercent += parseFloat(user.dhsPercent) || 0;
        aggregated[key].plannedLeavePl += parseFloat(user.plannedLeavePl) || 0;
        aggregated[key].unplannedLeaveUl += parseFloat(user.unplannedLeaveUl) || 0;
        aggregated[key].restrictedHolidayRh += parseFloat(user.restrictedHolidayRh) || 0;
        aggregated[key].noOfWfh += parseFloat(user.noOfWfh) || 0;
        aggregated[key].noOfAnonymousFeedbackIfAny += parseFloat(user.noOfAnonymousFeedbackIfAny) || 0;
        aggregated[key].noOfGoodPraisesInKeka += parseFloat(user.noOfGoodPraisesInKeka) || 0;
        aggregated[key].noOfConcernPraisesInKeka += parseFloat(user.noOfConcernPraisesInKeka) || 0;

        // Count "YES" fields
        aggregated[key].cultureSession += user.cultureSession?.toLowerCase() === "yes" ? 1 : 0;
        aggregated[key].pdc += user.pdc?.toLowerCase() === "yes" ? 1 : 0;
        aggregated[key].techPdc += user.techPdc?.toLowerCase() === "yes" ? 1 : 0;

        aggregated[key].count += 1;
      }
    });

    return Object.values(aggregated).map(user => ({
      ...user,
      dhsPercent: (user.dhsPercent / user.count).toFixed(1), // average DHS
      monthAndYear: `${startDate.format("MMMM YYYY")} - ${endDate.format("MMMM YYYY")}`,
    }));
  };


  const handleRangeMonthChange = (values) => {
    if (values?.length === 2) {
      const [start, end] = values;
      const isSameMonth = dayjs(start).isSame(end, 'month');

      if (isSameMonth) {
        // Just filter, no aggregation
        const filtered = importedUsers.filter(user => {
          const userDate = dayjs(user.monthAndYear, "MMMM YYYY");
          return userDate.isValid() && userDate.isSame(start, "month");
        });
        setData(filtered);
        setIsRangeView(false);
      } else {
        // Aggregate across months
        const aggregated = aggregateData(importedUsers, dayjs(start), dayjs(end));
        setData(aggregated);
        setIsRangeView(true);
      }
    } else {
      setData(importedUsers);
      setIsRangeView(false);
    }
  };


  return (
    <div className="container mx-auto border border-border-color rounded-lg p-5 mt-4">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <Title level={2}>Import User Profiles</Title>
        <div className="flex gap-2.5 items-center">
          <Button className="custom-button" icon={<UploadOutlined />} onClick={() => setMonthModalOpen(true)}>
            Upload Excel File
          </Button>
          <input
            type="file"
            accept=".xlsx"
            ref={fileInputRef}
            className="!hidden"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleFileUpload(file);
              e.target.value = null;
            }}
          />
        </div>
      </div>

      <div className="!mt-5 !mb-5 flex flex-col sm:flex-row gap-3 items-center justify-start">
        <Input
          placeholder="Search by Employee Name"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:!w-[250px] w-full"
          allowClear
        />
        <DatePicker.RangePicker
          picker="month"
          onChange={setDateRange}
          className="sm:!w-[250px] w-full"
          allowClear
        />
      </div>

      <Modal
        title="Select Month to Upload"
        open={monthModalOpen}
        onOk={() => {
          if (!selectedMonth?.length) {
            // notification.warning({
            //   message: "Please select a month before uploading.",
            // });
            toastWarning({ title: "Warning", description: "Please select a month before uploading." });
            return;
          }
          setMonthModalOpen(false);
          fileInputRef.current.click();
        }}
        onCancel={() => setMonthModalOpen(false)}
        okText="Continue to Upload"
        okButtonProps={{ disabled: !selectedMonth?.length, className: selectedMonth.length && "custom-button" }}
      >
        <DatePicker
          picker="month"
          onChange={(value) => {
            const month = value ? value.format("MMMM YYYY") : null;
            setSelectedMonth(month ? [month] : []);
          }}
          placeholder="Select Month"
          className="!w-full !mb-2.5"
        />
        <Button className="custom-button" onClick={handleDownloadSampleFile} block>
          Download Sample File
        </Button>
      </Modal>

      <Modal
        title="Select Columns to Import"
        open={isModalOpen}
        onOk={handleImport}
        onCancel={() => setIsModalOpen(false)}
        okText="Import"
        okButtonProps={{ loading: isImporting }}
      >
        <div className="px-2">
          <Checkbox
            indeterminate={
              selectedColumns.length > 0 &&
              selectedColumns.length < columns.length
            }
            checked={selectedColumns.length === columns.length}
            onChange={(e) => {
              setSelectedColumns(e.target.checked ? columns : []);
            }}
          >
            <strong>Select All</strong>
          </Checkbox>
          <div
            className="!max-h-[300px] !overflow-y-auto !border-t !border-gray-100 !pt-2.5"
          >
            {columns.map((col) => (
              <div key={col} className="!mb-2">
                <Checkbox
                  checked={selectedColumns.includes(col)}
                  onChange={(e) => handleCheckboxChange(col, e.target.checked)}
                >
                  {col}
                </Checkbox>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {importedUsers.length > 0 && (
        <div className="mt-5">
          <div className="!overflow-x-auto">
            <table className="table table-bordered !min-w-[1200px]">
              <thead>
                <tr>
                  {fileHeaders.map((label) => (
                    <th key={label}>{label}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {data.map((user, index) => (
                  <tr key={index}>
                    {fileHeaders.map((field) => {
                      const value = user[field] || "-";
                      return <td key={field}>{value}</td>;
                    })}
                    <td>
                      <Tooltip title="View User Data">
                        <Button
                          type="link"
                          onClick={() => {
                            setSelectedUser(user);
                            setChartModalOpen(true);
                          }}
                        >
                          View
                        </Button>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <UserProfileChartModal
        open={chartModalOpen}
        user={selectedUser}
        onClose={() => setChartModalOpen(false)}
      />

    </div>
  );
};

export default UserProfileImportDashboard;
