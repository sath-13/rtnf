import React, { useState, useEffect } from "react";
import { Button, Upload, message, Typography, Table, Modal, DatePicker, Input, Tooltip } from "antd";
import { UploadOutlined, DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import Papa from "papaparse";
import { importWFHRecords, fetchWFHRecords, fetchAllWFHRecords } from "../../../api/wfhApi";
import dayjs from "dayjs";

const { Title } = Typography;
const { RangePicker } = DatePicker;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TYPES = [
  "WFH",
  "Half Day WFH",
  "Half Day Remote",
  "Remote",
  "Additional WFH After Office",
  "Night Shift"
];

const ImportWFHDailyData = () => {
  const [uploading, setUploading] = useState(false);
  const [allData, setAllData] = useState([]); // All WFH records
  const [filteredData, setFilteredData] = useState([]); // Data after filter/search
  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [selectedMonthRange, setSelectedMonthRange] = useState(null); // No default filter
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadMonth, setUploadMonth] = useState(dayjs()); // Single month for upload

  // Fetch all WFH data (using new /api/wfh/list endpoint)
  const fetchAllWFHData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllWFHRecords();
      setAllData(data);
      setFilteredData(data);
    } catch (err) {
      setAllData([]);
      setFilteredData([]);
      message.error("Failed to load WFH data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // On mount, fetch all data
  useEffect(() => {
    fetchAllWFHData();
  }, []);

  // Filter data by search and month range
  useEffect(() => {
    let data = [...allData];
    // Filter by month range using the 'date' field
    if (selectedMonthRange && selectedMonthRange.length === 2 && selectedMonthRange[0] && selectedMonthRange[1]) {
      const [start, end] = selectedMonthRange;
      data = data.filter((rec) => {
        const recDate = dayjs(rec.date); // Use 'date' field, not 'createdAt'
        return recDate.isSameOrAfter(start, 'month') && recDate.isSameOrBefore(end, 'month');
      });
    }
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (rec) =>
          (rec.employeeId && rec.employeeId.toLowerCase().includes(term)) ||
          (rec.name && rec.name.toLowerCase().includes(term))
      );
    }
    setFilteredData(data);
  }, [allData, selectedMonthRange, searchTerm]);

  // Sample template data (CSV format)
  const sampleCSV =
    ",,,Monthly Report/Summary ,,,,,Mon,Tue,Wed,Thu,Fri,Sat,Sun,Mon,Tue,Wed,Thu,Fri,Sat,Sun,Mon,Tue,Wed,Thu,Fri,Sat,Sun,Mon,Tue,Wed,Thu,Fri,Sat,Sun,Mon\n" +
    "SL,Employee ID,Name,Total WFH,Total Remote,Total Night Shift,Total Half WFH,Total Half Remote,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30\n" +
    "1,SJIGA0001,Lidya Fernandes,2,0,0,1,0,,,,,,,,WFH,,,,,,,,,,,,,,Half Day WFH,,,,,,,WFH\n";

  const handleDownloadSample = () => {
    const blob = new Blob([sampleCSV], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "sample_wfh_daily_data.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (file) => {
    if (!uploadMonth) {
      message.warning("Please select a month before uploading.");
      setUploading(false);
      return false;
    }
    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvText = e.target.result;
        const parsed = Papa.parse(csvText, { skipEmptyLines: true });
        const data = parsed.data;
        if (data.length < 3) {
          message.error("CSV file is too short or not in the expected format.");
          setUploading(false);
          return;
        }
        const mainHeaders = data[0];
        const subHeaders = data[1];
        const records = [];
        const monthStr = uploadMonth.format("YYYY-MM");
        for (let i = 2; i < data.length; i++) {
          const row = data[i];
          if (!row[1] || row[1].toLowerCase() === 'total') continue;
          const employeeId = row[1];
          const name = row[2];
          for (let j = 8; j < subHeaders.length; j++) {
            const day = subHeaders[j];
            const weekday = mainHeaders[j];
            const cell = row[j];
            if (cell && cell.trim() !== "") {
              const date = `${monthStr}-${day.padStart(2, '0')}`;
              records.push({
                employeeId,
                name,
                date,
                weekday,
                wfhType: cell.trim(),
              });
            }
          }
        }
        if (!records.length) {
          message.error("No valid records found in the file.");
          setUploading(false);
          return;
        }
        await importWFHRecords(records);
        message.success("WFH daily data imported successfully!");
        // Refresh all data after upload
        fetchAllWFHData();
      };
      reader.readAsText(file);
    } catch (err) {
      message.error("Failed to import WFH data.");
    } finally {
      setUploading(false);
    }
    return false;
  };

  // Build summary table data
  const buildSummaryData = (data) => {
    const summary = {};
    data.forEach((rec) => {
      if (!summary[rec.employeeId]) {
        summary[rec.employeeId] = { employeeId: rec.employeeId, name: rec.name };
        WEEKDAYS.forEach((day) => {
          TYPES.forEach((type) => {
            summary[rec.employeeId][`${day} (${type})`] = 0;
          });
        });
      }
      if (WEEKDAYS.includes(rec.weekday) && TYPES.includes(rec.wfhType)) {
        summary[rec.employeeId][`${rec.weekday} (${rec.wfhType})`] += 1;
      }
    });
    return Object.values(summary);
  };

  // Build grouped columns for summary table
  const summaryColumns = [
    { title: "Employee ID", dataIndex: "employeeId", key: "employeeId", fixed: 'left', width: 120 },
    { title: "Name", dataIndex: "name", key: "name", fixed: 'left', width: 180 },
    ...WEEKDAYS.map((day) => ({
      title: day,
      children: TYPES.map((type) => ({
        title: type,
        dataIndex: `${day}_${type}`,
        key: `${day}_${type}`,
        width: 90,
        align: 'center',
      })),
    })),
  ];

  // Build summary data for grouped columns
  const buildGroupedSummaryData = (data) => {
    const summary = {};
    data.forEach((rec) => {
      if (!summary[rec.employeeId]) {
        summary[rec.employeeId] = { employeeId: rec.employeeId, name: rec.name };
        WEEKDAYS.forEach((day) => {
          TYPES.forEach((type) => {
            summary[rec.employeeId][`${day}_${type}`] = 0;
          });
        });
      }
      if (WEEKDAYS.includes(rec.weekday) && TYPES.includes(rec.wfhType)) {
        summary[rec.employeeId][`${rec.weekday}_${rec.wfhType}`] += 1;
      }
    });
    return Object.values(summary);
  };

  const columns = [
    { title: "Employee ID", dataIndex: "employeeId", key: "employeeId" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Date", dataIndex: "date", key: "date" },
    { title: "Weekday", dataIndex: "weekday", key: "weekday" },
    { title: "WFH Type", dataIndex: "wfhType", key: "wfhType" },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>Import Daily WFH Data</Title>
      {/* Main filter/search controls */}
      <div className="import-user-profile-filters" style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
        <Input.Search
          placeholder="Search by Employee Name or ID"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ width: 320 }}
          allowClear
        />
        <RangePicker
          value={selectedMonthRange}
          onChange={setSelectedMonthRange}
          picker="month"
          allowClear
          style={{ width: 260 }}
        />
        <div style={{ flex: 1 }} />
        <Button
          type="primary"
          style={{ background: '#4F46E5', borderColor: '#4F46E5', minWidth: 180, height: 40, fontWeight: 600 }}
          onClick={() => setMonthModalOpen(true)}
        >
          <DownloadOutlined style={{ marginRight: 8 }} /> Upload WFH Data CSV
        </Button>
      </div>
      {/* Upload modal with single month picker and Download Sample File inside */}
      <Modal
        title="Select Month to Upload"
        open={monthModalOpen}
        onOk={() => {
          if (!uploadMonth) {
            message.warning("Please select a month before uploading.");
            return;
          }
          setMonthModalOpen(false);
          document.getElementById("wfh-upload-input").click();
        }}
        onCancel={() => setMonthModalOpen(false)}
        okText="Continue to Upload"
        okButtonProps={{ disabled: !uploadMonth }}
      >
        <DatePicker
          picker="month"
          value={uploadMonth}
          onChange={setUploadMonth}
          className="!w-full !mb-2.5"
          allowClear
        />
        <Button icon={<DownloadOutlined />} onClick={handleDownloadSample} block style={{ marginTop: 12 }}>
        Download Sample File
      </Button>
      </Modal>
      <Upload
        id="wfh-upload-input"
        accept=".csv"
        showUploadList={false}
        beforeUpload={handleFileUpload}
        disabled={uploading}
        style={{ display: "none" }}
      >
        <Button style={{ display: "none" }} />
      </Upload>
        <div style={{ marginTop: 32 }}>
        {loading ? (
          <div style={{ textAlign: 'center', margin: 40 }}><b>Loading...</b></div>
        ) : filteredData.length > 0 ? (
          <>
          <Title level={4} style={{ marginTop: 32 }}>Summary Table (Counts per Weekday & Type)</Title>
          <Table
              dataSource={buildGroupedSummaryData(filteredData)}
            columns={summaryColumns}
            rowKey={(record) => record.employeeId}
              scroll={{ x: 1800 }} // ensure horizontal scroll is always visible
            pagination={{ pageSize: 10 }}
              bordered
              // Add custom header cell style for weekday groups
              components={{
                header: {
                  cell: (props) => {
                    // Add a background color to weekday group headers
                    if (props.colSpan > 1 && WEEKDAYS.includes(props.children)) {
                      return <th {...props} style={{ background: '#f5f5fa', borderRight: '2px solid #e0e0e0', textAlign: 'center' }}>{props.children}</th>;
                    }
                    return <th {...props} />;
                  }
                }
              }}
            />
          </>
        ) : (
          <div style={{ textAlign: 'center', margin: 40 }}><b>No WFH data found for the selected filters.</b></div>
        )}
        </div>
    </div>
  );
};

export default ImportWFHDailyData;
