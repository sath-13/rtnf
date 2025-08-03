// Analytics Types Configuration
export const ANALYTICS_TYPES = {
  OVERVIEW: 'overview',
  CATEGORIES: 'categories',
  SCORES: 'scores'
};

export const ANALYTICS_TYPE_CONFIG = [
  {
    id: ANALYTICS_TYPES.OVERVIEW,
    name: 'Overview',
    description: 'General survey analytics',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 17V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13 17V5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M8 17v-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#4e73df'
  },
  {
    id: ANALYTICS_TYPES.CATEGORIES,
    name: 'Category Analysis',
    description: 'Analysis by question categories',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="10,9 9,9 8,9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    color: '#1cc88a'
  },
  {
    id: ANALYTICS_TYPES.SCORES,
    name: 'Score Analysis',
    description: 'Analyze questions by score',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="2"/>
        <circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    color: '#f6c23e'
  }
];

// Chart Color Schemes
export const CHART_COLORS = {
  PRIMARY: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#858796'],
  SENTIMENT: {
    POSITIVE: '#27ae60',
    NEUTRAL: '#f39c12',
    NEGATIVE: '#e74c3c'
  },
  SCORES: {
    EXCELLENT: '#0abde3',
    GOOD: '#48dbfb',
    FAIR: '#feca57',
    POOR: '#ff6b6b'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  SURVEYS: '/api/surveys',
  SURVEY_ANALYTICS: (sid, type) => type 
    ? `/api/surveys/${sid}/analytics/${type}`
    : `/api/surveys/${sid}/analytics`
};

// Analytics Request Types
export const ANALYTICS_REQUEST_TYPES = {
  SINGLE: 'single',
  MULTIPLE: 'multiple',
  BATCH: 'batch'
};

export default {
  ANALYTICS_TYPES,
  ANALYTICS_TYPE_CONFIG,
  CHART_COLORS,
  API_ENDPOINTS,
  ANALYTICS_REQUEST_TYPES
};
