import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Card, 
  Button, 
  Typography, 
  Row, 
  Col, 
  Space, 
  Spin, 
  Empty, 
  Input,
  Select,
  Tag
} from 'antd';
import { 
  ArrowLeftOutlined,
  SearchOutlined,
  PlusOutlined,
  FileTextOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { getComplianceSurveys } from '../../api/complianceAPI';
import './ComplianceSurveys.css';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const ComplianceSurveys = ({ 
  onBackToDashboard, 
  onCreateNewSurvey, 
  onSurveyClick, 
  onViewResponses, 
  hideBackButton = false,
  hideCreateButton = false 
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [surveys, setSurveys] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  useEffect(() => {
    fetchComplianceSurveys();
  }, []);

  useEffect(() => {
    filterSurveys();
  }, [surveys, searchTerm, statusFilter]);

  const fetchComplianceSurveys = async () => {
    setLoading(true);
    try {
      const surveysData = await getComplianceSurveys();
      setSurveys(surveysData);
    } catch (error) {
      console.error('Error fetching surveys:', error);
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
        survey.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const handleSurveyClick = (surveyId) => {
    if (onSurveyClick) {
      onSurveyClick(surveyId);
    } else {
      navigate(`/compliance/test/${surveyId}`);
    }
  };

  const handleViewResponses = (e, surveyId) => {
    e.stopPropagation();
    if (onViewResponses) {
      onViewResponses(surveyId);
    } else {
      navigate(`/compliance/survey/${surveyId}/responses`);
    }
  };

  const handleBackToDashboard = () => {
    if (onBackToDashboard) {
      onBackToDashboard();
    } else {
      navigate('/compliance');
    }
  };

  const handleCreateNewSurvey = () => {
    if (onCreateNewSurvey) {
      onCreateNewSurvey();
    } else {
      navigate('/compliance/create-test');
    }
  };

  return (
    <div className="compliance-surveys">
      <div className="surveys-header">
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
          {isAdmin && !hideCreateButton && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateNewSurvey}
            >
              Create New Test
            </Button>
          )}
        </div>
        
        <Title level={2}>Compliance Tests</Title>
        <Text type="secondary">Browse and manage all compliance tests</Text>
      </div>

      {/* Filters */}
      <div className="surveys-filters">
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
          <Col xs={24} md={10}>
            <Text type="secondary">
              {filteredSurveys.length} of {surveys.length} tests
            </Text>
          </Col>
        </Row>
      </div>

      {/* Surveys Grid */}
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
        </div>
      ) : filteredSurveys.length > 0 ? (
        <Row gutter={[24, 24]} className="surveys-grid">
          {filteredSurveys.map((survey) => (
            <Col xs={24} sm={12} lg={8} xl={6} key={survey.id}>
              <Card 
                hoverable
                className="survey-card"
                onClick={() => handleSurveyClick(survey.id)}
                cover={
                  <div className="card-header">
                    <Tag color={getStatusColor(survey.status)} className="status-tag">
                      {survey.status.toUpperCase()}
                    </Tag>
                    <Text type="secondary" className="category-tag">
                      {survey.category}
                    </Text>
                  </div>
                }
                actions={[
                  // Only show "Take Survey" button for non-superadmin users
                  user?.role !== 'superadmin' && (
                    <Button 
                      type="link" 
                      icon={<FileTextOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSurveyClick(survey.id);
                      }}
                    >
                      Take Test
                    </Button>
                  ),
                  isAdmin && (
                    <Button 
                      type="link" 
                      icon={<UserOutlined />}
                      onClick={(e) => handleViewResponses(e, survey.id)}
                    >
                      View Responses
                    </Button>
                  )
                ].filter(Boolean)}
              >
                <Card.Meta
                  title={
                    <div className="card-title">
                      {survey.title}
                    </div>
                  }
                  description={
                    <div className="card-description">
                      <Text type="secondary" className="description-text">
                        {survey.description}
                      </Text>
                      
                      <div className="survey-details">
                        <div className="detail-item">
                          <UserOutlined className="detail-icon" />
                          <Text>{survey.totalResponses} responses</Text>
                        </div>
                        
                        <div className="detail-item">
                          <FileTextOutlined className="detail-icon" />
                          <Text>{survey.totalQuestions} questions</Text>
                        </div>
                        
                        <div className="detail-item">
                          <CalendarOutlined className="detail-icon" />
                          <Text>Due: {new Date(survey.dueDate).toLocaleDateString()}</Text>
                        </div>
                        
                        <div className="creator-info">
                          <Text type="secondary">Created by {survey.creator}</Text>
                        </div>
                      </div>
                    </div>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <Empty 
          description="No compliance tests found"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {isAdmin && (
            <Button type="primary" onClick={() => onCreateNewSurvey ? onCreateNewSurvey() : navigate('/compliance/create-test')}>
              Create Your First Test
            </Button>
          )}
        </Empty>
      )}
    </div>
  );
};

export default ComplianceSurveys;
