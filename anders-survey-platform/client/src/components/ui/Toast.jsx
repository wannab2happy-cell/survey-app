// 토스트 메시지 컴포넌트
// 사용자에게 알림 메시지를 표시

export default function Toast({ message, type = 'info', onClose }) {
  const typeStyles = {
    success: {
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      icon: '✅'
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: '❌'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: 'ℹ️'
    },
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      className={`
        ${style.bg} ${style.border} ${style.text}
        px-4 py-3 rounded-lg border shadow-lg
        flex items-center gap-3 min-w-[300px] max-w-md
      `}
      style={{
        fontFamily: 'var(--font-body, Pretendard, sans-serif)'
      }}
    >
      <span className="text-lg flex-shrink-0">{style.icon}</span>
      <span className="flex-1 text-sm font-medium">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
          aria-label="닫기"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}








