import React, { useEffect, useState } from "react";
import { Card, Avatar, message, Spin, Tooltip, Typography } from "antd";
import { GiftOutlined, UserOutlined } from "@ant-design/icons";
import { getMonthlyAnniversariesAPI } from "../../../api/anniverseryapi";
import "./Anniversary.css";
import { toastError } from "../../../Utility/toast";

const { Title } = Typography;

const Anniversary = () => {
  const [todayAnniversaries, setTodayAnniversaries] = useState([]);
  const [upcomingAnniversaries, setUpcomingAnniversaries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnniversaries();
  }, []);

  const fetchAnniversaries = async () => {
    setLoading(true);
    try {
      const { today, upcoming } = await getMonthlyAnniversariesAPI();

      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0); // normalize to compare only date

      const filteredUpcoming = upcoming.filter((emp) => {
        const joiningDate = new Date(emp.joiningDate);
        joiningDate.setFullYear(todayDate.getFullYear()); // use this year for comparison
        joiningDate.setHours(0, 0, 0, 0);

        return joiningDate > todayDate; // only future anniversaries
      });

      setTodayAnniversaries(today);
      setUpcomingAnniversaries(filteredUpcoming);
    } catch (err) {
      console.error("Error fetching anniversaries:", err);
      // message.error("Failed to load anniversaries");
      toastError({ title: "Error", description: "Failed to load anniversaries" });
    } finally {
      setLoading(false);
    }
  };


  const getFormattedDate = (joiningDate, isToday) => {
    const dateObj = new Date(joiningDate);
    if (isToday) return "Today";

    const day = dateObj.getDate();
    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
          ? "nd"
          : day % 10 === 3 && day !== 13
            ? "rd"
            : "th";

    const month = dateObj.toLocaleString("default", { month: "long" });
    return `${day}${suffix} ${month}`;
  };

  const renderAnniversaryList = (data) => (
    <div className="anniversary-list">
      {data.map((emp) => (
        <div className="anniversary-item" key={emp.name + emp.joiningDate}>
          <Avatar
            size={64}
            src={emp.userLogo && emp.userLogo.trim() !== "" ? emp.userLogo : null}
            icon={(!emp.userLogo || emp.userLogo.trim() === "") && <UserOutlined />}
            alt={emp.name}
          />
          <div className="anniversary-info">
            <Tooltip title={`Joined on ${new Date(emp.joiningDate).toDateString()}`}>
              <div className="name">{emp.name}</div>
            </Tooltip>
            <div className="years">
              🎉 {emp.yearsCompleted} year{emp.yearsCompleted > 1 ? "s" : ""} completed
            </div>
            <div className="date-label">{getFormattedDate(emp.joiningDate, emp.isToday)}</div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Card
      title={
        <span>
          <GiftOutlined /> Work Anniversaries -{" "}
          {new Date().toLocaleString("default", { month: "long" })}
        </span>
      }
      className="anniversary-card"
    >
      {loading ? (
        <Spin />
      ) : (
        <>
          <Title level={5}>🎊 Today's Anniversaries</Title>
          {todayAnniversaries.length
            ? renderAnniversaryList(todayAnniversaries)
            : <div>No work anniversaries today</div>}

          <Title level={5} style={{ marginTop: 20 }}>
            📅 Upcoming This Month
          </Title>
          {upcomingAnniversaries.length
            ? renderAnniversaryList(upcomingAnniversaries)
            : <div>No upcoming anniversaries this month</div>}
        </>
      )}
    </Card>
  );
};

export default Anniversary;
