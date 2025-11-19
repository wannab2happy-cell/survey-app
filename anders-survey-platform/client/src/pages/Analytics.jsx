// 분석 페이지
// 설문 응답 통계 및 차트 표시

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { motion } from 'framer-motion';
import StatCard from '../components/admin/StatCard';
import CustomSelect from '../components/ui/CustomSelect';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

export default function Analytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0,
    avgResponseRate: 0,
  });
  const [surveys, setSurveys] = useState([]);
  const [responseTrend, setResponseTrend] = useState(null);
  const [surveyPerformance, setSurveyPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  // 추가: 필터링 상태
  const [selectedSurveyId, setSelectedSurveyId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/surveys');
        const allSurveysData = response.data.success 
          ? (response.data.data || [])
          : (Array.isArray(response.data) ? response.data : []);
        
        // 전체 설문 목록 저장 (필터 UI용)
        setSurveys(allSurveysData);
        
        // 필터 적용된 설문 데이터
        let surveysData = [...allSurveysData];
        if (selectedSurveyId && selectedSurveyId !== 'all') {
          surveysData = surveysData.filter(s => (s._id || s.id) === selectedSurveyId);
        }
        
        const totalSurveys = surveysData.length;
        const activeSurveys = surveysData.filter(s => s.status === 'active').length;
        
        // 각 설문의 응답 수 가져오기 (날짜 필터 적용)
        let totalResponses = 0;
        const responseCounts = [];
        
        for (const survey of surveysData) {
          try {
            const resultRes = await axiosInstance.get(`/surveys/${survey._id || survey.id}/results`);
            const resultData = resultRes.data;
            let responses = resultData.success 
              ? (resultData.data?.results || resultData.results || [])
              : (resultData.results || []);
            
            // 날짜 필터 적용
            if (startDate || endDate) {
              responses = responses.filter(r => {
                if (!r.submittedAt) return false;
                const date = new Date(r.submittedAt);
                const afterStart = startDate ? date >= new Date(startDate) : true;
                const beforeEnd = endDate ? date <= new Date(endDate + 'T23:59:59') : true;
                return afterStart && beforeEnd;
              });
            }
            
            const count = responses.length;
            totalResponses += count;
            responseCounts.push({
              title: survey.title,
              count: count
            });
          } catch (err) {
            console.log(`설문 ${survey._id || survey.id} 응답 수 조회 실패:`, err);
          }
        }
        
        const avgResponseRate = totalSurveys > 0 
          ? Math.round((totalResponses / (totalSurveys * 10)) * 100) // 가정: 설문당 평균 10명 타겟
          : 0;

        setStats({
          totalSurveys,
          totalResponses,
          activeSurveys,
          avgResponseRate,
        });
        
        // 응답 추이 데이터 생성 (최근 7일) - 실제 데이터 기반 (필터 적용)
        const trendData = await generateResponseTrend(surveysData, startDate, endDate);
        setResponseTrend(trendData);
        
        // 설문별 성과 데이터 생성
        const performanceData = generateSurveyPerformance(responseCounts);
        setSurveyPerformance(performanceData);
      } catch (err) {
        console.error('통계 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [selectedSurveyId, startDate, endDate]);
  
  // 응답 추이 데이터 생성 (실제 응답 데이터 기반, 날짜 필터 지원)
  const generateResponseTrend = async (surveysData, filterStartDate, filterEndDate) => {
    const days = [];
    const counts = [];
    const responseMap = new Map(); // 날짜별 응답 수 저장
    
    // 날짜 범위 결정
    let startDay = new Date();
    let endDay = new Date();
    
    if (filterStartDate) {
      startDay = new Date(filterStartDate);
    } else {
      startDay.setDate(startDay.getDate() - 6); // 최근 7일
    }
    
    if (filterEndDate) {
      endDay = new Date(filterEndDate);
    }
    
    // 날짜 배열 생성
    const currentDate = new Date(startDay);
    while (currentDate <= endDay) {
      const dateStr = currentDate.toISOString().split('T')[0];
      days.push(dateStr);
      responseMap.set(dateStr, 0);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // 최근 7일 범위로 제한 (필터가 없을 경우)
    if (!filterStartDate && !filterEndDate) {
      const days7 = [];
      const counts7 = [];
      const responseMap7 = new Map();
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        days7.push(dateStr);
        responseMap7.set(dateStr, 0);
      }
      
      // 각 설문의 응답 데이터에서 날짜별 집계
      for (const survey of surveysData) {
        try {
          const resultRes = await axiosInstance.get(`/surveys/${survey._id || survey.id}/results`);
          const resultData = resultRes.data;
          let responses = resultData.success 
            ? (resultData.data?.results || resultData.results || [])
            : (resultData.results || []);
          
          responses.forEach(response => {
            if (response.submittedAt) {
              const responseDate = new Date(response.submittedAt).toISOString().split('T')[0];
              if (responseMap7.has(responseDate)) {
                responseMap7.set(responseDate, responseMap7.get(responseDate) + 1);
              }
            }
          });
        } catch (err) {
          console.log(`설문 ${survey._id || survey.id} 응답 데이터 조회 실패:`, err);
        }
      }
      
      days7.forEach(day => {
        counts7.push(responseMap7.get(day) || 0);
      });
      
      return {
        labels: days7.map(d => {
          const date = new Date(d);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
        datasets: [{
          label: '일일 응답 수',
          data: counts7,
          borderColor: 'var(--primary)',
          backgroundColor: 'rgba(38, 198, 218, 0.1)',
          tension: 0.4,
          fill: true,
        }]
      };
    }
    
    // 날짜 필터가 있는 경우
    for (const survey of surveysData) {
      try {
        const resultRes = await axiosInstance.get(`/surveys/${survey._id || survey.id}/results`);
        const resultData = resultRes.data;
        let responses = resultData.success 
          ? (resultData.data?.results || resultData.results || [])
          : (resultData.results || []);
        
        // 날짜 필터 적용
        if (filterStartDate || filterEndDate) {
          responses = responses.filter(r => {
            if (!r.submittedAt) return false;
            const date = new Date(r.submittedAt);
            const afterStart = filterStartDate ? date >= new Date(filterStartDate) : true;
            const beforeEnd = filterEndDate ? date <= new Date(filterEndDate + 'T23:59:59') : true;
            return afterStart && beforeEnd;
          });
        }
        
        responses.forEach(response => {
          if (response.submittedAt) {
            const responseDate = new Date(response.submittedAt).toISOString().split('T')[0];
            if (responseMap.has(responseDate)) {
              responseMap.set(responseDate, responseMap.get(responseDate) + 1);
            }
          }
        });
      } catch (err) {
        console.log(`설문 ${survey._id || survey.id} 응답 데이터 조회 실패:`, err);
      }
    }
    
    // 날짜 순서대로 카운트 배열 생성
    days.forEach(day => {
      counts.push(responseMap.get(day) || 0);
    });
    
    return {
      labels: days.map(d => {
        const date = new Date(d);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [{
        label: '일일 응답 수',
        data: counts,
        borderColor: 'var(--primary)',
        backgroundColor: 'rgba(38, 198, 218, 0.1)',
        tension: 0.4,
        fill: true,
      }]
    };
  };
  
  // 설문별 성과 데이터 생성
  const generateSurveyPerformance = (responseCounts) => {
    const sorted = [...responseCounts].sort((a, b) => b.count - a.count).slice(0, 5);
    
    return {
      labels: sorted.map(s => s.title.length > 15 ? s.title.substring(0, 15) + '...' : s.title),
      datasets: [{
        label: '응답 수',
        data: sorted.map(s => s.count),
        backgroundColor: [
          'rgba(38, 198, 218, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(239, 68, 68, 0.7)',
          'rgba(139, 92, 246, 0.7)',
        ],
        borderColor: [
          'rgba(38, 198, 218, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(16, 185, 129, 1)',
          'rgba(239, 68, 68, 1)',
          'rgba(139, 92, 246, 1)',
        ],
        borderWidth: 2,
      }]
    };
  };

  // 추가: PDF 내보내기 (간단한 버전 - 실제로는 jsPDF 라이브러리 사용 권장)
  const handleExportPDF = async () => {
    try {
      setMessage({ type: 'info', text: 'PDF 내보내기 기능은 준비 중입니다. 현재는 CSV 다운로드를 사용해주세요.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      
      // TODO: jsPDF 라이브러리를 사용하여 실제 PDF 생성
      // 현재는 CSV 다운로드로 대체
      const csvContent = [
        '설문 제목,응답 수,상태',
        ...surveys.map(s => `"${s.title}",${s.totalResponses || 0},"${s.status}"`)
      ].join('\n');
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `analytics_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('PDF 내보내기 실패:', err);
      setMessage({ type: 'error', text: '내보내기에 실패했습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-main mb-2">분석 대시보드</h1>
        <p className="text-text-sub">설문 응답 통계 및 인사이트를 확인하세요</p>
      </div>

      {/* 메시지 표시 */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-success/10 border border-success/20 text-success' 
              : message.type === 'info'
              ? 'bg-primary/10 border border-primary/20 text-primary'
              : 'bg-error/10 border border-error/20 text-error'
          }`}
        >
          {message.text}
        </motion.div>
      )}

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="전체 설문" 
          value={stats.totalSurveys} 
          icon="📋" 
          color="purple" 
          delay={0}
        />
        <StatCard 
          title="활성 설문" 
          value={stats.activeSurveys} 
          icon="✅" 
          color="green" 
          delay={0.1}
        />
        <StatCard 
          title="총 응답 수" 
          value={stats.totalResponses} 
          icon="📝" 
          color="blue" 
          delay={0.2}
        />
        <StatCard 
          title="평균 응답률" 
          value={`${stats.avgResponseRate}%`} 
          icon="📈" 
          color="orange" 
          delay={0.3}
        />
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold text-text-main mb-4">응답 추이</h2>
          {responseTrend ? (
            <div className="h-64">
              <Line
                data={responseTrend}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { 
                      display: true, 
                      position: 'top',
                      labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                          size: 12
                        }
                      }
                    },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { 
                        stepSize: 1,
                        font: {
                          size: 11
                        }
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: 11
                        }
                      },
                      grid: {
                        display: false
                      }
                    }
                  },
                  interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-sub">
              <p>데이터를 불러오는 중...</p>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
        >
          <h2 className="text-xl font-bold text-text-main mb-4">설문별 성과</h2>
          {surveyPerformance ? (
            <div className="h-64">
              <Bar
                data={surveyPerformance}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      mode: 'index',
                      intersect: false,
                    }
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: { 
                        stepSize: 1,
                        font: {
                          size: 11
                        }
                      },
                      grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                      }
                    },
                    x: {
                      ticks: {
                        font: {
                          size: 11
                        },
                        maxRotation: 45,
                        minRotation: 45
                      },
                      grid: {
                        display: false
                      }
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-sub">
              <p>데이터를 불러오는 중...</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* 필터링 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-main">필터</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CustomSelect
            label="설문 선택"
            value={selectedSurveyId}
            onChange={(value) => setSelectedSurveyId(value)}
            options={[
              { value: 'all', label: '전체 설문' },
              ...surveys.map(survey => ({
                value: survey._id || survey.id,
                label: survey.title || '제목 없음'
              }))
            ]}
            placeholder="설문을 선택하세요"
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
            />
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleExportPDF}
              className="w-full px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium text-sm border-2 border-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              PDF 내보내기
            </button>
          </div>
        </div>
      </motion.div>

      {/* 인사이트 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-text-main">인사이트</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/15 transition-colors">
            <p className="text-sm text-text-main leading-relaxed">
              <strong className="text-primary font-semibold">활성 설문:</strong> 현재 {stats.activeSurveys}개의 설문이 진행 중입니다.
            </p>
          </div>
          <div className="p-4 bg-success/10 rounded-lg border border-success/20 hover:bg-success/15 transition-colors">
            <p className="text-sm text-text-main leading-relaxed">
              <strong className="text-success font-semibold">총 응답 수:</strong> 지금까지 {stats.totalResponses}개의 응답을 받았습니다.
            </p>
          </div>
          <div className="p-4 bg-secondary/10 rounded-lg border border-secondary/20 hover:bg-secondary/15 transition-colors">
            <p className="text-sm text-text-main leading-relaxed">
              <strong className="text-secondary font-semibold">전체 설문:</strong> 총 {stats.totalSurveys}개의 설문이 생성되었습니다.
            </p>
          </div>
          <div className="p-4 bg-primary/10 rounded-lg border border-primary/20 hover:bg-primary/15 transition-colors">
            <p className="text-sm text-text-main leading-relaxed">
              <strong className="text-primary font-semibold">평균 응답률:</strong> 평균 {stats.avgResponseRate}%의 응답률을 기록하고 있습니다.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}



