import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Empty, Tag, Statistic } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import WFHPatternChart from './WFHPatternChart';
import './YearlyPerformanceDashboard.css';
import { PieChartOutlined, TrophyOutlined, CalendarOutlined, StarOutlined, CheckCircleOutlined, TeamOutlined } from '@ant-design/icons';
import { Progress } from 'antd';
import { fetchWFHRecords } from '../../../../api/wfhApi';

// Define leave types and their properties in a single place
const LEAVE_TYPES = [
  { key: 'Planned', dataKey: 'totalPlannedLeaves', chartKey: 'planned', color: 'blue', barColor: '#3b82f6' },
  { key: 'Unplanned', dataKey: 'totalUnplannedLeaves', chartKey: 'unplanned', color: 'red', barColor: '#ef4444' },
  { key: 'Unpaid', dataKey: 'totalUnpaidLeaves', chartKey: 'unpaid', color: 'gold', barColor: '#f59e0b' },
  { key: 'Restricted Holiday', dataKey: 'totalRestrictedHolidays', chartKey: 'rh', color: 'purple', barColor: '#8b5cf6' },
  { key: 'Maternity', dataKey: 'totalMaternityLeaves', chartKey: 'maternity', color: 'magenta', barColor: '#ec4899' },
  { key: 'Paternity', dataKey: 'totalPaternityLeaves', chartKey: 'paternity', color: 'green', barColor: '#22c55e' },
];

// Add isUserMatch function (copied from ViewProfile.js)
const isUserMatch = (data, user) => {
  if (!data || !user) return false;
  const userEmployeeId = user.employeeId;
  const userEmail = user.email?.toLowerCase();
  const isEmployeeIdMatch = userEmployeeId && data.employeeId === userEmployeeId;
  const isEmailMatch = userEmail && data.emailAddress?.toLowerCase() === userEmail;
  let isNameMatch = false;
  if (data.name && user.fname && user.lname) {
    const importedNameLower = data.name.toLowerCase();
    const userFnameLower = user.fname.toLowerCase();
    const userLnameLower = user.lname.toLowerCase();
    isNameMatch = importedNameLower.includes(userFnameLower) && importedNameLower.includes(userLnameLower);
  }
  return isEmployeeIdMatch || isEmailMatch || isNameMatch;
};

