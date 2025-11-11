// 관리자용 통계 카드 컴포넌트
// anders 스타일: 색상별 배경, 아이콘, 큰 숫자

import { motion } from 'framer-motion';

const colorSchemes = {
  purple: { bg: 'var(--primary)', light: '#E0F7FA' },
  blue: { bg: '#3B82F6', light: '#DBEAFE' },
  orange: { bg: 'var(--secondary)', light: '#FEF3C7' },
  green: { bg: 'var(--success)', light: '#D1FAE5' },
  red: { bg: 'var(--error)', light: '#FEE2E2' },
};

export default function StatCard({ 
  title, 
  value, 
  icon, 
  color = 'purple',
  delay = 0 
}) {
  const scheme = colorSchemes[color] || colorSchemes.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="rounded-xl p-6 shadow-md"
      style={{ backgroundColor: scheme.bg }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: scheme.light }}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
      <div className="text-white">
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}

