// 참가자용 완료 페이지
// anders 스타일: 완료 메시지, 체크 아이콘, 애니메이션

import { motion } from 'framer-motion';
import { sanitizeHTML } from '../../utils/htmlSanitizer';

export default function DonePage({ 
  survey,
  color = 'var(--primary)', // Primary 색상 (강조 색상)
  secondaryColor = null, // Secondary 색상 (보조 색상)
  backgroundColor = '#F3F4F6', // Tertiary 색상 (배경 색상)
  buttonShape = 'rounded-lg',
  bgImageBase64 = '',
  buttonOpacity = 0.9,
  onRestart = null // 다시하기 버튼 클릭 핸들러
}) {
  const title = survey?.ending?.title || '설문이 완료되었습니다!';
  const message = survey?.ending?.message || survey?.ending?.description || survey?.ending?.content || '귀하의 소중한 의견에 감사드립니다.';
  const linkUrl = survey?.ending?.linkUrl || '';
  const linkText = survey?.ending?.linkText || '더 알아보기';
  const showRestartButton = survey?.ending?.showRestartButton || false;
  const endingImageBase64 = survey?.ending?.imageBase64 || '';

  // 색상 처리 (먼저 처리)
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

  const actualBackgroundColor = typeof backgroundColor === 'string' && backgroundColor.startsWith('#')
    ? backgroundColor
    : (typeof backgroundColor === 'string' && backgroundColor.includes('var')
        ? '#F3F4F6'
        : (backgroundColor || '#F3F4F6'));

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
        backgroundColor: actualBackgroundColor
      };
    }
    // 배경 이미지가 없으면 단색 배경 사용
    return {
      backgroundColor: actualBackgroundColor
    };
  };

  const bgStyle = getBackgroundStyle();

  // buttonShape에 따른 클래스 매핑
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

  // 참가자 페이지인지 확인 (SurveyPageV2에서 렌더링되는 경우)
  const isParticipantPage = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/s/') || document.body.classList.contains('participant-page'));

  return (
    <div 
      className="h-screen w-full max-w-full flex items-center justify-center px-4 sm:px-6 safe-area-bottom" 
      style={{ 
        ...bgStyle, 
        width: isParticipantPage ? '100vw' : '100%', 
        maxWidth: '100vw', 
        height: isParticipantPage ? '100vh' : 'auto',
        minHeight: '100vh',
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
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md w-full flex flex-col items-center justify-center"
      >
        {/* 완료 아이콘 */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          className="mb-6 flex justify-center"
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg"
            style={{ 
              backgroundColor: actualColor,
              boxShadow: `0 4px 12px ${actualColor}40`
            }}
          >
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ strokeWidth: 3 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </motion.div>

        {/* 제목 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight px-4 leading-tight"
          style={{ 
            color: actualColor,
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: '1.3'
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(title || '') }}
        />

        {/* 메시지 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-lg sm:text-xl mb-8 px-4 leading-relaxed"
          style={{ 
            color: actualSecondaryColor,
            fontSize: '17px',
            fontWeight: 400,
            letterSpacing: '-0.01em',
            lineHeight: '1.7'
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(message || '') }}
        />

        {/* 완료 페이지 이미지 */}
        {endingImageBase64 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mb-8 px-4 w-full max-w-md"
          >
            <img
              src={endingImageBase64}
              alt="완료 이미지"
              className="w-full h-auto rounded-lg shadow-lg object-cover"
              style={{ maxHeight: '400px' }}
              onError={(e) => {
                console.error('완료 이미지 로드 실패:', endingImageBase64);
                e.target.style.display = 'none';
              }}
            />
          </motion.div>
        )}

        {/* 외부 링크 버튼 */}
        {linkUrl && (
          <motion.a
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: buttonOpacity !== undefined ? buttonOpacity : 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ 
              scale: 1.05, 
              opacity: 1, 
              boxShadow: `0 6px 16px ${actualColor}40`,
              background: `linear-gradient(135deg, ${actualColor} 0%, ${actualSecondaryColor} 100%)`
            }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 ${shapeClass} text-white font-semibold shadow-md transition-all duration-300`}
            style={{ 
              background: `linear-gradient(135deg, ${actualColor} 0%, ${actualSecondaryColor} 100%)`,
              opacity: buttonOpacity !== undefined ? buttonOpacity : 1,
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.01em',
              boxShadow: `0 2px 8px ${actualColor}30`,
              color: '#FFFFFF',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
          >
            <span>{linkText}</span>
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ strokeWidth: 2.5 }}
            >
              <path 
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
          </motion.a>
        )}

        {/* 다시하기 버튼 */}
        {showRestartButton && onRestart && (
          <motion.button
            onClick={onRestart}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: buttonOpacity !== undefined ? buttonOpacity : 1, y: 0 }}
            transition={{ duration: 0.5, delay: linkUrl ? 0.6 : 0.5 }}
            whileHover={{ 
              scale: 1.05, 
              opacity: 1, 
              boxShadow: `0 6px 16px ${actualColor}40`
            }}
            whileTap={{ scale: 0.95 }}
            className={`inline-flex items-center gap-2 px-5 py-2.5 ${shapeClass} text-white font-semibold shadow-md transition-all duration-300 mt-4`}
            style={{ 
              backgroundColor: actualColor,
              opacity: buttonOpacity !== undefined ? buttonOpacity : 1,
              fontSize: '14px',
              fontWeight: 600,
              letterSpacing: '0.01em',
              boxShadow: `0 2px 8px ${actualColor}30`,
              color: '#FFFFFF',
              textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
            }}
          >
            <svg 
              className="w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              style={{ strokeWidth: 2.5 }}
            >
              <path 
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
              />
            </svg>
            <span>다시하기</span>
          </motion.button>
        )}


        {/* 추가 콘텐츠 (ending.content가 있으면 표시) */}
        {survey?.ending?.content && survey.ending.content !== message && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-10 p-6 bg-white/10 rounded-xl shadow-md border border-white/20"
          >
            <div 
              className="text-white/90 whitespace-pre-line leading-relaxed"
              dangerouslySetInnerHTML={{ __html: survey.ending.content }}
            />
          </motion.div>
        )}
      </motion.div>

      {/* 로고 - 하단 고정 (질문 페이지와 동일한 위치) */}
      {(() => {
        const logoUrl = survey?.branding?.logoBase64 || survey?.cover?.logoBase64;
        const isValidLogo = logoUrl && 
          logoUrl.trim() !== '' && 
          (logoUrl.startsWith('data:image/') || logoUrl.startsWith('http://') || logoUrl.startsWith('https://'));
        
        return isValidLogo ? (
          <div className="absolute left-0 right-0 z-10 flex justify-center" style={{ bottom: '20px' }}>
            <img 
              src={logoUrl} 
              alt="Logo" 
              className="max-h-10 max-w-[160px] object-contain"
              style={{ 
                opacity: 1,
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
              }}
              onError={(e) => {
                console.error('로고 이미지 로드 실패:', logoUrl);
                e.target.style.display = 'none';
              }}
            />
          </div>
        ) : null;
      })()}
    </div>
  );
}



