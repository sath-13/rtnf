import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Spin, 
  Alert, 
  Button,
  Statistic,
  Tag,
  Input,
  Select,
  DatePicker,
  Typography,
  Empty,
  Badge,
  Tooltip,
  Divider
} from 'antd';
import { 
  SearchOutlined,
  FilterOutlined,
  BarChartOutlined,
  TeamOutlined,
  CalendarOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  RightOutlined,
  BulbOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import SurveyResponseAPI from '../../api/SurveyResponseAPI';
import { useAuth } from '../../contexts/AuthContext';
import moment from 'moment';
import './WorkspaceSelection.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

const WorkspaceSelection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    fetchWorkspaces();
  }, [user, navigate]);

  const fetchWorkspaces = async () => {
    try {
      setLoading(true);
      const data = await SurveyResponseAPI.getAllWorkspaces();
      setWorkspaces(data.workspaces || []);
    } catch (err) {
      console.error('Error fetching workspaces:', err);
      setError('Failed to load workspace data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceClick = (workspaceName) => {
    navigate(`/survey-responses/workspace/${workspaceName}`);
  };

  const handleBackToDashboard = () => {
    // Get workspace name from localStorage
    const workspaceName = localStorage.getItem('enteredWorkspaceName') || localStorage.getItem('workspace');
    
    if (workspaceName) {
      navigate(`/dashboard/workspacename/${workspaceName}`);
    } else {
      // Fallback to general dashboard if no workspace found
      navigate('/dashboard');
    }
  };

  const getStatusColor = (status) => {
    return status === 'active' ? 'success' : 'warning';
  };

  const filteredWorkspaces = workspaces.filter(workspace => {
    const matchesSearch = workspace.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         workspace.displayName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || workspace.status === statusFilter;

    const matchesDate = !dateRange || 
                       (workspace.lastActivity && moment(workspace.lastActivity).isBetween(dateRange[0], dateRange[1], 'day', '[]'));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalStats = workspaces.reduce((acc, workspace) => {
    acc.totalSurveys += workspace.totalSurveys;
    acc.totalResponses += workspace.totalResponses;
    acc.activeWorkspaces += workspace.status === 'active' ? 1 : 0;
    return acc;
  }, { totalSurveys: 0, totalResponses: 0, activeWorkspaces: 0 });

  if (loading) {
    return (
      <div className="workspace-selection">
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading workspaces...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="workspace-selection">
        <Alert
          message="Error Loading Data"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={fetchWorkspaces}>Retry</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="workspace-selection">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="page-title-section">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBackToDashboard}
                type="text"
                className="back-button"
              >
                Back to Dashboard
              </Button>
            </div>
            <Title level={2}>Survey Response Management</Title>
            <Text type="secondary">
              Select a workspace to view and manage survey responses
            </Text>
          </div>
          
          {/* Overall Statistics */}
          <Row gutter={[16, 16]} className="stats-row">
            <Col xs={24} sm={6}>
              <Card size="small" className="stat-card">
                <Statistic
                  title="Total Workspaces"
                  value={workspaces.length}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small" className="stat-card">
                <Statistic
                  title="Active Workspaces"
                  value={totalStats.activeWorkspaces}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small" className="stat-card">
                <Statistic
                  title="Total Surveys"
                  value={totalStats.totalSurveys}
                  prefix={<BarChartOutlined />}
                  valueStyle={{ color: '#722ed1' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={6}>
              <Card size="small" className="stat-card">
                <Statistic
                  title="Total Responses"
                  value={totalStats.totalResponses}
                  prefix={<TrophyOutlined />}
                  valueStyle={{ color: '#fa8c16' }}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      {/* Filters */}
      <Card className="filters-card">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8}>
            <Search
              placeholder="Search workspaces..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              prefix={<FilterOutlined />}
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="pending">Pending</Option>
            </Select>
          </Col>
          <Col xs={24} sm={10}>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              style={{ width: '100%' }}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
        </Row>
      </Card>

      {/* Workspace Cards */}
      <div className="workspaces-section">
        {filteredWorkspaces.length === 0 ? (
          <Card>
            <Empty 
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No workspaces found"
            >
              <Text type="secondary">
                {searchTerm ? 'Try adjusting your search criteria' : 'No survey data available yet'}
              </Text>
            </Empty>
          </Card>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredWorkspaces.map((workspace) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={workspace.name}>
                <Card
                  hoverable
                  className="workspace-card"
                  onClick={() => handleWorkspaceClick(workspace.name)}
                  actions={[
                    <Button 
                      type="primary" 
                      icon={<RightOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleWorkspaceClick(workspace.name);
                      }}
                    >
                      View Surveys
                    </Button>
                  ]}
                >
                  <div className="workspace-header">
                    <div className="workspace-icon">
                      <TeamOutlined />
                    </div>
                    <div className="workspace-info">
                      <Title level={4} className="workspace-name">
                        {workspace.displayName}
                      </Title>
                      <Tag color={getStatusColor(workspace.status)}>
                        {workspace.status.toUpperCase()}
                      </Tag>
                    </div>
                  </div>

                  <Divider />

                  <div className="workspace-stats">
                    <Row gutter={[8, 8]}>
                      <Col span={12}>
                        <div className="stat-item">
                          <BarChartOutlined />
                          <span>{workspace.totalSurveys} Surveys</span>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="stat-item">
                          <TrophyOutlined />
                          <span>{workspace.totalResponses} Responses</span>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="stat-item">
                          <CheckCircleOutlined style={{ color: '#52c41a' }} />
                          <span>{workspace.activeSurveys} Active</span>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className="stat-item">
                          <ClockCircleOutlined style={{ color: '#faad14' }} />
                          <span>{workspace.pendingSurveys} Pending</span>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {workspace.lastActivity && (
                    <div className="workspace-footer">
                      <CalendarOutlined />
                      <Text type="secondary">
                        Last activity {moment(workspace.lastActivity).fromNow()}
                      </Text>
                    </div>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSelection;
