import React from 'react';

const CustomEvent = ({ event, view }) => {
  const isMonthView = view === 'month';

  // Only in Month view: Scale height based on hours (max = 8hr)
  const baseHeight = 20; // base height for 1 hour
  const height = isMonthView
    ? Math.max(20, Math.min(event.duration * baseHeight, 160)) // cap at 8h (20*8 = 160px)
    : undefined;

  return (
    <div className="custom-event-wrapper">
      <div
        className={`custom-event bg-[${event.projectColor || '#2d98da'}] overflow-hidden text-xs rounded-[4px] px-1 py-[2px]`}
        style={{
          backgroundColor: event.projectColor || '#2d98da',
          height: isMonthView ? `${height}px` : undefined,
        }}
      >
        <strong>{event.title}</strong>
      </div>
    </div>
  );
};

export default CustomEvent;
