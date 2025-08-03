import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getComplianceTest, submitComplianceTest } from "../../api/complianceAPI";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react";
import { jwtDecode } from 'jwt-decode';

const ComplySyncResponse = () => {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [userid, setUserid] = useState("");
  const [userData, setUserData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [timeSpent, setTimeSpent] = useState(0);

  // Helper function to navigate to dashboard
  const navigateToDashboard = () => {
    if (userData) {
      // Get workspace from user data
      let workspaceName = 'default';
      if (userData.workspaceName && Array.isArray(userData.workspaceName) && userData.workspaceName.length > 0) {
        workspaceName = userData.workspaceName[0];
      } else if (userData.workspaceName && typeof userData.workspaceName === 'string') {
        workspaceName = userData.workspaceName;
      }
      
      // Navigate based on user role
      if (userData.role === 'superadmin') {
        navigate(`/dashboard/workspacename/${workspaceName}`);
      } else {
        navigate(`/udashboard/workspacename/${workspaceName}`);
      }
    } else {
      // Fallback to compliance route
      navigate('/compliance');
    }
  };

  useEffect(() => {
    // Load user data from localStorage
    try {
      const storedUserData = JSON.parse(localStorage.getItem('user') || '{}');
      if (storedUserData.id) {
        setUserData(storedUserData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }

    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        console.log('Decoded JWT:', decoded); // Debug log
        // Try to get the user ID from different possible fields
        const userId = decoded.userId || decoded.id || decoded._id || decoded.username;
        console.log('Setting userid to:', userId); // Debug log
        
        if (!userId) {
          setError("User ID not found in token. Please login again.");
          return;
        }
        
        setUserid(userId);
      } catch (error) {
        console.error('Error decoding JWT token:', error);
        setError("Authentication failed. Please login again.");
        return;
      }
    } else {
      setError("No authentication token found. Please login.");
      return;
    }

    const fetchTest = async () => {
      try {
        const res = await getComplianceTest(testId);
        console.log('Fetched test:', res); // Debug log
        setQuestions(res.questions);
        const initialAnswers = {};
        res.questions.forEach(q => {
          initialAnswers[q._id] = null;
        });
        setAnswers(initialAnswers);
        setStartTime(new Date()); // Start timing when test loads
      } catch (err) {
        console.error('Fetch test error:', err); // Debug log
        setError("Test not found or could not be loaded.");
      } finally {
        setLoading(false);
      }
    };

    if (testId) fetchTest();
  }, [testId]);

  // Timer effect to track time spent
  useEffect(() => {
    let interval;
    if (startTime && !testResult) {
      interval = setInterval(() => {
        const currentTime = new Date();
        const timeDiff = Math.floor((currentTime - startTime) / 1000); // in seconds
        setTimeSpent(timeDiff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [startTime, testResult]);

  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!userid) {
      setError("User authentication required. Please refresh and try again.");
      return;
    }

    console.log('Current userid:', userid);
    console.log('Current testId:', testId);
    console.log('Current answers:', answers);

    setIsSubmitting(true);
    try {
      // Calculate final time spent in minutes
      const finalTimeSpent = Math.floor(timeSpent / 60);
      
      // Send employeeId instead of userid to match backend expectation
      const payload = { 
        employeeId: userid, 
        testId, 
        answers,
        timeSpent: finalTimeSpent
      };
      console.log('Submitting payload:', payload); // Debug log
      const res = await submitComplianceTest(payload);
      console.log('Submission response:', res); // Debug log
      setTestResult({
        ...res,
        timeSpent: finalTimeSpent
      });
    } catch (err) {
      console.error('Submission error:', err); // Debug log
      setError("Submission failed. Please try again.");
      setIsSubmitting(false);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  
  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="text-center p-10 font-semibold">Loading Test...</div>;
  if (error) return <div className="text-center p-10 text-red-600 font-semibold">{error}</div>;

  if (testResult) {
    const isPass = testResult.status === 'Pass';
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          {isPass ? <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-4" /> : <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Test Complete!</h1>
          <p className={`text-xl font-semibold mb-4 ${isPass ? 'text-green-600' : 'text-red-600'}`}>Status: {testResult.status}</p>
          <p className="text-gray-600 text-lg">Your score is <strong className="text-2xl">{testResult.score}%</strong></p>
          {testResult.timeSpent && (
            <p className="text-gray-600 text-md mt-2">Time spent: <strong>{testResult.timeSpent} minutes</strong></p>
          )}
          <div className="flex gap-3 mt-8">
            <button onClick={() => navigate(-1)} className="flex-1 bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 font-semibold">Return to Previous</button>
            <button onClick={navigateToDashboard} className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold">Back to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="fixed top-0 left-0 right-0 bg-white shadow-sm p-4 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-4">
              {/* <button 
                onClick={() => navigate('/compliance')} 
                className="text-blue-600 hover:text-blue-800 font-medium text-sm"
              >
                ← Back to Dashboard
              </button> */}
              <h2 className="text-xl font-bold">Compliance Test</h2>
            </div>
            {startTime && (
              <div className="text-sm text-gray-600">
                Time: {formatTime(timeSpent)}
              </div>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      </div>
      <div className="max-w-2xl mx-auto pt-24 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h3 className="text-lg font-medium text-gray-600 mb-4">Question {currentQuestionIndex + 1} of {questions.length}</h3>
          <p className="text-2xl font-semibold text-gray-800 mb-6">{currentQuestion?.question}</p>
          <div className="space-y-4">
            {currentQuestion?.options.map((option, i) => (
              <div key={i} onClick={() => handleAnswerSelect(currentQuestion._id, option)} className={`flex items-center w-full p-4 rounded-xl border-2 transition-all cursor-pointer ${answers[currentQuestion._id] === option ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-blue-300"}`}>
                <div className="w-5 h-5 rounded-full border-2 border-blue-500 flex-shrink-0 flex items-center justify-center mr-4">{answers[currentQuestion._id] === option && <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>}</div>
                <span className="font-medium text-gray-700">{option}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center mt-10">
            <button onClick={prevQuestion} disabled={currentQuestionIndex === 0} className="flex items-center gap-2 px-6 py-3 disabled:opacity-50 text-gray-600 font-semibold"><ChevronLeft size={20} /> Back</button>
            {isLastQuestion ? (
              <button onClick={handleSubmit} disabled={isSubmitting || answers[currentQuestion._id] === null} className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400">
                {isSubmitting ? "Submitting..." : "Finish & See Score"}
              </button>
            ) : (
              <button onClick={nextQuestion} disabled={answers[currentQuestion._id] === null} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2">Next <ChevronRight size={20} /></button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplySyncResponse;