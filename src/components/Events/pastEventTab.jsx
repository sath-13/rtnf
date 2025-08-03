import { List, Card } from "antd";
import moment from "moment";

const PastEventsTab = ({ events, user, loggedUser }) => {
  const filteredEvents = events.filter(
    (event) =>
      (user?.role === "superadmin" ||
        event.userAssigned?.some((id) => id?.toString() === loggedUser)) &&
      (event.sessions.every((session) => new Date(session.endTime) <= new Date()) ||
        event.status === "cancelled")
  );

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
        dataSource={filteredEvents}
        locale={{
          emptyText: (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "24px", marginBottom: "8px" }}>🗓️</p>
              No past events to display
            </div>
          ),
        }}
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
              <div className="event-header-past">
                <img
                  src="https://img.icons8.com/ios-filled/100/planner.png"
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
                  <p style={{ fontSize: 14, color: "#555", marginBottom: 10 }}>
                    {event.description}
                  </p>
                )}

                <p style={{ fontSize: 13, color: "#aaa" }}>
                  <strong>Created At:</strong>{" "}
                  {moment(event.createdAt || event.date).format("YYYY-MM-DD")}
                </p>

                {event.status === "cancelled" && event.cancelReason && (
                  <div className="cancelled-event-past">
                    <p className="cancelled-text-past">
                      This event was cancelled.
                    </p>
                    <p className="reason-past">
                      <strong>Reason:</strong> {event.cancelReason}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default PastEventsTab;
