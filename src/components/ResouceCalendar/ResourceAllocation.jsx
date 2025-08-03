import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  Views,
  dateFnsLocalizer,
} from 'react-big-calendar';
import { useParams } from "react-router-dom";
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import dayjs from 'dayjs';
import BookingDrawer from './BookingDrawer';
import { createBookingAPI, deleteBookingAPI, getAllBookingsAPI, updateBookingTimeAPI } from '../../api/ResourceAllocationApi';
import { getUsersInWorkspace } from '../../api/usersapi';
import './ResourceAllocation.css';
import CustomEvent from './CustomEvent';
import { Button, DatePicker, message, Modal, Select, Switch } from 'antd';
import EditBookingWrapper from './EditingBookingWrapper';
import { getAllTeams } from '../../api/teamapi';
import { filterBookings } from '../../Utility/calendarFilters';
import ProjectCreateDrawer from './ProjectCreateDrawer';
import { scrollToResourceRow } from '../../Utility/scrollToRowHelper';
import { ResourceAllocationMessages } from '../../constants/constants';
import { calculateBookedHours } from '../../Utility/calculateResourceHours';
import { getCompanyById } from '../../api/companyapi';
import { toastError, toastSuccess } from '../../Utility/toast';


const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });
const DragAndDropCalendar = withDragAndDrop(Calendar);

