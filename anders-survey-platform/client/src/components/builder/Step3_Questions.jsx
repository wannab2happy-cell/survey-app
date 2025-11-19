// client/src/components/builder/Step3_Questions.jsx (질문 먼저, 개인정보 아래 + 추가 질문 유형)

import { useCallback, useState, useEffect, useRef } from 'react';
import { PERSONAL_INFO_FIELDS } from '../../constants.js';
import QuestionList from './QuestionList';
import ImageUpload from '../ImageUpload';
import { motion, AnimatePresence } from 'framer-motion';

export default function Step3_Questions({ questions, lastQuestionId, personalInfo, onQuestionsChange, onPersonalInfoChange, onImageChange, branding, onBrandingChange }) {
    
    const safePersonalInfo = personalInfo || { enabled: false, fields: [], consentText: '', consentRequired: false, customFields: [] };
    const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'input', 'choice', 'rating'
    const questionsEndRef = useRef(null);
    const lastQuestionCountRef = useRef(questions.length);
    
    // 한글 입력 처리를 위한 상태
    const [isComposing, setIsComposing] = useState(false);
    const [localConsentText, setLocalConsentText] = useState(safePersonalInfo.consentText || '');
    const [localCustomFieldLabels, setLocalCustomFieldLabels] = useState({});

    // 한글 입력 조합 시작
    const handleCompositionStart = useCallback(() => {
        setIsComposing(true);
    }, []);

    // 한글 입력 조합 완료 (consentText)
    const handleConsentTextCompositionEnd = useCallback((e) => {
        setIsComposing(false);
        const value = e.target.value || '';
        setLocalConsentText(value);
        onPersonalInfoChange('personalInfo', 'consentText', value);
    }, [onPersonalInfoChange]);

    // consentText 입력 변경 핸들러
    const handleConsentTextChange = useCallback((e) => {
        const value = e.target.value || '';
        setLocalConsentText(value);
        
        // 한글 조합 중이면 부모 상태는 업데이트하지 않음
        if (isComposing) {
            return;
        }
        
        onPersonalInfoChange('personalInfo', 'consentText', value);
    }, [isComposing, onPersonalInfoChange]);

    const getNextQuestionId = useCallback(() => {
        const maxId = questions.reduce((max, q) => Math.max(max, q.id || 0), 0);
        return Math.max(lastQuestionId, maxId) + 1;
    }, [lastQuestionId, questions]);

    // 질문 유형 변환 함수 (컴포넌트 외부로 이동하여 안정성 확보)
    const getQuestionConfig = useCallback((type) => {
        const configs = {
            'single_choice': { frontendType: 'radio', backendType: 'RADIO', needsOptions: true, defaultOptions: 2 },
            'yes_no': { frontendType: 'yes_no', backendType: 'YES_NO', needsOptions: true, defaultOptions: ['예', '아니오'] },
            'multiple_choice': { frontendType: 'checkbox', backendType: 'CHECKBOX', needsOptions: true, defaultOptions: 2 },
            'image_choice': { frontendType: 'radio_image', backendType: 'RADIO', needsOptions: true, defaultOptions: 2, hasImage: true },
            'dropdown': { frontendType: 'dropdown', backendType: 'DROPDOWN', needsOptions: true, defaultOptions: 2 },
            'star_rating': { frontendType: 'star_rating', backendType: 'STAR_RATING', needsOptions: true, defaultOptions: ['1', '2', '3', '4', '5'] },
            'scale': { frontendType: 'scale', backendType: 'SCALE', needsOptions: true, defaultOptions: ['매우 동의', '동의', '보통', '비동의', '매우 비동의'] },
            'text': { frontendType: 'text', backendType: 'TEXT', needsOptions: false, defaultOptions: [] },
            'textarea': { frontendType: 'textarea', backendType: 'TEXT', needsOptions: false, defaultOptions: [] },
            'descriptive': { frontendType: 'textarea', backendType: 'TEXT', needsOptions: false, defaultOptions: [] },
            'email': { frontendType: 'email', backendType: 'TEXT', needsOptions: false, defaultOptions: [] },
            'phone': { frontendType: 'phone', backendType: 'TEXT', needsOptions: false, defaultOptions: [] }
        };
        return configs[type] || configs['single_choice'];
    }, []);

    // 단색 SVG 아이콘 컴포넌트 (크기 30% 축소: w-8 h-8 -> w-6 h-6)
    const IconText = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
    );
    const IconTextarea = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    );
    const IconEmail = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
    );
    const IconPhone = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
    );
    const IconRadio = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
    const IconCheckbox = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
    );
    const IconYesNo = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
    const IconDropdown = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
    );
    const IconImage = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
    );
    const IconScale = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
    );
    const IconStar = () => (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
    );

    // 질문 유형 목록 (요청된 순서대로 정렬)
    const questionTypes = [
        // 1. 텍스트 입력 -> 단답형
        { value: 'text', label: '단답형', icon: IconText, category: 'input', description: '짧은 텍스트 입력' },
        // 2. 서술형
        { value: 'textarea', label: '서술형', icon: IconTextarea, category: 'input', description: '긴 텍스트 입력' },
        // 3. 단일 선택
        { value: 'single_choice', label: '단일 선택', icon: IconRadio, category: 'choice', description: '하나만 선택' },
        // 4. 다중 선택
        { value: 'multiple_choice', label: '다중 선택', icon: IconCheckbox, category: 'choice', description: '여러 개 선택' },
        // 5. 예/아니오
        { value: 'yes_no', label: '예/아니오', icon: IconYesNo, category: 'choice', description: '예 또는 아니오' },
        // 6. 드롭다운
        { value: 'dropdown', label: '드롭다운', icon: IconDropdown, category: 'choice', description: '드롭다운 목록' },
        // 7. 척도
        { value: 'scale', label: '척도', icon: IconScale, category: 'rating', description: '척도 평가' },
        // 8. 별점 평가
        { value: 'star_rating', label: '별점 평가', icon: IconStar, category: 'rating', description: '별점으로 평가' },
        // 9. 이미지 선택
        { value: 'image_choice', label: '이미지 선택', icon: IconImage, category: 'choice', description: '이미지로 선택' },
        // 10. 이메일 주소
        { value: 'email', label: '이메일 주소', icon: IconEmail, category: 'input', description: '이메일 형식 검증' },
        // 11. 전화번호
        { value: 'phone', label: '전화번호', icon: IconPhone, category: 'input', description: '전화번호 형식 검증' }
    ];

    const handleAddCustomField = useCallback(() => {
        const newField = { 
            id: Date.now(),
            label: `추가 질문 ${safePersonalInfo.customFields.length + 1}`, 
            type: 'text',
            required: false,
        };
        const newCustomFields = [...safePersonalInfo.customFields, newField];
        onPersonalInfoChange('personalInfo', 'customFields', newCustomFields);
    }, [safePersonalInfo.customFields, onPersonalInfoChange]);
    
    const handleUpdateCustomField = useCallback((id, key, value) => {
        const newCustomFields = safePersonalInfo.customFields.map(field => 
            field.id === id ? { ...field, [key]: value } : field
        );
        onPersonalInfoChange('personalInfo', 'customFields', newCustomFields);
    }, [safePersonalInfo.customFields, onPersonalInfoChange]);
    
    const handleRemoveCustomField = useCallback((id) => {
        const newCustomFields = safePersonalInfo.customFields.filter(field => field.id !== id);
        onPersonalInfoChange('personalInfo', 'customFields', newCustomFields);
    }, [safePersonalInfo.customFields, onPersonalInfoChange]);

    // 커스텀 필드 label 입력 변경 핸들러
    const handleCustomFieldLabelChange = useCallback((fieldId, e) => {
        const value = e.target.value || '';
        setLocalCustomFieldLabels(prev => ({ ...prev, [fieldId]: value }));
        
        // 한글 조합 중이면 부모 상태는 업데이트하지 않음
        if (isComposing) {
            return;
        }
        
        handleUpdateCustomField(fieldId, 'label', value);
    }, [isComposing, handleUpdateCustomField]);

    // 커스텀 필드 label 한글 입력 조합 완료
    const handleCustomFieldLabelCompositionEnd = useCallback((fieldId, e) => {
        setIsComposing(false);
        const value = e.target.value || '';
        setLocalCustomFieldLabels(prev => ({ ...prev, [fieldId]: value }));
        handleUpdateCustomField(fieldId, 'label', value);
    }, [handleUpdateCustomField]);

    // personalInfo 변경 시 로컬 상태 동기화
    useEffect(() => {
        setLocalConsentText(safePersonalInfo.consentText || '');
    }, [safePersonalInfo.consentText]);

    const handleInfoFieldChange = useCallback((field, isChecked) => {
        let newFields;
        const currentFields = safePersonalInfo.fields || []; 
        
        if (isChecked) {
            newFields = [...currentFields, field];
        } else {
            newFields = currentFields.filter(f => f !== field);
        }
        onPersonalInfoChange('personalInfo', 'fields', newFields);
    }, [safePersonalInfo.fields, onPersonalInfoChange]);

    // 질문 추가 후 스크롤 및 초기화
    useEffect(() => {
        if (questions.length !== lastQuestionCountRef.current) {
            if (questions.length > lastQuestionCountRef.current) {
                // 새 질문이 추가되었을 때 부모 컨테이너 내에서만 스크롤
                setTimeout(() => {
                    if (questionsEndRef.current) {
                        // 부모 컨테이너 찾기 (overflow-y-auto가 있는 부모)
                        const parentContainer = questionsEndRef.current.closest('.overflow-y-auto');
                        if (parentContainer) {
                            // 요소의 위치를 부모 컨테이너 기준으로 계산
                            const elementRect = questionsEndRef.current.getBoundingClientRect();
                            const containerRect = parentContainer.getBoundingClientRect();
                            
                            // 요소가 컨테이너 밖에 있으면 스크롤
                            const relativeTop = elementRect.top - containerRect.top + parentContainer.scrollTop;
                            
                            parentContainer.scrollTo({
                                top: relativeTop - 20, // 약간의 여백
                                behavior: 'smooth'
                            });
                        }
                        // 부모 컨테이너가 없으면 스크롤하지 않음 (전체 브라우저 스크롤 방지)
                    }
                }, 200);
            }
            lastQuestionCountRef.current = questions.length;
        }
    }, [questions.length]);
    
    // 컴포넌트 마운트 시 초기화
    useEffect(() => {
        lastQuestionCountRef.current = questions.length;
    }, []);
    
    // ESC 키로 모달 닫기
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && showQuestionTypeModal) {
                setShowQuestionTypeModal(false);
                setSelectedCategory('all');
            }
        };
        
        if (showQuestionTypeModal) {
            document.addEventListener('keydown', handleEscape);
            // 모달이 열려있을 때 body 스크롤 방지
            document.body.style.overflow = 'hidden';
        }
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [showQuestionTypeModal]);

    // 질문 추가 핸들러
    const handleAddQuestion = useCallback((selectedType) => {
        try {
            console.log('[Step3_Questions] 질문 추가 시작:', selectedType);
            
            if (!selectedType) {
                console.error('[Step3_Questions] 질문 타입이 없습니다.');
                alert('질문 유형을 선택해주세요.');
                return;
            }
            
            if (!onQuestionsChange || typeof onQuestionsChange !== 'function') {
                console.error('[Step3_Questions] onQuestionsChange가 함수가 아닙니다:', onQuestionsChange);
                alert('질문 추가 기능을 사용할 수 없습니다. 페이지를 새로고침해주세요.');
                return;
            }
            
            // 모달 먼저 닫기 (UX 개선)
            setShowQuestionTypeModal(false);
            setSelectedCategory('all');
            
            const newId = getNextQuestionId();
            console.log('[Step3_Questions] 새 질문 ID:', newId);
            
            const config = getQuestionConfig(selectedType);
            if (!config) {
                console.error('[Step3_Questions] 질문 설정을 찾을 수 없습니다:', selectedType);
                alert('선택한 질문 유형을 처리할 수 없습니다.');
                return;
            }
            
            console.log('[Step3_Questions] 질문 설정:', config);
            
            let defaultOptions = [];
            if (config.needsOptions) {
                if (config.defaultOptions === 2) {
                    defaultOptions = [
                        { id: Date.now(), text: '옵션 1', imageBase64: config.hasImage ? '' : undefined },
                        { id: Date.now() + 1, text: '옵션 2', imageBase64: config.hasImage ? '' : undefined }
                    ];
                } else if (Array.isArray(config.defaultOptions)) {
                    defaultOptions = config.defaultOptions.map((opt, idx) => ({
                        id: Date.now() + idx,
                        text: String(opt),
                        imageBase64: config.hasImage ? '' : undefined
                    }));
                }
            }
            
            // 모든 필수 필드 포함
            const newQuestion = {
                id: newId,
                type: config.frontendType,
                title: '',
                text: '',
                content: '',
                options: defaultOptions,
                required: false,
                image: '',
                imageBase64: '',
                show_image_upload: false,
                // 척도 관련 기본값
                scaleMin: 0,
                scaleMax: 10,
                scaleLeftLabel: '',
                scaleRightLabel: '',
                // 별점 관련 기본값
                starCount: 5
            };
            
            console.log('[Step3_Questions] 생성된 질문:', newQuestion);
            console.log('[Step3_Questions] onQuestionsChange 호출:', { action: 'add', payload: { type: selectedType, question: newQuestion } });
            
            // 질문 추가 실행
            onQuestionsChange('add', { type: selectedType, question: newQuestion });
            
            console.log('[Step3_Questions] 질문 추가 완료');
        } catch (error) {
            console.error('[Step3_Questions] 질문 추가 중 오류:', error);
            alert('질문 추가 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
            // 에러 발생 시 모달 다시 열기
            setShowQuestionTypeModal(true);
        }
    }, [getNextQuestionId, onQuestionsChange, getQuestionConfig]);

    return (
        <div className="h-full flex flex-col overflow-hidden" style={{ height: '100%', maxHeight: '100%' }}>
            {/* 문제 섹션 - 고정 헤더 */}
            <div className="flex-shrink-0 bg-white rounded-xl shadow-md p-4 mb-4">
                    <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-text-main">문제</h3>
                    {/* 질문 추가 버튼 - 상단에 고정 */}
                    <button
                        type="button"
                        onClick={() => setShowQuestionTypeModal(true)}
                        style={{
                            backgroundColor: 'var(--primary, #26C6DA)',
                            color: '#FFFFFF'
                        }}
                        className="px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>+ 추가</span>
                    </button>
                </div>
            </div>
                
                {/* 질문 목록 및 개인 정보 수집 설정 - 스크롤 가능 영역 */}
                <div className="flex-1 overflow-y-auto min-h-0" style={{ overflowY: 'auto', minHeight: 0 }}>
                    <div className="space-y-4">
                    <QuestionList
                        questions={questions}
                        questionTypes={questionTypes}
                        onQuestionsChange={onQuestionsChange}
                        onQuestionChange={(idx, key, value) => {
                            const question = questions[idx];
                            const updated = { ...question, [key]: value };
                            onQuestionsChange('update', { questionId: question.id, updatedQuestion: updated });
                        }}
                        onOptionChange={(qIdx, optIdx, key, value) => {
                            const question = questions[qIdx];
                            const options = [...(question.options || [])];
                            if (typeof options[optIdx] === 'string') {
                                options[optIdx] = { id: Date.now(), text: options[optIdx] };
                            }
                            if (!options[optIdx]) {
                                options[optIdx] = { id: Date.now(), text: '', imageBase64: '' };
                            }
                            options[optIdx] = { ...options[optIdx], [key]: value };
                            const updated = { ...question, options };
                            onQuestionsChange('update', { questionId: question.id, updatedQuestion: updated });
                        }}
                        onAddOption={(qIdx, isImageType) => {
                            const question = questions[qIdx];
                            const newOption = isImageType 
                                ? { id: Date.now(), text: '', imageBase64: '' }
                                : { id: Date.now(), text: `옵션 ${(question.options?.length || 0) + 1}` };
                            const updated = { ...question, options: [...(question.options || []), newOption] };
                            onQuestionsChange('update', { questionId: question.id, updatedQuestion: updated });
                        }}
                        onDeleteOption={(qIdx, optIdx) => {
                            console.log('[Step3_Questions] 옵션 삭제:', { qIdx, optIdx, questionId: questions[qIdx]?.id });
                            const question = questions[qIdx];
                            if (!question) {
                                console.error('[Step3_Questions] 질문을 찾을 수 없습니다:', qIdx);
                                return;
                            }
                            const currentOptions = question.options || [];
                            console.log('[Step3_Questions] 현재 옵션:', currentOptions);
                            const updatedOptions = currentOptions.filter((_, i) => i !== optIdx);
                            console.log('[Step3_Questions] 삭제 후 옵션:', updatedOptions);
                            const updated = { ...question, options: updatedOptions };
                            onQuestionsChange('update', { questionId: question.id, updatedQuestion: updated });
                        }}
                        onDelete={(qIdx) => {
                            const question = questions[qIdx];
                            if (window.confirm('정말로 이 질문을 삭제하시겠습니까?')) {
                                onQuestionsChange('delete', { questionId: question.id });
                            }
                        }}
                        onDuplicate={(qIdx) => {
                            const question = questions[qIdx];
                            onQuestionsChange('duplicate', { questionId: question.id });
                        }}
                        onToggleRequired={(qIdx) => {
                            const question = questions[qIdx];
                            if (!question) {
                                console.error('[Step3_Questions] 질문을 찾을 수 없습니다:', qIdx);
                                return;
                            }
                            const questionId = question.id || question._id;
                            if (!questionId) {
                                console.error('[Step3_Questions] 질문 ID가 없습니다:', question);
                                return;
                            }
                            // required 값을 명시적으로 boolean으로 변환 (undefined는 false로 처리)
                            const currentRequired = Boolean(question.required);
                            const newRequired = !currentRequired;
                            // question 객체를 복사하되, required만 명시적으로 업데이트
                            const updated = { 
                                ...question, 
                                required: newRequired 
                            };
                            onQuestionsChange('update', { questionId: questionId, updatedQuestion: updated });
                        }}
                        onQuestionImageChange={(qIdx, e) => {
                            const question = questions[qIdx];
                            const updated = { ...question, image: e.target.value };
                            onQuestionsChange('update', { questionId: question.id, updatedQuestion: updated });
                        }}
                        onOptionImageChange={(qIdx, optIdx, e) => {
                            const question = questions[qIdx];
                            const options = [...(question.options || [])];
                            if (typeof options[optIdx] === 'string') {
                                options[optIdx] = { id: Date.now(), text: options[optIdx], imageBase64: '' };
                            }
                            if (!options[optIdx]) {
                                options[optIdx] = { id: Date.now(), text: '', imageBase64: '' };
                            }
                            options[optIdx] = { ...options[optIdx], imageBase64: e.target.value };
                            const updated = { ...question, options };
                            onQuestionsChange('update', { questionId: question.id, updatedQuestion: updated });
                        }}
                        onQuestionTypeChange={(qIdx, newType) => {
                            const question = questions[qIdx];
                            // 역매핑: 프론트엔드 타입 -> 설정 타입
                            const typeMapping = {
                                'radio': 'single_choice',
                                'checkbox': 'multiple_choice',
                                'radio_image': 'image_choice',
                                'checkbox_image': 'image_choice',
                                'yes_no': 'yes_no',
                                'dropdown': 'dropdown',
                                'star_rating': 'star_rating',
                                'scale': 'scale',
                                'textarea': 'textarea',
                                'text': 'text',
                                'email': 'email',
                                'phone': 'phone',
                                'descriptive': 'textarea'
                            };
                            const mappedType = typeMapping[newType] || newType;
                            const config = getQuestionConfig(mappedType);
                            
                            const updated = { ...question, type: config.frontendType || newType };
                            if (!config.needsOptions) {
                                updated.options = [];
                            } else if ((updated.options || []).length === 0) {
                                let defaultOptions = [];
                                if (config.defaultOptions === 2) {
                                    defaultOptions = [
                                        { id: Date.now(), text: '옵션 1', imageBase64: config.hasImage ? '' : undefined },
                                        { id: Date.now() + 1, text: '옵션 2', imageBase64: config.hasImage ? '' : undefined }
                                    ];
                                } else if (Array.isArray(config.defaultOptions)) {
                                    defaultOptions = config.defaultOptions.map((opt, idx) => ({
                                        id: Date.now() + idx,
                                        text: String(opt),
                                        imageBase64: config.hasImage ? '' : undefined
                                    }));
                                }
                                updated.options = defaultOptions;
                            }
                            onQuestionsChange('update', { questionId: question.id, updatedQuestion: updated });
                        }}
                    />
                    <div ref={questionsEndRef} />
                    
                    {/* 질문 추가 버튼 - 하단 */}
                    <div className="pt-4 border-t border-gray-100 mt-4 pb-4">
                        <button
                            type="button"
                            onClick={() => {
                                console.log('[Step3_Questions] 하단 질문 추가 버튼 클릭');
                                setShowQuestionTypeModal(true);
                            }}
                            className="w-full py-4 bg-primary/5 border-2 border-dashed border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{ 
                                borderColor: 'var(--primary, #4F46E5)',
                                color: 'var(--primary, #4F46E5)'
                            }}
                        >
                            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="font-semibold">질문 추가</span>
                        </button>
                    </div>
                    
                    {/* 개인 정보 수집 설정 */}
                    <div className="bg-white rounded-xl shadow-md p-4">
                <h3 className="text-lg font-bold text-text-main mb-4">개인 정보 수집</h3>
                
                {/* 개인 정보 수집 활성화 여부 */}
                    <div className="flex items-center justify-between mb-4">
                    <label htmlFor="personalInfoEnabled" className="text-sm font-medium text-text-sub">
                        개인 정보 수집
                    </label>
                    <button 
                        type="button"
                        onClick={() => {
                            console.log('[Step3_Questions] 개인정보 수집 토글:', !safePersonalInfo.enabled);
                            onPersonalInfoChange('personalInfo', 'enabled', !safePersonalInfo.enabled);
                        }}
                        aria-label="개인 정보 수집 활성화"
                        aria-checked={safePersonalInfo.enabled || false}
                        role="switch"
                        className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                        style={{
                            padding: '2px',
                            backgroundColor: safePersonalInfo.enabled ? '#26C6DA' : '#D1D5DB'
                        }}
                    >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                            safePersonalInfo.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                    </button>
                </div>

                <AnimatePresence initial={false}>
                    {safePersonalInfo.enabled && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="space-y-4 pt-3 border-t border-border overflow-hidden"
                            style={{ overflow: 'hidden' }}
                        >
                        <div>
                            <label className="text-sm font-medium text-text-sub block mb-3">수집할 기본 정보</label>
                            <div className="space-y-2">
                                {PERSONAL_INFO_FIELDS.map(field => (
                                    <label key={field.value} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={(safePersonalInfo.fields || []).includes(field.value)}
                                            onChange={(e) => handleInfoFieldChange(field.value, e.target.checked)}
                                            className="h-4 w-4 text-primary rounded border-border focus:ring-primary"
                                            disabled={field.value === 'name'} 
                                        />
                                        <span className="text-sm text-text-sub">{field.label} {field.value === 'name' ? '(필수)' : ''}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <label className="text-sm font-medium text-text-sub block mb-3">추가 개인 정보 질문 (단답형)</label>
                            <div className="space-y-2">
                                {(safePersonalInfo.customFields || []).map((field, index) => (
                                    <div key={field.id} className="flex items-center space-x-2 p-3 bg-bg border border-border rounded-lg">
                                        <input
                                            type="text"
                                            value={localCustomFieldLabels[field.id] !== undefined ? localCustomFieldLabels[field.id] : field.label}
                                            onChange={(e) => handleCustomFieldLabelChange(field.id, e)}
                                            onCompositionStart={handleCompositionStart}
                                            onCompositionEnd={(e) => handleCustomFieldLabelCompositionEnd(field.id, e)}
                                            placeholder={`추가 질문 ${index + 1} 제목`}
                                            className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                        />
                                        <select 
                                            value={field.required ? '필수' : '선택'}
                                            onChange={(e) => handleUpdateCustomField(field.id, 'required', e.target.value === '필수')}
                                            className="border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                                        >
                                            <option value="선택">선택</option>
                                            <option value="필수">필수</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemoveCustomField(field.id)}
                                            className="p-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleAddCustomField}
                                className="mt-2 w-full py-2 border border-dashed border-border text-text-sub rounded-lg hover:border-primary hover:text-primary transition text-sm"
                            >
                                + 추가 개인 정보 질문 생성 (단답형)
                            </button>
                        </div>
                        
                        <div>
                            <label htmlFor="consentText" className="text-sm font-medium text-text-sub block mb-2">
                                개인 정보 수집 문구
                            </label>
                            <textarea
                                id="consentText"
                                value={localConsentText}
                                onChange={handleConsentTextChange}
                                onCompositionStart={handleCompositionStart}
                                onCompositionEnd={handleConsentTextCompositionEnd}
                                rows={4}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary resize-none"
                                placeholder="예: [개인정보 수집 및 이용 동의]\n1. 수집 목적: 설문 경품 제공 및 이벤트 참여 확인\n2. 수집 항목: 이름, 전화번호, 주소\n3. 보유 기간: 이벤트 종료 후 1개월"
                            />
                        </div>
                        
                        <div>
                            <label htmlFor="consentRequired" className="text-sm font-medium text-text-sub block mb-2">
                                동의 필수/선택
                            </label>
                            <select
                                id="consentRequired"
                                value={safePersonalInfo.consentRequired ? '필수' : '선택'}
                                onChange={(e) => onPersonalInfoChange('personalInfo', 'consentRequired', e.target.value === '필수')}
                                className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-primary"
                            >
                                <option value="선택">선택</option>
                                <option value="필수">필수</option>
                            </select>
                            <p className="mt-1 text-xs text-text-sub">
                                {safePersonalInfo.consentRequired 
                                    ? '참여자는 동의하지 않으면 설문을 제출할 수 없습니다.' 
                                    : '참여자는 동의하지 않아도 설문을 제출할 수 있습니다.'}
                            </p>
                        </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                    </div>
                    
                    {/* 문제 화면 배경 설정 */}
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <h3 className="text-lg font-bold text-text-main mb-4">문제 화면 배경</h3>
                        
                        <div className="space-y-3">
                            {/* 배경 이미지 업로드 */}
                            <div>
                                <ImageUpload
                                    label="배경 이미지"
                                    imageBase64={branding?.questionBgImageBase64 || ''}
                                    onImageChange={(e) => {
                                        if (e && e.target && e.target.value !== undefined) {
                                            onBrandingChange('branding', 'questionBgImageBase64', e.target.value);
                                        }
                                    }}
                                    maxSizeMB={8}
                                    recommendedSize="1280×720"
                                    compact={true}
                                    hint="문제 화면에 표시될 배경 이미지 (선택)"
                                />
                            </div>
                        </div>
                    </div>
                    </div>
                </div>

            {/* 질문 유형 선택 모달 */}
            <AnimatePresence>
                {showQuestionTypeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4"
                        onClick={() => {
                            setShowQuestionTypeModal(false);
                            setSelectedCategory('all');
                        }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{ duration: 0.15 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-xl p-4 shadow-lg overflow-hidden flex flex-col"
                            style={{ 
                                width: '600px',
                                height: '620px',
                                maxWidth: '90vw',
                                maxHeight: '90vh'
                            }}
                        >
                            {/* 헤더 */}
                            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                                <h3 className="text-lg font-semibold text-text-main">질문 유형 선택</h3>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowQuestionTypeModal(false);
                                        setSelectedCategory('all');
                                    }}
                                    className="text-text-sub hover:text-text-main w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg transition-colors"
                                    aria-label="닫기"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            {/* 카테고리 필터 - 콤보박스 */}
                            <div className="mb-4 flex-shrink-0">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-4 py-2.5 border-2 border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all bg-white text-text-main font-medium"
                                    style={{
                                        borderColor: '#E5E7EB',
                                        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif'
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#26C6DA';
                                        e.target.style.boxShadow = '0 0 0 2px rgba(38, 198, 218, 0.25)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#E5E7EB';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    <option value="all">전체</option>
                                    <option value="input">입력</option>
                                    <option value="choice">선택</option>
                                    <option value="rating">평가</option>
                                </select>
                            </div>
                            
                            {/* 질문 유형 그리드 */}
                            <div className="flex-1 overflow-y-auto pr-2">
                                <div className="grid grid-cols-4 gap-1.5 p-4">
                                    {questionTypes
                                        .filter(qType => selectedCategory === 'all' || qType.category === selectedCategory)
                                        .map((qType) => {
                                            const config = getQuestionConfig(qType.value);
                                            const IconComponent = qType.icon;
                                            return (
                                                <motion.button
                                                    key={qType.value}
                                                    type="button"
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    onClick={() => {
                                                        console.log('질문 유형 선택:', qType.value);
                                                        handleAddQuestion(qType.value);
                                                    }}
                                                    className="aspect-square border border-border rounded-lg transition-all text-center group cursor-pointer bg-white flex flex-col items-center justify-center"
                                                    style={{
                                                        fontFamily: 'Pretendard, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
                                                        padding: 'calc(0.5rem * 0.8)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.borderColor = '#26C6DA';
                                                        e.currentTarget.style.backgroundColor = 'rgba(38, 198, 218, 0.05)';
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.borderColor = '#E5E7EB';
                                                        e.currentTarget.style.backgroundColor = '#FFFFFF';
                                                    }}
                                                >
                                                    <div className="mb-1.5 text-text-sub transition-colors flex-shrink-0 group-hover:text-[#26C6DA]">
                                                        {typeof IconComponent === 'function' ? (
                                                            <IconComponent />
                                                        ) : (
                                                            IconComponent
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-semibold text-text-main transition-colors mb-1 leading-tight group-hover:text-[#26C6DA]">
                                                        {qType.label}
                                                    </div>
                                                    {qType.description && (
                                                        <div className="text-xs text-text-sub mt-0.5 leading-tight line-clamp-1">
                                                            {qType.description}
                                                        </div>
                                                    )}
                                                    {config.needsOptions && (
                                                        <div className="mt-1 inline-block px-1.5 py-0.5 text-[10px] bg-primary/10 text-primary rounded leading-tight">
                                                            옵션 필요
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
