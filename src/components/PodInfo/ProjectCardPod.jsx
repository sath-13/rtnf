import React, { useEffect, useState } from 'react';
import '../../components/ProjectCard/style.css';
import { FaCalendarAlt } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import { InitialsAvatar } from '../../components/InitialsAvatar/InitialsAvatar';
import Badge from '../ClientInfo/Badge';


const ProjectCardPod = ({ project }) => {
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

  if (!project) {
    console.error("Project is undefined or null.");
    return null; // Render nothing if project is invalid
  }

  const {
    _id,
    image_link,
    name,
    status = "In progress",
    start_time,
    end_time,
    techStack = [],
    client_id,
    description,
    links = {},
  } = project;

  // Function to handle project click
  const handleProjectClick = (id) => {
    navigate(`/${selectedWorkspace}/platform-management-feature/projectdetails/${id}`);
    //navigate(`/platform-management-feature/projectdetails/${id}`);
  };

  return (
    <div className="card-container" onClick={() => handleProjectClick(_id)}>
      <div className="project-image-wrapper">
        {image_link ? (
          <img
            src={image_link}
            alt={name || "Project Image"}
            className="image-style"
          />
        ) : (
          <InitialsAvatar
            name={name}
            className="image-placeholders"
          />
        )}
        <div className="project-status">
          <Badge className="status-badge">{status}</Badge>
        </div>
        <div className="project-start">
          <FaCalendarAlt className="text-black mr-2" />
          <span>{start_time ? new Date(start_time).toLocaleDateString() : "N/A"}</span>
          <span> → </span>
          <span>{end_time ? new Date(end_time).toLocaleDateString() : "N/A"}</span>
        </div>
      </div>
      <div className="content-area">
        <div className="technologies">
          {techStack.map((tech, index) => (
            <span key={index} className="technology-label">
              {tech.name}
            </span>
          ))}
        </div>
        <h3>{name || "Unnamed Project"}</h3>
        <p>{client_id?.name || "No client"}</p>
        <p>
          {description
            ? description.length > 50
              ? `${description.substring(0, 50)}...`
              : description
            : "No description available"}
        </p>
        <div className="links-sections">
          {links.github && (
            <a href={links.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          )}
          {links.links && (
            <a href={links.links} target="_blank" rel="noopener noreferrer">
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  );
};


export default ProjectCardPod;


