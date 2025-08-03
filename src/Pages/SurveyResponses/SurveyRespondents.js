import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Badge, 
  Spin, 
  Alert, 
  Breadcrumb, 
  Button,
  Input,
  Select,
  Tag,
  Tooltip,
  Empty
} from 'antd';
import { 
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  TeamOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import SurveyResponseAPI from '../../api/SurveyResponseAPI';
import { useAuth } from '../../contexts/AuthContext';
import moment from 'moment';
import UserSurveyResponse from './UserSurveyResponse';
import './SurveyRespondents.css';

const { Search } = Input;
const { Option } = Select;

const SurveyRespondents = ({ 
  surveyId: propSurveyId, 
  surveyTitle: propSurveyTitle, 
  workspaceName: propWorkspaceName,
  onBackClick,
  onUserResponseClick
}) => {
  const { sid: routerSid } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use props if provided, otherwise use router params
  const sid = propSurveyId || routerSid;
  const surveyTitle = propSurveyTitle;
  const workspaceName = propWorkspaceName;
  
  const [survey, setSurvey] = useState(null);
  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');

  useEffect(() => {
    if (user?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    if (sid) {
      fetchRespondents();
    }
  }, [sid, user, navigate]);

  const fetchRespondents = async () => {
    try {
      setLoading(true);
      const response = await SurveyResponseAPI.getSurveyRespondents(sid);
      setSurvey(response.survey);
      setRespondents(response.respondents);
    } catch (err) {
      console.error('Error fetching survey respondents:', err);
      setError('Failed to load survey respondents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate('/survey-responses');
    }
  };

  const handleRespondentClick = (empId) => {
    if (onUserResponseClick) {
      const respondent = respondents.find(r => r.empId === empId);
      setSelectedUser(respondent);
    } else {
      navigate(`/survey-responses/${sid}/user/${empId}`);
    }
  };

  const getUniqueValues = (key) => {
    const values = new Set();
    respondents.forEach(respondent => {
      if (respondent.user && respondent.user[key]) {
        if (Array.isArray(respondent.user[key])) {
          respondent.user[key].forEach(val => values.add(val));
        } else {
          values.add(respondent.user[key]);
        }
      }
    });
    return Array.from(values).sort();
  };

  const filteredRespondents = respondents.filter(respondent => {
    if (respondent.isAnonymous) {
      return searchTerm === '' || 'anonymous'.includes(searchTerm.toLowerCase());
    }

    if (!respondent.user) return false;

    const matchesSearch = searchTerm === '' || 
      respondent.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      respondent.user.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'all' || respondent.user.role === roleFilter;
    
    const matchesTeam = teamFilter === 'all' || 
      (Array.isArray(respondent.user.teamTitle) && respondent.user.teamTitle.includes(teamFilter));
    
    const matchesBranch = branchFilter === 'all' || respondent.user.branch === branchFilter;

    return matchesSearch && matchesRole && matchesTeam && matchesBranch;
  });

  const getCompletionColor = (answerCount, skippedCount) => {
    const totalQuestions = answerCount + skippedCount;
    const completionRate = totalQuestions > 0 ? (answerCount / totalQuestions) * 100 : 0;
    
    if (completionRate >= 90) return 'green';
    if (completionRate >= 70) return 'blue';
    if (completionRate >= 50) return 'orange';
    return 'red';
  };

  const getRoleColor = (role) => {
    const colors = {
      'superadmin': 'purple',
      'admin': 'blue',
      'user': 'green',
      'manager': 'orange'
    };
    return colors[role] || 'default';
  };

  if (loading) {
    return (
      <div className="survey-respondents">
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading survey respondents...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="survey-respondents">
        <Alert
          message="Error Loading Data"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={fetchRespondents}>Retry</Button>
          }
        />
      </div>
    );
  }

  // If a user is selected, show their individual response
  if (selectedUser) {
    return (
      <div className="survey-respondents">
        {/* Back button */}
        <div style={{ marginBottom: '16px' }}>
          <Button
            onClick={() => setSelectedUser(null)}
            icon={<ArrowLeftOutlined />}
            className="back-button"
          >
            Back to Respondents List
          </Button>
        </div>
        {/* Render the UserSurveyResponse component */}
        <UserSurveyResponse 
          surveyId={sid}
          empId={selectedUser.empId}
          userName={selectedUser.fullName}
          surveyTitle={surveyTitle}
        />
      </div>
    );
  }

  return (
    <div className="survey-respondents">
      {/* Header */}
      <div className="page-header">
        {!propSurveyId && (
          <div className="header-controls">
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackClick}
              className="back-button"
            >
              Back to Surveys
            </Button>
          </div>
        )}

        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>Survey Responses</Breadcrumb.Item>
          <Breadcrumb.Item>{survey?.sid}</Breadcrumb.Item>
          <Breadcrumb.Item>Respondents</Breadcrumb.Item>
        </Breadcrumb>

        <div className="survey-info">
          <h1 className="page-title">
            {surveyTitle ? `${surveyTitle} - Survey Respondents` : 'Survey Respondents'}
          </h1>
          <div className="survey-details">
            <Tag color="blue">ID: {survey?.sid || sid}</Tag>
            <Tag color="green">Workspace: {workspaceName || survey?.workspace}</Tag>
            <Tag color="purple">Audience: {survey?.audienceType?.replace('-', ' ').toUpperCase()}</Tag>
            <Tag color="orange">{survey?.totalResponses} Total Responses</Tag>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search by name or email..."
              allowClear
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by role"
              value={roleFilter}
              onChange={setRoleFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Roles</Option>
              {getUniqueValues('role').map(role => (
                <Option key={role} value={role}>{role}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={5}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by team"
              value={teamFilter}
              onChange={setTeamFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Teams</Option>
              {getUniqueValues('teamTitle').map(team => (
                <Option key={team} value={team}>{team}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} sm={8} md={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by branch"
              value={branchFilter}
              onChange={setBranchFilter}
              suffixIcon={<FilterOutlined />}
            >
              <Option value="all">All Branches</Option>
              {getUniqueValues('branch').map(branch => (
                <Option key={branch} value={branch}>{branch}</Option>
              ))}
            </Select>
          </Col>
        </Row>
      </div>

      {/* Respondents Grid */}
      <div className="respondents-section">
        {filteredRespondents.length === 0 ? (
          <Empty
            description="No respondents found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {filteredRespondents.map((respondent) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={respondent.empId}>
                <Card
                  className="respondent-card"
                  hoverable
                  onClick={() => handleRespondentClick(respondent.empId)}
                >
                  <div className="respondent-header">
                    <Avatar
                      size={48}
                      icon={<UserOutlined />}
                      style={{ 
                        backgroundColor: respondent.isAnonymous ? '#8c8c8c' : '#1890ff' 
                      }}
                    >
                      {respondent.isAnonymous ? 'A' : 
                       respondent.user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    
                    <div className="completion-badge">
                      <Badge
                        status={getCompletionColor(respondent.answerCount, respondent.skippedCount)}
                        text={`${respondent.answerCount} answered`}
                      />
                    </div>
                  </div>

                  <div className="respondent-content">
                    <h3 className="respondent-name">
                      {respondent.isAnonymous ? 'Anonymous User' : respondent.user?.name || 'Unknown User'}
                    </h3>
                    
                    {!respondent.isAnonymous && respondent.user && (
                      <>
                        <p className="respondent-email">{respondent.user.email}</p>
                        
                        <div className="respondent-tags">
                          <Tag color={getRoleColor(respondent.user.role)}>
                            {respondent.user.role}
                          </Tag>
                          
                          {respondent.user.teamTitle && Array.isArray(respondent.user.teamTitle) && (
                            <Tooltip title={respondent.user.teamTitle.join(', ')}>
                              <Tag color="blue">
                                <TeamOutlined /> {respondent.user.teamTitle[0]}
                                {respondent.user.teamTitle.length > 1 && ` +${respondent.user.teamTitle.length - 1}`}
                              </Tag>
                            </Tooltip>
                          )}
                          
                          {respondent.user.branch && (
                            <Tag color="green">{respondent.user.branch}</Tag>
                          )}
                        </div>
                      </>
                    )}

                    <div className="response-stats">
                      <div className="stat-item">
                        <CheckCircleOutlined style={{ color: '#52c41a' }} />
                        <span>{respondent.answerCount} answered</span>
                      </div>
                      {respondent.skippedCount > 0 && (
                        <div className="stat-item">
                          <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
                          <span>{respondent.skippedCount} skipped</span>
                        </div>
                      )}
                    </div>

                    <div className="submission-date">
                      <CalendarOutlined />
                      <span>Submitted {moment(respondent.submittedAt).fromNow()}</span>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </div>

      {/* Summary Stats */}
      {filteredRespondents.length > 0 && (
        <div className="summary-stats">
          <Card>
            <Row gutter={[24, 0]}>
              <Col span={6}>
                <div className="stat">
                  <div className="stat-value">{filteredRespondents.length}</div>
                  <div className="stat-label">Total Respondents</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="stat">
                  <div className="stat-value">
                    {filteredRespondents.filter(r => r.isAnonymous).length}
                  </div>
                  <div className="stat-label">Anonymous</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="stat">
                  <div className="stat-value">
                    {Math.round(
                      filteredRespondents.reduce((sum, r) => sum + r.answerCount, 0) / 
                      filteredRespondents.length
                    )}
                  </div>
                  <div className="stat-label">Avg Questions Answered</div>
                </div>
              </Col>
              <Col span={6}>
                <div className="stat">
                  <div className="stat-value">
                    {Math.round(
                      (filteredRespondents.reduce((sum, r) => 
                        sum + (r.answerCount / (r.answerCount + r.skippedCount)) * 100, 0
                      ) / filteredRespondents.length) || 0
                    )}%
                  </div>
                  <div className="stat-label">Avg Completion Rate</div>
                </div>
              </Col>
            </Row>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SurveyRespondents;
