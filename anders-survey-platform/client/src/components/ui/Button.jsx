// 통일된 Button 컴포넌트
// Admin과 Participant 영역 모두에서 사용 가능

import { motion } from 'framer-motion';

/**
 * Button 컴포넌트
 * @param {string} variant - 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} disabled - 비활성화 여부
 * @param {boolean} loading - 로딩 상태
 * @param {string} className - 추가 클래스명
 * @param {React.ReactNode} children - 버튼 내용
 * @param {React.ReactNode} icon - 아이콘 (선택사항)
 * @param {string} iconPosition - 'left' | 'right'
 */
export default function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  children,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  ...props
}) {
  // Admin 영역인지 확인
  const isAdminTheme = document.querySelector('.admin-theme') !== null;

  // Admin 영역은 고정 색상 사용
  const adminColors = {
    primary: {
      bg: '#26C6DA',
      hover: '#00ACC1',
      text: '#FFFFFF'
    },
    secondary: {
      bg: '#F3F4F6',
      hover: '#E5E7EB',
      text: '#374151',
      border: '#E5E7EB'
    },
    tertiary: {
      bg: 'transparent',
      hover: '#F9FAFB',
      text: '#6B7280'
    },
    danger: {
      bg: '#EF4444',
      hover: '#DC2626',
      text: '#FFFFFF'
    },
    ghost: {
      bg: 'transparent',
      hover: '#F9FAFB',
      text: '#6B7280'
    }
  };

  // 크기별 스타일
  const sizeStyles = {
    sm: {
      padding: '8px 16px',
      fontSize: '14px',
      gap: '6px'
    },
    md: {
      padding: '10px 20px',
      fontSize: '14px',
      gap: '8px'
    },
    lg: {
      padding: '12px 24px',
      fontSize: '16px',
      gap: '8px'
    }
  };

  const currentSize = sizeStyles[size];

  // variant별 스타일 결정
  const getVariantStyles = () => {
    if (isAdminTheme) {
      const adminVariant = adminColors[variant] || adminColors.primary;
      return {
        backgroundColor: disabled ? '#9CA3AF' : adminVariant.bg,
        color: adminVariant.text,
        border: variant === 'secondary' || variant === 'tertiary' ? `1px solid ${adminVariant.border || '#E5E7EB'}` : 'none',
        '--hover-bg': adminVariant.hover,
        '--hover-color': adminVariant.text
      };
    } else {
      // Participant 영역 (브랜드 색상 사용)
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: disabled ? '#9CA3AF' : 'var(--brand-primary, #26C6DA)',
            color: '#FFFFFF',
            border: 'none',
            '--hover-bg': 'var(--brand-primary, #26C6DA)',
            '--hover-opacity': '0.9'
          };
        case 'secondary':
          return {
            backgroundColor: '#F3F4F6',
            color: '#374151',
            border: '1px solid #E5E7EB',
            '--hover-bg': '#E5E7EB'
          };
        case 'tertiary':
          return {
            backgroundColor: 'transparent',
            color: 'var(--brand-primary, #26C6DA)',
            border: 'none',
            '--hover-bg': '#F9FAFB'
          };
        case 'danger':
          return {
            backgroundColor: disabled ? '#9CA3AF' : '#EF4444',
            color: '#FFFFFF',
            border: 'none',
            '--hover-bg': '#DC2626'
          };
        case 'ghost':
          return {
            backgroundColor: 'transparent',
            color: '#6B7280',
            border: 'none',
            '--hover-bg': '#F9FAFB'
          };
        default:
          return {
            backgroundColor: disabled ? '#9CA3AF' : 'var(--brand-primary, #26C6DA)',
            color: '#FFFFFF',
            border: 'none'
          };
      }
    }
  };

  const variantStyles = getVariantStyles();

  const baseClasses = `
    inline-flex items-center justify-center
    font-medium rounded-lg
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `;

  const focusRingColor = isAdminTheme 
    ? 'focus:ring-cyan-500' 
    : 'focus:ring-[var(--brand-primary)]';

  return (
    <motion.button
      className={`${baseClasses} ${focusRingColor}`}
      style={{
        ...variantStyles,
        padding: currentSize.padding,
        fontSize: currentSize.fontSize,
        gap: `${parseInt(currentSize.gap)}px`,
        fontFamily: 'var(--font-body, Pretendard, sans-serif)',
        fontWeight: 600,
        letterSpacing: '0.01em',
        boxShadow: disabled || variant === 'ghost' || variant === 'tertiary' 
          ? 'none' 
          : '0 1px 2px rgba(0, 0, 0, 0.1)',
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? {
        scale: 1.02,
        backgroundColor: variantStyles['--hover-bg'] || variantStyles.backgroundColor,
        boxShadow: variant === 'ghost' || variant === 'tertiary' 
          ? 'none' 
          : '0 2px 4px rgba(0, 0, 0, 0.15)'
      } : {}}
      whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>처리 중...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>}
          <span>{children}</span>
          {icon && iconPosition === 'right' && <span className="flex-shrink-0">{icon}</span>}
        </>
      )}
    </motion.button>
  );
}

