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
  koreanSpacingWrap = false,
  buttonShape = 'rounded-lg',
  backgroundColor = '#F3F4F6',
  bgImageBase64 = ''
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

  // buttonShape에 따른 border-radius 클래스 매핑
  const getShapeClass = () => {
    switch (buttonShape) {
      case 'square':
      case 'rounded-none':
        return 'rounded-none';
      case 'pill':
      case 'rounded-full':
        return 'rounded-full';
      case 'rounded':
      case 'rounded-lg':
      default:
        return 'rounded-lg';
    }
  };

  const shapeClass = getShapeClass();

  // 배경 밝기 계산 함수
  const getBackgroundBrightness = () => {
    if (!backgroundColor) return 255; // 기본값: 밝음
    
    // hex 색상을 RGB로 변환
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb = hexToRgb(backgroundColor);
    if (!rgb) return 255;

    // 상대적 밝기 계산 (0-255)
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness;
  };

  // 배경 이미지가 있는지 확인
  const hasBackgroundImage = bgImageBase64 && 
    bgImageBase64.trim() !== '' && 
    (bgImageBase64.startsWith('data:image/') || bgImageBase64.startsWith('http://') || bgImageBase64.startsWith('https://'));

  // 입력창 스타일 결정 (배경에 따라)
  const getInputStyle = () => {
    const brightness = getBackgroundBrightness();
    const isDarkBackground = brightness < 128; // 128 미만이면 어두운 배경
    const hasBgImage = hasBackgroundImage;

    // 배경 이미지가 있으면 반투명 배경 사용
    if (hasBgImage) {
      return {
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderColor: isDarkBackground ? 'rgba(255, 255, 255, 0.5)' : actualColor, // 기본 테두리 색상을 강조색으로
        color: '#111827',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05)',
        defaultBorderColor: actualColor // 기본 테두리 색상을 강조색으로
      };
    }

    // 배경 이미지가 없으면 배경색 밝기에 따라 결정
    return {
      backgroundColor: isDarkBackground ? 'rgba(255, 255, 255, 0.9)' : '#FFFFFF',
      borderColor: isDarkBackground ? 'rgba(255, 255, 255, 0.3)' : actualColor, // 기본 테두리 색상을 강조색으로
      color: isDarkBackground ? '#FFFFFF' : '#111827',
      boxShadow: isDarkBackground ? '0 4px 12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)' : '0 2px 8px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.05)',
      defaultBorderColor: actualColor // 기본 테두리 색상을 강조색으로
    };
  };

  const inputStyle = getInputStyle();

  return (
    <div className="w-[80%] mx-auto">
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
            w-full px-5 py-3.5 ${shapeClass} border-2 transition-all placeholder-gray-400
            ${icon ? 'pl-12' : ''}
            ${error 
              ? 'border-red-400 focus:ring-red-200' 
              : 'focus:ring-2'
            }
          `}
          style={!error ? {
            ...inputStyle,
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
              e.target.style.setProperty('border-color', actualColor, 'important');
            }
          }}
          onBlur={(e) => {
            if (!error) {
              const defaultColor = inputStyle.defaultBorderColor || inputStyle.borderColor;
              e.target.style.borderColor = defaultColor;
              e.target.style.setProperty('border-color', defaultColor, 'important');
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

