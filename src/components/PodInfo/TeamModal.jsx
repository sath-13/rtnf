import React, { useState, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'
import { TeamMemberCard } from './TeamMemberCard'
import ProjectCardPod from './ProjectCardPod'
import { getUsersByTeamTitle, getProjectByTeam, getTeamById } from '../../api/projectApi'
import { useParams } from 'react-router-dom'
export const TeamModal = ({ teamId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [currentMemberPage, setCurrentMemberPage] = useState(1)
  const [currentProjectPage, setCurrentProjectPage] = useState(1)
  const [activeView, setActiveView] = useState('members')
  const [teamMembers, setTeamMembers] = useState([])
  const [projects, setProjects] = useState([])
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const itemsPerPage = 3

  /*
  useEffect(() => {

    const fetchTeamData = async () => {
      if (!teamId) {
        setError('Team ID is undefined');
        setLoading(false);
        return;
      }


      try {
        const [membersData, projectsData, teamData] = await Promise.all([
          getUsersByTeamId(teamId),
          getProjectByTeam(teamId),
          getTeamById(teamId),
        ]);
        setTeamMembers(membersData || []);
        
        setProjects(projectsData);

        
        setTeamName(teamData?.teamTitle || 'Unknown Team');
        setError(null);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError('Failed to load team data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchTeamData();
  }, [teamId]);
*/

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

useEffect(() => {
  const fetchTeamData = async () => {
    if (!teamId) {
      setError("Team ID is undefined");
      setLoading(false);
      return;
    }


    try {
      const [teamData] = await Promise.all([getTeamById(teamId)]);

      setTeamName(teamData?.teamTitle || "Unknown Team");

      const [membersData, projectsData] = await Promise.all([
        getUsersByTeamTitle(selectedWorkspace, teamData?.teamTitle),
        getProjectByTeam(teamId),
      ]);

      setTeamMembers(membersData || []);
      setProjects(projectsData);
      setError(null);
    } catch (error) {
      console.error("Error fetching team data:", error);
      setError("Failed to load team data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  fetchTeamData();
}, [teamId, selectedWorkspace]); // Added selectedWorkspace dependency


  const filteredMembers = teamMembers
    .map((member) => ({
      ...member,
      roles: member.roles ? [...new Set(member.roles.map(JSON.stringify))].map(JSON.parse) : [],
    }))
    .filter(member =>
      (member.fname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.lname?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (member.roles && member.roles.some(role =>
        (role.roleInProject?.toLowerCase() || '').includes(searchTerm.toLowerCase()))) ||
      ((member.username?.toLowerCase() || '').includes(searchTerm.toLowerCase()))
    )
  const memberPageCount = Math.ceil(filteredMembers.length / itemsPerPage)
  const currentMembers = filteredMembers.slice(
    (currentMemberPage - 1) * itemsPerPage,
    currentMemberPage * itemsPerPage
  )
  const filteredProjects = projects.filter(project => {
    const searchTerm = projectSearchTerm.toLowerCase();
    return (
      (project?.name?.toLowerCase() || '').includes(searchTerm) ||
      (project?.client_id?.name?.toLowerCase() || '').includes(searchTerm) ||
      (project?.status?.toLowerCase() || '').includes(searchTerm) ||
      project?.techStack?.some(tech => (tech?.name?.toLowerCase() || '').includes(searchTerm))
    );
  });
  const projectPageCount = Math.ceil(filteredProjects.length / itemsPerPage)
  const currentProjects = filteredProjects.slice(
    (currentProjectPage - 1) * itemsPerPage,
    currentProjectPage * itemsPerPage
  )
  const resetPagination = () => {
    setCurrentMemberPage(1)
    setCurrentProjectPage(1)
    setProjectSearchTerm('')
  }
  if (loading) {
    return (
      <div className="modalOverlay">
        <div className="modal1">
          <div className="modalHeader">
            <h2>Loading...</h2>
            <button onClick={onClose} className="closeButton">&times;</button>
          </div>
          <div className="modalContent">
            <p>Please wait while we fetch the team data.</p>
          </div>
        </div>
      </div>
    )
  }
  if (error) {
    return (
      <div className="modalOverlay">
        <div className="modal1">
          <div className="modalHeader">
            <h2>Error</h2>
            <button onClick={onClose} className="closeButton">&times;</button>
          </div>
          <div className="modalContent">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="modalOverlay">
      <div className="modal1">
        <div className="modalHeader">
          <h2>{teamName}</h2>
          <button onClick={onClose} className="closeButton">&times;</button>
        </div>
        <div className="modalContent">
          <div className="viewToggleContainer">
            <button
              className={`viewToggleButton ${activeView === 'members' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('members')
                resetPagination()
              }}
            >
              Team
            </button>
            <button
              className={`viewToggleButton ${activeView === 'projects' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('projects')
                resetPagination()
              }}
            >
              Projects
            </button>
          </div>
          {activeView === 'members' ? (
            <>
              <div className="searchContainer1">
                <div className="searchWrapper1">
                  <FaSearch className="searchIcon1" />
                  <input
                    type="text"
                    placeholder="Search by name or job title"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="searchInput1"
                  />
                </div>
              </div>
              <div className="teamMembers">
                {currentMembers.length > 0 ? (
                  currentMembers.map((member) => (
                    <TeamMemberCard
                      key={member._id || member.username}
                      member={member}
                    />
                  ))
                ) : (
                  <div className="noTeamsMessage">No team members found</div>
                )}
              </div>
              {
                <div className="pagination1">
                  <button-container
                    onClick={() => setCurrentMemberPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentMemberPage === 1}
                  >
                    Previous
                  </button-container>
                  <span>{currentMemberPage} of {memberPageCount}</span>
                  <button-container
                    onClick={() => setCurrentMemberPage(prev => Math.min(prev + 1, memberPageCount))}
                    disabled={currentMemberPage === memberPageCount}
                  >
                    Next
                  </button-container>
                </div>
              }
            </>
          ) : (
            <>
              <div className="searchContainer1">
                <div className="searchWrapper1">
                  <FaSearch className="searchIcon1"/>
                  <input
                    type="text"
                    placeholder="Search by project title,client name,techstack and status"
                    value={projectSearchTerm}
                    onChange={(e) => setProjectSearchTerm(e.target.value)}
                    className="searchInput1"
                  />
                </div>
              </div>
              <div className="projectsGrid">
                {currentProjects.length > 0 ? (
                  currentProjects.map((project, index) => (
                    <ProjectCardPod
                      key={project._id || `${project.name}-${index}`}
                      project={project}
                    />
                  ))
                ) : (
                  <div className="noTeamsMessage">No projects found</div>
                )}
              </div>
              {
                <div className="pagination1">
                  <button-container
                    onClick={() => setCurrentProjectPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentProjectPage === 1}
                  >
                    Previous
                  </button-container>
                  <span>{currentProjectPage} of {projectPageCount}</span>
                  <button-container
                    onClick={() => setCurrentProjectPage(prev => Math.min(prev + 1, projectPageCount))}
                    disabled={currentProjectPage === projectPageCount}
                  >
                    Next
                  </button-container>
                </div>
              }
            </>
          )}
        </div>
      </div>
    </div>
  )
}











