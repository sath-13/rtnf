import React, { useState, useEffect } from 'react';

const ScoreAnalytics = ({ analytics }) => {
  const [selectedScore, setSelectedScore] = useState('all');
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  
  // Sort questions by score
  const sortedQuestions = analytics.questionAnalytics ? [...analytics.questionAnalytics].sort((a, b) => {
    return a.averageScore - b.averageScore;
  }) : [];
  
  const mostNegative = sortedQuestions.slice(0, 3);
  const mostPositive = sortedQuestions.slice(-3).reverse();
  
  // Filter questions based on selected score
  useEffect(() => {
    if (selectedScore === 'all') {
      setFilteredQuestions(sortedQuestions);
    } else {
      const scoreValue = parseInt(selectedScore);
      // Filter questions that have responses with the selected score
      const filtered = sortedQuestions.filter(q => 
        q.distribution && q.distribution[selectedScore] && q.distribution[selectedScore].count > 0
      );
      // Sort by the count of the selected score (descending)
      filtered.sort((a, b) => 
        (b.distribution[selectedScore]?.count || 0) - (a.distribution[selectedScore]?.count || 0)
      );
      setFilteredQuestions(filtered);
    }
  }, [selectedScore, analytics]);

  const getScoreLabel = (score) => {
    switch(score) {
      case '1': return 'Strongly Disagree';
      case '2': return 'Disagree';
      case '3': return 'Neutral';
      case '4': return 'Agree';
      case '5': return 'Strongly Agree';
      default: return '';
    }
  };

  return (
    <div className="bg-white p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
          <span className="mr-3 text-indigo-500">🎯</span>
          Score Analytics
        </h2>
        <p className="text-gray-600 mb-6">Analyze questions based on their score distribution and identify trends.</p>
      
        {analytics.questionAnalytics?.length > 0 ? (
          <div className="space-y-8">
            {/* Score Filter */}
            <div className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-lg border border-indigo-100 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h3 className="font-medium text-indigo-800 mb-1">Filter by Response Score</h3>
                  <p className="text-sm text-indigo-600">Select a specific score to see questions with that response value</p>
                </div>
                <div className="w-full md:w-64">
                  <select 
                    className="w-full px-4 py-2.5 border border-indigo-200 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-200"
                    value={selectedScore}
                    onChange={(e) => setSelectedScore(e.target.value)}
                  >
                    <option value="all">All Scores</option>
                    <option value="1">Score 1 (Strongly Disagree)</option>
                    <option value="2">Score 2 (Disagree)</option>
                    <option value="3">Score 3 (Neutral)</option>
                    <option value="4">Score 4 (Agree)</option>
                    <option value="5">Score 5 (Strongly Agree)</option>
                  </select>
                </div>
              </div>
            </div>
            
            {selectedScore === 'all' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Most Positive Responses */}
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-green-50 border-b border-green-100 px-6 py-4">
                    <h3 className="text-lg font-semibold text-green-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                      Most Positive Responses
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      {mostPositive.length > 0 ? mostPositive.map((q, idx) => (
                        <div key={`positive-${idx}`} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-base font-medium text-gray-800 pr-4">{q.question}</h4>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold whitespace-nowrap">
                              Avg: {q.averageScore?.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm mb-3">
                            <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-xs font-medium">{q.category}</span>
                            <span className="text-gray-600">
                              <span className="font-medium text-green-600">{q.distribution?.['4']?.count || 0}</span> strongly agree
                            </span>
                          </div>
                          <div className="mt-2 flex items-center">
                            <div className="flex-grow">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, ((q.averageScore / 5) * 100))}%` }}></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Low</span>
                                <span>High</span>
                              </div>
                            </div>
                            <div className="ml-4 text-xl font-bold text-green-600">{Math.round((q.averageScore / 5) * 100)}%</div>
                          </div>
                        </div>
                      )) : (
                        <p className="text-gray-500 italic p-4 text-center">No positive response data available.</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Most Negative Responses */}
                <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  <div className="bg-red-50 border-b border-red-100 px-6 py-4">
                    <h3 className="text-lg font-semibold text-red-800 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                      Most Negative Responses
                    </h3>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      {mostNegative.length > 0 ? mostNegative.map((q, idx) => (
                        <div key={`negative-${idx}`} className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="text-base font-medium text-gray-800 pr-4">{q.question}</h4>
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold whitespace-nowrap">
                              Avg: {q.averageScore?.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-sm mb-3">
                            <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-xs font-medium">{q.category}</span>
                            <span className="text-gray-600">
                              <span className="font-medium text-red-600">{q.distribution?.['1']?.count || 0}</span> strongly disagree
                            </span>
                          </div>
                          <div className="mt-2 flex items-center">
                            <div className="flex-grow">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                                <div className="bg-red-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, ((q.averageScore / 5) * 100))}%` }}></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500">
                                <span>Low</span>
                                <span>High</span>
                              </div>
                            </div>
                            <div className="ml-4 text-xl font-bold text-red-600">{Math.round((q.averageScore / 5) * 100)}%</div>
                          </div>
                        </div>
                      )) : (
                        <p className="text-gray-500 italic p-4 text-center">No negative response data available.</p>
                      )}
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <section className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <div className={`px-6 py-4 border-b ${
                  selectedScore === '1' ? 'bg-red-50 border-red-100' : 
                  selectedScore === '2' ? 'bg-orange-50 border-orange-100' :
                  selectedScore === '3' ? 'bg-yellow-50 border-yellow-100' :
                  selectedScore === '4' ? 'bg-blue-50 border-blue-100' :
                  'bg-green-50 border-green-100'
                }`}>
                  <h3 className="text-lg font-semibold flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                    </svg>
                    <span className={`${                              selectedScore === '1' ? 'text-red-800' : 
                              selectedScore === '2' ? 'text-orange-800' :
                              selectedScore === '3' ? 'text-yellow-800' :
                              selectedScore === '4' ? 'text-blue-800' :
                              'text-green-800'
                    }`}>
                      Questions with Score {selectedScore} ({getScoreLabel(selectedScore)})
                    </span>
                  </h3>
                </div>
                <div className="p-5">
                  {filteredQuestions.length > 0 ? (
                    <div className="space-y-6">
                      {filteredQuestions.map((q, idx) => (
                        <div 
                          key={`filtered-${idx}`} 
                          className="p-5 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4">
                            <h4 className="text-base font-medium text-gray-800">{q.question}</h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${
                                selectedScore === '1' ? 'bg-red-100 text-red-800' : 
                                selectedScore === '2' ? 'bg-orange-100 text-orange-800' :
                                selectedScore === '3' ? 'bg-yellow-100 text-yellow-800' :
                                selectedScore === '4' ? 'bg-blue-100 text-blue-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {getScoreLabel(selectedScore)}: {q.distribution[selectedScore]?.count || 0}
                              </span>
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                                Avg: {q.averageScore?.toFixed(2)}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-xs font-medium">{q.category}</span>
                            <span className="text-gray-600 text-sm">
                              Total responses: {Object.values(q.distribution || {}).reduce((sum, val) => sum + (val.count || 0), 0)}
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
                                    <div className="w-full bg-gray-200 rounded-t-sm h-32 flex flex-col-reverse">
                                      <div 
                                        className={`w-full ${
                                          score === 1 ? 'bg-red-500' : 
                                          score === 2 ? 'bg-orange-500' : 
                                          score === 3 ? 'bg-yellow-500' : 
                                          score === 4 ? 'bg-blue-500' : 
                                          'bg-green-500'
                                        } ${parseInt(selectedScore) === score ? 'ring-2 ring-indigo-400' : ''}`} 
                                        style={{ 
                                          height: `${Math.max(5, percentage)}%`,
                                          opacity: parseInt(selectedScore) === score ? 1 : 0.7
                                        }}
                                      ></div>
                                    </div>
                                    <div className="mt-2 text-center">
                                      <div className="text-xs font-medium">{getScoreLabel(score.toString())[0]}</div>
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
                    <div className="p-8 text-center">
                      <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      <p className="text-gray-500 mb-1">No questions found with score {selectedScore} responses.</p>
                      <p className="text-sm text-gray-400">Try selecting a different score value.</p>
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-10 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            <p className="text-lg font-medium text-gray-500 mb-2">No score analysis data available</p>
            <p className="text-sm text-gray-400">There are no survey responses to analyze at this time.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreAnalytics;
