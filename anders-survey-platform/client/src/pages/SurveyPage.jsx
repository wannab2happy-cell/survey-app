import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';

// ✅ [최종 수정]: pages 폴더에서 src 폴더의 constants.js를 참조하는 올바른 경로
import { QUESTION_TYPES, PERSONAL_INFO_FIELDS } from '../constants.js'; 

// ----------------------------------------------------
// 💡 로컬 스토리지 헬퍼 함수
// ----------------------------------------------------

// SurveyBuilder.jsx에서 사용되는 로직과 동일하게 설문을 로드합니다.
const loadSurvey = (id) => {
    const data = localStorage.getItem(`survey_${id}`);
    if (data) {
        return JSON.parse(data);
    }
    return null;
};

// 응답 제출 로직 (현재는 목업)
const submitResponse = (response) => {
    console.log('응답 제출:', response);
    // 실제 서버 전송 로직이 들어갈 자리입니다.
    return new Promise(resolve => setTimeout(resolve, 500));
};

// ----------------------------------------------------
// 💡 응답자용 질문 렌더링 (QuestionDisplay 컴포넌트 목업)
// ----------------------------------------------------

const QuestionDisplay = ({ question, userAnswers, onAnswerChange }) => {
    const answer = userAnswers[question.id] || '';
    const isOptionType = ['radio', 'checkbox', 'dropdown', 'image_select'].includes(question.type);
    
    // 이 컴포넌트는 설문 참여 페이지에서 실제 응답 양식을 렌더링합니다.
    return (
        <div className="bg-white p-5 border border-gray-200 rounded-lg shadow-sm mb-4">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">
                {question.text} {question.required && <span className="text-red-500">*</span>}
            </h4>
            
            {isOptionType ? (
                // 옵션 기반 질문 처리 (radio, checkbox 등)
                <div className="space-y-2">
                    {question.options.map(option => (
                        <div key={option.id} className="flex items-center">
                            <input
                                type={question.type === 'checkbox' ? 'checkbox' : 'radio'}
                                name={`q_${question.id}`}
                                id={`q_${question.id}_${option.id}`}
                                value={option.id}
                                checked={
                                    question.type === 'checkbox' 
                                        ? Array.isArray(answer) && answer.includes(option.id) 
                                        : answer === option.id
                                }
                                onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (question.type === 'checkbox') {
                                        let newAnswer = Array.isArray(answer) ? [...answer] : [];
                                        if (e.target.checked) {
                                            newAnswer.push(value);
                                        } else {
                                            newAnswer = newAnswer.filter(id => id !== value);
                                        }
                                        onAnswerChange(question.id, newAnswer);
                                    } else {
                                        onAnswerChange(question.id, value);
                                    }
                                }}
                                className="form-radio h-4 w-4 text-indigo-600"
                            />
                            <label htmlFor={`q_${question.id}_${option.id}`} className="ml-3 text-gray-700">
                                {option.text}
                            </label>
                        </div>
                    ))}
                </div>
            ) : (
                // 텍스트 입력 질문 처리 (text, textarea)
                <textarea
                    value={answer}
                    onChange={(e) => onAnswerChange(question.id, e.target.value)}
                    rows={question.type === 'textarea' ? 4 : 1}
                    placeholder="응답을 입력하세요."
                    className="w-full border border-gray-300 p-2 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                />
            )}
        </div>
    );
};


// ----------------------------------------------------
// 메인 컴포넌트: SurveyPage
// ----------------------------------------------------

const STEP_PERSONAL_INFO = 1;
const STEP_QUESTIONS = 2;
const STEP_ENDING = 3;

