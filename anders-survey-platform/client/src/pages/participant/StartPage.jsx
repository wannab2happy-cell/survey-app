// 참가자용 시작 페이지
// anders 스타일: 커버 이미지, 제목, 부제목, 시작 버튼

import { motion } from 'framer-motion';
import ProgressBar from '../../components/ui/ProgressBar';

export default function StartPage({ survey, onStart, color = 'var(--primary)', buttonShape = 'rounded-lg' }) {
  const coverImage = survey?.cover?.image || survey?.coverImage;
  const title = survey?.title || survey?.cover?.title || '설문에 참여해주세요';
  const subtitle = survey?.cover?.subtitle || survey?.description || '소중한 의견을 들려주세요';

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* 진행률 바 (0%) */}
      <div className="w-full px-4 pt-4">
        <ProgressBar current={0} total={1} color={color} />
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* 커버 이미지 */}
          {coverImage && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-8 rounded-2xl overflow-hidden shadow-xl"
            >
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-64 object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </motion.div>
          )}

          {/* 제목 및 부제목 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
            {subtitle && (
              <p className="text-lg text-gray-600">{subtitle}</p>
            )}
          </motion.div>

          {/* 시작 버튼 */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className={`w-full py-4 ${buttonShape} text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all`}
            style={{ backgroundColor: color }}
          >
            <span className="flex items-center justify-center gap-2">
              설문 시작하기
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}