const CalendarComponent = () => {
  const [events, setEvents] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerData, setDrawerData] = useState(null);
  const [hoursMap, setHoursMap] = useState({});
  const [users, setUsers] = useState([]);
  const { workspacename } = useParams();
  const loggedUser = JSON.parse(localStorage.getItem("user"))?.id || JSON.parse(localStorage.getItem("user"))?._id || null;
  const loggedUserCompanyId = JSON.parse(localStorage.getItem("user"))?.companyId || null;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [showCreateProject, setShowCreateProject] = useState(false);

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedUserId, setSelectedUserId] = useState(loggedUser);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loading, setLoading] = useState(false);

  const [teams, setTeams] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());   // what week/month the
  const [currentView, setCurrentView] = useState(Views.WEEK);   // calendar is showing

  const [workingHoursPerDay, setWorkingHoursPerDay] = useState(8);

  useEffect(() => {
    const fetchCompanyData = async () => {
      try {
        const companyId = loggedUserCompanyId;
        if (companyId) {
          const company = await getCompanyById(companyId);
          setWorkingHoursPerDay(company.working_hours_per_day || 8);
        }
      } catch (error) {
        console.error('Failed to fetch company:', error);
      }
    };

    fetchCompanyData();
  }, []);

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!selectedTeam) return users;
    const teamNormalized = selectedTeam.trim().toLowerCase();

    return users.filter(user => {
      // user.teamTitle is an array
      if (!Array.isArray(user.teamTitle)) return false;

      // Check if any team matches (case-insensitive)
      return user.teamTitle.some(team => team.trim().toLowerCase() === teamNormalized);
    });
  }, [selectedTeam, users]);

  const visibleResources = selectedUserId || selectedTeam ? filteredUsers : users;


  // watch selectedDate and push the calendar there
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(dayjs(selectedDate).toDate());

      // if user is in Day view keep them there, otherwise stay in currentView
      if (currentView === Views.DAY) return;

      // If they were on Month but picked a specific date, snap to Week view for context
      if (currentView === Views.MONTH) setCurrentView(Views.WEEK);
    }
  }, [selectedDate]);


  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const res = await getAllTeams(workspacename);
        setTeams(res.data);
      } catch (err) {
        console.error('Failed to fetch teams:', err);
      }
    };

    fetchTeams();
  }, [workspacename]);

  useEffect(() => {
    const filtered = filterBookings({
      events,
      filters: {
        selectedDate,
        selectedUserId,
        selectedTeam,
        users,
      },
    });

    setFilteredEvents(filtered);

    if (selectedUserId && currentView !== Views.MONTH) {
      scrollToResourceRow(selectedUserId, users);
    }
  }, [events, selectedDate, selectedUserId, selectedTeam, users]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await getUsersInWorkspace(workspacename);
        const transformedUsers = userData.map(user => ({
          id: user._id,
          name: `${user.fname} ${user.lname}`,
          teamTitle: Array.isArray(user.teamTitle) ? user.teamTitle : []
        }));
        setUsers(transformedUsers);

        const bookings = await getAllBookingsAPI(loggedUserCompanyId); // You'll need to create this API call

        const formattedEvents = bookings.map(b => ({
          id: b._id,
          title: `${b.projectName} - ${b.duration.toFixed(1)}h`,
          start: new Date(b.startTime),
          end: new Date(b.endTime),
          resourceId: b.employeeId,
          resourceTitle: b.employeeName,
          duration: b.duration,
          project: b.projectId,
          projectColor: b.projectColor || "#1976d2", // fallback
          taskDescription: b.taskDescription,
          typeOfWork: b.typeOfWork,
        }));

        setEvents(formattedEvents);
      } catch (err) {
        console.error("Failed to load bookings", err);
      }
    };
    fetchData();
  }, []);

  const openDrawer = (slotInfo) => {
    setDrawerData({
      start: slotInfo.start, // clicked time
      duration: 1,
    });
    setDrawerVisible(true);
  };

  const closeDrawer = () => {
    setDrawerVisible(false);
    setDrawerData(null);
  };

  const handleEditBooking = (event) => {
    setSelectedBookingId(event.id); // get the id from clicked event
    setIsDrawerOpen(true);          // open the edit drawer
  };


  const refetchCalendarOrBookings = async () => {
    try {
      const bookings = await getAllBookingsAPI(loggedUserCompanyId);

      const formattedEvents = bookings.map(b => ({
        id: b._id,
        title: `${b.projectName} - ${b.duration.toFixed(1)}h`,
        start: new Date(b.startTime),
        end: new Date(b.endTime),
        resourceId: b.employeeId,
        resourceTitle: b.employeeName,
        duration: b.duration,
        project: b.projectId,
        projectColor: b.projectColor || "#1976d2",
        taskDescription: b.taskDescription,
        typeOfWork: b.typeOfWork,
      }));
      setEvents(formattedEvents);
    } catch (err) {
      console.error("Failed to refetch bookings", err);
    }
  };


  const handleSaveBooking = async (bookings) => {
    if (!Array.isArray(bookings) || bookings.length === 0) {
      console.error("No booking data provided");
      return;
    }

    try {
      // Use Promise.all to run all booking saves in parallel
      setLoading(true);
      const createdBookings = await Promise.all(
        bookings.map(async (booking) => {
          const {
            start,
            end,
            project,
            user: resourceId,
            taskDescription,
            duration,
            typeOfWork,
          } = booking;

          const payload = {
            companyId: loggedUserCompanyId,
            projectId: project._id,
            employeeId: resourceId,
            resourceCoordinatorId: loggedUser,
            startTime: start,
            endTime: end,
            duration,
            taskDescription,
            typeOfWork: typeOfWork._id,
          };

          // Create booking via API, return the response plus booking info for later use
          const createdBooking = await createBookingAPI(payload);
          return { createdBooking, booking };
        })
      );

      // message.success(ResourceAllocationMessages.ALL_RESOURCES_ALLOCATED_SUCC);
      toastSuccess({ title: "Success", description: ResourceAllocationMessages.ALL_RESOURCES_ALLOCATED_SUCC });
      setLoading(false);

      // Prepare new events and update hoursMap after all bookings are created
      let newEvents = [];
      let updatedHoursMap = { ...hoursMap };

      createdBookings.forEach(({ createdBooking, booking }) => {
        const {
          start,
          end,
          project,
          user: resourceId,
          duration,
          taskDescription,
        } = booking;

        const title = `${project.name} - ${duration.toFixed(1)}h`;

        const newEvent = {
          id: createdBooking._id,
          title,
          start,
          end,
          resourceIds: resourceId,
          resourceTitle: resourceId.name || '',
          duration,
          project: project._id,
          projectColor: project.color,
          taskDescription,
        };

        newEvents.push(newEvent);

        const key = `${dayjs(start).format('YYYY-MM-DD')}_${newEvent.resourceTitle}`;
        const current = updatedHoursMap[key] || 0;
        updatedHoursMap[key] = current + duration;
      });

      // Update state with all new events at once
      setEvents((prev) => [...prev, ...newEvents]);
      setHoursMap(updatedHoursMap);

      // REFRESH FULL EVENTS FROM SERVER
      await refetchCalendarOrBookings();

      closeDrawer();
    } catch (err) {
      console.error('Booking creation failed:', err);
      // message.error(ResourceAllocationMessages.RESOURCE_ALLOCATE_FAIL);
      toastError({ title: "Error", description: ResourceAllocationMessages.RESOURCE_ALLOCATE_FAIL });
    }
  };

  const moveEvent = ({ event, start, end }) => {
    Modal.confirm({
      title: 'Do you want to move or copy this booking?',
      content: 'Move will delete the original entry, copy will create a new one.',
      okText: 'Move',
      cancelText: 'Copy',
      onOk: async () => {
        try {
          await deleteBookingAPI(event.id);

          const employeeId = Array.isArray(event.resourceIds)
            ? event.resourceIds
            : [event.resourceId];

          const payload = {
            ...event,
            companyId: loggedUserCompanyId,
            startTime: start,
            endTime: end,
            projectId: event.project || event.projectId,
            duration: dayjs(end).diff(dayjs(start), 'hour', true),
            resourceCoordinatorId: loggedUser,
            employeeId,
            id: undefined,
          };

          const newBooking = await createBookingAPI(payload);
          const updatedEvent = {
            ...event,
            id: newBooking._id,
            start,
            end,
            duration: payload.duration,
            resourceCoordinatorId: payload.resourceCoordinatorId,
            employeeId: payload.employeeId,
          };

          setEvents(events.map(e => (e.id === event.id ? updatedEvent : e)));
          // message.success(ResourceAllocationMessages.BOOKING_MOVE_SUCC);
          toastSuccess({ title: "Success", description: ResourceAllocationMessages.BOOKING_MOVE_SUCC });

          // REFRESH EVENTS AFTER MOVE
          await refetchCalendarOrBookings();
        } catch (err) {
          console.error("Move failed", err);
          // message.error(ResourceAllocationMessages.BOOKING_MOVE_FAIL);
          toastError({ title: "Error", description: ResourceAllocationMessages.BOOKING_MOVE_FAIL });
        }
      },
      onCancel: async () => {
        try {
          const employeeId = Array.isArray(event.resourceIds)
            ? event.resourceIds
            : [event.resourceId];

          const payload = {
            ...event,
            companyId: loggedUserCompanyId,
            startTime: start,
            endTime: end,
            projectId: event.project || event.projectId,
            duration: dayjs(end).diff(dayjs(start), 'hour', true),
            resourceCoordinatorId: loggedUser,
            employeeId,
            id: undefined,
          };

          const newBooking = await createBookingAPI(payload);
          const newEvent = {
            ...event,
            id: newBooking._id,
            start,
            end,
            duration: payload.duration,
            resourceCoordinatorId: payload.resourceCoordinatorId,
            employeeId: payload.employeeId,
          };

          setEvents([...events, newEvent]);
          // message.success(ResourceAllocationMessages.BOOKING_COPY_SUCC);
          toastSuccess({ title: "Success", description: ResourceAllocationMessages.BOOKING_COPY_SUCC });

          // REFRESH EVENTS AFTER COPY
          await refetchCalendarOrBookings();
        } catch (err) {
          console.error("Copy failed", err);
          // message.error(ResourceAllocationMessages.BOOKING_COPY_FAIL);
          toastError({ title: "Error", description: ResourceAllocationMessages.BOOKING_COPY_FAIL });
        }
      },
    });
  };

  const resizeEvent = async ({ event, start, end }) => {
    const duration = dayjs(end).diff(dayjs(start), 'hour', true);
    const updatedEvent = {
      ...event,
      start: new Date(start),
      end: new Date(end),
      duration,
    };

    // Update local calendar state
    setEvents(events.map(e => (e.id === event.id ? updatedEvent : e)));

    // Send update to backend
    try {
      await updateBookingTimeAPI(event.id, {
        startTime: start,
        endTime: end,
        duration,
      });
      // message.success(ResourceAllocationMessages.BOOKING_TIME_UPDATED_SUCC);
      toastSuccess({ title: "Success", description: ResourceAllocationMessages.BOOKING_TIME_UPDATED_SUCC });
    } catch (err) {
      console.error("Resize update failed", err);
      // message.error(ResourceAllocationMessages.BOOKING_TIME_UPDATED_FAIL);
      toastError({ title: "Error", description: ResourceAllocationMessages.BOOKING_TIME_UPDATED_FAIL });
    }
  };

  const eventPropGetter = (event, start, end, isSelected) => {
    return {
      style: {
        backgroundColor: event.projectColor || '#888',
      },
      className: 'resizable-event rounded-[6px] text-white px-[6px] py-[4px] text-[13px] min-h-[40px] overflow-hidden',
    };
  };

  const bookedHours = useMemo(() => calculateBookedHours(events), [events]);

  const resourceTitleAccessor = (resource) => {
    const currentDateKey = new Date(currentDate).toDateString();
    const key = `${resource.id}_${currentDateKey}`;
    const total = bookedHours[key] || 0;
    const remaining = workingHoursPerDay - total;

    if (currentView === Views.DAY) {
      return `${resource.name} - ${remaining.toFixed(1)}hrs`;
    } else {
      return resource.name;
    }
  };

  const formats = {
    dayFormat: (date, culture, localizer) =>
      `${localizer.format(date, 'dd', culture)}\n${localizer.format(date, 'EEE', culture)}`
  };

  return (
    <div className="pb-5">
      <div className="mt-4">
        <div className="calendar-container">
          <div className="flex justify-between items-center mb-4 gap-4">
            {/* Filters group on left */}
            <div className="flex gap-4 items-center">
              <DatePicker
                className="!w-[200px]"
                onChange={(date) => setSelectedDate(date)}
                placeholder="Filter by date"
              />
              <Select
                className="!w-[200px]"
                allowClear
                placeholder="Filter by team"
                onChange={(value) => {
                  setSelectedTeam(value);
                  setSelectedUserId(null);
                }}
                options={teams.map(team => ({
                  label: team.teamTitle,
                  value: team.teamTitle,
                }))}
              />

              <Select
                className="!w-[200px]"
                allowClear
                showSearch
                disabled={!selectedTeam}
                placeholder="Filter by user"
                onChange={(value) => setSelectedUserId(value)}
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={filteredUsers.map(user => ({
                  label: user.name,
                  value: user.id,
                }))}
              />
              <Switch
                checked={selectedUserId !== null}
                onChange={(checked) => {
                  setSelectedUserId(checked ? loggedUser : null);
                }}
                checkedChildren="Only Me"
                unCheckedChildren="All Users"
                className={selectedUserId !== null ? '!bg-[#743799]' : ''}
              />
            </div>

            {/* Create Project button on right */}
            <Button
              className='custom-button !font-inter'
              onClick={() => setShowCreateProject(true)}
              type="primary"
            >
              Create Project
            </Button>
          </div>


          <DndProvider backend={HTML5Backend}>
            <DragAndDropCalendar
              localizer={localizer}
              events={filteredEvents}
              date={currentDate}
              view={currentView}
              defaultView={Views.WEEK}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              startAccessor="start"
              endAccessor="end"
              className="!h-[750px]"
              selectable
              resizable
              onSelectSlot={openDrawer}
              onSelectEvent={handleEditBooking}
              onEventDrop={moveEvent}
              onEventResize={resizeEvent}
              // resources={users}
              resources={visibleResources}
              resourceIdAccessor="id"
              resourceTitleAccessor={resourceTitleAccessor}
              step={15}
              timeslots={4}
              eventPropGetter={eventPropGetter}
              // components={{ event: CustomEvent }}
              components={{
                event: (props) => <CustomEvent {...props} view={currentView} />,
              }}
              formats={formats}
              onNavigate={date => setCurrentDate(date)}   // user clicks next / prev
              onView={v => setCurrentView(v)}             // user clicks Month/Week/Day
            />
          </DndProvider>

          <BookingDrawer
            open={drawerVisible}
            onClose={closeDrawer}
            onSave={handleSaveBooking}
            initialData={drawerData}
            resources={users}
            loading={loading}
            companyId={loggedUserCompanyId}
            refetchCalendarOrBookings={refetchCalendarOrBookings}
          />

          {/* Booking Edit Drawer */}
          {isDrawerOpen && selectedBookingId && (
            <EditBookingWrapper
              bookingId={selectedBookingId}
              open={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              onSuccess={refetchCalendarOrBookings} // refresh calendar after update
              resources={users}
            />
          )}


          {/* Project Creation Drawer */}
          <ProjectCreateDrawer
            open={showCreateProject}
            onClose={() => setShowCreateProject(false)}
            onSave={() => {
              setShowCreateProject(false);
            }}
          />
        </div>
      </div>
    </div>

  );
};

export default CalendarComponent;
