import React, { useEffect, useState } from 'react';
import ProjectCard from '../ProjectCard';
import { useNavigate, useParams } from 'react-router-dom';
import './style.css';

const Projects = ({ viewType, projects }) => {
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


  const handleProjectClick = (id) => {
    navigate(`/${selectedWorkspace}/platform-management-feature/projectdetails/${id}`);
    //navigate(`/platform-management-feature/projectdetails/${id}`);
  };

  return (
    <div className={`projects-area ${viewType}`}>
      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectCard
            key={project.id || project._id} 
            project={project}
            onClick={() => handleProjectClick(project.id || project._id)} 
          />
        ))
      ) : (
        <p className="no-projects-message" >No projects available.</p>
      )}
    </div>
  );
};

export default Projects;
