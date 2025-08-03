import axios from 'axios';
import {
  GENERATE_COMPLIANCE_TEST_SLUG,
  CREATE_COMPLIANCE_TEST_SLUG,
  GET_COMPLIANCE_TEST_SLUG,
  SUBMIT_COMPLIANCE_TEST_SLUG,
  GET_ALL_COMPLIANCE_SURVEYS_SLUG,
  GET_SURVEY_RESPONSES_OVERVIEW_SLUG,
  GET_SURVEY_DETAILED_RESPONSES_SLUG
} from '../constants/Api_constants';

// Get the base URL from environment or default to current backend
const BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:8011';

// Create axios instance with base configuration
const complianceAPI = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
complianceAPI.interceptors.request.use(
  (config) => {
    // Try both token keys for compatibility
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Compliance Test API functions
export const generateComplianceTest = async (data) => {
  try {
    const response = await complianceAPI.post(GENERATE_COMPLIANCE_TEST_SLUG(), data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const createComplianceTest = async (data) => {
  try {
    const response = await complianceAPI.post(CREATE_COMPLIANCE_TEST_SLUG(), data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getComplianceTest = async (testId) => {
  try {
    const response = await complianceAPI.get(GET_COMPLIANCE_TEST_SLUG(testId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitComplianceTest = async (data) => {
  try {
    console.log('submitComplianceTest API called with:', data);
    const response = await complianceAPI.post(SUBMIT_COMPLIANCE_TEST_SLUG(), data);
    console.log('submitComplianceTest API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('submitComplianceTest API error:', error);
    console.error('Error response:', error.response?.data);
    console.error('Error status:', error.response?.status);
    throw error.response?.data || error.message;
  }
};

// Additional API functions for compliance surveys management
export const getComplianceSurveys = async () => {
  try {
    // Get workspace from localStorage - check both possible keys
    const workspace = localStorage.getItem("enteredWorkspaceName") || localStorage.getItem("selectedWorkspace");
    const params = workspace ? { workspacename: workspace } : {};
    
    const response = await complianceAPI.get(GET_ALL_COMPLIANCE_SURVEYS_SLUG(), { params });
    return response.data;
  } catch (error) {
    console.error("❌ Error in getComplianceSurveys:", error);
    throw error.response?.data || error.message;
  }
};

export const getSurveyResponses = async (surveyId) => {
  try {
    const response = await complianceAPI.get(GET_SURVEY_DETAILED_RESPONSES_SLUG(surveyId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getAllSurveyResponses = async () => {
  try {
    // Get workspace from localStorage - check both possible keys
    const workspace = localStorage.getItem("enteredWorkspaceName") || localStorage.getItem("selectedWorkspace");
    const params = workspace ? { workspacename: workspace } : {};
    
    const response = await complianceAPI.get(GET_SURVEY_RESPONSES_OVERVIEW_SLUG(), { params });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getSurveyDetail = async (surveyId) => {
  try {
    const response = await complianceAPI.get(GET_SURVEY_DETAILED_RESPONSES_SLUG(surveyId));
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export default complianceAPI;
