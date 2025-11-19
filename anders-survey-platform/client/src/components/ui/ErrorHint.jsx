// 참가자용 오류 메시지 표시 컴포넌트
// 디자인 시스템 v2 적용 - 깔끔하고 명확한 오류 메시지

import { motion } from 'framer-motion';

export default function ErrorHint({ message, visible = true }) {
  if (!visible || !message) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="mt-3 px-4 py-3 rounded-lg bg-red-50 border-2 border-red-200 shadow-sm"
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className="flex-shrink-0 mt-0.5">
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        
        {/* 메시지 */}
        <div className="flex-1">
          <p className="text-sm font-medium text-red-900 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
