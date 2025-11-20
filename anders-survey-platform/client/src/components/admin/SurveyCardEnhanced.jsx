// 설문 카드 컴포넌트 (향상된 버전)
// 상태, 응답 수, 기간, 분석/편집/배포 버튼 포함

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import { motion } from 'framer-motion';

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

export default function SurveyCardEnhanced({ survey, onUpdate }) {
  const navigate = useNavigate();
  const [responseCount, setResponseCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);

  useEffect(() => {
    fetchResponseCount();
  }, [survey]);

  const fetchResponseCount = async () => {
    try {
      const surveyId = survey._id || survey.id;
      const response = await axiosInstance.get(`/surveys/${surveyId}/results`);
      const resultData = response.data;
      const count = resultData.success 
        ? (resultData.data?.totalResponses || resultData.totalResponses || 0)
        : (resultData.totalResponses || 0);
      setResponseCount(count);
    } catch (err) {
      console.warn('응답 수 조회 실패:', err);
      setResponseCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      const surveyId = survey._id || survey.id;
      const surveyUrl = `${window.location.origin}/s/${surveyId}`;
      await navigator.clipboard.writeText(surveyUrl);
      alert('링크가 클립보드에 복사되었습니다.');
    } catch (err) {
      alert('링크 복사에 실패했습니다.');
    }
  };

  const handleGenerateQR = () => {
    const surveyId = survey._id || survey.id;
    const surveyUrl = `${window.location.origin}/s/${surveyId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(surveyUrl)}`;
    setQrCodeUrl(qrUrl);
  };

  const handleDownloadQR = (format = 'png') => {
    if (!qrCodeUrl) return;
    
    const surveyId = survey._id || survey.id;
    const fileName = `survey-${surveyId}-qrcode.${format}`;
    
    if (format === 'svg') {
      fetch(qrCodeUrl.replace('png', 'svg'))
        .then(response => response.text())
        .then(svgText => {
          const blob = new Blob([svgText], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(url);
        });
    } else {
      fetch(qrCodeUrl)
        .then(response => response.blob())
        .then(blob => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          link.click();
          URL.revokeObjectURL(url);
        });
    }
  };

  const formatDateRange = () => {
    const startAt = survey.startAt;
    const endAt = survey.endAt;
    
    if (!startAt && !endAt) return '기간 미설정';
    
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
    
    return '기간 미설정';
  };

  const statusConfig = getStatusConfig(survey.status || 'inactive');
  const surveyId = survey._id || survey.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
            {survey.title || '제목 없음'}
          </h3>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`}></span>
              {statusConfig.label}
            </span>
            <span className="text-base font-bold text-gray-900">
              {loading ? '로딩 중...' : `${responseCount}개 응답`}
            </span>
            <span className="text-sm text-gray-500">
              {formatDateRange()}
            </span>
          </div>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => navigate(`/admin/results/${surveyId}`)}
          className="flex-1 px-3 py-2 text-sm font-medium bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          분석
        </button>
        <button
          onClick={() => navigate(`/admin/builder/${surveyId}`)}
          className="flex-1 px-3 py-2 text-sm font-medium bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          편집
        </button>
        <div className="relative flex-1">
          <button
            onClick={handleCopyLink}
            className="w-full px-3 py-2 text-sm font-medium bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            배포
          </button>
          {qrCodeUrl && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-10">
              <div className="flex flex-col gap-2">
                <img src={qrCodeUrl} alt="QR Code" className="w-full" />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownloadQR('png')}
                    className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    PNG
                  </button>
                  <button
                    onClick={() => handleDownloadQR('svg')}
                    className="flex-1 px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    SVG
                  </button>
                </div>
                <button
                  onClick={() => setQrCodeUrl(null)}
                  className="w-full px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  닫기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR 코드 생성 버튼 (배포 버튼에 통합) */}
      {!qrCodeUrl && (
        <button
          onClick={handleGenerateQR}
          className="mt-2 w-full px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          QR 코드 생성
        </button>
      )}
    </motion.div>
  );
}


