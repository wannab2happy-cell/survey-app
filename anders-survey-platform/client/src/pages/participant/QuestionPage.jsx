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
  question,
  questionNumber,
  totalQuestions,
  answer,
  onAnswerChange,
  onNext,
  onPrevious,
  showPrevious = true,
  color = 'var(--primary)',
  buttonShape = 'rounded-lg'
}) {
  const [localAnswer, setLocalAnswer] = useState(answer || '');
  const [error, setError] = useState(null);

  useEffect(() => {
    setLocalAnswer(answer || '');
    setError(null);
  }, [question, answer]);

  const questionId = question._id || question.id;
  const questionType = (question.type || '').toUpperCase().trim();
  const normalizedOptions = (question.options || []).map(opt =>
    typeof opt === 'string' ? opt : (opt.text || opt.label || opt.content || String(opt))
  );

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
                color={color}
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
                color={color}
              />
            ))}
          </div>
        );

      case 'DROPDOWN':
        return (
          <select
            value={localAnswer || ''}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            style={{ '--tw-ring-color': `${color}40` }}
          >
            <option value="">선택해주세요</option>
            {normalizedOptions.map((option, idx) => (
              <option key={idx} value={option}>{option}</option>
            ))}
          </select>
        );

      case 'STAR_RATING':
        const starCount = question.starCount || 5;
        const rating = parseInt(localAnswer) || 0;
        return (
          <div className="flex items-center gap-2">
            {Array.from({ length: starCount }).map((_, idx) => {
              const starValue = idx + 1;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAnswerChange(starValue.toString())}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-10 h-10 transition-colors ${
                      starValue <= rating ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              );
            })}
            {rating > 0 && (
              <span className="ml-2 text-gray-600 font-medium">{rating}점</span>
            )}
          </div>
        );

      case 'SCALE':
        const min = question.scaleMin || 1;
        const max = question.scaleMax || 10;
        const scaleValue = parseInt(localAnswer) || min;
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{question.scaleLeftLabel || min}</span>
              <span className="text-lg font-bold" style={{ color }}>{scaleValue}</span>
              <span className="text-sm text-gray-600">{question.scaleRightLabel || max}</span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              value={scaleValue}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${color} 0%, ${color} ${((scaleValue - min) / (max - min)) * 100}%, #E5E7EB ${((scaleValue - min) / (max - min)) * 100}%, #E5E7EB 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500">
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
                  style={isSelected ? { borderColor: color } : {}}
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
                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
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
            rows={4}
            className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 resize-none text-sm"
            style={{ '--tw-ring-color': `${color}40` }}
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
            color={color}
          />
        );
    }
  };

  return (
    <motion.div 
      className="h-screen bg-bg flex flex-col items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* 진행률 바 - 상단 고정 */}
      <div className="absolute top-0 left-0 right-0 z-10 px-4 pt-4">
        <ProgressBar 
          current={questionNumber} 
          total={totalQuestions} 
          color={color} 
        />
      </div>

      {/* 메인 콘텐츠 - 상단 정렬 */}
      <div className="relative z-10 w-full flex-1 flex flex-col items-center justify-start overflow-y-auto px-4" style={{ paddingTop: '60px', paddingBottom: '100px', maxHeight: 'calc(100vh - 160px)' }}>
        {/* 질문 카드 */}
        <div className="w-full max-w-md mt-2">
          <QuestionCard
            questionNumber={questionNumber}
            title={question.title || question.text || question.content || '질문'}
            required={question.required}
            error={error}
          >
            {renderQuestionContent()}
          </QuestionCard>
        </div>
      </div>

      {/* 하단 네비게이션 - 하단 고정 */}
      <div className="absolute bottom-0 left-0 right-0 z-10">
        <BottomNav
          onNext={handleNext}
          onPrevious={onPrevious}
          showPrevious={showPrevious}
          nextLabel={questionNumber === totalQuestions ? '검토하기' : '다음'}
          previousLabel="이전"
          disabled={false}
          color={color}
          buttonShape={buttonShape}
        />
      </div>
    </motion.div>
  );
}



