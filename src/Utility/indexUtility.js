import { getAllEvents } from "../api/eventapi";
import { getAllHiringInInbox } from "../api/hiringApi";

export const fetchInboxCount = async () => {
  try {
    const [eventsRes, hiringRes] = await Promise.all([
      getAllEvents(),
      getAllHiringInInbox(),
    ]);

    const eventCount = Array.isArray(eventsRes?.data) ? eventsRes.data.length : 0;
    const hiringCount = Array.isArray(hiringRes) ? hiringRes.length : 0;

    return eventCount + hiringCount;
  } catch (error) {
    console.error("Inbox count fetch failed", error);
    return 0;
  }
};
