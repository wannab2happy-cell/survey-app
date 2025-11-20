// 참가자용 검토 페이지
// anders 스타일: 응답 목록, 수정 버튼, 제출 버튼

import { useState } from 'react';
import { motion } from 'framer-motion';
import BottomNav from '../../components/ui/BottomNav';
import InputField from '../../components/ui/InputField';
import ChoiceTile from '../../components/ui/ChoiceTile';

export default function ReviewPage({
  survey,
  answers,
  personalInfo = {},
  onPersonalInfoChange = () => {},
  consentChecked = false,
  onConsentChange = () => {},
  onEdit,
  onSubmit,
  onSubmitLoading = false,
  color = 'var(--primary)', // Primary 색상 (강조 색상)
  secondaryColor = null, // Secondary 색상 (보조 색상)
  backgroundColor = '#F3F4F6', // Tertiary 색상 (배경 색상)
  buttonShape = 'rounded-lg',
  bgImageBase64 = ''
}) {
  const [expandedQuestion, setExpandedQuestion] = useState(null);

  const questions = survey?.questions || [];
  const personalInfoEnabled = survey?.personalInfo?.enabled || false;
  const personalInfoFields = survey?.personalInfo?.fields || [];
  const consentText = survey?.personalInfo?.consentText || '';
  const consentRequired = survey?.personalInfo?.consentRequired || false;
  
  const missingQuestions = questions.filter(q => {
    if (!q.required) return false;
    const questionId = q._id || q.id;
    const answer = answers[questionId];
    return !answer || 
      (Array.isArray(answer) && answer.length === 0) ||
      (typeof answer === 'string' && answer.trim() === '');
  });

  // 개인정보 필수 필드 검증
  const missingPersonalInfo = personalInfoEnabled && personalInfoFields.filter(field => {
    const value = personalInfo[field];
    return !value || (typeof value === 'string' && value.trim() === '');
  });

  const canSubmit = missingQuestions.length === 0 && 
    (!personalInfoEnabled || (missingPersonalInfo.length === 0 && (!consentRequired || consentChecked)));

  const formatAnswer = (question, answer) => {
    if (!answer) return '답변 없음';
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return String(answer);
  };

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

  // 참가자 페이지인지 확인 (SurveyPageV2에서 렌더링되는 경우)
  const isParticipantPage = typeof window !== 'undefined' && 
    (window.location.pathname.includes('/s/') || document.body.classList.contains('participant-page'));

  return (
    <div 
      className="h-screen w-full max-w-full flex flex-col overflow-hidden safe-area-bottom" 
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
      {/* 스크롤 가능한 콘텐츠 영역 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 text-center"
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">응답 검토</h1>
            <p className="text-base sm:text-lg text-gray-600">응답을 확인하고 제출해주세요</p>
          </motion.div>

          {/* 필수 항목 누락 경고 */}
          {missingQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-xl bg-red-50 border-2 border-red-200"
            >
              <p className="text-red-600 font-semibold mb-3 text-sm sm:text-base">
                필수 항목이 누락되었습니다 ({missingQuestions.length}개)
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-red-600">
                {missingQuestions.map((q, idx) => (
                  <li key={idx}>{q.title || q.text || q.content || `질문 ${idx + 1}`}</li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* 개인정보 수집 폼 - 질문 카드 형식으로 표시 */}
          {personalInfoEnabled && (
            <>
              {personalInfoFields.map((field, idx) => {
                const fieldLabel = field === 'name' ? '이름' :
                                 field === 'phone' ? '연락처' :
                                 field === 'email' ? '이메일' :
                                 field === 'address' ? '주소' :
                                 field === 'gender' ? '성별' :
                                 field === 'birthdate' ? '생년월일' : field;
                const fieldType = field === 'email' ? 'email' :
                                 field === 'phone' ? 'tel' : 'text';
                
                return (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 mb-4 sm:mb-5"
                  >
                    {/* 모든 필드를 한 줄로 배치 */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span 
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white" 
                          style={{ backgroundColor: actualColor }}
                        >
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed whitespace-nowrap">
                          {fieldLabel}
                        </h3>
                      </div>
                      {field === 'gender' ? (
                        // 성별은 라벨 옆에 남/여 선택 버튼
                        <div className="flex items-center gap-3 flex-1">
                          <button
                            type="button"
                            onClick={() => onPersonalInfoChange({ ...personalInfo, [field]: '남성' })}
                            className={`px-5 py-2.5 ${buttonShape} border-2 transition-all font-medium ${
                              personalInfo[field] === '남성'
                                ? 'text-white'
                                : 'text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                            style={{
                              backgroundColor: personalInfo[field] === '남성' ? actualColor : 'white',
                              borderColor: personalInfo[field] === '남성' ? actualColor : '#d1d5db',
                              fontSize: '15px',
                              fontWeight: personalInfo[field] === '남성' ? 600 : 500,
                              minWidth: '80px',
                            }}
                          >
                            남성
                          </button>
                          <button
                            type="button"
                            onClick={() => onPersonalInfoChange({ ...personalInfo, [field]: '여성' })}
                            className={`px-5 py-2.5 ${buttonShape} border-2 transition-all font-medium ${
                              personalInfo[field] === '여성'
                                ? 'text-white'
                                : 'text-gray-700 border-gray-300 hover:border-gray-400'
                            }`}
                            style={{
                              backgroundColor: personalInfo[field] === '여성' ? actualColor : 'white',
                              borderColor: personalInfo[field] === '여성' ? actualColor : '#d1d5db',
                              fontSize: '15px',
                              fontWeight: personalInfo[field] === '여성' ? 600 : 500,
                              minWidth: '80px',
                            }}
                          >
                            여성
                          </button>
                        </div>
                      ) : field === 'birthdate' ? (
                          // 생년월일은 년/월/일 드롭다운
                          <div className="flex items-center gap-2 flex-1 flex-wrap">
                            {/* 년도 */}
                            <div className="relative flex-1 min-w-[100px]">
                              <select
                                value={(() => {
                                  // 기존 birthdate에서 년도 추출
                                  if (personalInfo.birthdate) {
                                    const parts = personalInfo.birthdate.split('-');
                                    return parts[0] || personalInfo.birthYear || '';
                                  }
                                  return personalInfo.birthYear || '';
                                })()}
                                onChange={(e) => {
                                  const year = e.target.value;
                                  const month = personalInfo.birthMonth || (personalInfo.birthdate ? personalInfo.birthdate.split('-')[1] : '') || '';
                                  const day = personalInfo.birthDay || (personalInfo.birthdate ? personalInfo.birthdate.split('-')[2] : '') || '';
                                  const fullDate = year && month && day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                                  onPersonalInfoChange({ 
                                    ...personalInfo, 
                                    birthYear: year,
                                    birthMonth: month,
                                    birthDay: day,
                                    [field]: fullDate
                                  });
                                }}
                                className={`w-full px-3 py-2.5 ${buttonShape} border-2 transition-all focus:ring-2 focus:outline-none appearance-none cursor-pointer pr-8`}
                                style={{
                                  borderColor: personalInfo.birthYear ? actualColor : '#d1d5db',
                                  fontSize: '15px',
                                  fontWeight: 400,
                                  backgroundColor: 'white',
                                  boxShadow: personalInfo.birthYear 
                                    ? `0 2px 8px ${actualColor}20, 0 0 0 1px ${actualColor}40`
                                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                  '--tw-ring-color': `${actualColor}40`,
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = actualColor;
                                  e.target.style.boxShadow = `0 0 0 3px ${actualColor}20, 0 2px 8px ${actualColor}30`;
                                }}
                                onBlur={(e) => {
                                  const hasValue = e.target.value && e.target.value.trim();
                                  e.target.style.borderColor = hasValue ? actualColor : '#d1d5db';
                                  e.target.style.boxShadow = hasValue 
                                    ? `0 2px 8px ${actualColor}20, 0 0 0 1px ${actualColor}40`
                                    : '0 2px 4px rgba(0, 0, 0, 0.1)';
                                }}
                              >
                                <option value="">년</option>
                                {Array.from({ length: 100 }, (_, i) => {
                                  const year = new Date().getFullYear() - i;
                                  return (
                                    <option key={year} value={year}>
                                      {year}년
                                    </option>
                                  );
                                })}
                              </select>
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* 월 */}
                            <div className="relative flex-1 min-w-[80px]">
                              <select
                                value={(() => {
                                  if (personalInfo.birthdate) {
                                    const parts = personalInfo.birthdate.split('-');
                                    return parts[1] ? String(parseInt(parts[1])) : personalInfo.birthMonth || '';
                                  }
                                  return personalInfo.birthMonth || '';
                                })()}
                                onChange={(e) => {
                                  const month = e.target.value;
                                  const year = personalInfo.birthYear || (personalInfo.birthdate ? personalInfo.birthdate.split('-')[0] : '') || '';
                                  const day = personalInfo.birthDay || (personalInfo.birthdate ? personalInfo.birthdate.split('-')[2] : '') || '';
                                  const fullDate = year && month && day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                                  onPersonalInfoChange({ 
                                    ...personalInfo, 
                                    birthYear: year,
                                    birthMonth: month,
                                    birthDay: day,
                                    [field]: fullDate
                                  });
                                }}
                                className={`w-full px-3 py-2.5 ${buttonShape} border-2 transition-all focus:ring-2 focus:outline-none appearance-none cursor-pointer pr-8`}
                                style={{
                                  borderColor: personalInfo.birthMonth ? actualColor : '#d1d5db',
                                  fontSize: '15px',
                                  fontWeight: 400,
                                  backgroundColor: 'white',
                                  boxShadow: personalInfo.birthMonth 
                                    ? `0 2px 8px ${actualColor}20, 0 0 0 1px ${actualColor}40`
                                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                  '--tw-ring-color': `${actualColor}40`,
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = actualColor;
                                  e.target.style.boxShadow = `0 0 0 3px ${actualColor}20, 0 2px 8px ${actualColor}30`;
                                }}
                                onBlur={(e) => {
                                  const hasValue = e.target.value && e.target.value.trim();
                                  e.target.style.borderColor = hasValue ? actualColor : '#d1d5db';
                                  e.target.style.boxShadow = hasValue 
                                    ? `0 2px 8px ${actualColor}20, 0 0 0 1px ${actualColor}40`
                                    : '0 2px 4px rgba(0, 0, 0, 0.1)';
                                }}
                              >
                                <option value="">월</option>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                  <option key={month} value={month}>
                                    {month}월
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                            
                            {/* 일 */}
                            <div className="relative flex-1 min-w-[80px]">
                              <select
                                value={(() => {
                                  if (personalInfo.birthdate) {
                                    const parts = personalInfo.birthdate.split('-');
                                    return parts[2] ? String(parseInt(parts[2])) : personalInfo.birthDay || '';
                                  }
                                  return personalInfo.birthDay || '';
                                })()}
                                onChange={(e) => {
                                  const day = e.target.value;
                                  const year = personalInfo.birthYear || (personalInfo.birthdate ? personalInfo.birthdate.split('-')[0] : '') || '';
                                  const month = personalInfo.birthMonth || (personalInfo.birthdate ? personalInfo.birthdate.split('-')[1] : '') || '';
                                  const fullDate = year && month && day ? `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` : '';
                                  onPersonalInfoChange({ 
                                    ...personalInfo, 
                                    birthYear: year,
                                    birthMonth: month,
                                    birthDay: day,
                                    [field]: fullDate
                                  });
                                }}
                                className={`w-full px-3 py-2.5 ${buttonShape} border-2 transition-all focus:ring-2 focus:outline-none appearance-none cursor-pointer pr-8`}
                                style={{
                                  borderColor: personalInfo.birthDay ? actualColor : '#d1d5db',
                                  fontSize: '15px',
                                  fontWeight: 400,
                                  backgroundColor: 'white',
                                  boxShadow: personalInfo.birthDay 
                                    ? `0 2px 8px ${actualColor}20, 0 0 0 1px ${actualColor}40`
                                    : '0 2px 4px rgba(0, 0, 0, 0.1)',
                                  '--tw-ring-color': `${actualColor}40`,
                                }}
                                onFocus={(e) => {
                                  e.target.style.borderColor = actualColor;
                                  e.target.style.boxShadow = `0 0 0 3px ${actualColor}20, 0 2px 8px ${actualColor}30`;
                                }}
                                onBlur={(e) => {
                                  const hasValue = e.target.value && e.target.value.trim();
                                  e.target.style.borderColor = hasValue ? actualColor : '#d1d5db';
                                  e.target.style.boxShadow = hasValue 
                                    ? `0 2px 8px ${actualColor}20, 0 0 0 1px ${actualColor}40`
                                    : '0 2px 4px rgba(0, 0, 0, 0.1)';
                                }}
                              >
                                <option value="">일</option>
                                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                                  <option key={day} value={day}>
                                    {day}일
                                  </option>
                                ))}
                              </select>
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // 모든 텍스트 입력 필드는 라벨 옆에 입력칸 (그림자 있는 디자인, 입력 완료 시 강조컬러)
                          <input
                            type={fieldType}
                            placeholder={`${fieldLabel}을(를) 입력해주세요`}
                            value={personalInfo[field] || ''}
                            onChange={(e) => onPersonalInfoChange({ ...personalInfo, [field]: e.target.value })}
                            className={`flex-1 px-4 py-3 ${buttonShape} border-2 transition-all focus:ring-2 focus:outline-none`}
                            style={{
                              borderColor: personalInfo[field] && personalInfo[field].trim() ? actualColor : '#d1d5db',
                              fontSize: '15px',
                              fontWeight: 400,
                              backgroundColor: 'white',
                              boxShadow: personalInfo[field] && personalInfo[field].trim() 
                                ? `0 2px 8px ${actualColor}20, 0 0 0 1px ${actualColor}40`
                                : '0 2px 4px rgba(0, 0, 0, 0.1)',
                              '--tw-ring-color': `${actualColor}40`,
                            }}
                            onFocus={(e) => {
                              e.target.style.borderColor = actualColor;
                              e.target.style.boxShadow = `0 0 0 3px ${actualColor}20, 0 2px 8px ${actualColor}30`;
                            }}
                            onBlur={(e) => {
                              const hasValue = e.target.value && e.target.value.trim();
                              e.target.style.borderColor = hasValue ? actualColor : '#d1d5db';
                              e.target.style.boxShadow = hasValue 
                                ? `0 2px 8px ${actualColor}20, 0 0 0 1px ${actualColor}40`
                                : '0 2px 4px rgba(0, 0, 0, 0.1)';
                            }}
                          />
                        )}
                      </div>
                    </motion.div>
                  );
                })}

              {/* 동의 문구 및 체크박스 - 질문 카드 형식 */}
              {consentText && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: personalInfoFields.length * 0.05 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6 mb-4 sm:mb-5"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span 
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white" 
                      style={{ backgroundColor: actualColor }}
                    >
                      {String.fromCharCode(65 + personalInfoFields.length)}
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed">
                      개인정보 수집 및 이용 동의
                    </h3>
                  </div>
                  
                  <div className="mt-4 p-4 rounded-lg bg-gray-50 border border-gray-200 max-h-48 overflow-y-auto">
                    <div 
                      className="text-sm text-gray-700 whitespace-pre-line leading-relaxed"
                      style={{ fontSize: '14px', lineHeight: '1.7' }}
                      dangerouslySetInnerHTML={{ __html: consentText }}
                    />
                  </div>
                  
                  <label className="flex items-start gap-3 cursor-pointer mt-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => onConsentChange(e.target.checked)}
                      className="mt-0.5 w-5 h-5 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 transition-all"
                      style={{ 
                        accentColor: actualColor,
                        cursor: 'pointer'
                      }}
                      required={consentRequired}
                    />
                    <span className="text-sm text-gray-700 leading-relaxed flex-1">
                      {consentRequired && <span className="text-red-500 font-semibold mr-1">*</span>}
                      개인정보 수집 및 이용에 동의합니다.
                    </span>
                  </label>
                </motion.div>
              )}

              {/* 개인정보 필수 필드 누락 경고 */}
              {missingPersonalInfo && missingPersonalInfo.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 sm:mb-6 p-4 sm:p-5 rounded-xl bg-red-50 border-2 border-red-200"
                >
                  <p className="text-red-600 font-semibold mb-2 text-sm sm:text-base">
                    필수 개인정보 항목이 누락되었습니다 ({missingPersonalInfo.length}개)
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm text-red-600">
                    {missingPersonalInfo.map((field) => {
                      const fieldLabel = field === 'name' ? '이름' :
                                       field === 'phone' ? '연락처' :
                                       field === 'email' ? '이메일' :
                                       field === 'address' ? '주소' : field;
                      return <li key={field}>{fieldLabel}</li>;
                    })}
                  </ul>
                </motion.div>
              )}
            </>
          )}

          {/* 응답 목록 */}
          <div className="space-y-4 sm:space-y-5 pb-4">
            {questions.map((question, idx) => {
              const questionId = question._id || question.id;
              const answer = answers[questionId];
              const isExpanded = expandedQuestion === questionId;

              return (
                <motion.div
                  key={questionId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 p-5 sm:p-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold text-white" style={{ backgroundColor: color }}>
                          {idx + 1}
                        </span>
                        {question.required && (
                          <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-600 font-semibold">
                            필수
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-relaxed mb-3">
                        {question.title || question.text || question.content || '질문'}
                      </h3>
                    </div>
                    <button
                      onClick={() => onEdit(idx)}
                      className={`w-full sm:w-auto sm:ml-4 px-5 py-2.5 ${buttonShape} border-2 border-gray-300 text-gray-700 text-sm sm:text-base font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all whitespace-nowrap`}
                    >
                      수정
                    </button>
                  </div>
                  <div className="mt-4 p-4 sm:p-5 rounded-lg bg-gray-50 border border-gray-100">
                    <p className="text-base sm:text-lg text-gray-800 break-words leading-relaxed font-medium">
                      {formatAnswer(question, answer)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 (고정) */}
      <div className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t border-gray-200" style={{ backgroundColor: bgStyle.backgroundColor || 'rgba(255, 255, 255, 0.95)', backdropFilter: bgImageBase64 ? 'blur(8px)' : 'none' }}>
        <div className="max-w-2xl mx-auto">
          <BottomNav
            onNext={onSubmit}
            onPrevious={() => onEdit(questions.length - 1)}
            showPrevious={true}
            nextLabel={onSubmitLoading ? '제출 중...' : '제출하기'}
            previousLabel="수정하기"
            disabled={onSubmitLoading || !canSubmit}
            color={actualColor}
            secondaryColor={actualSecondaryColor}
            buttonShape={buttonShape}
          />
        </div>
      </div>
    </div>
  );
}



