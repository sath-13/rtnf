import { List, Card, Select, Button } from "antd";
import moment from "moment";

const { Option } = Select;

const CompletedEventsTab = ({
  events,
  users,
  selectedUsers,
  handleUserSelect,
  handleAttendanceChange,
  submitAttendance,
}) => {
  const filteredEvents = events.filter(
    (event) =>
      event.status === "completed" ||
      event.status === "cancelled" ||
      event.sessions?.every((session) => new Date(session.endTime) <= new Date())
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
              <p style={{ fontSize: "24px", marginBottom: "8px" }}>✅</p>
              No completed events to display
            </div>
          ),
        }}
        renderItem={(event) => (
          <List.Item style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
            <Card
              style={{
                width: "100%",
                maxWidth: 320,
                backgroundColor: event.status === "cancelled" ? "#fff1f0" : "#fff",
                borderRadius: 16,
                boxShadow: "0 8px 20px rgba(0, 0, 0, 0.05)",
                overflow: "hidden",
                border: "none",
              }}
            >
              {/* Header */}
              <div className="event-header"
                style={{backgroundColor: event.status === "cancelled" ? "#ffccc7" : "#91d5ff"}}
              >
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
                    {moment(event.sessions[0].startTime).format("dddd, D MMMM | hh:mm a")} to{" "}
                    {moment(event.sessions[event.sessions.length - 1].endTime).format("hh:mm a")}
                  </p>
                )}

                <h3 style={{ fontSize: 17, fontWeight: 600, margin: 0 }}>{event.title}</h3>

                {event.description && (
                  <p style={{ fontSize: 14, color: "#555", marginTop: 6 }}>{event.description}</p>
                )}

                <p style={{ fontSize: 13, color: "#aaa", marginTop: 10 }}>
                  <strong>Created At:</strong>{" "}
                  {moment(event.createdAt || event.date).format("YYYY-MM-DD")}
                </p>

                {/* Attendance section */}
                {event.status !== "cancelled" ? (
                  <div style={{ marginTop: 12 }}>
                    <Select
                      mode="multiple"
                      style={{ width: "100%" }}
                      placeholder="Select Users"
                      value={selectedUsers[event._id] || []}
                      onChange={(value) => handleUserSelect(event._id, value)}
                    >
                      {Array.isArray(users) &&
                        users.map((user) => (
                          <Option key={user._id} value={user._id}>
                            {user.fname} {user.lname || ""}
                          </Option>
                        ))}
                    </Select>

                    <Select
                      style={{ width: "100%", marginTop: 8 }}
                      placeholder="Mark Attendance"
                      onChange={(value) => handleAttendanceChange(event._id, value)}
                    >
                      <Option value={true}>Present</Option>
                      <Option value={false}>Absent</Option>
                    </Select>

                    <Button
                      type="primary"
                      className="submit-attendance-btn"
                      onClick={() => submitAttendance(event._id)}
                    >
                      Submit Attendance
                    </Button>
                  </div>
                ) : (
                  <div className="cancelled-event">
                    <p className="cancelled-text">
                      This event was cancelled.
                    </p>
                    <p className="reason-text">
                      <strong>Reason:</strong> {event.cancelReason || "N/A"}
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

export default CompletedEventsTab;
