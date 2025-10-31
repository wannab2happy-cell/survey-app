// client/src/components/QuestionCard.jsx

import React from 'react';

// QuestionCard는 부모 컴포넌트(SurveyBuilder)로부터 
// 현재 질문 데이터와 데이터를 업데이트할 함수를 props로 받습니다.
const QuestionCard = ({ question, index, onUpdate, onDelete }) => {
    
    // 질문 텍스트 업데이트 핸들러
    const handleTextChange = (e) => {
        onUpdate(question.id, { text: e.target.value });
    };

    // 질문 유형 업데이트 핸들러
    const handleTypeChange = (e) => {
        onUpdate(question.id, { 
            type: e.target.value,
            // 주관식으로 바꿀 경우, 옵션 목록을 비웁니다.
            options: e.target.value === 'text' ? [] : question.options 
        });
    };

    // 옵션 텍스트 업데이트 핸들러
    const handleOptionChange = (optionIndex, e) => {
        const newOptions = [...question.options];
        newOptions[optionIndex] = e.target.value;
        onUpdate(question.id, { options: newOptions });
    };

    // 새 옵션 추가 핸들러
    const handleAddOption = () => {
        onUpdate(question.id, { options: [...question.options, `옵션 ${question.options.length + 1}`] });
    };

    // 옵션 삭제 핸들러
    const handleDeleteOption = (optionIndex) => {
        const newOptions = question.options.filter((_, i) => i !== optionIndex);
        onUpdate(question.id, { options: newOptions });
    };

    // 질문 유형별 옵션 렌더링
    const renderOptions = () => {
        if (question.type === 'text') {
            return (
                <div className="text-answer-preview">
                    (주관식) 응답자는 텍스트를 입력합니다.
                </div>
            );
        }

        const inputType = question.type === 'single_choice' ? 'radio' : 'checkbox';
        
        return (
            <div className="options-list">
                {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="option-item">
                        <input type={inputType} disabled />
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(optionIndex, e)}
                            className="option-input"
                        />
                        <button 
                            className="delete-option-button" 
                            onClick={() => handleDeleteOption(optionIndex)}
                        >
                            &times; {/* HTML 엔티티: 곱하기 기호 (X) */}
                        </button>
                    </div>
                ))}
                <button className="add-option-button" onClick={handleAddOption}>
                    + 옵션 추가
                </button>
            </div>
        );
    };

    return (
        <div className="question-card" data-type={question.type}>
            <div className="card-header">
                <span className="question-index">{index + 1}.</span>
                
                {/* 질문 유형 선택 드롭다운 */}
                <select value={question.type} onChange={handleTypeChange} className="question-type-select">
                    <option value="single_choice">객관식 (단일 선택)</option>
                    <option value="multiple_choice">복수 선택</option>
                    <option value="text">주관식 (텍스트)</option>
                </select>
                
                {/* 질문 삭제 버튼 */}
                <button className="delete-question-button" onClick={() => onDelete(question.id)}>
                    <i className="fas fa-trash"></i> 삭제
                </button>
            </div>

            <div className="card-body">
                {/* 질문 텍스트 입력 필드 */}
                <input
                    type="text"
                    className="question-text-input"
                    placeholder="질문 내용을 입력하세요."
                    value={question.text}
                    onChange={handleTextChange}
                />
                
                {/* 옵션 렌더링 영역 */}
                {renderOptions()}
            </div>
        </div>
    );
};

export default QuestionCard;