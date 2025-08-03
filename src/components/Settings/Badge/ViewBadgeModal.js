// components/ViewBadgesModal.js

import React, { useState } from "react";
import { Modal, Select, DatePicker, Button, Card, Tooltip } from "antd";
import dayjs from "dayjs";
import { exportBadgesToCSV } from "./ExportsData";

const { RangePicker } = DatePicker;

const ViewBadgesModal = ({
  isOpen,
  onClose,
  selectedUser,
  getBadgeIcon,
}) => {
  const [dateRange, setDateRange] = useState([null, null]); // State for the date range
  const [badgeTypeFilter, setBadgeTypeFilter] = useState(""); // State for badge type filter

  // Function to filter badges based on date range and badge type
  const filterBadges = () => {
    if (!selectedUser?.assignedBadges) return [];

    const filteredByDate = dateRange && dateRange[0] && dateRange[1]
      ? selectedUser.assignedBadges.filter((badge) => {
        const assignedAt = dayjs(badge.assignedAt);
        return assignedAt.isBetween(dateRange[0], dateRange[1], null, "[]");
      })
      : selectedUser.assignedBadges;

    if (badgeTypeFilter) {
      return filteredByDate.filter((badge) => badge.badgeType === badgeTypeFilter);
    }

    return filteredByDate;
  };

  // Filtered badges after applying both date range and badge type filters
  const filteredBadges = filterBadges();

  return (
    <Modal
      title={`Assigned Badges To ${selectedUser ? `${selectedUser.fname} ${selectedUser.lname}` : "User"}`}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={650}
    >
      {/* Filters inside modal, aligned to the right */}
      <div className="flex justify-end mb-2.5 gap-2.5">
        <Tooltip title="Date Range">
          <RangePicker
            onChange={setDateRange} // Set date range filter state
          />
        </Tooltip>

        <Tooltip title="Filter By Badge Type">
          <Select
            className="!w-[150px]"
            placeholder="Badge Type"
            onChange={setBadgeTypeFilter} // Set badge type filter state
            allowClear
          >
            <Select.Option value="praise">Praise</Select.Option>
            <Select.Option value="concern">Concern</Select.Option>
          </Select>
        </Tooltip>

        <Button
          type="primary"
          onClick={() =>
            exportBadgesToCSV(filteredBadges, `${selectedUser?.fname || "user"}_badges.csv`)
          }
        >
          Export CSV
        </Button>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-2.5">
        {filteredBadges.length > 0 ? (
          filteredBadges.map((badge, index) => (
            <Card
              key={index}
              className="!flex !items-center !gap-[15px] !p-[15px] !mb-[15px] !bg-[#f5f5f5] !rounded-[10px] !shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
            >
              {getBadgeIcon(badge.badgeIcon)}
              <div>
                <h3 className="!mb-[5px] !text-[#333]">{badge.badgeName}</h3>
                <p className="!mb-[5px] !text-[#555]">
                  <b>Description:</b> {badge.badgeDescription}
                </p>
                <p className="!mb-[5px] !text-[#555]">
                  <b>Type:</b> {badge.badgeType}
                </p>
                <p className="!mb-[5px] !text-[#777]">
                  <b>Assigned By:</b> {badge.assignedBy.name} ({badge.assignedBy.email})
                </p>
                <p className="!text-[#888]">
                  <b>Assigned At:</b> {dayjs(badge.assignedAt).format("YYYY-MM-DD HH:mm")}
                </p>
              </div>
            </Card>
          ))
        ) : (
          <p className="!text-center !text-[#888] !text-base">No badges assigned.</p>
        )}
      </div>
    </Modal>
  );
};

export default ViewBadgesModal;
