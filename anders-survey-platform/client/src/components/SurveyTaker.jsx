// client/src/components/SurveyTaker.jsx

import React, { useState, useEffect } from 'react';

// 응답 로직을 처리할 Question 컴포넌트
const QuestionDisplay = ({ question, userAnswers, onAnswerChange }) => {
    const isText = question.type === 'text';
    const isSingle = question.type === 'single_choice';
    
    // 현재 질문의 사용자 응답 값
    const currentAnswer = userAnswers[question.id] || (isSingle ? null : []);
    
    const handleChange = (e) => {
        let newValue;
        if (isText) {
            newValue = e.target.value;
        } else if (isSingle) {
            // 객관식 (단일 선택)
            newValue = parseInt(e.target.value); 
        } else {
            // 복수 선택 (체크박스)
            const optionId = parseInt(e.target.value);
            const isChecked = e.target.checked;
            
            if (isChecked) {
                newValue = [...currentAnswer, optionId];
            } else {
                newValue = currentAnswer.filter(id => id !== optionId);
            }
        }
        onAnswerChange(question.id, newValue);
    };

    return (
        <div className="question-display-card">
            <h4 className="question-text">{question.text}</h4>
            
            <div className="answer-options">
                {isText ? (
                    // 주관식 응답
                    <textarea 
                        className="text-answer-input"
                        placeholder="여기에 응답을 입력하세요..."
                        value={currentAnswer}
                        onChange={handleChange}
                    />
                ) : (
                    // 객관식/복수 선택 응답
                    question.Options.map(option => (
                        <label key={option.id} className="option-label">
                            <input
                                type={isSingle ? 'radio' : 'checkbox'}
                                name={`q_${question.id}`} // 라디오 버튼 그룹화
                                value={option.id}
                                checked={isSingle 
                                    ? currentAnswer === option.id 
                                    : currentAnswer.includes(option.id)
                                }
                                onChange={handleChange}
                            />
                            {option.text}
                        </label>
                    ))
                )}
            </div>
        </div>
    );
};


const SurveyTaker = () => {
    // 🚨 중요: 여기에 이전에 생성하고 DB에 저장한 설문 ID를 넣어주세요.
    const hardcodedSurveyId = 1; 
    
    const [survey, setSurvey] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [userAnswers, setUserAnswers] = useState({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    // 응답 변경 핸들러
    const handleAnswerChange = (questionId, answer) => {
        setUserAnswers(prev => ({
            ...prev,
            [questionId]: answer
        }));
    };

    // 1. 설문 데이터 로딩
    useEffect(() => {
        const fetchSurvey = async () => {
            try {
                // 백엔드 GET /api/surveys 엔드포인트 호출 (관리자 토큰 불필요)
                const response = await fetch(`/api/surveys?id=${hardcodedSurveyId}`);
                const data = await response.json();

                if (!response.ok || !data.surveys || data.surveys.length === 0) {
                    throw new Error(data.error || "설문지를 찾을 수 없습니다.");
                }
                
                // Question 및 Option 포함된 첫 번째 설문 사용
                setSurvey(data.surveys[0]);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchSurvey();
    }, [hardcodedSurveyId]);


    // 2. 응답 제출 로직
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // 유효성 검사 (필수 응답 등은 나중에 추가 가능)
        if (Object.keys(userAnswers).length === 0) {
            setError("응답을 입력해 주세요.");
            setLoading(false);
            return;
        }

        // 응답 데이터 구조 조정: {questionId: answer} -> {answers: {questionId: answer}}
        const responsePayload = {
            survey_id: survey.id,
            // user_id는 백엔드에서 protect 미들웨어를 통해 설정되거나 null 처리됨
            answers: userAnswers 
        };

        try {
            const response = await fetch('/api/responses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // 응답 시 JWT 토큰은 필요하지만, 여기서는 익명 응답을 가정하고 생략하거나,
                    // 실제 환경에서는 사용자 로그인 후 토큰을 사용해야 함. (현재 익명 응답 테스트)
                },
                body: JSON.stringify(responsePayload),
            });
            
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || '응답 제출에 실패했습니다.');
            }
            
            setIsSubmitted(true);
        } catch (err) {
            setError(err.message || "알 수 없는 오류로 제출에 실패했습니다.");
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <div className="loading-message">설문지를 불러오는 중...</div>;
    if (error) return <div className="error-message survey-taker-error">오류: {error}</div>;
    if (!survey) return <div className="error-message survey-taker-error">설문지가 존재하지 않습니다.</div>;
    if (isSubmitted) return (
        <div className="survey-taker-container submitted">
            <h2>응답 완료! ✅</h2>
            <p>설문에 참여해 주셔서 감사합니다.</p>
        </div>
    );
    
    return (
        <div className="survey-taker-container">
            <div className="survey-header-info">
                <h1 className="survey-title">{survey.title}</h1>
                <p className="survey-description">{survey.description}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="survey-form">
                {survey.Questions.map((q, index) => (
                    <QuestionDisplay 
                        key={q.id}
                        question={q}
                        userAnswers={userAnswers}
                        onAnswerChange={handleAnswerChange}
                    />
                ))}

                <button 
                    type="submit" 
                    className="submit-button primary-button" 
                    disabled={loading}
                >
                    {loading ? '제출 중...' : '응답 제출하기'}
                </button>
            </form>
        </div>
    );
};

export default SurveyTaker;