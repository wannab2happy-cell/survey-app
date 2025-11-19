// 관리자용 통계 카드 컴포넌트
// anders 스타일: 색상별 배경, 아이콘, 큰 숫자

import { motion } from 'framer-motion';

const colorSchemes = {
  purple: { bg: '#26C6DA', light: '#E0F7FA' }, // 고정 admin 색상
  blue: { bg: '#3B82F6', light: '#DBEAFE' },
  orange: { bg: '#F59E0B', light: '#FEF3C7' }, // 고정 admin 색상
  green: { bg: '#10B981', light: '#D1FAE5' }, // 고정 admin 색상
  red: { bg: '#EF4444', light: '#FEE2E2' }, // 고정 admin 색상
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
          <div style={{ color: scheme.bg }}>
            {icon}
          </div>
        </div>
      </div>
      <div className="text-white">
        <p className="text-sm opacity-90 mb-1">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}

