// 대시보드 페이지
// 실시간 현황, 참여자 인사이트, 설문 관리 바로가기

import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { motion } from 'framer-motion';
import StatCard from '../components/admin/StatCard';
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

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalSurveys: 0,
    totalResponses: 0,
    activeSurveys: 0,
    avgResponseRate: 0,
    // 추가: 상태별 설문 수
    scheduledSurveys: 0,
    pausedSurveys: 0,
    completedSurveys: 0,
    // 추가: 평균 소요시간 (초)
    avgCompletionTime: 0,
  });
  const [surveys, setSurveys] = useState([]);
  const [responseTrend, setResponseTrend] = useState(null);
  const [surveyPerformance, setSurveyPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  // 추가: 실시간 접속자 수 (간단한 폴링 방식)
  const [activeUsers, setActiveUsers] = useState(0);
  const [dailyActiveUsers, setDailyActiveUsers] = useState(0);

  useEffect(() => {
    fetchDashboardData();
    // 추가: 실시간 접속자 수 폴링 (30초마다)
    const interval = setInterval(() => {
      fetchActiveUsers();
    }, 30000);
    fetchActiveUsers(); // 초기 로드
    
    return () => clearInterval(interval);
  }, []);
  
  // 추가: 실시간 접속자 수 조회
  const fetchActiveUsers = async () => {
    try {
      // 백엔드 API가 없을 경우를 대비한 폴백
      // 실제로는 /api/stats/active-users 같은 엔드포인트를 호출
      const stored = localStorage.getItem('activeUsers');
      if (stored) {
        const data = JSON.parse(stored);
        setActiveUsers(data.current || 0);
        setDailyActiveUsers(data.daily || 0);
      } else {
        // 모의 데이터 (실제 API 연동 시 제거)
        setActiveUsers(Math.floor(Math.random() * 50) + 10);
        setDailyActiveUsers(Math.floor(Math.random() * 200) + 100);
      }
    } catch (err) {
      console.log('접속자 수 조회 실패:', err);
    }
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/surveys');
      const surveysData = response.data.success 
        ? (response.data.data || [])
        : (Array.isArray(response.data) ? response.data : []);
      
      setSurveys(surveysData);
      
      const totalSurveys = surveysData.length;
      const activeSurveys = surveysData.filter(s => s.status === 'active').length;
      // 추가: 상태별 설문 수 계산
      const scheduledSurveys = surveysData.filter(s => s.status === 'scheduled').length;
      const pausedSurveys = surveysData.filter(s => s.status === 'paused').length;
      const completedSurveys = surveysData.filter(s => s.status === 'completed' || (s.endAt && new Date(s.endAt) < new Date())).length;
      
      // 각 설문의 응답 수 가져오기 및 평균 소요시간 계산
      let totalResponses = 0;
      let totalCompletionTime = 0;
      let completedResponseCount = 0;
      const responseCounts = [];
      
      for (const survey of surveysData) {
        try {
          const resultRes = await axiosInstance.get(`/surveys/${survey._id || survey.id}/results`);
          const resultData = resultRes.data;
          const count = resultData.success 
            ? (resultData.data?.totalResponses || resultData.totalResponses || (resultData.data?.results?.length || resultData.results?.length || 0))
            : (resultData.totalResponses || resultData.results?.length || 0);
          totalResponses += count;
          responseCounts.push({
            title: survey.title,
            count: count
          });
          
          // 추가: 평균 소요시간 계산
          const responses = resultData.success 
            ? (resultData.data?.results || resultData.results || [])
            : (resultData.results || []);
          
          responses.forEach(response => {
            if (response.startedAt && response.submittedAt) {
              try {
                const startTime = new Date(response.startedAt).getTime();
                const endTime = new Date(response.submittedAt).getTime();
                const duration = (endTime - startTime) / 1000; // 초 단위
                if (duration > 0 && duration < 3600) { // 1시간 이내만 유효한 것으로 간주
                  totalCompletionTime += duration;
                  completedResponseCount++;
                }
              } catch (timeErr) {
                // 시간 계산 실패 시 무시
              }
            }
          });
        } catch (err) {
          console.log(`설문 ${survey._id || survey.id} 응답 수 조회 실패:`, err);
        }
      }
      
      const avgResponseRate = totalSurveys > 0 
        ? Math.round((totalResponses / (totalSurveys * 10)) * 100)
        : 0;
      
      // 추가: 평균 소요시간 계산 (분:초 형식)
      const avgCompletionTime = completedResponseCount > 0
        ? Math.round(totalCompletionTime / completedResponseCount)
        : 0;

      setStats({
        totalSurveys,
        totalResponses,
        activeSurveys,
        avgResponseRate,
        scheduledSurveys,
        pausedSurveys,
        completedSurveys,
        avgCompletionTime,
      });
      
      // 응답 추이 데이터 생성
      const trendData = await generateResponseTrend(surveysData);
      setResponseTrend(trendData);
      
      // 설문별 성과 데이터 생성
      const performanceData = generateSurveyPerformance(responseCounts);
      setSurveyPerformance(performanceData);
    } catch (err) {
      console.error('대시보드 데이터 로드 실패:', err);
      setMessage({ type: 'error', text: '데이터를 불러오는 중 오류가 발생했습니다.' });
    } finally {
      setLoading(false);
    }
  };

  const generateResponseTrend = async (surveysData) => {
    const days = [];
    const counts = [];
    const responseMap = new Map();
    
    // 최근 7일 날짜 배열 생성 (오늘 포함)
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식
      days.push(dateStr);
      responseMap.set(dateStr, 0); // 초기값 0으로 설정
    }
    
    // 각 설문의 응답 데이터 수집
    const processedResponseIds = new Set(); // 중복 방지를 위한 Set
    
    for (const survey of surveysData) {
      try {
        const resultRes = await axiosInstance.get(`/surveys/${survey._id || survey.id}/results`);
        const resultData = resultRes.data;
        const responses = resultData.success 
          ? (resultData.data?.results || resultData.results || [])
          : (resultData.results || []);
        
        responses.forEach(response => {
          // 응답 ID로 중복 체크
          const responseId = response._id || response.id || `${survey._id}_${response.submittedAt}`;
          if (processedResponseIds.has(responseId)) {
            return; // 이미 처리된 응답은 건너뛰기
          }
          processedResponseIds.add(responseId);
          
          // submittedAt이 있는 경우에만 처리
          if (response.submittedAt) {
            try {
              const submittedDate = new Date(response.submittedAt);
              
              // 유효한 날짜인지 확인
              if (isNaN(submittedDate.getTime())) {
                return; // 유효하지 않은 날짜는 건너뛰기
              }
              
              // 날짜를 YYYY-MM-DD 형식으로 변환 (로컬 시간 기준)
              const year = submittedDate.getFullYear();
              const month = String(submittedDate.getMonth() + 1).padStart(2, '0');
              const day = String(submittedDate.getDate()).padStart(2, '0');
              const responseDate = `${year}-${month}-${day}`;
              
              // 최근 7일 범위 내에 있는지 확인
              if (responseMap.has(responseDate)) {
                const currentCount = responseMap.get(responseDate) || 0;
                responseMap.set(responseDate, currentCount + 1);
              }
            } catch (dateError) {
              console.warn('날짜 파싱 실패:', response.submittedAt, dateError);
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
        const date = new Date(d + 'T00:00:00'); // 시간을 명시적으로 설정
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

  const handleCopyLink = async (surveyId) => {
    try {
      const surveyUrl = `${window.location.origin}/surveys/${surveyId}`;
      await navigator.clipboard.writeText(surveyUrl);
      setMessage({ type: 'success', text: '링크가 클립보드에 복사되었습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: '링크 복사에 실패했습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDownloadCSV = async (surveyId) => {
    try {
      const response = await axiosInstance.get(`/surveys/${surveyId}/results`);
      const resultData = response.data;
      const results = resultData.success 
        ? (resultData.data?.results || resultData.results || [])
        : (resultData.results || []);
      
      if (results.length === 0) {
        setMessage({ type: 'info', text: '다운로드할 데이터가 없습니다.' });
        return;
      }

      // CSV 생성
      const headers = ['응답 ID', '제출일시'];
      const rows = results.map((r, idx) => [
        r._id || r.id || `response_${idx}`,
        r.submittedAt || new Date().toISOString()
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `survey_${surveyId}_results.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setMessage({ type: 'success', text: 'CSV 파일이 다운로드되었습니다.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('CSV 다운로드 실패:', err);
      setMessage({ type: 'error', text: 'CSV 다운로드에 실패했습니다.' });
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
        <h1 className="text-3xl font-bold text-text-main mb-2">대시보드</h1>
        <p className="text-text-sub">설문 운영 현황을 한눈에 확인하세요</p>
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

      {/* 통계 카드 - 기존 4개 유지 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* 추가: 상태별 설문 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="진행 중" 
          value={stats.activeSurveys} 
          icon="▶️" 
          color="green" 
          delay={0.4}
        />
        <StatCard 
          title="예약됨" 
          value={stats.scheduledSurveys} 
          icon="📅" 
          color="blue" 
          delay={0.5}
        />
        <StatCard 
          title="완료" 
          value={stats.completedSurveys} 
          icon="✅" 
          color="purple" 
          delay={0.6}
        />
      </div>

      {/* 추가: 접속자 및 소요시간 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          className="bg-white rounded-xl shadow-md p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-sub mb-1">실시간 접속자</p>
              <p className="text-2xl font-bold text-text-main">{activeUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <p className="text-xs text-text-sub mt-2">1일 누적: {dailyActiveUsers}명</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.8 }}
          className="bg-white rounded-xl shadow-md p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-sub mb-1">평균 소요시간</p>
              <p className="text-2xl font-bold text-text-main">
                {stats.avgCompletionTime > 0 
                  ? `${Math.floor(stats.avgCompletionTime / 60)}분 ${stats.avgCompletionTime % 60}초`
                  : '데이터 없음'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
              <span className="text-2xl">⏱️</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.9 }}
          className="bg-white rounded-xl shadow-md p-4"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-sub mb-1">일시 정지</p>
              <p className="text-2xl font-bold text-text-main">{stats.pausedSurveys}</p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-amber-100 flex items-center justify-center">
              <span className="text-2xl">⏸️</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 차트 영역 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {responseTrend && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <h3 className="text-lg font-bold text-text-main mb-4">최근 7일 응답 추이</h3>
            <Line data={responseTrend} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              }
            }} />
          </motion.div>
        )}

        {surveyPerformance && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-md p-4"
          >
            <h3 className="text-lg font-bold text-text-main mb-4">설문별 성과</h3>
            <Bar data={surveyPerformance} options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              }
            }} />
          </motion.div>
        )}
      </div>

      {/* 최근 설문 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-text-main">최근 설문</h3>
          <Link 
            to="/admin"
            className="text-sm text-primary hover:text-primary-hover font-medium"
          >
            전체 보기 →
          </Link>
        </div>
        {surveys.length === 0 ? (
          <div className="text-center py-8 text-text-sub">
            <p>아직 생성된 설문이 없습니다.</p>
            <Link 
              to="/admin/builder"
              className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              설문 만들기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {surveys.slice(0, 5).map((survey) => (
              <div 
                key={survey._id || survey.id}
                className="flex items-center justify-between p-3 bg-bg rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-text-main truncate">{survey.title}</h4>
                  <p className="text-sm text-text-sub">
                    {survey.status === 'active' ? '활성' : survey.status === 'paused' ? '일시정지' : '비활성'}
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/builder/${survey._id || survey.id}`)}
                    className="px-3 py-1.5 text-xs bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                  >
                    편집
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/results/${survey._id || survey.id}`)}
                    className="px-3 py-1.5 text-xs bg-bg border border-border rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    결과
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLink(survey._id || survey.id)}
                    className="px-3 py-1.5 text-xs bg-bg border border-border rounded-lg hover:bg-primary/10 transition-colors"
                  >
                    링크
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

