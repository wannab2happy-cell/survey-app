// 관리자용 설문 카드 컴포넌트
// anders 스타일: 카드 디자인, 상태 배지, 액션 버튼

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const statusColors = {
  draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
  active: { bg: 'bg-green-100', text: 'text-green-700' },
  paused: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  completed: { bg: 'bg-blue-100', text: 'text-blue-700' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const statusLabels = {
  draft: '초안',
  active: '활성',
  paused: '일시정지',
  completed: '완료',
  inactive: '비활성',
};

export default function SurveyCard({ survey, delay = 0 }) {
  const status = survey?.status || 'inactive';
  const statusColor = statusColors[status] || statusColors.inactive;
  const statusLabel = statusLabels[status] || '비활성';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {survey?.title || '제목 없음'}
          </h3>
          {survey?.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{survey.description}</p>
          )}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
          {statusLabel}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        {survey?.createdAt && (
          <span>
            생성: {new Date(survey.createdAt).toLocaleDateString('ko-KR')}
          </span>
        )}
        {survey?.totalResponses !== undefined && (
          <span className="text-base font-bold text-gray-900">응답: {survey.totalResponses}개</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Link
          to={`/admin/builder/${survey?._id || survey?.id}`}
          className="flex-1 px-4 py-2 rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-center"
        >
          편집
        </Link>
        {survey?._id || survey?.id ? (
          <Link
            to={`/admin/results/${survey._id || survey.id}`}
            className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity text-center"
            style={{ backgroundColor: '#26C6DA' }} // 고정 admin 색상
          >
            결과 보기
          </Link>
        ) : null}
      </div>
    </motion.div>
  );
}

