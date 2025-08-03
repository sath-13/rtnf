import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, Row, Col, Statistic, Spin, Alert, Badge, Avatar, Input, Select, DatePicker, Button } from 'antd';
import { 
  FileTextOutlined, 
  UserOutlined, 
  BarChartOutlined, 
  TeamOutlined,
  CalendarOutlined,
  SearchOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import SurveyResponseAPI from '../../api/SurveyResponseAPI';
import { useAuth } from '../../contexts/AuthContext';
import moment from 'moment';
import SurveyRespondents from './SurveyRespondents';
import './SurveyResponseDashboard.css';

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

const SurveyResponseDashboard = ({ onBackToWorkspaces, hideBackButton = false, workspace: propWorkspace }) => {
  const [surveys, setSurveys] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState(null);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  
  const navigate = useNavigate();
  const { workspaceName: routerWorkspaceName } = useParams();
  const { user } = useAuth();

  // Use prop workspace if provided, otherwise use router params, otherwise use localStorage
  const workspaceName = propWorkspace?.name || routerWorkspaceName || localStorage.getItem('enteredWorkspaceName');

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, navigate, workspaceName]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [surveysResponse, summaryResponse] = await Promise.all([
        SurveyResponseAPI.getAllSurveys(workspaceName),
        SurveyResponseAPI.getSurveyResponseSummary(workspaceName)
      ]);

      setSurveys(surveysResponse.surveys || []);
      setSummary(summaryResponse.summary || {});
    } catch (err) {
      console.error('Error fetching survey data:', err);
      setError('Failed to load survey data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyClick = (sid) => {
    const survey = surveys.find(s => s.sid === sid);
    setSelectedSurvey(survey);
  };

  const getStatusColor = (status, responseCount) => {
    if (responseCount === 0) return 'default';
    if (responseCount < 5) return 'orange';
    if (responseCount < 20) return 'blue';
    return 'green';
  };

  const getAudienceTypeColor = (type) => {
    if (!type) return 'purple'; // Default for undefined
    const colors = {
      'all-employees': 'purple',
      'department': 'blue',
      'team': 'green',
      'managers': 'orange'
    };
    return colors[type] || 'default';
  };

  const filteredSurveys = surveys.filter(survey => {
    const matchesSearch = (survey.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (survey.sid || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && (survey.responseCount || 0) > 0) ||
                         (statusFilter === 'pending' && (survey.responseCount || 0) === 0);

    const matchesDate = !dateRange || 
                       (survey.createdAt && moment(survey.createdAt).isBetween(dateRange[0], dateRange[1], 'day', '[]'));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleBackToWorkspaces = () => {
    if (onBackToWorkspaces) {
      onBackToWorkspaces();
    } else {
      navigate(-1);
    }
  };

  const getWorkspaceDisplayName = (name) => {
    return name ? name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ') : 'Unknown Workspace';
  };

  if (loading) {
    return (
      <div className="survey-response-dashboard">
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading survey data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="survey-response-dashboard">
        <Alert
          message="Error Loading Data"
          description={error}
          type="error"
          showIcon
          action={
            <button className="retry-button" onClick={fetchData}>
              Retry
            </button>
          }
        />
      </div>
    );
  }

  // If a survey is selected, show the respondents view
  if (selectedSurvey) {
    return (
      <div className="survey-response-dashboard">
        {/* Back button */}
        <div className="mb-4">
          <Button
            onClick={() => setSelectedSurvey(null)}
            icon={<ArrowLeftOutlined />}
            className="back-button"
          >
            Back to Survey Responses Dashboard
          </Button>
        </div>
        {/* Render the SurveyRespondents component */}
        <SurveyRespondents 
          surveyId={selectedSurvey.sid}
          surveyTitle={selectedSurvey.title}
          workspaceName={workspaceName}
          onBackClick={() => setSelectedSurvey(null)}
          onUserResponseClick={true}
        />
      </div>
    );
  }

  return (
    <div className="survey-response-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-controls">
          {!hideBackButton && (
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackToWorkspaces}
              className="back-button"
            >
              Back to Workspaces
            </Button>
          )}
        </div>
        <div className="header-content">
          <h1 className="dashboard-title">
            <FileTextOutlined className="title-icon" />
            {getWorkspaceDisplayName(workspaceName)} - Survey Responses
          </h1>
          <p className="dashboard-subtitle">
            Monitor and analyze survey responses for {workspaceName} workspace
          </p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="summary-section">
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="summary-card">
              <Statistic
                title="Total Surveys"
                value={summary.totalSurveys || 0}
                prefix={<FileTextOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="summary-card">
              <Statistic
                title="Active Surveys"
                value={summary.activeSurveys || 0}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="summary-card">
              <Statistic
                title="Total Responses"
                value={summary.totalResponses || 0}
                prefix={<TeamOutlined />}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="summary-card">
              <Statistic
                title="Avg Responses/Survey"
                value={summary.averageResponsesPerSurvey || 0}
                prefix={<UserOutlined />}
                valueStyle={{ color: '#fa8c16' }}
                precision={1}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search surveys..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value="all">All Surveys</Option>
              <Option value="active">Active (with responses)</Option>
              <Option value="pending">Pending (no responses)</Option>
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              placeholder={['Start Date', 'End Date']}
            />
          </Col>
        </Row>
      </div>

      {/* Surveys Grid */}
      <div className="surveys-section">
        {filteredSurveys.length === 0 ? (
          <div className="empty-state">
            <FileTextOutlined className="empty-icon" />
            <h3>No surveys found</h3>
            <p>No surveys match your current filters.</p>
          </div>
        ) : (
          <Row gutter={[24, 24]}>
            {filteredSurveys.map((survey) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={survey.sid}>
                <Card
                  className="survey-card"
                  hoverable
                  onClick={() => handleSurveyClick(survey.sid)}
                  actions={[
                    <div className="card-action">
                      <UserOutlined />
                      <span>{survey.responseCount} responses</span>
                    </div>
                  ]}
                >
                  <div className="survey-card-header">
                    <Avatar
                      size={48}
                      icon={<FileTextOutlined />}
                      style={{ backgroundColor: '#1890ff' }}
                    />
                    <div className="survey-status">
                      <Badge
                        status={getStatusColor(survey.status, survey.responseCount)}
                        text={survey.responseCount > 0 ? 'Active' : 'Pending'}
                      />
                    </div>
                  </div>

                  <div className="survey-card-content">
                    <h3 className="survey-title">{survey.title}</h3>
                    <p className="survey-id">ID: {survey.sid}</p>
                    
                    <div className="survey-meta">
                      <div className="meta-item">
                        <Badge
                          color={getAudienceTypeColor(survey.audienceType)}
                          text={survey.audienceType ? survey.audienceType.replace('-', ' ').toUpperCase() : 'ALL EMPLOYEES'}
                        />
                      </div>
                      
                      <div className="meta-item">
                        <CalendarOutlined />
                        <span>Created {moment(survey.createdAt).fromNow()}</span>
                      </div>

                      {survey.lastResponseDate && (
                        <div className="meta-item">
                          <span>Last response {moment(survey.lastResponseDate).fromNow()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>
    </div>
  );
};

export default SurveyResponseDashboard;
