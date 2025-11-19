// 참가자용 질문 카드 컴포넌트
// 참고 이미지 스타일: 흰색 배경, 큰 질문 번호, 중앙 정렬

import { motion } from 'framer-motion';

export default function QuestionCard({ 
  questionNumber, 
  title, 
  required = false,
  children,
  error = null,
  color = 'var(--primary)'
}) {
  // 브랜딩 색상 처리
  const actualColor = typeof color === 'string' && color.startsWith('#') 
    ? color 
    : (typeof color === 'string' && color.includes('var') 
        ? '#7C3AED'
        : (color || '#7C3AED'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      {/* 질문 번호 및 제목 - 중앙 정렬 */}
      <div className="text-center mb-8">
        <div 
          className="text-5xl font-bold mb-4"
          style={{ 
            color: actualColor,
            letterSpacing: '-0.03em',
            lineHeight: '1'
          }}
        >
          Q{questionNumber}
        </div>
        <h2 
          className="text-lg text-gray-900 leading-relaxed font-medium"
          style={{
            fontSize: '18px',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            lineHeight: '1.6'
          }}
        >
          {title}
          {required && (
            <span className="text-red-500 ml-1.5" style={{ fontSize: '20px' }}>*</span>
          )}
        </h2>
      </div>

      {/* 질문 내용 */}
      <div className="mb-4">
        {children}
      </div>

      {/* 에러 메시지 */}
      {error && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-5 p-4 rounded-xl bg-red-50 border-2 border-red-200 flex items-start gap-3"
        >
          <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: 2.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p 
            className="text-sm text-red-700 font-medium"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '1.5'
            }}
          >
            {error}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}



