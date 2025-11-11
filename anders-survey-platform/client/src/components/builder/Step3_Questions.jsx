// client/src/components/builder/Step3_Questions.jsx (질문 먼저, 개인정보 아래 + 추가 질문 유형)

import { useCallback, useState, useEffect, useRef } from 'react';
import { PERSONAL_INFO_FIELDS } from '../../constants.js';
import QuestionList from './QuestionList';
import { motion, AnimatePresence } from 'framer-motion';

export default function Step3_Questions({ questions, lastQuestionId, personalInfo, onQuestionsChange, onPersonalInfoChange, onImageChange }) {
    
    const safePersonalInfo = personalInfo || { enabled: false, fields: [], consentText: '', consentRequired: false, customFields: [] };
    const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all'); // 'all', 'input', 'choice', 'rating'
    const questionsEndRef = useRef(null);
    const lastQuestionCountRef = useRef(questions.length);

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

    // 질문 유형 목록 (카테고리별 분류)
    const questionTypes = [
        // 입력 유형
        { value: 'text', label: '텍스트 입력', icon: '📝', category: 'input', description: '짧은 텍스트 입력' },
        { value: 'textarea', label: '서술형 (텍스트)', icon: '📄', category: 'input', description: '긴 텍스트 입력' },
        { value: 'email', label: '이메일 주소 입력', icon: '✉️', category: 'input', description: '이메일 형식 검증' },
        { value: 'phone', label: '전화번호 입력', icon: '📞', category: 'input', description: '전화번호 형식 검증' },
        // 선택 유형
        { value: 'single_choice', label: '단일 선택', icon: '📊', category: 'choice', description: '하나만 선택' },
        { value: 'multiple_choice', label: '다중 선택', icon: '☑️', category: 'choice', description: '여러 개 선택' },
        { value: 'yes_no', label: '예/아니오', icon: '✅', category: 'choice', description: '예 또는 아니오' },
        { value: 'dropdown', label: '드롭다운', icon: '📋', category: 'choice', description: '드롭다운 목록' },
        { value: 'image_choice', label: '이미지 선택', icon: '🖼️', category: 'choice', description: '이미지로 선택' },
        // 평가 유형
        { value: 'scale', label: '척도 (Likert)', icon: '📏', category: 'rating', description: '척도 평가' },
        { value: 'star_rating', label: '별점 평가', icon: '⭐', category: 'rating', description: '별점으로 평가' }
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
                // 새 질문이 추가되었을 때 스크롤
                setTimeout(() => {
                    questionsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
        <div className="space-y-4">
            {/* 문제 섹션 */}
            <div className="bg-white rounded-xl shadow-md p-4">
                    <div className="flex items-center justify-between mb-4">
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
                
                {/* 질문 목록 - 항상 렌더링하여 Hook 오류 방지 */}
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
                        onRemoveOption={(qIdx, optIdx) => {
                            const question = questions[qIdx];
                            const updated = { ...question, options: (question.options || []).filter((_, i) => i !== optIdx) };
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
                            const updated = { ...question, required: !question.required };
                            onQuestionsChange('update', { questionId: question.id, updatedQuestion: updated });
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
                    
                    {/* 질문 추가 버튼 - 질문 목록 아래 (더 눈에 띄게) */}
                    <div ref={questionsEndRef} className="pt-2">
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
                        className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                            safePersonalInfo.enabled ? 'bg-primary' : 'bg-gray-300'
                        }`}
                        style={{ padding: '2px' }}
                    >
                        <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                            safePersonalInfo.enabled ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                    </button>
                </div>

                {safePersonalInfo.enabled && (
                    <div className="space-y-4 pt-3 border-t border-border">
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
                                            value={field.label}
                                            onChange={(e) => handleUpdateCustomField(field.id, 'label', e.target.value)}
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
                                value={safePersonalInfo.consentText || ''}
                                onChange={(e) => onPersonalInfoChange('personalInfo', 'consentText', e.target.value)}
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
                    </div>
                )}
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
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ duration: 0.2 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl p-4 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
                        >
                            {/* 헤더 */}
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                                <div>
                                    <h3 className="text-2xl font-bold text-text-main mb-1">질문 유형 선택</h3>
                                    <p className="text-sm text-text-sub">추가할 질문 유형을 선택하세요</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowQuestionTypeModal(false);
                                        setSelectedCategory('all');
                                    }}
                                    className="text-text-sub hover:text-text-main text-3xl leading-none w-10 h-10 flex items-center justify-center rounded-lg hover:bg-bg transition-colors"
                                    aria-label="닫기"
                                >
                                    ×
                                </button>
                            </div>
                            
                            {/* 카테고리 필터 */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                <button
                                    onClick={() => setSelectedCategory('all')}
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                                        selectedCategory === 'all'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-bg text-text-sub hover:bg-primary/10'
                                    }`}
                                >
                                    전체
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('input')}
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                                        selectedCategory === 'input'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-bg text-text-sub hover:bg-primary/10'
                                    }`}
                                >
                                    입력
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('choice')}
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                                        selectedCategory === 'choice'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-bg text-text-sub hover:bg-primary/10'
                                    }`}
                                >
                                    선택
                                </button>
                                <button
                                    onClick={() => setSelectedCategory('rating')}
                                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                                        selectedCategory === 'rating'
                                            ? 'bg-primary text-white shadow-md'
                                            : 'bg-bg text-text-sub hover:bg-primary/10'
                                    }`}
                                >
                                    평가
                                </button>
                            </div>
                            
                            {/* 질문 유형 그리드 */}
                            <div className="flex-1 overflow-y-auto pr-2">
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {questionTypes
                                        .filter(qType => selectedCategory === 'all' || qType.category === selectedCategory)
                                        .map((qType) => {
                                            const config = getQuestionConfig(qType.value);
                                            return (
                                                <motion.button
                                                    key={qType.value}
                                                    type="button"
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        console.log('질문 유형 선택:', qType.value);
                                                        handleAddQuestion(qType.value);
                                                    }}
                                                    className="p-5 border-2 border-border rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-center group cursor-pointer relative overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
                                                    <div className="relative z-10">
                                                        <div className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">
                                                            {qType.icon}
                                                        </div>
                                                        <div className="text-sm font-bold text-text-main group-hover:text-primary transition-colors mb-1">
                                                            {qType.label}
                                                        </div>
                                                        {qType.description && (
                                                            <div className="text-xs text-text-sub mt-1">
                                                                {qType.description}
                                                            </div>
                                                        )}
                                                        {config.needsOptions && (
                                                            <div className="mt-2 inline-block px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full">
                                                                옵션 필요
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.button>
                                            );
                                        })}
                                </div>
                            </div>
                            
                            {/* 하단 버튼 */}
                            <div className="mt-6 pt-4 border-t border-border">
                                <button
                                    onClick={() => {
                                        setShowQuestionTypeModal(false);
                                        setSelectedCategory('all');
                                    }}
                                    className="w-full px-4 py-3 bg-bg border border-border rounded-lg hover:bg-primary/10 hover:border-primary transition text-text-sub font-medium"
                                >
                                    취소
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
