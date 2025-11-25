// 통일된 Card 컴포넌트
// 일관된 패딩, 그림자, 둥근 모서리 제공

export default function Card({
  children,
  className = '',
  padding = 'md',
  shadow = 'md',
  hover = false,
  ...props
}) {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  const shadowStyles = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const hoverClass = hover ? 'transition-shadow duration-200 hover:shadow-lg' : '';

  return (
    <div
      className={`
        bg-white rounded-lg border border-gray-200
        ${paddingStyles[padding]}
        ${shadowStyles[shadow]}
        ${hoverClass}
        ${className}
      `}
      style={{
        fontFamily: 'var(--font-body, Pretendard, sans-serif)'
      }}
      {...props}
    >
      {children}
    </div>
  );
}

