// 참가자용 시작 페이지
// 샘플 HTML 기반 디자인 재구성 - 기능은 유지, 디자인만 변경

import { motion } from 'framer-motion';
import { sanitizeHTML } from '../../utils/htmlSanitizer';

export default function StartPage({ 
  survey, 
  onStart, 
  color = '#6B46C1', // Primary 색상 기본값
  buttonShape = 'rounded-lg', 
  buttonOpacity = 0.9,
  backgroundColor = '#e7e7e7', // 샘플과 동일한 배경색
  bgImageBase64 = ''
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

  // 배경 스타일 결정
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
        backgroundColor: backgroundColor
      };
    }
    return {
      backgroundColor: backgroundColor
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

  return (
    <div 
      className="w-full min-h-screen flex items-center justify-center p-0"
      style={{ 
        ...bgStyle, 
        width: '100%', 
        maxWidth: '100vw', 
        minHeight: '100vh',
        padding: '30px 0'
      }}
    >
      {/* 디바이스 뷰 컨테이너 */}
      <div 
        className="w-full max-w-[420px] mx-auto bg-white rounded-[24px] shadow-lg flex flex-col"
        style={{
          minHeight: '720px',
          padding: '36px 24px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* 1. 로고 (제일 상단) */}
        {logoBase64 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-[56px] h-[56px] mx-auto"
            style={{ 
              borderRadius: '16px',
              marginTop: '0px', 
              marginBottom: '32px',
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
        ) : (
          <div 
            className="w-[56px] h-[56px] mx-auto border-2 border-dashed flex items-center justify-center"
            style={{ 
              borderRadius: '16px',
              borderColor: '#e0e0e0',
              marginTop: '0px', 
              marginBottom: '32px',
              backgroundColor: '#fafafa'
            }}
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* 3. 설문지 제목 */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="m-0 text-center mx-auto"
          style={{ 
            fontSize: '27px',
            fontWeight: 700,
            color: '#1a1a1a',
            letterSpacing: '-0.02em',
            lineHeight: '1.4',
            marginBottom: '12px',
            width: '75%'
          }}
          dangerouslySetInnerHTML={{ __html: sanitizeHTML(title || '') }}
        />

        {/* 4. 부제목 */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="m-0 text-center mx-auto"
            style={{ 
              fontSize: '14px',
              color: '#666',
              fontWeight: 400,
              lineHeight: '1.6',
              marginBottom: '32px',
              width: '75%'
            }}
            dangerouslySetInnerHTML={{ __html: sanitizeHTML(subtitle || '') }}
          />
        )}

        {/* 5. 커버 이미지 영역 */}
        {coverImage ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="w-full overflow-hidden"
            style={{ 
              height: '200px',
              borderRadius: '20px',
              marginTop: '0px',
              marginBottom: '32px',
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
          <div 
            className="w-full border-2 border-dashed flex flex-col items-center justify-center text-center"
            style={{
              height: '200px',
              borderRadius: '20px',
              borderColor: '#e0e0e0',
              background: 'linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%)',
              color: '#999',
              fontSize: '13px',
              fontWeight: 500,
              marginTop: '0px',
              marginBottom: '32px',
              padding: '24px'
            }}
          >
            <svg className="w-8 h-8 mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>커버 이미지 영역</span>
            <span style={{ fontSize: '11px', marginTop: '4px', color: '#bbb' }}>1280×720 권장</span>
          </div>
        )}

        {/* 6. 설문 참여수 표시 공간 (on/off) - 항상 공간 확보 */}
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
                fontSize: '13px',
                color: '#666',
                fontWeight: 500,
                letterSpacing: '0.01em'
              }}
            >
              현재 <span style={{ color: actualColor, fontWeight: 600 }}>0명</span>이 참여했습니다
            </motion.div>
          )}
        </div>

        {/* 7. 시작 버튼 */}
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          whileHover={{ scale: 1.02, boxShadow: `0 8px 24px ${actualColor}40` }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          className={`w-[80%] ${shapeClass} border-none text-white cursor-pointer mx-auto block flex items-center justify-center gap-2`}
          style={{
            padding: '13px 18px',
            backgroundColor: actualColor,
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
      </div>
    </div>
  );
}
