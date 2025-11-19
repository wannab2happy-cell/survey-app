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
          <div className="space-y-3">
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
          <div className="space-y-3">
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
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5">
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
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <span 
                className="text-sm text-gray-600 font-medium"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                {question.scaleLeftLabel || min}
              </span>
              <span 
                className="text-2xl font-bold"
                style={{ 
                  color,
                  fontSize: '24px',
                  fontWeight: 700,
                  letterSpacing: '-0.02em'
                }}
              >
                {scaleValue}
              </span>
              <span 
                className="text-sm text-gray-600 font-medium"
                style={{ fontSize: '14px', fontWeight: 500 }}
              >
                {question.scaleRightLabel || max}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={scaleValue}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full h-3 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${actualColor} 0%, ${actualSecondaryColor} ${((scaleValue - min) / (max - min)) * 100}%, #E5E7EB ${((scaleValue - min) / (max - min)) * 100}%, #E5E7EB 100%)`,
                outline: 'none'
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 font-medium" style={{ fontSize: '12px' }}>
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        );

      case 'IMAGE_SELECT':
      case 'IMAGE_CHOICE':
        const selectedImages = Array.isArray(localAnswer) ? localAnswer : [];
        return (
          <div className="grid grid-cols-2 gap-4">
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

  return (
    <motion.div 
      className="h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{
        width: '100%',
        maxWidth: '100vw',
        minHeight: '100vh',
        position: 'relative', // 배경이 확실히 보이도록
        // 배경 스타일을 명시적으로 적용 (다른 스타일보다 우선)
        ...bgStyle
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
          nextLabel={questionNumber === totalQuestions ? '검토하기' : '다음'}
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



