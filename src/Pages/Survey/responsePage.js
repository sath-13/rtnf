// src/pages/ResponsePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { axiosSecureInstance } from "../../api/axios";
import { GET_SINGLE_SURVEY_SLUG, SUBMIT_SURVEY_RESPONSE_SLUG } from "../../constants/Api_constants";
import { ChevronLeft, ChevronRight, User, UserX, Star, ToggleLeft, ToggleRight } from "lucide-react";

const ResponsePage = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [empId, setEmpId] = useState("");
  const [isAnonymous, setIsAnonymous] = useState([]);
  const [showUserInfo, setShowUserInfo] = useState(false); // Changed to false to skip user info screen
  const [userData, setUserData] = useState({});
  
  // Get user data from localStorage automatically
  useEffect(() => {
    try {
      const storedUserData = JSON.parse(localStorage.getItem('user') || '{}'); // Changed from 'users' to 'user'
      if (storedUserData.id) {
        setUserData(storedUserData);
        setEmpId(storedUserData.id);
        setShowUserInfo(false); // Skip user info screen if we have user data
        console.log('👤 User data loaded automatically:', storedUserData);
      } else {
        // If no user data found, still skip the screen and use anonymous
        setShowUserInfo(false);
        console.log('⚠️ No user data found, proceeding anonymously');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setShowUserInfo(false);
    }
  }, []);
  const [comments, setComments] = useState([]);

  // Fetch questions
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        console.log('📥 Fetching questions for surveyId:', surveyId);
        const res = await axiosSecureInstance.get(GET_SINGLE_SURVEY_SLUG(surveyId));
        console.log('📥 Survey data received:', res.data);
        
        // Handle new response format with title, description, and questions
        if (res.data.questions) {
          setQuestions(res.data.questions);
          setAnswers(Array(res.data.questions.length).fill(""));
          setComments(Array(res.data.questions.length).fill(""));
          setIsAnonymous(Array(res.data.questions.length).fill(false));
        } else {
          // Fallback for old format (if questions are returned directly)
          setQuestions(res.data);
          setAnswers(Array(res.data.length).fill(""));
          setComments(Array(res.data.length).fill(""));
          setIsAnonymous(Array(res.data.length).fill(false));
        }
      } catch (err) {
        console.error('❌ Error fetching questions:', err);
        setError("Survey not found or network error.");
      } finally {
        setLoading(false);
      }
    };

    if (surveyId) fetchQuestions();
  }, [surveyId]);

  const handleAnswer = (value) => {
    const updated = [...answers];
    updated[currentQuestionIndex] = value;
    setAnswers(updated);
  };

  const handleComment = (value) => {
    const updated = [...comments];
    updated[currentQuestionIndex] = value;
    setComments(updated);
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
    setIsSubmitting(true);

    try {
      // Use the stored userData directly (already loaded from 'user' key)
      const finalEmpId = userData.id || 'anonymous';
      
      // Handle workspace - take first element from workspaceName array
      let workspaceName = 'default';
      if (userData.workspaceName && Array.isArray(userData.workspaceName) && userData.workspaceName.length > 0) {
        workspaceName = userData.workspaceName[0];
      } else if (userData.workspaceName && typeof userData.workspaceName === 'string') {
        workspaceName = userData.workspaceName;
      }
      
      // Determine if submission is anonymous (if any question is marked anonymous)
      const isSubmissionAnonymous = isAnonymous.some(anon => anon === true);
      
      const payload = {
        empId: isSubmissionAnonymous ? 'anonymous' : finalEmpId,
        surveyId,
        answers,
        comments,
        isAnonymous: isSubmissionAnonymous,
        workspace: workspaceName
      };

      console.log('📤 Submitting survey with user data:', payload);
      console.log('👤 Full user data from localStorage (user key):', userData);
      console.log('🏢 Workspace used:', workspaceName);
      console.log('🆔 Employee ID used:', finalEmpId);
      console.log('📝 User details:', {
        name: `${userData.fname || ''} ${userData.lname || ''}`.trim(),
        email: userData.email,
        branch: userData.branch,
        team: userData.teamTitle
      });

      await axiosSecureInstance.post(SUBMIT_SURVEY_RESPONSE_SLUG(), payload);

      setIsSubmitting(false);
      alert("🎉 Survey submitted successfully!");
      
      // Navigate back to dashboard based on user role and workspace
      if (userData.role === 'superadmin') {
        navigate(`/dashboard/workspacename/${workspaceName}`);
      } else {
        navigate(`/udashboard/workspacename/${workspaceName}`);
      }
    } catch (err) {
      console.error('❌ Submission error:', err);
      setIsSubmitting(false);
      alert("❌ Submission failed. Please try again.");
    }
  };

  // Render different question types
  const renderQuestionType = (question, currentAnswer) => {
    switch (question.questionType) {
      case 'emoji-scale':
        return (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">How do you feel?</p>
            <div className="flex justify-center gap-4 flex-wrap">
              {[
                // { emoji: "😢", value: 0, label: "Very Bad" },
                { emoji: "😞", value: 1, label: "Bad" },
                { emoji: "😐", value: 2, label: "Neutral" },
                { emoji: "😊", value: 3, label: "Good" },
                { emoji: "😄", value: 4, label: "Great" },
                { emoji: "🤩", value: 5, label: "Excellent" }
              ].map((item) => (
                <button
                  key={item.value}
                  onClick={() => handleAnswer(item.value)}
                  className={`flex flex-col items-center p-4 rounded-xl transition-all transform hover:scale-110 ${
                    currentAnswer === item.value
                      ? "bg-yellow-100 border-2 border-yellow-500"
                      : "hover:bg-gray-100 border-2 border-transparent"
                  }`}
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="text-xs text-gray-600">{item.label}</div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'slider':
        return (
          <div className="space-y-6">
            <p className="text-center text-gray-600">Slide to rate (0-5)</p>
            <div className="px-4">
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={currentAnswer || 0}
                onChange={(e) => handleAnswer(parseInt(e.target.value))}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${((currentAnswer || 0) / 5) * 100}%, #E5E7EB ${((currentAnswer || 0) / 5) * 100}%, #E5E7EB 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>0</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
              <div className="text-center mt-4">
                <span className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-lg font-semibold">
                  {currentAnswer || 0}
                </span>
              </div>
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div className="flex justify-center">
            <button
              onClick={() => handleAnswer(currentAnswer === 5 ? 0 : 5)}
              className={`flex items-center gap-3 p-6 rounded-xl border-2 transition-all transform hover:scale-105 ${
                currentAnswer === 5
                  ? "border-green-500 bg-green-50 text-green-800"
                  : "border-red-300 bg-red-50 text-red-600"
              }`}
            >
              {currentAnswer === 5 ? (
                <>
                  <ToggleRight className="w-8 h-8 text-green-600" />
                  <span className="text-xl font-semibold">Yes (5)</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-8 h-8 text-red-500" />
                  <span className="text-xl font-semibold">No (0)</span>
                </>
              )}
            </button>
          </div>
        );

      case 'star-rating':
        return (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">Rate with stars (1-5)</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleAnswer(star)}
                  className="transition-all transform hover:scale-125"
                >
                  <Star
                    className={`w-12 h-12 ${
                      star <= (currentAnswer || 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold text-gray-700">
                {currentAnswer || 0} out of 5 stars
              </span>
            </div>
          </div>
        );

      case 'radio-group':
        // Default radio options with proper 0-5 scale mapping
        const radioOptions = [
          { label: "Strongly Disagree", value: 0 },
          { label: "Disagree", value: 1 },
          { label: "Neutral", value: 2 },
          { label: "Agree", value: 3 },
          { label: "Strongly Agree", value: 4 },
          { label: "Excellent", value: 5 }
        ];
        
        return (
          <div className="space-y-3">
            {radioOptions.map((option, i) => (
              <div
                key={i}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-102 ${
                  currentAnswer === option.value
                    ? "border-blue-500 bg-blue-50 text-blue-800"
                    : "border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center transition-all ${
                    currentAnswer === option.value 
                      ? "border-blue-500 bg-blue-500" 
                      : "border-gray-400 bg-white"
                  }`}>
                    {currentAnswer === option.value && (
                      <div className="w-2.5 h-2.5 bg-white rounded-full"></div>
                    )}
                  </div>
                  <span className="font-medium">{option.label}</span>
                  <span className="ml-auto text-sm text-gray-500">({option.value})</span>
                </div>
              </div>
            ))}
          </div>
        );

      case 'checkbox-group':
        // Default checkbox options
        const checkboxOptions = [
          { label: "Team Collaboration", value: "Team Collaboration" },
          { label: "Work-Life Balance", value: "Work-Life Balance" },
          { label: "Career Growth", value: "Career Growth" },
          { label: "Management Support", value: "Management Support"},
          { label: "Innovation Culture", value: "Innovation Culture" }
        ];
        
        // Handle array of selected values for checkboxes
        const selectedValues = Array.isArray(currentAnswer) ? currentAnswer : [];
        
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">Select all that apply (average will be calculated)</p>
            {checkboxOptions.map((option, i) => {
              const isSelected = selectedValues.includes(option.value);
              return (
                <button
                  key={i}
                  onClick={() => {
                    let newSelection;
                    if (isSelected) {
                      newSelection = selectedValues.filter(v => v !== option.value);
                    } else {
                      newSelection = [...selectedValues, option.value];
                    }
                    // Store the array of selected values, server will calculate average
                    handleAnswer(newSelection);
                  }}
                  className={`w-full p-4 text-left rounded-xl border-2 transition-all hover:scale-102 ${
                    isSelected
                      ? "border-green-500 bg-green-50 text-green-800"
                      : "border-gray-200 hover:border-green-300 hover:bg-green-50"
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-5 h-5 rounded border-2 mr-3 flex items-center justify-center ${
                      isSelected ? "bg-green-500 border-green-500" : "border-gray-400 bg-white"
                    }`}>
                      {isSelected && <div className="text-white text-xs font-bold">✓</div>}
                    </div>
                    <span className="font-medium">{option.label}</span>
                    <span className="ml-auto text-sm text-gray-500">({option.value})</span>
                  </div>
                </button>
              );
            })}
            {selectedValues.length > 0 && (
              <div className="text-center mt-4">
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                  Selected: {selectedValues.length} options
                </span>
              </div>
            )}
          </div>
        );

      case 'open-ended':
        return (
          <div className="space-y-4">
            <textarea
              className="w-full border-2 border-gray-200 p-4 rounded-xl focus:border-blue-500 focus:outline-none transition-colors resize-none"
              rows={4}
              placeholder="Share your thoughts..."
              value={typeof currentAnswer === 'string' ? currentAnswer : currentAnswer?.text || ""}
              onChange={(e) => {
                const text = e.target.value;
                // For open-ended, we'll score based on text length
                let score = 0;
                if (text.length > 0) score = 1;
                if (text.length > 20) score = 2;
                if (text.length > 50) score = 3;
                if (text.length > 100) score = 4;
                if (text.length > 150) score = 5;
                
                handleAnswer({ text, score });
              }}
            />
            <div className="text-sm text-gray-500">
              {(typeof currentAnswer === 'string' ? currentAnswer?.length : currentAnswer?.text?.length) || 0} characters
            </div>
          </div>
        );

      default:
        // Default emoji scale
        return (
          <div className="space-y-4">
            <p className="text-center text-gray-600 mb-6">Rate from 0 to 5</p>
            <div className="flex justify-center gap-3 flex-wrap">
              {[0, 1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  className={`w-16 h-16 rounded-full border-2 transition-all transform hover:scale-110 flex items-center justify-center ${
                    currentAnswer === num
                      ? "border-yellow-500 bg-yellow-100 text-yellow-800"
                      : "border-gray-200 hover:border-yellow-300 hover:bg-yellow-50"
                  }`}
                >
                  <div className="text-xl font-bold">{num}</div>
                </button>
              ))}
            </div>
          </div>
        );
    }
  };

  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const currentAnswer = answers[currentQuestionIndex];

  // Check if current answer exists (handle different answer types)
  const hasAnswer = () => {
    if (currentAnswer === null || currentAnswer === undefined || currentAnswer === "") return false;
    if (Array.isArray(currentAnswer)) return currentAnswer.length > 0;
    if (typeof currentAnswer === 'object' && currentAnswer.text !== undefined) return currentAnswer.text.length > 0;
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading your survey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <p className="text-xl text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate("/")}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Skip user info screen entirely - user data is loaded automatically
  if (showUserInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⏳</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Loading...</h1>
          <p className="text-gray-600">Preparing your survey</p>
        </div>
      </div>
    );
  }

  // Question Screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </span>
              {userData.fname && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  👤 {userData.fname} {userData.lname}
                </span>
              )}
            </div>
            <span className="text-sm text-gray-500">{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="max-w-2xl mx-auto pt-24 pb-8">
        <div className="bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-500 hover:shadow-2xl">
          {/* Question */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 leading-relaxed">
              {currentQuestion?.question}
            </h2>
            <div className="flex gap-2 flex-wrap">
              {currentQuestion?.category && (
                <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {currentQuestion.category}
                </span>
              )}
              <span className="inline-block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                {currentQuestion?.questionType || 'default'}
              </span>
            </div>
          </div>

          {/* Answer Options */}
          <div className="mb-8">
            {renderQuestionType(currentQuestion, currentAnswer)}
          </div>

          {/* Comment Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Comments (Optional)
            </label>
            <textarea
              rows="3"
              placeholder="Enter your comment!"
              value={comments[currentQuestionIndex] || ""}
              onChange={(e) => handleComment(e.target.value)}
              className="w-full border-2 border-gray-200 p-3 rounded-lg focus:border-blue-500 focus:outline-none transition-colors resize-none"
            />
          </div>

          {/* Anonymous Checkbox */}
          <div className="flex items-center gap-4 p-4 rounded-lg justify-center mb-8 bg-gray-50">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous[currentQuestionIndex] || false}
              onChange={() => {
                const updated = [...isAnonymous];
                updated[currentQuestionIndex] = !updated[currentQuestionIndex];
                setIsAnonymous(updated);
              }}
              className="w-5 h-5 text-blue-600"
            />
            <label htmlFor="anonymous" className="flex items-center gap-2 text-gray-700 cursor-pointer">
              {isAnonymous[currentQuestionIndex] ? <UserX className="w-5 h-5" /> : <User className="w-5 h-5" />}
              Submit this question anonymously
            </label>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIndex === 0}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {/* Skip Option */}
            {!isLastQuestion && (
              <div className="text-center">
                <button
                  onClick={nextQuestion}
                  className="text-gray-500 hover:text-gray-700 text-sm underline"
                >
                  Skip this question
                </button>
              </div>
            )}

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={!hasAnswer() || isSubmitting}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Survey 🎉
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                disabled={!hasAnswer()}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
              >
                Next
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsePage;
