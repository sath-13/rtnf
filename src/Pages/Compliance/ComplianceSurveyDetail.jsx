import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Spin, 
  Empty, 
  Input,
  Select,
  Tag,
  Avatar,
  Progress,
  Statistic,
  Tooltip,
  Modal,
  Space
} from 'antd';
import { 
  ArrowLeftOutlined,
  SearchOutlined,
  UserOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { getSurveyDetail } from '../../api/complianceAPI';
import './ComplianceSurveyDetail.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ComplianceSurveyDetail = ({ 
  surveyId: propSurveyId, 
  action, 
  onBackToDashboard,
  hideBackButton = false 
}) => {
  const navigate = useNavigate();
  const { surveyId: paramSurveyId } = useParams();
  const { user } = useAuth();
  
  // Use prop surveyId if provided, otherwise use param
  const surveyId = propSurveyId || paramSurveyId;
  const [loading, setLoading] = useState(false);
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [filteredResponses, setFilteredResponses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [scoreFilter, setScoreFilter] = useState('all');
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    if (!isAdmin) {
      if (onBackToDashboard) {
        onBackToDashboard();
      } else {
        navigate('/compliance');
      }
      return;
    }
    fetchSurveyDetail();
  }, [surveyId, isAdmin, navigate]);

  useEffect(() => {
    filterResponses();
  }, [responses, searchTerm, scoreFilter]);

  const fetchSurveyDetail = async () => {
    setLoading(true);
    try {
      const data = await getSurveyDetail(surveyId);
      setSurvey(data.survey);
      setResponses(data.responses);
    } catch (error) {
      console.error('Error fetching survey detail:', error);
      setSurvey(null);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };

  const filterResponses = () => {
    let filtered = responses;

    if (searchTerm) {
      filtered = filtered.filter(response => 
        response.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        response.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (scoreFilter !== 'all') {
      switch (scoreFilter) {
        case 'excellent':
          filtered = filtered.filter(r => r.score >= 90);
          break;
        case 'good':
          filtered = filtered.filter(r => r.score >= 80 && r.score < 90);
          break;
        case 'average':
          filtered = filtered.filter(r => r.score >= 70 && r.score < 80);
          break;
        case 'poor':
          filtered = filtered.filter(r => r.score < 70);
          break;
      }
    }

    setFilteredResponses(filtered);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#52c41a';
    if (score >= 80) return '#1890ff';
    if (score >= 70) return '#faad14';
    return '#ff4d4f';
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Good';
    if (score >= 70) return 'Average';
    return 'Needs Improvement';
  };

  const handleViewResponse = (response) => {
    setSelectedResponse(response);
    setModalVisible(true);
  };

  const getStats = () => {
    if (responses.length === 0) return { avgScore: 0, completionRate: 0, avgTime: 0 };
    
    const avgScore = Math.round(responses.reduce((sum, r) => sum + r.score, 0) / responses.length);
    const completionRate = 100; // All fetched responses are completed
    const avgTime = Math.round(responses.reduce((sum, r) => sum + r.timeSpent, 0) / responses.length);
    
    return { avgScore, completionRate, avgTime };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="error-container">
        <Empty description="Test not found" />
        {!hideBackButton && (
          <Button onClick={() => onBackToDashboard ? onBackToDashboard() : navigate('/compliance/survey-responses')}>
            Back to Responses
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="compliance-survey-detail">
      <div className="detail-header">
        <div className="header-top">
          {!hideBackButton && (
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => onBackToDashboard ? onBackToDashboard() : navigate('/compliance')}
                className="back-button"
              >
                Back to Dashboard
              </Button>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => onBackToDashboard ? onBackToDashboard() : navigate('/compliance/survey-responses')}
                className="back-button"
              >
                Back to Test Responses
              </Button>
            </Space>
          )}
          <Space>
            <Button icon={<DownloadOutlined />}>
              Export Results
            </Button>
          </Space>
        </div>
        
        <div className="test-info">
          <Title level={2}>{survey.title}</Title>
          <Text type="secondary">{survey.description}</Text>
          <div className="survey-meta">
            <Tag color="blue">{survey.category}</Tag>
            <Text type="secondary">
              Created: {new Date(survey.createdDate).toLocaleDateString()}
            </Text>
            <Text type="secondary">
              Due: {new Date(survey.dueDate).toLocaleDateString()}
            </Text>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <Row gutter={[24, 24]} className="stats-section">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Responses"
              value={responses.length}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Average Score"
              value={stats.avgScore}
              suffix="%"
              valueStyle={{ color: getScoreColor(stats.avgScore) }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Completion Rate"
              value={stats.completionRate}
              suffix="%"
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Avg Time Spent"
              value={stats.avgTime}
              suffix=" min"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div className="detail-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={scoreFilter}
              onChange={setScoreFilter}
              style={{ width: '100%' }}
              placeholder="Filter by score"
              prefix={<FilterOutlined />}
            >
              <Option value="all">All Scores</Option>
              <Option value="excellent">Excellent (90-100%)</Option>
              <Option value="good">Good (80-89%)</Option>
              <Option value="average">Average (70-79%)</Option>
              <Option value="poor">Needs Improvement (&lt;70%)</Option>
            </Select>
          </Col>
          <Col xs={24} md={10}>
            <Text type="secondary">
              {filteredResponses.length} of {responses.length} responses
            </Text>
          </Col>
        </Row>
      </div>

      {/* Responses Grid */}
      {filteredResponses.length > 0 ? (
        <Row gutter={[16, 16]} className="responses-grid">
          {filteredResponses.map((response) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={response.id}>
              <Card 
                hoverable
                className="response-card"
                onClick={() => handleViewResponse(response)}
              >
                <div className="response-header">
                  <Avatar size={48} icon={<UserOutlined />} />
                  <div className="user-info">
                    <Title level={5} style={{ margin: 0 }}>
                      {response.userName}
                    </Title>
                    <Text type="secondary">{response.empId}</Text>
                  </div>
                  <div className="score-badge">
                    <Text 
                      strong 
                      style={{ 
                        color: getScoreColor(response.score),
                        fontSize: '18px'
                      }}
                    >
                      {response.score}%
                    </Text>
                  </div>
                </div>
                
                <div className="response-details">
                  <div className="detail-row">
                    <Text type="secondary">Department:</Text>
                    <Text>{response.department}</Text>
                  </div>
                  
                  <div className="detail-row">
                    <Text type="secondary">Submitted:</Text>
                    <Text>{new Date(response.submittedAt).toLocaleDateString()}</Text>
                  </div>
                  
                  <div className="detail-row">
                    <Text type="secondary">Time Spent:</Text>
                    <Text>{response.timeSpent} minutes</Text>
                  </div>
                  
                  <div className="detail-row">
                    <Text type="secondary">Performance:</Text>
                    <Tag color={getScoreColor(response.score)}>
                      {getScoreLabel(response.score)}
                    </Tag>
                  </div>
                </div>

                <div className="response-progress">
                  <Progress 
                    percent={response.score} 
                    strokeColor={getScoreColor(response.score)}
                    size="small"
                    showInfo={false}
                  />
                </div>

                <Button 
                  type="primary" 
                  block 
                  icon={<EyeOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewResponse(response);
                  }}
                  style={{ marginTop: '12px' }}
                >
                  View Details
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty 
          description="No responses found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}

      {/* Response Detail Modal */}
      <Modal
        title={`Response Details - ${selectedResponse?.userName}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        className="response-modal"
      >
        {selectedResponse && (
          <div className="modal-content">
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <Card size="small" title="Employee Information">
                  <div className="info-grid">
                    <div className="info-item">
                      <Text type="secondary">Name:</Text>
                      <Text strong>{selectedResponse.userName}</Text>
                    </div>
                    <div className="info-item">
                      <Text type="secondary">Employee ID:</Text>
                      <Text>{selectedResponse.empId}</Text>
                    </div>
                    <div className="info-item">
                      <Text type="secondary">Email:</Text>
                      <Text>{selectedResponse.email}</Text>
                    </div>
                    <div className="info-item">
                      <Text type="secondary">Department:</Text>
                      <Text>{selectedResponse.department}</Text>
                    </div>
                  </div>
                </Card>
              </Col>
              <Col span={12}>
                <Card size="small" title="Response Summary">
                  <div className="info-grid">
                    <div className="info-item">
                      <Text type="secondary">Score:</Text>
                      <Text 
                        strong 
                        style={{ color: getScoreColor(selectedResponse.score) }}
                      >
                        {selectedResponse.score}%
                      </Text>
                    </div>
                    <div className="info-item">
                      <Text type="secondary">Status:</Text>
                      <Tag color="green">Completed</Tag>
                    </div>
                    <div className="info-item">
                      <Text type="secondary">Submitted:</Text>
                      <Text>{new Date(selectedResponse.submittedAt).toLocaleString()}</Text>
                    </div>
                    <div className="info-item">
                      <Text type="secondary">Time Spent:</Text>
                      <Text>{selectedResponse.timeSpent} minutes</Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>

            {selectedResponse.answers && selectedResponse.answers.length > 0 && (
              <Card size="small" title="Answer Details" style={{ marginTop: '16px' }}>
                <div className="answers-list">
                  {selectedResponse.answers.map((answer, index) => (
                    <div key={answer.questionId} className="answer-item">
                      <div className="question-header">
                        <Text strong>Q{index + 1}: {answer.question}</Text>
                        <Tag color={answer.isCorrect ? 'green' : 'red'}>
                          {answer.isCorrect ? 'Correct' : 'Incorrect'}
                        </Tag>
                      </div>
                      <div className="answer-content">
                        <Text>Answer: {answer.answer}</Text>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ComplianceSurveyDetail;
