import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Table,
  Tag,
  Space,
  Statistic
} from 'antd';
import { 
  ArrowLeftOutlined,
  SearchOutlined,
  UserOutlined,
  FileTextOutlined,
  BarChartOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { getAllSurveyResponses } from '../../api/complianceAPI';
import './ComplianceSurveyResponses.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ComplianceSurveyResponses = ({ onBackToDashboard, hideBackButton = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
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
    fetchSurveyResponses();
  }, [isAdmin, navigate]);

  useEffect(() => {
    filterSurveys();
  }, [surveys, searchTerm, statusFilter]);

  const fetchSurveyResponses = async () => {
    setLoading(true);
    try {
      const responsesData = await getAllSurveyResponses();
      setSurveys(responsesData);
    } catch (error) {
      console.error('Error fetching survey responses:', error);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSurveys = () => {
    let filtered = surveys;

    if (searchTerm) {
      filtered = filtered.filter(survey => 
        survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        survey.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(survey => survey.status === statusFilter);
    }

    setFilteredSurveys(filtered);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'expired': return 'red';
      case 'draft': return 'orange';
      default: return 'default';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#52c41a';
    if (score >= 60) return '#faad14';
    return '#ff4d4f';
  };

  const handleViewAllResponses = (surveyId) => {
    // Instead of navigating to a new page, we could show detailed responses in a modal
    // or expand the current view. For now, we'll remove this navigation.
    console.log('View all responses for survey:', surveyId);
    // This functionality should be handled within the current tab panel
  };

  const getTotalStats = () => {
    const totalSurveys = filteredSurveys.length;
    const totalResponses = filteredSurveys.reduce((sum, survey) => sum + survey.totalResponses, 0);
    const avgCompletionRate = filteredSurveys.length > 0 
      ? Math.round(filteredSurveys.reduce((sum, survey) => sum + survey.completionRate, 0) / filteredSurveys.length)
      : 0;
    const avgScore = filteredSurveys.length > 0 
      ? Math.round(filteredSurveys.reduce((sum, survey) => sum + survey.averageScore, 0) / filteredSurveys.length)
      : 0;

    return { totalSurveys, totalResponses, avgCompletionRate, avgScore };
  };

  const stats = getTotalStats();

  const handleBackToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      navigate('/compliance');
    }
  };

  return (
    <div className="compliance-survey-responses">
      <div className="responses-header">
        <div className="header-top">
          {!hideBackButton && (
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBackToDashboard}
              className="back-button"
            >
              Back to Dashboard
            </Button>
          )}
        </div>
        
        <Title level={2}>Test Responses Overview</Title>
        <Text type="secondary">Monitor and analyze compliance test responses</Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} className="stats-cards">
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Tests"
              value={stats.totalSurveys}
              prefix={<FileTextOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Total Responses"
              value={stats.totalResponses}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Avg Completion Rate"
              value={stats.avgCompletionRate}
              suffix="%"
              prefix={<BarChartOutlined />}
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
      </Row>

      {/* Filters */}
      <div className="responses-filters">
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search tests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined />}
              allowClear
            />
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              style={{ width: '100%' }}
              placeholder="Filter by status"
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="expired">Expired</Option>
              <Option value="draft">Draft</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {/* Test Cards */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : filteredSurveys.length > 0 ? (
        <Row gutter={[24, 24]} className="responses-grid">
          {filteredSurveys.map((survey) => (
            <Col xs={24} lg={12} key={survey.id}>
              <Card 
                className="response-card"
                title={
                  <div className="card-header">
                    <div>
                      <Title level={4} style={{ margin: 0 }}>{survey.title}</Title>
                      <Text type="secondary">{survey.category}</Text>
                    </div>
                    <Tag color={getStatusColor(survey.status)}>
                      {survey.status.toUpperCase()}
                    </Tag>
                  </div>
                }
                // Removed View All button that was redirecting to new page
              >
                {/* Test Statistics */}
                <Row gutter={[16, 16]} className="survey-stats">
                  <Col span={6}>
                    <Statistic
                      title="Responses"
                      value={survey.totalResponses}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Questions"
                      value={survey.totalQuestions}
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Completion"
                      value={survey.completionRate}
                      suffix="%"
                      valueStyle={{ fontSize: '16px' }}
                    />
                  </Col>
                  <Col span={6}>
                    <Statistic
                      title="Avg Score"
                      value={survey.averageScore}
                      suffix="%"
                      valueStyle={{ 
                        fontSize: '16px',
                        color: getScoreColor(survey.averageScore)
                      }}
                    />
                  </Col>
                </Row>

                {/* Recent Responses */}
                <div className="recent-responses">
                  <Title level={5}>Recent Responses</Title>
                  {survey.recentResponses.length > 0 ? (
                    <div className="responses-list">
                      {survey.recentResponses.slice(0, 3).map((response) => (
                        <div key={response.id} className="response-item">
                          <div className="response-user">
                            <UserOutlined className="user-icon" />
                            <div>
                              <Text strong>{response.userName}</Text>
                              <br />
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                {response.empId}
                              </Text>
                            </div>
                          </div>
                          <div className="response-details">
                            <Text 
                              strong 
                              style={{ color: getScoreColor(response.score) }}
                            >
                              {response.score}%
                            </Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              {new Date(response.submittedAt).toLocaleDateString()}
                            </Text>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Text type="secondary">No responses yet</Text>
                  )}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty 
          description="No test responses found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </div>
  );
};

export default ComplianceSurveyResponses;
