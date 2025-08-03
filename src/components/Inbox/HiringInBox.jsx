import React, { useEffect, useState } from "react";
import {
  List,
  Avatar,
  Spin,
  Typography,
  Empty,
  Badge,
  Tooltip,
  Tag,
} from "antd";
import { getAllHiringInInbox } from "../../api/hiringApi";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "./hiringInbox.css";

dayjs.extend(relativeTime);

const HiringInBox = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHiringRequests = async () => {
    setLoading(true);
    try {
      const res = await getAllHiringInInbox();
      setRequests(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("Failed to load hiring requests:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHiringRequests();
  }, []);

  return (
    <div className="hiring-inbox-wrapper">
      <Typography.Title level={4} className="hiring-inbox-title">
        Hiring Notifications
      </Typography.Title>

      {loading ? (
        <div className="hiring-inbox-spinner">
          <Spin size="large" />
        </div>
      ) : requests.length === 0 ? (
        <Empty description="You're all caught up!" className="hiring-inbox-empty" />
      ) : (
        <List
          grid={{ gutter: 24, column: 2 }}
          dataSource={requests}
          renderItem={(item) => (
            <List.Item>
              <div className="hiring-card-modern">
                <div className="hiring-card-top">
                  <Avatar className="hiring-avatar-modern">
                    {item.name?.[0] || "U"}
                  </Avatar>
                  <div className="hiring-card-header-text">
                    <Tooltip title={item.name}>
                      <h3 className="truncate">{item.name}</h3>
                    </Tooltip>
                    <span className="designation-text">{item.designation}</span>
                  </div>
                  <Badge
                    count={item.vacancies || 1}
                    className="hiring-badge-modern"
                    style={{ backgroundColor: "#52c41a" }}
                  />
                </div>

                <div className="hiring-card-details">
                  <p><strong>📍 Location:</strong> {item.location}</p>
                  <Tooltip title={item.reason}>
                    <p><strong>📝 Reason:</strong> {item.reason || "Not specified"}</p>
                    <p> <strong>👥 POD: </strong>{item.podName}</p>
                  </Tooltip>
                </div>

                <div className="hiring-card-actions">
                  <Tag color="blue">New</Tag>
                  <span className="created-time">
                    {dayjs(item.createdAt).fromNow()}
                  </span>
                </div>
              </div>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default HiringInBox;
