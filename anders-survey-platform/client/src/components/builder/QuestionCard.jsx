// QuestionCard.jsx - Theme V2 스타일로 완전히 재작성
// 모든 질문 타입 지원 및 디자인 통일

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ImageUpload from '../ImageUpload';

// 아이콘 컴포넌트
const PhotoIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const CopyIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const MinusIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const QuestionCard = (props) => {
  const {
    question = {},
    index,
    onQuestionChange = () => {},
    onOptionChange = () => {},
    onAddOption = () => {},
    onRemoveOption = () => {},
    onQuestionTypeChange = () => {},
    onDeleteQuestion = () => {},
    onDuplicateQuestion = () => {},
    onToggleRequired = () => {},
    onQuestionImageChange = () => {},
    onOptionImageChange = () => {},
  } = props || {};

  // 질문 데이터 정규화 (title, text, content 통일)
  // text를 우선 사용, text가 없거나 undefined면 title이나 content 사용
  // "새 질문"은 빈 문자열로 처리
  let questionText = '';
  if (question.text !== undefined && question.text !== null) {
    questionText = question.text === '새 질문' ? '' : question.text;
  } else if (question.title !== undefined && question.title !== null) {
    questionText = question.title === '새 질문' ? '' : question.title;
  } else if (question.content !== undefined && question.content !== null) {
    questionText = question.content === '새 질문' ? '' : question.content;
  }
  
  // "새 질문"이 있으면 빈 문자열로 변환하여 부모에 전달
  if (questionText === '새 질문') {
    questionText = '';
  }
  const questionId = question.id || question._id;
  const type = question.type || 'radio';
  const options = question.options || [];
  const required = question.required || false;
  const questionImageBase64 = question.image || question.imageBase64 || '';
  const show_image_upload = question.show_image_upload || false;
  const scaleMin = question.scaleMin ?? 0;
  const scaleMax = question.scaleMax ?? 10;
  const scaleLeftLabel = question.scaleLeftLabel || '';
  const scaleRightLabel = question.scaleRightLabel || '';
  const starCount = question.starCount ?? 5;

  // 모달 상태
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [dropdownText, setDropdownText] = useState('');
  
  // 입력 필드 로컬 상태 (입력 반응성 향상)
  const [localInputValue, setLocalInputValue] = useState(questionText || '');
  
  // 한글 입력 조합 상태 관리
  const [isComposing, setIsComposing] = useState(false);
  const [justComposed, setJustComposed] = useState(false); // 조합 완료 직후 플래그

  // questionText가 외부에서 변경되면 로컬 상태도 동기화
  useEffect(() => {
    if (!isComposing) {
      setLocalInputValue(questionText || '');
    }
  }, [questionText, isComposing]);

  // 질문 유형 판단
  const isOptionType = ['radio', 'checkbox', 'dropdown', 'yes_no', 'star_rating', 'scale'].includes(type);
  const isImageOptionType = ['radio_image', 'checkbox_image', 'image_choice'].includes(type);
  const isTextType = ['text', 'textarea', 'descriptive', 'email', 'phone'].includes(type);

  // 한글 입력 조합 시작
  const handleCompositionStart = (e) => {
    setIsComposing(true);
    setJustComposed(false);
  };

  // 한글 입력 조합 중
  const handleCompositionUpdate = (e) => {
    // 조합 중에는 로컬 상태만 업데이트 (부모 상태는 업데이트하지 않음)
    if (e && e.target) {
      setLocalInputValue(e.target.value || '');
    }
  };

  // 한글 입력 조합 완료
  const handleCompositionEnd = (e) => {
    if (!e || !e.target) return;
    const value = e.target.value || '';
    setIsComposing(false);
    setLocalInputValue(value);
    setJustComposed(true); // 조합 완료 플래그 설정
    
    // 조합 완료 후 부모 상태 업데이트
    if (onQuestionChange && typeof onQuestionChange === 'function') {
      try {
        onQuestionChange(index, 'text', value);
        onQuestionChange(index, 'title', value);
        onQuestionChange(index, 'content', value);
      } catch (error) {
        console.error('[QuestionCard] onQuestionChange 오류:', error);
      }
    }
    
    // 조합 완료 직후 발생하는 onChange 이벤트를 무시하기 위해 짧은 딜레이 후 플래그 해제
    setTimeout(() => {
      setJustComposed(false);
    }, 0);
  };

  // 질문 텍스트 변경 핸들러 (text, title, content 모두 동기화)
  const handleQuestionTextChange = (e) => {
    if (!e || !e.target) return;
    const value = e.target.value || '';
    
    // 로컬 상태는 항상 업데이트 (입력 반응성 향상)
    setLocalInputValue(value);
    
    // 한글 조합 중이면 부모 상태는 업데이트하지 않음 (조합 완료 후에만 업데이트)
    if (isComposing) {
      return;
    }
    
    // 조합 완료 직후 발생하는 onChange 이벤트는 무시 (중복 업데이트 방지)
    if (justComposed) {
      return;
    }
    
    // 조합이 완료된 경우에만 부모 상태 업데이트
    // text, title, content 모두 동일한 값으로 업데이트 (빈 문자열도 유지)
    if (onQuestionChange && typeof onQuestionChange === 'function') {
      try {
        onQuestionChange(index, 'text', value);
        onQuestionChange(index, 'title', value);
        onQuestionChange(index, 'content', value);
      } catch (error) {
        console.error('[QuestionCard] onQuestionChange 오류:', error);
      }
    } else {
      console.warn('[QuestionCard] onQuestionChange가 함수가 아닙니다:', onQuestionChange);
    }
  };

  // 빈 질문인지 확인 (스타일링용) - 로컬 입력 값도 확인
  const isNewQuestion = (!localInputValue || localInputValue.trim() === '') && (!questionText || questionText.trim() === '');

  // 옵션 텍스트 변경
  const handleOptionTextChange = (optionIndex, e) => {
    onOptionChange(index, optionIndex, 'text', e?.target?.value || '');
  };

  // 옵션 이미지 변경
  const handleOptionImageChange = (optionIndex, e) => {
    onOptionChange(index, optionIndex, 'imageBase64', e?.target?.value || '');
  };

  // 질문 이미지 변경
  const handleQuestionImageChange = (e) => {
    const value = e?.target?.value || '';
    // image와 imageBase64를 한 번에 업데이트
    onQuestionChange(index, 'image', value);
    // imageBase64는 image와 동일한 값으로 설정
    onQuestionChange(index, 'imageBase64', value);
  };

  // 드롭다운 모달 열기
  const handleOpenDropdownModal = () => {
    const currentOptions = options.map(opt => {
      const text = opt.text || opt.label || String(opt);
      return opt.emoji ? `[${opt.emoji}] ${text}` : text;
    }).join('\n');
    setDropdownText(currentOptions);
    setShowDropdownModal(true);
  };

  // 드롭다운 모달 저장
  const handleSaveDropdownModal = () => {
    const lines = dropdownText.split('\n').filter(line => line.trim());
    const newOptions = lines.map((line, idx) => {
      const emojiMatch = line.match(/^\[([^\]]+)\]\s*(.+)$/);
      if (emojiMatch) {
        return {
          id: Date.now() + idx,
          text: emojiMatch[2].trim(),
          emoji: emojiMatch[1].trim()
        };
      }
      return {
        id: Date.now() + idx,
        text: line.trim()
      };
    });
    
    // 기존 옵션 업데이트
    newOptions.forEach((opt, optIdx) => {
      if (optIdx < options.length) {
        onOptionChange(index, optIdx, 'text', opt.text);
        if (opt.emoji) {
          onOptionChange(index, optIdx, 'emoji', opt.emoji);
        }
      } else {
        onAddOption(index, false);
        setTimeout(() => {
          onOptionChange(index, optIdx, 'text', opt.text);
          if (opt.emoji) {
            onOptionChange(index, optIdx, 'emoji', opt.emoji);
          }
        }, 10);
      }
    });
    
    // 초과 옵션 제거
    if (newOptions.length < options.length) {
      for (let i = options.length - 1; i >= newOptions.length; i--) {
        onRemoveOption(index, i);
      }
    }
    
    setShowDropdownModal(false);
  };

  // 옵션 렌더링
  const renderOptions = () => {
    if (!options || options.length === 0) {
      return (
        <div className="p-4 border-2 border-dashed border-border rounded-lg bg-bg text-center">
          <p className="text-sm text-text-sub">옵션이 없습니다. 옵션을 추가해주세요.</p>
        </div>
      );
    }

    return options.map((option, optionIndex) => {
      // 옵션 텍스트 추출 (객체인 경우 처리하여 [object Object] 에러 방지)
      let optionText = '';
      if (typeof option === 'string') {
        optionText = option;
      } else if (option && typeof option === 'object') {
        optionText = option.text || option.label || '';
      }
      
      const optionImage = option.imageBase64 || option.image || '';
      const isNewOption = !optionText || optionText === `옵션 ${optionIndex + 1}`;
      
      return (
        <motion.div
          key={option.id || optionIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:border-primary/50 transition-all group"
        >
          {/* 옵션 타입 아이콘 */}
          <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-bg border border-border">
            {type === 'radio' && (
              <div className="w-5 h-5 rounded-full border-2 border-primary"></div>
            )}
            {type === 'checkbox' && (
              <div className="w-5 h-5 rounded border-2 border-primary"></div>
            )}
            {(type === 'radio_image' || type === 'checkbox_image' || type === 'image_choice') && (
              <span className="text-xs font-bold text-text-sub">{optionIndex + 1}</span>
            )}
            {type === 'yes_no' && (
              <span className="text-xs font-bold text-primary">{optionIndex === 0 ? '예' : '아니오'}</span>
            )}
          </div>

          {/* 옵션 텍스트 입력 */}
          <input
            type="text"
            value={optionText}
            onChange={(e) => handleOptionTextChange(optionIndex, e)}
            placeholder={`옵션 ${optionIndex + 1}`}
            className={`flex-1 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm bg-white ${
              isNewOption 
                ? 'text-gray-400' 
                : 'text-text-main'
            } placeholder:text-gray-400 placeholder:opacity-60`}
            onFocus={(e) => {
              // 포커스 시 기본 옵션 텍스트면 선택하여 바로 덮어쓸 수 있도록
              if (optionText === `옵션 ${optionIndex + 1}`) {
                e.target.select();
              }
            }}
          />

          {/* 옵션 이미지 업로드 (이미지 옵션 타입) */}
          {isImageOptionType && (
            <div className="w-24 flex-shrink-0">
              <ImageUpload
                label=""
                imageBase64={optionImage}
                onImageChange={(e) => handleOptionImageChange(optionIndex, e)}
                hideLabel={true}
                compact={true}
                maxSizeMB={5}
                recommendedSize="120x120"
              />
            </div>
          )}

          {/* 옵션 제거 버튼 */}
          <button
            type="button"
            onClick={() => onRemoveOption(index, optionIndex)}
            className="flex-shrink-0 p-2 text-text-sub hover:text-error hover:bg-error/10 rounded-lg transition-all"
            title="옵션 삭제"
          >
            <MinusIcon className="w-5 h-5" />
          </button>
        </motion.div>
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-md border border-border p-4 mb-3"
    >
      {/* 질문 헤더 - 가로 배치 */}
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border flex-wrap">
        {/* 질문 번호와 제목 */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white font-bold text-sm">
            {index + 1}
          </div>
          <span className="text-sm font-medium text-text-sub">질문</span>
        </div>
        
        {/* 이미지 첨부 토글 */}
        <button
          type="button"
          onClick={() => onQuestionChange(index, 'show_image_upload', !show_image_upload)}
          className={`p-2 rounded-lg transition-all flex-shrink-0 ${
            show_image_upload 
              ? 'bg-primary/10 text-primary' 
              : 'bg-bg text-text-sub hover:bg-primary/5'
          }`}
          title="질문에 이미지 첨부"
        >
          <PhotoIcon className="w-4 h-4" />
        </button>
        
        {/* 필수/선택 버튼 */}
        <button
          type="button"
          onClick={() => onToggleRequired(index)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex-shrink-0 ${
            required 
              ? 'bg-error text-white border-error' 
              : 'bg-white text-text-sub border-border hover:border-error/50'
          }`}
        >
          {required ? '필수' : '선택'}
        </button>

        {/* 질문 유형 선택 */}
        <select 
          value={type}
          onChange={(e) => onQuestionTypeChange(index, e?.target?.value)}
          className="px-3 py-1.5 text-xs border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white font-medium text-text-main flex-shrink-0"
        >
          <option value="radio">단일 선택</option>
          <option value="checkbox">다중 선택</option>
          <option value="yes_no">예/아니오</option>
          <option value="dropdown">드롭다운</option>
          <option value="star_rating">별점 평가</option>
          <option value="scale">척도 (Likert)</option>
          <option value="text">단답형</option>
          <option value="textarea">서술형</option>
          <option value="email">이메일 주소</option>
          <option value="phone">전화번호</option>
          <option value="radio_image">이미지 단일 선택</option>
          <option value="checkbox_image">이미지 다중 선택</option>
        </select>

        {/* 액션 버튼 */}
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => onDuplicateQuestion(index)}
            className="p-2 text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-all"
            title="질문 복제"
          >
            <CopyIcon className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={() => {
              if (window.confirm('정말로 이 질문을 삭제하시겠습니까?')) {
                onDeleteQuestion(index);
              }
            }}
            className="p-2 text-error bg-error/10 rounded-lg hover:bg-error/20 transition-all"
            title="질문 삭제"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 질문 본문 */}
      <div className="space-y-4">
        {/* 질문 제목 입력 */}
        <div>
          <label className="block text-sm font-medium text-text-sub mb-2">
            질문 내용
          </label>
          <input
            type="text"
            value={localInputValue}
            onChange={handleQuestionTextChange}
            onCompositionStart={handleCompositionStart}
            onCompositionUpdate={handleCompositionUpdate}
            onCompositionEnd={handleCompositionEnd}
            placeholder="새 질문"
            className={`w-full text-lg font-medium border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white ${
              localInputValue && localInputValue.trim() !== ''
                ? 'text-text-main' 
                : 'text-gray-400'
            } placeholder:text-gray-400 placeholder:opacity-60`}
            autoComplete="off"
          />
        </div>

        {/* 질문 이미지 업로드 */}
        {show_image_upload && (
          <div className="mt-4">
            <ImageUpload
              label="질문 이미지"
              imageBase64={questionImageBase64}
              onImageChange={handleQuestionImageChange}
              maxSizeMB={8}
              recommendedSize="1280*720"
            />
          </div>
        )}

        {/* 드롭다운 설정 */}
        {type === 'dropdown' && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-text-main">드롭다운 항목</label>
              <button
                type="button"
                onClick={handleOpenDropdownModal}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
              >
                항목 편집
              </button>
            </div>
            <p className="text-xs text-text-sub">현재 {options.length}개의 항목</p>
          </div>
        )}

        {/* 척도 설정 */}
        {type === 'scale' && (
          <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20 space-y-4">
            <label className="text-sm font-medium text-text-main block">척도 설정</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-sub mb-1">최소값</label>
                <input
                  type="number"
                  value={scaleMin}
                  onChange={(e) => onQuestionChange(index, 'scaleMin', parseInt(e.target.value) || 0)}
                  className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs text-text-sub mb-1">최대값</label>
                <input
                  type="number"
                  value={scaleMax}
                  onChange={(e) => onQuestionChange(index, 'scaleMax', parseInt(e.target.value) || 10)}
                  className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                  min="1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-text-sub mb-1">왼쪽 라벨</label>
                <input
                  type="text"
                  value={scaleLeftLabel}
                  onChange={(e) => onQuestionChange(index, 'scaleLeftLabel', e.target.value)}
                  placeholder="예: 매우 비동의"
                  className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs text-text-sub mb-1">오른쪽 라벨</label>
                <input
                  type="text"
                  value={scaleRightLabel}
                  onChange={(e) => onQuestionChange(index, 'scaleRightLabel', e.target.value)}
                  placeholder="예: 매우 동의"
                  className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-text-sub mb-2">옵션 목록 (각 줄에 하나씩)</label>
              <textarea
                value={options.map(opt => opt.text || opt.label || String(opt)).join('\n')}
                onChange={(e) => {
                  const lines = e.target.value.split('\n').filter(line => line.trim());
                  lines.forEach((line, idx) => {
                    if (idx < options.length) {
                      onOptionChange(index, idx, 'text', line.trim());
                    } else {
                      onAddOption(index, false);
                      setTimeout(() => {
                        onOptionChange(index, idx, 'text', line.trim());
                      }, 10);
                    }
                  });
                  if (lines.length < options.length) {
                    for (let i = options.length - 1; i >= lines.length; i--) {
                      onRemoveOption(index, i);
                    }
                  }
                }}
                rows={5}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                placeholder="매우 동의&#10;동의&#10;보통&#10;비동의&#10;매우 비동의"
              />
            </div>
          </div>
        )}

        {/* 별점 설정 */}
        {type === 'star_rating' && (
          <div className="p-4 bg-secondary/5 rounded-lg border border-secondary/20">
            <label className="text-sm font-medium text-text-main block mb-3">별점 설정</label>
            <div>
              <label className="block text-xs text-text-sub mb-2">별 개수</label>
              <input
                type="number"
                value={starCount}
                onChange={(e) => {
                  const count = parseInt(e.target.value) || 5;
                  onQuestionChange(index, 'starCount', count);
                  const newOptions = Array.from({ length: count }, (_, i) => ({
                    id: Date.now() + i,
                    text: String(i + 1)
                  }));
                  newOptions.forEach((opt, idx) => {
                    if (idx < options.length) {
                      onOptionChange(index, idx, 'text', opt.text);
                    } else {
                      onAddOption(index, false);
                      setTimeout(() => {
                        onOptionChange(index, idx, 'text', opt.text);
                      }, 10);
                    }
                  });
                  if (newOptions.length < options.length) {
                    for (let i = options.length - 1; i >= newOptions.length; i--) {
                      onRemoveOption(index, i);
                    }
                  }
                }}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary"
                min="1"
                max="10"
              />
            </div>
          </div>
        )}

        {/* 옵션 목록 */}
        {(isOptionType || isImageOptionType) && type !== 'dropdown' && type !== 'scale' && type !== 'star_rating' && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-text-main">옵션 목록</h4>
              <span className="text-xs text-text-sub">{options.length}개</span>
            </div>
            <div className="space-y-3">
              {renderOptions()}
            </div>
            
            {/* 옵션 추가 버튼 */}
            <button
              type="button"
              onClick={() => onAddOption(index, isImageOptionType)}
              className="w-full mt-4 py-3 px-4 border-2 border-dashed border-border text-text-sub hover:border-primary hover:text-primary hover:bg-primary/5 rounded-lg transition-all flex items-center justify-center gap-2 font-medium"
            >
              <PlusIcon className="w-5 h-5" />
              옵션 추가
            </button>
          </div>
        )}

        {/* 텍스트 타입 안내 */}
        {isTextType && (
          <div className="p-4 border border-border rounded-lg bg-bg">
            <p className="text-sm text-text-sub">
              {type === 'text' && '사용자는 짧은 텍스트(단답형)를 입력합니다.'}
              {(type === 'textarea' || type === 'descriptive') && '사용자는 긴 텍스트(서술형)를 입력합니다.'}
              {type === 'email' && '사용자는 이메일 주소를 입력합니다. 이메일 형식이 자동으로 검증됩니다.'}
              {type === 'phone' && '사용자는 전화번호를 입력합니다. 전화번호 형식이 자동으로 검증됩니다.'}
            </p>
          </div>
        )}
      </div>

      {/* 드롭다운 편집 모달 */}
      {showDropdownModal && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4"
          onClick={() => setShowDropdownModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-text-main">드롭다운 항목 편집</h3>
              <button
                onClick={() => setShowDropdownModal(false)}
                className="text-text-sub hover:text-text-main text-2xl leading-none w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors"
              >
                ×
              </button>
            </div>
            <div className="mb-4 text-sm text-text-sub space-y-1">
              <p>• 항목을 줄바꿈으로 나눠 입력하세요.</p>
              <p>• 이모지 아이콘을 사용하려면 대괄호([]) 안에 넣어주세요.</p>
              <p className="text-xs">예: [🐶] 강아지</p>
            </div>
            <textarea
              value={dropdownText}
              onChange={(e) => setDropdownText(e.target.value)}
              rows={10}
              className="w-full border border-border rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary font-mono text-sm"
              placeholder="항목 1&#10;항목 2&#10;항목 3"
            />
            <div className="flex gap-3 mt-4">
              <button
                type="button"
                onClick={() => setShowDropdownModal(false)}
                className="flex-1 px-4 py-2 bg-bg border border-border rounded-lg hover:bg-primary/10 hover:border-primary transition text-text-sub font-medium"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveDropdownModal}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-medium"
              >
                확인
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default QuestionCard;
