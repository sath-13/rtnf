import React, { useEffect, useState } from "react";
import { Card, Avatar, Descriptions, Tag, Image, Spin, Tabs, Button, message, Tooltip, Typography, DatePicker, Row, Col } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./ViewProfile.css";

import { getUserFeedback } from "../../../../api/feedbackapi";
import InternalNodeList from "../Feedback/InternalNodes_Display";
import { getUserProfileByKey, getImportUserDetails } from "../../../../api/usersapi";

import { getPerUserBadgesAPI } from "../../../../api/Badgeapi";
import PraiseTab from "./PraiseTab/PraiseTab";
import InternalNodes from "../Feedback/InternalNodes";
import UserProfileChartModal from "../../../Settings/UserProfileChartModal";
import YearlyPerformanceDashboard from "./YearlyPerformanceDashboard";
import './YearlyPerformanceDashboard.css';


dayjs.extend(relativeTime);

const { Text } = Typography;
const { RangePicker } = DatePicker;

const isUserMatch = (data, user) => {
  if (!data || !user) return false;

  const userEmployeeId = user.employeeId;
  const userEmail = user.email?.toLowerCase();

  const isEmployeeIdMatch = userEmployeeId && data.employeeId === userEmployeeId;
  const isEmailMatch = userEmail && data.emailAddress?.toLowerCase() === userEmail;

  let isNameMatch = false;
  if (data.employeeName && user.fname && user.lname) {
    const importedNameLower = data.employeeName.toLowerCase();
    const userFnameLower = user.fname.toLowerCase();
    const userLnameLower = user.lname.toLowerCase();
    isNameMatch =
      importedNameLower.includes(userFnameLower) &&
      importedNameLower.includes(userLnameLower);
  }

  return isEmployeeIdMatch || isEmailMatch || isNameMatch;
};


