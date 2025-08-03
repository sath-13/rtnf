import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Avatar, 
  Spin, 
  Alert, 
  Breadcrumb, 
  Button,
  Statistic,
  Tag,
  Collapse,
  Progress,
  Typography,
  Empty,
  Badge,
  Tooltip
} from 'antd';
import { 
  ArrowLeftOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  StarOutlined,
  MessageOutlined,
  BarChartOutlined,
  EyeInvisibleOutlined,
  TeamOutlined,
  MailOutlined,
  BranchesOutlined
} from '@ant-design/icons';
import SurveyResponseAPI from '../../api/SurveyResponseAPI';
import { useAuth } from '../../contexts/AuthContext';
import moment from 'moment';
import './UserSurveyResponse.css';

const { Panel } = Collapse;
const { Title, Text, Paragraph } = Typography;

const UserSurveyResponse = ({ 
  surveyId: propSurveyId, 
  empId: propEmpId, 
  userName: propUserName, 
  surveyTitle: propSurveyTitle,
  onBackClick 
}) => {
  const { sid: routerSid, empId: routerEmpId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Use props if provided, otherwise use router params
  const sid = propSurveyId || routerSid;
  const empId = propEmpId || routerEmpId;
  const userName = propUserName;
  const surveyTitle = propSurveyTitle;
  
  const [survey, setSurvey] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!propSurveyId && user?.role !== 'superadmin') {
      navigate('/dashboard');
      return;
    }
    fetchUserResponse();
  }, [sid, empId, user, navigate, propSurveyId]);

  const fetchUserResponse = async () => {
    try {
      setLoading(true);
      const data = await SurveyResponseAPI.getUserSurveyResponse(sid, empId);
      setSurvey(data.survey);
      setResponse(data.response);
    } catch (err) {
      console.error('Error fetching user survey response:', err);
      setError('Failed to load user survey response. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(`/survey-responses/${sid}/respondents`);
    }
  };

  const getQuestionIcon = (questionType) => {
    const icons = {
      'emoji-scale': '😊',
      'slider': '📊',
      'star-rating': <StarOutlined />,
      'toggle': '🔄',
      'radio-group': '🔘',
      'checkbox-group': '☑️',
      'open-ended': <MessageOutlined />
    };
    return icons[questionType] || <BarChartOutlined />;
  };

  const formatAnswer = (answer, questionType) => {
    if (answer === null || answer === undefined) {
      return <Text type="secondary">Not answered</Text>;
    }

    // Handle object answers with text and score properties (feedback questions)
    if (typeof answer === 'object' && answer !== null && !Array.isArray(answer)) {
      if (answer.text && answer.score !== undefined) {
        return (
          <div className="feedback-answer">
            <div className="score-answer">
              <span className="score-value">{answer.score}</span>
              <span className="score-scale">/ 5</span>
              <Progress 
                percent={(answer.score / 5) * 100} 
                size="small" 
                showInfo={false}
                strokeColor={answer.score >= 4 ? '#52c41a' : answer.score >= 3 ? '#1890ff' : answer.score >= 2 ? '#faad14' : '#ff4d4f'}
              />
            </div>
            <Paragraph className="open-ended-answer">
              {answer.text}
            </Paragraph>
          </div>
        );
      }
      // Handle other object types
      return <Text>{JSON.stringify(answer)}</Text>;
    }

    switch (questionType) {
      case 'emoji-scale':
      case 'slider':
      case 'star-rating':
        return (
          <div className="score-answer">
            <span className="score-value">{answer}</span>
            <span className="score-scale">/ 5</span>
            <Progress 
              percent={(answer / 5) * 100} 
              size="small" 
              showInfo={false}
              strokeColor={answer >= 4 ? '#52c41a' : answer >= 3 ? '#1890ff' : answer >= 2 ? '#faad14' : '#ff4d4f'}
            />
          </div>
        );
      case 'toggle':
        return (
          <Badge 
            status={answer ? 'success' : 'error'} 
            text={answer ? 'Yes' : 'No'}
          />
        );
      case 'checkbox-group':
        if (Array.isArray(answer)) {
          return (
            <div className="checkbox-answer">
              {answer.map((item, index) => (
                <Tag key={index} color="blue">{item}</Tag>
              ))}
            </div>
          );
        }
        return <Tag color="blue">{answer}</Tag>;
      case 'radio-group':
        return <Tag color="green">{answer}</Tag>;
      case 'open-ended':
        return (
          <Paragraph className="open-ended-answer">
            {answer}
          </Paragraph>
        );
      default:
        return <Text>{String(answer)}</Text>;
    }
  };

  const getCompletionColor = () => {
    const rate = response?.statistics?.completionRate || 0;
    if (rate >= 90) return '#52c41a';
    if (rate >= 70) return '#1890ff';
    if (rate >= 50) return '#faad14';
    return '#ff4d4f';
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
      <div className="user-survey-response">
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading user response...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-survey-response">
        <Alert
          message="Error Loading Data"
          description={error}
          type="error"
          showIcon
          action={
            <Button onClick={fetchUserResponse}>Retry</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="user-survey-response">
      {/* Header */}
      <div className="page-header">
        <div className="header-controls">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBackClick}
            className="back-button"
          >
            Back to Respondents
          </Button>
        </div>

        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item>Survey Responses</Breadcrumb.Item>
          <Breadcrumb.Item>{survey?.sid}</Breadcrumb.Item>
          <Breadcrumb.Item>Respondents</Breadcrumb.Item>
          <Breadcrumb.Item>
            {response?.isAnonymous ? 'Anonymous User' : response?.user?.name || 'Unknown User'}
          </Breadcrumb.Item>
        </Breadcrumb>

        <div className="response-info">
          <h1 className="page-title">Individual Survey Response</h1>
          <div className="survey-details">
            <Tag color="blue">Survey: {survey?.sid}</Tag>
            <Tag color="green">Workspace: {survey?.workspace}</Tag>
            <Tag color="purple">Audience: {survey?.audienceType?.replace('-', ' ').toUpperCase()}</Tag>
          </div>
        </div>
      </div>

      {/* User Info & Statistics */}
      <Row gutter={[24, 24]}>
        {/* User Information */}
        <Col xs={24} lg={8}>
          <Card className="user-info-card">
            <div className="user-header">
              <Avatar
                size={64}
                icon={response?.isAnonymous ? <EyeInvisibleOutlined /> : <UserOutlined />}
                style={{ 
                  backgroundColor: response?.isAnonymous ? '#8c8c8c' : '#1890ff' 
                }}
              >
                {response?.isAnonymous ? 'A' : 
                 response?.user?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <div className="user-details">
                <Title level={3}>
                  {response?.isAnonymous ? 'Anonymous User' : response?.user?.name || 'Unknown User'}
                </Title>
                {!response?.isAnonymous && response?.user && (
                  <div className="user-meta">
                    <div className="meta-item">
                      <MailOutlined />
                      <Text>{response.user.email}</Text>
                    </div>
                    <div className="meta-item">
                      <Tag color={getRoleColor(response.user.role)}>
                        {response.user.role}
                      </Tag>
                    </div>
                    {response.user.teamTitle && Array.isArray(response.user.teamTitle) && (
                      <div className="meta-item">
                        <TeamOutlined />
                        <Text>{response.user.teamTitle.join(', ')}</Text>
                      </div>
                    )}
                    {response.user.branch && (
                      <div className="meta-item">
                        <BranchesOutlined />
                        <Text>{response.user.branch}</Text>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            
            <div className="submission-info">
              <div className="info-item">
                <CalendarOutlined />
                <span>Submitted {moment(response?.submittedAt).format('MMMM Do YYYY, h:mm A')}</span>
              </div>
              <div className="info-item">
                <span>{moment(response?.submittedAt).fromNow()}</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Statistics */}
        <Col xs={24} lg={16}>
          <Card className="statistics-card">
            <Title level={4}>Response Statistics</Title>
            <Row gutter={[24, 24]}>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Total Questions"
                  value={response?.statistics?.totalQuestions || 0}
                  prefix={<MessageOutlined />}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Answered"
                  value={response?.statistics?.answeredQuestions || 0}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <Statistic
                  title="Skipped"
                  value={response?.statistics?.skippedQuestions || 0}
                  prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                  valueStyle={{ color: '#ff4d4f' }}
                />
              </Col>
              <Col xs={12} sm={6}>
                <div className="completion-rate">
                  <div className="rate-label">Completion Rate</div>
                  <Progress
                    type="circle"
                    size={80}
                    percent={response?.statistics?.completionRate || 0}
                    strokeColor={getCompletionColor()}
                    format={(percent) => `${percent}%`}
                  />
                </div>
              </Col>
            </Row>
            
            {response?.statistics?.averageScore && (
              <div className="average-score">
                <Statistic
                  title="Average Score"
                  value={response.statistics.averageScore}
                  suffix="/ 5"
                  precision={2}
                  prefix={<StarOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Answers by Category */}
      <div className="answers-section">
        <Card>
          <Title level={4}>Survey Responses by Category</Title>
          {Object.keys(response?.answersByCategory || {}).length === 0 ? (
            <Empty description="No responses found" />
          ) : (
            <Collapse>
              {Object.entries(response?.answersByCategory || {}).map(([category, answers]) => (
                <Panel 
                  header={
                    <div className="category-header">
                      <span className="category-name">{category}</span>
                      <Badge 
                        count={answers.length} 
                        style={{ backgroundColor: '#1890ff' }}
                      />
                    </div>
                  } 
                  key={category}
                >
                  <div className="category-answers">
                    {answers.map((answer, index) => (
                      <Card key={index} className="question-card" size="small">
                        <div className="question-header">
                          <div className="question-icon">
                            {getQuestionIcon(answer.questionType)}
                          </div>
                          <div className="question-content">
                            <Text strong className="question-text">
                              {answer.question}
                            </Text>
                            <div className="question-meta">
                              <Tag size="small">{answer.questionType}</Tag>
                              {answer.skipped && (
                                <Tag color="red" size="small">Skipped</Tag>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="answer-content">
                          {answer.skipped ? (
                            <Text type="secondary" italic>
                              This question was skipped
                            </Text>
                          ) : (
                            formatAnswer(answer.answer, answer.questionType)
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </Panel>
              ))}
            </Collapse>
          )}
        </Card>
      </div>
    </div>
  );
};

export default UserSurveyResponse;
