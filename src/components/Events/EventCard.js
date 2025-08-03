import React, { useState, useEffect } from 'react';
import { Card, Switch, Typography, message } from 'antd';
import { toggleAttendance } from '../../api/eventapi';
import './styles.css';

const { Title, Text } = Typography;

const EventCard = ({ event, currentUserId }) => {
  const [attending, setAttending] = useState(false);

  useEffect(() => {
    const entry = event.attendance.find(e => e.user === currentUserId);
    if (entry) {
      setAttending(entry.isAttending);
    }
  }, [event, currentUserId]);

  const handleToggle = async (checked) => {
    setAttending(checked);
    try {
      await toggleAttendance(event._id, null, currentUserId, checked);
       // sessionId is null because we're toggling event-level attendance
      message.success('Attendance updated');
      
    } catch (error) {
      console.error(error);
      message.error('Could not update attendance');
    }
  };

  return (
    <Card style={{ marginBottom: 16 }}>
      <Title level={4}>{event.title}</Title>
      <Text>
    <strong>Date:</strong> {event.sessions?.[0]?.startTime
  ? new Date(event.sessions[0].startTime).toLocaleDateString()
  : "No Date Provided"} <br />
        <strong>Sessions:</strong>
        <ul>
          {event.sessions.map((session, index) => (
            <li key={index}>
              {session.title} —{" "}
              {session.startTime && !isNaN(new Date(session.startTime))
                ? new Date(session.startTime).toLocaleTimeString()
                : "Invalid Time"}{" "}
              to{" "}
              {session.endTime && !isNaN(new Date(session.endTime))
                ? new Date(session.endTime).toLocaleTimeString()
                : "Invalid Time"}
            </li>
          ))}
        </ul>
      </Text>

      <br />
      <Text><strong>Attending:</strong></Text>
      <Switch
        className='attend-switch'
        checkedChildren="Yes"
        unCheckedChildren="No"
        checked={attending}
        onChange={handleToggle}
        style={{ marginLeft: 8 }}
      />
    </Card>
  );
};

export default EventCard;
