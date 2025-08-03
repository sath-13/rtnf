import React, { useState, useEffect } from 'react';
import { axiosSecureInstance } from '../../api/axios';
import { 
    GET_SURVEY_REPORTS_SLUG, 
    GET_USER_OWN_FEEDBACK_SLUG,
    POST_ADMIN_REPLY_SLUG,
    GET_ADMIN_REPLIES_SLUG
} from '../../constants/Api_constants';

// ✅ Main FeedbackSection Component - Completely restructured
const FeedbackSection = ({ user }) => {
    const [surveyData, setSurveyData] = useState([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState('');
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [selectedQuestionId, setSelectedQuestionId] = useState('');
    const [selectedQuestionText, setSelectedQuestionText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [commentsWithReplies, setCommentsWithReplies] = useState([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // ✅ Role-based access control - allow both superadmin and normal users
    useEffect(() => {
        console.log("🔍 User data received in FeedbackSection:", user);
        console.log("🔍 User role:", user?.role);
        console.log("🔑 Token in localStorage:", localStorage.getItem("token") ? "Present" : "Missing");
        
        const fetchSurveysReport = async () => {
            // Allow access to both superadmins and normal users
            if (!user) {
                console.log("❌ Access denied - No user data");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                console.log("🔍 Fetching surveys with axiosSecureInstance");
                console.log("🔑 Current token:", localStorage.getItem("token") ? "Token exists" : "No token found");
                console.log("🌐 Request URL:", `${process.env.REACT_APP_BASE_URL || "http://localhost:8011"}${GET_SURVEY_REPORTS_SLUG()}`);
                
                // Different behavior based on user role
                if (user.role === 'superadmin') {
                    // Super admin can see all surveys in their workspace
                    const res = await axiosSecureInstance.get(GET_SURVEY_REPORTS_SLUG());
                    console.log("📊 Survey data received:", res.data);
                    setSurveyData(res.data);
                } else {
                    // Normal users: We'll fetch surveys differently or show a simplified view
                    // For now, show empty surveys list but allow them to access replies if they have survey/question IDs
                    console.log("👤 Normal user accessing feedback section");
                    setSurveyData([]);
                }
            } catch (err) {
                console.error("❌ Error fetching survey data:", err);
                console.error("❌ Error status:", err.response?.status);
                console.error("❌ Error message:", err.response?.data);
                
                if (err.response?.status === 401) {
                    console.error("🔑 Authentication failed - token might be expired");
                    alert("Your session has expired. Please log in again.");
                } else if (err.response?.status === 403) {
                    console.error("🔑 Access denied - User may not have workspace access");
                    // For superadmins without workspace access, show appropriate message
                    if (user?.role === 'superadmin') {
                        alert("Access denied: You don't have access to any surveys in your assigned workspaces.");
                    }
                    setSurveyData([]);
                } else if (err.response?.status === 404) {
                    console.error("🔍 Endpoint not found - check if backend is running");
                    alert("Survey endpoint not found. Please check if the backend server is running.");
                } else {
                    alert(`Error fetching surveys: ${err.response?.data?.error || err.message}`);
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchSurveysReport();
    }, [user]);

    // ✅ Process surveys for dropdown - Use survey title instead of workspace
    const surveys = surveyData.map(survey => ({
        id: survey.sid,
        name: survey.title || survey.surveyName || `Survey ${survey.sid}`,
        workspace: survey.workspace
    }));

    // ✅ Handle survey selection and extract unique questions
    const handleSurveyChange = (e) => {
        setSelectedSurveyId(e.target.value);
        setSelectedQuestionId('');
        setSelectedQuestionText('');
        setAvailableQuestions([]);
        setCommentsWithReplies([]);

        if (e.target.value) {
            const survey = surveyData.find(s => s.sid === e.target.value);
            if (survey && survey.responses) {
                // ✅ Extract unique questions that have comments from all responses
                const questionMap = new Map();
                
                survey.responses.forEach(response => {
                    if (response.answers) {
                        response.answers.forEach(answer => {
                            // Only include questions that have comments
                            if (answer.question && answer.questionId && answer.comments && answer.comments.trim()) {
                                questionMap.set(answer.questionId, {
                                    id: answer.questionId,
                                    text: answer.question,
                                    category: answer.category || 'General'
                                });
                            }
                        });
                    }
                });

                const uniqueQuestionsWithComments = Array.from(questionMap.values());
                console.log("🎯 Unique questions with comments extracted:", uniqueQuestionsWithComments);
                setAvailableQuestions(uniqueQuestionsWithComments);
            }
        }
    };

    // ✅ Handle question selection
    const handleQuestionChange = (e) => {
        setSelectedQuestionId(e.target.value);
        const question = availableQuestions.find(q => q.id === e.target.value);
        setSelectedQuestionText(question ? question.text : '');
    };

    // ✅ Fetch comments and replies when survey/question changes
    useEffect(() => {
        const fetchCommentsAndReplies = async () => {
            if (!selectedSurveyId || !selectedQuestionId) {
                setCommentsWithReplies([]);
                return;
            }

            try {
                setLoadingComments(true);
                console.log("💬 Fetching comments for question:", selectedQuestionId);

                const survey = surveyData.find(s => s.sid === selectedSurveyId);
                if (!survey) return;

                // Extract comments for this specific question with proper anonymity handling
                const commentsData = [];
                let totalResponsesForQuestion = 0;
                
                survey.responses.forEach(employeeResponse => {
                    employeeResponse.answers.forEach(answer => {
                        if (answer.questionId === selectedQuestionId) {
                            totalResponsesForQuestion++;
                            if (answer.comments && answer.comments.trim()) {
                                const commentUniqueId = `${survey.sid}-${employeeResponse.empId}-${answer.questionId}`;
                                commentsData.push({
                                    id: commentUniqueId,
                                    surveyId: survey.sid,
                                    questionId: answer.questionId,
                                    employeeId: employeeResponse.empId,
                                    employeeName: answer.isAnonymous ? 'Anonymous User' : `Employee ${employeeResponse.empId.slice(-4)}`,
                                    isAnonymous: answer.isAnonymous, // ✅ Per-question anonymity
                                    commentText: answer.comments,
                                    timestamp: new Date(employeeResponse.submittedAt),
                                    questionText: answer.question,
                                    answer: answer.answer || 'No answer provided',
                                    adminReply: null // Will be populated from API
                                });
                            }
                        }
                    });
                });

                console.log(`📊 Question ${selectedQuestionId}: ${totalResponsesForQuestion} total responses, ${commentsData.length} with comments`);

                // Fetch existing admin replies
                try {
                    const repliesRes = await axiosSecureInstance.get(
                        `${GET_ADMIN_REPLIES_SLUG()}?surveyId=${selectedSurveyId}&questionId=${selectedQuestionId}`
                    );
                    const replies = repliesRes.data || [];
                    
                    // Map replies to comments
                    commentsData.forEach(comment => {
                        const reply = replies.find(r => r.commentUniqueId === comment.id);
                        if (reply) {
                            comment.adminReply = reply;
                        }
                    });
                } catch (replyError) {
                    console.error("Error fetching admin replies:", replyError);
                }

                commentsData.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
                setCommentsWithReplies(commentsData);
                console.log("📋 Comments with replies:", commentsData);

            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setLoadingComments(false);
            }
        };

        fetchCommentsAndReplies();
    }, [selectedSurveyId, selectedQuestionId, surveyData]);

    // ✅ Handle adding a new reply to a comment
    const handleReplyAdded = (commentId, newReply) => {
        setCommentsWithReplies(prev => 
            prev.map(comment => 
                comment.id === commentId 
                    ? { ...comment, adminReply: newReply }
                    : comment
            )
        );
    };

    // ✅ Role check rendering - Show different interfaces for different roles
    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 font-inter text-gray-800 p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto text-center border border-red-200">
                    <div className="mb-6">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <h1 className="text-3xl font-bold text-red-700 mb-2">Authentication Required</h1>
                        <p className="text-lg text-gray-600">
                            Please log in to access the feedback section.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ Main UI Render - Different views for different roles
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 font-inter text-gray-800 p-4 sm:p-6 lg:p-8">
            <h1 className="text-4xl font-bold text-center text-indigo-800 mb-8">
                {user.role === 'superadmin' ? 'Survey Feedback Management' : 'My Survey Feedback'}
            </h1>
            
            {/* Show different content based on user role */}
            {user.role === 'superadmin' ? (
                // ✅ SUPER ADMIN VIEW - Full functionality
                <div>
                    {/* Survey Selection Section */}
                    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto mb-8 border border-gray-100">
                        <h2 className="text-2xl font-bold text-indigo-700 mb-4">Select Feedback Context</h2>
                        
                        {/* Survey Dropdown */}
                        <div className="mb-6">
                            <label htmlFor="survey-select" className="block text-gray-700 text-lg font-medium mb-2">
                                Choose Survey:
                            </label>
                            <div className="relative">
                                <select
                                    id="survey-select"
                                    value={selectedSurveyId}
                                    onChange={handleSurveyChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white text-gray-800 appearance-none transition duration-200 pr-10"
                                    disabled={isLoading}
                                >
                                    <option value="">{isLoading ? "Loading..." : "-- Select a Survey --"}</option>
                                    {surveys.map(survey => (
                                        <option key={survey.id} value={survey.id}>
                                            {survey.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Question Dropdown */}
                        {selectedSurveyId && (
                            <div className="mb-4">
                                <label htmlFor="question-select" className="block text-gray-700 text-lg font-medium mb-2">
                                    Choose Question (with comments):
                                </label>
                                <div className="relative">
                                    <select
                                        id="question-select"
                                        value={selectedQuestionId}
                                        onChange={handleQuestionChange}
                                        className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent bg-white text-gray-800 appearance-none transition duration-200 pr-10"
                                        disabled={availableQuestions.length === 0}
                                    >
                                        <option value="">-- Select a Question --</option>
                                        {availableQuestions.map(question => (
                                            <option key={question.id} value={question.id}>
                                                {question.text}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                        </svg>
                                    </div>
                                </div>
                                {availableQuestions.length === 0 && selectedSurveyId && (
                                    <p className="text-sm text-gray-500 mt-2">No questions with comments found for this survey.</p>
                                )}
                                {availableQuestions.length > 0 && (
                                    <p className="text-sm text-green-600 mt-2">
                                        Found <strong>{availableQuestions.length}</strong> questions with comments
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Comments Section for Super Admin */}
                    {selectedSurveyId && selectedQuestionId && (
                        <CommentsSection
                            surveyId={selectedSurveyId}
                            questionId={selectedQuestionId}
                            questionText={selectedQuestionText}
                            comments={commentsWithReplies}
                            loading={loadingComments}
                            user={user}
                            onReplyAdded={handleReplyAdded}
                        />
                    )}

                    {/* No Selection Messages */}
                    {!selectedSurveyId && !isLoading && (
                        <div className="text-center text-gray-600 text-lg mt-10">
                            <p>Please select a survey to view comments.</p>
                        </div>
                    )}
                    {selectedSurveyId && !selectedQuestionId && availableQuestions.length > 0 && (
                        <div className="text-center text-gray-600 text-lg mt-10">
                            <p>Please select a question to view comments.</p>
                        </div>
                    )}
                </div>
            ) : (
                // ✅ NORMAL USER VIEW - Simplified interface for viewing their own replies
                <NormalUserFeedbackView user={user} />
            )}
        </div>
    );
};

// ✅ Normal User Feedback View Component - Shows user's own survey responses and admin replies
const NormalUserFeedbackView = ({ user }) => {
    const [userFeedback, setUserFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserFeedback = async () => {
            if (!user || !user.id) {
                setError("User information not available");
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                console.log("🔍 Fetching feedback for user:", user.id);

                // Use the new endpoint for normal users
                const res = await axiosSecureInstance.get(GET_USER_OWN_FEEDBACK_SLUG());
                const userFeedbackData = res.data || [];
                
                console.log("📨 Found user feedback:", userFeedbackData);
                setUserFeedback(userFeedbackData);

            } catch (err) {
                console.error("❌ Error fetching user feedback:", err);
                if (err.response?.status === 401) {
                    setError("Authentication failed. Please log in again.");
                } else if (err.response?.status === 403) {
                    setError("Access denied. You can only view your own feedback.");
                } else {
                    setError("Failed to load your feedback. Please try again later.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUserFeedback();
    }, [user]);

    const formatTimestamp = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto mb-8 border border-gray-100">
                <div className="text-center p-8 text-lg text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    Loading your feedback...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto mb-8 border border-red-200">
                <div className="text-center py-8">
                    <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Feedback</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto mb-8 border border-gray-100">
            <h2 className="text-2xl font-bold text-indigo-700 mb-6">Your Survey Feedback & Replies</h2>
            
            {userFeedback.length === 0 ? (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-2.72-.428l-3.5 2.142a.75.75 0 01-1.072-.732l.392-3.138A7.956 7.956 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Feedback Comments Found</h3>
                    <p className="text-gray-600">
                        You haven't left any comments on survey questions yet, or your comments are still being processed.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-center space-x-2">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" />
                            </svg>
                            <p className="text-sm text-blue-800">
                                <strong>{userFeedback.length}</strong> feedback comment{userFeedback.length !== 1 ? 's' : ''} found
                                {userFeedback.filter(f => f.adminReply).length > 0 && (
                                    <span>, <strong>{userFeedback.filter(f => f.adminReply).length}</strong> with admin replies</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {userFeedback.map((feedback) => (
                        <div key={feedback.id} className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200">
                            {/* Survey and Question Info */}
                            <div className="mb-4 pb-3 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-indigo-800 mb-1">{feedback.surveyTitle}</h3>
                                <p className="text-sm text-gray-600 mb-2">
                                    <strong>Question:</strong> {feedback.questionText}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Submitted: {formatTimestamp(feedback.submittedAt)}
                                    {feedback.isAnonymous && (
                                        <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                            Anonymous Response
                                        </span>
                                    )}
                                </p>
                                {feedback.limitedAccess && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                        <strong>Note:</strong> Limited access - Some details may not be available due to privacy settings
                                    </div>
                                )}
                            </div>

                            {/* User's Answer */}
                            {feedback.userAnswer && feedback.userAnswer !== "Answer details not available" ? (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm font-medium text-blue-800 mb-1">Your Answer:</p>
                                    <p className="text-gray-800">
                                        {typeof feedback.userAnswer === 'object' ? JSON.stringify(feedback.userAnswer) : feedback.userAnswer}
                                    </p>
                                </div>
                            ) : feedback.limitedAccess ? (
                                <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-sm font-medium text-yellow-800 mb-1">Your Answer:</p>
                                    <p className="text-yellow-700 text-sm italic">
                                        Original answer details are not accessible due to privacy settings, but you did provide an answer to this question.
                                    </p>
                                </div>
                            ) : null}

                            {/* User's Comment */}
                            {feedback.userComment && feedback.userComment !== "Comment details not available" ? (
                                <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Your Comment:</p>
                                    <p className="text-gray-800 leading-relaxed">{feedback.userComment}</p>
                                </div>
                            ) : feedback.limitedAccess ? (
                                <div className="mb-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                    <p className="text-sm font-medium text-yellow-800 mb-2">Your Comment:</p>
                                    <p className="text-yellow-700 text-sm italic">
                                        Original comment details are not accessible due to privacy settings, but you did leave a comment that received an admin reply.
                                    </p>
                                </div>
                            ) : (
                                <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                    <p className="text-sm font-medium text-gray-700 mb-2">Your Comment:</p>
                                    <p className="text-gray-800 leading-relaxed">{feedback.userComment}</p>
                                </div>
                            )}

                            {/* Admin Reply Section */}
                            {feedback.adminReply ? (
                                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center space-x-2 mb-3">
                                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="font-semibold text-green-800">Admin Reply</p>
                                        <span className="text-xs text-green-600">
                                            {formatTimestamp(feedback.adminReply.timestamp)}
                                        </span>
                                    </div>
                                    <div className="pl-8">
                                        <p className="text-gray-800 leading-relaxed mb-2">{feedback.adminReply.replyText}</p>
                                        <p className="text-sm text-green-700">
                                            <strong>Replied by:</strong> {feedback.adminReply.adminName}
                                        </p>
                                        {feedback.adminReply.lastEditedAt && (
                                            <p className="text-xs text-green-600 mt-1">
                                                Last edited: {formatTimestamp(feedback.adminReply.lastEditedAt)}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <div className="text-center py-3 text-gray-500">
                                        <svg className="w-6 h-6 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm">Waiting for admin reply</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// ✅ Comments Section Component - Restructured to prevent multiple replies
const CommentsSection = ({ surveyId, questionId, questionText, comments, loading, user, onReplyAdded }) => {
    const [replyText, setReplyText] = useState('');
    const [activeCommentId, setActiveCommentId] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const formatTimestamp = (date) => {
        return new Date(date).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ✅ Handle admin reply - Only one reply allowed per comment
    const handleSendReply = async (comment) => {
        if (replyText.trim() === '') return;
        if (comment.adminReply) {
            alert('A reply already exists for this comment. You can only reply once per comment.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                surveyId,
                questionId,
                employeeId: comment.employeeId,
                commentUniqueId: comment.id,
                adminId: user.id || 'admin-user',
                adminName: `${user.fname} ${user.lname}` || 'Admin',
                replyText: replyText.trim(),
            };

            console.log('💬 Sending admin reply:', payload);
            const res = await axiosSecureInstance.post(POST_ADMIN_REPLY_SLUG(), payload);
            
            // Update the local state
            onReplyAdded(comment.id, res.data.reply);
            
            setReplyText('');
            setActiveCommentId(null);
            
            // ✅ TODO: Send notification to user here
            console.log('🔔 Should notify user about reply:', comment.employeeId);
            
        } catch (error) {
            console.error("Failed to send reply:", error);
            alert("Failed to save reply. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto border border-gray-100">
                <div className="text-center p-8 text-lg text-gray-600">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
                    Loading comments...
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-4xl mx-auto border border-gray-100">
            <div className="mb-6 pb-3 border-b-2 border-indigo-200">
                <h2 className="text-2xl sm:text-3xl font-bold text-indigo-800 mb-2">
                    Question: <span className="text-indigo-600">{questionText}</span>
                </h2>
                <p className="text-sm text-gray-600">
                    <span className="font-semibold text-indigo-700">{comments.length}</span> comments found for this question
                </p>
            </div>

            {comments.length === 0 ? (
                <div className="text-center py-8">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Comments</h3>
                    <p className="text-gray-600">No comments found for this question.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300">
                            {/* Comment Header */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${comment.isAnonymous ? 'bg-gray-500' : 'bg-indigo-500'}`}>
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            {comment.employeeName}
                                            {comment.isAnonymous && (
                                                <span className="ml-2 px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                                                    Anonymous
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-500">Employee ID: {comment.isAnonymous ? 'Hidden' : comment.employeeId}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500">{formatTimestamp(comment.timestamp)}</p>
                            </div>

                            {/* Employee Answer */}
                            {comment.answer && (
                                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-sm font-medium text-blue-800 mb-1">Employee's Answer:</p>
                                    <p className="text-gray-800">
                                        {typeof comment.answer === 'object' ? JSON.stringify(comment.answer) : comment.answer}
                                    </p>
                                </div>
                            )}

                            {/* Employee Comment */}
                            <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                                <p className="text-sm font-medium text-gray-700 mb-2">Comment:</p>
                                <p className="text-gray-800 leading-relaxed">{comment.commentText}</p>
                            </div>

                            {/* Admin Reply Section */}
                            {comment.adminReply ? (
                                <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <p className="font-semibold text-green-800">Admin Reply by {comment.adminReply.adminName}</p>
                                        <span className="text-xs text-green-600">
                                            {formatTimestamp(comment.adminReply.timestamp)}
                                        </span>
                                    </div>
                                    <p className="text-gray-800 leading-relaxed pl-8">{comment.adminReply.replyText}</p>
                                    {comment.adminReply.lastEditedAt && (
                                        <p className="text-xs text-green-600 pl-8 mt-2">
                                            Last edited: {formatTimestamp(comment.adminReply.lastEditedAt)}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    {activeCommentId === comment.id ? (
                                        <div className="space-y-3">
                                            <textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Type your reply here..."
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
                                                rows="3"
                                                disabled={submitting}
                                            />
                                            <div className="flex space-x-3">
                                                <button
                                                    onClick={() => handleSendReply(comment)}
                                                    disabled={submitting || !replyText.trim()}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                                                >
                                                    {submitting ? 'Sending...' : 'Send Reply'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setReplyText('');
                                                        setActiveCommentId(null);
                                                    }}
                                                    disabled={submitting}
                                                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setActiveCommentId(comment.id)}
                                            className="px-4 py-2 bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-600 transition text-sm flex items-center space-x-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                            </svg>
                                            <span>Reply to Comment</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedbackSection;
