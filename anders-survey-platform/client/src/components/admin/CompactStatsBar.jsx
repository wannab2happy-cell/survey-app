// 컴팩트 통계 바 컴포넌트
// 큰 카드 대신 작은 위젯으로 여러 지표를 한 줄에 표시

import { motion } from 'framer-motion';

export default function CompactStatsBar({ stats, loading = false }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 animate-pulse">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="flex-1">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const formatTime = (seconds) => {
    if (!seconds || seconds === 0) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const statItems = [
    { label: '전체 설문', value: stats.totalSurveys || 0, color: 'text-purple-600' },
    { label: '활성 설문', value: stats.activeSurveys || 0, color: 'text-green-600' },
    { label: '총 응답 수', value: stats.totalResponses || 0, color: 'text-blue-600' },
    { label: '응답률', value: `${stats.avgResponseRate || 0}%`, color: 'text-orange-600' },
    { label: '접속자', value: stats.activeUsers || 0, color: 'text-indigo-600' },
    { label: '소요시간', value: formatTime(stats.avgCompletionTime), color: 'text-gray-600' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-4 border border-gray-200"
    >
      <div className="flex flex-wrap gap-4">
        {statItems.map((item, index) => (
          <div
            key={index}
            className="flex-1 min-w-[120px] text-center px-3 py-2 border-r border-gray-200 last:border-r-0"
          >
            <p className="text-xs text-gray-500 mb-1">{item.label}</p>
            <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

