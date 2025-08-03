import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Circle, Calendar, Flag, FileText, Clock, Users, Edit2, Trash } from 'lucide-react';
// import './styles.css'; // Tailwind replaces custom CSS
import { fetchProjectById, getProjectTeamMembers, updateProject, getAllClients, getAllTeams, getAllUsers, addProjectTeamMember, deleteProjectTeamMember, addProjectTechStack, getAllTechStacks, deleteProjectTechStack, getAllFeatures, addProjectFeature, deleteProjectFeature, deleteProject } from '../../api/projectApi';
import { toast } from 'react-toastify';
import { getUserRole } from "../../Utility/service";
import { toastError, toastSuccess, toastWarning } from '../../Utility/toast';

const ProjectDescription = ({ description, isEditing, onSave }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [editedDescription, setEditedDescription] = useState(description || "");

  const toggleDescription = () => {
    setIsExpanded((prev) => !prev);
  };

  const isLongDescription = editedDescription.length > 300;

  if (isEditing) {
    return (
      <div className="mb-12">
        <textarea
          className="w-full bg-white text-black rounded-md p-5"
          value={editedDescription}
          onChange={(e) => setEditedDescription(e.target.value)}
          rows={isLongDescription ? 6 : 3}
        />
      </div>
    );
  }

  return (
    <div className="mb-12">
      <p>
        {isExpanded || !isLongDescription
          ? editedDescription
          : `${editedDescription.substring(0, 300)}...`}
      </p>
      {isLongDescription && (
        <button onClick={toggleDescription} className="underline text-white mt-2">
          {isExpanded ? "See Less" : "See More"}
        </button>
      )}
    </div>
  );
};

const InfoBox = ({ icon: Icon, label, value, isEditing, onSave }) => {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  return (
    <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700 transition-transform hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Icon className="" size={20} />
          <span className="text-zinc-400 text-sm">{label}</span>
        </div>
        {isEditing ? (
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              onSave(e.target.value);
            }}
            className="text-black border border-white px-5 rounded-md"
          />
        ) : (
          <span className="text-2xl font-bold text-white">{value}</span>
        )}
      </div>
    </div>
  );
};

