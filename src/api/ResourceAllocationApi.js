import { axiosSecureInstance } from "./axios";

export const createBookingAPI = async ({ companyId, projectId, employeeId, resourceCoordinatorId, startTime, duration,endTime, taskDescription,typeOfWork}) => {
    const response = await axiosSecureInstance.post('/api/booking/create', {
      companyId,
      projectId,
      employeeId,
      resourceCoordinatorId,
      startTime,
      endTime,
      duration,
      taskDescription,
      typeOfWork
    });
  
    return response.data;
  };


export const checkBookingOverlap = async ({ resourceId, startTime, endTime, bookingId }) => {
  if (!resourceId || !startTime || !endTime) return null;

  try {
    const response = await axiosSecureInstance.get('/api/booking/check/overlap', {
      params: {
        resourceId,
        // start: new Date(startTime).toISOString(),
        // end: new Date(endTime).toISOString(),
        ...(bookingId && { bookingId }),
      },
    });

    return { conflict: null }; // No overlap
  } catch (err) {
    if (err.response?.status === 409) {
      const conflict = err.response.data.overlaps?.[0];
      return {
        conflict: {
          start: new Date(conflict.startTime),
          end: new Date(conflict.endTime),
        },
      };
    }
    throw err;
  }
};



  export const getAllBookingsAPI = async (companyId) => {
    const response = await axiosSecureInstance.get(`/api/booking/${companyId}`);
    return response.data;
  };
  
  export const deleteBookingAPI = async (bookingId) => {
    const response = await axiosSecureInstance.delete(`/api/booking/${bookingId}`);
    return response.data;
  };

  // Get all types of work
export const getAllTypeOfWorkAPI = async () => {
  const response = await axiosSecureInstance.get(`/api/type-of-work`);
  return response.data;
};

export const fetchBookingById = async (id) => {
  const res = await axiosSecureInstance.get(`/api/booking/bookingId/${id}`);
  return res.data;
};

export const updateBookingById = async (id, payload) => {
  const res = await axiosSecureInstance.put(`/api/booking/${id}`, payload);
  return res.data;
};


export const createProjectAPI = async (projectData) => {
  try {
    const response = await axiosSecureInstance.post('/api/booking/createproject', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error; // So calling code can handle UI feedback
  }
};

export const updateBookingTimeAPI = async (bookingId, updateData) => {
  const response = await axiosSecureInstance.patch(`/api/booking/booking/${bookingId}`, updateData);
  return response.data;
};