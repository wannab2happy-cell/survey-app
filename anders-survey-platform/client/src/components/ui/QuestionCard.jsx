// 참가자용 질문 카드 컴포넌트
// anders 스타일: 원 스크린 원 포커스, 깔끔한 카드 디자인

import { motion } from 'framer-motion';

export default function QuestionCard({ 
  questionNumber, 
  title, 
  required = false,
  children,
  error = null 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full px-4 py-2"
    >
      <div className="bg-white rounded-2xl shadow-lg p-3">
        {/* 질문 번호 및 제목 */}
        <div className="mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold" style={{ color: '#6B46C1' }}>
              Q{questionNumber}.
            </span>
            {required && (
              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">
                필수
              </span>
            )}
          </div>
          <h2 className="text-xl font-semibold text-gray-900 leading-relaxed">
            {title}
          </h2>
        </div>

        {/* 질문 내용 */}
        <div className="mb-3">
          {children}
        </div>

        {/* 에러 메시지 */}
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200"
          >
            <p className="text-sm text-red-600">{error}</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}



