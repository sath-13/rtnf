import React from 'react';

const ToggleCheckboxAnalytics = ({ analytics }) => {
  if (!analytics || !analytics.toggleQuestions || !analytics.checkboxQuestions) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500">No toggle or checkbox data available.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
          <span className="mr-3 text-indigo-500">🔘</span>
          Toggle & Checkbox Analytics
        </h2>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 rounded-lg border border-indigo-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-indigo-800 uppercase tracking-wider">Toggle Questions</h3>
              <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <p className="text-3xl font-bold text-indigo-800">{analytics.toggleQuestions.count}</p>
            <div className="mt-2 text-sm text-indigo-600">Positive rate: {analytics.toggleQuestions.positivePercentage}%</div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-lg border border-emerald-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-emerald-800 uppercase tracking-wider">Checkbox Questions</h3>
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
              </svg>
            </div>
            <p className="text-3xl font-bold text-emerald-800">{analytics.checkboxQuestions.count}</p>
            <div className="mt-2 text-sm text-emerald-600">
              {analytics.checkboxQuestions.topChoices?.length || 0} questions analyzed
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-6 rounded-lg border border-amber-200 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider">Total Responses</h3>
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
            </div>
            <p className="text-3xl font-bold text-amber-800">{analytics.totalResponses}</p>
            <div className="mt-2 text-sm text-amber-600">Participants</div>
          </div>
        </div>

        {/* Toggle Questions Section */}
        {analytics.toggleQuestions.questions.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Toggle Questions</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.toggleQuestions.questions.map((question, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
                  <p className="text-sm text-gray-500 mb-4">Category: {question.category}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div className={`rounded-lg p-3 ${question.percentages.true > 50 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      <div className="text-xs uppercase tracking-wider mb-1">True</div>
                      <div className="flex justify-between">
                        <span className="text-xl font-bold">{question.responses.true}</span>
                        <span className="text-lg">{question.percentages.true}%</span>
                      </div>
                    </div>
                    
                    <div className={`rounded-lg p-3 ${question.percentages.false > 50 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
                      <div className="text-xs uppercase tracking-wider mb-1">False</div>
                      <div className="flex justify-between">
                        <span className="text-xl font-bold">{question.responses.false}</span>
                        <span className="text-lg">{question.percentages.false}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="h-6 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full" 
                      style={{ width: `${question.percentages.true}%` }}
                    ></div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500 text-right">
                    {question.totalResponses} responses
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Checkbox Questions Section */}
        {analytics.checkboxQuestions.questions.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Checkbox Questions</h3>
            
            <div className="grid grid-cols-1 gap-8">
              {analytics.checkboxQuestions.questions.map((question, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h4 className="font-medium text-gray-900 mb-2">{question.question}</h4>
                  <p className="text-sm text-gray-500 mb-4">Category: {question.category}</p>
                  
                  <div className="mb-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">Response Distribution</div>
                    
                    {question.options.sort((a, b) => b.percentage - a.percentage).map((option, optIdx) => (
                      <div key={optIdx} className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{option.name}</span>
                          <span>{option.percentage}% ({option.count})</span>
                        </div>
                        <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full" 
                            style={{ width: `${option.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 text-right">
                    {question.totalResponders} total responders
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Choices Section */}
        {analytics.checkboxQuestions.topChoices?.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Most & Least Selected Options</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analytics.checkboxQuestions.topChoices.map((item, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h4 className="font-medium text-gray-900 mb-2">{item.question}</h4>
                  <p className="text-sm text-gray-500 mb-4">Category: {item.category} ({item.optionCount} options)</p>
                  
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-emerald-700 mb-2">Top 3 Choices:</h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {item.topChoices.map((choice, choiceIdx) => (
                        <li key={choiceIdx} className="text-sm">
                          <span className="font-medium">{choice.name}</span>: {choice.percentage}% ({choice.count})
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {item.leastChoices.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-red-700 mb-2">Least Selected:</h5>
                      <ul className="list-disc pl-5 space-y-1">
                        {item.leastChoices.map((choice, choiceIdx) => (
                          <li key={choiceIdx} className="text-sm">
                            <span className="font-medium">{choice.name}</span>: {choice.percentage}% ({choice.count})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Response Rates */}
        {Object.keys(analytics.categoryResponseRates).length > 0 && (
          <div>
            <h3 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">Category Response Rates</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analytics.categoryResponseRates).map(([category, data], idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white p-2 rounded">
                      <div className="text-xs text-gray-500">Questions</div>
                      <div className="font-bold">{data.totalQuestions}</div>
                    </div>
                    <div className="bg-white p-2 rounded">
                      <div className="text-xs text-gray-500">Avg. Responders</div>
                      <div className="font-bold">{data.averageResponders}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToggleCheckboxAnalytics;
