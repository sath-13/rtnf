import dayjs from 'dayjs';

/**
 * Filters bookings based on date, selected user, and team.
 */
export const filterBookings = ({ events, filters }) => {
  const { selectedDate, selectedUserId, selectedTeam, users } = filters;

  return events.filter((event) => {
    let match = true;

    if (selectedDate) {
      const eventDate = dayjs(event.start).format('YYYY-MM-DD');
      const filterDate = dayjs(selectedDate).format('YYYY-MM-DD');
      match = match && eventDate === filterDate;
    }

    if (selectedUserId) {
      match = match && event.resourceId === selectedUserId;
    }

    if (selectedTeam) {
      const user = users.find(u => u.id === event.resourceId);
      if (!user || !Array.isArray(user.teamTitle)) return false;

      const filterTeam = selectedTeam.trim().toLowerCase();
      match = match && user.teamTitle.some(team => team.trim().toLowerCase() === filterTeam);
    }

    return match;
  });
};

