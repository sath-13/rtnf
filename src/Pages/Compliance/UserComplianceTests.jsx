import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Tag, Spin, Empty, message, Row, Col, Input, Select } from 'antd';
import { ClockCircleOutlined, FileTextOutlined, UserOutlined, SearchOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useAuth } from '../../contexts/AuthContext';
import { getComplianceSurveys } from '../../api/complianceAPI';
import './UserComplianceTests.css';

const { Search } = Input;
const { Option } = Select;

const UserComplianceTests = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAvailableTests();
  }, []);

  useEffect(() => {
    filterTests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tests, searchTerm, statusFilter]);

  const fetchAvailableTests = async () => {
    try {
      const response = await getComplianceSurveys();
      console.log('Fetched compliance surveys:', response); // Debug log
      
      // Show all tests for now, you can filter later based on requirements
      // Filter only active tests for users
      // const activeTests = response.filter(test => test.status === 'active');
      setTests(response || []);
      console.log('Tests set to state:', response || []); // Debug log
    } catch (error) {
      console.error('Error fetching compliance tests:', error);
      message.error('Failed to load compliance tests');
    } finally {
      setLoading(false);
    }
  };

  const filterTests = () => {
    let filtered = tests;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(test =>
        test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status (you can extend this based on user's completion status)
    if (statusFilter !== 'all') {
      // This would require additional API to check user's completion status
      // For now, showing all active tests
    }

    setFilteredTests(filtered);
  };

  const handleTakeTest = (testId) => {
    navigate(`/compliance-test/${testId}`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'green';
      case 'expired': return 'orange';
      case 'draft': return 'gray';
      default: return 'blue';
    }
  };

  const getDifficultyColor = (questionCount) => {
    if (questionCount <= 5) return 'green';
    if (questionCount <= 10) return 'orange';
    return 'red';
  };

  const getDifficultyText = (questionCount) => {
    if (questionCount <= 5) return 'Easy';
    if (questionCount <= 10) return 'Medium';
    return 'Hard';
  };

  if (loading) {
    return (
      <div className="user-compliance-loading">
        <Spin size="large" tip="Loading compliance tests..." />
      </div>
    );
  }

  return (
    <div className="user-compliance-container">
      <div className="user-compliance-header">
        <div className="flex justify-between items-center mb-4">
          {/* <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate(-1)}
            className="back-button"
          >
            Back to Dashboard
          </Button> */}
        </div>
        <h1>Compliance Tests</h1>
        <p>Complete your required compliance training and assessments</p>
      </div>

      <div className="user-compliance-filters">
        <Row gutter={16} align="middle">
          <Col flex="auto">
            <Search
              placeholder="Search tests by title, description, or category..."
              allowClear
              enterButton={<SearchOutlined />}
              size="large"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={setSearchTerm}
            />
          </Col>
          <Col>
            <Select
              style={{ width: 150 }}
              placeholder="Filter by status"
              value={statusFilter}
              onChange={setStatusFilter}
              size="large"
            >
              <Option value="all">All Tests</Option>
              <Option value="pending">Pending</Option>
              <Option value="completed">Completed</Option>
            </Select>
          </Col>
        </Row>
      </div>

      {filteredTests.length === 0 ? (
        <Empty
          description="No compliance tests available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      ) : (
        <div className="user-compliance-grid">
          <Row gutter={[24, 24]}>
            {filteredTests.map((test) => (
              <Col xs={24} sm={12} lg={8} xl={6} key={test.id}>
                <Card
                  className="compliance-test-card"
                  hoverable
                  actions={
                    // Only show "Take Test" button for non-superadmin users
                    user?.role !== 'superadmin' ? [
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => handleTakeTest(test.id)}
                        block
                      >
                        {test.status === 'expired' ? 'Take Test (Overdue)' : 'Take Test'}
                      </Button>
                    ] : []
                  }
                >
                  <div className="card-header">
                    <div className="card-status">
                      <Tag color={getStatusColor(test.status)}>
                        {test.status === 'expired' ? 'AVAILABLE' : test.status.toUpperCase()}
                      </Tag>
                      <Tag color={getDifficultyColor(test.totalQuestions)}>
                        {getDifficultyText(test.totalQuestions)}
                      </Tag>
                    </div>
                  </div>

                  <div className="card-content">
                    <h3 className="test-title">{test.title}</h3>
                    <p className="test-description">{test.description}</p>
                    
                    <div className="test-meta">
                      <div className="meta-item">
                        <FileTextOutlined className="meta-icon" />
                        <span>{test.totalQuestions} Questions</span>
                      </div>
                      <div className="meta-item">
                        <ClockCircleOutlined className="meta-icon" />
                        <span>
                          {test.status === 'expired' 
                            ? `Due: ${new Date(test.dueDate).toLocaleDateString()} (Overdue)` 
                            : `Due: ${new Date(test.dueDate).toLocaleDateString()}`}
                        </span>
                      </div>
                      <div className="meta-item">
                        <UserOutlined className="meta-icon" />
                        <span>{test.category}</span>
                      </div>
                    </div>

                    {test.averageScore > 0 && (
                      <div className="test-stats">
                        <div className="stat">
                          <span className="stat-label">Avg Score:</span>
                          <span className="stat-value">{test.averageScore}%</span>
                        </div>
                        <div className="stat">
                          <span className="stat-label">Completion:</span>
                          <span className="stat-value">{test.completionRate}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}
    </div>
  );
};

export default UserComplianceTests;
