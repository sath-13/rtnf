import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate,useSearchParams } from 'react-router-dom';
import AnalyticsAPI from '../../api/AnalyticsAPI';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ScoreAnalytics from '../../components/Analytics/ScoreAnalytics';
import CategoryAnalytics from '../../components/Analytics/CategoryAnalytics';
import ToggleCheckboxAnalytics from '../../components/Analytics/ToggleCheckboxAnalytics';
ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend);

const SurveyAnalytic = ({ surveyId: propSurveyId, workspace: propWorkspace, surveyTitle: propSurveyTitle, onTabChange }) => {
  const [ser] = useSearchParams();
  const routerWorkspace = ser.get("workspace");
  const { sid: routerSid, type = 'overview' } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentType, setCurrentType] = useState(type);
  const navigate = useNavigate();

  // Use props if provided, otherwise use router params
  const sid = propSurveyId || routerSid;
  const workspace = propWorkspace || { workspacename: routerWorkspace };
  const surveyTitle = propSurveyTitle;

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await AnalyticsAPI.getSurveyAnalytics(sid, currentType);
        console.log('Analytics data received:', data);
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
        setError(err.response?.data?.error || 'Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };

    if (sid) {
      fetchAnalytics();
    }
  }, [sid, currentType]);

  const handleTabChange = (newType) => {
    if (onTabChange) {
      // If using as a component, update internal state
      setCurrentType(newType);
      onTabChange(newType);
    } else {
      // If using with router, navigate to new route
      navigate(`/analytics/${sid}/${newType}`);
    }
  };

  const renderTabButton = (tabType, label, icon) => {
    const isActive = currentType === tabType || (!currentType && tabType === 'overview');
    const baseClasses = `${isActive
      ? 'px-6 py-4 font-medium text-purple-600 border-b-2 border-purple-500 bg-purple-50' 
      : 'px-6 py-4 font-medium text-gray-600 hover:text-purple-600 hover:bg-gray-50 transition-colors'
    } flex items-center`;

    if (propSurveyId) {
      // Using as a component, render button
      return (
        <button
          key={tabType}
          onClick={() => handleTabChange(tabType)}
          className={baseClasses}
        >
          {icon}
          {label}
        </button>
      );
    } else {
      // Using with router, render Link
      return (
        <Link 
          key={tabType}
          to={`/analytics/survey/${sid}/${tabType}?workspace=${workspace?.workspacename}`} 
          className={baseClasses}
        >
          {icon}
          {label}
        </Link>
      );
    }
  };

  const renderAnalytics = () => {
    if (!analytics) return null;

    switch (currentType) {
      case 'categories':
        return <CategoryAnalytics analytics={analytics} />;
      case 'scores':
        return <ScoreAnalytics analytics={analytics} />;
        case 'toggle-checkbox':
          return <ToggleCheckboxAnalytics analytics={analytics} />;
      default:
        return renderOverviewAnalytics();
    }
  };

  const renderOverviewAnalytics = () => (
    <div className="bg-white p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3 text-purple-500">📊</span>
          Survey Analytics Overview
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Total Responses</h3>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <p className="text-3xl font-bold text-purple-800">{analytics.totalResponses}</p>
            <div className="mt-2 text-sm text-purple-600">Total survey participants</div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-green-800 uppercase tracking-wider">Average Score</h3>
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <p className="text-3xl font-bold text-green-800">
              {analytics.overallAverage?.toFixed(2) || 'N/A'}
            </p>
            <div className="mt-2 text-sm text-green-600">Out of 5.00 maximum</div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider">Completion Rate</h3>
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <p className="text-3xl font-bold text-purple-800">
              {analytics.completionRate ? `${analytics.completionRate}%` : 'N/A'}
            </p>
            <div className="mt-2 text-sm text-purple-600">Survey completion rate</div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2 text-purple-500">📝</span>
          Question Responses
        </h3>
      </div>

      {analytics.questionAnalytics?.map((q, idx) => {
        console.log(`Question ${idx} distribution:`, q.distribution);
        
        // Handle different possible distribution formats
        let chartData;
        if (q.distribution && typeof q.distribution === 'object') {
          // Check if it's already in the expected format
          if (q.distribution['1'] && typeof q.distribution['1'] === 'object') {
            // Format: { "1": { count: 5 }, "2": { count: 3 } }
            chartData = [
              q.distribution['1']?.count || 0,
              q.distribution['2']?.count || 0,
              q.distribution['3']?.count || 0,
              q.distribution['4']?.count || 0,
              q.distribution['5']?.count || 0
            ];
          } else {
            // Format: { "1": 5, "2": 3 } or other formats
            chartData = [
              q.distribution['1'] || 0,
              q.distribution['2'] || 0,
              q.distribution['3'] || 0,
              q.distribution['4'] || 0,
              q.distribution['5'] || 0
            ];
          }
        } else {
          // Fallback to empty data
          chartData = [0, 0, 0, 0, 0];
          console.warn(`Missing distribution data for question: ${q.question}`);
        } 
        
        const data = {
          labels: ['1', '2', '3', '4', '5'],
          datasets: [
            {
              label: `Response Count`,
              data: chartData,
              backgroundColor: ['#c084fc', '#a855f7', '#9333ea', '#7c3aed', '#6d28d9'],
              borderColor: ['#a855f7', '#9333ea', '#7c3aed', '#6d28d9', '#5b21b6'],
              borderWidth: 1
            },
          ],
        };

        console.log(`Question ${idx} chart data:`, data.datasets[0].data);

        return (
          <div key={idx} className="mb-8 bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
            <div className="p-5 border-b border-gray-200 bg-white">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">{q.question}</h4>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">{q.category}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  q.averageScore >= 4.0 ? 'bg-green-100 text-green-700' :
                  q.averageScore >= 3.0 ? 'bg-purple-100 text-purple-700' :
                  q.averageScore >= 2.0 ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Avg: {q.averageScore?.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="h-[300px] p-5 relative">
              <Bar 
                data={data} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false,
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        precision: 0,
                        stepSize: 1
                      },
                      title: {
                        display: true,
                        text: 'Number of Responses'
                      }
                    },
                    x: {
                      title: {
                        display: true,
                        text: 'Score Value'
                      }
                    }
                  },
                  plugins: {
                    tooltip: {
                      callbacks: {
                        title: (tooltipItems) => {
                          return `Score: ${tooltipItems[0].label}`;
                        },
                        label: (context) => {
                          return `Responses: ${context.raw}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4].map(score => (
                  <div key={`legend-${score}`} className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ 
                      backgroundColor: score === 1 ? '#e879f9' : 
                                      score === 2 ? '#c084fc' : 
                                      score === 3 ? '#a855f7' : '#9333ea' 
                    }}></div>
                    <span className="text-xs text-gray-600">
                      Score {score}: {q.distribution[score]?.count || 0} responses
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Analytics</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link to="/analytics" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">
              Return to Analytics Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-fit min-h-screen bg-white-50">
      <div className="min-w-100 px-1 py-1">
        <div className="bg- rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {surveyTitle || analytics?.title || 'Survey Analytics'}
                </h1>
                {analytics?.description && (
                  <p className="text-blue-100 mt-1">
                    {analytics.description}
                  </p>
                )}
              </div>
              {!propSurveyId && (
                <Link 
                  to={`/dashboard/workspacename/${workspace?.workspacename}`}
                  className="text-white bg-white/20 hover:bg-white/30 px-4 py-2 rounded-md text-sm font-medium flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                  </svg>
                  Back to Dashboard
                </Link>
              )}
            </div>
          </div>
          
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {renderTabButton('overview', 'Overview', 
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                </svg>
              )}
              {renderTabButton('categories', 'Categories',
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
              )}
              {renderTabButton('scores', 'Scores',
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                </svg>
              )}
              {renderTabButton('toggle-checkbox', 'Toggle & Checkbox',
                <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
          </div>
          
          <div>
            {renderAnalytics()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyAnalytic;
