// helpers/calculateResourceHours.js
export function calculateBookedHours(events) {
    const resourceHours = {};
  
    events.forEach(event => {
      const dateKey = new Date(event.start).toDateString(); // e.g., 'Mon May 20 2025'
      const key = `${event.resourceId}_${dateKey}`;
  
      const duration = (new Date(event.end) - new Date(event.start)) / (1000 * 60 * 60); // hours
      resourceHours[key] = (resourceHours[key] || 0) + duration;
    });
  
    return resourceHours;
  }
  