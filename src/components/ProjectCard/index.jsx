import React, { useEffect, useState } from "react";
// import "./style.css"; // Tailwind replaces custom CSS
import { FaCalendarAlt } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { InitialsAvatar } from "../../components/InitialsAvatar/InitialsAvatar";
import Badge from "../ClientInfo/Badge";

const ProjectCard = ({ project, viewType = "card" }) => {
  const navigate = useNavigate();

  const { workspacename: paramWorkspace } = useParams(); // Get workspace name from URL
  const [selectedWorkspace, setSelectedWorkspace] = useState(
    localStorage.getItem("selectedWorkspace") || paramWorkspace || ""
  );

  useEffect(() => {
    if (paramWorkspace) {
      setSelectedWorkspace(paramWorkspace);
      localStorage.setItem("selectedWorkspace", paramWorkspace);
    }
  }, [paramWorkspace]);

  // Function to handle project click
  const handleProjectClick = (id) => {
    navigate(
      `/${selectedWorkspace}/platform-management-feature/projectdetails/${id}`
    );
    //navigate(`/platform-management-feature/projectdetails/${id}`);
  };

  return (
    <div
      className={`bg-zinc-900 rounded-2xl overflow-hidden transition-transform border-2 border-zinc-700 w-full max-w-[400px] ${viewType === "list" ? "flex" : ""
        } ${viewType}-view hover:-translate-y-1`}
      onClick={() => handleProjectClick(project._id)}
    >
      <div className="relative">
        {project.image_link ? (
          <img
            src={project.image_link}
            alt={project.name}
            className={`w-full h-[200px] object-cover rounded-2xl ${viewType === "list" ? "w-[200px] h-[150px]" : ""
              }`}
          />
        ) : (
          <InitialsAvatar
            name={project.name}
            className="image-placeholders"
          />
        )}
        <div className="absolute top-2 left-2">
          <Badge className="rounded-md bg-green-200/10 text-green-500">
            {project.status || "In progress"}
          </Badge>
        </div>
        <div className="absolute top-2 right-2 text-black bg-white/70 text-xs px-3 py-1 rounded-full flex items-center">
          <FaCalendarAlt className="text-black mr-2" />
          <span className="text-black">
            {new Date(project.start_time).toLocaleDateString()}
          </span>
          <span className="text-black"> → </span>
          <span className="text-black">
            {new Date(project.end_time).toLocaleDateString()}
          </span>
        </div>
      </div>
      <div
        className={`p-6 ${viewType === "list"
            ? "flex-1 flex flex-col justify-between"
            : ""
          }`}
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack.map((tech, index) => (
            <span
              key={index}
              className="bg-zinc-800 px-2 py-1 rounded-2xl text-xs text-white"
            >
              {tech.name}
            </span>
          ))}
        </div>
        <h3 className="text-white text-lg mb-0">{project.name}</h3>
        <p className="text-zinc-400 mb-4 text-sm">
          {project.client_id?.name ? project.client_id.name : "No client"}
        </p>
        {project.description.length > 20 ? (
          <>
            <p className="text-zinc-400 text-sm mb-4">
              {project.description.substring(0, 50)}......
            </p>
          </>
        ) : (
          <p className="text-zinc-400 text-sm mb-4">{project.description}</p>
        )}
        <div className="flex gap-4">
          {project.links?.github && (
            <a
              href={project.links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 font-medium hover:underline"
            >
              GitHub
            </a>
          )}
          {project.links?.links && (
            <a
              href={project.links.links}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-500 font-medium hover:underline"
            >
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
