import React, { useEffect, useState } from 'react';
import {
  Drawer,
  Form,
  Input,
  InputNumber,
  Button,
  Select,
  DatePicker,
  Space,
} from 'antd';

import { createProjectAPI } from '../../api/ResourceAllocationApi';
import { ResourceAllocationMessages } from '../../constants/constants';

const { RangePicker } = DatePicker;

const ProjectCreateDrawer = ({ open, onClose, onSave }) => {
  const [form] = Form.useForm();

  // Dummy dropdown data
  const techStackOptions = [
    { label: 'React', value: '67caa14ad2b688e2043ac41d' },
    { label: 'Node.js', value: '67caa14ad2b688e2043ac41e' },
    { label: 'MongoDB', value: '67caa14ad2b688e2043ac41f' },
    { label: 'Non-Technical', value: '67caa14ad2b688e2043ac41g' },
  ];

  const teamOptions = [
    { label: 'Frontend Team', value: '67caa14ad2b688e2043ac420' },
    { label: 'Backend Team', value: '67caa14ad2b688e2043ac421' },
    { label: 'Fullstack Team', value: '67caa14ad2b688e2043ac422' },
    { label: 'HR Team', value: '67caa14ad2b688e2043ac423' },
  ];

  const clientOptions = [
    { label: 'Acme Corp', value: '67caa14ad2b688e2043ac423' },
    { label: 'Globex Inc.', value: '67caa14ad2b688e2043ac424' },
    { label: 'Umbrella Co.', value: '67caa14ad2b688e2043ac425' },
  ];

  const featureOptions = [
    { label: 'Login', value: '67caa14ad2b688e2043ac426' },
    { label: 'Dashboard', value: '67caa14ad2b688e2043ac427' },
    { label: 'Reports', value: '67caa14ad2b688e2043ac428' },
    { label: 'Sprint Meeting', value: '67caa14ad2b688e2043ac429' },
    { label: 'HR Work', value: '67caa14ad2b688e2043ac430' },
  ];

  const handleFinish = async (values) => {
    const [start, end] = values.dates || [];

    const payload = {
      name: values.name,
      short_name: values.short_name,
      description: values.description,
      status: values.status,
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      budget: values.budget,
      hr_taken: values.hr_taken || null,
      techStack: values.techStack,
      team_id: values.team_id,
      client_id: values.client_id,
      feature: values.feature || [],
      links: {
        links: values.links_url,
        github: values.github_url,
      },
      image_link: values.image_link || '',
      color: values.color,
    };

    try {
      await createProjectAPI(payload);
      onSave?.();
      onClose();
      form.resetFields();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };


  return (
    <Drawer
      title="Create New Project"
      open={open}
      onClose={onClose}
      width={600}
      destroyOnClose
    >
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item name="name" label="Project Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="short_name" label="Short Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="description" label="Description" rules={[{ required: true }]}>
          <Input.TextArea rows={3} />
        </Form.Item>

        <Form.Item name="status" label="Status" rules={[{ required: true }]}>
          <Input />
        </Form.Item>

        <Form.Item name="dates" label="Start & End Date" rules={[{ required: true }]}>
          <RangePicker className="!w-full" />
        </Form.Item>


        <Form.Item name="budget" label="Budget" rules={[{ required: true }]}>
          <InputNumber className="!w-full" min={0} />
        </Form.Item>

        <Form.Item name="hr_taken" label="Total Project Hours (Estimated)">
          <InputNumber className="!w-full" min={0} />
        </Form.Item>

        <Form.Item
          name="color"
          label="Color (Hex Code)"
          rules={[
            { required: true },
            {
              pattern: /^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{3})$/,
              message: ResourceAllocationMessages.VALID_HEX_CODE_REQ,
            },
          ]}
        >
          <Input placeholder="#5CDB95" />
        </Form.Item>


        <Form.Item name="techStack" label="Tech Stack" rules={[{ required: true }]}>
          <Select mode="multiple" options={techStackOptions} />
        </Form.Item>

        <Form.Item name="feature" label="Features">
          <Select mode="multiple" options={featureOptions} />
        </Form.Item>

        <Form.Item name="team_id" label="Team" rules={[{ required: true }]}>
          <Select options={teamOptions} />
        </Form.Item>

        <Form.Item name="client_id" label="Client" rules={[{ required: true }]}>
          <Select options={clientOptions} />
        </Form.Item>

        <Form.Item name="links_url" label="Live Link">
          <Input />
        </Form.Item>

        <Form.Item name="github_url" label="GitHub Link">
          <Input />
        </Form.Item>

        <Form.Item name="image_link" label="Image URL">
          <Input />
        </Form.Item>

        <Form.Item>
          <Space>
            <Button className='custom-button' type="primary" htmlType="submit">
              Create Project
            </Button>
            <Button onClick={() => { form.resetFields(); onClose(); }}>Cancel</Button>
          </Space>
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default ProjectCreateDrawer;
