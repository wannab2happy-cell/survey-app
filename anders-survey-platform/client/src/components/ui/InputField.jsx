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
  color = '#6B46C1'
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

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center" style={{ color }}>
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
            w-full px-4 py-3 rounded-xl border-2 transition-all
            ${icon ? 'pl-12' : ''}
            ${error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
            }
          `}
        />
      </div>
      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
    </div>
  );
}