const ViewProfile = ({ selectedUser, workspaceName }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about"); // For top-level navigation (About, Performance)
  const [performanceTab, setPerformanceTab] = useState("Overview"); // For Performance section (Objectives, Feedbacks)
  const [feedbackTab, setFeedbackTab] = useState("praise"); // For Feedback section (Praise, Feedback, Internal Notes, See Internal Notes)
  const [praiseBadges, setPraiseBadges] = useState([]);

  const [generalFeedback, setGeneralFeedback] = useState([]);

  const [importedUserData, setImportedUserData] = useState([]);
  const [selectedMonthRange, setSelectedMonthRange] = useState([]);
  const [selectedYear, setSelectedYear] = useState(dayjs());
  const [yearlyData, setYearlyData] = useState(null);
  const [filteredUser, setFilteredUser] = useState(null);
  const [isChartModalOpen, setIsChartModalOpen] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user"));
  const loggedInUserId = loggedInUser?.id || loggedInUser?._id;

  useEffect(() => {
    if (!selectedUser?.key) return;
    const fetchUser = async () => {
      try {
        const data = await getUserProfileByKey(selectedUser.key);
        setUser(data);

        if (data?._id) {
          const badges = await getPerUserBadgesAPI(data._id);
          setPraiseBadges(badges);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [selectedUser]);

  useEffect(() => {
    if (!user?._id || !workspaceName) return;
    const fetchFeedback = async () => {
      try {
        const general = await getUserFeedback(user._id, workspaceName);
        setGeneralFeedback(general || []);
      } catch (error) {
        console.error("Error fetching feedback:", error.message);
        setGeneralFeedback([]);
      }
    };
    fetchFeedback();
  }, [user, workspaceName]);

  useEffect(() => {
    const fetchImportedData = async () => {
      try {
        const data = await getImportUserDetails();
        setImportedUserData(data);
      } catch (error) {
        console.error("Failed to fetch imported user data:", error.message);
        message.error("Failed to load performance data.");
      }
    };
    fetchImportedData();
  }, []);

  useEffect(() => {
    const year = selectedYear ? selectedYear.year() : null;

    if (!year || !user || !importedUserData || !importedUserData.length) {
      setYearlyData(null);
      return;
    }

    const yearlyFilteredData = importedUserData.filter(data => {
      if (!data.monthAndYear) return false;
      
      const recordDate = dayjs(data.monthAndYear, "MMMM YYYY");
      if (!recordDate.isValid() || recordDate.year() !== year) {
        return false;
      }

      return isUserMatch(data, user);
    });

    if (yearlyFilteredData.length === 0) {
        setYearlyData(null);
        return;
    }

    // Aggregate data
    const aggregatedData = yearlyFilteredData.reduce((acc, data) => {
      acc.totalPlannedLeaves += parseInt(data.plannedLeavePl, 10) || 0;
      acc.totalUnplannedLeaves += parseInt(data.unplannedLeaveUl, 10) || 0;
      acc.totalUnpaidLeaves += parseInt(data.unpaidLeave, 10) || 0;
      acc.totalRestrictedHolidays += parseInt(data.restrictedHolidayRh, 10) || 0;
      acc.totalMaternityLeaves += parseInt(data.maternityLeave, 10) || 0;
      acc.totalPaternityLeaves += parseInt(data.paternityLeave, 10) || 0;
      acc.totalGoodBadges += parseInt(data.noOfGoodPraisesInKeka, 10) || 0;
      acc.totalConcernBadges += parseInt(data.noOfConcernPraisesInKeka, 10) || 0;
      acc.wfhCount += parseInt(data.noOfWfh, 10) || 0;
      acc.cultureSessionAttended += (data.cultureSession?.toLowerCase() === 'yes' ? 1 : 0);
      
      if (data.dhsPercent) {
        acc.dhsValues.push(parseFloat(data.dhsPercent));
      }

      acc.pdcStatus = acc.pdcStatus || (data.pdc?.toLowerCase() === 'completed');

      const month = dayjs(data.monthAndYear, "MMMM YYYY").format("MMM");
      const monthData = acc.monthlyLeaveData.find(m => m.month === month);

      if (monthData) {
        monthData.planned += parseInt(data.plannedLeavePl, 10) || 0;
        monthData.unplanned += parseInt(data.unplannedLeaveUl, 10) || 0;
        monthData.unpaid += parseInt(data.unpaidLeave, 10) || 0;
        monthData.rh += parseInt(data.restrictedHolidayRh, 10) || 0;
        monthData.maternity += parseInt(data.maternityLeave, 10) || 0;
        monthData.paternity += parseInt(data.paternityLeave, 10) || 0;
      }

      return acc;
    }, {
      totalPlannedLeaves: 0,
      totalUnplannedLeaves: 0,
      totalUnpaidLeaves: 0,
      totalRestrictedHolidays: 0,
      totalMaternityLeaves: 0,
      totalPaternityLeaves: 0,
      totalGoodBadges: 0,
      totalConcernBadges: 0,
      wfhCount: 0,
      cultureSessionAttended: 0,
      dhsValues: [],
      pdcStatus: false,
      monthlyLeaveData: [
        { month: 'Jan', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Feb', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Mar', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Apr', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'May', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Jun', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Jul', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Aug', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Sep', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Oct', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Nov', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 },
        { month: 'Dec', planned: 0, unplanned: 0, unpaid: 0, rh: 0, maternity: 0, paternity: 0 }
      ]
    });

    if (aggregatedData.dhsValues.length > 0) {
      const sum = aggregatedData.dhsValues.reduce((a, b) => a + b, 0);
      aggregatedData.dhsPercentage = Math.round(sum / aggregatedData.dhsValues.length);
    } else {
      aggregatedData.dhsPercentage = 0;
    }
    delete aggregatedData.dhsValues;

    setYearlyData(aggregatedData);
  }, [selectedYear, importedUserData, user]);


  if (loading) return <div className="profile-container"><Spin size="large" /></div>;
  if (!user) return <p>User not found</p>;

  const fullName = `${user.fname} ${user.lname}`;
  const isDirectManager = loggedInUserId === user.directManager?.toString();

  const handleViewReport = () => {
    if (!selectedMonthRange || selectedMonthRange.length === 0) {
      message.warning("Please select a month or range to view the report.");
      return;
    }

    if (!user || (!user.employeeId && !user.email && !fullName.trim())) {
      message.error(
        "User employee ID, email, or name is not available to match data."
      );
      return;
    }

    // If only one month is selected, treat as single month
    let startMonth, endMonth;
    if (selectedMonthRange.length === 1) {
      startMonth = endMonth = selectedMonthRange[0];
    } else {
      [startMonth, endMonth] = selectedMonthRange;
    }
    if (!startMonth || !endMonth) {
      message.warning("Please select a valid month or range.");
      return;
    }

    // Filter and aggregate data for the selected range
    const start = startMonth.startOf('month');
    const end = endMonth.endOf('month');
    const filtered = importedUserData.filter((data) => {
      if (!data.monthAndYear) return false;
      const recordDate = dayjs(data.monthAndYear, "MMMM YYYY");
      if (!recordDate.isValid()) return false;
      return isUserMatch(data, user) && recordDate.isBetween(start, end, null, '[]');
    });

    if (filtered.length === 0) {
      message.warning("No performance data found for the selected period.");
      return;
    }

    // Aggregate the filtered data for the modal
    const aggregated = filtered.reduce((acc, data) => {
      acc.noOfGoodPraisesInKeka = (acc.noOfGoodPraisesInKeka || 0) + (parseInt(data.noOfGoodPraisesInKeka, 10) || 0);
      acc.noOfConcernPraisesInKeka = (acc.noOfConcernPraisesInKeka || 0) + (parseInt(data.noOfConcernPraisesInKeka, 10) || 0);
      acc.plannedLeavePl = (acc.plannedLeavePl || 0) + (parseInt(data.plannedLeavePl, 10) || 0);
      acc.unplannedLeaveUl = (acc.unplannedLeaveUl || 0) + (parseInt(data.unplannedLeaveUl, 10) || 0);
      acc.restrictedHolidayRh = (acc.restrictedHolidayRh || 0) + (parseInt(data.restrictedHolidayRh, 10) || 0);
      acc.dhsPercent = (acc.dhsPercent || 0) + (parseFloat(data.dhsPercent) || 0);
      acc.cultureSession = (acc.cultureSession || 0) + (data.cultureSession?.toLowerCase() === 'yes' ? 1 : 0);
      acc.noOfWfh = (acc.noOfWfh || 0) + (parseInt(data.noOfWfh, 10) || 0);
      acc.pdc = (acc.pdc || 0) + (parseInt(data.pdc, 10) || 0);
      acc.count = (acc.count || 0) + 1;
      acc.employeeId = data.employeeId;
      acc.employeeName = data.employeeName;
      acc.businessUnit = data.businessUnit;
      acc.emailAddress = data.emailAddress;
      // Add other fields as needed
      return acc;
    }, {});
    // Average DHS %
    if (aggregated.count) {
      aggregated.dhsPercent = (aggregated.dhsPercent / aggregated.count).toFixed(1);
    }
    setFilteredUser(aggregated);
    setIsChartModalOpen(true);
  };

  return (
    <div className="profile-container">
      <Card className="profile-card" variant="borderless">
        <div className="profile-header-keka">
          <div className="profile-header-left">
            {user.workspaceLogo ? (
              <Image
                width={80}
                src={user.workspaceLogo}
                alt="Workspace Logo"
                className="!rounded-full"
              />
            ) : (
              <Avatar size={80} icon={<UserOutlined />} />
            )}
            <div className="name-and-details">
              <h2>{fullName}</h2>
              <div className="job-details">
                <span className="job-title">{user.jobTitle || "N/A"}</span>
                {user.level && <span className="level">{user.level}</span>}
                {user.status && (
                  <Tag color={user.status === "active" ? "green" : "red"}>
                    {user.status.toUpperCase()}
                  </Tag>
                )}
              </div>
            </div>
          </div>
          <div className="profile-header-right">
            {user.email && <div className="contact-info"><span>{user.email}</span></div>}
            {user.phone && <div className="contact-info"><span>{user.phone}</span></div>}
            {user.companyName && (
              <div className="company-info">
                <span>{user.companyName}</span>
                {user.location && <span>{user.location}</span>}
                {user.employeeId && <span>{user.employeeId}</span>}
              </div>
            )}
          </div>
        </div>

        <div className="profile-navigation">
          <div
            className={`nav-item ${activeTab === "about" ? "active" : ""}`}
            onClick={() => setActiveTab("about")}
          >
            About
          </div>
          <div
            className={`nav-item ${activeTab === "performance" ? "active" : ""}`}
            onClick={() => setActiveTab("performance")}
          >
            Performance
          </div>
        </div>

        <div className="profile-content">
          {activeTab === "about" && (
            <div className="about-section">
              <h3>Objectives</h3>
              <p>Objectives help you define what you want to achieve.</p>
              <Descriptions title="More Details" bordered column={1}>
                {user.username && <Descriptions.Item label="Username">{user.username}</Descriptions.Item>}
                {user.role && (
                  <Descriptions.Item label="Role">
                    <Tag color={user.role === "admin" ? "volcano" : "geekblue"}>
                      {user.role?.toUpperCase()}
                    </Tag>
                  </Descriptions.Item>
                )}
                {user.teamTitle && (
                  <Descriptions.Item label="Team Title">
                    {user.teamTitle?.join(", ") || "N/A"}
                  </Descriptions.Item>
                )}
                {user.workspaceName && (
                  <Descriptions.Item label="Workspace(s)">
                    {user.workspaceName?.join(", ") || "N/A"}
                  </Descriptions.Item>
                )}
                {user.delegatedUser && (
                  <Descriptions.Item label="Delegated User ID">
                    {user.delegatedUser || "N/A"}
                  </Descriptions.Item>
                )}
                {user.createdAt && (
                  <Descriptions.Item label="Account Created">
                    {new Date(user.createdAt).toLocaleString()}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          )}

          {activeTab === "performance" && (
            <div className="performance-section">
              <Tabs activeKey={performanceTab} onChange={setPerformanceTab}>
                <Tabs.TabPane tab="Profile Performance Overview" key="Overview">
                    <Row justify="space-between" align="middle" className="dashboard-control-panel">
                        <Col>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <Text strong style={{ fontSize: '1.1rem' }}>Yearly Dashboard</Text>
                                <DatePicker
                                    picker="year"
                                    onChange={setSelectedYear}
                                    placeholder="Select Year"
                                    value={selectedYear}
                                />
                            </div>
                        </Col>
                        <Col>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Text strong style={{ fontSize: '1.1rem' }}>Monthly Report</Text>
                                <RangePicker
                                    picker="month"
                                    onCalendarChange={(dates) => setSelectedMonthRange(dates ? dates.filter(Boolean) : [])}
                                    placeholder={["Start Month", "End Month"]}
                                    allowClear
                                    style={{ minWidth: 220 }}
                                />
                                <Button
                                    type="primary"
                                    onClick={handleViewReport}
                                >
                                    View Report
                                </Button>
                            </div>
                        </Col>
                    </Row>
                  <YearlyPerformanceDashboard yearlyData={yearlyData} year={selectedYear.year()} user={user} />
                </Tabs.TabPane>
                
                <Tabs.TabPane tab="Objectives" key="objectives">
                  <h4>Objectives</h4>
                  <p>Here are the objectives that help track the user's performance.</p>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Feedbacks" key="feedbacks">
                  <Tabs activeKey={feedbackTab} onChange={setFeedbackTab}>
                    <Tabs.TabPane tab="Praise" key="praise">
                      <PraiseTab praiseBadges={praiseBadges} />
                    </Tabs.TabPane>

                    <Tabs.TabPane tab="Feedback" key="feedback">
                      <h4>Feedback</h4>
                      {Array.isArray(generalFeedback) && generalFeedback.length === 0 ? (
                        <p>No general feedback available.</p>
                      ) : (
                        generalFeedback.map((item, index) => {
                          const isAdmin = ["admin", "superadmin"].includes(loggedInUser?.role);
                          const showRealName = item.feedbackType !== "anonymous" || isAdmin;

                          return (
                            <Card key={index} className="feedback-item-card !mb-4">
                              <div className="feedback-header !flex !items-center">
                                <Tooltip title={showRealName ? item.fromUserName : "Anonymous"}>
                                  <Avatar
                                    src={showRealName ? item.fromUserLogo : null}
                                    icon={!showRealName ? <UserOutlined /> : null}
                                    className="feedback-avatar"
                                  />
                                </Tooltip>

                                <div className="feedback-info !ml-3">
                                  <Text strong>{showRealName ? item.fromUserName : "Anonymous"}</Text>
                                  <span className="feedback-time !ml-2 !text-gray-400">
                                    {dayjs(item.createdAt).fromNow()}
                                  </span>
                                </div>
                              </div>

                              <Text className="feedback-description !mt-2 !block">
                                {item.description || item.message}
                              </Text>
                            </Card>
                          );
                        })
                      )}
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="Internal Notes" key="internal-notes">
                      <h4>Internal Notes</h4>
                      <p>Notes related to the user's internal performance.</p>
                      <InternalNodes
                        selectedUser={selectedUser}
                        onClose={() => { }}
                      />
                    </Tabs.TabPane>
                    {isDirectManager && (
                      <Tabs.TabPane tab="See Internal Notes" key="see-internal-notes">
                        <h4>See Internal Notes</h4>
                        <InternalNodeList userId={user._id} />
                      </Tabs.TabPane>
                    )}
                  </Tabs>
                </Tabs.TabPane>
              </Tabs>
            </div>
          )}
        </div>
      </Card>
      <UserProfileChartModal
        open={isChartModalOpen}
        user={filteredUser}
        onClose={() => setIsChartModalOpen(false)}
      />
    </div>
  );
};

export default ViewProfile;