const Badge = ({ children, className }) => (
  <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-green-200/10 text-green-500 ${className || ''}`}>{children}</span>
);

const EditableField = ({ value, isEditing, onEdit, onSave, type = "text" }) => {
  const [editedValue, setEditedValue] = useState(value);

  if (!isEditing) {
    return value;
  }

  return (
    <input
      type={type}
      value={editedValue}
      onChange={(e) => setEditedValue(e.target.value)}
      onBlur={() => onSave(editedValue)}
      className="px-8 rounded-md"
    />
  );
};



export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [teammember, setTeammember] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(null);
  const [clients, setClients] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [teams, setTeams] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [techStack, setTechStacks] = useState([]);
  const [selectedTechStack, setSelectedTechStacks] = useState([]);
  const [feature, setFeature] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clientSearchTerm] = useState("");
  const [featureSearchTerm, setFeatureSearchTerm] = useState("");
  const [memberSearchTerm, setMemberSearchTerm] = useState("");
  const [isTeamDeleted, setIsTeamDeleted] = useState(false);

  const [role, setRole] = useState("");

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

  const handleProjectClick = (clientId) => {
    if (clientId) {
      navigate(`/${selectedWorkspace}/platform-management-feature/Client/${clientId}`);
      //navigate(`/platform-management-feature/Client/${clientId}`);
    } else {
      // toast.warning("No client to the project");
      toastWarning({ title: "Warning", description: "No client to the project" });
    }
  };

  const handleTeamClick = (teamId) => {
    if (teamId) {
      navigate(`/${selectedWorkspace}/platform-management-feature/Pod/${teamId}`);
      //navigate(`/platform-management-feature/Pod/${teamId}`);
    } else {
      // toast.warning("No team to the project");
      toastWarning({ title: "Warning", description: "No team to the project" });
    }
  };

  /*
  const handleFetchUserData = async () => {
    try {
      const { success, data, error } = await getUserData(userId, setRole);
      
    } catch(error) {
      console.error("Error fetching user data:", error);
    }
  };
*/

  useEffect(() => {
    if (project) {
      setSelectedFeatures(project.project.feature?.map(feat => feat._id) || []);
    }
  }, [project]);

  useEffect(() => {
    // handleFetchUserData();
    const fetchData = async () => {
      try {
        const response = await fetchProjectById(id);
        if (!response || !response.project) {
          throw new Error("Invalid project data");
        }
        setIsTeamDeleted(response.project.team_id?.isDeleted);
        setProject(response);
        setSelectedClientId(response.project.client_id?._id);
        setEditedProject(response);
        setSelectedTechStacks(response.project.techStack?.map((tech) => tech._id) || []);
      } catch (error) {
        console.error('Error fetching project:', error);
        alert("Failed to fetch project details. Please try again.");
      }
    };

    fetchData();
  }, [id]);




  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProjectTeamMembers(id);
        setTeammember(response.teamMembers || []);
      } catch (error) {
        console.error("Error fetching project team members:", error);
        setTeammember([]);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsResponse = await getAllClients();
        setClients(clientsResponse.clients || []);
      } catch (error) {
        console.error('Error fetching clients:', error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (project) {
      setSelectedClientId(project.project.client_id?._id);
    }
  }, [project]);

  /*
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teamsResponse = await getAllTeams();
        setTeams(teamsResponse || []);
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchTeams();
  }, []);
*/

  useEffect(() => {
    const fetchTeams = async () => {
      if (!selectedWorkspace) return; // Ensure workspaceName is available

      try {
        const teamsResponse = await getAllTeams(selectedWorkspace, 1, 10); // Pass workspaceName, page, limit
        setTeams(teamsResponse.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };

    fetchTeams();
  }, [selectedWorkspace]); // Re-fetch when workspace changes


  useEffect(() => {
    setRole(getUserRole()); // Get role from localStorage
  }, []);

  useEffect(() => {
  }, [role]);


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersResponse = await getAllUsers(selectedWorkspace);
        setUsers(usersResponse.users || []);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [selectedWorkspace]); // Ensure it re-runs when workspace changes


  useEffect(() => {
    const fetchTechStacks = async () => {
      try {
        const response = await getAllTechStacks();
        setTechStacks(response);
      }
      catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchTechStacks();
  }, [])

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await getAllFeatures();
        setFeature(response.features);
      } catch (error) {
        console.error('Error fetching features:', error);
      }
    };
    fetchFeatures();
  }, []);




  const handleDeleteProject = async () => {
    try {
      await deleteProject(id);
      // toast.success("Project deleted successfully");
      toastSuccess({ title: "Success", description: "Project deleted successfully." });
      //navigate('/platform-management-feature/portfolio');
      localStorage.setItem("activeSection", "Portfolio management"); // Ensure Portfolio Management opens
      if (role === "superadmin") {
        navigate(`/dashboard/workspacename/${selectedWorkspace}`);
      } else {
        navigate(`/${selectedWorkspace}/dashboard`);
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      // toast.error("Error deleting project.");
      toastError({ title: "Error", description: "Error deleting project." });
    }
  }

  const handleEdit = () => {
    if (role === "superadmin" || role === "admin") {
      setIsEditing(true);
    } else {
      // toast.warning("You do not have permission to edit.");
      toastWarning({ title: "Warning", description: "You do not have permission to edit." });
    }
  };

  const handleSave = async () => {
    try {
      const fullTechStack = selectedTechStack.map(techId =>
        techStack.find(tech => tech._id === techId)
      ).filter(Boolean);

      const projectToUpdate = {
        ...editedProject.project,
        techStack: fullTechStack
      };

      await updateProject(id, projectToUpdate);

      setProject(prev => ({
        ...prev,
        project: {
          ...prev.project,
          ...projectToUpdate
        }
      }));
      setEditedProject(prev => ({
        ...prev,
        project: {
          ...prev.project,
          ...projectToUpdate
        }
      }));

      setIsEditing(false);
      // toast.success("Project updated sucessfully");
      toastSuccess({ title: "Success", description: "Project updated sucessfully" });
    } catch (error) {
      console.error("Error updating project:", error);
      // toast.warning("Error updating project")
      toastWarning({ title: "Warning", description: "Error updating project" });
    }
  };


  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setSelectedClientId(clientId);
    setEditedProject((prev) => ({
      ...prev,
      project: {
        ...prev.project,
        client_id: {
          _id: clientId,
          name: clients.find((client) => client._id === clientId)?.name || "Unknown",
        },
      },
    }));
  };


  const handleTeamChange = (e) => {
    const selectedTeamId = e.target.value;

    const updatedProject = {
      ...editedProject,
      project: {
        ...editedProject.project,
        team_id: {
          ...editedProject.project.team_id,
          _id: selectedTeamId,
          teamTitle: teams.find(t => t._id === selectedTeamId)?.teamTitle || 'Unknown'
        }
      }
    };

    setEditedProject(updatedProject);
    setProject(updatedProject);
  };

  const handleTechStackChange = async (techStackId, isChecked) => {
    try {
      if (isChecked) {
        await addProjectTechStack({ project_id: id, tech_stack_id: techStackId });
        const techItem = techStack.find(tech => tech._id === techStackId);

        setSelectedTechStacks(prev => [...prev, techStackId]);
        setEditedProject(prev => ({
          ...prev,
          project: {
            ...prev.project,
            techStack: [...(prev.project.techStack || []), techItem]
          }
        }));
        setProject(prev => ({
          ...prev,
          project: {
            ...prev.project,
            techStack: [...(prev.project.techStack || []), techItem]
          }
        }));
      } else {
        await deleteProjectTechStack(id, techStackId);
        setSelectedTechStacks(prev => prev.filter(id => id !== techStackId));
        const updateTechStack = stack => stack.filter(tech => tech._id !== techStackId);

        setEditedProject(prev => ({
          ...prev,
          project: {
            ...prev.project,
            techStack: updateTechStack(prev.project.techStack || [])
          }
        }));
        setProject(prev => ({
          ...prev,
          project: {
            ...prev.project,
            techStack: updateTechStack(prev.project.techStack || [])
          }
        }));
      }
    } catch (error) {
      console.error("Error managing tech stack:", error);
      alert(`Failed to update tech stack: ${error.message}`);
    }
  };

  const handleFeatureChange = async (featureId, isChecked) => {

    try {
      if (isChecked) {
        await addProjectFeature({ project_id: id, feature_id: featureId });
        const featureItem = feature.find(feature => feature._id === featureId);

        setSelectedFeatures(prev => [...prev, featureId]);
        setEditedProject(prev => ({
          ...prev,
          project: {
            ...prev.project,
            feature: [...(prev.project.feature || []), featureItem]
          }
        }));
        setProject(prev => ({
          ...prev,
          project: {
            ...prev.project,
            feature: [...(prev.project.feature || []), featureItem]
          }
        }));
      } else {
        await deleteProjectFeature(id, featureId);
        setSelectedFeatures(prev => prev.filter(id => id !== featureId));
        const updateFeature = stack => stack.filter(feat => feat._id !== featureId);

        setEditedProject(prev => ({
          ...prev,
          project: {
            ...prev.project,
            feature: updateFeature(prev.project.feature || [])
          }
        }));
        setProject(prev => ({
          ...prev,
          project: {
            ...prev.project,
            feature: updateFeature(prev.project.feature || [])
          }
        }));
      }
    } catch (error) {
      console.error("Error managing feature:", error);
      alert(`Failed to update feature: ${error.message}`);
    }
  }

  const handleUserChange = async (userId, isChecked) => {
    try {
      if (isChecked) {
        const response = await addProjectTeamMember({
          project_id: id,
          user_id: userId,
          role_in_project: 'Member',
          team_id: project.project.team_id?._id
        });

        if (!response || !response.ProjectTeam) {
          throw new Error('Invalid response from server');
        }
      } else {
        await deleteProjectTeamMember(id, userId);
      }
      const updatedSelectedUsers = isChecked
        ? [...selectedUsers, userId]
        : selectedUsers.filter(id => id !== userId);
      setSelectedUsers(updatedSelectedUsers);

      // Refresh team members list
      const response = await getProjectTeamMembers(id);
      setTeammember(response.teamMembers || []);
    } catch (error) {
      console.error('Error managing team member:', error);
      alert(`Failed to ${isChecked ? 'add' : 'remove'} team member: ${error.message}`);
    }
  };

  if (!project) {
    return (
      <div className='flex justify-center items-center h-full w-full'>
        <div className="border-8 border-gray-200 border-t-gray-600 rounded-full w-[50px] h-[50px] animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="pb-12 bg-black">
      <div className="text-left bg-zinc-800 p-8 border border-zinc-700">
        <div className="flex items-center justify-center gap-8">
          <h1 className={isEditing ? "text-black" : "text-white font-bold m-0"}>
            <EditableField
              value={project.project.name}
              isEditing={isEditing}
              onSave={(value) => {
                setEditedProject(prev => ({
                  ...prev,
                  project: { ...prev.project, name: value }
                }));
              }}
            />
          </h1>
          <div className='flex gap-4'>
            {(role && (role === "superadmin" || role === "admin")) && (
              <button className="bg-blue-600 text-white border-none rounded-md px-3 py-2 cursor-pointer transition-colors hover:bg-blue-800" onClick={isEditing ? handleSave : handleEdit}>
                {isEditing ? 'Save' : <Edit2 size={16} />}
              </button>
            )}
            {(role && (role === "superadmin" || role === "admin")) && (
              <button className="bg-red-600 text-white border-none rounded-md px-3 py-2 cursor-pointer transition-colors" onClick={handleDeleteProject}>
                <Trash size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-white p-6 flex bg-black gap-8 max-w-[1100px] mx-auto justify-center">
        <div className="flex-1 max-w-[800px]">
          <ProjectDescription
            description={project.project.description}
            isEditing={isEditing}
            onSave={(value) => {
              setEditedProject((prev) => ({
                ...prev,
                project: { ...prev.project, description: value },
              }));
            }}
          />

          <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Client */}
            <div className="p-4 rounded-lg flex items-center gap-3 border border-zinc-700">
              <Users size={20} />
              <span className="text-zinc-400 font-medium min-w-[80px]">Client</span>
              {isEditing ? (
                <div>
                  <select
                    value={selectedClientId || ''}
                    onChange={handleClientChange}
                    className="border p-2 rounded"
                  >
                    <option value="">Select a client</option>
                    {Array.isArray(clients) && clients.length > 0 ? (
                      clients
                        .filter(client => client.name.toLowerCase().includes(clientSearchTerm.toLowerCase()))
                        .map((client) => (
                          <option key={client._id} value={client._id}>
                            {client.name}
                          </option>
                        ))
                    ) : (
                      <option>No clients available</option>
                    )}
                  </select>
                </div>
              ) : (
                <div
                  className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full bg-zinc-700 text-xs hover:bg-zinc-600"
                  onClick={() => handleProjectClick(project.project.client_id?._id)}
                >
                  {project.project.client_id?.name || 'Unknown'}
                </div>
              )}
            </div>

            {/* Status */}
            <div className="p-4 rounded-lg flex items-center gap-3 border border-zinc-700">
              <Circle size={20} />
              <span className="text-zinc-400 font-medium min-w-[80px]">Status</span>
              <Badge className="rounded-md text-green-700">
                <EditableField
                  value={project.project.status}
                  isEditing={isEditing}
                  onSave={(value) => {
                    setEditedProject(prev => ({
                      ...prev,
                      project: { ...prev.project, status: value }
                    }));
                  }}
                />
              </Badge>
            </div>

            {/* Timeline */}
            <div className="p-4 rounded-lg flex items-center gap-3 border border-zinc-700">
              <Calendar size={20} />
              <span className="text-zinc-400 font-medium min-w-[80px]">Timeline</span>
              {isEditing ? (
                <div className="flex flex-col">
                  <input
                    type="date"
                    value={editedProject?.start_time ? editedProject.start_time.split('T')[0] : ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setEditedProject((prev) => ({
                        ...prev,
                        project: {
                          ...prev.project,
                          start_time: newValue,
                        },
                      }));
                    }}
                    className="border p-2 rounded"
                  />
                  {' → '}
                  <input
                    type="date"
                    value={editedProject?.end_time ? editedProject.end_time.split('T')[0] : ''}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      setEditedProject((prev) => ({
                        ...prev,
                        project: {
                          ...prev.project,
                          end_time: newValue,
                        },
                      }));
                    }}
                    className="border p-2 rounded"
                  />
                </div>
              ) : (
                <span>
                  {project.project.start_time ? new Date(project.project.start_time).toLocaleDateString() : 'N/A'}
                  {' → '}
                  {project.project.end_time ? new Date(project.project.end_time).toLocaleDateString() : 'N/A'}
                </span>
              )}
            </div>

            {/* Tech Stack */}
            <div className="p-4 rounded-lg flex items-center gap-3 border border-zinc-700">
              <Flag size={20} />
              <span className="text-zinc-400 font-medium min-w-[80px]">Tech Stack</span>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    placeholder="Search tech stack..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border p-2 rounded mb-2"
                  />
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto p-2">
                    {Array.isArray(techStack) && techStack.length > 0 ? (
                      techStack
                        .filter((tech) => tech.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((tech) => {
                          const isSelected = selectedTechStack.includes(tech._id);
                          return (
                            <div key={tech._id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`tech-${tech._id}`}
                                checked={isSelected}
                                onChange={(e) => handleTechStackChange(tech._id, e.target.checked)}
                              />
                              <label htmlFor={`tech-${tech._id}`}>{tech.name}</label>
                            </div>
                          );
                        })
                    ) : (
                      <div>No tech stacks available</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  {Array.isArray(project.project.techStack) && project.project.techStack.length > 0 ? (
                    project.project.techStack.map((tech) => (
                      <div key={tech._id} className="mb-1">
                        <Badge>{tech.name}</Badge>
                      </div>
                    ))
                  ) : (
                    <div>No tech stacks assigned</div>
                  )}
                </div>
              )}
            </div>

            {/* Members */}
            <div className="p-4 rounded-lg flex items-center gap-3 border border-zinc-700">
              <FileText size={20} />
              <span className="text-zinc-400 font-medium min-w-[80px]">Members</span>
              {isEditing ? (
                <div>
                  <input
                    type="text"
                    placeholder="Search members..."
                    value={memberSearchTerm}
                    onChange={(e) => setMemberSearchTerm(e.target.value)}
                    className="border p-2 rounded mb-2"
                  />
                  <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto p-2">
                    {Array.isArray(users) && users.length > 0 ? (
                      users
                        .filter(user => `${user.fname} ${user.lname}`.toLowerCase().includes(memberSearchTerm.toLowerCase()))
                        .map((user) => {
                          const isSelected = teammember.some(member =>
                            member.user_id?._id === user._id
                          );
                          return (
                            <div key={user._id} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={`user-${user._id}`}
                                checked={isSelected}
                                onChange={(e) => handleUserChange(user._id, e.target.checked)}
                              />
                              <label htmlFor={`user-${user._id}`}>{user.fname} {user.lname}</label>
                            </div>
                          );
                        })
                    ) : (
                      <div>No users available</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1">
                  {Array.isArray(teammember) && teammember.length > 0 ? (
                    teammember.map((member) => (
                      <div key={member._id} className="mb-1">
                        {member.user_id?.fname} {member.user_id?.lname}
                        <span className="text-zinc-400"> - {member.role_in_project}</span>
                      </div>
                    ))
                  ) : (
                    <div>No team members assigned</div>
                  )}
                </div>
              )}
            </div>

            {/* Team */}
            <div className="p-4 rounded-lg flex items-center gap-3 border border-zinc-700">
              <Users size={20} />
              <span className="text-zinc-400 font-medium min-w-[80px]">Team</span>
              {isEditing ? (
                <select
                  value={project.project.team_id?._id || ''}
                  onChange={handleTeamChange}
                  className="border p-2 rounded"
                >
                  <option value="">Select a team</option>
                  {Array.isArray(teams) && teams.length > 0 ? (
                    teams.map((team) => (
                      <option key={team._id} value={team._id}>
                        {team.teamTitle}
                      </option>
                    ))
                  ) : (
                    <option>No teams available</option>
                  )}
                </select>
              ) : (
                <div
                  className="flex items-center gap-2 cursor-pointer px-3 py-1 rounded-full bg-zinc-700 text-xs hover:bg-zinc-600"
                  onClick={() => handleTeamClick(project.project.team_id?._id)}
                >
                  {isTeamDeleted ? (<span>No team assigned</span>) : (<span>{project.project.team_id?.teamTitle}</span>)}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-24">
            <InfoBox
              icon={Clock}
              label="Hours Spent"
              value={project.project.hr_taken || "N/A"}
              isEditing={isEditing}
              onSave={(value) => {
                setEditedProject(prev => ({
                  ...prev,
                  project: { ...prev.project, hr_taken: value }
                }));
              }}
            />
            <InfoBox
              icon={Users}
              label="Team Size"
              value={teammember.length || 0}
            />
          </div>
        </div>

        <div className="w-[300px] bg-zinc-800 rounded-2xl p-6 border border-zinc-700 mb-24">
          <h2 className="text-2xl mb-5 text-zinc-100 text-center font-semibold">Features</h2>
          {isEditing ? (
            <div>
              <input
                type="text"
                placeholder="Search features..."
                value={featureSearchTerm}
                onChange={(e) => setFeatureSearchTerm(e.target.value)}
                className="border p-2 rounded mb-2"
              />
              <div className="flex flex-col gap-8 max-h-full">
                {Array.isArray(feature) && feature.length > 0 ? (
                  feature
                    .filter(feat => feat.name.toLowerCase().includes(featureSearchTerm.toLowerCase()))
                    .map((feat) => {
                      const isSelected = selectedFeatures.includes(feat._id);
                      return (
                        <div key={feat._id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`feature-${feat._id}`}
                            checked={isSelected}
                            onChange={(e) => handleFeatureChange(feat._id, e.target.checked)}
                          />
                          <label htmlFor={`feature-${feat._id}`}>{feat.name}</label>
                        </div>
                      );
                    })
                ) : (
                  <div>No features available</div>
                )}
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-3 p-0 m-0">
              {project.project.feature?.map((feat, index) => (
                <li key={index} className="bg-zinc-700 p-3 rounded-lg text-zinc-100 transition-transform hover:translate-x-1 hover:bg-zinc-600">
                  {feat.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
