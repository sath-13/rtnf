import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Form,
  InputNumber,
  Button,
  Select,
  DatePicker,
  Space,
  Row,
  Col,
  Divider,
  Tooltip,
  message
} from 'antd';
import dayjs from 'dayjs';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { getAllProjects } from '../../api/projectApi';
import { checkBookingOverlap, deleteBookingAPI, getAllTypeOfWorkAPI } from '../../api/ResourceAllocationApi';
import { ResourceAllocationMessages } from '../../constants/constants';
import { toastError, toastSuccess } from '../../Utility/toast';

const { RangePicker } = DatePicker;

const BookingDrawer = ({
  open,
  onClose,
  onSave,
  initialData = {},
  resources = [],
  isEditMode = false,
  editbookingId,
  refetchCalendarOrBookings,
  loading
}) => {
  const [form] = Form.useForm();
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [typeOfWorkOptions, setTypeOfWorkOptions] = useState([]);
  const [loadingTypeOfWork, setLoadingTypeOfWork] = useState(false);
  const [overlapWarning] = useState(null);

  const handleDelete = async () => {
    try {
      await deleteBookingAPI(editbookingId);
      // message.success(ResourceAllocationMessages.BOOKING_DELETE_SUCC);
      toastSuccess({ title: "Success", description: ResourceAllocationMessages.BOOKING_DELETE_SUCC });
      onClose();

      if (refetchCalendarOrBookings) {
        await refetchCalendarOrBookings();
      }
    } catch (error) {
      // message.error(ResourceAllocationMessages.BOOKING_DEL_FAIL);
      toastError({ title: "Error", description: ResourceAllocationMessages.BOOKING_DEL_FAIL });
    }
  };

  useEffect(() => {
    if (initialData) {
      const bookingsData =
        initialData.employeeId?.map((user) => ({
          user: {
            label: `${user.fname || ''} ${user.lname || ''}`.trim(),
            value: user._id,
          },
          time: initialData.time || [],
          duration: initialData.duration || 1,
        })) || [{ user: undefined, time: [], duration: 1 }];

      form.setFieldsValue({
        project: initialData.project || undefined,
        typeOfWork: initialData.typeOfWork || undefined,
        taskDescription: initialData.taskDescription || '',
        bookings: bookingsData,
      });
    } else {
      form.setFieldsValue({
        bookings: [{ user: undefined, time: [], duration: 1 }],
      });
    }
  }, [initialData, form]);


  useEffect(() => {
    if (open) {
      setLoadingProjects(true);
      getAllProjects()
        .then((res) => {
          const projectList = res.projects || [];
          setProjects(projectList);
        })
        .catch((err) => console.error('Error fetching projects:', err))
        .finally(() => setLoadingProjects(false));

      setLoadingTypeOfWork(true);
      getAllTypeOfWorkAPI()
        .then((types) => {
          setTypeOfWorkOptions(types);
        })
        .catch((err) => console.error('Error fetching typeOfWork:', err))
        .finally(() => setLoadingTypeOfWork(false));
    }
  }, [open]);

  const handleFinish = async (values) => {
  const selectedProject = isEditMode
    ? initialData?.project
    : projects.find(p => p._id === values.project);

  const selectedTypeOfWork = typeOfWorkOptions.find(t => t._id === values.typeOfWork);

  if (!selectedProject) {
    toastError({ title: "Error", description: ResourceAllocationMessages.PROJECT_SELECT_ERR });
    return;
  }

  if (!selectedTypeOfWork) {
    toastError({ title: "Error", description: ResourceAllocationMessages.TYPEOFWORK_SELECT_ERR });
    return;
  }

  const validBookings = [];

  for (const booking of values.bookings || []) {
    const resourceId =
      typeof booking.user === "object" && booking.user?.value
        ? booking.user.value
        : booking.user;

    const startTime = booking.time?.[0]?.toDate?.();
    const endTime = booking.time?.[1]?.toDate?.();

    if (!resourceId || !startTime || !endTime) continue;

    const overlapResult = await checkBookingOverlap({
      resourceId,
      // startTime,
      // endTime,
      bookingId: booking._id, // only for edit mode
    });

    if (overlapResult?.conflict) {
      toastError({
        title: "Error",
        description: `Overlap for ${booking.userLabel || 'a user'} from ${overlapResult.conflict.start.toLocaleTimeString()} to ${overlapResult.conflict.end.toLocaleTimeString()}`
      });
      return;
    }

    validBookings.push({
      user: resourceId,
      start: startTime,
      end: endTime,
      duration: booking.duration,
      project: selectedProject,
      typeOfWork: selectedTypeOfWork,
      taskDescription: values.taskDescription,
    });
  }

  onSave(validBookings);
  
};



  return (
    <Drawer
      title={isEditMode ? 'Edit Booking' : 'New Booking'}
      open={open}
      onClose={onClose}
      width={500}
      destroyOnClose
    >
      {overlapWarning && <div className="text-red-500">{overlapWarning}</div>}
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item name="project" label="Project" rules={[{ required: true }]}>
          <Select
            disabled={isEditMode === true}
            showSearch
            placeholder="Select or type project"
            filterOption={(input, option) =>
              (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
            }
            loading={loadingProjects}
          >
            {projects.map((proj) => (
              <Select.Option key={proj._id} value={proj._id}>
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2 border !border-[#ccc]"
                    style={{ backgroundColor: proj.color }}
                  />
                  <span>{proj.name}</span>
                </div>
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="typeOfWork"
          label="Type of Work"
          rules={[{ required: true, message: ResourceAllocationMessages.TYPEOFWORK_REQ }]}
        >
          <Select
            placeholder="Select Type of Work"
            loading={loadingTypeOfWork}
            allowClear
          >
            {typeOfWorkOptions.map((type) => (
              <Select.Option key={type._id} value={type._id}>
                {type.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Divider>Assign Bookings</Divider>

        <Form.List name="bookings">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Row key={key} className="mb-4">
                  {/* User + Duration + Remove Icon Row */}
                  <Col span={16}>
                    <Tooltip title="Select the user to assign this booking to">
                      <Form.Item
                        {...restField}
                        name={[name, 'user']}
                        rules={[{ required: true, message: ResourceAllocationMessages.USER_REQ }]
                        }
                        className="mb-0"
                      >
                        <Select
                          disabled={isEditMode === true}
                          placeholder="User">
                          {resources.map((user) => (
                            <Select.Option key={user.id} value={user.id}>
                              {user.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Tooltip>
                  </Col>

                  <Col span={6} className="pl-2">
                    <Tooltip title="Enter the duration in hours">
                      <Form.Item
                        {...restField}
                        name={[name, 'duration']}
                        rules={[{ required: true }]}
                        initialValue={1}
                        className="mb-0"
                      >
                        <InputNumber
                          disabled={isEditMode === true}
                          min={1}
                          max={24}
                          placeholder="Hr"
                          className="!w-full"
                          onChange={(value) => {
                            const bookings = form.getFieldValue('bookings');
                            const start = bookings?.[name]?.time?.[0];
                            if (start && dayjs.isDayjs(start)) {
                              const newEnd = dayjs(start).add(value, 'hour');
                              const updatedBookings = bookings.map((booking, idx) =>
                                idx === name ? { ...booking, time: [start, newEnd] } : booking
                              );
                              form.setFieldsValue({ bookings: updatedBookings });
                            }
                          }}
                        />
                      </Form.Item>

                    </Tooltip>
                  </Col>

                  <Col span={2} className="text-center pl-2">
                    <Tooltip title="Remove this booking">
                      <MinusCircleOutlined
                        // onClick={() => remove(name)}
                        onClick={() => {
                          if (isEditMode === false) {
                            remove(name);
                          }
                        }}
                        className="text-[20px] text-[#ff4d4f] cursor-pointer mt-1.5"
                      />
                    </Tooltip>
                  </Col>

                  {/* Time Range Picker Full Width Below */}
                  <Col span={24} className="mt-3">
                    <Tooltip title="Select the time range for this booking">
                      <Form.Item
                        {...restField}
                        name={[name, 'time']}
                        rules={[{ required: true, message: ResourceAllocationMessages.TIME_RANGE }]}
                      >
                        <RangePicker
                          disabled={isEditMode === true}
                          showTime={{ use12Hours: true, format: 'hh:mm A' }}
                          format="YYYY-MM-DD hh:mm A"
                          className="!w-full"
                          onChange={(value) => {
                            if (!value) return;

                            const [start, end] = value;
                            if (!start) return;

                            // Get current duration value
                            const currentDuration = form.getFieldValue(['bookings', name, 'duration']) || 1;

                            // Calculate new end time based on start + duration hours
                            const newEnd = start.add(currentDuration, 'hour');

                            // Only update if end is different or not set
                            if (!end || !end.isSame(newEnd)) {
                              const newRange = [start, newEnd];
                              // Update form field without triggering validation
                              form.setFieldsValue({
                                bookings: form.getFieldValue('bookings').map((booking, idx) =>
                                  idx === name ? { ...booking, time: newRange } : booking
                                ),
                              });
                            }
                          }}
                        />
                      </Form.Item>
                    </Tooltip>
                  </Col>
                </Row>

              ))}
              <Form.Item>
                <Tooltip title="Add a new booking row">
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    icon={<PlusOutlined />}
                    block
                    disabled={isEditMode === true || !!overlapWarning}
                  >
                    Add Booking
                  </Button>
                </Tooltip>
              </Form.Item>
            </>
          )}
        </Form.List>

        <Form.Item
          name="taskDescription"
          label="Description"
          rules={[{ required: true, message: ResourceAllocationMessages.DESCRIPTION_REQ }]}
        >
          <ReactQuill />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button type="primary"
              loading={loading}
              htmlType="submit">
              {isEditMode ? 'Update' : 'Save'}
            </Button>

            <Button onClick={onClose}>Cancel</Button>

            {isEditMode && (
              <Button danger onClick={handleDelete}>
                Delete
              </Button>
            )}
          </Space>
        </Form.Item>

      </Form>
    </Drawer>
  );
};

export default BookingDrawer;
