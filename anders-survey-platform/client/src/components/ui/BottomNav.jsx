// 참가자용 하단 고정 네비게이션
// anders 스타일: 보라색 버튼, 오른쪽 화살표

import { motion } from 'framer-motion';

export default function BottomNav({ 
  onNext, 
  onPrevious, 
  showPrevious = true, 
  nextLabel = '다음',
  previousLabel = '이전',
  disabled = false,
  color = 'var(--primary)',
  buttonShape = 'rounded-lg'
}) {
  return (
    <div className="w-full bg-white border-t border-gray-200 p-4 safe-area-bottom">
      <div className="max-w-md mx-auto flex gap-3">
        {showPrevious && (
          <button
            onClick={onPrevious}
            className={`flex-1 px-6 py-3 ${buttonShape} border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors`}
          >
            {previousLabel}
          </button>
        )}
        <button
          onClick={onNext}
          disabled={disabled}
          className={`flex-1 px-6 py-3 ${buttonShape} font-semibold text-white transition-all ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'
          }`}
          style={{ backgroundColor: disabled ? '#9CA3AF' : color }}
        >
          <span className="flex items-center justify-center gap-2">
            {nextLabel}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </button>
      </div>
    </div>
  );
}



