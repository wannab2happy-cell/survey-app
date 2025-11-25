import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance.js';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
import StatCard from '../components/admin/StatCard';
import CustomSelect from '../components/ui/CustomSelect';
import { toast } from '../components/ui/ToastContainer';
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
  LineElement
);

export default function SurveyResults({ survey: propSurvey, results: propResults, isShared = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(propSurvey || null);
  const [results, setResults] = useState(propResults || null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('auto'); // 'auto', 'bar', 'pie', 'line'
  // 추가: 탭 네비게이션 상태
  const [activeTab, setActiveTab] = useState('insights'); // 'insights', 'responses'
  // 추가: 응답별 데이터 테이블 상태
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestionFilter, setSelectedQuestionFilter] = useState('');
  const [hasSampleData, setHasSampleData] = useState(false);
  // 고급 필터 상태
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'morning', 'afternoon', 'evening', 'night'
  const [deviceFilter, setDeviceFilter] = useState('all'); // 'all', 'mobile', 'desktop', 'tablet'
  const [questionConditionFilter, setQuestionConditionFilter] = useState({ questionId: '', condition: '', value: '' });
  const [dailyTrendData, setDailyTrendData] = useState(null);

  // 샘플 데이터 생성 함수
  const generateSampleData = async () => {
    if (!survey || !survey.questions || survey.questions.length === 0) {
      toast.warning('설문 질문이 없습니다.');
      return;
    }

    try {
      setLoading(true);
      
      // 첫 번째 질문에 다양한 답변 생성
      const firstQuestion = survey.questions[0];
      const questionId = firstQuestion._id || firstQuestion.id;
      
      // 다양한 답변 옵션 (질문 타입에 따라)
      const sampleAnswers = [];
      
      if (firstQuestion.type === 'single-choice' || firstQuestion.type === 'multiple-choice') {
        // 선택형 질문인 경우 옵션 사용
        const options = firstQuestion.options || ['옵션 1', '옵션 2', '옵션 3', '옵션 4', '옵션 5'];
        // 각 옵션에 대해 다양한 수의 응답 생성
        options.forEach((option, idx) => {
          const count = [15, 12, 10, 8, 5][idx] || 5; // 각 옵션별 응답 수
          for (let i = 0; i < count; i++) {
            const daysAgo = Math.floor(Math.random() * 30); // 최근 30일 내
            const submittedAt = new Date();
            submittedAt.setDate(submittedAt.getDate() - daysAgo);
            submittedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
            
            const startedAt = new Date(submittedAt);
            startedAt.setMinutes(startedAt.getMinutes() - Math.floor(Math.random() * 10) - 1);
            
            sampleAnswers.push({
              questionId: questionId,
              answer: firstQuestion.type === 'multiple-choice' ? [option] : option,
              submittedAt: submittedAt.toISOString(),
              startedAt: startedAt.toISOString(),
            });
          }
        });
      } else if (firstQuestion.type === 'text' || firstQuestion.type === 'short-text') {
        // 단답형 질문인 경우
        const sampleTexts = [
          '매우 만족합니다', '만족합니다', '보통입니다', '불만족합니다', '매우 불만족합니다',
          '좋습니다', '괜찮습니다', '별로입니다', '좋아요', '최고예요',
          '추천합니다', '비추천합니다', '중립적입니다', '긍정적입니다', '부정적입니다',
          '예', '아니오', '모르겠습니다', '확실합니다', '불확실합니다',
        ];
        for (let i = 0; i < 50; i++) {
          const daysAgo = Math.floor(Math.random() * 30);
          const submittedAt = new Date();
          submittedAt.setDate(submittedAt.getDate() - daysAgo);
          submittedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
          
          const startedAt = new Date(submittedAt);
          startedAt.setMinutes(startedAt.getMinutes() - Math.floor(Math.random() * 10) - 1);
          
          sampleAnswers.push({
            questionId: questionId,
            answer: sampleTexts[Math.floor(Math.random() * sampleTexts.length)],
            submittedAt: submittedAt.toISOString(),
            startedAt: startedAt.toISOString(),
          });
        }
      } else if (firstQuestion.type === 'scale') {
        // 척도형 질문인 경우 (1-5 또는 1-10)
        const maxScale = firstQuestion.max || 5;
        for (let i = 0; i < 50; i++) {
          const daysAgo = Math.floor(Math.random() * 30);
          const submittedAt = new Date();
          submittedAt.setDate(submittedAt.getDate() - daysAgo);
          submittedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
          
          const startedAt = new Date(submittedAt);
          startedAt.setMinutes(startedAt.getMinutes() - Math.floor(Math.random() * 10) - 1);
          
          sampleAnswers.push({
            questionId: questionId,
            answer: Math.floor(Math.random() * maxScale) + 1,
            submittedAt: submittedAt.toISOString(),
            startedAt: startedAt.toISOString(),
          });
        }
      } else {
        // 기타 타입
        for (let i = 0; i < 30; i++) {
          const daysAgo = Math.floor(Math.random() * 30);
          const submittedAt = new Date();
          submittedAt.setDate(submittedAt.getDate() - daysAgo);
          submittedAt.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
          
          const startedAt = new Date(submittedAt);
          startedAt.setMinutes(startedAt.getMinutes() - Math.floor(Math.random() * 10) - 1);
          
          sampleAnswers.push({
            questionId: questionId,
            answer: `샘플 응답 ${i + 1}`,
            submittedAt: submittedAt.toISOString(),
            startedAt: startedAt.toISOString(),
          });
        }
      }

      // 샘플 응답 데이터 생성
      const sampleResponses = sampleAnswers.map((answer, idx) => ({
        id: `sample_${idx}`,
        answers: [answer],
        submittedAt: answer.submittedAt,
        startedAt: answer.startedAt,
      }));

      // 기존 결과에 샘플 데이터 추가
      const existingResults = filteredResults || results?.results || [];
      const combinedResults = [...existingResults, ...sampleResponses];
      
      const updatedResults = {
        ...(results || {}),
        results: combinedResults,
        totalResponses: combinedResults.length 
      };
      
      setResults(updatedResults);
      setFilteredResults(combinedResults);
      setHasSampleData(true);
      
      toast.success(`${sampleResponses.length}개의 샘플 응답이 생성되었습니다.`);
    } catch (err) {
      console.error('샘플 데이터 생성 오류:', err);
      toast.error('샘플 데이터 생성에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
    } finally {
      setLoading(false);
    }
  };

  // 데이터 불러오기 (props로 전달된 경우 스킵)
  useEffect(() => {
    // props로 데이터가 전달된 경우 스킵
    if (propSurvey && propResults) {
      setSurvey(propSurvey);
      setResults(propResults);
      setFilteredResults(propResults.results || []);
      setLoading(false);
      return;
    }

    const fetchSurveyResults = async () => {
      try {
        setLoading(true);
        const [surveyRes, resultRes] = await Promise.all([
          axiosInstance.get(`/surveys/${id}`),
          axiosInstance.get(`/surveys/${id}/results`),
        ]);
        
        // 설문 데이터 처리
        const surveyData = surveyRes.data.success 
          ? surveyRes.data.data 
          : surveyRes.data;
        setSurvey(surveyData);
        
        // 결과 데이터 처리
        const resultData = resultRes.data;
        if (resultData.success && resultData.data?.results) {
          setResults(resultData.data);
          setFilteredResults(resultData.data.results || []);
        } else if (resultData.success && resultData.results) {
          setResults(resultData);
          setFilteredResults(resultData.results || []);
        } else if (resultData.results) {
          setResults(resultData);
          setFilteredResults(resultData.results || []);
        } else {
          setResults({ results: [] });
          setFilteredResults([]);
        }
      } catch (err) {
        console.error('데이터 불러오기 오류:', err);
        toast.error('응답 결과를 불러오는데 실패했습니다: ' + (err.response?.data?.message || err.message));
        setResults({ results: [] });
        setFilteredResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchSurveyResults();
    }
  }, [id, propSurvey, propResults]);

  // 일자별 추이 데이터 생성
  useEffect(() => {
    if (!filteredResults || filteredResults.length === 0) {
      setDailyTrendData(null);
      return;
    }

    const trendMap = new Map();
    
    filteredResults.forEach(response => {
      if (!response.submittedAt) return;
      
      const date = new Date(response.submittedAt);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!trendMap.has(dateStr)) {
        trendMap.set(dateStr, 0);
      }
      trendMap.set(dateStr, trendMap.get(dateStr) + 1);
    });

    const sortedDates = Array.from(trendMap.keys()).sort();
    const labels = sortedDates.map(d => {
      const date = new Date(d);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });
    const data = sortedDates.map(d => trendMap.get(d));

    setDailyTrendData({
      labels,
      datasets: [{
        label: '일일 응답 수',
        data,
        borderColor: 'rgba(38, 198, 218, 1)',
        backgroundColor: 'rgba(38, 198, 218, 0.1)',
        tension: 0.4,
        fill: true,
      }]
    });
  }, [filteredResults]);

  // 고급 필터링 (날짜, 시간대, 기기, 질문 조건)
  useEffect(() => {
    if (!results) return;
    
    let filtered = [...(results.results || [])];

    // 날짜 필터
    if (startDate || endDate) {
      filtered = filtered.filter((r) => {
        if (!r.submittedAt) return false;
        const date = new Date(r.submittedAt);
        const afterStart = startDate ? date >= new Date(startDate) : true;
        const beforeEnd = endDate ? date <= new Date(endDate + 'T23:59:59') : true;
        return afterStart && beforeEnd;
      });
    }

    // 시간대 필터
    if (timeFilter !== 'all') {
      filtered = filtered.filter((r) => {
        if (!r.submittedAt) return false;
        const date = new Date(r.submittedAt);
        const hour = date.getHours();
        
        switch (timeFilter) {
          case 'morning': return hour >= 6 && hour < 12;
          case 'afternoon': return hour >= 12 && hour < 18;
          case 'evening': return hour >= 18 && hour < 22;
          case 'night': return hour >= 22 || hour < 6;
          default: return true;
        }
      });
    }

    // 기기 필터 (userAgent 기반, 실제로는 백엔드에서 제공해야 함)
    if (deviceFilter !== 'all') {
      // 임시 구현: 실제로는 응답 데이터에 device 정보가 있어야 함
      // filtered = filtered.filter((r) => r.device === deviceFilter);
    }

    // 질문 조건 필터
    if (questionConditionFilter.questionId && questionConditionFilter.condition && questionConditionFilter.value) {
      filtered = filtered.filter((r) => {
        const answer = r.answers?.find(a => {
          const aQuestionId = a.questionId || a.questionId;
          return String(aQuestionId) === String(questionConditionFilter.questionId);
        });
        
        if (!answer) return false;
        
        const answerValue = String(answer.answer || answer.value || '').toLowerCase();
        const filterValue = questionConditionFilter.value.toLowerCase();
        
        switch (questionConditionFilter.condition) {
          case 'contains':
            return answerValue.includes(filterValue);
          case 'equals':
            return answerValue === filterValue;
          case 'startsWith':
            return answerValue.startsWith(filterValue);
          case 'endsWith':
            return answerValue.endsWith(filterValue);
          default:
            return true;
        }
      });
    }

    setFilteredResults(filtered);
  }, [startDate, endDate, results, timeFilter, deviceFilter, questionConditionFilter]);

  // 통계 계산 (상단 카드용)
  const stats = useMemo(() => {
    if (!filteredResults || !survey) {
      return {
        totalParticipants: 0,
        completionRate: 0,
        avgSessionTime: '0:00',
        linkClicks: '***',
        conversionRate: '***',
        shareClicks: '***',
      };
    }

    const totalParticipants = filteredResults.length;
    const totalQuestions = survey.questions?.length || 0;
    
    // 완료율 계산 (모든 질문에 답한 응답 수 / 전체 응답 수)
    const completedResponses = filteredResults.filter(r => {
      if (!r.answers || !Array.isArray(r.answers)) return false;
      return r.answers.length >= totalQuestions;
    }).length;
    const completionRate = totalParticipants > 0 
      ? Math.round((completedResponses / totalParticipants) * 100 * 100) / 100 
      : 0;

    // 평균 세션시간 계산 (응답 시작 ~ 제출 시간)
    let totalTime = 0;
    let timeCount = 0;
    filteredResults.forEach(r => {
      if (r.startedAt && r.submittedAt) {
        const start = new Date(r.startedAt).getTime();
        const end = new Date(r.submittedAt).getTime();
        const duration = (end - start) / 1000; // 초
        if (duration > 0 && duration < 3600) { // 1시간 이내
          totalTime += duration;
          timeCount++;
        }
      }
    });
    const avgSeconds = timeCount > 0 ? Math.round(totalTime / timeCount) : 0;
    const minutes = Math.floor(avgSeconds / 60);
    const seconds = avgSeconds % 60;
    const avgSessionTime = `${minutes}:${String(seconds).padStart(2, '0')}`;

    return {
      totalParticipants,
      completionRate,
      avgSessionTime,
      linkClicks: '***', // 추후 구현
      conversionRate: '***', // 추후 구현
      shareClicks: '***', // 추후 구현
    };
  }, [filteredResults, survey]);

  // 응답별 데이터 테이블용 데이터 처리 (모든 Hook은 early return 이전에 호출되어야 함)
  const tableData = useMemo(() => {
    if (!filteredResults || !survey) return [];
    
    return filteredResults.map((response, idx) => {
      const rowData = {
        id: response.id || response._id || idx,
        date: response.submittedAt ? new Date(response.submittedAt).toLocaleString('ko-KR') : '',
        ...Object.fromEntries(
          (survey.questions || []).map((q, qIdx) => {
            const questionId = q._id || q.id;
            const answer = response.answers?.find(a => {
              const aQuestionId = a.questionId || a.questionId;
              return String(aQuestionId) === String(questionId);
            });
            const answerValue = answer 
              ? (Array.isArray(answer.answer || answer.value) 
                  ? (answer.answer || answer.value).join(', ') 
                  : (answer.answer || answer.value || ''))
              : '';
            return [q.text || q.content || `질문 ${qIdx + 1}`, answerValue];
          })
        ),
      };
      return rowData;
    });
  }, [filteredResults, survey]);

  // 검색 및 필터링된 테이블 데이터
  const filteredTableData = useMemo(() => {
    let filtered = tableData;
    
    // 검색 쿼리 적용
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(row => {
        return Object.values(row).some(val => 
          String(val).toLowerCase().includes(query)
        );
      });
    }
    
    // 질문 필터 적용
    if (selectedQuestionFilter) {
      filtered = filtered.filter(row => {
        return row[selectedQuestionFilter] && row[selectedQuestionFilter].trim() !== '';
      });
    }
    
    return filtered;
  }, [tableData, searchQuery, selectedQuestionFilter]);

  // 정렬된 테이블 데이터
  const sortedTableData = useMemo(() => {
    if (!sortConfig.key) return filteredTableData;
    
    const sorted = [...filteredTableData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredTableData, sortConfig]);

  // 검색/필터 변경 시 페이지 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedQuestionFilter]);

  // 페이지네이션된 데이터
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return sortedTableData.slice(start, end);
  }, [sortedTableData, currentPage, itemsPerPage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary mb-4"></div>
          <p className="text-text-sub">응답 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  if (!survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <p className="text-error text-lg mb-4">설문을 찾을 수 없습니다.</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }
  
  if (!results || !filteredResults || filteredResults.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-main mb-2 flex items-center gap-3">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {survey.title || '설문'} 결과확인
          </h1>
          <p className="text-text-sub">응답 결과를 확인하세요</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg mb-4">아직 응답이 없습니다.</p>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors border-2 border-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 추가: PDF 내보내기 (jsPDF 사용)
  const handleDownloadPDF = () => {
    if (!filteredResults?.length || !survey) {
      toast.warning('다운로드할 응답이 없습니다.');
      return;
    }
    
    try {
      const doc = new jsPDF();
      let yPos = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;
      
      // 제목
      doc.setFontSize(18);
      doc.text(survey.title || '설문 결과', margin, yPos);
      yPos += 10;
      
      // 기본 정보
      doc.setFontSize(12);
      doc.text(`총 응답 수: ${filteredResults.length}개`, margin, yPos);
      yPos += lineHeight;
      doc.text(`생성일: ${new Date().toLocaleDateString('ko-KR')}`, margin, yPos);
      yPos += 15;
      
      // 각 질문별 통계
      if (survey.questions && survey.questions.length > 0) {
        survey.questions.forEach((q, i) => {
          // 페이지 넘김 체크
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }
          
          const questionText = q.text || q.content || `질문 ${i + 1}`;
          const chartData = getChartData(q);
          
          // 질문 제목
          doc.setFontSize(14);
          doc.text(`${i + 1}. ${questionText}`, margin, yPos);
          yPos += lineHeight;
          
          // 응답률 정보
          doc.setFontSize(10);
          doc.text(`응답률: ${chartData.responseRate || 0}% (${chartData.answeredCount || 0}/${chartData.totalResponses || 0})`, margin, yPos);
          yPos += lineHeight;
          
          // 응답 분포
          if (chartData.labels && chartData.labels.length > 0 && chartData.labels[0] !== '응답 없음') {
            doc.text('응답 분포:', margin, yPos);
            yPos += lineHeight;
            chartData.labels.forEach((label, idx) => {
              const count = chartData.datasets[0].data[idx];
              const percentage = chartData.totalResponses > 0 
                ? Math.round((count / chartData.totalResponses) * 100) 
                : 0;
              doc.text(`  - ${label}: ${count}개 (${percentage}%)`, margin + 5, yPos);
              yPos += lineHeight;
              
              // 페이지 넘김 체크
              if (yPos > pageHeight - 20) {
                doc.addPage();
                yPos = 20;
              }
            });
          } else {
            doc.text('응답 없음', margin + 5, yPos);
            yPos += lineHeight;
          }
          
          yPos += 10; // 질문 간 간격
        });
      }
      
      // 파일 저장
      const fileName = `${survey.title || '설문결과'}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error('PDF 생성 실패:', err);
      toast.error('PDF 생성에 실패했습니다. CSV 다운로드를 사용해주세요.');
    }
  };

  // 엑셀 다운로드 (CSV 형식, 엑셀에서 열기 가능)
  const handleDownloadExcel = () => {
    if (!filteredResults?.length || !survey) {
      toast.warning('다운로드할 응답이 없습니다.');
      return;
    }
    
    // 엑셀 형식으로 데이터 구성 (질문별 컬럼)
    const headers = ['응답 번호', '제출일시', '시작일시', '소요시간(초)'];
    const questionHeaders = (survey.questions || []).map((q, idx) => {
      return q.text || q.content || `질문 ${idx + 1}`;
    });
    headers.push(...questionHeaders);
    
    const rows = [];
    filteredResults.forEach((r, responseIndex) => {
      const row = {
        '응답 번호': responseIndex + 1,
        '제출일시': r.submittedAt ? new Date(r.submittedAt).toLocaleString('ko-KR') : '',
        '시작일시': r.startedAt ? new Date(r.startedAt).toLocaleString('ko-KR') : '',
        '소요시간(초)': r.startedAt && r.submittedAt 
          ? Math.round((new Date(r.submittedAt) - new Date(r.startedAt)) / 1000)
          : '',
      };
      
      // 각 질문에 대한 답변 추가
      (survey.questions || []).forEach((q) => {
        const questionId = q._id || q.id;
        const questionText = q.text || q.content || '';
        const answer = r.answers?.find((a) => {
          const aQuestionId = a.questionId;
          return String(questionId) === String(aQuestionId);
        });
        
        if (answer) {
          const answerValue = Array.isArray(answer.answer || answer.value) 
            ? (answer.answer || answer.value).join('; ') 
            : (answer.answer || answer.value || '');
          row[questionText] = answerValue;
        } else {
          row[questionText] = '';
        }
      });
      
      rows.push(row);
    });

    if (rows.length === 0) {
      toast.warning('다운로드할 데이터가 없습니다.');
      return;
    }

    // CSV 형식으로 변환 (엑셀에서 열기 가능)
    const csvRows = [];
    
    // 헤더 추가
    csvRows.push(headers.map(h => {
      const str = String(h).replace(/"/g, '""');
      return `"${str}"`;
    }).join(','));
    
    // 데이터 행 추가
    rows.forEach(row => {
      const values = headers.map(header => {
        const val = row[header] || '';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvData = csvRows.join('\n');
    const BOM = '\uFEFF'; // UTF-8 BOM for Excel (한글 깨짐 방지)
    const blob = new Blob([BOM + csvData], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${survey.title || '설문결과'}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  // CSV 다운로드 (기존 형식 유지)
  const handleDownloadCSV = () => {
    if (!filteredResults?.length) {
      toast.warning('다운로드할 응답이 없습니다.');
      return;
    }
    
    const rows = [];
    filteredResults.forEach((r, responseIndex) => {
      if (r.answers && r.answers.length > 0) {
        r.answers.forEach((a) => {
          const question = survey.questions.find((q) => {
            const qId = q._id || q.id;
            const aId = a.questionId;
            return String(qId) === String(aId);
          });
          const questionText = question?.text || question?.content || '';
          const answerValue = Array.isArray(a.answer) ? a.answer.join('; ') : (a.answer || '');
          rows.push({
            '응답 번호': responseIndex + 1,
            '제출일시': r.submittedAt ? new Date(r.submittedAt).toLocaleString('ko-KR') : '',
            '질문': questionText,
            '응답': answerValue,
          });
        });
      } else {
        // 답변이 없는 경우
        rows.push({
          '응답 번호': responseIndex + 1,
          '제출일시': r.submittedAt ? new Date(r.submittedAt).toLocaleString('ko-KR') : '',
          '질문': '',
          '응답': '(응답 없음)',
        });
      }
    });

    if (rows.length === 0) {
      toast.warning('다운로드할 데이터가 없습니다.');
      return;
    }

    const header = Object.keys(rows[0]).join(',');
    const csvData = [header, ...rows.map((r) => {
      return Object.values(r).map(val => {
        // CSV 형식에 맞게 따옴표 처리
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      }).join(',');
    })].join('\n');

    const BOM = '\uFEFF'; // UTF-8 BOM for Excel
    const blob = new Blob([BOM + csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${survey.title}_결과_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // 응답자 세부 모달
  const Modal = ({ response, onClose }) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold text-text-main">응답 상세</h3>
          <button
            onClick={onClose}
            className="text-text-sub hover:text-text-main text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors"
          >
            ×
          </button>
        </div>
        <p className="text-text-sub mb-4 pb-4 border-b border-border">
          제출일시: {response.submittedAt ? new Date(response.submittedAt).toLocaleString('ko-KR') : '날짜 없음'}
        </p>
        <div className="space-y-4">
          {response.answers && response.answers.length > 0 ? (
            response.answers.map((a, i) => {
              const question = survey.questions?.find((q) => {
                const qId = q._id || q.id;
                const aId = a.questionId;
                return String(qId) === String(aId);
              });
              const questionText = question?.text || question?.content || `문항 ${i + 1}`;
              const answerValue = Array.isArray(a.answer || a.value) 
                ? (a.answer || a.value).join(', ') 
                : (a.answer || a.value || '(응답 없음)');
              return (
                <div key={i} className="border-b border-border pb-3">
                  <p className="font-semibold text-text-main mb-2">{questionText}</p>
                  <p className="text-text-sub pl-4 bg-bg p-3 rounded-lg">{answerValue}</p>
                </div>
              );
            })
          ) : (
            <p className="text-text-sub text-center py-4">응답 데이터가 없습니다.</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors border-2 border-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          닫기
        </button>
      </motion.div>
    </div>
  );

  // 질문 타입별 자동 차트 선택
  const getAutoChartType = (questionType) => {
    const type = (questionType || '').toUpperCase().trim();
    
    switch (type) {
      case 'RADIO':
      case 'SINGLE_CHOICE':
      case 'YES_NO':
        return 'pie'; // 단일 선택은 원형 그래프
      case 'CHECKBOX':
      case 'MULTIPLE_CHOICE':
        return 'bar'; // 복수 선택은 막대 그래프
      case 'SCALE':
      case 'STAR_RATING':
        return 'line'; // 척도/별점은 선 그래프
      case 'TEXT':
      case 'TEXTAREA':
      case 'SHORT_TEXT':
        return 'bar'; // 텍스트는 막대 그래프 (워드 클라우드는 별도)
      default:
        return 'bar';
    }
  };

  // 질문별 그래프 데이터 생성 (개선)
  const getChartData = (q) => {
    const counts = {};
    let totalResponses = 0;
    let answeredCount = 0;
    
    filteredResults.forEach((r) => {
      totalResponses++;
      const ans = r.answers?.find((a) => {
        const questionId = q._id || q.id;
        const answerQuestionId = a.questionId;
        return String(answerQuestionId) === String(questionId);
      });
      if (ans) {
        answeredCount++;
        const answerValue = ans.answer || ans.value;
        if (Array.isArray(answerValue)) {
          answerValue.forEach(val => {
            const key = String(val);
            counts[key] = (counts[key] || 0) + 1;
          });
        } else {
          const key = String(answerValue);
          counts[key] = (counts[key] || 0) + 1;
        }
      }
    });
    
    const labels = Object.keys(counts);
    const data = Object.values(counts);
    const responseRate = totalResponses > 0 ? Math.round((answeredCount / totalResponses) * 100) : 0;
    
    // 데이터가 없을 경우 처리
    if (labels.length === 0) {
      return {
        labels: ['응답 없음'],
        datasets: [{
          label: '응답 수',
          data: [0],
          backgroundColor: 'rgba(200, 200, 200, 0.7)',
        }],
        responseRate: 0,
        totalResponses,
        answeredCount,
      };
    }
    
    // 색상 생성
    const colors = [
      'rgba(38, 198, 218, 0.7)',   // primary
      'rgba(245, 158, 11, 0.7)',   // secondary
      'rgba(16, 185, 129, 0.7)',    // success
      'rgba(239, 68, 68, 0.7)',     // error
      'rgba(139, 92, 246, 0.7)',    // purple
      'rgba(59, 130, 246, 0.7)',    // blue
    ];
    
    return {
      labels: labels,
      datasets: [
        {
          label: '응답 수',
          data: data,
          backgroundColor: labels.map((_, i) => colors[i % colors.length]),
          borderColor: labels.map((_, i) => colors[i % colors.length].replace('0.7', '1')),
          borderWidth: 2,
        },
      ],
      responseRate,
      totalResponses,
      answeredCount,
    };
  };
  
  // 차트 컴포넌트 렌더링 (질문 타입별 자동 선택)
  const renderChart = (chartData, question) => {
    const autoChartType = getAutoChartType(question.type);
    const finalChartType = chartType === 'auto' ? autoChartType : chartType;
    
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { 
          display: finalChartType === 'pie',
          position: 'bottom',
        },
        title: { display: false },
      },
    };
    
    switch (finalChartType) {
      case 'pie':
        return (
          <Pie
            data={chartData}
            options={commonOptions}
          />
        );
      case 'line':
        return (
          <Line
            data={chartData}
            options={{
              ...commonOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 }
                }
              }
            }}
          />
        );
      default:
        return (
          <Bar
            data={chartData}
            options={{
              ...commonOptions,
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: { stepSize: 1 }
                }
              }
            }}
          />
        );
    }
  };

  // 정렬 핸들러
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1); // 정렬 변경 시 페이지 리셋
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2 flex items-center gap-3">
            <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {survey.title || '설문'} 결과확인
          </h1>
          <p className="text-text-sub">총 {filteredResults.length}개의 응답이 수집되었습니다.</p>
        </div>
        <div className="flex items-center gap-2">
          {(!filteredResults || filteredResults.length === 0) && (
            <button
              onClick={generateSampleData}
              disabled={loading || !survey || !survey.questions || survey.questions.length === 0}
              className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              샘플 데이터 생성
            </button>
          )}
          {filteredResults && filteredResults.length > 0 && (
            <>
              <button
                onClick={handleDownloadExcel}
                className="px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 border-2 border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                엑셀 다운로드
              </button>
              <button
                onClick={generateSampleData}
                disabled={loading || !survey || !survey.questions || survey.questions.length === 0}
                className="px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 border-2 border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                샘플 데이터 추가
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary 섹션 강화 */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">요약</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">총 응답</div>
            <div className="text-2xl font-bold text-blue-900">{stats.totalParticipants}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium mb-1">완료율</div>
            <div className="text-2xl font-bold text-green-900">{stats.completionRate}%</div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <div className="text-sm text-orange-600 font-medium mb-1">평균 소요시간</div>
            <div className="text-2xl font-bold text-orange-900">{stats.avgSessionTime}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium mb-1">응답 기간</div>
            <div className="text-lg font-bold text-purple-900">
              {filteredResults && filteredResults.length > 0 ? (
                <>
                  {new Date(Math.min(...filteredResults.map(r => new Date(r.submittedAt).getTime()))).toLocaleDateString('ko-KR')}
                  <br />
                  ~ {new Date(Math.max(...filteredResults.map(r => new Date(r.submittedAt).getTime()))).toLocaleDateString('ko-KR')}
                </>
              ) : '-'}
            </div>
          </div>
        </div>
        
        {/* 일자별 그래프 */}
        {dailyTrendData && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">일자별 응답 추이</h3>
            <div className="h-64">
              <Line data={dailyTrendData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                  }
                }
              }} />
            </div>
          </div>
        )}
      </div>

      {/* 상단 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard 
          title="참여" 
          value={stats.totalParticipants} 
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="purple" 
        />
        <StatCard 
          title="완료" 
          value={`${stats.completionRate}%`} 
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="blue" 
        />
        <StatCard 
          title="평균 세션시간" 
          value={stats.avgSessionTime} 
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          color="orange" 
        />
        <StatCard 
          title="링크 클릭 수" 
          value={stats.linkClicks} 
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          }
          color="green" 
        />
        <StatCard 
          title="전환율(CTR)" 
          value={stats.conversionRate} 
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          color="red" 
        />
        <StatCard 
          title="공유버튼 클릭 수" 
          value={stats.shareClicks} 
          icon={
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          }
          color="blue" 
        />
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-4 px-6">
            <button
              onClick={() => setActiveTab('insights')}
              className={`py-4 px-2 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'insights'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-sub hover:text-text-main'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              질문별 인사이트
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`py-4 px-2 font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'responses'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-text-sub hover:text-text-main'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              응답별 데이터
            </button>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="p-6">
          {activeTab === 'insights' ? (
            <>
              {/* 필터링 및 다운로드 (질문별 인사이트 탭) */}
              <div className="mb-6 bg-white rounded-xl shadow-md p-4 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">필터 및 설정</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
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
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">시간대</label>
                    <CustomSelect
                      value={timeFilter}
                      onChange={(value) => setTimeFilter(value)}
                      options={[
                        { value: 'all', label: '전체 시간대' },
                        { value: 'morning', label: '오전 (6-12시)' },
                        { value: 'afternoon', label: '오후 (12-18시)' },
                        { value: 'evening', label: '저녁 (18-22시)' },
                        { value: 'night', label: '밤 (22-6시)' },
                      ]}
                      placeholder="시간대 선택"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">차트 타입</label>
                    <CustomSelect
                      value={chartType}
                      onChange={(value) => setChartType(value)}
                      options={[
                        { value: 'auto', label: '자동 선택' },
                        { value: 'bar', label: '막대 그래프' },
                        { value: 'pie', label: '원형 그래프' },
                        { value: 'line', label: '선 그래프' },
                      ]}
                      placeholder="차트 타입 선택"
                    />
                  </div>
                </div>
                
                {/* 질문 조건 필터 */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">질문 조건 필터</h4>
                  <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-medium text-gray-600 mb-1">질문 선택</label>
                      <CustomSelect
                        value={questionConditionFilter.questionId}
                        onChange={(value) => setQuestionConditionFilter({ ...questionConditionFilter, questionId: value })}
                        options={[
                          { value: '', label: '질문 조건 없음' },
                          ...(survey.questions?.map((q, i) => ({
                            value: q._id || q.id,
                            label: (q.text || q.content || `질문 ${i + 1}`).substring(0, 30) + ((q.text || q.content || '').length > 30 ? '...' : '')
                          })) || [])
                        ]}
                        placeholder="질문 선택"
                      />
                    </div>
                    {questionConditionFilter.questionId && (
                      <>
                        <div className="w-32">
                          <label className="block text-xs font-medium text-gray-600 mb-1">조건</label>
                          <CustomSelect
                            value={questionConditionFilter.condition}
                            onChange={(value) => setQuestionConditionFilter({ ...questionConditionFilter, condition: value })}
                            options={[
                              { value: 'contains', label: '포함' },
                              { value: 'equals', label: '일치' },
                              { value: 'startsWith', label: '시작' },
                              { value: 'endsWith', label: '끝' },
                            ]}
                            placeholder="조건 선택"
                          />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <label className="block text-xs font-medium text-gray-600 mb-1">값</label>
                          <input
                            type="text"
                            placeholder="필터 값 입력"
                            value={questionConditionFilter.value}
                            onChange={(e) => setQuestionConditionFilter({ ...questionConditionFilter, value: e.target.value })}
                            className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => setQuestionConditionFilter({ questionId: '', condition: '', value: '' })}
                          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          초기화
                        </button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* 다운로드 버튼 */}
                <div className="border-t border-gray-200 pt-4 mt-4 flex justify-end gap-2">
                  <button
                    onClick={handleDownloadExcel}
                    className="px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 border-2 border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    엑셀 다운로드
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="px-4 py-2.5 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    CSV 다운로드
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2.5 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2 border-2 border-primary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    PDF 내보내기
                  </button>
                </div>
              </div>

              {/* 그래프 표시 */}
              <div className="space-y-6">
                {survey.questions && survey.questions.length > 0 ? (
                  survey.questions.map((q, i) => {
                    const questionText = q.text || q.content || `질문 ${i + 1}`;
                    const questionId = q._id || q.id;
                    const chartData = getChartData(q);
                    return (
                      <motion.div
                        key={questionId || i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}
                        className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold mb-2 text-lg text-text-main">
                              {i + 1}. {questionText}
                            </h3>
                            {/* 추가: 응답률 및 통계 정보 */}
                            <div className="flex items-center gap-4 text-sm text-text-sub">
                              <span>응답률: <strong className="text-primary">{chartData.responseRate || 0}%</strong></span>
                              <span>응답 수: <strong className="text-primary">{chartData.answeredCount || 0}</strong> / {chartData.totalResponses || 0}</span>
                              {q.type && (
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                  {q.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        {filteredResults && filteredResults.length > 0 ? (
                          <div className="h-64">
                            {renderChart(chartData, q)}
                          </div>
                        ) : (
                          <p className="text-text-sub text-center py-8">응답 데이터가 없습니다.</p>
                        )}
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="bg-white rounded-xl shadow-md p-6 text-center">
                    <p className="text-text-sub">질문이 없습니다.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* 응답별 데이터 탭 */}
              <div className="space-y-4">
                {/* 검색 및 필터 */}
                <div className="bg-white rounded-xl shadow-md p-4 border border-gray-200">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-sm font-medium text-gray-700 mb-2">검색</label>
                      <input
                        type="text"
                        placeholder="검색..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all hover:border-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">질문 필터</label>
                      <CustomSelect
                        value={selectedQuestionFilter}
                        onChange={(value) => setSelectedQuestionFilter(value)}
                        options={[
                          { value: '', label: '전체' },
                          ...(survey.questions?.map((q, i) => ({
                            value: q.text || q.content || `질문 ${i + 1}`,
                            label: q.text || q.content || `질문 ${i + 1}`
                          })) || [])
                        ]}
                        placeholder="질문 선택"
                        className="w-48"
                      />
                    </div>
                    <button
                      onClick={handleDownloadExcel}
                      className="px-4 py-2.5 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 border-2 border-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      엑셀 다운로드
                    </button>
                    <button
                      onClick={handleDownloadCSV}
                      className="px-4 py-2.5 text-sm font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 border-2 border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      CSV 다운로드
                    </button>
                  </div>
                </div>

                {/* 테이블 */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b border-border">
                        <th className="p-3 text-left text-sm font-medium text-text-sub">
                          <input
                            type="checkbox"
                            checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRows(paginatedData.map(d => d.id));
                              } else {
                                setSelectedRows([]);
                              }
                            }}
                            className="rounded border-border"
                          />
                        </th>
                        <th 
                          className="p-3 text-left text-sm font-medium text-text-sub cursor-pointer hover:bg-gray-100"
                          onClick={() => handleSort('date')}
                        >
                          날짜 {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                        </th>
                        {survey.questions?.map((q, i) => {
                          const questionText = q.text || q.content || `질문 ${i + 1}`;
                          const displayText = questionText.length > 30 ? questionText.substring(0, 30) + '...' : questionText;
                          return (
                            <th 
                              key={q._id || q.id || i}
                              className="p-3 text-left text-sm font-medium text-text-sub cursor-pointer hover:bg-gray-100"
                              onClick={() => handleSort(questionText)}
                              title={questionText}
                            >
                              {displayText} 
                              {sortConfig.key === questionText && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedData.length === 0 ? (
                        <tr>
                          <td colSpan={(survey.questions?.length || 0) + 2} className="p-8 text-center text-text-sub">
                            데이터가 없습니다.
                          </td>
                        </tr>
                      ) : (
                        paginatedData.map((row, idx) => {
                          const originalResponse = filteredResults.find(r => (r.id || r._id) === row.id);
                          return (
                            <tr 
                              key={row.id}
                              className="border-b border-border hover:bg-gray-50 cursor-pointer"
                              onClick={() => originalResponse && setSelectedResponse(originalResponse)}
                            >
                              <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="checkbox"
                                  checked={selectedRows.includes(row.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedRows([...selectedRows, row.id]);
                                    } else {
                                      setSelectedRows(selectedRows.filter(id => id !== row.id));
                                    }
                                  }}
                                  className="rounded border-border"
                                />
                              </td>
                              <td className="p-3 text-sm text-text-main">{row.date}</td>
                              {survey.questions?.map((q, i) => {
                                const questionText = q.text || q.content || `질문 ${i + 1}`;
                                const cellValue = row[questionText] || '-';
                                const displayValue = String(cellValue).length > 50 
                                  ? String(cellValue).substring(0, 50) + '...' 
                                  : cellValue;
                                return (
                                  <td 
                                    key={q._id || q.id || i} 
                                    className="p-3 text-sm text-text-main"
                                    title={cellValue !== '-' ? String(cellValue) : ''}
                                  >
                                    {displayValue}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 페이지네이션 */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-text-sub">
                    {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, sortedTableData.length)} / 전체 {sortedTableData.length}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      이전
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(Math.ceil(sortedTableData.length / itemsPerPage), prev + 1))}
                      disabled={currentPage >= Math.ceil(sortedTableData.length / itemsPerPage)}
                      className="px-4 py-2.5 text-sm font-medium border-2 border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      다음
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 응답 상세 모달 */}
      {selectedResponse && (
        <Modal response={selectedResponse} onClose={() => setSelectedResponse(null)} />
      )}
    </div>
  );
}
