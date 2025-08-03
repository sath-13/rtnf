import { axiosSecureInstance } from "./axios";



export const submitFeedback = async (data) => {
  try {
    // Make the POST request to submit feedback
    const response = await axiosSecureInstance.post(`/api/feedback`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response; // Return the response from the backend
  } catch (error) {
    console.error("Error submitting feedback:", error);
    throw error; // Throw the error to be handled in the calling function
  }
};  


export const submitRequestedFeedback = async (data) => {
  try {
    const response = await axiosSecureInstance.post(`/api/feedback/requested`, data, {
      headers: { "Content-Type": "application/json" },
    });
    return response;
  } catch (error) {
    console.error("Error submitting requested feedback:", error);
    throw error;
  }
};



export const getUserFeedback = async (userId, workspaceName) => {
  try {
    const response = await axiosSecureInstance.get(`/api/feedback/${userId}`, {
      params: { workspaceName },  // passed as query param
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching feedback:", error?.response?.data || error.message);
    throw error;
  }
};


export const getLoggedInUserFeedback = async (userId, workspaceName) => {
  try {
    const response = await axiosSecureInstance.get(`/api/feedback/loggedinuser`, {
      params: { workspaceName },
      headers: {
        "x-user-id": userId,  // send user ID in headers
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching logged-in user feedback:", error?.response?.data || error.message);
    throw error;
  }
};




/**
 * Send feedback request(s) from requester to one or more reviewers.
 * @param {Object} reviewData - Contains reviewerIds, revieweeId, requesterId, workspacename, isSelfFeedback.
 * @returns {Promise<Object>} - API response
 */
export const sendRequestedFeedbacks = async (reviewData) => {
  try {
    const response = await axiosSecureInstance.post('/api/feedback/submitReview', reviewData, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;  // Only return the data
  } catch (error) {
    console.error("Error submitting review request:", error?.response?.data || error.message);
    throw error;
  }
}



/**
 * Fetches all pending feedback requests where the user is the reviewer.
 * @param {string} userId - ID of the reviewer.
 * @returns {Promise<Array>} - List of pending feedback requests with populated reviewee and requester info.
 */
export const getPendingFeedbackRequests = async (userId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/feedback/pending/${userId}`);
    return response.data;  // contains populated revieweeId and requesterId
  } catch (error) {
    console.error("Error fetching pending feedback requests:", error?.response?.data || error.message);
    throw error;
  }
};



/**
 * Declines a feedback request by ID with a reason.
 * @param {string} requestId - The ID of the feedback request to decline.
 * @param {string} reason - The reason for declining.
 * @returns {Promise<Object>} - Response from the server.
 */


export const declineFeedbackRequest = async (requestId, declineData) => {
  try {
    const response = await axiosSecureInstance.post(
      `/api/feedback/decline/${requestId}`,
      declineData // contains both reason and declinedBy
    );
    return response.data;
  } catch (error) {
    console.error("Error declining feedback request:", error?.response?.data || error.message);
    throw error;
  }
};



export const submitInternalNode = async (data) => {
  try {
    const response = await axiosSecureInstance.post("/api/internal-node", data, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting internal node:", error?.response?.data || error.message);
    throw error;
  }
};


export const getInternalNodesByUser = async (userId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/internal-node/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching internal nodes:", error?.response?.data || error.message);
    throw error;
  }
};

