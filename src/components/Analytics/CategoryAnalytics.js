import React, { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';

const CategoryAnalytics = ({ analytics }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  
  // Get unique categories from the questions
  const categories = analytics.questionAnalytics 
    ? [...new Set(analytics.questionAnalytics.map(q => q.category))]
    : [];
  
  // Filter questions based on selected category
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredQuestions(analytics.questionAnalytics || []);
    } else {
      const filtered = analytics.questionAnalytics
        ? analytics.questionAnalytics.filter(q => q.category === selectedCategory)
        : [];
      
      // Sort by average score (ascending)
      filtered.sort((a, b) => a.averageScore - b.averageScore);
      setFilteredQuestions(filtered);
    }
  }, [selectedCategory, analytics]);

  // Calculate category statistics
  const getCategoryStats = (category) => {
    const questions = category === 'all' 
      ? analytics.questionAnalytics || [] 
      : (analytics.questionAnalytics || []).filter(q => q.category === category);
    
    if (questions.length === 0) return { avg: 0, lowest: null, highest: null };
    
    const avgScore = questions.reduce((sum, q) => sum + q.averageScore, 0) / questions.length;
    const sorted = [...questions].sort((a, b) => a.averageScore - b.averageScore);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];
    
    return { avg: avgScore, lowest, highest };
  };

  // Get category statistics for the selected category
  const stats = getCategoryStats(selectedCategory);
  
  // Calculate categorical data for visualization
  const categoricalData = categories.map(category => {
    const catStats = getCategoryStats(category);
    return {
      category,
      averageScore: catStats.avg,
      questionCount: (analytics.questionAnalytics || []).filter(q => q.category === category).length
    };
  }).sort((a, b) => b.averageScore - a.averageScore); // Sort by highest average score
  
  // Generate doughnut chart data for category comparison
  const chartData = {
    labels: categoricalData.map(cat => cat.category),
    datasets: [
      {
        data: categoricalData.map(cat => cat.averageScore),
        backgroundColor: [
          '#4F46E5', '#10B981', '#F59E0B', '#EF4444', 
          '#8B5CF6', '#06B6D4', '#EC4899', '#F97316',
          '#6366F1', '#14B8A6', '#F43F5E', '#84CC16'
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 10
      },
    ],
  };
  
  const getScoreColor = (score) => {
    if (score >= 4.0) return 'text-green-700 bg-green-100';
    if (score >= 3.0) return 'text-blue-700 bg-blue-100';
    if (score >= 2.0) return 'text-yellow-700 bg-yellow-100';
    return 'text-red-700 bg-red-100';
  };
  
  return (
    <div className="bg-white p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-3 text-purple-500">📊</span>
          Category Analytics
        </h2>
        <p className="text-gray-600 mb-6">Analyze questions by category to identify areas of strength and opportunity.</p>
      
        {analytics.questionAnalytics?.length > 0 ? (
          <div className="space-y-10">
            {/* Category Overview */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="font-semibold text-purple-800">Category Performance Overview</h3>
                </div>
                <div className="p-5 overflow-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoricalData.map((cat, idx) => (
                      <div 
                        key={`cat-overview-${idx}`} 
                        className={`p-4 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                          selectedCategory === cat.category 
                            ? 'border-2 border-purple-500 bg-white shadow' 
                            : 'border border-gray-200 bg-white hover:border-purple-300'
                        }`}
                        onClick={() => setSelectedCategory(cat.category)}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-gray-800 truncate">{cat.category}</h4>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getScoreColor(cat.averageScore)}`}>
                            {cat.averageScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
                          <span>{cat.questionCount} questions</span>
                          <span>{Math.round((cat.averageScore/5)*100)}% positive</span>
                        </div>
                        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              cat.averageScore >= 4.0 ? 'bg-green-500' :
                              cat.averageScore >= 3.0 ? 'bg-blue-500' :
                              cat.averageScore >= 2.0 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`} 
                            style={{ width: `${Math.min(100, ((cat.averageScore / 5) * 100))}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden p-4">
                <h3 className="font-semibold text-gray-800 mb-4 text-center">Category Comparison</h3>
                <div className="h-64 relative">
                  <Doughnut 
                    data={chartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'right',
                          labels: {
                            boxWidth: 12,
                            font: {
                              size: 10
                            }
                          }
                        },
                        tooltip: {
                          callbacks: {
                            label: (context) => {
                              const label = context.label || '';
                              const value = context.raw.toFixed(2);
                              return `${label}: ${value}/4.00`;
                            }
                          }
                        }
                      },
                      cutout: '70%'
                    }}
                  />
                </div>
                <div className="text-center mt-4 text-sm text-gray-500">
                  Average score by category (out of 4.00)
                </div>
              </div>
            </section>
            
            {/* Category Filter */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-indigo-800 mb-1">Question Analysis</h3>
                    <p className="text-sm text-indigo-600">Filter questions by category to see detailed performance</p>
                  </div>
                  <div className="w-full md:w-64">
                    <select 
                      className="w-full px-4 py-2 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-100"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">All Categories</option>
                      {categories.map((category, idx) => (
                        <option key={`cat-option-${idx}`} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
          
              {/* Selected Category Stats */}
              {selectedCategory !== 'all' && (
                <div className="p-5 border-b border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg shadow-sm border border-indigo-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-indigo-800 uppercase tracking-wider">Average Score</h4>
                        <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"></path>
                        </svg>
                      </div>
                      <p className="text-3xl font-bold text-indigo-800">{stats.avg.toFixed(2)}</p>
                      <div className="mt-2 text-sm text-indigo-600">Out of 5.00 maximum</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg shadow-sm border border-red-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-red-800 uppercase tracking-wider">Lowest Question</h4>
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                      </div>
                      <p className="text-3xl font-bold text-red-800">{stats.lowest?.averageScore.toFixed(2) || 'N/A'}</p>
                      <div className="mt-2 text-sm text-red-600 line-clamp-2">{stats.lowest?.question || 'None'}</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg shadow-sm border border-green-200">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-semibold text-green-800 uppercase tracking-wider">Highest Question</h4>
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                      </div>
                      <p className="text-3xl font-bold text-green-800">{stats.highest?.averageScore.toFixed(2) || 'N/A'}</p>
                      <div className="mt-2 text-sm text-green-600 line-clamp-2">{stats.highest?.question || 'None'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Questions List */}
            <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="text-lg font-semibold text-gray-800">
                  {selectedCategory === 'all' ? 'All Questions' : `Questions in "${selectedCategory}"`}
                </h3>
              </div>
              <div className="p-5">
                {filteredQuestions.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {filteredQuestions.map((q, idx) => (
                      <div key={`filtered-${idx}`} className="py-5">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-3">
                          <h4 className="text-base font-medium text-gray-800">{q.question}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                              q.averageScore >= 4.0 ? 'bg-green-100 text-green-800' : 
                              q.averageScore >= 3.0 ? 'bg-blue-100 text-blue-800' : 
                              q.averageScore >= 2.0 ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              Avg: {q.averageScore?.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-xs font-medium">{q.category}</span>
                          <span className="text-gray-600 text-sm">
                            {Object.values(q.distribution || {}).reduce((sum, val) => sum + (val.count || 0), 0)} responses
                          </span>
                        </div>
                        
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <div className="mb-2 text-sm font-medium text-gray-700">Response Distribution</div>
                          <div className="grid grid-cols-5 gap-3">
                            {[1, 2, 3, 4, 5].map(score => {
                              const count = q.distribution[score]?.count || 0;
                              const total = Object.values(q.distribution || {}).reduce((sum, val) => sum + (val.count || 0), 0);
                              const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                              
                              return (
                                <div key={`score-${score}`} className="flex flex-col items-center">
                                  <div className="w-full bg-gray-200 rounded-t-sm h-20 flex flex-col-reverse">
                                    <div 
                                      className={`w-full ${
                                        score === 1 ? 'bg-red-500' : 
                                        score === 2 ? 'bg-orange-500' : 
                                        score === 3 ? 'bg-yellow-500' : 
                                        score === 4 ? 'bg-blue-500' : 
                                        'bg-green-500'
                                      }`} 
                                      style={{ 
                                        height: `${Math.max(5, percentage)}%`
                                      }}
                                    ></div>
                                  </div>
                                  <div className="mt-2 text-center">
                                    <div className="text-xs font-medium">{score}</div>
                                    <div className="text-xs text-gray-500">{percentage}%</div>
                                    <div className="text-xs font-medium text-gray-700">{count}</div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-10 text-center">
                    <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-gray-500 mb-1">No questions found in this category.</p>
                    <p className="text-sm text-gray-400">Try selecting a different category.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-lg font-medium text-gray-500 mb-2">No category analysis data available</p>
            <p className="text-sm text-gray-400">There are no survey responses to analyze at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryAnalytics;
