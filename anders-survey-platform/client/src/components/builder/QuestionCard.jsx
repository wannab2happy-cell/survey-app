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
  // required 값을 명시적으로 boolean으로 변환 (undefined, null은 false로 처리)
  const required = Boolean(question.required);
  const questionImageBase64 = question.image || question.imageBase64 || '';
  const show_image_upload = question.show_image_upload || false;
  const scaleMin = question.scaleMin ?? 0;
  const scaleMax = question.scaleMax ?? 10;
  const scaleLeftLabel = question.scaleLeftLabel || '';
  const scaleRightLabel = question.scaleRightLabel || '';
  const [localStarCount, setLocalStarCount] = useState(question.starCount ?? 5);
  
  // starCount가 외부에서 변경되면 로컬 상태도 동기화
  useEffect(() => {
    const externalStarCount = question.starCount ?? 5;
    if (localStarCount !== externalStarCount) {
      setLocalStarCount(externalStarCount);
    }
  }, [question.starCount]);
  
  const starCount = localStarCount;

  // 모달 상태
  const [showDropdownModal, setShowDropdownModal] = useState(false);
  const [dropdownText, setDropdownText] = useState('');
  
  // 입력 필드 로컬 상태 (입력 반응성 향상)
  // 초기값은 questionText로 설정하되, useEffect에서 동기화 보장
  const [localInputValue, setLocalInputValue] = useState(() => {
    // 초기 렌더링 시 questionText 계산
    let initialText = '';
    if (question.text !== undefined && question.text !== null) {
      initialText = question.text === '새 질문' ? '' : question.text;
    } else if (question.title !== undefined && question.title !== null) {
      initialText = question.title === '새 질문' ? '' : question.title;
    } else if (question.content !== undefined && question.content !== null) {
      initialText = question.content === '새 질문' ? '' : question.content;
    }
    return initialText;
  });
  
  // 입력 필드 포커스 상태 추적 (백스페이스로 전체가 지워지는 문제 방지)
  const [isInputFocused, setIsInputFocused] = useState(false);
  
  // 한글 입력 조합 상태 관리
  const [isComposing, setIsComposing] = useState(false);
  const [justComposed, setJustComposed] = useState(false); // 조합 완료 직후 플래그
  
  // 옵션별 한글 입력 조합 상태 관리
  const [optionComposing, setOptionComposing] = useState({});
  const [optionJustComposed, setOptionJustComposed] = useState({});
  
  // 옵션별 로컬 입력 상태 관리
  const [localOptionValues, setLocalOptionValues] = useState({});
  
  // 질문 데이터가 변경되면 (탭 전환 등) 로컬 상태 동기화
  useEffect(() => {
    // 질문 텍스트 재계산 (text, title, content 순서로 확인)
    let normalizedQuestionText = '';
    if (question.text !== undefined && question.text !== null) {
      normalizedQuestionText = question.text === '새 질문' ? '' : question.text;
    } else if (question.title !== undefined && question.title !== null) {
      normalizedQuestionText = question.title === '새 질문' ? '' : question.title;
    } else if (question.content !== undefined && question.content !== null) {
      normalizedQuestionText = question.content === '새 질문' ? '' : question.content;
    }
    
    // 한글 조합 중이 아니고, 조합 완료 직후가 아니면 동기화
    if (!isComposing && !justComposed) {
      // 입력 필드가 포커스되어 있지 않으면 무조건 동기화
      if (!isInputFocused) {
        if (localInputValue !== normalizedQuestionText) {
          setLocalInputValue(normalizedQuestionText);
        }
      } else {
        // 포커스되어 있어도 질문 ID가 변경되었거나, 로컬 값이 비어있고 외부 값이 있으면 동기화
        if (localInputValue === '' && normalizedQuestionText !== '') {
          setLocalInputValue(normalizedQuestionText);
        }
      }
    }
    
    // 질문 ID가 변경되면 포커스 상태와 조합 상태 리셋
    // (질문 ID가 변경되면 이 useEffect가 실행되므로 항상 리셋)
    setIsInputFocused(false);
    setIsComposing(false);
    setJustComposed(false);
  }, [question.id, question.text, question.title, question.content]); // 질문 데이터를 직접 의존성으로 사용
  
  // 컴포넌트 언마운트 시 현재 입력값 저장 (탭 전환 시 데이터 손실 방지)
  useEffect(() => {
    return () => {
      // 컴포넌트가 언마운트되기 전에 현재 입력값 저장
      const currentValue = localInputValue || '';
      if (onQuestionChange && typeof onQuestionChange === 'function') {
        try {
          onQuestionChange(index, 'text', currentValue);
          onQuestionChange(index, 'title', currentValue);
          onQuestionChange(index, 'content', currentValue);
        } catch (error) {
          console.error('[QuestionCard] 언마운트 시 저장 오류:', error);
        }
      }
    };
  }, [localInputValue, index, onQuestionChange]); // localInputValue가 변경될 때마다 cleanup 함수 업데이트
  
  // 옵션이 외부에서 변경되면 로컬 상태도 동기화
  useEffect(() => {
    const maxIdx = options.length - 1;
    
    setLocalOptionValues(prev => {
      const cleaned = {};
      // 옵션 배열 길이에 맞춰 로컬 상태 정리
      options.forEach((option, idx) => {
        // 조합 중이 아니고 조합 완료 직후가 아니면 동기화
        if (!optionComposing[idx] && !optionJustComposed[idx]) {
          const optionText = typeof option === 'string' 
            ? option 
            : (option?.text || option?.label || '');
          // 로컬 값이 있으면 유지, 없으면 옵션 텍스트로 설정
          if (prev[idx] !== undefined) {
            cleaned[idx] = prev[idx];
          } else if (optionText !== undefined) {
            cleaned[idx] = optionText;
          }
        } else {
          // 조합 중이면 기존 로컬 값 유지
          if (prev[idx] !== undefined) {
            cleaned[idx] = prev[idx];
          }
        }
      });
      return cleaned;
    });
    
    // 옵션 조합 상태도 정리
    setOptionComposing(prev => {
      const cleaned = {};
      Object.keys(prev).forEach(key => {
        const idx = parseInt(key);
        if (idx <= maxIdx) {
          cleaned[idx] = prev[key];
        }
      });
      return cleaned;
    });
    
    setOptionJustComposed(prev => {
      const cleaned = {};
      Object.keys(prev).forEach(key => {
        const idx = parseInt(key);
        if (idx <= maxIdx) {
          cleaned[idx] = prev[key];
        }
      });
      return cleaned;
    });
  }, [options.length, options.map(opt => typeof opt === 'string' ? opt : (opt?.text || opt?.label || '')).join('|')]); // 옵션 길이와 내용을 모두 추적

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
    
    // 한글 조합 중이 아니면 즉시 부모 상태 업데이트 (탭 전환 시 데이터 손실 방지)
    if (!isComposing) {
      // 즉시 부모 상태에 저장 (탭 전환 시에도 데이터 유지)
      if (onQuestionChange && typeof onQuestionChange === 'function') {
        try {
          onQuestionChange(index, 'text', value);
          onQuestionChange(index, 'title', value);
          onQuestionChange(index, 'content', value);
        } catch (error) {
          console.error('[QuestionCard] onQuestionChange 오류:', error);
        }
      }
    }
    
    // 한글 조합 중이면 여기서 종료 (조합 완료 후 handleCompositionEnd에서 저장)
    if (isComposing) {
      return;
    }
    
    // 조합 완료 직후 발생하는 onChange 이벤트는 무시 (중복 업데이트 방지)
    // (이미 위에서 저장했으므로 여기서는 추가 저장 불필요)
    if (justComposed) {
      return;
    }
    
    // 위에서 이미 저장했으므로 여기서는 추가 저장 불필요
    // (한글 조합 중이 아닐 때는 위에서 이미 저장됨)
  };

  // 빈 질문인지 확인 (스타일링용) - 로컬 입력 값도 확인
  const isNewQuestion = (!localInputValue || localInputValue.trim() === '') && (!questionText || questionText.trim() === '');

  // 옵션 텍스트 변경 (한글 입력 처리 포함)
  const handleOptionTextChange = (optionIndex, e) => {
    if (!e || !e.target) return;
    const value = e?.target?.value || '';
    
    // 로컬 상태는 항상 업데이트 (입력 반응성 향상)
    setLocalOptionValues(prev => ({ ...prev, [optionIndex]: value }));
    
    // 한글 조합 중이면 부모 상태는 업데이트하지 않음
    if (optionComposing[optionIndex]) {
      return;
    }
    
    // 조합 완료 직후 발생하는 onChange 이벤트는 무시
    if (optionJustComposed[optionIndex]) {
      return;
    }
    
    // 조합이 완료된 경우에만 부모 상태 업데이트
    onOptionChange(index, optionIndex, 'text', value);
  };
  
  // 옵션 한글 입력 조합 시작
  const handleOptionCompositionStart = (optionIndex) => {
    setOptionComposing(prev => ({ ...prev, [optionIndex]: true }));
    setOptionJustComposed(prev => ({ ...prev, [optionIndex]: false }));
  };
  
  // 옵션 한글 입력 조합 완료
  const handleOptionCompositionEnd = (optionIndex, e) => {
    if (!e || !e.target) return;
    const value = e.target.value || '';
    
    setOptionComposing(prev => ({ ...prev, [optionIndex]: false }));
    setOptionJustComposed(prev => ({ ...prev, [optionIndex]: true }));
    setLocalOptionValues(prev => ({ ...prev, [optionIndex]: value }));
    
    // 조합 완료 후 부모 상태 업데이트
    onOptionChange(index, optionIndex, 'text', value);
    
    // 조합 완료 직후 발생하는 onChange 이벤트를 무시하기 위해 짧은 딜레이 후 플래그 해제
    setTimeout(() => {
      setOptionJustComposed(prev => ({ ...prev, [optionIndex]: false }));
    }, 0);
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
  const handleOpenDropdownModal = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
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
    
    if (lines.length === 0) {
      alert('최소 1개 이상의 항목을 입력해주세요.');
      return;
    }
    
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
    
    // 기존 옵션과 새 옵션의 개수 차이 계산
    const diff = newOptions.length - options.length;
    
    // 부족한 옵션 추가
    if (diff > 0) {
      for (let i = 0; i < diff; i++) {
        onAddOption(index, false);
      }
    }
    
    // 모든 옵션 업데이트 (동기적으로 처리)
    newOptions.forEach((opt, optIdx) => {
      if (optIdx < options.length + diff) {
        // 옵션 텍스트 업데이트
        onOptionChange(index, optIdx, 'text', opt.text);
        // 이모지가 있으면 업데이트, 없으면 제거
        if (opt.emoji) {
          onOptionChange(index, optIdx, 'emoji', opt.emoji);
        } else {
          // 이모지 제거 (옵션이 이모지를 지원하는 경우)
          const currentOption = options[optIdx];
          if (currentOption && currentOption.emoji) {
            onOptionChange(index, optIdx, 'emoji', '');
          }
        }
      }
    });
    
    // 초과 옵션 제거 (뒤에서부터 제거하여 인덱스 문제 방지)
    if (diff < 0) {
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
      
      // 로컬 상태가 있으면 우선 사용 (한글 입력 중 반응성 향상)
      const displayText = localOptionValues[optionIndex] !== undefined 
        ? localOptionValues[optionIndex] 
        : optionText;
      
      const optionImage = option.imageBase64 || option.image || '';
      const isNewOption = !displayText || displayText === `옵션 ${optionIndex + 1}`;
      
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
            value={displayText}
            onChange={(e) => handleOptionTextChange(optionIndex, e)}
            onCompositionStart={() => handleOptionCompositionStart(optionIndex)}
            onCompositionEnd={(e) => handleOptionCompositionEnd(optionIndex, e)}
            placeholder={`옵션 ${optionIndex + 1}`}
            className={`flex-1 border border-border rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm bg-white ${
              isNewOption 
                ? 'text-gray-400' 
                : 'text-text-main'
            } placeholder:text-gray-400 placeholder:opacity-60`}
            onFocus={(e) => {
              // 포커스 시 기본 옵션 텍스트면 선택하여 바로 덮어쓸 수 있도록
              if (displayText === `옵션 ${optionIndex + 1}`) {
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
                recommendedSize="120×120"
              />
            </div>
          )}

          {/* 옵션 제거 버튼 */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[QuestionCard] 옵션 삭제 버튼 클릭:', { index, optionIndex, optionsLength: options.length, onRemoveOption });
              // 옵션 삭제 실행
              if (onRemoveOption && typeof onRemoveOption === 'function') {
                console.log('[QuestionCard] onRemoveOption 호출:', index, optionIndex);
                try {
                  onRemoveOption(index, optionIndex);
                  console.log('[QuestionCard] onRemoveOption 호출 완료');
                } catch (error) {
                  console.error('[QuestionCard] onRemoveOption 호출 중 오류:', error);
                }
              } else {
                console.error('[QuestionCard] onRemoveOption이 함수가 아닙니다:', typeof onRemoveOption, onRemoveOption);
              }
            }}
            className="relative z-10 flex-shrink-0 p-2 text-text-sub hover:text-error hover:bg-error/10 rounded-lg transition-all cursor-pointer"
            style={{ pointerEvents: 'auto' }}
            title="옵션 삭제"
            aria-label={`옵션 ${optionIndex + 1} 삭제`}
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
              ? 'text-white border-transparent' 
              : 'bg-white text-text-sub border-border hover:border-gray-400'
          }`}
          style={required ? {
            backgroundColor: '#26C6DA',
            borderColor: '#26C6DA'
          } : {}}
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
            onFocus={() => setIsInputFocused(true)}
            onBlur={(e) => {
              setIsInputFocused(false);
              // 포커스를 잃을 때 최종 값을 부모에 동기화
              const finalValue = e.target.value || '';
              
              // 빈 값이 아닐 때만 업데이트 (질문 제목이 사라지는 것 방지)
              if (finalValue.trim() !== '' || localInputValue.trim() !== '') {
                if (onQuestionChange && typeof onQuestionChange === 'function') {
                  try {
                    // 최종 값이 있으면 그 값을 사용, 없으면 로컬 값을 유지
                    const valueToSave = finalValue.trim() !== '' ? finalValue : localInputValue;
                    onQuestionChange(index, 'text', valueToSave);
                    onQuestionChange(index, 'title', valueToSave);
                    onQuestionChange(index, 'content', valueToSave);
                  } catch (error) {
                    console.error('[QuestionCard] onQuestionChange 오류:', error);
                  }
                }
              }
            }}
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
              recommendedSize="1280×720"
              compact={true}
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
                className="px-4 py-2 rounded-lg transition-colors text-sm font-semibold shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: '#26C6DA',
                  color: '#FFFFFF',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00ACC1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#26C6DA';
                }}
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
              <label className="block text-xs text-text-sub mb-2">별 개수 (1-10)</label>
              <input
                type="number"
                value={localStarCount}
                onChange={(e) => {
                  const inputValue = e.target.value;
                  
                  // 빈 값이면 로컬 상태만 업데이트 (실시간 반응성)
                  if (inputValue === '' || inputValue === null || inputValue === undefined) {
                    setLocalStarCount(5);
                    return;
                  }
                  
                  const count = Math.max(1, Math.min(10, parseInt(inputValue) || 5));
                  
                  // 로컬 상태 즉시 업데이트 (입력 반응성 향상)
                  setLocalStarCount(count);
                  
                  // starCount 업데이트
                  onQuestionChange(index, 'starCount', count);
                  
                  // 옵션도 함께 업데이트
                  const newOptions = Array.from({ length: count }, (_, i) => ({
                    id: Date.now() + i,
                    text: String(i + 1)
                  }));
                  
                  // 기존 옵션 업데이트 또는 추가
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
                  
                  // 초과 옵션 제거
                  if (newOptions.length < options.length) {
                    for (let i = options.length - 1; i >= newOptions.length; i--) {
                      onRemoveOption(index, i);
                    }
                  }
                }}
                onBlur={(e) => {
                  // 포커스가 벗어날 때 값이 비어있거나 범위를 벗어나면 5로 설정
                  const value = parseInt(e.target.value);
                  if (!value || value < 1 || value > 10) {
                    const validCount = 5;
                    setLocalStarCount(validCount);
                    onQuestionChange(index, 'starCount', validCount);
                  }
                }}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary focus:border-primary text-sm"
                style={{
                  borderColor: '#E5E7EB'
                }}
                min="1"
                max="10"
                step="1"
              />
              <p className="text-xs text-text-sub mt-1">현재 {starCount}개 별</p>
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
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowDropdownModal(false);
          }}
          style={{ zIndex: 99999 }}
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
                className="flex-1 px-4 py-2 border rounded-lg transition font-medium"
                style={{
                  backgroundColor: '#FFFFFF',
                  color: '#6B7280',
                  borderColor: '#E5E7EB'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6';
                  e.currentTarget.style.borderColor = '#26C6DA';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSaveDropdownModal}
                className="flex-1 px-4 py-2 rounded-lg transition-colors font-semibold shadow-sm hover:shadow-md"
                style={{
                  backgroundColor: '#26C6DA',
                  color: '#FFFFFF',
                  border: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#00ACC1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#26C6DA';
                }}
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
