import { axiosSecureInstance } from './axios';

class SurveyResponseAPI {
  // Get all workspaces with survey statistics (for superadmin)
  static async getAllWorkspaces() {
    try {
      const response = await axiosSecureInstance.get('/api/survey-responses/workspaces');
      return response.data;
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }

  // Get surveys grouped by workspace (for superadmin)
  static async getSurveysGroupedByWorkspace() {
    try {
      const response = await axiosSecureInstance.get('/api/survey-responses/grouped');
      return response.data;
    } catch (error) {
      console.error('Error fetching grouped surveys:', error);
      throw error;
    }
  }

  // Get all surveys with response counts (for superadmin) - LEGACY
  static async getAllSurveys(workspace) {
    try {
      const params = workspace ? { workspace } : {};
      const response = await axiosSecureInstance.get(
        '/api/survey-responses/surveys',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching surveys:', error);
      throw error;
    }
  }

  // Get summary statistics for dashboard
  static async getSurveyResponseSummary(workspace) {
    try {
      const params = workspace ? { workspace } : {};
      const response = await axiosSecureInstance.get(
        '/api/survey-responses/summary',
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching survey response summary:', error);
      throw error;
    }
  }

  // Get all respondents for a specific survey
  static async getSurveyRespondents(sid) {
    try {
      const response = await axiosSecureInstance.get(
        `/api/survey-responses/surveys/${sid}/respondents`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching respondents for survey ${sid}:`, error);
      throw error;
    }
  }

  // Get detailed response of a specific user for a specific survey
  static async getUserSurveyResponse(sid, empId) {
    try {
      const response = await axiosSecureInstance.get(
        `/api/survey-responses/surveys/${sid}/users/${empId}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching user response for survey ${sid}, user ${empId}:`, error);
      throw error;
    }
  }
}

export default SurveyResponseAPI;
