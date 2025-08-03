import React, { useState, useEffect } from 'react';
import AnalyticsAPI from '../../../api/AnalyticsAPI';
import { ANALYTICS_TYPE_CONFIG } from '../../../constants/analytics';
import SurveyAnalytic from '../../../Pages/Analytics/SurveyAnalytic';
import './AnalyticsDashboard.css'

const AnalyticsDashboard = ({ workspace }) => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSurvey, setSelectedSurvey] = useState(null);

  useEffect(() => {
    if (!workspace?.workspacename) return;
    const fetchSurveys = async () => {
      try {
        const data = await AnalyticsAPI.getSurveys(workspace.workspacename);
        console.log('Fetched surveys data:', data);
        setSurveys(data);
      } catch (err) {
        console.error('Failed to fetch surveys:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveys();
  }, [workspace]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center bg-white rounded-lg p-8 shadow-md my-5">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-5"></div>
      <p className="text-gray-600">Loading surveys data...</p>
    </div>
  );

  // If a survey is selected, show the detailed analytics
  if (selectedSurvey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-6">
        {/* Back button */}
        <div className="max-w-7xl mx-auto mb-4">
          <button
            onClick={() => setSelectedSurvey(null)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Analytics Dashboard
          </button>
        </div>
        {/* Render the SurveyAnalytic component with the selected survey */}
        <SurveyAnalytic 
          surveyId={selectedSurvey.sid} 
          workspace={workspace} 
          surveyTitle={selectedSurvey.title}
          onTabChange={(newType) => {
            // Handle tab changes if needed
            console.log('Tab changed to:', newType);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-6">
      {/* Header Section */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 3v18h18" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18 17V9" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M13 17V5" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 17v-3" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">PulseSync Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Workspace: {workspace?.workspacename}</p>
            </div>
          </div>
          <p className="text-gray-700 text-lg">Gain insights from your survey data to drive meaningful change</p>
        </div>
      </div>

      {/* Surveys Grid */}
      <div className="max-w-7xl mx-auto">
        {surveys && Array.isArray(surveys) && surveys.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {surveys.map((survey) => (
              <div key={survey.title} className="bg-primary-color  rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Survey Header */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold truncate">{survey.title}</h3>
                    <span className="bg-white text-black bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                      {survey.responses || 0} responses
                    </span>
                  </div>
                </div>

                {/* Analytics Types Grid */}
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4">
                    {/* {ANALYTICS_TYPE_CONFIG.map((type) => (
                      <Link
                        key={type.id}
                        to={`/analytics/survey/${survey.sid}/${type.id}`}
                        className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                      >
                        <div className="flex-shrink-0 mr-4">
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${type.color}20` }}>
                            <div style={{ color: type.color }}>
                              {type.icon}
                            </div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors duration-200">
                            {type.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-500 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                          </svg>
                        </div>
                      </Link>
                    ))} */}
                  </div>
                </div>

                {/* View Complete Analytics Button */}
                <div className="px-6 pb-6">
                  <button
                    onClick={() => setSelectedSurvey(survey)}
                    className="w-full flex items-center justify-center py-3 px-4 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                    </svg>
                    View Complete Analytics
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Surveys Available</h3>
            <p className="text-gray-600">There are no surveys to display for this workspace.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
