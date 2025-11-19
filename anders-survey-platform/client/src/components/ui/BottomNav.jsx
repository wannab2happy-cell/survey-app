// 참가자용 하단 고정 네비게이션
// anders 스타일: 보라색 버튼, 오른쪽 화살표
// 템플릿 색상 적용: Primary(강조) + Secondary(보조) 그라데이션

import { motion } from 'framer-motion';

export default function BottomNav({ 
  onNext, 
  onPrevious, 
  showPrevious = true, 
  nextLabel = '다음',
  previousLabel = '이전',
  disabled = false,
  color = 'var(--primary)', // Primary 색상 (강조 색상)
  secondaryColor = null, // Secondary 색상 (보조 색상)
  buttonShape = 'rounded-lg'
}) {
  // 색상 처리
  const actualColor = typeof color === 'string' && color.startsWith('#') 
    ? color 
    : (typeof color === 'string' && color.includes('var') 
        ? '#7C3AED'
        : (color || '#7C3AED'));

  const actualSecondaryColor = secondaryColor && typeof secondaryColor === 'string' && secondaryColor.startsWith('#')
    ? secondaryColor
    : (secondaryColor && typeof secondaryColor === 'string' && secondaryColor.includes('var')
        ? '#A78BFA'
        : (secondaryColor || '#A78BFA'));
  return (
    <div className="w-full bg-transparent border-t border-gray-200 py-4 px-5 safe-area-bottom" style={{ borderColor: 'rgba(0, 0, 0, 0.1)', boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.04)' }}>
      <div className="max-w-md mx-auto flex gap-3 justify-center">
        {showPrevious && (
          <button
            onClick={onPrevious}
            className={`px-6 py-3.5 ${buttonShape} border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all active:scale-95`}
            style={{
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '0.01em',
              transition: 'all 0.2s ease'
            }}
          >
            {previousLabel}
          </button>
        )}
        <motion.button
          onClick={onNext}
          disabled={disabled}
          className={`w-[50%] px-6 py-3.5 ${buttonShape} font-semibold text-white transition-all ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90 active:scale-95'
          }`}
          whileHover={disabled ? {} : { 
            scale: 1.02,
            background: `linear-gradient(135deg, ${actualColor} 0%, ${actualSecondaryColor} 100%)`
          }}
          whileTap={disabled ? {} : { scale: 0.98 }}
          style={{ 
            background: disabled ? '#9CA3AF' : `linear-gradient(135deg, ${actualColor} 0%, ${actualSecondaryColor} 100%)`,
            fontSize: '15px',
            fontWeight: 600,
            letterSpacing: '0.01em',
            boxShadow: disabled ? 'none' : `0 4px 12px ${actualColor}30, 0 0 0 1px rgba(0, 0, 0, 0.1)`,
            transition: 'all 0.2s ease'
          }}
        >
          <span className="flex items-center justify-center gap-2">
            {nextLabel}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: 2.5 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </span>
        </motion.button>
      </div>
    </div>
  );
}



