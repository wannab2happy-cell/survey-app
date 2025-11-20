// 참가자용 질문 페이지
// anders 스타일: 원 스크린 원 포커스, 진행률 바, 하단 네비게이션

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProgressBar from '../../components/ui/ProgressBar';
import QuestionCard from '../../components/ui/QuestionCard';
import ChoiceTile from '../../components/ui/ChoiceTile';
import InputField from '../../components/ui/InputField';
import BottomNav from '../../components/ui/BottomNav';
import ErrorHint from '../../components/ui/ErrorHint';

export default function QuestionPage({
  survey,
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  showPrevious = true,
  color = 'var(--primary)', // Primary 색상 (강조 색상)
  secondaryColor = null, // Secondary 색상 (보조 색상)
  backgroundColor = null, // Tertiary 색상 (배경 색상)
  buttonShape = 'rounded-lg',
  koreanSpacingWrap = false,
  bgImageBase64 = ''
}) {
  const [localAnswer, setLocalAnswer] = useState(answer || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalAnswer(answer || '');
    setError(null);
  }, [question, answer]);

  const questionId = question._id || question.id;
  const questionType = (question.type || '').toUpperCase().trim();
  const normalizedOptions = (question.options || []).map(opt => {
    if (typeof opt === 'string') {
      return opt;
    }
    // 이모지가 있으면 이모지와 텍스트를 결합
    const text = opt.text || opt.label || opt.content || String(opt);
    if (opt.emoji && opt.emoji.trim()) {
      return `[${opt.emoji.trim()}] ${text}`;
    }
    return text;
  });

  // 색상 처리
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

  const actualBackgroundColor = backgroundColor && typeof backgroundColor === 'string' && backgroundColor.startsWith('#')
    ? backgroundColor
    : (backgroundColor && typeof backgroundColor === 'string' && backgroundColor.includes('var')
        ? '#F3F4F6'
        : (backgroundColor || '#F3F4F6'));

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

  // 긴 텍스트 입력(텍스트 영역)용 border-radius 클래스 매핑
  const getTextareaShapeClass = () => {
    switch (buttonShape) {
      case 'square':
      case 'rounded-none':
        return 'rounded-none';
      case 'pill':
      case 'rounded-full':
        // 둥근 버튼이어도 긴 텍스트는 둥근 모서리 사각형으로
        return 'rounded-lg';
      case 'rounded':
      case 'rounded-lg':
      default:
        return 'rounded-lg';
    }
  };

  const shapeClass = getShapeClass();
  const textareaShapeClass = getTextareaShapeClass();

  // 배경 밝기 계산 함수
  const getBackgroundBrightness = () => {
    if (!actualBackgroundColor) return 255; // 기본값: 밝음
    
    // hex 색상을 RGB로 변환
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };

    const rgb = hexToRgb(actualBackgroundColor);
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

    // 배경 이미지가 있으면 반투명 배경 사용 (80% 불투명도)
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
        backgroundColor: actualBackgroundColor // 이미지 로딩 전 배경색
      };
    }
    // 배경 이미지가 없으면 단색 배경 사용
    return {
      backgroundColor: actualBackgroundColor
    };
  };

  const handleAnswerChange = (value) => {
    setLocalAnswer(value);
    setError(null);
    onAnswerChange(questionId, value);
  };

  const handleNext = () => {
    if (question.required) {
      const isEmpty = !localAnswer || 
        (Array.isArray(localAnswer) && localAnswer.length === 0) ||
        (typeof localAnswer === 'string' && localAnswer.trim() === '');
      
      if (isEmpty) {
        setError('필수 항목입니다.');
        return;
      }
    }
    onNext();
  };

  const renderQuestionContent = () => {
    switch (questionType) {
      case 'RADIO':
      case 'YES_NO':
        return (
          <div className="w-[80%] mx-auto space-y-3">
            {normalizedOptions.map((option, idx) => (
              <ChoiceTile
                key={idx}
                label={option}
                value={option}
                selected={localAnswer === option}
                onSelect={handleAnswerChange}
                type="radio"
                color={actualColor}
                secondaryColor={actualSecondaryColor}
              />
            ))}
          </div>
        );

      case 'CHECKBOX':
        const selectedArray = Array.isArray(localAnswer) ? localAnswer : [];
        return (
          <div className="w-[80%] mx-auto space-y-3">
            {normalizedOptions.map((option, idx) => (
              <ChoiceTile
                key={idx}
                label={option}
                value={option}
                selected={selectedArray.includes(option)}
                onSelect={(value) => {
                  const newArray = selectedArray.includes(value)
                    ? selectedArray.filter(v => v !== value)
                    : [...selectedArray, value];
                  handleAnswerChange(newArray);
                }}
                type="checkbox"
                color={actualColor}
                secondaryColor={actualSecondaryColor}
              />
            ))}
          </div>
        );

      case 'DROPDOWN':
        return (
          <div className="relative w-[80%] mx-auto">
            <select
              value={localAnswer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className={`w-full px-5 py-3.5 ${shapeClass} border-2 transition-all block appearance-none cursor-pointer`}
              style={{ 
                ...inputStyle,
                fontSize: '15px',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                '--tw-ring-color': `${actualColor}40`,
                paddingRight: '2.75rem',
                boxShadow: inputStyle.boxShadow || '0 2px 4px rgba(0, 0, 0, 0.05)',
                backgroundColor: inputStyle.backgroundColor || 'rgba(255, 255, 255, 0.8)'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = actualColor;
                e.target.style.setProperty('border-color', actualColor, 'important');
                e.target.style.boxShadow = `0 0 0 3px ${actualColor}20, 0 2px 8px rgba(0, 0, 0, 0.1)`;
              }}
              onBlur={(e) => {
                const defaultColor = inputStyle.defaultBorderColor || inputStyle.borderColor;
                e.target.style.borderColor = defaultColor;
                e.target.style.setProperty('border-color', defaultColor, 'important');
                e.target.style.boxShadow = inputStyle.boxShadow || '0 2px 4px rgba(0, 0, 0, 0.05)';
              }}
            >
              <option value="" disabled style={{ color: '#9CA3AF' }}>선택해주세요</option>
              {normalizedOptions.map((option, idx) => (
                <option key={idx} value={option} style={{ color: '#1F2937', backgroundColor: '#FFFFFF' }}>{option}</option>
              ))}
            </select>
            {/* 커스텀 화살표 아이콘 */}
            <div 
              className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none"
              style={{ zIndex: 1 }}
            >
              <svg 
                className="w-5 h-5 transition-colors duration-200" 
                style={{ color: localAnswer ? actualColor : '#9CA3AF' }}
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );

      case 'STAR_RATING':
        const starCount = question.starCount || 5;
        const rating = parseInt(localAnswer) || 0;
        return (
          <div className="w-[80%] mx-auto flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5 justify-center">
              {Array.from({ length: starCount }).map((_, idx) => {
                const starValue = idx + 1;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAnswerChange(starValue.toString())}
                    className="focus:outline-none transition-transform active:scale-95"
                    style={{ transition: 'all 0.2s ease' }}
                  >
                    <svg
                      className={`w-11 h-11 transition-all ${
                        starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill={starValue <= rating ? 'currentColor' : 'none'}
                      stroke={starValue <= rating ? 'none' : 'currentColor'}
                      viewBox="0 0 20 20"
                      style={{ 
                        strokeWidth: starValue <= rating ? 0 : 1.5,
                        filter: starValue <= rating ? 'drop-shadow(0 2px 4px rgba(251, 191, 36, 0.3))' : 'none'
                      }}
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                );
              })}
            </div>
            {rating > 0 && (
              <span 
                className="text-gray-700 font-semibold"
                style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  letterSpacing: '0.01em'
                }}
              >
                {rating}점
              </span>
            )}
          </div>
        );

      case 'SCALE':
        const min = question.scaleMin || 1;
        const max = question.scaleMax || 10;
        const scaleValue = parseInt(localAnswer) || min;
        const percentage = ((scaleValue - min) / (max - min)) * 100;
        
        return (
          <div className="w-[80%] mx-auto space-y-6">
            {/* 레이블 (상단) */}
            {(question.scaleLeftLabel || question.scaleRightLabel) && (
              <div className="flex items-center justify-between mb-2">
                <span 
                  className="text-sm text-gray-600 font-medium"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  {question.scaleLeftLabel || min}
                </span>
                <span 
                  className="text-sm text-gray-600 font-medium"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  {question.scaleRightLabel || max}
                </span>
              </div>
            )}
            
            {/* 슬라이더 컨테이너 */}
            <div className="relative py-6">
              {/* 현재 값 버블 (위에 표시) */}
              <div 
                className="absolute transform -translate-x-1/2 transition-all duration-200"
                style={{
                  left: `calc(12px + ${percentage}% * (100% - 24px) / 100)`,
                  bottom: '100%',
                  marginBottom: '12px'
                }}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative"
                >
                  {/* 버블 */}
                  <div
                    className="rounded-full px-4 py-2 shadow-lg flex items-center justify-center"
                    style={{
                      backgroundColor: actualColor,
                      color: '#FFFFFF',
                      minWidth: '48px',
                      boxShadow: `0 4px 12px ${actualColor}40, 0 2px 4px rgba(0, 0, 0, 0.1)`
                    }}
                  >
                    <span 
                      className="text-lg font-bold"
                      style={{ 
                        fontSize: '18px',
                        fontWeight: 700,
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {scaleValue}
                    </span>
                  </div>
                  {/* 삼각형 포인터 */}
                  <div
                    className="absolute top-full left-1/2 transform -translate-x-1/2"
                    style={{
                      width: 0,
                      height: 0,
                      borderLeft: '8px solid transparent',
                      borderRight: '8px solid transparent',
                      borderTop: `8px solid ${actualColor}`,
                      filter: 'drop-shadow(0 2px 2px rgba(0, 0, 0, 0.1))'
                    }}
                  />
                </motion.div>
              </div>

              {/* 슬라이더 트랙 컨테이너 */}
              <div className="relative">
                {/* 커스텀 슬라이더 트랙 */}
                <div className="relative" style={{ paddingLeft: '12px', paddingRight: '12px' }}>
                  {/* 배경 트랙 */}
                  <div
                    className="w-full rounded-full"
                    style={{
                      height: '8px',
                      backgroundColor: '#E5E7EB',
                      position: 'relative',
                      overflow: 'visible'
                    }}
                  >
                    {/* 채워진 트랙 */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="absolute left-0 top-0 h-full rounded-full"
                      style={{
                        background: `linear-gradient(to right, ${actualColor}, ${actualSecondaryColor || actualColor})`,
                        boxShadow: `0 2px 4px ${actualColor}30`
                      }}
                    />
                  </div>

                  {/* Range Input (투명하게 오버레이) */}
                  <input
                    type="range"
                    min={min}
                    max={max}
                    value={scaleValue}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    className="absolute top-0 left-0 w-full h-8 cursor-pointer opacity-0 z-10"
                    style={{
                      marginTop: '-12px',
                      cursor: 'pointer',
                      paddingLeft: '12px',
                      paddingRight: '12px',
                      width: 'calc(100% - 24px)',
                      left: '12px'
                    }}
                  />

                  {/* 커스텀 썸 (Thumb) */}
                  <div
                    className="absolute transform -translate-x-1/2 transition-all duration-200"
                    style={{
                      left: `calc(12px + ${percentage}% * (100% - 24px) / 100)`,
                      top: '50%',
                      transform: 'translate(-50%, -50%)',
                      zIndex: 5
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.95 }}
                      className="rounded-full shadow-lg"
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#FFFFFF',
                        border: `3px solid ${actualColor}`,
                        boxShadow: `0 4px 8px ${actualColor}40, 0 2px 4px rgba(0, 0, 0, 0.15)`,
                        cursor: 'grab'
                      }}
                    />
                  </div>
                </div>

                {/* 최소/최대 값 표시 (하단) - 트랙의 실제 시작/끝과 정렬 */}
                <div className="flex justify-between mt-4 text-xs text-gray-500 font-medium" style={{ fontSize: '12px', paddingLeft: '12px', paddingRight: '12px' }}>
                  <span>{min}</span>
                  <span>{max}</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'IMAGE_SELECT':
      case 'IMAGE_CHOICE':
        const selectedImages = Array.isArray(localAnswer) ? localAnswer : [];
        return (
          <div className="w-[80%] mx-auto grid grid-cols-2 gap-4">
            {normalizedOptions.map((option, idx) => {
              const imageUrl = typeof option === 'string' && option.startsWith('data:image/') 
                ? option 
                : (option.image || option);
              const isSelected = selectedImages.includes(option);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    const newArray = selectedImages.includes(option)
                      ? selectedImages.filter(v => v !== option)
                      : [...selectedImages, option];
                    handleAnswerChange(newArray);
                  }}
                  className={`
                    relative rounded-xl overflow-hidden border-2 transition-all
                    ${isSelected ? 'border-purple-500 shadow-lg' : 'border-gray-200'}
                  `}
                  style={isSelected ? { borderColor: actualColor } : {}}
                >
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={`Option ${idx + 1}`}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  )}
                  {isSelected && (
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: actualColor }}>
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        );

      case 'TEXTAREA':
        return (
          <textarea
            value={localAnswer || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            placeholder="답변을 입력해주세요"
            rows={5}
            className={`w-[80%] mx-auto px-5 py-3.5 ${textareaShapeClass} border-2 focus:ring-2 resize-none transition-all block`}
            style={{ 
              ...inputStyle,
              fontSize: '15px',
              fontWeight: 400,
              letterSpacing: '-0.01em',
              lineHeight: '1.6',
              '--tw-ring-color': `${actualColor}40`,
              ...(koreanSpacingWrap ? {
                wordBreak: 'keep-all',
                whiteSpace: 'pre-wrap'
              } : {})
            }}
            onFocus={(e) => {
              e.target.style.borderColor = actualColor;
              e.target.style.setProperty('border-color', actualColor, 'important');
            }}
            onBlur={(e) => {
              const defaultColor = inputStyle.defaultBorderColor || inputStyle.borderColor;
              e.target.style.borderColor = defaultColor;
              e.target.style.setProperty('border-color', defaultColor, 'important');
            }}
          />
        );

      case 'TEXT':
      default:
        return (
          <InputField
            type="text"
            placeholder="답변을 입력해주세요"
            value={localAnswer || ''}
            onChange={handleAnswerChange}
            error={error}
            required={question.required}
            color={actualColor}
            koreanSpacingWrap={koreanSpacingWrap}
            buttonShape={buttonShape}
            backgroundColor={actualBackgroundColor}
            bgImageBase64={bgImageBase64}
          />
        );
    }
  };

  const bgStyle = getBackgroundStyle();

  // 참가자 페이지인지 확인 (SurveyPageV2에서 렌더링되는 경우)
  const isParticipantPage = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/s/') || document.body.classList.contains('participant-page'));

  return (
    <motion.div 
      className="h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: isParticipantPage ? '100vw' : '100%',
        maxWidth: '100vw',
        minHeight: '100vh',
        height: isParticipantPage ? '100vh' : 'auto',
        position: isParticipantPage ? 'fixed' : 'relative',
        top: isParticipantPage ? 0 : 'auto',
        left: isParticipantPage ? 0 : 'auto',
        right: isParticipantPage ? 0 : 'auto',
        bottom: isParticipantPage ? 0 : 'auto',
        zIndex: isParticipantPage ? 0 : 'auto',
        overflowY: isParticipantPage ? 'auto' : 'visible',
        // 배경 스타일을 명시적으로 적용 (다른 스타일보다 우선)
        backgroundColor: bgStyle.backgroundColor || actualBackgroundColor,
        backgroundImage: bgStyle.backgroundImage || 'none',
        backgroundSize: bgStyle.backgroundSize || 'cover',
        backgroundPosition: bgStyle.backgroundPosition || 'center',
        backgroundRepeat: bgStyle.backgroundRepeat || 'no-repeat'
      }}
      initial={{ opacity: 0, ...bgStyle }}
      animate={{ opacity: 1, ...bgStyle }}
      transition={{ duration: 0.3 }}
    >
      {/* 진행률 바 - 상단 고정 */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4">
        <ProgressBar 
          current={questionNumber} 
          total={totalQuestions} 
          color={actualColor}
          secondaryColor={actualSecondaryColor} 
        />
      </div>

      {/* 메인 콘텐츠 - 상단 정렬 */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-start overflow-y-auto px-4" style={{ paddingTop: '72px', paddingBottom: '180px', maxHeight: 'calc(100vh - 140px)' }}>
        {/* 질문 카드 */}
        <div className="w-full max-w-md mt-4">
          <QuestionCard
            questionNumber={questionNumber}
            title={question.title || question.text || question.content || '질문'}
            required={question.required}
            error={error}
            color={actualColor}
            secondaryColor={actualSecondaryColor}
          >
            {renderQuestionContent()}
          </QuestionCard>
        </div>

      </div>

      {/* 하단 네비게이션 - 하단 고정 */}
      <div className="absolute left-0 right-0 z-10" style={{ bottom: '60px' }}>
        <BottomNav
          onNext={handleNext}
          onPrevious={onPrevious}
          showPrevious={showPrevious}
          nextLabel="다음"
          previousLabel="이전"
          disabled={false}
          color={actualColor}
          secondaryColor={actualSecondaryColor}
          buttonShape={buttonShape}
        />
      </div>

      {/* 로고 - 다음 버튼 아래에 고정 */}
      {(survey?.branding?.logoBase64 || survey?.cover?.logoBase64) && (
        <div className="absolute left-0 right-0 z-10 flex justify-center" style={{ bottom: '20px' }}>
          <img 
            src={survey?.branding?.logoBase64 || survey?.cover?.logoBase64} 
            alt="Logo" 
            className="max-h-10 max-w-[160px] object-contain"
            style={{ 
              opacity: 1,
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))'
            }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </motion.div>
  );
}



