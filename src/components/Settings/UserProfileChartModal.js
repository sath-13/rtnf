import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
import { Modal } from "antd";

const COLORS = ["#00C49F", "#FF8042", "#0088FE"];

const fieldBoxClasses = "border border-gray-300 rounded-xl p-3 m-2 bg-gray-50 shadow-sm flex-grow flex-shrink basis-1/5 min-w-[22%]";

const UserProfileChartModal = ({ user, open, onClose }) => {
  if (!user) return null;

  const goodBadges = Number(user.noOfGoodPraisesInKeka || 0);
  const concernBadges = Number(user.noOfConcernPraisesInKeka || 0);
  const totalBadges = goodBadges + concernBadges;

  const leaveData = [
    { name: "Planned Leave", value: Number(user.plannedLeavePl || 0) },
    { name: "Unplanned Leave", value: Number(user.unplannedLeaveUl || 0) },
    { name: "Restricted Holiday", value: Number(user.restrictedHolidayRh || 0) },
  ];

  const dhsScore = Math.min(Number(user.dhsPercent || 0), 100);
  const badgeScore = totalBadges ? (goodBadges / totalBadges) * 100 : 0;
  const unplannedLeavePenalty = Math.min(Number(user.unplannedLeaveUl || 0), 5) * 2;
  const overallScore = (
    dhsScore * 0.5 +
    badgeScore * 0.5 -
    unplannedLeavePenalty
  ).toFixed(1);

  return (
    <Modal
      open={open}
      title={"Employee Dashboard"}
      onCancel={onClose}
      footer={null}
      width={1000}
    >
      {/* ROW 1 */}
      <div className="d-flex flex-wrap mb-3">
        <div className={fieldBoxClasses}>
          <strong className="!text-base">Employee Number:</strong>
          <p className="!text-lg !mb-0">{user.employeeId}</p>
        </div>
        <div className={fieldBoxClasses}>
          <strong className="!text-base">Full Name:</strong>
          <p className="!text-lg !mb-0">{user.employeeName}</p>
        </div>
        <div className={fieldBoxClasses}>
          <strong className="!text-base">Business Unit:</strong>
          <p className="!text-lg !mb-0">{user.businessUnit}</p>
        </div>
        <div className={fieldBoxClasses}>
          <strong className="!text-base">PDC:</strong>
          <p className="!text-lg !mb-0">{user.pdc}</p>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="d-flex flex-wrap mb-3">
        <div className={fieldBoxClasses}>
          <strong className="!text-base">Culture Session:</strong>
          <p className="!text-lg !mb-0">{user.cultureSession}</p>
        </div>
        <div className={fieldBoxClasses}>
          <strong className="!text-base">DHS %:</strong>
          <p className="!text-lg !mb-0">{user.dhsPercent}</p>
        </div>
        <div className={fieldBoxClasses}>
          <strong className="!text-base">Concern Badges:</strong>
          <p className="!text-lg !mb-0">{concernBadges}</p>
        </div>
        <div className={fieldBoxClasses}>
          <strong className="!text-base">WFH:</strong>
          <p className="!text-lg !mb-0">{user.noOfWfh || 0}</p>
        </div>
      </div>

      {/* ROW 3 */}
      <div className="d-flex flex-wrap mb-4">
        <div className={`${fieldBoxClasses} !flex-grow !flex-shrink !basis-[45%]`}>
          <strong className="!text-base">Good Badges:</strong>
          <p className="!text-lg !mb-0">{goodBadges}</p>
        </div>
        <div className={`${fieldBoxClasses} !flex-grow !flex-shrink !basis-[45%]`}>
          <strong className="!text-base">Total Badges:</strong>
          <p className="!text-lg !mb-0">{totalBadges}</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="d-flex flex-wrap">
        {/* Pie Chart */}
        <div className="!p-2 !w-1/2 !pr-4">
          <div className={`${fieldBoxClasses} !h-full`}>
            <h5 className="!text-xl">Leave Summary</h5>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={leaveData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label
                >
                  {leaveData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart + Score */}
        <div className="!p-2 !w-1/2 !pl-4">
          <div className={`${fieldBoxClasses} !mb-4`}>
            <h5 className="!text-xl">Badges Breakdown</h5>
            <ResponsiveContainer width="100%" height={100}>
              <BarChart
                layout="vertical"
                data={[
                  { name: "Total Badges", value: totalBadges },
                  { name: "Good Badges", value: goodBadges },
                  { name: "Concern Badges", value: concernBadges },
                ]}
                margin={{ left: 20, right: 20 }}
              >
                <Tooltip />
                <Bar dataKey="value" radius={[5, 5, 5, 5]}>
                  <Cell fill="#0088FE" />
                  <Cell fill="#00C49F" />
                  <Cell fill="#FF4C4C" />
                </Bar>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score */}
          <div className={`${fieldBoxClasses} !bg-blue-50 !text-center`}>
            <strong className="!text-4xl">Overall Score:</strong>
            <p className="!text-4xl !m-0">{overallScore}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserProfileChartModal;
