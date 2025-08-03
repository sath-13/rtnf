export const CLIENT_GET_ALL = 'api/clients/';
export const CLIENT_GET_INFO = (clientId) => `/api/clients/${clientId}`;
export const CLIENT_GET_PROJECTS = (clientId) => `/api/projects/client/${clientId}`;
export const CLIENT_UPLOAD_IMAGE = (clientId) => `/api/clients/upload-image/${clientId}`;
export const CLIENT_DELETE_UPLOAD_IMAGE = (clientId) => `/api/clients/delete-image/${clientId}`;
export const REVENUE_GET_ALL = '/api/revenue';
export const TECH_STACK_GET_BY_ID = (id) => `/api/techStacks/${id}`;
export const TEAM_GET_BY_ID = (id) => `/api/teams/${id}`;
//export const TEAM_GET_ALL = '/api/teams';
export const TEAM_GET_ALL = (workspaceName) => `/api/teams/workspacename/${workspaceName}`;
export const TEAM_GET_MEMBERS = (teamId) => `/api/teams/${teamId}/members`;
export const PROJECT_TEAM_GET_MEMBERS = (projectId) => `/api/project-team/project/${projectId}`;
export const PROJECT_TEAM_GET_USER_ROLES = (userId) => `/api/project-team/user-roles/${userId}`;
export const PROJECT_TEAM_GET_BY_TEAM = (teamId) => `/api/project-team/team/${teamId}`;
export const PROJECT_TEAM_MEMBER_ADD =`/api/project-team/projectTeams`;
export const PROJECT_TEAM_MEMBER_DELETE=(projectId, userId)=>`/api/project-team/${projectId}/member/${userId}`;
export const PROJECT_TEAM_GET_ALL = '/api/project-team/all';
export const USER_GET_ALL = '/api/user/get-all-users';
export const FETCH_ALL_USERS = '/api/user/fetch-all';
export const IMPORT_PROJECTS = '/api/import';
export const REVIEW_GET_ALL = '/api/reviews';
export const ADD_PROJECT_TECH_STACKS= `api/techStacks/project-tech-stack`;
export const DELETE_PROJECT_TECH_STACKS=(projectId,techStackId)=>`api/techStacks/project-tech-stack/${projectId}/${techStackId}`;
export const TECH_STACKS_GET_ALL= `/api/techStacks/`;
export const PROJECT_GET_ALL = '/api/projects';
export const PROJECT_GET_BY_ID = (id) => `/api/projects/project/${id}`;
export const PROJECT_CREATE = '/api/projects';
export const PROJECT_UPDATE = (id) => `/api/projects/${id}`;
export const PROJECT_DELETE = (id) => `/api/projects/${id}`;
export const PROJECT_SEARCH = '/api/projects/search';
export const FEATURES_GET_ALL= 'api/features';
export const ADD_PROJECT_FEATURE=`api/features/projects/features`;
export const DELETE_PROJECT_FEATURE=(projectId,featureId)=>`api/features/projects/features/${projectId}/${featureId}`;
export const HUGGINGFACE_GET = '/api/models';

export const PORTFOLIO_DATA = "/api/chatbot/fetch-portfolio-data"
export const CHATBOTRESPONSE = "/api/chatbot/chat"
// Group related constants
export const PROJECT_API = {
  GET_ALL: PROJECT_GET_ALL,
  GET_BY_ID: PROJECT_GET_BY_ID,
  CREATE: PROJECT_CREATE,
  UPDATE: PROJECT_UPDATE,
  DELETE: PROJECT_DELETE,
  SEARCH: PROJECT_SEARCH,
};

export const CLIENT_API = {
  GET_INFO: CLIENT_GET_INFO,
  GET_PROJECTS: CLIENT_GET_PROJECTS,
  UPDATE: (clientId) => `/api/clients/${clientId}`,
  DELETE: (clientId) => `/api/clients/${clientId}`,
  POST: CLIENT_UPLOAD_IMAGE,
  DELETE_IMAGE: CLIENT_DELETE_UPLOAD_IMAGE,
  GET_CLIENTS:  CLIENT_GET_ALL,
};

export const REVENUE_API = {
  GET_ALL: REVENUE_GET_ALL,
};

export const TECH_STACK_API = {
  GET_BY_ID: TECH_STACK_GET_BY_ID,
  ADD_TECHSTACK:ADD_PROJECT_TECH_STACKS,
  DELETE_TECHSTACK:DELETE_PROJECT_TECH_STACKS,
  GET_ALL:TECH_STACKS_GET_ALL
};

//huggingfaceapi
export const HUGGINGFACE_API = {
  GET_ALL: HUGGINGFACE_GET,
};

export const TEAM_API = {
  GET_BY_ID: TEAM_GET_BY_ID,
  GET_ALL: TEAM_GET_ALL,
  GET_MEMBERS: TEAM_GET_MEMBERS,
};

export const PROJECT_TEAM_API = {
  GET_MEMBERS: PROJECT_TEAM_GET_MEMBERS,
  GET_BY_TEAM: PROJECT_TEAM_GET_BY_TEAM,
  GET_ALL: PROJECT_TEAM_GET_ALL,
  GET_USER_ROLES: PROJECT_TEAM_GET_USER_ROLES,  // Add this line
  UPDATE_PROJECT_TEAM_MEMBER: PROJECT_TEAM_MEMBER_ADD,
  DELETE_PROJECT_TEAM_MEMBER:PROJECT_TEAM_MEMBER_DELETE
};
export const USER_API = {
  GET_ALL: USER_GET_ALL,
  FETCH_ALL: FETCH_ALL_USERS,
};

export const IMPORT_API = {
  PROJECTS: IMPORT_PROJECTS,
  PORTFOLIOCHATBOT: PORTFOLIO_DATA,
  CHATBOT_CHAT:CHATBOTRESPONSE,

};

export const REVIEW_API = {
  GET_ALL: REVIEW_GET_ALL,
};

export const FEATURE_API={
  GET_ALL:FEATURES_GET_ALL,
  ADD_FEATURE:ADD_PROJECT_FEATURE,
  DELETE_FEATURE:DELETE_PROJECT_FEATURE
}