import { Button, Tag } from "antd";
import logo from "../../logo.svg";

const JobCard = ({ job, onClick }) => {
  return (
    <div
     onClick={() => {
        console.log("Card clicked:", job);
        onClick(job);
      }}
      className="bg-white rounded-xl shadow-md p-6 w-full max-w-md mb-4 cursor-pointer hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={logo}
          alt="Company Logo"
          className="w-12 h-12"
        />
        <span className="font-semibold text-gray-800 text-lg">
          {job.name || "Unknown"}
        </span>
      </div>

      <h2 className="text-xl font-semibold text-gray-900 mb-2">
        {job.designation} {job.positionType ? `(${job.positionType})` : ""}
      </h2>

      <p className="text-gray-600 text-sm mb-4">
        {job.candidateProfile}
      </p>

      <div className="flex gap-2 flex-wrap mb-4">
        {job.positionType && <Tag>{job.positionType}</Tag>}
        {job.location && <Tag>{job.location}</Tag>}
        {job.experience && <Tag>{job.experience}</Tag>}
      </div>


      {job.decisionStatus && (
        <div className="mt-2">
          <Tag color={job.decisionStatus === 'accepted' ? 'green' : 'red'}>
            {job.decisionStatus.toUpperCase()}
          </Tag>
          <p className="text-gray-600 text-sm">
            Reason: {job.decisionReason || "N/A"}
          </p>
        </div>
      )}
    </div>
  );
};

export default JobCard;