const YearlyPerformanceDashboard = ({ yearlyData, year, userId, userName, employeeId, user }) => {
  // Move hooks to the top
  const [wfhPatternData, setWfhPatternData] = useState(null);

  useEffect(() => {
    if (!user || !year) return;
    // Fetch all WFH records for the user for the selected year
    const fetchWFHData = async () => {
      try {
        let allRecords = [];
        for (let month = 1; month <= 12; month++) {
          const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
          const res = await fetchWFHRecords(monthStr);
          // Use isUserMatch for robust matching
          const filtered = res.filter(rec => isUserMatch(rec, user));
          allRecords = allRecords.concat(filtered);
        }
        // Aggregate by weekday
        const weekdayCounts = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0 };
        allRecords.forEach(rec => {
          const date = new Date(rec.date);
          const day = date.getDay();
          const dayMap = { 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri' };
          if (dayMap[day]) {
            weekdayCounts[dayMap[day]] += 1;
          }
        });
        const chartData = Object.entries(weekdayCounts).map(([day, count]) => ({ day, count }));
        setWfhPatternData(chartData);
      } catch (err) {
        setWfhPatternData(null);
      }
    };
    fetchWFHData();
  }, [user, year]);

  if (!yearlyData) {
    return (
      <Card className="dashboard-card">
        <Empty description="Select a year to see the consolidated performance dashboard." />
      </Card>
    );
  }

  // Destructure all leave totals and other data
  const {
    totalPlannedLeaves, totalUnplannedLeaves, totalUnpaidLeaves, totalRestrictedHolidays, totalMaternityLeaves, totalPaternityLeaves,
    monthlyLeaveData,
    totalGoodBadges, totalConcernBadges,
    wfhCount, cultureSessionAttended, pdcStatus, dhsPercentage,
  } = yearlyData;

  // Map leave type keys to their total values
  const leaveTotals = {
    Planned: totalPlannedLeaves,
    Unplanned: totalUnplannedLeaves,
    Unpaid: totalUnpaidLeaves,
    'Restricted Holiday': totalRestrictedHolidays,
    Maternity: totalMaternityLeaves,
    Paternity: totalPaternityLeaves,
  };

  // Filter leave types to only those with >0 total
  const presentLeaveTypes = LEAVE_TYPES.filter(type => leaveTotals[type.key] > 0);

  // Prepare leave summary data for present types
  const leaveSummaryData = presentLeaveTypes.map(type => ({
    type: type.key,
    count: leaveTotals[type.key],
    color: type.color,
  }));

  // Prepare chart bars for present types
  const chartBars = presentLeaveTypes.map(type => (
    <Bar
      key={type.chartKey}
      dataKey={type.chartKey}
      stackId="a"
      fill={type.barColor}
      name={type.key}
    />
  ));

  // Prepare chart legend payload for present types
  const chartLegendPayload = presentLeaveTypes.map(type => ({
    value: type.key,
    type: 'rect',
    color: type.barColor,
    id: type.chartKey,
  }));

  const badgeChartData = [
    { name: 'Good', value: totalGoodBadges },
    { name: 'Concern', value: totalConcernBadges }
  ];
  const BADGE_COLORS = ['#00C49F', '#FF8042'];

  // Custom legend for badge distribution
  const BadgeLegend = ({ payload }) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
      {payload.map((entry, idx) => (
        <span key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, background: entry.color, display: 'inline-block', borderRadius: 2 }} />
          <span style={{ fontWeight: 500 }}>{entry.value}</span>
          <span style={{ color: '#888', marginLeft: 2 }}>– {badgeChartData[idx]?.value ?? 0}</span>
        </span>
      ))}
    </div>
  );

  // Donut chart data for leave summary
  const leaveDonutData = presentLeaveTypes.map(type => ({
    name: type.key,
    value: leaveTotals[type.key],
    color: type.barColor,
  }));

  // Custom legend for leave donut
  const LeaveLegend = ({ payload }) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12, justifyContent: 'center' }}>
      {payload.map((entry, idx) => (
        <span key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, background: entry.color, display: 'inline-block', borderRadius: 2 }} />
          <span style={{ fontWeight: 500 }}>{entry.value}</span>
          <span style={{ color: '#888', marginLeft: 2 }}>– {leaveDonutData[idx]?.value ?? 0}</span>
        </span>
      ))}
    </div>
  );

  // Circular progress for metrics
  const metricItems = [
    {
      title: 'WFH',
      value: wfhCount,
      icon: <CalendarOutlined style={{ color: '#3b82f6', fontSize: 22 }} />,
      color: '#3b82f6',
      percent: Math.min((wfhCount / 30) * 100, 100),
    },
    {
      title: 'Culture',
      value: cultureSessionAttended,
      icon: <StarOutlined style={{ color: '#f59e0b', fontSize: 22 }} />,
      color: '#f59e0b',
      percent: Math.min((cultureSessionAttended / 10) * 100, 100),
    },
    {
      title: 'DHS',
      value: `${dhsPercentage}%`,
      icon: <CheckCircleOutlined style={{ color: '#22c55e', fontSize: 22 }} />,
      color: '#22c55e',
      percent: dhsPercentage,
    },
    {
      title: 'PDC',
      value: pdcStatus ? 'Completed' : 'Pending',
      icon: <TeamOutlined style={{ color: '#8b5cf6', fontSize: 22 }} />,
      color: '#8b5cf6',
      percent: pdcStatus ? 100 : 0,
    },
  ];

  return (
    <div className="performance-dashboard-container" style={{ background: 'linear-gradient(135deg, #f9fafb 60%, #ede9fe 100%)', minHeight: 600, padding: '32px 0' }}>
      <Row gutter={[40, 40]} justify="center">
        {/* Leave Summary as List (classic style) */}
        <Col xs={24} md={20} lg={7} style={{ marginBottom: 24 }}>
          <Card className="dashboard-card" style={{ minHeight: 340, boxShadow: '0 6px 24px rgba(116,55,153,0.07)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <PieChartOutlined style={{ color: '#743799', fontSize: 22 }} />
              <span style={{ fontWeight: 700, fontSize: 20 }}>Leave Summary</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: 24 }}>
              {leaveSummaryData.length === 0 ? (
                <span style={{ color: '#888' }}>No leave taken this year.</span>
              ) : (
                leaveSummaryData.map(item => (
                  <div key={item.type} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span><Tag color={item.color} style={{ fontWeight: 500, fontSize: 15 }}>{item.type}</Tag></span>
                    <span style={{ fontWeight: 600, fontSize: 16 }}>{item.count} days</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>

        {/* Performance Metrics as Circular Progress */}
        <Col xs={24} md={20} lg={9} style={{ marginBottom: 24 }}>
          <Card className="dashboard-card" style={{ minHeight: 340, boxShadow: '0 6px 24px rgba(116,55,153,0.07)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <TrophyOutlined style={{ color: '#743799', fontSize: 22 }} />
              <span style={{ fontWeight: 700, fontSize: 20 }}>Performance Metrics</span>
            </div>
            <Row gutter={[32, 32]} justify="center">
              {metricItems.map((item, idx) => (
                <Col xs={12} sm={12} md={12} lg={12} key={item.title} style={{ textAlign: 'center', marginBottom: 16 }}>
                  <Progress
                    type="circle"
                    percent={item.percent}
                    width={90}
                    strokeColor={item.color}
                    format={() => (
                      <div>
                        {item.icon}
                        <div style={{ fontWeight: 600, fontSize: 18, marginTop: 4 }}>{item.value}</div>
                        <div style={{ fontSize: 13, color: '#888' }}>{item.title}</div>
                      </div>
                    )}
                  />
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Badge Distribution as Donut Chart */}
        <Col xs={24} md={20} lg={7} style={{ marginBottom: 24 }}>
          <Card className="dashboard-card" style={{ minHeight: 340, boxShadow: '0 6px 24px rgba(116,55,153,0.07)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <StarOutlined style={{ color: '#743799', fontSize: 22 }} />
              <span style={{ fontWeight: 700, fontSize: 20 }}>Badge Distribution</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={badgeChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={5} label={false}>
                  {badgeChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={BADGE_COLORS[index % BADGE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 40, marginTop: 16, flexWrap: 'nowrap', alignItems: 'center' }}>
              {badgeChartData.map((entry, idx) => (
                <span key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 15, whiteSpace: 'nowrap' }}>
                  <span style={{ width: 14, height: 14, background: BADGE_COLORS[idx % BADGE_COLORS.length], display: 'inline-block', borderRadius: 3 }} />
                  <span>{entry.name}</span>
                  <span style={{ color: '#888', marginLeft: 2 }}>– {entry.value}</span>
                </span>
              ))}
            </div>
          </Card>
        </Col>
      </Row>

      {/* Monthly Leave Analysis */}
      <Row gutter={[40, 40]} justify="center" style={{ marginTop: '16px' }}>
        <Col xs={24} md={22} lg={22}>
          <Card className="dashboard-card" style={{ boxShadow: '0 6px 24px rgba(116,55,153,0.07)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <CalendarOutlined style={{ color: '#743799', fontSize: 22 }} />
              <span style={{ fontWeight: 700, fontSize: 20 }}>Monthly Leave Analysis</span>
            </div>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={monthlyLeaveData} barCategoryGap={24} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '12px' }} payload={chartLegendPayload} layout="horizontal" verticalAlign="top" align="center" height={40} />
                {presentLeaveTypes.map(type => (
                  <Bar
                    key={type.chartKey}
                    dataKey={type.chartKey}
                    fill={type.barColor}
                    name={type.key}
                    label={{ position: 'top', fontSize: 12 }}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* WFH Pattern Chart */}
      <Row gutter={[40, 40]} justify="center" style={{ marginTop: '16px' }}>
        <Col xs={24} md={22} lg={22}>
          <Card className="dashboard-card" style={{ boxShadow: '0 6px 24px rgba(116,55,153,0.07)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <CalendarOutlined style={{ color: '#743799', fontSize: 22 }} />
              <span style={{ fontWeight: 700, fontSize: 20 }}>WFH Weekly Pattern</span>
            </div>
            {/* Remove duplicate header inside WFHPatternChart */}
            <WFHPatternChart data={wfhPatternData} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default YearlyPerformanceDashboard;