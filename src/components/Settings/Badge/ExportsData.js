import { saveAs } from "file-saver";
import Papa from "papaparse";
import { processBadgeData } from "../../../Utility/exportUtils";

export const exportBadgesToCSV = (badges, fileName = "badges.csv") => {
    if (!badges || badges.length === 0) {
      console.warn("No badges available for export.");
      return;
    }
  
    const csvData = processBadgeData(badges, null); // No date range filter for export
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, fileName);
  };
  
  export const prepareCSVData = (users, dateRange) => {
    const [start, end] = dateRange || [];
  
    return users.map((user) => {
      const filteredBadges = processBadgeData(user.assignedBadges || [], dateRange);
  
      // Utility to safely join fields with line breaks
      const joinWithLineBreaks = (arr, extractor) =>
        arr.map(extractor).join("\n");
  
      return {
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        teamTitle: user.teamTitle?.join(", ") || "",
        branch: user.branch || "",
        role: user.role,
        workspaceName: user.workspaceName?.join(", ") || "",
  
        badgeNames: joinWithLineBreaks(filteredBadges, b => b["Badge Name"] || ""),
        badgeDescriptions: joinWithLineBreaks(filteredBadges, b => b["Badge Description"] || ""),
        assignedAtDates: joinWithLineBreaks(filteredBadges, b => b["Assigned At"] || ""),
        assignedByNames: joinWithLineBreaks(filteredBadges, b => b["Assigned By"] || ""),
        assignedByEmails: joinWithLineBreaks(filteredBadges, b => b["Assigned By"]?.split(" (")[1]?.slice(0, -1) || ""),
      };
    });
  };

export const convertToCSV = (data) => {
  return Papa.unparse(data);
};