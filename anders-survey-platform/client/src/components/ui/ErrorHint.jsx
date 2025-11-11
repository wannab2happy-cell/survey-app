// 참가자용 오류 메시지 표시 컴포넌트
// anders 스타일: 빨간색 배경, 흰색 텍스트

import { motion } from 'framer-motion';

export default function ErrorHint({ message, visible = true }) {
  if (!visible || !message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="mt-2 px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-medium"
    >
      {message}
    </motion.div>
  );
}



