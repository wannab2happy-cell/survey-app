// 대시보드 페이지
// 실시간 현황, 참여자 인사이트, 설문 관리 바로가기

import { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { motion } from 'framer-motion';
import CompactStatsBar from '../components/admin/CompactStatsBar';
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

// getStatusConfig 함수 추가
const getStatusConfig = (status) => {
  const configs = {
    active: { 
      label: '활성', 
      bg: 'bg-emerald-100', 
      text: 'text-emerald-700', 
      border: 'border-emerald-300',
      dot: 'bg-emerald-500'
    },
    scheduled: { 
      label: '예약됨', 
      bg: 'bg-blue-100', 
      text: 'text-blue-700', 
      border: 'border-blue-300',
      dot: 'bg-blue-500'
    },
    paused: { 
      label: '일시정지', 
      bg: 'bg-amber-100', 
      text: 'text-amber-700', 
      border: 'border-amber-300',
      dot: 'bg-amber-500'
    },
    inactive: { 
      label: '비활성', 
      bg: 'bg-gray-100', 
      text: 'text-gray-700', 
      border: 'border-gray-300',
      dot: 'bg-gray-400'
    },
    completed: {
      label: '완료',
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-300',
      dot: 'bg-purple-500'
    }
  };
  return configs[status] || configs.inactive;
};

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
  // 추가: 섹션별 로딩 상태
  const [loadingSections, setLoadingSections] = useState({
    stats: true,
    charts: true,
    surveys: true,
  });
  // 추가: 에러 상태
  const [error, setError] = useState(null);
  // 추가: 재시도 횟수
  const [retryCount, setRetryCount] = useState(0);
  // 추가: 필터 상태 (Analytics 기능 통합)
  const [selectedSurveyId, setSelectedSurveyId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt'); // 'title', 'updatedAt', 'responses'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [recentEditedSurveys, setRecentEditedSurveys] = useState([]);
  const [surveyResponseCounts, setSurveyResponseCounts] = useState({});

  useEffect(() => {
    fetchDashboardData();
    fetchRecentEditedSurveys();
    // 추가: 실시간 접속자 수 폴링 (30초마다)
    const interval = setInterval(() => {
      fetchActiveUsers();
    }, 30000);
    fetchActiveUsers(); // 초기 로드
    
    return () => clearInterval(interval);
  }, [selectedSurveyId, startDate, endDate, statusFilter, sortBy, sortOrder]); // 필터 변경 시 데이터 재로드
  
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

  const fetchDashboardData = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }
    setLoadingSections({ stats: true, charts: true, surveys: true });
    
    try {
      // 설문 목록 가져오기
      const response = await axiosInstance.get('/surveys');
      let allSurveysData = response.data.success 
        ? (Array.isArray(response.data.data) ? response.data.data : [])
        : (Array.isArray(response.data) ? response.data : []);
      
      // 데이터 검증
      if (!Array.isArray(allSurveysData)) {
        throw new Error('설문 데이터 형식이 올바르지 않습니다.');
      }
      
      // 필터 적용 (Analytics 기능 통합)
      let surveysData = [...allSurveysData];
      if (selectedSurveyId && selectedSurveyId !== 'all') {
        surveysData = surveysData.filter(s => (s._id || s.id) === selectedSurveyId);
      }
      
      setSurveys(allSurveysData); // 전체 설문 목록 저장 (필터 UI용)
      setLoadingSections(prev => ({ ...prev, surveys: false }));
      
      // 통계 계산 (필터 적용된 데이터 기준)
      const totalSurveys = surveysData.length;
      const activeSurveys = surveysData.filter(s => s?.status === 'active').length;
      const scheduledSurveys = surveysData.filter(s => s?.status === 'scheduled').length;
      const pausedSurveys = surveysData.filter(s => s?.status === 'paused').length;
      const completedSurveys = surveysData.filter(s => s?.status === 'completed' || (s?.endAt && new Date(s.endAt) < new Date())).length;
      
      // 각 설문의 응답 수 가져오기 및 평균 소요시간 계산 (병렬 처리)
      let totalResponses = 0;
      let totalCompletionTime = 0;
      let completedResponseCount = 0;
      const responseCounts = [];
      const errors = [];
      const responseCountMap = {}; // 응답 수 맵 초기화
      
      // 병렬 API 호출로 성능 개선
      const responsePromises = surveysData.map(async (survey) => {
        try {
          const surveyId = survey._id || survey.id;
          if (!surveyId) {
            console.warn('설문 ID가 없습니다:', survey);
            return null;
          }
          
          const resultRes = await axiosInstance.get(`/surveys/${surveyId}/results`);
          const resultData = resultRes.data;
          
          // 데이터 구조 검증
          let responses = resultData.success 
            ? (Array.isArray(resultData.data?.results) ? resultData.data.results : (Array.isArray(resultData.results) ? resultData.results : []))
            : (Array.isArray(resultData.results) ? resultData.results : []);
          
          // 날짜 필터 적용 (Analytics 기능 통합)
          if (startDate || endDate) {
            responses = responses.filter(r => {
              if (!r.submittedAt) return false;
              const date = new Date(r.submittedAt);
              const afterStart = startDate ? date >= new Date(startDate) : true;
              const beforeEnd = endDate ? date <= new Date(endDate + 'T23:59:59') : true;
              return afterStart && beforeEnd;
            });
          }
          
          const count = resultData.success 
            ? (resultData.data?.totalResponses || resultData.totalResponses || responses.length)
            : (resultData.totalResponses || responses.length);
          
          // 응답 수 맵에 저장
          responseCountMap[surveyId] = count || 0;
          
          // 평균 소요시간 계산
          let surveyCompletionTime = 0;
          let surveyCompletedCount = 0;
          
          responses.forEach(response => {
            if (response?.startedAt && response?.submittedAt) {
              try {
                const startTime = new Date(response.startedAt).getTime();
                const endTime = new Date(response.submittedAt).getTime();
                if (isNaN(startTime) || isNaN(endTime)) return;
                
                const duration = (endTime - startTime) / 1000; // 초 단위
                if (duration > 0 && duration < 3600) { // 1시간 이내만 유효한 것으로 간주
                  surveyCompletionTime += duration;
                  surveyCompletedCount++;
                }
              } catch (timeErr) {
                console.warn('시간 계산 실패:', timeErr);
              }
            }
          });
          
          return {
            title: survey.title || '제목 없음',
            count: count || 0,
            completionTime: surveyCompletionTime,
            completedCount: surveyCompletedCount,
          };
        } catch (err) {
          console.warn(`설문 ${survey._id || survey.id} 응답 수 조회 실패:`, err);
          errors.push({
            surveyId: survey._id || survey.id,
            title: survey.title || '제목 없음',
            error: err.message || '알 수 없는 오류',
          });
          return null;
        }
      });
      
      const results = await Promise.all(responsePromises);
      
      // 결과 집계
      results.forEach(result => {
        if (result) {
          totalResponses += result.count;
          responseCounts.push({
            title: result.title,
            count: result.count,
          });
          totalCompletionTime += result.completionTime;
          completedResponseCount += result.completedCount;
        }
      });
      
      // 응답 수 맵 저장
      setSurveyResponseCounts(responseCountMap);
      
      // 에러가 있지만 일부 데이터는 성공한 경우 경고 메시지
      if (errors.length > 0 && results.some(r => r !== null)) {
        console.warn(`${errors.length}개 설문의 응답 데이터를 가져오지 못했습니다.`);
      }
      
      const avgResponseRate = totalSurveys > 0 
        ? Math.round((totalResponses / Math.max(totalSurveys * 10, 1)) * 100)
        : 0;
      
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
      setLoadingSections(prev => ({ ...prev, stats: false }));
      
      // 응답 추이 데이터 생성 (날짜 필터 적용)
      try {
        const trendData = await generateResponseTrend(surveysData, startDate, endDate);
        setResponseTrend(trendData);
        setLoadingSections(prev => ({ ...prev, charts: false }));
      } catch (trendErr) {
        console.error('응답 추이 데이터 생성 실패:', trendErr);
        setLoadingSections(prev => ({ ...prev, charts: false }));
      }
      
      // 설문별 성과 데이터 생성
      try {
        const performanceData = generateSurveyPerformance(responseCounts);
        setSurveyPerformance(performanceData);
      } catch (perfErr) {
        console.error('설문별 성과 데이터 생성 실패:', perfErr);
      }
      
      // 성공 시 에러 및 재시도 카운트 초기화
      setError(null);
      setRetryCount(0);
      
    } catch (err) {
      console.error('대시보드 데이터 로드 실패:', err);
      const errorMessage = err.response?.data?.message || err.message || '데이터를 불러오는 중 오류가 발생했습니다.';
      setError(errorMessage);
      setMessage({ 
        type: 'error', 
        text: `${errorMessage} ${retryCount < 3 ? '(재시도 가능)' : ''}` 
      });
      setLoadingSections({ stats: false, charts: false, surveys: false });
    } finally {
      setLoading(false);
    }
  };
  
  // 재시도 함수
  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      fetchDashboardData(true);
    } else {
      setMessage({ 
        type: 'error', 
        text: '최대 재시도 횟수를 초과했습니다. 페이지를 새로고침해주세요.' 
      });
    }
  };

  const generateResponseTrend = async (surveysData, filterStartDate, filterEndDate) => {
    const days = [];
    const counts = [];
    const responseMap = new Map();
    
    // 날짜 범위 결정 (필터 적용)
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
    currentDate.setHours(0, 0, 0, 0);
    
    // 최근 7일 범위로 제한 (필터가 없을 경우)
    if (!filterStartDate && !filterEndDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        days.push(dateStr);
        responseMap.set(dateStr, 0);
      }
    } else {
      // 필터가 있는 경우 날짜 범위에 따라 생성
      while (currentDate <= endDay) {
        const dateStr = currentDate.toISOString().split('T')[0];
        days.push(dateStr);
        responseMap.set(dateStr, 0);
        currentDate.setDate(currentDate.getDate() + 1);
      }
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
        
        // 날짜 필터 적용
        let filteredResponses = responses;
        if (filterStartDate || filterEndDate) {
          filteredResponses = responses.filter(r => {
            if (!r.submittedAt) return false;
            const date = new Date(r.submittedAt);
            const afterStart = filterStartDate ? date >= new Date(filterStartDate) : true;
            const beforeEnd = filterEndDate ? date <= new Date(filterEndDate + 'T23:59:59') : true;
            return afterStart && beforeEnd;
          });
        }
        
        filteredResponses.forEach(response => {
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
              
              // 날짜 범위 내에 있는지 확인
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

  // 최근 편집 설문 가져오기
  const fetchRecentEditedSurveys = async () => {
    try {
      const response = await axiosInstance.get('/surveys');
      let allSurveysData = response.data.success 
        ? (Array.isArray(response.data.data) ? response.data.data : [])
        : (Array.isArray(response.data) ? response.data : []);
      
      // 최근 수정일 기준으로 정렬
      const sorted = allSurveysData
        .filter(s => s.updatedAt || s.createdAt)
        .sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        })
        .slice(0, 5);
      
      setRecentEditedSurveys(sorted);
    } catch (err) {
      console.error('최근 편집 설문 로드 실패:', err);
    }
  };

  // 필터링 및 정렬된 설문 목록
  const filteredAndSortedSurveys = useMemo(() => {
    let filtered = [...surveys];
    
    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(s => s.status === statusFilter);
    }
    
    // 설문 ID 필터
    if (selectedSurveyId && selectedSurveyId !== 'all') {
      filtered = filtered.filter(s => (s._id || s.id) === selectedSurveyId);
    }
    
    // 정렬
    filtered.sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'title':
          aVal = (a.title || '').toLowerCase();
          bVal = (b.title || '').toLowerCase();
          break;
        case 'responses':
          // 응답 수는 별도 조회 필요하므로 임시로 updatedAt 사용
          aVal = new Date(a.updatedAt || a.createdAt || 0);
          bVal = new Date(b.updatedAt || b.createdAt || 0);
          break;
        case 'updatedAt':
        default:
          aVal = new Date(a.updatedAt || a.createdAt || 0);
          bVal = new Date(b.updatedAt || b.createdAt || 0);
          break;
      }
      
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    
    return filtered;
  }, [surveys, statusFilter, selectedSurveyId, sortBy, sortOrder]);

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
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">대시보드</h1>
            <p className="text-gray-600">설문 운영 현황을 한눈에 확인하세요</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
              🔔 알럿
            </button>
            <button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium">
              실시간: ON
            </button>
          </div>
        </div>
      </motion.div>

      {/* 메시지 표시 */}
      {message.text && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-success/10 border border-success/20 text-success' 
              : message.type === 'info'
              ? 'bg-primary/10 border border-primary/20 text-primary'
              : 'bg-error/10 border border-error/20 text-error'
          }`}
        >
          <span>{message.text}</span>
          {message.type === 'error' && error && retryCount < 3 && (
            <button
              onClick={handleRetry}
              className="ml-4 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors text-sm font-medium"
            >
              재시도
            </button>
          )}
          <button
            onClick={() => setMessage({ type: '', text: '' })}
            className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
            aria-label="닫기"
          >
            ✕
          </button>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/builder')}
            className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">새 설문 만들기</h3>
                <p className="text-sm text-gray-600">빠르게 설문을 생성하세요</p>
              </div>
            </div>
          </button>
          
          {recentEditedSurveys.length > 0 && (
            <button
              onClick={() => navigate(`/admin/builder/${recentEditedSurveys[0]._id || recentEditedSurveys[0].id}`)}
              className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-300 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">최근 편집 설문</h3>
                  <p className="text-sm text-gray-600 truncate">{recentEditedSurveys[0].title || '제목 없음'}</p>
                </div>
              </div>
            </button>
          )}
          
          {surveys.filter(s => s.status === 'active').length > 0 && (
            <button
              onClick={() => {
                const activeSurveys = surveys.filter(s => s.status === 'active');
                if (activeSurveys.length > 0) {
                  const firstActiveSurvey = activeSurveys[0];
                  const surveyId = firstActiveSurvey._id || firstActiveSurvey.id;
                  navigate(`/admin/results/${surveyId}`);
                } else {
                  alert('진행중인 설문이 없습니다.');
                }
              }}
              className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-300 transition-all text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">진행중 설문 결과보기</h3>
                  <p className="text-sm text-gray-600">
                    {surveys.filter(s => s.status === 'active').length}개 설문 진행중
                  </p>
                </div>
              </div>
            </button>
          )}
        </div>
      </motion.div>

      {/* 필터 영역 (Analytics 기능 통합) */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-md p-4 border border-gray-200"
      >
        <div className="mb-4">
          <h2 className="text-lg font-bold text-text-main">필터 및 정렬</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <CustomSelect
            label="상태"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value)}
            options={[
              { value: 'all', label: '전체' },
              { value: 'active', label: '활성' },
              { value: 'scheduled', label: '예약됨' },
              { value: 'paused', label: '일시정지' },
              { value: 'completed', label: '완료' },
              { value: 'inactive', label: '비활성' },
            ]}
            placeholder="상태 선택"
          />
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
          <CustomSelect
            label="정렬 기준"
            value={sortBy}
            onChange={(value) => setSortBy(value)}
            options={[
              { value: 'updatedAt', label: '최근 수정일' },
              { value: 'title', label: '제목' },
              { value: 'responses', label: '응답 수' },
            ]}
            placeholder="정렬 기준"
          />
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? '↑ 오름차순' : '↓ 내림차순'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedSurveyId('all');
                setStatusFilter('all');
                setStartDate('');
                setEndDate('');
                setSortBy('updatedAt');
                setSortOrder('desc');
              }}
              className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              초기화
            </button>
          </div>
        </div>
      </motion.div>

      {/* 컴팩트 통계 바 */}
      <CompactStatsBar 
        stats={{
          ...stats,
          activeUsers: activeUsers || 0,
          avgCompletionTime: stats.avgCompletionTime || 0,
        }}
        loading={loadingSections.stats}
      />


      {/* 메인 콘텐츠 영역: 실시간 모니터링 + 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 실시간 모니터링 영역 (좌측) */}
        <div className="lg:col-span-1 space-y-4">
          {/* 알럿 패널 (향후 구현) */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">🔔 실시간 알럿</h3>
              <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">0</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 border-l-4 border-gray-300 rounded-lg">
                <p className="text-sm text-gray-500">알럿이 없습니다</p>
              </div>
            </div>
          </div>

          {/* 활동 피드 (향후 구현) */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">📊 실시간 활동</h3>
              <button className="text-sm text-gray-500 hover:text-gray-700">전체 보기 →</button>
            </div>
            <div className="space-y-2">
              <div className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <p className="text-sm text-gray-700 flex-1">활동 내역이 없습니다</p>
                  <p className="text-xs text-gray-500">-</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 영역 (우측) */}
        <div className="lg:col-span-2 space-y-6">
          {loadingSections.charts ? (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded-lg mb-4 w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 animate-pulse">
              <div className="h-6 bg-gray-200 rounded-lg mb-4 w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </>
        ) : (
          <>
          {/* 응답 추이 차트 */}
          {responseTrend ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">응답 추이</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    {startDate || endDate ? '필터된 기간' : '최근 7일'}
                  </span>
                  {selectedSurveyId !== 'all' && (
                    <span className="text-xs text-gray-500">
                      ({surveys.find(s => (s._id || s.id) === selectedSurveyId)?.title || '선택된 설문'})
                    </span>
                  )}
                </div>
              </div>
              <div className="h-64">
                <Line data={responseTrend} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  }
                }} />
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex items-center justify-center h-64">
              <p className="text-gray-500">응답 추이 데이터를 불러올 수 없습니다.</p>
            </div>
          )}

          {/* 설문별 성과 차트 */}
          {surveyPerformance ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">설문별 성과</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    상위 5개
                  </span>
                  {selectedSurveyId !== 'all' && (
                    <span className="text-xs text-gray-500">(필터 적용됨)</span>
                  )}
                </div>
              </div>
              <div className="h-64">
                <Bar data={surveyPerformance} options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  }
                }} />
              </div>
            </motion.div>
          ) : (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 flex items-center justify-center h-64">
              <p className="text-gray-500">설문별 성과 데이터를 불러올 수 없습니다.</p>
            </div>
          )}
          </>
          )}
        </div>
      </div>

      {/* 설문 목록 테이블 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">설문 목록</h3>
          <Link 
            to="/admin"
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            전체 보기 →
          </Link>
        </div>
        {loadingSections.surveys ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">제목</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">응답 수</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">기간</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">수정일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="border-b border-gray-100 animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="px-4 py-3"><div className="h-6 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-8 bg-gray-200 rounded w-24"></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : filteredAndSortedSurveys.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">조건에 맞는 설문이 없습니다.</p>
            <Link 
              to="/admin/builder"
              className="inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              설문 만들기
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">제목</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">응답 수</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">기간</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">수정일</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedSurveys.slice(0, 10).map((survey) => {
                  const statusConfig = getStatusConfig(survey.status || 'inactive');
                  const surveyId = survey._id || survey.id;
                  const responseCount = surveyResponseCounts[surveyId] || 0;
                  
                  const formatDateRange = () => {
                    const startAt = survey.startAt;
                    const endAt = survey.endAt;
                    if (!startAt && !endAt) return '-';
                    const formatDate = (dateStr) => {
                      if (!dateStr) return '';
                      const date = new Date(dateStr);
                      return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
                    };
                    if (startAt && endAt) {
                      return `${formatDate(startAt)} - ${formatDate(endAt)}`;
                    } else if (startAt) {
                      return `${formatDate(startAt)}부터`;
                    } else if (endAt) {
                      return `${formatDate(endAt)}까지`;
                    }
                    return '-';
                  };
                  
                  return (
                    <tr key={surveyId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{survey.title || '제목 없음'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-base font-bold text-gray-900">{responseCount}개</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {formatDateRange()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {survey.updatedAt 
                          ? new Date(survey.updatedAt).toLocaleDateString('ko-KR')
                          : survey.createdAt
                          ? new Date(survey.createdAt).toLocaleDateString('ko-KR')
                          : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/results/${surveyId}`)}
                            className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                            title="분석"
                          >
                            분석
                          </button>
                          <button
                            onClick={() => navigate(`/admin/builder/${surveyId}`)}
                            className="px-3 py-1.5 text-xs font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                            title="편집"
                          >
                            편집
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                const surveyUrl = `${window.location.origin}/s/${surveyId}`;
                                await navigator.clipboard.writeText(surveyUrl);
                                setMessage({ type: 'success', text: '링크가 클립보드에 복사되었습니다.' });
                                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                              } catch (err) {
                                setMessage({ type: 'error', text: '링크 복사에 실패했습니다.' });
                                setTimeout(() => setMessage({ type: '', text: '' }), 3000);
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                            title="배포"
                          >
                            배포
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}

