// Theme V2 분석 대시보드
// Recharts 사용, 개선된 UI

import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import StatCard from '../components/admin/StatCard';

const COLORS = ['#6B46C1', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

export default function SurveyResultsV2() {
  const { id } = useParams();
  const [survey, setSurvey] = useState(null);
  const [results, setResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('insights'); // 'insights', 'responses', 'period', 'dropoff'

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [surveyRes, resultRes] = await Promise.all([
          axiosInstance.get(`/surveys/${id}`),
          axiosInstance.get(`/surveys/${id}/results`),
        ]);

        const surveyData = surveyRes.data.success?.data || surveyRes.data;
        setSurvey(surveyData);

        const resultData = resultRes.data.success?.data || resultRes.data;
        const responses = resultData.results || resultData || [];
        setResults({ results: responses });
        setFilteredResults(responses);
      } catch (err) {
        console.error('데이터 불러오기 오류:', err);
        setResults({ results: [] });
        setFilteredResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  useEffect(() => {
    if (!results?.results) return;
    if (!startDate && !endDate) {
      setFilteredResults(results.results);
      return;
    }

    const filtered = results.results.filter((r) => {
      const date = new Date(r.submittedAt);
      const afterStart = startDate ? date >= new Date(startDate) : true;
      const beforeEnd = endDate ? date <= new Date(endDate) : true;
      return afterStart && beforeEnd;
    });

    setFilteredResults(filtered);
  }, [startDate, endDate, results]);

  // 통계 계산
  const stats = {
    totalResponses: filteredResults.length,
    completionRate: survey?.questions?.length > 0 
      ? Math.round((filteredResults.length / (filteredResults.length + 10)) * 100) 
      : 0,
    averageTime: '1:40',
    linkClicks: '***',
    conversionRate: '***',
    shareClicks: '***',
  };

  // 질문별 데이터 집계
  const getQuestionData = (question) => {
    if (!question || !filteredResults.length) return null;

    const questionId = question._id || question.id;
    const answers = filteredResults
      .map(r => r.answers?.[questionId])
      .filter(a => a !== undefined && a !== null);

    const questionType = (question.type || '').toUpperCase();

    if (['RADIO', 'CHECKBOX', 'DROPDOWN', 'YES_NO'].includes(questionType)) {
      const counts = {};
      answers.forEach(answer => {
        if (Array.isArray(answer)) {
          answer.forEach(opt => {
            counts[opt] = (counts[opt] || 0) + 1;
          });
        } else {
          counts[answer] = (counts[answer] || 0) + 1;
        }
      });

      return Object.entries(counts).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / answers.length) * 100),
      }));
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">응답 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600">설문을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  const questions = survey.questions || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{survey.title}</h1>
          <p className="text-gray-600">응답 결과 및 분석</p>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard title="참여" value={stats.totalResponses} icon="👥" color="purple" delay={0} />
          <StatCard title="완료" value={`${stats.completionRate}%`} icon="✅" color="green" delay={0.1} />
          <StatCard title="평균 세션시간" value={stats.averageTime} icon="⏱️" color="orange" delay={0.2} />
          <StatCard title="링크 클릭 수" value={stats.linkClicks} icon="🖱️" color="blue" delay={0.3} />
          <StatCard title="전환율(CTR)" value={stats.conversionRate} icon="📈" color="red" delay={0.4} />
          <StatCard title="공유버튼 클릭" value={stats.shareClicks} icon="🔗" color="blue" delay={0.5} />
        </div>

        {/* 필터 */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작일</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-500"
              />
            </div>
            <div className="ml-auto">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'insights', label: '질문별 인사이트' },
                { id: 'responses', label: '응답별 데이터' },
                { id: 'period', label: '기간별 인사이트' },
                { id: 'dropoff', label: '질문별 이탈률' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setViewMode(tab.id)}
                  className={`
                    px-6 py-4 text-sm font-medium border-b-2 transition-colors
                    ${viewMode === tab.id
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {viewMode === 'insights' && (
              <div className="space-y-6">
                {questions.map((question, idx) => {
                  const data = getQuestionData(question);
                  if (!data || data.length === 0) return null;

                  return (
                    <div key={question._id || question.id || idx} className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Q{idx + 1}. {question.title || question.text || question.content}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={data}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percentage }) => `${name}: ${percentage}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#6B46C1" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'responses' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        날짜
                      </th>
                      {questions.map((q, idx) => (
                        <th key={q._id || q.id || idx} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Q{idx + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredResults.map((response, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(response.submittedAt).toLocaleString('ko-KR')}
                        </td>
                        {questions.map((q) => {
                          const questionId = q._id || q.id;
                          const answer = response.answers?.[questionId];
                          return (
                            <td key={questionId} className="px-6 py-4 text-sm text-gray-700">
                              {Array.isArray(answer) ? answer.join(', ') : String(answer || '-')}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



