import JobList from "./jobList";
import JobDetail from "./JobDetailPage";
import { useState } from "react";

const HiringDashboard = ({ jobs, user }) => {
  const [selectedJob, setSelectedJob] = useState(null);

  const handleSelectJob = (job) => {
    console.log("Selected Job:", job);
    setSelectedJob(job);
  };

  return (
    <>
      {!selectedJob ? (
        <JobList items={jobs} onSelectJob={handleSelectJob} />
      ) : (
        <JobDetail job={selectedJob} onBack={() => setSelectedJob(null)} user={user} />
      )}
    </>
  );
};
export default HiringDashboard;