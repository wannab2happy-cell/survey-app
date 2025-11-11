// 참가자용 선택 옵션 타일 컴포넌트
// anders 스타일: 큰 터치 타깃, 보라색 선택 상태

import { motion } from 'framer-motion';

export default function ChoiceTile({ 
  label, 
  value, 
  selected, 
  onSelect,
  type = 'radio', // 'radio' or 'checkbox'
  color = 'var(--primary)'
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(value)}
      className={`
        w-full p-4 rounded-xl border-2 text-left transition-all
        ${selected 
          ? 'shadow-md' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
      style={selected ? {
        borderColor: color,
        backgroundColor: `${color}15`,
        borderWidth: '2px',
      } : {}}
    >
      <div className="flex items-center gap-3">
        <div 
          className={`
            w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0
            ${selected ? '' : 'border-gray-300'}
          `}
          style={selected ? {
            borderColor: color,
            backgroundColor: color,
          } : {}}
        >
          {selected && (
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <span className={`flex-1 font-medium ${selected ? 'text-gray-900' : 'text-gray-700'}`}>
          {label}
        </span>
      </div>
    </motion.button>
  );
}



