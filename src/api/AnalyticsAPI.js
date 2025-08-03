import { axiosSecureInstance } from './axios';
import { GET_ANALYTICS_SURVEYS_SLUG, GET_SURVEY_ANALYTICS_SLUG } from '../constants/Api_constants';

// Use environment variable for base URL
const API_BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:8011";

class AnalyticsAPI {
  // Get list of surveys
  static async getSurveys(workspace) {
    try {
      const response = await axiosSecureInstance.get(`${API_BASE_URL}${GET_ANALYTICS_SURVEYS_SLUG()}`,
        { params: { workspace } });
      return response.data;
    } catch (error) {
      console.error('Error fetching surveys:', error);
      throw error;
    }
  }

  // Get analytics for a specific survey
  static async getSurveyAnalytics(sid, type = null) {
    try {
      const endpoint = `${API_BASE_URL}${GET_SURVEY_ANALYTICS_SLUG(sid, type)}`;
      
      const response = await axiosSecureInstance.get(endpoint);
      return response.data;
    } catch (error) {
      console.error(`Error fetching analytics for ${sid}:`, error);
      throw error;
    }
  }

  // Get overview analytics
  static async getOverviewAnalytics(sid) {
    return this.getSurveyAnalytics(sid, 'overview');
  }

  // Get category analytics
  static async getCategoryAnalytics(sid) {
    return this.getSurveyAnalytics(sid, 'categories');
  }
  
  // Get score analytics (most positive/negative responses)
  static async getScoreAnalytics(sid) {
    return this.getSurveyAnalytics(sid, 'scores');
  }
  // Get toggle and checkbox analytics
  static async getToggleCheckboxAnalytics(sid) {
    return this.getSurveyAnalytics(sid, 'toggle-checkbox');
  }

  // Get multiple analytics types at once
  static async getMultipleAnalytics(sid, types = []) {
    try {
      const promises = types.map(type => this.getSurveyAnalytics(sid, type));
      const results = await Promise.all(promises);
      
      return types.reduce((acc, type, index) => {
        acc[type] = results[index];
        return acc;
      }, {});
    } catch (error) {
      console.error(`Error fetching multiple analytics for ${sid}:`, error);
      throw error;
    }
  }
}

export default AnalyticsAPI;
