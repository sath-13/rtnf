import React, { useEffect, useState } from 'react';
import BookingDrawer from './BookingDrawer';
import { fetchBookingById, updateBookingById } from '../../api/ResourceAllocationApi';
import { message, Spin } from 'antd';
import dayjs from 'dayjs';
import { ResourceAllocationMessages } from '../../constants/constants';
import { toastError, toastSuccess } from '../../Utility/toast';
import { toast } from 'react-toastify';

const EditBookingWrapper = ({ bookingId, open, onClose, onSuccess, resources = [] }) => {
  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [drawerKey, setDrawerKey] = useState(Date.now()); // Key to force drawer re-render

  const extractId = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (val.$oid) return val.$oid;
    if (val._id) return extractId(val._id);
    return null;
  };

  const extractDate = (val) => {
    if (!val) return null;
    if (val instanceof Date) return val;
    if (val.$date) return new Date(val.$date);
    return new Date(val);
  };

  useEffect(() => {
    if (bookingId && open) {
      setLoading(true);
      fetchBookingById(bookingId)
        .then((data) => {
          if (data) {
            const start = extractDate(data.startTime);
            const end = extractDate(data.endTime);
            const normalizedData = {
              ...data,
              _id: extractId(data._id),
              companyId: extractId(data.companyId),
              project: data.projectId?.name || '',
              projectId: extractId(data.projectId),
              users: Array.isArray(data.employeeId)
                ? data.employeeId.map((emp) => ({
                  label: `${emp.fname || ''} ${emp.lname || ''}`.trim(),
                  value: extractId(emp),
                }))
                : [],
              resourceCoordinatorId: extractId(data.resourceCoordinatorId),
              typeOfWork: extractId(data.typeOfWork?._id || data.typeOfWork),
              startTime: start,
              endTime: end,
              time: [
                start ? dayjs(start) : null,
                end ? dayjs(end) : null,
              ],
              duration: data.duration || 0,
              taskDescription: data.taskDescription || '',
              employeeModel: data.employeeModel || [],
              resourceCoordinatorModel: data.resourceCoordinatorModel || '',
              typeOfWorkName: data.typeOfWorkName || '',
            };
            setInitialData(normalizedData);
            setDrawerKey(Date.now()); // Update key to force re-render
          }
        })
        .catch((err) => {
          console.error('Failed to fetch booking:', err);
          // message.error(ResourceAllocationMessages.FAILED_TO_LOAD_DATA);
          toastError({ title: "Error", description: ResourceAllocationMessages.FAILED_TO_LOAD_DATA });
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setInitialData(null);
    }
  }, [bookingId, open]);

  const handleSave = async (formData) => {
    try {
      await updateBookingById(bookingId, formData);
      // message.success(ResourceAllocationMessages.BOOKING_UPDATE_SUCC);
      toastSuccess({ title: "Success", description: ResourceAllocationMessages.BOOKING_UPDATE_SUCC });
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Failed to update booking:', err);
      // message.error(ResourceAllocationMessages.BOOKING_UPDATE_FAIL);
      toastError({ title: "Error", description: ResourceAllocationMessages.BOOKING_UPDATE_FAIL });
    }
  };

  return loading ? (
    <Spin spinning={loading} />
  ) : (
    <BookingDrawer
      key={drawerKey} // Ensures drawer resets on new booking load
      open={open}
      onClose={onClose}
      onSave={handleSave}
      initialData={initialData}
      isEditMode={true}
      resources={resources}
      editbookingId={bookingId}
    />
  );
};

export default EditBookingWrapper;
