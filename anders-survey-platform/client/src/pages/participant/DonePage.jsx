// 참가자용 완료 페이지
// anders 스타일: 완료 메시지, 체크 아이콘, 애니메이션

import { motion } from 'framer-motion';

export default function DonePage({ 
  survey,
  color = 'var(--primary)',
  buttonShape = 'rounded-lg'
}) {
  const title = survey?.ending?.title || '설문이 완료되었습니다!';
  const message = survey?.ending?.message || survey?.ending?.description || survey?.ending?.content || '귀하의 소중한 의견에 감사드립니다.';
  const linkUrl = survey?.ending?.linkUrl || '';
  const linkText = survey?.ending?.linkText || '더 알아보기';

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full"
      >
        {/* 완료 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="mb-8 flex justify-center"
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg"
            style={{ backgroundColor: color }}
          >
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </motion.div>

        {/* 제목 */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl font-bold text-gray-900 mb-4"
        >
          {title}
        </motion.h1>

        {/* 메시지 */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg text-gray-600 mb-8"
        >
          {message}
        </motion.p>

        {/* 외부 링크 버튼 */}
        {linkUrl && (
          <motion.a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-3 px-6 py-3 ${buttonShape} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 mt-8`}
            style={{ backgroundColor: color }}
          >
            <span>{linkText}</span>
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </motion.a>
        )}

        {/* 추가 콘텐츠 (ending.content가 있으면 표시) */}
        {survey?.ending?.content && survey.ending.content !== message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 p-6 bg-white rounded-xl shadow-md"
          >
            <div 
              className="text-gray-700 whitespace-pre-line"
              dangerouslySetInnerHTML={{ __html: survey.ending.content }}
            />
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}



