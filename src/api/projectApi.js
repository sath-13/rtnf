import { axiosSecureInstance } from "./axios";
import {
  PROJECT_API,
  CLIENT_API,
  REVENUE_API,
  TECH_STACK_API,
  TEAM_API,
  PROJECT_TEAM_API,
  IMPORT_API,
  REVIEW_API,
  FEATURE_API
} from '../constants/Portfolio_constant.js';

const handleApiError = (error) => {
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error setting up request:', error.message);
  }
};

export const getAllProjects = async (sortBy = '', search = '') => {
  try {
    const response = await axiosSecureInstance.get(PROJECT_API.GET_ALL, { params: { sortBy, search } });
    
    // Check if the response has the expected structure
    if (response.data && Array.isArray(response.data.projects)) {
      return {
        success: true,
        projects: response.data.projects,
      };
    } else {
      // If the response doesn't have the expected structure, throw an error
      throw new Error('Invalid response structure');
    }
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      success: false,
      projects: [],
    };
  }
};


export const getProjectById = async (id) => {
  try {
    const response = await axiosSecureInstance.get(PROJECT_API.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await axiosSecureInstance.post(PROJECT_API.CREATE, projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const response = await axiosSecureInstance.put(PROJECT_API.UPDATE(id), projectData);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};

export const deleteProject = async (id) => {
  try {
    const response = await axiosSecureInstance.delete(PROJECT_API.DELETE(id));
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};

export const getAllClients = async () => {
  try {
    const response = await axiosSecureInstance.get(CLIENT_API.GET_CLIENTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching client info:', error);
    handleApiError(error);
    throw error;
  }
};

export const getClientInfo = async (clientId) => {
  try {
    const response = await axiosSecureInstance.get(CLIENT_API.GET_INFO(clientId));
    return response.data;
  } catch (error) {
    console.error('Error fetching client info:', error);
    handleApiError(error);
    throw error;
  }
};

export const getClientProjects = async (clientId) => {
  try {
    const response = await axiosSecureInstance.get(CLIENT_API.GET_PROJECTS(clientId));
    return response.data;
  } catch (error) {
    console.error('Error fetching client projects:', error);
    throw error;
  }
};

export const getAllRevenueData = async () => {
  try {
    const response = await axiosSecureInstance.get(REVENUE_API.GET_ALL);
    return response.data.revenues;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};

export const getTechStackById = async (id) => {
  try {
    if (typeof id === 'object' && id !== null) {
      id = id._id || id.id;
    }
    const response = await axiosSecureInstance.get(TECH_STACK_API.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error('Error fetching tech stack by ID:', error);
    handleApiError(error);
    throw error;
  }
};

export const getTeamById = async (id) => {
  try {
    const response = await axiosSecureInstance.get(TEAM_API.GET_BY_ID(id));
    return response.data.team;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

export const getProjectTeamMembers = async (projectId) => {
  try {
    const response = await axiosSecureInstance.get(PROJECT_TEAM_API.GET_MEMBERS(projectId));
    return response.data;
  } catch (error) {
    console.error('Error fetching project team members:', error);
    throw error;
  }
};

export const getAllTeams = async () => {
  try {
    const response = await axiosSecureInstance.get(TEAM_API.GET_ALL);
    return response.data.teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const getTeamMembers = async (teamId) => {
  try {
    const response = await axiosSecureInstance.get(TEAM_API.GET_MEMBERS(teamId));
    return response.data.members;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
};

export const getProjectTeamMembersByTeam = async (teamId) => {
  try {
    const timestamp = new Date().getTime();
    const response = await axiosSecureInstance.get(`${PROJECT_TEAM_API.GET_BY_TEAM(teamId)}?_=${timestamp}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project team members:', error);
    handleApiError(error);
    throw error;
  }
};

/*
export const getAllUsers = async () => {
  try {
    const response = await axiosSecureInstance.geGET_ALL);

    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    handleApiError(error);
    throw error;
  }
};
*/

export const getAllUsers = async (workspaceName) => {
  try {
    const response = await axiosSecureInstance.get(`/api/user/get-all-users`, {
      params: { workspaceName }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error.response ? error.response.data : error);
    throw error;
  }
};

export const fetchAllUsers = async (workspaceName) => {
  try {
    
    const response = await axiosSecureInstance.get(`api/user/fetch-all`, {
      params: { workspaceName }
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error.response ? error.response.data : error);
    throw error;
  }
};


export const fetchProjectById = async (projectId) => {
  try {
    const response = await axiosSecureInstance.get(PROJECT_API.GET_BY_ID(projectId));
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
};

export const getAllProjectTeams = async () => {
  try {
    const response = await axiosSecureInstance.get(PROJECT_TEAM_API.GET_ALL);
    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && typeof response.data === 'object') {
      const arrayProperty = Object.values(response.data).find(Array.isArray);
      if (arrayProperty) {
        return arrayProperty;
      }
    }
    console.error('Unexpected response structure from getAllProjectTeams:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching all project teams:', error);
    return [];
  }
};

export const addProjectTeamMember =async (data)=>
{
  try{
    const response=await axiosSecureInstance.put(PROJECT_TEAM_API.UPDATE_PROJECT_TEAM_MEMBER,{
      project_id: data.project_id,
      user_id: data.user_id,
      role_in_project: data.role_in_project,
      team_id: data.team_id
    });
    return response.data;
  }
  catch(error){
    console.error('Error addeing project team members:', error);
    handleApiError(error);
    throw error;
  }
}


export const getProjectByTeam = async (teamId) => {
  try {
    const response = await getAllProjects(); // Replace with actual API call
    const { projects } = response || {};
    const allProjectTeams = Array.isArray(projects) ? projects : [];
    return allProjectTeams.filter(project =>
      project.team_id && project.team_id._id === teamId
    );
  } catch (error) {
    console.error('Error fetching projects by team ID:', error);
    return [];
  }
};


export const getUsersByTeamId = async (teamId) => {
  try {
    const usersResponse = await fetchAllUsers();
    const allUsers = usersResponse.users;
    if (!Array.isArray(allUsers)) {
      console.error("Expected all Users to be an array, got:", allUsers)
      return []
    }

    const teamUsers = allUsers.filter((user) => {
      if (user.teams && Array.isArray(user.teams)) {
        // Handle array of strings
        if (typeof user.teams[0] === "string") {
          return user.teams[0] === teamId // Check if the first team matches teamId
        }
        // Handle array of objects
        if (typeof user.teams[0] === "object" && user.teams[0]._id) {
          return user.teams[0]._id === teamId // Check if the first team object matches teamId
        }
      }
      return false
    })

    return teamUsers
  } catch (error) {
    console.error("Error fetching users by team ID:", error)
    return []
  }
}

export const getUsersByTeamTitle = async (workspaceName, teamTitle) => {
  try {
    const usersResponse = await fetchAllUsers(workspaceName); // Pass workspaceName
    const allUsers = usersResponse.users;

    if (!Array.isArray(allUsers)) {
      console.error("Expected all Users to be an array, got:", allUsers);
      return [];
    }

    // Filtering users who have the given teamTitle in their teamTitle array.
    const teamUsers = allUsers.filter((user) =>
      Array.isArray(user.teamTitle) && user.teamTitle.includes(teamTitle)
    );

    return teamUsers;
  } catch (error) {
    console.error("Error fetching users by team title:", error);
    return [];
  }
};



export const importProjects = async (formData) => {
  try {
    const response = await axiosSecureInstance.post(IMPORT_API.PROJECTS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error importing projects:', error);
    handleApiError(error);
    throw error;
  }
};

export const searchByAllFields = async (searchTerm = '') => {
  try {
    const response = await axiosSecureInstance.get(PROJECT_API.SEARCH, {
      params: { searchTerm }
    });
    return response.data;
  } catch (error) {
    console.error('Frontend: Error searching by all fields:', error);
    throw error;
  }
};

export const getAllReviews = async () => {
  try {
    const response = await axiosSecureInstance.get(REVIEW_API.GET_ALL);
    return response.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const deleteProjectTeamMember = async (projectId, userId) => {
  try {
    const response = await axiosSecureInstance.delete(PROJECT_TEAM_API.DELETE_PROJECT_TEAM_MEMBER(projectId, userId));
    return response.data;
  } catch (error) {
    console.error('Error deleting project team member:', error);
    handleApiError(error);
    throw error;
  }
};

export const deleteProjectTechStack= async(projectId,techStackId)=>
{
  try{
    const response=await axiosSecureInstance.delete(TECH_STACK_API.DELETE_TECHSTACK(projectId,techStackId));
    return response.data;
  }
  catch(error)
  {
    console.error('Error deleting project team member:', error);
    handleApiError(error);
    throw error;
  }
}


export const addProjectTechStack = async (projectId) => {
  try {

    const response = await axiosSecureInstance.put(TECH_STACK_API.ADD_TECHSTACK, {
      project_id: projectId.project_id,
      tech_stack_id: projectId.tech_stack_id,
    });
    return response.data;
  } catch (error) {
    console.error('Error adding tech stack to project:', error);
    handleApiError(error);
    throw error;
  }
};

export const getAllTechStacks = async()=>
{
  try{
    const response=await axiosSecureInstance.get(TECH_STACK_API.GET_ALL);
    return response.data;
  }
  catch (error) {
    console.error('Error fetching all techstacks:', error);
    handleApiError(error);
    throw error;
  }
}

export const getAllFeatures=async()=>
{
  try{
    const response=await axiosSecureInstance.get(FEATURE_API.GET_ALL);
    return response.data;
  }
  catch(error)
  {
    console.error('Error fetching all features:', error);
    handleApiError(error);
    throw error;
  }
} 

export const addProjectFeature = async ({ project_id, feature_id }) => {
  try {
    const response = await axiosSecureInstance.post(FEATURE_API.ADD_FEATURE, { project_id, feature_id });
    return response.data;
  } catch (error) {
    console.error('Error adding project feature:', error);
    handleApiError(error);
    throw error;
  }
};

export const deleteProjectFeature= async(projectId,featureId)=>
  {
    try{
      const response=await axiosSecureInstance.delete(FEATURE_API.DELETE_FEATURE(projectId,featureId));
      return response.data;
    }
    catch(error)
    {
      console.error('Error deleting project feature:', error);
      handleApiError(error);
      throw error;
    }
  }
  export const updateClient = async (clientId, clientData) => {
  try {
    const response = await axiosSecureInstance.put(CLIENT_API.UPDATE(clientId), clientData);
    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
};
export const deleteClient = async (clientId) => {
  try {
    const response = await axiosSecureInstance.delete(CLIENT_API.DELETE(clientId));
    return response.data;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

export const uploadClientPhoto = async (clientId, formData) => {
  try {
    const response = await axiosSecureInstance.post(CLIENT_API.POST(clientId),formData);
    return response;
  } catch (error) {
    console.error("Error uploading client photo:",error);
    return error;
  }
}
export const deleteClientPhoto = async (clientId) => {
  try {
    const response = await axiosSecureInstance.delete(CLIENT_API.DELETE_IMAGE(clientId));
    return response;
  } catch (error) {
    console.error("Error deleting client photo:",error);
    return error;
  }
}
export const fetchPortfolioData = async () => {
  try {
    const response = await axiosSecureInstance.get(IMPORT_API.PORTFOLIOCHATBOT)
    return response.data
  } catch (error) {
    console.error("Error fetching portfolio data:", error)
    throw error
  }
}

export const sendChatbotMessage = async (messages, portfolioData) => {
  try {
    const response = await axiosSecureInstance.post(IMPORT_API.CHATBOT_CHAT, {
      messages,
      portfolioData,
    })
    return response.data
  } catch (error) {
    console.error("Error sending chatbot message:", error)
    throw new Error(`Error sending chatbot message: ${error.response?.statusText || error.message}`)
  }
};