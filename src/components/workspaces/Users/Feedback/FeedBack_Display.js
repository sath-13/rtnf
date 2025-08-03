import React, { useEffect, useState } from "react";
import {
  Card,
  Avatar,
  Typography,
  Spin,
  Tooltip,
  Select,
  DatePicker,
  Row,
  Col,
} from "antd";
import { UserOutlined, MessageOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import relativeTime from "dayjs/plugin/relativeTime";
import { getLoggedInUserFeedback } from "../../../../api/feedbackapi";
import "./FeedBack_Display.css";
import { useParams } from "react-router-dom";

dayjs.extend(isBetween);
dayjs.extend(relativeTime);

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const FeedbackDisplay = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [filteredFeedback, setFilteredFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackType, setFeedbackType] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [feedbackCounts, setFeedbackCounts] = useState({
    direct: 0,
    anonymous: 0,
    request: 0,
  });

  const { workspacename } = useParams();

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("user"));
        console.log("loggedInUser", loggedInUser);
        const userId = loggedInUser?.id;

        console.log("userId", userId);

        if (!userId || !workspacename) {
          console.error("Missing user ID or workspace name");
          return;
        }

        const response = await getLoggedInUserFeedback(userId, workspacename);
        console.log("response for getLoggedInUserFeedback", response);
        const feedbackData = Array.isArray(response) ? response : [];

        setFeedbackList(feedbackData);
        setFilteredFeedback(feedbackData);

        const counts = {
          direct: 0,
          anonymous: 0,
          request: 0,
        };

        feedbackData.forEach((item) => {
          if (item.feedbackType) {
            const type = item.feedbackType.toLowerCase();
            counts[type] = (counts[type] || 0) + 1;
          }
        });

        setFeedbackCounts(counts);
      } catch (error) {
        console.error("Error fetching feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  useEffect(() => {
    let filtered = Array.isArray(feedbackList) ? [...feedbackList] : [];

    if (feedbackType) {
      filtered = filtered.filter(
        (item) => item.feedbackType?.toLowerCase() === feedbackType
      );
    }

    if (dateRange) {
      const [startMoment, endMoment] = dateRange;

      filtered = filtered.filter((item) => {
        const feedbackDate = dayjs(item.createdAt);
        return feedbackDate.isBetween(startMoment, endMoment, null, "[]");
      });
    }

    setFilteredFeedback(filtered);
  }, [feedbackType, dateRange, feedbackList]);

  const handleTypeChange = (value) => {
    setFeedbackType(value || null);
  };

  const handleDateChange = (dates) => {
    if (dates) {
      const formattedStart = dates[0].startOf("day");
      const formattedEnd = dates[1].endOf("day");
      setDateRange([formattedStart, formattedEnd]);
    } else {
      setDateRange(null);
    }
  };

  return (
    <div className="feedback-container">
      <div className="!py-5">
        <Card className="feedback-card border border-border-color">
          <h1 className="!text-center !text-xl lg:!text-2xl text-primary-text font-rubik font-semibold !mb-5">
            <MessageOutlined /> User Feedback
          </h1>
          <Row
            gutter={[16, 16]}
            className="filter-row !mb-4"
          >
            <Col xs={24} sm={12}>
              <Tooltip title="Filter by type">
                <Select
                  placeholder="Select feedback type"
                  value={feedbackType}
                  onChange={handleTypeChange}
                  className="!w-full"
                  allowClear
                >
                  <Option value="direct">
                    Direct ({feedbackCounts.direct})
                  </Option>
                  <Option value="anonymous">
                    Anonymous ({feedbackCounts.anonymous})
                  </Option>
                  <Option value="request">
                    Request ({feedbackCounts.request})
                  </Option>
                </Select>
              </Tooltip>
            </Col>
            <Col xs={24} sm={12}>
              <Tooltip title="Filter by date range">
                <RangePicker
                  onChange={handleDateChange}
                  allowClear
                  className="!w-full"
                  disabledDate={(current) =>
                    current && current > dayjs().endOf("day")
                  }
                />
              </Tooltip>
            </Col>
          </Row>

          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
            </div>
          ) : !Array.isArray(filteredFeedback) ||
            filteredFeedback.length === 0 ? (
            <span className=" text-secondary-text text-sm font-inter">
              No feedback available for selected filters.
            </span>
          ) : (
            filteredFeedback.map((item, index) => (
              <Card key={index} className="feedback-item-card">
                <div className="feedback-header">
                  <Tooltip
                    title={`${item.givenBy?.fname || "Anonymous"} ${item.givenBy?.lname || ""
                      }`}
                  >
                    <Avatar
                      src={item.givenBy?.userLogo}
                      icon={!item.givenBy?.userLogo && <UserOutlined />}
                      className="feedback-avatar"
                    />
                  </Tooltip>

                  <div className="feedback-info">
                    <Text strong>
                      {item.givenBy?.fname
                        ? `${item.givenBy.fname} ${item.givenBy.lname}`
                        : "Anonymous"}
                    </Text>
                    <Text className="feedback-action"> gave you feedback </Text>
                    <span className="feedback-time">
                      {dayjs(item.createdAt).fromNow()}
                    </span>
                  </div>
                </div>

                <Text className="feedback-description">{item.description}</Text>
              </Card>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};

export default FeedbackDisplay;
