export const scrollToResourceRow = (resourceId, users) => {
    const resourceIndex = users.findIndex(user => user.id === resourceId);
    if (resourceIndex === -1) return;
  
    const gutter = document.querySelector('.rbc-time-gutter');
    const content = document.querySelector('.rbc-time-content');
  
    if (gutter && content) {
      const rowHeight = gutter.querySelector('.rbc-timeslot-group')?.offsetHeight || 80;
      const scrollPosition = resourceIndex * rowHeight;
      content.scrollTop = scrollPosition;
    }
  };
  