export default function SurveyPage() {
    const { id } = useParams();
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentStep, setCurrentStep] = useState(STEP_PERSONAL_INFO); // 시작 단계: 개인 정보
    const [personalInfoAnswers, setPersonalInfoAnswers] = useState({});
    const [userAnswers, setUserAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // 설문 데이터 로드
    useEffect(() => {
        if (!id) {
            setError('유효하지 않은 설문 ID입니다.');
            setLoading(false);
            return;
        }
        
        const data = loadSurvey(id);
        if (data) {
            // 개인 정보 단계가 비활성화되어 있으면 문항 단계부터 시작
            const startStep = data.personalInfo?.enabled ? STEP_PERSONAL_INFO : STEP_QUESTIONS;
            setSurvey(data);
            setCurrentStep(startStep);
        } else {
            setError('요청하신 설문지를 찾을 수 없습니다.');
        }
        setLoading(false);
    }, [id]);

    const handleAnswerChange = useCallback((questionId, value) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: value }));
    }, []);

    const handlePersonalInfoChange = useCallback((field, value) => {
        setPersonalInfoAnswers(prev => ({ ...prev, [field]: value }));
    }, []);
    
    // 필수 응답 검증 헬퍼
    const validateAnswers = useCallback((questions, answers) => {
        let isValid = true;
        for (const q of questions) {
            if (q.required) {
                const answer = answers[q.id];
                const isEmpty = (answer === null || answer === undefined || answer === '' || (Array.isArray(answer) && answer.length === 0));
                
                if (isEmpty) {
                    isValid = false;
                    break;
                }
            }
        }
        return isValid;
    }, []);
    
    // 제출 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // 문항 단계 필수 응답 검증
        if (!validateAnswers(survey.questions, userAnswers)) {
            alert('필수 응답 문항에 모두 답변해 주세요.');
            return;
        }

        setLoading(true);
        try {
            await submitResponse({
                surveyId: survey.id,
                personalInfo: personalInfoAnswers,
                answers: userAnswers,
                submittedAt: new Date().toISOString(),
            });
            setIsSubmitted(true);
        } catch (e) {
            alert('응답 제출에 실패했습니다. 다시 시도해 주세요.');
            console.error('Submission error:', e);
        } finally {
            setLoading(false);
        }
    };
    
    // 개인 정보 단계 제출 핸들러 (다음 단계로 이동)
    const handlePersonalInfoSubmit = (e) => {
        e.preventDefault();
        
        // 개인 정보 단계 필수 필드 검증 (예: 이름은 항상 필수)
        const requiredFields = survey.personalInfo.fields;
        let infoValid = true;
        for (const field of requiredFields) {
            if (!personalInfoAnswers[field]) {
                infoValid = false;
                alert(`${PERSONAL_INFO_FIELDS.find(f => f.value === field)?.label}은(는) 필수 입력 항목입니다.`);
                break;
            }
        }
        
        if (infoValid && survey.personalInfo.consentRequired && !personalInfoAnswers.consent) {
            alert('개인 정보 수집 및 이용에 동의해야 설문 참여가 가능합니다.');
            infoValid = false;
        }

        if (infoValid) {
            setCurrentStep(STEP_QUESTIONS);
        }
    };

    // ----------------------------------------------------
    // 💡 Render Logic
    // ----------------------------------------------------
    
    if (loading) return <div className="p-10 text-center text-indigo-600">설문지를 불러오는 중입니다...</div>;
    if (error) return <div className="p-10 text-center text-red-600 font-bold">오류: {error}</div>;
    if (!survey) return <div className="p-10 text-center text-gray-500">설문지가 존재하지 않습니다.</div>;
    if (isSubmitted) return (
        // 설문 완료 화면
        <div className="max-w-xl mx-auto p-8 bg-white shadow-xl rounded-lg text-center mt-10">
            <h2 className="text-3xl font-bold text-indigo-700 mb-4">{survey.ending.title}</h2>
            {survey.ending.imageBase64 && <img src={survey.ending.imageBase64} alt="Ending" className="w-32 h-32 mx-auto mb-4 object-cover rounded-full" />}
            <p className="text-gray-600">{survey.ending.description}</p>
        </div>
    );
    
    const personalInfoEnabled = survey.personalInfo?.enabled;
    const isQuestionStep = currentStep === STEP_QUESTIONS || !personalInfoEnabled;

    return (
        <div className="min-h-screen bg-gray-100 p-4 md:p-8">
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-lg p-6">
                
                {/* 설문 제목 및 커버 */}
                <header className="text-center pb-6 border-b mb-6">
                    {survey.branding.logoBase64 && <img src={survey.branding.logoBase64} alt="Logo" className="w-16 h-16 mx-auto mb-3 object-contain" />}
                    <h1 className="text-3xl font-bold text-gray-800">{survey.title}</h1>
                    <p className="text-gray-500 mt-1">{survey.status === 'active' ? '지금 참여 가능' : '비활성'}</p>
                    
                    {currentStep === STEP_PERSONAL_INFO && (
                        <>
                            <h2 className="text-2xl font-semibold mt-4 text-indigo-600">{survey.cover.title}</h2>
                            <p className="text-gray-600 mt-2">{survey.cover.description}</p>
                        </>
                    )}
                </header>

                <main>
                    {/* 1. 개인 정보 단계 (활성화된 경우) */}
                    {personalInfoEnabled && currentStep === STEP_PERSONAL_INFO && (
                        <form onSubmit={handlePersonalInfoSubmit} className="space-y-6">
                            <h3 className="text-xl font-semibold text-indigo-700 mb-4">개인 정보 수집 동의</h3>
                            
                            <div className="border border-gray-300 p-4 rounded-lg bg-gray-50 space-y-3">
                                <p className="text-sm font-medium text-gray-700">수집 항목:</p>
                                <div className="flex flex-wrap gap-x-4">
                                    {PERSONAL_INFO_FIELDS.filter(f => survey.personalInfo.fields.includes(f.value)).map(field => (
                                        <div key={field.value} className="text-sm text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                                            {field.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* 개인 정보 입력 필드 */}
                            {survey.personalInfo.fields.map(field => {
                                const fieldDef = PERSONAL_INFO_FIELDS.find(f => f.value === field);
                                if (!fieldDef) return null;
                                return (
                                    <div key={fieldDef.value}>
                                        <label htmlFor={fieldDef.value} className="block text-sm font-medium text-gray-700">
                                            {fieldDef.label} {fieldDef.required && <span className="text-red-500">*</span>}
                                        </label>
                                        <input
                                            type={fieldDef.type}
                                            id={fieldDef.value}
                                            value={personalInfoAnswers[fieldDef.value] || ''}
                                            onChange={(e) => handlePersonalInfoChange(fieldDef.value, e.target.value)}
                                            className="mt-1 block w-full border border-gray-300 p-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                );
                            })}
                            
                            {/* 동의 문구 및 체크박스 */}
                            <div>
                                <h4 className="text-base font-semibold text-gray-800 mb-2">수집 및 이용 동의</h4>
                                <div className="border border-gray-300 p-3 rounded-md h-32 overflow-y-auto text-sm text-gray-700 bg-white">
                                    {survey.personalInfo.consentText}
                                </div>
                                <div className="flex items-center mt-3">
                                    <input
                                        type="checkbox"
                                        id="consent"
                                        checked={personalInfoAnswers.consent || false}
                                        onChange={(e) => handlePersonalInfoChange('consent', e.target.checked)}
                                        className="form-checkbox h-5 w-5 text-indigo-600 rounded"
                                    />
                                    <label htmlFor="consent" className="ml-3 text-sm text-gray-700">
                                        개인 정보 수집 및 이용에 동의합니다. {survey.personalInfo.consentRequired && <span className="text-red-500">*</span>}
                                    </label>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                다음 단계 (문항) →
                            </button>
                        </form>
                    )}

                    {/* 2. 문항 단계 (개인 정보 단계 스킵 시 바로 여기부터 시작) */}
                    {(isQuestionStep || !personalInfoEnabled) && currentStep === STEP_QUESTIONS && (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <h3 className="text-xl font-semibold text-indigo-700 mb-4">설문 문항에 응답해 주세요.</h3>
                            
                            {survey.questions.map((q) => (
                                <QuestionDisplay
                                    key={q.id}
                                    question={q}
                                    userAnswers={userAnswers}
                                    onAnswerChange={handleAnswerChange}
                                />
                            ))}

                            <button
                                type="submit"
                                className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? '제출 중...' : '✅ 응답 제출하기'}
                            </button>
                        </form>
                    )}
                </main>
            </div>
        </div>
    );
}