// 참가자용 진행률 바 컴포넌트 (미니멀 버전)
// 기능 유지, 디자인 최소화

export default function ProgressBar({ current, total, color = 'var(--primary)', secondaryColor = null, onBack }) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  // 브랜딩 색상 처리
  const actualColor = typeof color === 'string' && color.startsWith('#') 
    ? color 
    : (typeof color === 'string' && color.includes('var') 
        ? '#7C3AED'
        : (color || '#7C3AED'));

  // 보조 색상 처리 (미완료 부분에 사용)
  const actualSecondaryColor = secondaryColor && typeof secondaryColor === 'string' && secondaryColor.startsWith('#')
    ? secondaryColor
    : (secondaryColor && typeof secondaryColor === 'string' && secondaryColor.includes('var')
        ? '#F59E0B'
        : (secondaryColor || '#E5E7EB')); // 기본값: 회색

  // 보조 색상을 rgba로 변환 (투명도 25%)
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const secondaryRgb = hexToRgb(actualSecondaryColor) || { r: 229, g: 231, b: 235 };
  const incompleteBgColor = `rgba(${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}, 0.25)`;

  // 진행바 배경색을 rgba로 변환 (투명도 90% = 0.9)
  const primaryRgb = hexToRgb(actualColor) || { r: 124, g: 58, b: 237 };
  const progressBgColor = `rgba(${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}, 0.9)`;

  return (
    <div className="flex items-center gap-3" style={{ maxWidth: '85%', margin: '0 auto' }}>
      {/* 뒤로가기 버튼 */}
      <button
        type="button"
        onClick={onBack || (() => window.history.back())}
        className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all active:scale-95 flex-shrink-0"
        aria-label="이전"
        style={{ transition: 'all 0.2s ease' }}
      >
        <svg className="w-5 h-5" style={{ color: actualColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: 2.5 }}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      
      {/* 진행률 바 - 투명도 90% 적용 */}
      <div 
        className="flex-1 rounded-full overflow-hidden relative"
        style={{ 
          height: '16px',
          backgroundColor: incompleteBgColor,
          boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.1)',
          opacity: 0.9
        }}
      >
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative"
          style={{ 
            width: `${percentage}%`,
            backgroundColor: progressBgColor,
            boxShadow: `
              0 2px 4px ${actualColor}60,
              0 1px 2px rgba(0, 0, 0, 0.2),
              inset 0 -1px 2px rgba(0, 0, 0, 0.1)
            `
          }}
        />
      </div>
      
      {/* 진행률 텍스트 - 가시성 개선 */}
      <span 
        className="text-xs font-bold min-w-[2.5rem] text-right flex-shrink-0"
        style={{
          fontSize: '13px',
          letterSpacing: '0.02em',
          color: '#1F2937', // 진한 회색으로 변경
          fontWeight: 700,
          textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)' // 가독성 향상을 위한 텍스트 그림자
        }}
      >
        {current}/{total}
      </span>
    </div>
  );
}



