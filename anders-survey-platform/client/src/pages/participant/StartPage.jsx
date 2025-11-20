// 참가자용 시작 페이지
// 샘플 HTML 기반 디자인 재구성 - 기능은 유지, 디자인만 변경

import { motion } from 'framer-motion';
import { sanitizeHTML } from '../../utils/htmlSanitizer';

export default function StartPage({ 
  survey, 
  onStart, 
  color = '#6B46C1', // Primary 색상 (강조 색상): 버튼, 링크, 강조 텍스트
  secondaryColor = '#A78BFA', // Secondary 색상 (보조 색상): 호버, 그라데이션, 보조 요소
  backgroundColor = '#F3F4F6', // Tertiary 색상 (배경 색상): 전체 배경
  buttonShape = 'rounded-lg', 
  buttonOpacity = 0.9,
  bgImageBase64 = '',
  showButton = true, // 버튼 표시 여부
  qrCodeUrl = '' // QR 코드 URL (퍼블리싱 미리보기용)
}) {
  const coverImage = survey?.cover?.image || survey?.coverImage;
  const title = survey?.title || survey?.cover?.title || '제목';
  const subtitle = survey?.cover?.subtitle || survey?.cover?.description || survey?.description || '부제목이 들어갑니다';
  const buttonText = survey?.cover?.buttonText || '설문 시작하기';
  const logoBase64 = survey?.cover?.logoBase64 || survey?.branding?.logoBase64;

  // 색상 처리 (CSS 변수 또는 hex 값)
  const actualColor = typeof color === 'string' && color.startsWith('#') 
    ? color 
    : (typeof color === 'string' && color.includes('var') 
        ? '#6B46C1'
        : (color || '#6B46C1'));

  const actualSecondaryColor = typeof secondaryColor === 'string' && secondaryColor.startsWith('#') 
    ? secondaryColor 
    : (typeof secondaryColor === 'string' && secondaryColor.includes('var') 
        ? '#A78BFA'
        : (secondaryColor || '#A78BFA'));

  // CSS 변수를 실제 hex 값으로 변환하는 함수
  const resolveColorValue = (color) => {
    if (!color || typeof color !== 'string') return color || '#F3F4F6';
    
    // 이미 hex 값이면 그대로 반환
    if (color.startsWith('#')) {
      return color;
    }
    
    // CSS 변수인 경우 실제 값으로 변환
    if (color.startsWith('var(--')) {
      const varName = color.match(/var\(--([^)]+)\)/)?.[1];
      if (varName) {
        // CSS 변수 값을 가져오기
        const root = document.documentElement;
        const computedValue = getComputedStyle(root).getPropertyValue(`--${varName}`).trim();
        
        if (computedValue) {
          return computedValue;
        }
        
        // CSS 변수 매핑 (기본값)
        const varMap = {
          'success': '#10B981',
          'error': '#EF4444',
          'secondary': '#F59E0B',
          'primary': '#26C6DA',
          'bg': '#F9FAFB',
          'white': '#FFFFFF',
          'color-bg-tertiary': '#F3F4F6'
        };
        
        return varMap[varName] || '#F3F4F6';
      }
    }
    
    // var가 포함되어 있지만 var(-- 형식이 아닌 경우
    if (color.includes('var')) {
      return '#F3F4F6';
    }
    
    return color || '#F3F4F6';
  };

  const actualBackgroundColor = resolveColorValue(backgroundColor);

  // 배경 스타일 결정 (그라데이션 + 배경 이미지)
  const getBackgroundStyle = () => {
    const isValidImage = bgImageBase64 && 
      bgImageBase64.trim() !== '' && 
      (bgImageBase64.startsWith('data:image/') || bgImageBase64.startsWith('http://') || bgImageBase64.startsWith('https://'));
    
    if (isValidImage) {
      return {
        backgroundImage: `url(${bgImageBase64})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: actualBackgroundColor // 이미지 로딩 전 배경색
      };
    }
    // 배경 이미지가 없으면 단색 배경 사용
    return {
      backgroundColor: actualBackgroundColor
    };
  };

  const bgStyle = getBackgroundStyle();

  // buttonShape에 따른 클래스 매핑 (샘플은 pill 형태)
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
        return 'rounded-full'; // 샘플은 pill 형태
    }
  };

  const shapeClass = getShapeClass();

  // 참가자 페이지인지 확인 (SurveyPageV2에서 렌더링되는 경우)
  const isParticipantPage = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/s/') || document.body.classList.contains('participant-page'));

  return (
    <div 
      className="h-screen w-full max-w-full flex items-center justify-center p-0"
      style={{ 
        ...bgStyle,
        width: isParticipantPage ? '100vw' : '100%', 
        maxWidth: '100vw', 
        height: isParticipantPage ? '100vh' : 'auto',
        minHeight: '100vh',
        padding: '30px 0',
        position: isParticipantPage ? 'fixed' : 'relative',
        top: isParticipantPage ? 0 : 'auto',
        left: isParticipantPage ? 0 : 'auto',
        right: isParticipantPage ? 0 : 'auto',
        bottom: isParticipantPage ? 0 : 'auto',
        zIndex: isParticipantPage ? 0 : 'auto',
        overflowY: isParticipantPage ? 'auto' : 'visible',
        // 배경 스타일을 명시적으로 강제
        backgroundColor: bgStyle.backgroundColor || actualBackgroundColor,
        backgroundImage: bgStyle.backgroundImage || 'none',
        backgroundSize: bgStyle.backgroundSize || 'cover',
        backgroundPosition: bgStyle.backgroundPosition || 'center',
        backgroundRepeat: bgStyle.backgroundRepeat || 'no-repeat'
      }}
    >
      {/* 디바이스 뷰 컨테이너 - 미리보기용, 실제 참가자 페이지에서는 투명 */}
      <div 
        className={`w-full max-w-[420px] mx-auto flex flex-col ${isParticipantPage ? '' : 'bg-white rounded-[24px] shadow-lg'}`}
        style={{
          minHeight: '720px',
          padding: '36px 24px',
          boxShadow: isParticipantPage ? 'none' : '0 8px 24px rgba(0, 0, 0, 0.15)',
          backgroundColor: isParticipantPage ? 'transparent' : 'white'
        }}
      >
        {/* 1. 로고 (제일 상단) - 위치 고정 */}
        <div 
          className="w-[56px] h-[56px] mx-auto"
          style={{ 
            marginTop: '0px', 
            marginBottom: '32px'
          }}
        >
          {logoBase64 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
              style={{ 
                borderRadius: '16px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
              }}
            >
              <img
                src={logoBase64}
            alt="Logo"
                className="w-full h-full object-cover"
                style={{ borderRadius: '16px' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
            </motion.div>
          ) : null}
      </div>

        {/* 3. 설문지 제목 - Primary 색상 적용 */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="m-0 text-center mx-auto"
          style={{ 
            fontSize: '25px',
            fontWeight: 700,
            color: actualColor, // Primary 색상으로 강조
            letterSpacing: '-0.02em',
            lineHeight: '1.4',
            marginBottom: '12px',
            width: '75%'
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(title || '') }}
        />

        {/* 4. 부제목 - Secondary 색상 적용 */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="m-0 text-center mx-auto"
            style={{ 
              fontSize: '16px',
              color: actualSecondaryColor, // Secondary 색상으로 보조 강조
              fontWeight: 400,
              lineHeight: '1.6',
              marginBottom: '32px',
              width: '75%'
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(subtitle || '') }}
          />
        )}

        {/* 5. 커버 이미지 영역 - 항상 동일한 높이 유지 (버튼 위치 고정) */}
        {showButton && (
          <div 
            className="w-full"
            style={{
              height: '200px',
              marginTop: '0px',
              marginBottom: '32px'
            }}
          >
        {coverImage ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="w-full h-full overflow-hidden"
              style={{ 
                borderRadius: '20px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)'
              }}
            >
            <img
              src={coverImage}
              alt="Cover"
                className="w-full h-full object-cover"
                style={{ borderRadius: '20px' }}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            </motion.div>
          ) : (
            // 이미지가 없을 때도 동일한 높이의 투명 공간 유지
            <div 
              className="w-full h-full"
              style={{
                borderRadius: '20px'
              }}
            />
          )}
          </div>
        )}

        {/* 6. 설문 참여수 표시 공간 (on/off) - 항상 공간 확보 */}
        {showButton && (
          <div
            style={{ 
              minHeight: '24px',
              marginTop: '0px',
              marginBottom: '24px'
            }}
          >
            {survey?.cover?.showParticipantCount && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="text-center"
                style={{ 
                  fontSize: '15px',
                  color: '#1F2937',
                  fontWeight: 700,
                  letterSpacing: '0.01em',
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.8), 0 1px 1px rgba(0, 0, 0, 0.1)',
                  padding: '8px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  borderRadius: '8px',
                  display: 'inline-block',
                  backdropFilter: 'blur(4px)'
                }}
              >
                현재 <span style={{ color: actualColor, fontWeight: 800, textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)' }}>0명</span>이 참여했습니다
              </motion.div>
            )}
        </div>
      )}

        {/* 7. 시작 버튼 또는 QR 코드 */}
        {showButton ? (
      <motion.button
            initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            whileHover={{ 
              scale: 1.02, 
              boxShadow: `0 8px 24px ${actualColor}40`,
              background: `linear-gradient(135deg, ${actualColor} 0%, ${actualSecondaryColor} 100%)`
            }}
        whileTap={{ scale: 0.98 }}
        onClick={onStart}
            className={`w-[80%] ${shapeClass} border-none text-white cursor-pointer mx-auto block flex items-center justify-center gap-2`}
            style={{
              padding: '13px 18px',
              background: `linear-gradient(135deg, ${actualColor} 0%, ${actualSecondaryColor} 100%)`,
              opacity: buttonOpacity !== undefined ? buttonOpacity : 1,
              fontSize: '15px',
              fontWeight: 600,
              letterSpacing: '0.01em',
              marginTop: '0px',
              marginBottom: '10px',
              boxShadow: `0 4px 12px ${actualColor}30`,
              transition: 'all 0.2s ease'
            }}
          >
            <span>{buttonText}</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ strokeWidth: 2.5 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
      </motion.button>
        ) : qrCodeUrl ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="w-full flex flex-col items-center justify-center"
            style={{
              marginTop: '64px',
              marginBottom: '0px'
            }}
          >
            <div
              className="bg-white rounded-xl p-4 shadow-lg"
              style={{
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
            >
              <img
                src={qrCodeUrl}
                alt="QR Code"
                className="w-[140px] h-[140px]"
                style={{
                  display: 'block',
                  margin: '0 auto'
                }}
              />
            </div>
            <p className="mt-3 text-sm text-gray-600" style={{ fontSize: '13px', color: actualSecondaryColor }}>
              QR 코드를 스캔하여 설문에 참여하세요
            </p>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
}
