import {
  CalendarCheck2,
  Plus,
  PanelLeft,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosSecureInstance } from "../../api/axios";
import { GET_ACTIVE_SURVEYS_SLUG, GET_SURVEY_ANALYTICS_OVERVIEW_SLUG } from "../../constants/Api_constants";
import FeedbackSection from "./FeedbackSection";

export const Pulsesync = ({ prop, role, user, workspace }) => {
  const [loading,setLoading] = useState(true)  
  const [value, setToValue] = useState("overview");
  const [active, setactive] = useState(1);
  const formopen = prop;
  const navigate = useNavigate();

  const [activeSurveys, setActiveSurveys] = useState([]);
  const [analytics, setAnalytics] = useState({
    activeSurveys: 0,
    totalResponses: 0,
    responseRate: 0,
    avgRating: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!workspace?.workspacename) return;
        const surveyRes = await axiosSecureInstance.get(GET_ACTIVE_SURVEYS_SLUG(), { params: {
          workspacename: workspace?.workspacename
        } });
        const analyticsRes = await axiosSecureInstance.get(GET_SURVEY_ANALYTICS_OVERVIEW_SLUG());
        setLoading(false)
        setActiveSurveys(surveyRes.data);
        setAnalytics(analyticsRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, [workspace]);

  function changeContent(value) {
    switch (value) {
      case "overview":
        return (
          <div className="flex flex-col md:flex-row w-full gap-6 rounded-xl">
            <div className="flex-1 rounded-xl p-4 border shadow-md" style={{ borderColor: '#743799', boxShadow: '0 4px 12px rgba(116, 55, 153, 0.1)' }}>
              <div className="p-3">
                <h1 className="text-2xl font-medium" style={{ color: '#743799' }}>Recent Survey Performance</h1>
                <h1 className="text-sm">Latest engagement metrics</h1>
              </div>
              {loading ? (
          <div className="flex justify-center items-center p-10">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-blue-500 font-medium">Loading surveys...</span>
          </div>
              ) : (activeSurveys.map((survey) => (
          <div
            key={survey.sid}
            className="details flex flex-row border justify-between p-4 mx-2 rounded-xl"
            style={{ borderColor: '#743799', boxShadow: '0 2px 8px rgba(116, 55, 153, 0.1)' }}
          >
            <div className="gap-2 flex flex-col">
              <h1 className="text-base font-semibold" style={{ color: '#743799' }}>{survey.survey.title}</h1>
              <h1 className="text-sm">{survey.survey.description}</h1>
              <h1 className="text-sm">Category: {survey.survey.category}</h1>

              {/* 👉 Add this button to go to response page */}
              <button
                onClick={() => navigate(`/response/${survey.sid}?workspace=${workspace?.workspacename}`)}
                className="text-sm mt-2 underline hover:text-purple-700 transition-colors text-left"
                style={{ color: '#743799' }}
              >
                Open Survey
              </button>
            </div>
            <div className="gap-4 flex flex-col">
              <div className="rounded-xl text-white h-fit px-2 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #743799 0%, #9c4dcc 100%)' }}>
                active
              </div>
              <h1 className="text-sm">
                Due: {new Date(survey.survey.dueDate).toLocaleDateString()}
              </h1>
            </div>
          </div>
              )))}

            </div>

            <div className="flex-1 rounded-xl p-4 border shadow-md" style={{ borderColor: '#743799', boxShadow: '0 4px 12px rgba(116, 55, 153, 0.1)' }}>
              <div className="p-3">
                <h1 className="text-2xl font-medium" style={{ color: '#743799' }}>Quick Actions</h1>
                <h1 className="text-sm">Common tasks</h1>
              </div>
              <div className="details border mt-3 mx-2 rounded-xl hover:bg-gray-100" style={{ borderColor: '#743799' }}>
              {(user.role === "superadmin" || user.role === "admin") && (
             <button
             className="rounded-md h-11 flex flex-row justify-center items-center px-5 gap-2"
             onClick={() => formopen(true)}
           >
             <Plus size={20} color="#743799" />
             <div className="text-base" style={{ color: '#743799' }}>Create Survey</div>
           </button>
          )}
               
              </div>
            </div>
          </div>
        );

      case "activeSurveys":
        return (
          <div className="md:flex-row w-full border shadow-md pb-2" style={{ borderColor: '#743799', boxShadow: '0 4px 12px rgba(116, 55, 153, 0.1)' }}>
            <div className="flex-1 rounded-xl p-7">
              <h1 className="text-2xl font-medium" style={{ color: '#743799' }}>Active Surveys</h1>
              <h1 className="text-sm">Currently running pulse surveys</h1>
            </div>
            <div className="flex flex-col gap-3 mx-3">
              {activeSurveys.map((survey) => (
                <div
                  key={survey.sid}
                  className="details flex flex-row border justify-between p-4 mx-2 rounded-xl"
                  style={{ borderColor: '#743799', boxShadow: '0 2px 8px rgba(116, 55, 153, 0.1)' }}
                >
                  <div className="gap-2 flex flex-col">
                    <h1 className="text-base font-semibold" style={{ color: '#743799' }}>{survey.survey.title}</h1>
                    <h1 className="text-sm">{survey.survey.description}</h1>
                    <h1 className="text-sm">Category: {survey.survey.category}</h1>
                  </div>
                  <div className="gap-4 flex flex-col">
                    <div className="rounded-xl text-white h-fit px-2 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #743799 0%, #9c4dcc 100%)' }}>
                      active
                    </div>
                    <h1 className="text-sm">
                      Due: {new Date(survey.survey.dueDate).toLocaleDateString()}
                    </h1>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "feedback":
        return (
          <div className="w-full">
            <FeedbackSection user={user} />
          </div>
        );
      
      default:
        return (
          <div className="w-full">
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold text-gray-600">Section not found</h2>
              <p className="text-gray-500">Please select a valid tab</p>
            </div>
          </div>
        );
    }
  }

  return (
    
    <div className="pulsesyncpage" style={{ backgroundColor: 'rgba(116, 55, 153, 0.05)', minHeight: '100vh' }}>
      <div className="h-16 flex items-center p-7 border" style={{ background: 'linear-gradient(135deg, #743799 0%, #9c4dcc 100%)' }}>
        <PanelLeft size={18} strokeWidth={1.5} color="white" />
        <h1 className="text-xl font-semibold p-5 text-white">PulseSync</h1>
      </div>

      <div className="flex flex-col gap-8">
        <div className="w-full p-7 flex flex-row justify-between justify-items-center">
          <div className="flex flex-col">
            <span className="text-3xl font-bold" style={{ color: '#743799' }}></span>
            <span className="text-base mt-1">
              Monitor employee engagement and gather valuable feedback
            </span>
            <span className="text-base mt-1">
              workspace: <b style={{ color: '#743799' }}>{workspace?.workspacename}</b>
            </span>
          </div>
          {(user.role === "superadmin" || user.role === "admin") && (
            <button
            onClick={(user) => formopen(true)}
            className="rounded-md h-11 text-sm font-medium px-2 text-white w-36 flex items-center justify-center"
            style={{ 
              background: 'linear-gradient(135deg, #743799 0%, #9c4dcc 100%)',
              transition: 'all 0.3s ease',
              border: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(116, 55, 153, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            + Create Survey
          </button>
          )}
          
          
        </div>
        {/* Metrics */}
        {(user.role === "superadmin" || user.role === "admin" ) && (
             <div className="w-full flex flex-wrap gap-4 px-4">
             <div className="boxes flex-1 min-w-[200px] border shadow-md rounded-xl px-6 py-5" style={{ borderColor: '#743799', boxShadow: '0 4px 12px rgba(116, 55, 153, 0.1)' }}>
               <div className="flex flex-row justify-between">
                 <h1 className="text-base font-medium" style={{ color: '#743799' }}>Active Surveys</h1>
                 <CalendarCheck2 size={20} strokeWidth={1.5} color="#743799" />
               </div>
               <div className="text-3xl font-bold" style={{ color: '#743799' }}>{analytics.activeSurveys}</div>
               <div className="text-sm">Currently running</div>
             </div>
             <div className="boxes flex-1 min-w-[200px] border shadow-md rounded-xl px-6 py-5" style={{ borderColor: '#743799', boxShadow: '0 4px 12px rgba(116, 55, 153, 0.1)' }}>
               <div className="flex flex-row justify-between">
                 <h1 className="text-base font-medium" style={{ color: '#743799' }}>Total Responses</h1>
                 <CalendarCheck2 size={20} strokeWidth={1.5} color="#743799" />
               </div>
               <div className="text-3xl font-bold" style={{ color: '#743799' }}>{analytics.totalResponses}</div>
               <div className="text-sm">This Month</div>
             </div>
             <div className="boxes flex-1 min-w-[200px] border shadow-md rounded-xl px-6 py-5" style={{ borderColor: '#743799', boxShadow: '0 4px 12px rgba(116, 55, 153, 0.1)' }}>
               <div className="flex flex-row justify-between">
                 <h1 className="text-base font-medium" style={{ color: '#743799' }}>Response Rate</h1>
                 <CalendarCheck2 size={20} strokeWidth={1.5} color="#743799" />
               </div>
               <div className="text-3xl font-bold" style={{ color: '#743799' }}>
                 {analytics.responseRate}%
               </div>
               <div className="text-sm">Avg. response rate</div>
             </div>
             <div className="boxes flex-1 min-w-[200px] border shadow-md rounded-xl px-6 py-5" style={{ borderColor: '#743799', boxShadow: '0 4px 12px rgba(116, 55, 153, 0.1)' }}>
               <div className="flex flex-row justify-between">
                 <h1 className="text-base font-medium" style={{ color: '#743799' }}>Overall Rating</h1>
                 <CalendarCheck2 size={20} strokeWidth={1.5} color="#743799" />
               </div>
               <div className="text-3xl font-bold" style={{ color: '#743799' }}>{analytics.avgRating}/5</div>
               <div className="text-sm">Engagement avg.</div>
             </div>
           </div>
          )}
        
       

        {/* Tabs */}
        <div className="flex flex-row gap-8 h-fit py-1 ml-10 w-fit px-4 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(116, 55, 153, 0.1) 0%, rgba(156, 77, 204, 0.1) 100%)' }}>
          {[
            ["overview", "Overview"],
            ["activeSurveys", "Active Surveys"],
            ["feedback", "Feedback"],
          ].map(([val, label], i) => (
            <button
              key={val}
              className={`flex justify-center items-center ${
                active === i + 1
                  ? "p-1 rounded-lg px-2 text-white font-semibold"
                  : ""
              }`}
              style={active === i + 1 ? { background: 'linear-gradient(135deg, #743799 0%, #9c4dcc 100%)' } : {}}
              onClick={() => {
                setToValue(val);
                setactive(i + 1);
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4">{changeContent(value)}</div>
      </div>
    </div>
  );
};