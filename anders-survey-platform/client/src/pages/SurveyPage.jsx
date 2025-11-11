import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance.js';
import { QUESTION_TYPES, PERSONAL_INFO_FIELDS } from '../constants.js';

// ----------------------------------------------------
// 💡 응답자용 질문 렌더링 컴포넌트 (모든 질문 타입 지원)
// ----------------------------------------------------

const QuestionDisplay = ({ question, userAnswers, onAnswerChange, questionNumber, primaryColor, secondaryColor, tertiaryColor }) => {
    const questionId = question._id || question.id;
    const answer = userAnswers[questionId] || '';
    // 질문 타입 정규화 (대소문자 통일)
    const rawType = question.type || question.questionType || '';
    const questionType = rawType ? String(rawType).toUpperCase().trim() : 'TEXT'; // 기본값: TEXT
    
    // 디버깅: 실제 타입 값 확인
    if (process.env.NODE_ENV === 'development') {
        console.log('[QuestionDisplay] Question:', {
            id: questionId,
            rawType: rawType,
            questionType: questionType,
            question: question
        });
    }
    
    // 기본 색상 (브랜딩 색상이 없을 경우)
    const primary = primaryColor || '#4F46E5';
    const secondary = secondaryColor || '#6366F1';
    const tertiary = tertiaryColor || '#22C55E';
    
    // 질문 타입별 렌더링
    const renderQuestion = () => {
        // 옵션 정규화 (문자열 배열로 변환)
        const normalizedOptions = (question.options || []).map(opt => 
            typeof opt === 'string' ? opt : (opt.text || opt.label || opt.content || String(opt))
        );
        
        // 디버깅: switch 전 값 확인
        if (process.env.NODE_ENV === 'development') {
            console.log('[QuestionDisplay] Switch check:', {
                questionType: questionType,
                normalizedType: questionType,
                options: normalizedOptions
            });
        }
        
        switch (questionType) {
            case 'CHECKBOX':
                return (
                    <div className="space-y-3">
                        {normalizedOptions.map((optionValue, idx) => {
                            const isChecked = Array.isArray(answer) && answer.includes(optionValue);
                            return (
                                <label
                                    key={idx}
                                    className={`
                                        flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                        ${isChecked 
                                            ? 'shadow-lg border-2' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                    style={isChecked ? {
                                        borderColor: primary,
                                        backgroundColor: `${primary}20`,
                                        borderWidth: '3px',
                                    } : {}}
                                >
                                    <input
                                        type="checkbox"
                                        value={optionValue}
                                        checked={isChecked}
                                        onChange={(e) => {
                                            let newAnswer = Array.isArray(answer) ? [...answer] : [];
                                            if (e.target.checked) {
                                                if (!newAnswer.includes(optionValue)) {
                                                    newAnswer.push(optionValue);
                                                }
                                            } else {
                                                newAnswer = newAnswer.filter(val => val !== optionValue);
                                            }
                                            onAnswerChange(questionId, newAnswer);
                                        }}
                                        style={{ accentColor: primary }}
                                        className="w-6 h-6 focus:ring-2 focus:ring-offset-2 rounded"
                                    />
                                    <span className="ml-3 text-gray-700 font-semibold flex-1 text-lg">
                                        {optionValue}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'YES_NO':
            case 'RADIO': // 예/아니오는 RADIO로 저장되지만 옵션이 ['예', '아니오']인 경우
                // 옵션이 ['예', '아니오']인 경우 예/아니오 스타일로 표시
                const isYesNoStyle = normalizedOptions.length === 2 && 
                    (normalizedOptions.includes('예') && normalizedOptions.includes('아니오'));
                
                if (isYesNoStyle) {
                    const yesValue = normalizedOptions.find(val => val === '예' || val.includes('예')) || normalizedOptions[0];
                    const noValue = normalizedOptions.find(val => val === '아니오' || val.includes('아니오')) || normalizedOptions[1];
                    
                    return (
                        <div className="flex gap-4">
                            <label
                                className={`
                                    flex-1 flex items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                                    ${answer === yesValue 
                                        ? 'shadow-lg' 
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                                style={answer === yesValue ? {
                                    borderColor: tertiaryColor || '#22C55E',
                                    backgroundColor: `${tertiaryColor || '#22C55E'}20`,
                                    borderWidth: '3px',
                                } : {}}
                            >
                                <input
                                    type="radio"
                                    name={`q_${questionId}`}
                                    value={yesValue}
                                    checked={answer === yesValue}
                                    onChange={() => onAnswerChange(questionId, yesValue)}
                                    style={{ accentColor: tertiaryColor || '#22C55E' }}
                                    className="w-6 h-6 focus:ring-2 focus:ring-offset-2 mr-3"
                                />
                                <span className="text-xl font-bold text-gray-800">{yesValue}</span>
                            </label>
                            <label
                                className={`
                                    flex-1 flex items-center justify-center p-6 rounded-xl border-2 cursor-pointer transition-all duration-200
                                    ${answer === noValue 
                                        ? 'shadow-lg' 
                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                    }
                                `}
                                style={answer === noValue ? {
                                    borderColor: '#EF4444',
                                    backgroundColor: '#EF444420',
                                    borderWidth: '3px',
                                } : {}}
                            >
                                <input
                                    type="radio"
                                    name={`q_${questionId}`}
                                    value={noValue}
                                    checked={answer === noValue}
                                    onChange={() => onAnswerChange(questionId, noValue)}
                                    style={{ accentColor: '#EF4444' }}
                                    className="w-6 h-6 focus:ring-2 focus:ring-offset-2 mr-3"
                                />
                                <span className="text-xl font-bold text-gray-800">{noValue}</span>
                            </label>
                        </div>
                    );
                }
                // 체크박스로 표시하되 단일 선택만 가능
                return (
                    <div className="space-y-3">
                        {normalizedOptions.map((optionValue, idx) => {
                            const isSelected = answer === optionValue;
                            return (
                                <label
                                    key={idx}
                                    className={`
                                        flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                        ${isSelected 
                                            ? 'shadow-lg border-2' 
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                    style={isSelected ? {
                                        borderColor: primary,
                                        backgroundColor: `${primary}20`,
                                        borderWidth: '3px',
                                    } : {}}
                                >
                                    <input
                                        type="checkbox"
                                        value={optionValue}
                                        checked={isSelected}
                                        onChange={(e) => {
                                            // 체크박스지만 단일 선택만 가능: 선택하면 다른 것들은 해제
                                            if (e.target.checked) {
                                                onAnswerChange(questionId, optionValue);
                                            } else {
                                                onAnswerChange(questionId, '');
                                            }
                                        }}
                                        style={{ accentColor: primary }}
                                        className="w-6 h-6 focus:ring-2 focus:ring-offset-2 rounded"
                                    />
                                    <span className="ml-3 text-gray-700 font-semibold flex-1 text-lg">
                                        {optionValue}
                                    </span>
                                </label>
                            );
                        })}
                    </div>
                );

            case 'DROPDOWN':
                return (
                    <div className="relative">
                        <select
                            value={answer}
                            onChange={(e) => onAnswerChange(questionId, e.target.value)}
                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 focus:border-indigo-500 text-gray-700 bg-white shadow-sm transition-all appearance-none cursor-pointer text-lg font-medium"
                            style={answer ? {
                                borderColor: primary,
                                backgroundColor: `${primary}05`,
                            } : {}}
                        >
                            <option value="">선택해주세요</option>
                            {normalizedOptions.map((optionValue, idx) => (
                                <option key={idx} value={optionValue}>
                                    {optionValue}
                                </option>
                            ))}
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                );

            case 'STAR_RATING':
                // 옵션에서 별점 값 가져오기 (없으면 1-5 사용)
                const ratingOptions = normalizedOptions.length > 0 
                    ? normalizedOptions.map(opt => parseInt(opt) || opt).filter(r => !isNaN(r))
                    : [1, 2, 3, 4, 5];
                const maxRating = ratingOptions.length > 0 ? Math.max(...ratingOptions) : 5;
                const stars = Array.from({ length: maxRating }, (_, i) => i + 1);
                const answerNum = typeof answer === 'string' ? parseInt(answer) : (answer || 0);
                
                return (
                    <div className="flex flex-col items-center gap-4 py-6">
                        <div className="flex items-center justify-center gap-3">
                            {stars.map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => onAnswerChange(questionId, star.toString())}
                                    className={`
                                        text-5xl transition-all duration-200 transform hover:scale-125 active:scale-95
                                        ${answerNum >= star ? 'text-yellow-400 drop-shadow-lg' : 'text-gray-300'}
                                    `}
                                    style={answerNum >= star ? {
                                        filter: 'drop-shadow(0 4px 6px rgba(251, 191, 36, 0.3))'
                                    } : {}}
                                >
                                    ★
                                </button>
                            ))}
                        </div>
                        {answer && (
                            <div className="text-center">
                                <span className="text-2xl font-bold text-gray-800">
                                    {answerNum}점
                                </span>
                                {ratingOptions.includes(answerNum) && (
                                    <p className="text-sm text-gray-500 mt-1">선택됨</p>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'SCALE':
            case 'LIKERT':
                // 척도 설정 가져오기
                const scaleMin = question.scaleMin !== undefined ? question.scaleMin : 0;
                const scaleMax = question.scaleMax !== undefined ? question.scaleMax : (normalizedOptions.length > 0 ? normalizedOptions.length : 10);
                const scaleLeftLabel = question.scaleLeftLabel || '';
                const scaleRightLabel = question.scaleRightLabel || '';
                
                // 옵션에서 척도 레이블 가져오기
                const scaleOptions = normalizedOptions.length > 0 
                    ? normalizedOptions
                    : ['매우 동의', '동의', '보통', '비동의', '매우 비동의'];
                const scalePoints = scaleOptions.length;
                const scaleLabels = scaleOptions;
                
                return (
                    <div className="space-y-4">
                        {/* 왼쪽/오른쪽 라벨 표시 */}
                        {(scaleLeftLabel || scaleRightLabel) && (
                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                <span>{scaleLeftLabel}</span>
                                <span>{scaleRightLabel}</span>
                            </div>
                        )}
                        <div className="flex items-stretch justify-between gap-2">
                            {Array.from({ length: scalePoints }, (_, i) => i + 1).map((point) => {
                                const pointValue = scaleOptions[point - 1] || point.toString();
                                const isSelected = answer === pointValue || answer === point.toString();
                                return (
                                    <label
                                        key={point}
                                        className={`
                                            flex-1 flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 min-h-[120px] justify-between
                                            ${isSelected 
                                                ? 'shadow-lg border-2' 
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                            }
                                        `}
                                        style={isSelected ? {
                                            borderColor: primary,
                                            backgroundColor: `${primary}20`,
                                            borderWidth: '3px',
                                        } : {}}
                                    >
                                        <input
                                            type="checkbox"
                                            value={pointValue}
                                            checked={isSelected}
                                            onChange={(e) => {
                                                // 체크박스지만 단일 선택만 가능: 선택하면 다른 것들은 해제
                                                if (e.target.checked) {
                                                    onAnswerChange(questionId, pointValue);
                                                } else {
                                                    onAnswerChange(questionId, '');
                                                }
                                            }}
                                            style={{ accentColor: primary }}
                                            className="w-6 h-6 focus:ring-2 focus:ring-offset-2 rounded mb-2"
                                        />
                                        <span className="text-xl font-bold text-gray-800 mb-2">{point}</span>
                                        {scaleLabels[point - 1] && (
                                            <span className="text-xs text-gray-600 mt-1 text-center leading-tight font-medium">
                                                {scaleLabels[point - 1]}
                                            </span>
                                        )}
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                );

            case 'TEXT':
                return (
                    <input
                        type="text"
                        value={answer}
                        onChange={(e) => onAnswerChange(questionId, e.target.value)}
                        placeholder="답변을 입력하세요 (단답형)"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 text-gray-700 bg-white shadow-sm transition-all"
                    />
                );

            case 'TEXTAREA':
            case 'DESCRIPTIVE':
                return (
                    <textarea
                        value={answer}
                        onChange={(e) => onAnswerChange(questionId, e.target.value)}
                        rows={5}
                        placeholder="답변을 입력하세요 (서술형)"
                        className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 bg-white shadow-sm transition-all resize-none"
                    />
                );

            case 'RADIO_IMAGE':
            case 'CHECKBOX_IMAGE':
            case 'IMAGE_SELECT':
                // 이미지 옵션은 원본 question.options에서 imageBase64를 가져와야 함
                const isMultiImage = questionType === 'CHECKBOX_IMAGE' || questionType === 'IMAGE_SELECT';
                return (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {(question.options || []).map((option, idx) => {
                            const optionValue = typeof option === 'string' ? option : (option.text || option.label || option.content || String(option));
                            const imageBase64 = typeof option === 'object' ? (option.imageBase64 || option.image) : null;
                            const isChecked = isMultiImage
                                ? Array.isArray(answer) && answer.includes(optionValue)
                                : answer === optionValue;
                            
                            return (
                                <label
                                    key={idx}
                                    className={`
                                        relative flex flex-col items-center p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 overflow-hidden group
                                        ${isChecked 
                                            ? 'shadow-xl ring-4 border-2' 
                                            : 'border-gray-200 hover:border-gray-400 hover:shadow-md'
                                        }
                                    `}
                                    style={isChecked ? {
                                        borderColor: primary,
                                        backgroundColor: `${primary}10`,
                                        ringColor: `${primary}40`,
                                        borderWidth: '3px',
                                    } : {}}
                                >
                                    <input
                                        type={isMultiImage ? 'checkbox' : 'radio'}
                                        name={`q_${questionId}`}
                                        value={optionValue}
                                        checked={isChecked}
                                        onChange={(e) => {
                                            if (isMultiImage) {
                                                let newAnswer = Array.isArray(answer) ? [...answer] : [];
                                                if (e.target.checked) {
                                                    if (!newAnswer.includes(optionValue)) {
                                                        newAnswer.push(optionValue);
                                                    }
                                                } else {
                                                    newAnswer = newAnswer.filter(val => val !== optionValue);
                                                }
                                                onAnswerChange(questionId, newAnswer);
                                            } else {
                                                onAnswerChange(questionId, optionValue);
                                            }
                                        }}
                                        style={{ accentColor: primary }}
                                        className="absolute top-2 right-2 w-6 h-6 focus:ring-2 focus:ring-offset-2 z-10"
                                    />
                                    {imageBase64 && imageBase64.trim() !== '' && imageBase64.startsWith('data:image/') ? (
                                        <div className="w-full aspect-square mb-2 rounded-lg overflow-hidden bg-gray-100">
                                            <img 
                                                src={imageBase64} 
                                                alt={optionValue}
                                                className={`w-full h-full object-cover transition-transform duration-200 ${
                                                    isChecked ? 'scale-105' : 'group-hover:scale-105'
                                                }`}
                                                onError={(e) => {
                                                    e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><span class="text-gray-400 text-sm">이미지 없음</span></div>';
                                                }}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-square mb-2 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                            <span className="text-gray-400 text-sm">이미지 없음</span>
                                        </div>
                                    )}
                                    {optionValue && (
                                        <span className="text-sm font-semibold text-gray-700 text-center mt-1">
                                            {optionValue}
                                        </span>
                                    )}
                                    {isChecked && (
                                        <div className="absolute top-1 left-1 bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                                            ✓
                                        </div>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                );

            default:
                // 디버깅: 매칭되지 않은 타입
                console.warn('[QuestionDisplay] Unsupported question type:', {
                    questionType: questionType,
                    rawType: rawType,
                    question: question
                });
                return (
                    <div className="p-4 bg-gray-100 rounded-lg text-gray-500 text-center">
                        <p>지원하지 않는 질문 유형입니다.</p>
                        <p className="text-xs mt-2">타입: {questionType || '(없음)'}</p>
                    </div>
                );
        }
    };

    return (
        <div 
            className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 mb-6"
            data-question-id={questionId}
        >
                <div className="flex items-start gap-3 mb-4">
                <div 
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{ 
                        background: `linear-gradient(135deg, ${primary} 0%, ${secondary} 100%)` 
                    }}
                >
                    {questionNumber}
                </div>
                <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800 mb-1">
                        {question.title || question.text || question.content}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                    </h4>
                    {question.imageBase64 && question.imageBase64.trim() !== '' && question.imageBase64.startsWith('data:image/') && (
                        <img 
                            src={question.imageBase64} 
                            alt="Question" 
                            className="w-full max-w-md mx-auto mt-3 rounded-lg shadow-sm"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                </div>
            </div>
            <div className="ml-11">
                {renderQuestion()}
            </div>
        </div>
    );
};

// ----------------------------------------------------
// 메인 컴포넌트: SurveyPage
// ----------------------------------------------------

const STEP_COVER = 1;        // 시작 페이지
const STEP_QUESTIONS = 2;    // 설문 참여
const STEP_PERSONAL_INFO = 3; // 개인 정보 입력 (설문 참여 끝에서)
const STEP_ENDING = 4;       // 완료 페이지

export default function SurveyPage() {
    const { surveyId } = useParams();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(STEP_COVER);
    const [personalInfoAnswers, setPersonalInfoAnswers] = useState({});
    const [userAnswers, setUserAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // 설문 데이터 로드
    useEffect(() => {
        if (!surveyId) {
            setError('유효하지 않은 설문 ID입니다.');
            setLoading(false);
            return;
        }
        
        const fetchSurvey = async () => {
            try {
                setLoading(true);
                
                // 1. 먼저 API에서 시도
                try {
                    const response = await axiosInstance.get(`/surveys/${surveyId}`);
                    let surveyData = null;
                    
                    // 응답 구조 확인 (success.data 또는 직접 데이터)
                    if (response.data.success && response.data.data) {
                        surveyData = response.data.data;
                    } else if (response.data.id || response.data._id) {
                        // 직접 설문 데이터인 경우
                        surveyData = response.data;
                    }
                    
                    if (surveyData) {
                        // 질문 데이터 정규화 (옵션이 문자열 배열인 경우 처리)
                        if (surveyData.questions) {
                            surveyData.questions = surveyData.questions.map(q => {
                                const normalizedType = q.type ? String(q.type).toUpperCase().trim() : 'TEXT';
                                // 디버깅: API 응답에서 받은 타입 확인
                                if (process.env.NODE_ENV === 'development') {
                                    console.log('[fetchSurvey] API question:', {
                                        originalType: q.type,
                                        normalizedType: normalizedType,
                                        question: q
                                    });
                                }
                                return {
                                    ...q,
                                    type: normalizedType,
                                    options: (q.options || []).map(opt => 
                                        typeof opt === 'string' ? opt : (opt.text || opt.label || opt.content || String(opt))
                                    )
                                };
                            });
                        }
                        setSurvey(surveyData);
                        setCurrentStep(STEP_COVER); // 항상 시작 페이지부터
                        setError(null);
                        setLoading(false);
                        return;
                    }
                } catch (apiErr) {
                    console.log('API 로드 실패, 로컬 스토리지에서 시도:', apiErr);
                }
                
                // 2. API 실패 시 로컬 스토리지에서 로드
                const localData = localStorage.getItem(`survey_${surveyId}`);
                if (localData) {
                    try {
                        const data = JSON.parse(localData);
                        // 질문 데이터 정규화 (로컬 스토리지 데이터도 처리)
                        if (data.questions) {
                            data.questions = data.questions.map(q => {
                                const normalizedType = q.type ? String(q.type).toUpperCase().trim() : 'TEXT';
                                // 디버깅: 로컬 스토리지에서 받은 타입 확인
                                if (process.env.NODE_ENV === 'development') {
                                    console.log('[fetchSurvey] LocalStorage question:', {
                                        originalType: q.type,
                                        normalizedType: normalizedType,
                                        question: q
                                    });
                                }
                                return {
                                    ...q,
                                    type: normalizedType,
                                    options: (q.options || []).map(opt => 
                                        typeof opt === 'string' ? opt : (opt.text || opt.label || opt.content || String(opt))
                                    )
                                };
                            });
                        }
                        setSurvey(data);
                        setCurrentStep(STEP_COVER);
                        setError(null);
                        setLoading(false);
                        return;
                    } catch (parseErr) {
                        console.error('로컬 스토리지 파싱 오류:', parseErr);
                    }
                }
                
                setError('요청하신 설문지를 찾을 수 없습니다.');
            } catch (err) {
                console.error('설문 데이터 로드 오류:', err);
                setError('설문지를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchSurvey();
    }, [surveyId]);

    const handleAnswerChange = useCallback((questionId, value) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: value }));
    }, []);

    const handlePersonalInfoChange = useCallback((field, value) => {
        setPersonalInfoAnswers(prev => ({ ...prev, [field]: value }));
    }, []);
    
    // 필수 응답 검증 (구체적인 항목 반환)
    const validateAnswers = useCallback((questions, answers) => {
        const missingQuestions = [];
        for (const q of questions) {
            if (q.required) {
                const questionId = q._id || q.id;
                const answer = answers[questionId];
                const isEmpty = (answer === null || answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0));
                
                if (isEmpty) {
                    missingQuestions.push({
                        id: questionId,
                        title: q.title || q.text || q.content || `질문 ${questions.indexOf(q) + 1}`
                    });
                }
            }
        }
        return missingQuestions;
    }, []);
    
    // 개인 정보 필수 필드 검증 (구체적인 항목 반환)
    const validatePersonalInfo = useCallback((personalInfo, answers) => {
        if (!personalInfo?.enabled) return [];
        
        const missingFields = [];
        const requiredFields = personalInfo.fields || [];
        for (const field of requiredFields) {
            const fieldDef = PERSONAL_INFO_FIELDS.find(f => f.value === field);
            if (fieldDef?.required && !answers[field]) {
                missingFields.push(fieldDef.label);
            }
        }
        
        if (personalInfo.consentRequired && !answers.consent) {
            missingFields.push('개인 정보 수집 및 이용 동의');
        }
        
        return missingFields;
    }, []);
    
    // 설문 참여 시작 (시작 페이지 → 질문 단계)
    const handleStartSurvey = useCallback((e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (loading) return; // 로딩 중이면 실행하지 않음
        setCurrentStep(STEP_QUESTIONS);
    }, [loading]);
    
    // 질문 단계 완료 (질문 → 개인 정보 또는 완료 페이지)
    const handleQuestionsSubmit = async (e) => {
        e.preventDefault();
        
        // 필수 응답 검증
        const missingQuestions = validateAnswers(survey.questions, userAnswers);
        if (missingQuestions.length > 0) {
            const questionList = missingQuestions.map(q => `- ${q.title}`).join('\n');
            alert(`다음 필수 질문에 답변해 주세요:\n\n${questionList}`);
            // 스크롤 to first missing question
            const firstMissingId = missingQuestions[0].id;
            const questionElement = document.querySelector(`[data-question-id="${firstMissingId}"]`);
            if (questionElement) {
                questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                questionElement.classList.add('ring-4', 'ring-red-500');
                setTimeout(() => {
                    questionElement.classList.remove('ring-4', 'ring-red-500');
                }, 3000);
            }
            return;
        }

        // 개인 정보 수집이 활성화되어 있으면 개인 정보 단계로, 아니면 바로 제출
        if (survey.personalInfo?.enabled) {
            setCurrentStep(STEP_PERSONAL_INFO);
        } else {
            // 바로 제출
            await submitSurvey();
        }
    };
    
    // 개인 정보 제출 (개인 정보 → 완료 페이지)
    const handlePersonalInfoSubmit = async (e) => {
        e.preventDefault();
        
        // 개인 정보 필수 필드 검증
        const missingFields = validatePersonalInfo(survey.personalInfo, personalInfoAnswers);
        if (missingFields.length > 0) {
            const fieldList = missingFields.map(f => `- ${f}`).join('\n');
            alert(`다음 필수 항목을 입력해 주세요:\n\n${fieldList}`);
            // 스크롤 to first missing field
            const firstMissingField = survey.personalInfo.fields.find(f => {
                const fieldDef = PERSONAL_INFO_FIELDS.find(fd => fd.value === f);
                return fieldDef?.required && !personalInfoAnswers[f];
            });
            if (firstMissingField) {
                const fieldElement = document.getElementById(firstMissingField);
                if (fieldElement) {
                    fieldElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    fieldElement.classList.add('ring-4', 'ring-red-500');
                    setTimeout(() => {
                        fieldElement.classList.remove('ring-4', 'ring-red-500');
                    }, 3000);
                }
            }
            return;
        }

        await submitSurvey();
    };
    
    // 최종 설문 제출
    const submitSurvey = async () => {
        setLoading(true);
        try {
            const isMongoId = /^[0-9a-fA-F]{24}$/.test(surveyId);
            
            if (isMongoId) {
                // API 응답 형식에 맞게 데이터 변환
                const answers = survey.questions.map((q) => ({
                    questionId: q._id || q.id,
                    answer: userAnswers[q._id || q.id],
                }));

                await axiosInstance.post(`/surveys/${surveyId}/response`, {
                    answers,
                    personalInfo: personalInfoAnswers,
                });
            } else {
                // 로컬 스토리지 기반 설문
                console.log('응답 제출 (로컬 스토리지):', {
                    surveyId: survey.id,
                    personalInfo: personalInfoAnswers,
                    answers: userAnswers,
                    submittedAt: new Date().toISOString(),
                });
            }
            
            setIsSubmitted(true);
            setCurrentStep(STEP_ENDING);
        } catch (e) {
            const errorMessage = e.response?.data?.message || '응답 제출에 실패했습니다. 다시 시도해 주세요.';
            alert(errorMessage);
            console.error('Submission error:', e);
        } finally {
            setLoading(false);
        }
    };
    
    // ----------------------------------------------------
    // Render Logic
    // ----------------------------------------------------
    
    // 브랜딩 색상 추출 (로딩 화면에서도 사용)
    const primaryColor = survey?.branding?.primaryColor || '#4F46E5';
    const secondaryColor = survey?.branding?.secondaryColor || '#6366F1';
    const tertiaryColor = survey?.branding?.tertiaryColor || '#22C55E';
    
    // 색상 밝기 계산
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };
    
    const rgb = hexToRgb(primaryColor);
    const bgColor = rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` : 'rgba(79, 70, 229, 0.1)';
    
    if (loading && !survey) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center"
                style={{
                    background: `linear-gradient(135deg, ${bgColor} 0%, rgba(255, 255, 255, 0.5) 50%, ${bgColor} 100%)`
                }}
            >
                <div className="text-center">
                    <div 
                        className="inline-block animate-spin rounded-full h-16 w-16 border-4 mb-4"
                        style={{
                            borderColor: `${primaryColor}30`,
                            borderTopColor: primaryColor,
                        }}
                    ></div>
                    <p className="text-lg font-medium text-gray-700">설문지를 불러오는 중입니다...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">오류 발생</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }
    
    if (!survey) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                    <p className="text-gray-600">설문지가 존재하지 않습니다.</p>
                </div>
            </div>
        );
    }
    
    // 제출 중 로딩 화면
    if (loading && (currentStep === STEP_QUESTIONS || currentStep === STEP_PERSONAL_INFO)) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center p-4"
                style={{
                    background: `linear-gradient(135deg, ${bgColor} 0%, rgba(255, 255, 255, 0.5) 50%, ${bgColor} 100%)`
                }}
            >
                <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
                    <div className="w-24 h-24 mx-auto mb-6 relative">
                        <div 
                            className="absolute inset-0 rounded-full border-4 animate-spin"
                            style={{
                                borderColor: `${primaryColor}30`,
                                borderTopColor: primaryColor,
                            }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${primaryColor}10` }}
                            >
                                <svg 
                                    className="w-8 h-8 animate-pulse" 
                                    style={{ color: primaryColor }}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        응답을 저장하는 중입니다...
                    </h2>
                    <p className="text-gray-600">
                        잠시만 기다려 주세요
                    </p>
                </div>
            </div>
        );
    }
    
    // 완료 페이지
    if (isSubmitted && currentStep === STEP_ENDING && !loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center relative animate-fade-in">
                    {survey.ending?.imageBase64 && survey.ending.imageBase64.trim() !== '' && survey.ending.imageBase64.startsWith('data:image/') && (
                        <img 
                            src={survey.ending.imageBase64} 
                            alt="Complete" 
                            className="w-32 h-32 mx-auto mb-6 object-cover rounded-full shadow-lg animate-scale-in"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    {/* 완료 체크마크 애니메이션 */}
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
                        <svg 
                            className="w-14 h-14 text-green-600 animate-checkmark" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            style={{
                                strokeDasharray: 50,
                                strokeDashoffset: 50,
                                animation: 'drawCheckmark 0.6s ease-in-out 0.3s forwards'
                            }}
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={3} 
                                d="M5 13l4 4L19 7" 
                            />
                        </svg>
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4 animate-fade-in-up">
                        {survey.ending?.title || '설문이 완료되었습니다!'}
                    </h2>
                    <p className="text-lg text-gray-600 mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        {survey.ending?.description || '귀하의 소중한 의견에 감사드립니다.'}
                    </p>
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 px-8 rounded-xl inline-block mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                        <p className="font-semibold">응답이 성공적으로 제출되었습니다.</p>
                    </div>
                    <style>{`
                        @keyframes drawCheckmark {
                            to {
                                stroke-dashoffset: 0;
                            }
                        }
                        @keyframes bounce-in {
                            0% {
                                transform: scale(0);
                                opacity: 0;
                            }
                            50% {
                                transform: scale(1.1);
                            }
                            100% {
                                transform: scale(1);
                                opacity: 1;
                            }
                        }
                        @keyframes fade-in {
                            from {
                                opacity: 0;
                            }
                            to {
                                opacity: 1;
                            }
                        }
                        @keyframes fade-in-up {
                            from {
                                opacity: 0;
                                transform: translateY(20px);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0);
                            }
                        }
                        @keyframes scale-in {
                            from {
                                transform: scale(0);
                                opacity: 0;
                            }
                            to {
                                transform: scale(1);
                                opacity: 1;
                            }
                        }
                        .animate-bounce-in {
                            animation: bounce-in 0.6s ease-out;
                        }
                        .animate-fade-in {
                            animation: fade-in 0.5s ease-out;
                        }
                        .animate-fade-in-up {
                            animation: fade-in-up 0.6s ease-out forwards;
                            opacity: 0;
                        }
                        .animate-scale-in {
                            animation: scale-in 0.5s ease-out;
                        }
                        .animate-checkmark {
                            animation: drawCheckmark 0.6s ease-in-out 0.3s forwards;
                        }
                    `}</style>
                </div>
            </div>
        );
    }
    
    // 시작 페이지 (Cover)
    if (currentStep === STEP_COVER) {
        return (
            <div 
                className="min-h-screen flex items-center justify-center p-4"
                style={survey.branding?.bgImageBase64 && survey.branding.bgImageBase64.trim() !== '' && survey.branding.bgImageBase64.startsWith('data:image/') ? {
                    backgroundImage: `url(${survey.branding.bgImageBase64})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                } : {
                    background: `linear-gradient(135deg, ${bgColor} 0%, rgba(255, 255, 255, 0.5) 50%, ${bgColor} 100%)`
                }}
            >
                <div className="max-w-3xl w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 text-center">
                    {survey.branding?.logoBase64 && survey.branding.logoBase64.trim() !== '' && survey.branding.logoBase64.startsWith('data:image/') && (
                        <img 
                            src={survey.branding.logoBase64} 
                            alt="Logo" 
                            className="w-24 h-24 mx-auto mb-6 object-contain"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        {survey.title}
                    </h1>
                    {survey.cover?.imageBase64 && survey.cover.imageBase64.trim() !== '' && survey.cover.imageBase64.startsWith('data:image/') && (
                        <img 
                            src={survey.cover.imageBase64} 
                            alt="Cover" 
                            className="w-full max-w-md mx-auto mb-6 rounded-2xl shadow-lg"
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    {survey.cover?.title && (
                        <h2 className="text-2xl font-semibold mb-4" style={{ color: primaryColor }}>
                            {survey.cover.title}
                        </h2>
                    )}
                    {survey.cover?.description && (
                        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {survey.cover.description}
                            </p>
                        </div>
                    )}
                    <button
                        onClick={handleStartSurvey}
                        disabled={loading}
                        className="w-full md:w-auto px-12 py-4 text-white text-lg font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                        style={{
                            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                        }}
                        onMouseEnter={(e) => {
                            if (!loading) {
                                const rgb = hexToRgb(primaryColor);
                                if (rgb) {
                                    const darker = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`;
                                    e.target.style.background = `linear-gradient(135deg, ${darker} 0%, ${secondaryColor} 100%)`;
                                }
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loading) {
                                e.target.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                            }
                        }}
                    >
                        설문 참여하기
                    </button>
                </div>
            </div>
        );
    }
    
    // 질문 단계
    if (currentStep === STEP_QUESTIONS) {
        return (
            <div 
                className="min-h-screen py-8 px-4"
                style={{
                    background: `linear-gradient(135deg, ${bgColor} 0%, rgba(255, 255, 255, 0.5) 50%, ${bgColor} 100%)`
                }}
            >
                <div className="max-w-4xl mx-auto">
                    {/* 헤더 */}
                    <div 
                        className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2"
                        style={{ borderColor: `${primaryColor}40` }}
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                {survey.branding?.logoBase64 && survey.branding.logoBase64.trim() !== '' && survey.branding.logoBase64.startsWith('data:image/') && (
                                    <img 
                                        src={survey.branding.logoBase64} 
                                        alt="Logo" 
                                        className="w-12 h-12 mb-2 object-contain"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                        }}
                                    />
                                )}
                                <h1 className="text-2xl font-bold text-gray-900">{survey.title}</h1>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-gray-500">진행률</div>
                                <div className="text-lg font-semibold" style={{ color: primaryColor }}>
                                    {survey.questions.length}개 질문
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* 질문 목록 */}
                    <form onSubmit={handleQuestionsSubmit} className="space-y-4">
                        {survey.questions.map((q, index) => (
                            <QuestionDisplay
                                key={q._id || q.id || index}
                                question={q}
                                userAnswers={userAnswers}
                                onAnswerChange={handleAnswerChange}
                                questionNumber={index + 1}
                                primaryColor={primaryColor}
                                secondaryColor={secondaryColor}
                                tertiaryColor={tertiaryColor}
                            />
                        ))}
                        
                        <div 
                            className="bg-white rounded-2xl shadow-lg p-6 border-2"
                            style={{ borderColor: `${primaryColor}40` }}
                        >
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 text-white text-lg font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                                style={{
                                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                                }}
                                onMouseEnter={(e) => {
                                    if (!loading) {
                                        const rgb = hexToRgb(primaryColor);
                                        if (rgb) {
                                            const darker = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`;
                                            e.target.style.background = `linear-gradient(135deg, ${darker} 0%, ${secondaryColor} 100%)`;
                                        }
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!loading) {
                                        e.target.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                                    }
                                }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                        제출 중...
                                    </span>
                                ) : (
                                    '다음 단계로'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    }
    
    // 개인 정보 입력 단계
    if (currentStep === STEP_PERSONAL_INFO) {
        return (
            <div 
                className="min-h-screen py-8 px-4"
                style={{
                    background: `linear-gradient(135deg, ${bgColor} 0%, rgba(255, 255, 255, 0.5) 50%, ${bgColor} 100%)`
                }}
            >
                <div className="max-w-2xl mx-auto">
                    {/* 헤더 */}
                    <div 
                        className="bg-white rounded-2xl shadow-lg p-6 mb-6 border-2 text-center"
                        style={{ borderColor: `${primaryColor}40` }}
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">개인 정보 입력</h2>
                        <p className="text-gray-600">설문 참여를 위해 개인 정보를 입력해주세요.</p>
                    </div>
                    
                    <form onSubmit={handlePersonalInfoSubmit} 
                        className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border-2"
                        style={{ borderColor: `${primaryColor}40` }}
                    >
                        <div className="space-y-6">
                            {/* 개인 정보 입력 필드 */}
                            {survey.personalInfo?.fields?.map(field => {
                                const fieldDef = PERSONAL_INFO_FIELDS.find(f => f.value === field);
                                if (!fieldDef) return null;
                                
                                // 성별 필드 특별 처리
                                if (field === 'gender') {
                                    return (
                                        <div key={fieldDef.value}>
                                            <label className="block text-sm font-semibold text-gray-700 mb-3">
                                                {fieldDef.label} {fieldDef.required && <span className="text-red-500">*</span>}
                                            </label>
                                            <div className="flex gap-4">
                                                <label
                                                    className={`
                                                        flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                        ${personalInfoAnswers[field] === 'male' 
                                                            ? 'shadow-md' 
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }
                                                    `}
                                                    style={personalInfoAnswers[field] === 'male' ? {
                                                        borderColor: primaryColor,
                                                        backgroundColor: `${primaryColor}15`,
                                                    } : {}}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="male"
                                                        checked={personalInfoAnswers[field] === 'male'}
                                                        onChange={(e) => handlePersonalInfoChange(field, e.target.value)}
                                                        style={{ accentColor: primaryColor }}
                                                        className="w-5 h-5 focus:ring-2 focus:ring-offset-2 mr-2"
                                                    />
                                                    <span className="text-lg font-medium text-gray-700">남</span>
                                                </label>
                                                <label
                                                    className={`
                                                        flex-1 flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                        ${personalInfoAnswers[field] === 'female' 
                                                            ? 'shadow-md' 
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }
                                                    `}
                                                    style={personalInfoAnswers[field] === 'female' ? {
                                                        borderColor: primaryColor,
                                                        backgroundColor: `${primaryColor}15`,
                                                    } : {}}
                                                >
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value="female"
                                                        checked={personalInfoAnswers[field] === 'female'}
                                                        onChange={(e) => handlePersonalInfoChange(field, e.target.value)}
                                                        style={{ accentColor: primaryColor }}
                                                        className="w-5 h-5 focus:ring-2 focus:ring-offset-2 mr-2"
                                                    />
                                                    <span className="text-lg font-medium text-gray-700">여</span>
                                                </label>
                                            </div>
                                        </div>
                                    );
                                }
                                
                                return (
                                    <div key={fieldDef.value}>
                                        <label htmlFor={fieldDef.value} className="block text-sm font-semibold text-gray-700 mb-2">
                                            {fieldDef.label} {fieldDef.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type={fieldDef.type}
                                            id={fieldDef.value}
                                            value={personalInfoAnswers[fieldDef.value] || ''}
                                            onChange={(e) => handlePersonalInfoChange(fieldDef.value, e.target.value)}
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 text-gray-700 bg-white shadow-sm transition-all"
                                            placeholder={fieldDef.placeholder}
                                        />
                                    </div>
                                );
                            })}
                            
                            {/* 커스텀 필드 */}
                            {survey.personalInfo?.customFields?.map((customField, idx) => (
                                <div key={customField.id || idx}>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {customField.label} {customField.required && <span className="text-red-500">*</span>}
                                    </label>
                                    {customField.type === 'text' ? (
                                        <input
                                            type="text"
                                            value={personalInfoAnswers[`custom_${customField.id}`] || ''}
                                            onChange={(e) => handlePersonalInfoChange(`custom_${customField.id}`, e.target.value)}
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-offset-2 text-gray-700 bg-white shadow-sm transition-all"
                                        />
                                    ) : (
                                        <textarea
                                            value={personalInfoAnswers[`custom_${customField.id}`] || ''}
                                            onChange={(e) => handlePersonalInfoChange(`custom_${customField.id}`, e.target.value)}
                                            rows={4}
                                            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-700 bg-white shadow-sm transition-all resize-none"
                                        />
                                    )}
                                </div>
                            ))}
                            
                            {/* 동의 문구 및 체크박스 */}
                            {survey.personalInfo?.consentText && (
                                <div>
                                    <h4 className="text-base font-semibold text-gray-800 mb-3">개인 정보 수집 및 이용 동의</h4>
                                    <div className="border-2 border-gray-200 p-4 rounded-xl h-40 overflow-y-auto text-sm text-gray-700 bg-gray-50 mb-4">
                                        {survey.personalInfo.consentText}
                                    </div>
                                    <label 
                                        className="flex items-start gap-3 p-4 rounded-xl border-2 border-gray-200 transition-all cursor-pointer"
                                        style={{
                                            '--hover-border-color': `${primaryColor}80`,
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = `${primaryColor}80`;
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = '#e5e7eb';
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={personalInfoAnswers.consent || false}
                                            onChange={(e) => handlePersonalInfoChange('consent', e.target.checked)}
                                            style={{ accentColor: primaryColor }}
                                            className="mt-1 w-5 h-5 focus:ring-2 focus:ring-offset-2 rounded"
                                        />
                                        <span className="text-sm text-gray-700">
                                            개인 정보 수집 및 이용에 동의합니다.
                                            {survey.personalInfo.consentRequired && <span className="text-red-500 ml-1">*</span>}
                                        </span>
                                    </label>
                                </div>
                            )}
                        </div>
                        
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-6 py-4 text-white text-lg font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                            style={{
                                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                            }}
                            onMouseEnter={(e) => {
                                if (!loading) {
                                    const rgb = hexToRgb(primaryColor);
                                    if (rgb) {
                                        const darker = `rgb(${Math.max(0, rgb.r - 20)}, ${Math.max(0, rgb.g - 20)}, ${Math.max(0, rgb.b - 20)})`;
                                        e.target.style.background = `linear-gradient(135deg, ${darker} 0%, ${secondaryColor} 100%)`;
                                    }
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!loading) {
                                    e.target.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`;
                                }
                            }}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                                    제출 중...
                                </span>
                            ) : (
                                '설문 제출하기'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        );
    }
    
    return null;
}
