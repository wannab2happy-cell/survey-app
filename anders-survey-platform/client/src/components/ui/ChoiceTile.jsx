// 참가자용 선택 옵션 타일 컴포넌트
// 참고 이미지 스타일: 흰색 배경, 보라색 테두리, 라디오 버튼, 중앙 정렬

import { motion } from 'framer-motion';

export default function ChoiceTile({ 
  label, 
  value, 
  selected, 
  onSelect,
  type = 'radio', // 'radio' or 'checkbox'
  color = 'var(--primary)',
  secondaryColor = null // 보조 색상 추가
}) {
  // 브랜딩 색상 처리
  const actualColor = typeof color === 'string' && color.startsWith('#') 
    ? color 
    : (typeof color === 'string' && color.includes('var') 
        ? '#7C3AED'
        : (color || '#7C3AED'));

  // 보조 색상 처리
  const actualSecondaryColor = secondaryColor && typeof secondaryColor === 'string' && secondaryColor.startsWith('#')
    ? secondaryColor
    : (secondaryColor && typeof secondaryColor === 'string' && secondaryColor.includes('var')
        ? '#F59E0B'
        : (secondaryColor || '#F59E0B'));

  // 색상을 RGB로 변환하는 헬퍼 함수
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // 선택된 경우: 보조 색상 배경, hover도 보조 색상
  // 선택 안 된 경우: hover만 보조 색상
  const primaryRgb = hexToRgb(actualColor) || { r: 124, g: 58, b: 237 };
  const secondaryRgb = hexToRgb(actualSecondaryColor) || { r: 245, g: 158, b: 11 };
  
  const selectedBgColor = `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.15)`;
  const hoverBgColor = `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.1)`;

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(value)}
      className="w-full px-5 py-4 rounded-xl border-2 text-left transition-all"
      style={{
        borderColor: selected ? actualColor : '#e5e7eb',
        backgroundColor: selected ? selectedBgColor : 'white',
        boxShadow: selected ? `0 2px 8px ${actualColor}20` : '0 1px 3px rgba(0, 0, 0, 0.05)'
      }}
      onMouseEnter={(e) => {
        if (!selected) {
        e.currentTarget.style.backgroundColor = hoverBgColor;
          e.currentTarget.style.borderColor = actualColor;
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = selected ? selectedBgColor : 'white';
        e.currentTarget.style.borderColor = selected ? actualColor : '#e5e7eb';
      }}
    >
      <div className="flex items-center gap-4">
        {type === 'radio' ? (
        <div 
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
            style={{ 
              borderColor: selected ? actualColor : '#d1d5db',
              borderWidth: '2px'
            }}
        >
          {selected && (
            <div 
                className="w-3.5 h-3.5 rounded-full transition-all"
              style={{ backgroundColor: actualColor }}
            />
          )}
        </div>
        ) : (
          <div 
            className="w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
            style={{ 
              borderColor: selected ? actualColor : '#d1d5db',
              backgroundColor: selected ? actualColor : 'transparent'
            }}
          >
            {selected && (
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: 3 }}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        )}
        <span 
          className="text-base text-gray-900 leading-relaxed"
          style={{
            fontWeight: selected ? 600 : 500,
            fontSize: '15px',
            letterSpacing: '-0.01em',
            lineHeight: '1.5'
          }}
        >
          {label}
        </span>
      </div>
    </motion.button>
  );
}



