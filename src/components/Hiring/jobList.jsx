import JobCard from "./jobCard";

const JobList = ({ items = [], onSelectJob }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 px-4">
    {items.map((job, idx) => (
      <JobCard key={idx} job={job} onClick={() => onSelectJob(job)} />
    ))}
  </div>
);
export default JobList;