import { List, Card, Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import moment from "moment";

const AllEventsTab = ({ events, setSelectedEventId, setIsModalVisible }) => {
  return (
    <div style={{ maxHeight: "500px" }}>
      <List
        grid={{
          gutter: 12,
          xs: 1,
          sm: 2,
          md: 2,
          lg: 3,
          xl: 3,
          xxl: 4,
        }}
        style={{
          marginTop: "2rem",
          padding: "0 8px",
          backgroundColor: "#f9f9fb",
          borderRadius: "10px",
        }}
        dataSource={events}
        renderItem={(event) => (
          <List.Item style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
            <Card
              style={{
                width: "100%",
                maxWidth: 320,
                margin: 0,
                backgroundColor: event.status === "cancelled" ? "#fff1f0" : "#fff",
                borderRadius: 16,
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
                border: "none",
              }}
            >
              {/* Header */}
              <div className="event-header-all">
                <img
                  src="https://img.icons8.com/ios-filled/100/event-accepted.png"
                  alt="event"
                  style={{ width: 60, height: 60 }}
                />
              </div>

              {/* Body */}
              <div style={{ padding: "16px" }}>
                {event.sessions?.length > 0 && (
                  <p style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
                    {moment(event.sessions[0].startTime).format("dddd, D MMMM | hh:mm a")}
                  </p>
                )}

                <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{event.title}</h3>

                <p style={{ fontSize: 14, color: "#999", margin: "4px 0 12px" }}>
                  📍 {event.location || "Unknown"}
                </p>

                {event.description && (
                  <p style={{ fontSize: 14, color: "#555", marginBottom: 10 }}>{event.description}</p>
                )}

                <p style={{ fontSize: 13, color: "#aaa" }}>
                  <strong>Created At:</strong>{" "}
                  {moment(event.createdAt || event.date).format("YYYY-MM-DD")}
                </p>

                {event.status === "cancelled" && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ color: "#cf1322", fontWeight: 500, fontSize: 13 }}>
                      This event was cancelled.
                    </p>
                    <p style={{ color: "#cf1322", fontSize: 13 }}>
                      Reason: {event.cancelReason || "Not specified"}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="attendance-footer">
                <Button
                  danger
                  size="small"
                  disabled={event.status === "cancelled"}
                  icon={<DeleteOutlined />}
                  style={{
                    borderRadius: "6px",
                    fontWeight: 600,
                    padding: "4px 12px",
                    backgroundColor: event.status === "cancelled" ? "#f5f5f5" : "#ff4d4f",
                    color: event.status === "cancelled" ? "#aaa" : "#fff",
                    border: "none",
                    cursor: event.status === "cancelled" ? "not-allowed" : "pointer",
                    boxShadow:
                      event.status !== "cancelled"
                        ? "0 2px 8px rgba(255,77,79,0.3)"
                        : "none",
                    transition: "all 0.3s ease-in-out",
                  }}
                  onClick={() => {
                    setSelectedEventId(event._id);
                    setIsModalVisible(true);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default AllEventsTab;
