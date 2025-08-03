import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spin, Empty, Button as AntButton } from 'antd'; // Renamed to avoid conflict
import { PlusOutlined, FileTextOutlined, BarChartOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getComplianceSurveys } from '../../api/complianceAPI';

// Helper component for action cards to reduce repetition
const ActionCard = ({ icon, title, description, onClick }) => (
  <div
    onClick={onClick}
    className="group bg-white border border-purple-700/20 rounded-xl p-6 text-center cursor-pointer shadow-lg hover:shadow-xl hover:-translate-y-1 hover:border-purple-500 transition-all duration-300 ease-in-out flex flex-col items-center"
  >
    <div className="text-purple-700 text-4xl mb-4 transition-transform duration-300 group-hover:scale-110">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-purple-800">{title}</h3>
    <p className="text-gray-600 mt-2 text-sm">{description}</p>
  </div>
);

const ComplianceDashboard = ({ 
  onNavigateToCreateTest, 
  onNavigateToSurveys, 
  onNavigateToSurveyResponses,
  onNavigateToSurvey,
  onBackToDashboard,
  hideBackButton = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState([]);

  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    const fetchComplianceSurveys = async () => {
      setLoading(true);
      try {
        const surveysData = await getComplianceSurveys();
        setSurveys(surveysData);
      } catch (error) {
        console.error('Error fetching surveys:', error);
        setSurveys([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComplianceSurveys();
  }, []);

  const handleNavigate = (path, surveyId = null) => {
    // Check if we have callback props for tab navigation
    if (path.includes('/compliance/create-test') && onNavigateToCreateTest) {
      onNavigateToCreateTest();
    } else if (path.includes('/compliance/surveys') && onNavigateToSurveys) {
      onNavigateToSurveys();
    } else if (path.includes('/compliance/survey-responses') && onNavigateToSurveyResponses) {
      onNavigateToSurveyResponses();
    } else if (path.includes('/compliance/test/') && onNavigateToSurvey) {
      onNavigateToSurvey(surveyId, 'take');
    } else if (path.includes('/compliance/survey/') && path.includes('/responses') && onNavigateToSurvey) {
      onNavigateToSurvey(surveyId, 'responses');
    } else {
      // Fallback to route navigation if no callbacks provided
      navigate(path);
    }
  };

  const handleBackToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      // Get workspace name from localStorage
      const workspaceName = localStorage.getItem('enteredWorkspaceName') || localStorage.getItem('workspace');
      
      if (workspaceName) {
        navigate(`/dashboard/workspacename/${workspaceName}`);
      } else {
        // Fallback to general dashboard if no workspace found
        navigate('/dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <header className="bg-gradient-to-br from-purple-700 to-purple-500 text-white p-6 rounded-2xl mb-8 shadow-lg">
        {!hideBackButton && (
          <AntButton
            icon={<ArrowLeftOutlined />}
            onClick={handleBackToDashboard}
            ghost
            className="mb-4 !border-white/80 !text-white/80 hover:!border-white hover:!text-white"
          >
            Back to Main Dashboard
          </AntButton>
        )}
        <h1 className="text-3xl font-bold">Compliance Management</h1>
        <p className="text-white/80 mt-1">Manage compliance tests and track responses.</p>
      </header>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {isAdmin && (
          <ActionCard
            icon={<PlusOutlined />}
            title="Create New Test"
            description="Build a new compliance test with AI-generated questions."
            onClick={() => handleNavigate('/compliance/create-test')}
          />
        )}
        <ActionCard
          icon={<FileTextOutlined />}
          title="View All Tests"
          description="Browse, manage, and take existing compliance tests."
          onClick={() => handleNavigate('/compliance/surveys')}
        />
        {isAdmin && (
          <ActionCard
            icon={<BarChartOutlined />}
            title="Test Responses"
            description="Analyze all test responses and submission data."
            onClick={() => handleNavigate('/compliance/survey-responses')}
          />
        )}
      </div>

      {/* Recent Surveys Section */}
      <div>
        <h2 className="text-2xl font-bold text-purple-800 mb-6">Recent Compliance Tests</h2>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <Spin size="large" />
          </div>
        ) : surveys.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {surveys.slice(0, 6).map((survey) => ( // Displaying up to 6 recent tests
              <div key={survey.id} className="bg-white rounded-lg shadow-md border border-gray-200 flex flex-col overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className="p-5 flex-grow cursor-pointer" onClick={() => handleNavigate(`/compliance/survey/${survey.id}/responses`, survey.id)}>
                  <h4 className="text-lg font-bold text-purple-800 truncate">{survey.title}</h4>
                  <p className="text-gray-500 text-sm mt-1 h-10">{survey.description}</p>
                  <div className="mt-4 text-sm">
                    <p className="font-semibold text-purple-700">{survey.totalResponses || 0} responses</p>
                    <p className="text-gray-400">Created: {new Date(survey.createdDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="border-t border-gray-200 mt-auto flex bg-gray-50/50">
                  {/* Only show "Take Survey" button for non-superadmin users */}
                  {user?.role !== 'superadmin' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNavigate(`/compliance/test/${survey.id}`, survey.id);
                      }}
                      className="flex-1 py-3 px-4 text-center text-purple-700 font-semibold hover:bg-purple-100/50 transition-colors text-sm"
                    >
                      Take Test
                    </button>
                  )}
                  {isAdmin && (
                     <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNavigate(`/compliance/survey/${survey.id}/responses`, survey.id);
                        }}
                        className={`flex-1 py-3 px-4 text-center text-purple-700 font-semibold hover:bg-purple-100/50 transition-colors text-sm ${user?.role !== 'superadmin' ? 'border-l border-gray-200' : ''}`}
                      >
                        View Responses
                      </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <Empty description={<p className="text-gray-600">No compliance tests found.</p>} image={Empty.PRESENTED_IMAGE_SIMPLE}>
              {isAdmin && (
                <button
                  onClick={() => handleNavigate('/compliance/create-test')}
                  className="mt-6 bg-purple-700 text-white font-semibold py-2 px-5 rounded-lg hover:bg-purple-800 transition-colors shadow-md hover:shadow-lg"
                >
                  Create Your First Test
                </button>
              )}
            </Empty>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComplianceDashboard;