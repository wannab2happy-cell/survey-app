// QuestionList.jsx - 기본 질문 목록 (드래그앤드롭은 나중에 추가)
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
}) {
  // questions가 배열인지 확인
  const safeQuestions = Array.isArray(questions) ? questions : [];
  const hasQuestions = safeQuestions.length > 0;

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

  // 질문 목록 렌더링
  return (
    <div className="space-y-4">
      {safeQuestions.map((question, index) => {
        const questionId = question?.id || question?._id || index;
        return (
          <QuestionCard
            key={questionId}
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
          />
        );
      })}
    </div>
  );
}
