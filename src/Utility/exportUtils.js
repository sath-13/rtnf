
export const processBadgeData = (badges, dateRange) => {
  const [start, end] = dateRange || [];

  return badges
    .filter((badge) => {
      if (!start || !end) return true;
      const assignedDate = new Date(badge.assignedAt);
      return assignedDate >= start.toDate() && assignedDate <= end.toDate();
    })
    .map((badge) => ({
      "Badge Name": badge.badgeName,
      "Badge Type": badge.badgeType,
      "Badge Description": badge.badgeDescription,
      "Assigned By": `${badge.assignedBy.name} (${badge.assignedBy.email})`,
      "Assigned At": badge.assignedAt,
      "Assigned To": badge.assignedTo ? `${badge.assignedTo.name} (${badge.assignedTo.email})` : "N/A",
    }));
};




