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
  color = 'var(--primary)',
  buttonShape = 'rounded-lg'
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

  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">응답 검토</h1>
          <p className="text-gray-600">응답을 확인하고 제출해주세요</p>
        </motion.div>

        {/* 필수 항목 누락 경고 */}
        {missingQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-xl bg-red-50 border-2 border-red-200"
          >
            <p className="text-red-600 font-semibold mb-2">
              필수 항목이 누락되었습니다 ({missingQuestions.length}개)
            </p>
            <ul className="list-disc list-inside text-sm text-red-600">
              {missingQuestions.map((q, idx) => (
                <li key={idx}>{q.title || q.text || q.content || `질문 ${idx + 1}`}</li>
              ))}
            </ul>
          </motion.div>
        )}

        {/* 응답 목록 */}
        <div className="space-y-4">
          {questions.map((question, idx) => {
            const questionId = question._id || question.id;
            const answer = answers[questionId];
            const isExpanded = expandedQuestion === questionId;

            return (
              <motion.div
                key={questionId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-xl shadow-md p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-bold" style={{ color }}>
                        Q{idx + 1}.
                      </span>
                      {question.required && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                          필수
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {question.title || question.text || question.content || '질문'}
                    </h3>
                  </div>
                  <button
                    onClick={() => onEdit(idx)}
                    className={`ml-4 px-4 py-2 ${buttonShape} border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors`}
                  >
                    수정
                  </button>
                </div>
                <div className="mt-4 p-4 rounded-lg bg-gray-50">
                  <p className="text-gray-700">
                    {formatAnswer(question, answer)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <BottomNav
        onNext={onSubmit}
        onPrevious={() => onEdit(questions.length - 1)}
        showPrevious={true}
        nextLabel={onSubmitLoading ? '제출 중...' : '제출 완료'}
        previousLabel="이전"
        disabled={onSubmitLoading || missingQuestions.length > 0}
        color={color}
        buttonShape={buttonShape}
      />
    </div>
  );
}



