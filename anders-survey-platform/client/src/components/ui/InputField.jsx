// 참가자용 입력 필드 컴포넌트
// anders 스타일: 아이콘 + 플레이스홀더 + 레이블

export default function InputField({
  type = 'text',
  placeholder,
  value,
  onChange,
  icon,
  label,
  error = null,
  required = false,
  color = '#6B46C1',
  koreanSpacingWrap = false
}) {
  const inputId = `input-${Math.random().toString(36).substr(2, 9)}`;

  // 아이콘 렌더링 헬퍼
  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      // 이모지나 텍스트 아이콘
      return <span className="text-xl">{icon}</span>;
    }
    // React 컴포넌트
    return icon;
  };

  // 브랜딩 색상 처리
  const actualColor = typeof color === 'string' && color.startsWith('#') 
    ? color 
    : (typeof color === 'string' && color.includes('var') 
        ? '#7C3AED'
        : (color || '#7C3AED'));

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center" style={{ color: actualColor }}>
            {renderIcon()}
          </div>
        )}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className={`
            w-full px-5 py-3.5 rounded-xl border-2 transition-all bg-white text-gray-900 placeholder-gray-400
            ${icon ? 'pl-12' : ''}
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
            }
          `}
          style={!error ? {
            borderColor: '#e5e7eb',
            fontSize: '15px',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            '--tw-ring-color': `${actualColor}40`,
            ...(koreanSpacingWrap ? {
              wordBreak: 'keep-all',
              whiteSpace: 'pre-wrap'
            } : {})
          } : {
            fontSize: '15px',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            ...(koreanSpacingWrap ? {
              wordBreak: 'keep-all',
              whiteSpace: 'pre-wrap'
            } : {})
          }}
          onFocus={(e) => {
            if (!error) {
              e.target.style.borderColor = actualColor;
            }
          }}
          onBlur={(e) => {
            if (!error) {
              e.target.style.borderColor = '#e5e7eb';
            }
          }}
        />
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
}

