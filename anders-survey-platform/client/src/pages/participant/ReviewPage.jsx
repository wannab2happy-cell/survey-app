// 참가자용 검토 페이지
// anders 스타일: 응답 목록, 수정 버튼, 제출 버튼

import { useState } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../../components/ui/BottomNav';

export default function ReviewPage({
  survey,
  answers,
  onEdit,
  onSubmit,
  onSubmitLoading = false,
  color = 'var(--primary)', // Primary 색상 (강조 색상)
  secondaryColor = null, // Secondary 색상 (보조 색상)
  backgroundColor = '#F3F4F6', // Tertiary 색상 (배경 색상)
  buttonShape = 'rounded-lg',
  bgImageBase64 = ''
}) {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const questions = survey?.questions || [];
  const missingQuestions = questions.filter(q => {
    if (!q.required) return false;
    const questionId = q._id || q.id;
    const answer = answers[questionId];
    return !answer || 
      (Array.isArray(answer) && answer.length === 0) ||
      (typeof answer === 'string' && answer.trim() === '');
  });

  const formatAnswer = (question, answer) => {
    if (!answer) return '답변 없음';
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return String(answer);
  };

  // 색상 처리
  const actualColor = typeof color === 'string' && color.startsWith('#') 
    ? color 
    : (typeof color === 'string' && color.includes('var') 
        ? '#7C3AED'
        : (color || '#7C3AED'));

  const actualSecondaryColor = secondaryColor && typeof secondaryColor === 'string' && secondaryColor.startsWith('#')
    ? secondaryColor
    : (secondaryColor && typeof secondaryColor === 'string' && secondaryColor.includes('var')
        ? '#A78BFA'
        : (secondaryColor || '#A78BFA'));

  const actualBackgroundColor = typeof backgroundColor === 'string' && backgroundColor.startsWith('#')
    ? backgroundColor
    : (typeof backgroundColor === 'string' && backgroundColor.includes('var')
        ? '#F3F4F6'
        : (backgroundColor || '#F3F4F6'));

  // 배경 스타일 결정 (그라데이션 + 배경 이미지)
  const getBackgroundStyle = () => {
    const isValidImage = bgImageBase64 && 
      bgImageBase64.trim() !== '' && 
      (bgImageBase64.startsWith('data:image/') || bgImageBase64.startsWith('http://') || bgImageBase64.startsWith('https://'));
    
    if (isValidImage) {
      return {
        backgroundImage: `url(${bgImageBase64})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: actualBackgroundColor
      };
    }
    // 배경 이미지가 없으면 단색 배경 사용
    return {
      backgroundColor: actualBackgroundColor
    };
  };

  const bgStyle = getBackgroundStyle();

  // 참가자 페이지인지 확인 (SurveyPageV2에서 렌더링되는 경우)
  const isParticipantPage = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/s/') || document.body.classList.contains('participant-page'));

  return (
    <div 
      className="h-screen w-full max-w-full flex flex-col overflow-hidden safe-area-bottom" 
      style={{ 
        ...bgStyle, 
        width: isParticipantPage ? '100vw' : '100%', 
        maxWidth: '100vw', 
        height: isParticipantPage ? '100vh' : 'auto',
        minHeight: '100vh',
        position: isParticipantPage ? 'fixed' : 'relative',
        top: isParticipantPage ? 0 : 'auto',
        left: isParticipantPage ? 0 : 'auto',
        right: isParticipantPage ? 0 : 'auto',
        bottom: isParticipantPage ? 0 : 'auto',
        zIndex: isParticipantPage ? 0 : 'auto',
        overflowY: isParticipantPage ? 'auto' : 'visible',
        // 배경 스타일을 명시적으로 강제
        backgroundColor: bgStyle.backgroundColor || actualBackgroundColor,
        backgroundImage: bgStyle.backgroundImage || 'none',
        backgroundSize: bgStyle.backgroundSize || 'cover',
        backgroundPosition: bgStyle.backgroundPosition || 'center',
        backgroundRepeat: bgStyle.backgroundRepeat || 'no-repeat'
      }}
    >
      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">응답 검토</h1>
            <p className="text-base sm:text-lg text-gray-600">응답을 확인하고 제출해주세요</p>
          </motion.div>

          {/* 필수 항목 누락 경고 */}
          {missingQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-xl bg-red-50 border-2 border-red-200"
            >
              <p className="text-red-600 font-semibold mb-3 text-sm sm:text-base">
                필수 항목이 누락되었습니다 ({missingQuestions.length}개)
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-red-600">
                {missingQuestions.map((q, idx) => (
                  <li key={idx}>{q.title || q.text || q.content || `질문 ${idx + 1}`}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* 응답 목록 */}
          <div className="space-y-4 sm:space-y-5 pb-4">
            {questions.map((question, idx) => {
              const questionId = question._id || question.id;
              const answer = answers[questionId];
              const isExpanded = expandedQuestion === questionId;

              return (
                <motion.div
                  key={questionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white" style={{ backgroundColor: color }}>
                          {idx + 1}
                        </span>
                        {question.required && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                            필수
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed mb-3">
                        {question.title || question.text || question.content || '질문'}
                      </h3>
                    </div>
                    <button
                      onClick={() => onEdit(idx)}
                      className={`w-full sm:w-auto sm:ml-4 px-5 py-2.5 ${buttonShape} border-2 border-gray-300 text-gray-700 text-sm sm:text-base font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all whitespace-nowrap`}
                    >
                      수정
                    </button>
                  </div>
                  <div className="mt-4 p-4 sm:p-5 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-base sm:text-lg text-gray-800 break-words leading-relaxed font-medium">
                      {formatAnswer(question, answer)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 (고정) */}
      <div className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t border-gray-200" style={{ backgroundColor: bgStyle.backgroundColor || 'rgba(255, 255, 255, 0.95)', backdropFilter: bgImageBase64 ? 'blur(8px)' : 'none' }}>
        <div className="max-w-2xl mx-auto">
          <BottomNav
            onNext={onSubmit}
            onPrevious={() => onEdit(questions.length - 1)}
            showPrevious={true}
            nextLabel={onSubmitLoading ? '제출 중...' : '제출하기'}
            previousLabel="수정하기"
            disabled={onSubmitLoading || missingQuestions.length > 0}
            color={actualColor}
            secondaryColor={actualSecondaryColor}
            buttonShape={buttonShape}
          />
        </div>
      </div>
    </div>
  );
}



