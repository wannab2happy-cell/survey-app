// QuestionList.jsx - 네이티브 HTML5 드래그앤드롭 기능이 포함된 질문 목록
import React, { useState } from 'react';
import QuestionCard from './QuestionCard';

export default function QuestionList({
  questions = [],
  questionTypes,
  onQuestionsChange,
  onQuestionChange,
  onOptionChange,
  onAddOption,
  onDeleteOption,
  onDelete,
  onDuplicate,
  onToggleRequired,
  onQuestionImageChange,
  onOptionImageChange,
  onQuestionTypeChange,
  lastQuestionId,
  onQuestionSelect,
}) {
  // questions가 배열인지 확인
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const hasQuestions = safeQuestions.length > 0;

  // 드래그 상태 관리
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // 드래그 시작
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // 드래그 중인 카드를 반투명하게 (이미지가 보이도록)
    e.dataTransfer.setDragImage(e.target.closest('[data-question-card]') || e.target, 0, 0);
  };

  // 드래그 종료
  const handleDragEnd = (e) => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 드래그 오버 (다른 요소 위에 있을 때)
  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  // 드래그 리브 (다른 요소에서 벗어날 때)
  const handleDragLeave = (e) => {
    setDragOverIndex(null);
  };

  // 드롭 (요소를 놓을 때)
  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // 배열 재정렬
    const newQuestions = [...safeQuestions];
    const draggedQuestion = newQuestions[draggedIndex];
    
    // 드래그된 요소 제거
    newQuestions.splice(draggedIndex, 1);
    
    // 새로운 위치에 삽입
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex;
    newQuestions.splice(adjustedDropIndex, 0, draggedQuestion);

    // 부모 컴포넌트에 순서 변경 알림
    if (onQuestionsChange && typeof onQuestionsChange === 'function') {
      onQuestionsChange('reorder', { questions: newQuestions });
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // 빈 상태 UI
  if (!hasQuestions) {
    return (
      <div className="space-y-3">
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-bg">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
            <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-text-sub mb-2 text-base font-medium">아직 질문이 없습니다</p>
          <p className="text-text-sub mb-4 text-sm">아래의 "질문 추가" 버튼을 눌러 질문을 추가해주세요</p>
        </div>
      </div>
    );
  }

  // 질문 목록 렌더링 (드래그 앤 드롭 포함)
  return (
    <div className="space-y-4">
      {safeQuestions.map((question, index) => {
        const questionId = question?.id || question?._id || `question-${index}`;
        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;
        
        // 드래그 핸들 props 생성
        const dragHandleProps = {
          draggable: true,
          onDragStart: (e) => {
            e.stopPropagation();
            handleDragStart(e, index);
          },
          onDragEnd: handleDragEnd,
          style: {
            cursor: 'grab',
          },
        };
        
        return (
          <div
            key={questionId}
            data-question-card
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            className={`transition-all ${
              isDragOver ? 'transform translate-y-2' : ''
            }`}
          >
            <QuestionCard
              question={question}
              index={index}
              questionTypes={questionTypes}
              onQuestionChange={onQuestionChange}
              onOptionChange={onOptionChange}
              onAddOption={onAddOption}
              onRemoveOption={onDeleteOption}
              onDeleteQuestion={onDelete}
              onDuplicateQuestion={onDuplicate}
              onToggleRequired={onToggleRequired}
              onQuestionImageChange={onQuestionImageChange}
              onOptionImageChange={onOptionImageChange}
              onQuestionTypeChange={onQuestionTypeChange}
              onQuestionSelect={onQuestionSelect}
              dragHandleProps={dragHandleProps}
              isDragging={isDragging}
            />
          </div>
        );
      })}
    </div>
  );
}
