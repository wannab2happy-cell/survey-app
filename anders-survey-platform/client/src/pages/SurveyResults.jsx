import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance.js';
import { motion } from 'framer-motion';
import jsPDF from 'jspdf';
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

export default function SurveyResults() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState(null);
  const [results, setResults] = useState(null);
  const [filteredResults, setFilteredResults] = useState(null);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState('bar'); // 'bar', 'pie', 'line'

  // 데이터 불러오기
  useEffect(() => {
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
        alert('응답 결과를 불러오는데 실패했습니다: ' + (err.response?.data?.message || err.message));
        setResults({ results: [] });
        setFilteredResults([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchSurveyResults();
    }
  }, [id]);

  // 날짜 필터링
  useEffect(() => {
    if (!results) return;
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
          <h1 className="text-3xl font-bold text-text-main mb-2">📊 {survey.title || '설문'} 결과</h1>
          <p className="text-text-sub">응답 결과를 확인하세요</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-bg mb-4">
            <span className="text-4xl">📊</span>
          </div>
          <p className="text-text-sub text-lg mb-4">아직 응답이 없습니다.</p>
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

  // 추가: PDF 내보내기 (jsPDF 사용)
  const handleDownloadPDF = () => {
    if (!filteredResults?.length || !survey) {
      alert('다운로드할 응답이 없습니다.');
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
      alert('PDF 생성에 실패했습니다. CSV 다운로드를 사용해주세요.');
    }
  };

  // CSV 다운로드
  const handleDownloadCSV = () => {
    if (!filteredResults?.length) {
      alert('다운로드할 응답이 없습니다.');
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
      alert('다운로드할 데이터가 없습니다.');
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
          className="mt-6 w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover font-medium transition-colors"
        >
          닫기
        </button>
      </motion.div>
    </div>
  );

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
  
  // 차트 컴포넌트 렌더링
  const renderChart = (chartData, question) => {
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { 
          display: chartType === 'pie',
          position: 'bottom',
        },
        title: { display: false },
      },
    };
    
    switch (chartType) {
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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-text-main mb-2">📊 {survey.title || '설문'} 결과</h1>
        <p className="text-text-sub">총 {filteredResults.length}개의 응답이 수집되었습니다.</p>
      </div>

      {/* 필터링 및 다운로드 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-sub">시작일:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-sub">종료일:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-text-sub">차트 타입:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="border border-border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary transition-all"
            >
              <option value="bar">막대 그래프</option>
              <option value="pie">원형 그래프</option>
              <option value="line">선 그래프</option>
            </select>
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleDownloadCSV}
              className="px-6 py-2 bg-success text-white rounded-lg hover:opacity-90 font-medium transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV 다운로드
            </button>
            {/* 추가: PDF 내보내기 버튼 */}
            <button
              onClick={handleDownloadPDF}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 font-medium transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF 내보내기
            </button>
          </div>
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
                className="bg-white rounded-xl shadow-md p-6"
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

      {/* 응답자 목록 */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-text-main">응답자 목록</h3>
          <span className="text-sm text-text-sub">총 {filteredResults.length}개 응답</span>
        </div>
        <div className="divide-y divide-border">
          {filteredResults.map((r, i) => (
            <div
              key={r.id || i}
              className="py-3 px-2 flex justify-between items-center text-sm text-text-main hover:bg-bg cursor-pointer transition-colors rounded"
              onClick={() => setSelectedResponse(r)}
            >
              <span className="font-medium">응답 {i + 1}</span>
              <span className="text-text-sub">
                {r.submittedAt ? new Date(r.submittedAt).toLocaleString('ko-KR') : '날짜 없음'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 응답 상세 모달 */}
      {selectedResponse && (
        <Modal response={selectedResponse} onClose={() => setSelectedResponse(null)} />
      )}
    </div>
  );
}
