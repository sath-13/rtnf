import React, { useEffect, useState } from "react";
import {
  Layout,
  Menu,
  List,
  Avatar,
  Input,
  Timeline,
  Divider,
  Spin,
  Empty,
  Typography,
} from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { getAllEvents } from "../../api/eventapi";
import "./EventInBox.css";

dayjs.extend(relativeTime);
const { Sider, Content } = Layout;
const { Title, Text } = Typography;

const EventInBox = () => {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem("user"));



  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await getAllEvents();
        const eventList = Array.isArray(response.data) ? response.data : [];
        setEvents(eventList);
        setSelected(eventList[0] || null);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout className="event-inbox-container">
     
      <Sider width={180} className="event-inbox-sidebar">
        <Menu mode="inline" defaultSelectedKeys={["events"]}>
          <Menu.Item key="events">Events</Menu.Item>
        </Menu>
      </Sider>

    
      <Sider width={300} className="event-inbox-list">
        <Input
          placeholder="Search events by title"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="event-inbox-search"
        />
        {loading ? (
          <Spin className="event-inbox-spinner" />
        ) : filtered.length === 0 ? (
          <Empty description="No events found" />
        ) : (
          <List
            dataSource={filtered}
            renderItem={(item) => (
              <List.Item
                onClick={() => setSelected(item)}
                className={`event-inbox-list-item ${selected?._id === item._id ? "active" : ""}`}
              >
                <List.Item.Meta
                  avatar={
                   <Avatar
  src={loggedInUser?.userLogo}
  alt={`${loggedInUser?.fname} ${loggedInUser?.lname}`}
>
  {loggedInUser?.fname?.[0] || "U"}
</Avatar>


                  } 
                  title={<strong>{loggedInUser?.fname} {loggedInUser?.lname}</strong>}

                  description={<strong>{item.title}</strong>}
                />
                <div className="event-inbox-time">{dayjs(item.createdAt).fromNow()}</div>
              </List.Item>
            )}
          />
        )}
      </Sider>

     
      <Content className="event-inbox-details">
        {selected ? (
          <>
            <Title level={3}>{selected.title}</Title>
            <Text type="secondary">
              Created on {dayjs(selected.createdAt).format("DD MMM YYYY, hh:mm A")}
            </Text>

            {/* Attached File */}
            {selected.file && (
              <div className="event-inbox-file" style={{ marginTop: 12 }}>
                <a
                  href={`${process.env.REACT_APP_BASE_URL.replace(/\/$/, "")}/${selected.file.replace(/^\//, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  📎 View Attached File
                </a>

              </div>
            )}

          
            {selected.sessions?.length > 0 && (
              <p style={{ marginTop: 10 }}>
                <strong>Session:</strong>{" "}
                {dayjs(selected.sessions[0].startTime).format("DD MMM YYYY, hh:mm A")} -{" "}
                {dayjs(selected.sessions[0].endTime).format("hh:mm A")}
              </p>
            )}

         
            <div className="event-inbox-message" style={{ marginTop: 16 }}>
              {selected.description || <Text type="secondary">No description provided.</Text>}
            </div>

            <Divider />

            <h3 className="event-inbox-activity-heading">Activity</h3>
            <Timeline
              items={[
                {
                  children: `Event Created on ${dayjs(selected.createdAt).format("DD MMM YYYY, hh:mm A")}`
                },
                ...(selected.updatedBy
                  ? [{ children: `Updated by ${selected.updatedBy?.fname}` }]
                  : []),
              ]}
            />
          </>
        ) : (
          <Empty description="No event selected" />
        )}
      </Content>
    </Layout>
  );
};

export default EventInBox;
