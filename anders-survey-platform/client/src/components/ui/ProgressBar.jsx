// 참가자용 진행률 바 컴포넌트
// anders 스타일: 상단 고정, 보라색 진행, 현재/전체 표시

import { motion } from 'framer-motion';

export default function ProgressBar({ current, total, color = 'var(--primary)' }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden relative">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />
      <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-600">
        {current}/{total}
      </div>
    </div>
  );
}



