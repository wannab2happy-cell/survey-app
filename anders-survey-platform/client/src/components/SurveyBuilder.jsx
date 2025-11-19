// client/src/components/SurveyBuilder.jsx (4단계 검증 + Admin 버튼 스타일)

import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../api/axiosInstance';
import Step1_Settings from './builder/Step1_Settings';
import Step2_Cover from './builder/Step2_Cover';
import Step3_Questions from './builder/Step3_Questions';
import Step4_Ending from './builder/Step4_Ending';
import MobilePreview from './builder/MobilePreview';
import SurveyPreviewButton from './SurveyPreviewButton';
import { PERSONAL_INFO_FIELDS } from '../constants.js';
import { XCircleIcon, PlayIcon, CalendarIcon, PauseIcon } from './icons.jsx';
import TimePicker from './TimePicker';

// ISO 8601 문자열을 datetime-local 형식(YYYY-MM-DDTHH:MM)으로 변환하는 헬퍼 함수
const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    
    try {
        const date = new Date(isoString);
        if (isNaN(date.getTime())) return ''; 
        
        // 브라우저의 로컬 시간대 기준으로 문자열 포맷
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (e) {
        return '';
    }
};

// 초기 설문 데이터 구조
const getInitialSurveyData = () => ({
    id: null,
    title: '',
    description: '',
    status: 'inactive',
    startAt: null,
    endAt: null,
    questions: [],
    personalInfo: {
        enabled: false,
        fields: ['name'],
        consentText: '[개인정보 수집 및 이용 동의 (필수)]\n1. 수집 목적: 설문 경품 제공 및 이벤트 참여 확인\n2. 수집 항목: 이름, 전화번호, 주소\n3. 보유 기간: 이벤트 종료 및 경품 발송 완료 후 1개월 (즉시 파기)\n\n귀하는 상기 개인정보 수집 및 이용에 동의하지 않을 권리가 있으나, 미동의 시 경품 제공 이벤트 참여가 불가능함을 알려드립니다.',
        consentRequired: true,
        customFields: []
    },
    branding: {
        primaryColor: 'var(--primary)',
        secondaryColor: 'var(--secondary)',
        tertiaryColor: 'var(--success)',
        font: 'Pretendard',
        buttonShape: 'rounded', // 'rounded', 'square', 'pill'로 통일
        buttonOpacity: 0.9, // 버튼 투명도 (0.1 ~ 1.0)
        logoBase64: '',
        bgImageBase64: '',
        backgroundColor: '#1a1f2e',
        questionBackgroundColor: '#ffffff',
        questionBgImageBase64: '',
        footerLogoBase64: ''
    },
    advancedSettings: {
        koreanSpacingWrap: false // 한글 띄어쓰기 유지 및 줄바꿈
    },
    cover: {
        title: '',
        description: '',
        imageBase64: '',
        logoBase64: '',
        bgImageBase64: '', // 배경 이미지 추가
        skipCover: false, // 커버 페이지 건너뛰기 설정
        showParticipantCount: false,
        buttonText: '시작하기'
    },
    ending: {
        title: '설문이 완료되었습니다!',
        description: '귀하의 소중한 의견에 감사드립니다.',
        imageBase64: '',
        linkUrl: '',
        linkText: '더 알아보기'
    },
    isPublic: true,
    password: '',
    // Head/Foot 커스터마이징 (요구사항)
    head: {
        background: '',
        title: '',
        imageBase64: ''
    },
    foot: {
        background: '',
        logoBase64: '',
        imageBase64: ''
    }
});

const SurveyBuilder = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [surveyData, setSurveyData] = useState(getInitialSurveyData());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [currentTab, setCurrentTab] = useState('cover'); // 'style', 'cover', 'questions', 'ending', 'publishing'
    const [lastQuestionId, setLastQuestionId] = useState(0);
    const [loadingSurvey, setLoadingSurvey] = useState(false);
    const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);
    const [stepValidation, setStepValidation] = useState({
        step1: false,
        step2: false,
        step3: false,
        step4: false
    });
    const [resultsShareUrl, setResultsShareUrl] = useState('');
    const [generatingShareToken, setGeneratingShareToken] = useState(false);

    // 브랜딩 색상을 CSS 변수에 적용 (Admin 스타일은 제외)
    useEffect(() => {
        const primaryColor = surveyData?.branding?.primaryColor;
        if (primaryColor) {
            const root = document.documentElement;
            const actualColor = typeof primaryColor === 'string' && primaryColor.startsWith('#') 
                ? primaryColor 
                : (typeof primaryColor === 'string' && primaryColor.includes('var') 
                    ? '#26C6DA'
                    : (primaryColor || '#26C6DA'));
            // --brand-primary만 변경 (--primary는 Admin 영역에서 고정값으로 오버라이드됨)
            root.style.setProperty('--brand-primary', actualColor);
            root.style.setProperty('--dynamic-primary-color', actualColor);
        }
    }, [surveyData?.branding?.primaryColor]);

    // 브라우저 스크롤 방지
    useEffect(() => {
        const originalBodyOverflow = document.body.style.overflow;
        const originalHtmlOverflow = document.documentElement.style.overflow;
        
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = originalBodyOverflow;
            document.documentElement.style.overflow = originalHtmlOverflow;
        };
    }, []);

    // 설문 데이터 로드 (수정 모드)
    useEffect(() => {
        const loadSurveyData = async () => {
            if (!id) return;
            
            setLoadingSurvey(true);
            try {
                const response = await axiosInstance.get(`/surveys/${id}`);
                if (response.data.success && response.data.data) {
                    const loadedSurvey = response.data.data;
                    
                    const convertedQuestions = (loadedSurvey.questions || []).map((q, index) => {
                        let questionType = 'text';
                        const qType = (q.type || '').toUpperCase();
                        const qOptions = (q.options || []).map(opt => 
                            typeof opt === 'string' ? opt : (opt.text || opt.label || String(opt))
                        );
                        
                        // 예/아니오 감지: RADIO 타입이고 옵션이 ['예', '아니오']인 경우
                        if (qType === 'RADIO' && qOptions.length === 2) {
                            const sortedOptions = [...qOptions].sort();
                            if (sortedOptions[0] === '아니오' && sortedOptions[1] === '예') {
                                questionType = 'yes_no';
                            } else {
                                questionType = 'radio';
                            }
                        } else if (qType === 'RADIO') {
                            questionType = 'radio';
                        } else if (qType === 'CHECKBOX') {
                            questionType = 'checkbox';
                        } else if (qType === 'DROPDOWN') {
                            questionType = 'dropdown';
                        } else if (qType === 'STAR_RATING') {
                            questionType = 'star_rating';
                        } else if (qType === 'SCALE') {
                            questionType = 'scale';
                        } else if (qType === 'TEXT') {
                            questionType = 'text';
                        } else if (qType === 'TEXTAREA') {
                            questionType = 'descriptive';
                        }
                        
                        const convertedOptions = qOptions.map((opt, optIndex) => {
                            return { id: Date.now() + optIndex, text: opt, imageBase64: '' };
                        });
                        
                        // 질문 텍스트 추출 (content, text, title 순서로 확인)
                        const questionText = q.content || q.text || q.title || '';
                        
                        // 질문 ID 유지 (기존 ID가 있으면 사용, 없으면 새로 생성)
                        const questionId = q.id || q._id || (Date.now() + index);
                        
                        return {
                            id: questionId,
                            type: questionType,
                            title: questionText,
                            text: questionText,
                            content: questionText,
                            options: convertedOptions,
                            required: q.required || false,
                            image: q.image || q.imageBase64 || '',
                            imageBase64: q.image || q.imageBase64 || '',
                            show_image_upload: false
                        };
                    });
                    
                    // 질문 ID의 최대값을 찾아서 lastQuestionId 설정
                    if (convertedQuestions.length > 0) {
                        const maxId = Math.max(...convertedQuestions.map(q => q.id || 0));
                        setLastQuestionId(maxId);
                    }
                    
                    setSurveyData({
                        id: loadedSurvey._id || loadedSurvey.id,
                        title: loadedSurvey.title || '',
                        description: loadedSurvey.description || '',
                        status: loadedSurvey.status || 'inactive',
                        startAt: loadedSurvey.startAt || null,
                        endAt: loadedSurvey.endAt || null,
                        questions: convertedQuestions,
                        personalInfo: loadedSurvey.personalInfo || {
                            enabled: false,
                            fields: ['name'],
                            consentText: '',
                            consentRequired: false,
                            customFields: []
                        },
                        branding: loadedSurvey.branding || {
                            primaryColor: '#4F46E5',
                            secondaryColor: '#00A3FF',
                            tertiaryColor: '#22C55E',
                            font: 'Noto Sans KR',
                            buttonShape: 'rounded-lg',
                            logoBase64: '',
                            bgImageBase64: '',
                            backgroundColor: '#1a1f2e'
                        },
                        cover: {
                            title: loadedSurvey.cover?.title || '',
                            description: loadedSurvey.cover?.description || '',
                            imageBase64: loadedSurvey.cover?.imageBase64 || '',
                            logoBase64: loadedSurvey.cover?.logoBase64 || '',
                            bgImageBase64: loadedSurvey.cover?.bgImageBase64 || '', // 배경 이미지 로드 추가
                            skipCover: loadedSurvey.cover?.skipCover || false,
                            showParticipantCount: loadedSurvey.cover?.showParticipantCount || false,
                            buttonText: loadedSurvey.cover?.buttonText || '시작하기'
                        },
                        ending: loadedSurvey.ending || {
                            title: '설문이 완료되었습니다!',
                            description: '귀하의 소중한 의견에 감사드립니다.',
                            imageBase64: '',
                            linkUrl: '',
                            linkText: '더 알아보기'
                        },
                        isPublic: loadedSurvey.isPublic !== undefined ? loadedSurvey.isPublic : true,
                        password: loadedSurvey.password || '',
                        head: loadedSurvey.head || {
                            background: '',
                            title: '',
                            imageBase64: ''
                        },
                        foot: loadedSurvey.foot || {
                            background: '',
                            logoBase64: '',
                            imageBase64: ''
                        }
                    });
                    
                    if (convertedQuestions.length > 0) {
                        const maxId = Math.max(...convertedQuestions.map(q => q.id || 0));
                        setLastQuestionId(maxId);
                    }
                }
            } catch (err) {
                console.error('설문 데이터 로드 실패:', err);
                setError('설문 데이터를 불러오는데 실패했습니다. 새 설문으로 시작합니다.');
            } finally {
                setLoadingSurvey(false);
            }
        };
        
        loadSurveyData();
    }, [id]);

    // Step별 검증 함수 (요구사항 1)
    const validateStep = useCallback((step) => {
        switch(step) {
            case 1: // Basic Info
                return surveyData.title.trim() !== '';
            case 2: // Start Page (Cover)
                return surveyData.cover.title.trim() !== '' || surveyData.cover.description.trim() !== '';
            case 3: // Survey Builder
                return surveyData.questions.length > 0 && 
                       surveyData.questions.every(q => (q.title || q.text || q.content || '').trim() !== '');
            case 4: // Completion Page
                return surveyData.ending.title.trim() !== '' || surveyData.ending.description.trim() !== '';
            default:
                return false;
        }
    }, [surveyData]);
    
    // Step별 누락된 항목 목록 반환 함수
    const getMissingFields = useCallback(() => {
        const missingFields = [];
        
        // Step 1: Basic Info
        if (!surveyData.title || surveyData.title.trim() === '') {
            missingFields.push('설문지 제목');
        }
        
        // Step 2: Start Page (Cover)
        if ((!surveyData.cover.title || surveyData.cover.title.trim() === '') && 
            (!surveyData.cover.description || surveyData.cover.description.trim() === '')) {
            missingFields.push('커버 페이지 제목 또는 설명');
        }
        
        // Step 3: Survey Builder
        if (surveyData.questions.length === 0) {
            missingFields.push('질문 (최소 1개 필요)');
        } else {
            const emptyQuestions = surveyData.questions
                .map((q, idx) => {
                    const questionText = (q.title || q.text || q.content || '').trim();
                    return questionText === '' ? idx + 1 : null;
                })
                .filter(idx => idx !== null);
            if (emptyQuestions.length > 0) {
                missingFields.push(`질문 ${emptyQuestions.join(', ')}번의 제목`);
            }
        }
        
        // Step 4: Completion Page
        if ((!surveyData.ending.title || surveyData.ending.title.trim() === '') && 
            (!surveyData.ending.description || surveyData.ending.description.trim() === '')) {
            missingFields.push('완료 페이지 제목 또는 설명');
        }
        
        return missingFields;
    }, [surveyData]);

    // Step 검증 상태 업데이트
    useEffect(() => {
        setStepValidation({
            step1: validateStep(1),
            step2: validateStep(2),
            step3: validateStep(3),
            step4: validateStep(4)
        });
    }, [surveyData, validateStep]);

    // 다음 Step으로 이동 (검증 포함)
    const handleNextStep = useCallback(() => {
        if (!validateStep(currentStep)) {
            const missingFields = [];
            
            switch(currentStep) {
                case 1:
                    if (!surveyData.title || surveyData.title.trim() === '') {
                        missingFields.push('설문지 제목');
                    }
                    break;
                case 2:
                    if ((!surveyData.cover.title || surveyData.cover.title.trim() === '') && 
                        (!surveyData.cover.description || surveyData.cover.description.trim() === '')) {
                        missingFields.push('커버 페이지 제목 또는 설명');
                    }
                    break;
                case 3:
                    if (surveyData.questions.length === 0) {
                        missingFields.push('질문 (최소 1개 필요)');
                    } else {
                        const emptyQuestions = surveyData.questions
                            .map((q, idx) => {
                                const questionText = (q.title || q.text || q.content || '').trim();
                                return questionText === '' ? idx + 1 : null;
                            })
                            .filter(idx => idx !== null);
                        if (emptyQuestions.length > 0) {
                            missingFields.push(`질문 ${emptyQuestions.join(', ')}번의 제목`);
                        }
                    }
                    break;
                case 4:
                    if ((!surveyData.ending.title || surveyData.ending.title.trim() === '') && 
                        (!surveyData.ending.description || surveyData.ending.description.trim() === '')) {
                        missingFields.push('완료 페이지 제목 또는 설명');
                    }
                    break;
            }
            
            if (missingFields.length > 0) {
                setError(`다음 필수 항목을 입력해주세요:\n\n${missingFields.map(field => `• ${field}`).join('\n')}`);
            } else {
                setError(`Step ${currentStep}의 필수 항목을 모두 입력해주세요.`);
            }
            return;
        }
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
            setError(null);
        }
    }, [currentStep, validateStep, surveyData]);

    // 이전 Step으로 이동
    const handlePrevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    }, [currentStep]);

    // 폼 데이터 변경 핸들러
    const handleFormChange = useCallback((key, value) => {
        setSurveyData(prev => {
            const updated = {
                ...prev,
                [key]: value
            };
            
            // 설문지 제목이 변경되면 커버 제목이 비어있거나 설문지 제목과 같을 때 자동으로 동일하게 설정
            if (key === 'title') {
                const currentCoverTitle = prev.cover?.title || '';
                // HTML 태그 제거하여 순수 텍스트만 비교
                const getPlainText = (html) => {
                    if (!html) return '';
                    const div = document.createElement('div');
                    div.innerHTML = html;
                    return div.textContent || div.innerText || '';
                };
                const coverTitleText = getPlainText(currentCoverTitle).trim();
                const newTitleText = (value || '').trim();
                
                // 커버 제목이 비어있거나, 커버 제목이 이전 설문지 제목과 같을 때 자동 복사
                if (!coverTitleText || coverTitleText === getPlainText(prev.title || '').trim()) {
                    updated.cover = {
                        ...prev.cover,
                        title: value
                    };
                }
            }
            
            return updated;
        });
    }, []);

    // 브랜딩, 커버, 엔딩 등 중첩 객체 변경 핸들러
    const handleBrandingChange = useCallback((parentKey, childKey, value) => {
        setSurveyData(prev => {
            // 기존 객체를 안전하게 가져오기
            const currentParentData = prev[parentKey] || {};
            
            // 해당 부모 키만 업데이트하고 나머지 데이터는 그대로 유지
            return {
                ...prev,
                questions: prev.questions || [], // 질문 데이터 보호
                [parentKey]: {
                    ...currentParentData,
                    [childKey]: value
                }
            };
        });
        
        // 브랜딩 색상이 변경되면 CSS 변수 업데이트 (Admin 스타일은 제외)
        if (parentKey === 'branding' && childKey === 'primaryColor') {
            const root = document.documentElement;
            const actualColor = typeof value === 'string' && value.startsWith('#') 
                ? value 
                : (typeof value === 'string' && value.includes('var') 
                    ? '#26C6DA'
                    : (value || '#26C6DA'));
            // --brand-primary만 변경 (--primary는 Admin 영역에서 고정값으로 오버라이드됨)
            root.style.setProperty('--brand-primary', actualColor);
            root.style.setProperty('--dynamic-primary-color', actualColor);
        }
    }, []);

    // 이미지 변경 핸들러
    const handleImageChange = useCallback((parentKey, childKey, event) => {
        const base64Value = event.target.value;
        setSurveyData(prev => {
            // 기존 객체를 안전하게 가져오기
            const currentParentData = prev[parentKey] || {};
            
            // 해당 부모 키만 업데이트하고 나머지 데이터는 그대로 유지
            return {
                ...prev,
                questions: prev.questions || [], // 질문 데이터 보호
                [parentKey]: {
                    ...currentParentData,
                    [childKey]: base64Value
                }
            };
        });
    }, []);

    // 질문 관리 핸들러
    const handleQuestionsChange = useCallback((action, payload) => {
        try {
            console.log('[SurveyBuilder] handleQuestionsChange 호출:', { action, payload });
            
            if (action === 'add') {
                // payload.question이 있으면 사용, 없으면 기본값 생성
                let newQuestion;
                if (payload.question) {
                    console.log('[SurveyBuilder] 질문 추가 - payload.question 있음:', payload.question);
                    // 모든 필수 필드 보장
                    // text를 우선 사용, 빈 문자열도 유지 (|| 연산자 대신 명시적 체크)
                    let questionText = '';
                    if (payload.question.text !== undefined && payload.question.text !== null) {
                        questionText = payload.question.text;
                    } else if (payload.question.title !== undefined && payload.question.title !== null) {
                        questionText = payload.question.title;
                    } else if (payload.question.content !== undefined && payload.question.content !== null) {
                        questionText = payload.question.content;
                    }
                    // "새 질문"은 빈 문자열로 변환
                    if (questionText === '새 질문') {
                        questionText = '';
                    }
                    newQuestion = {
                        ...payload.question,
                        id: payload.question.id || Date.now(),
                        type: payload.question.type || 'radio',
                        text: questionText,
                        content: questionText,
                        title: questionText,
                        options: Array.isArray(payload.question.options) 
                            ? payload.question.options.map((opt, idx) => {
                                if (typeof opt === 'string') {
                                    return { id: Date.now() + idx, text: opt };
                                }
                                return {
                                    id: opt.id || Date.now() + idx,
                                    text: opt.text || opt.label || String(opt) || `옵션 ${idx + 1}`,
                                    imageBase64: opt.imageBase64 || opt.image || '',
                                    ...opt
                                };
                            })
                            : [],
                        required: payload.question.required !== undefined ? payload.question.required : false,
                        image: payload.question.image || payload.question.imageBase64 || '',
                        imageBase64: payload.question.imageBase64 || payload.question.image || '',
                        show_image_upload: payload.question.show_image_upload || false,
                        // 척도 관련 필드
                        scaleMin: payload.question.scaleMin ?? 0,
                        scaleMax: payload.question.scaleMax ?? 10,
                        scaleLeftLabel: payload.question.scaleLeftLabel || '',
                        scaleRightLabel: payload.question.scaleRightLabel || '',
                        // 별점 관련 필드
                        starCount: payload.question.starCount ?? 5
                    };
                } else {
                    // 기본 질문 생성 (이 경우는 발생하지 않아야 함)
                    const questionType = payload?.type || 'radio';
                    newQuestion = {
                        id: Date.now(),
                        type: questionType,
                        title: '',
                        text: '',
                        content: '',
                        options: [],
                        required: false,
                        image: '',
                        imageBase64: '',
                        show_image_upload: false,
                        scaleMin: 0,
                        scaleMax: 10,
                        scaleLeftLabel: '',
                        scaleRightLabel: '',
                        starCount: 5
                    };
                }
                
                console.log('[SurveyBuilder] 새 질문 상태 업데이트:', newQuestion);
                console.log('[SurveyBuilder] 현재 질문 수:', surveyData.questions.length);
                
                setSurveyData(prev => {
                    const updated = {
                        ...prev,
                        questions: [...prev.questions, newQuestion]
                    };
                    console.log('[SurveyBuilder] 업데이트된 질문 수:', updated.questions.length);
                    return updated;
                });
                setLastQuestionId(newQuestion.id);
                
                console.log('[SurveyBuilder] 질문 추가 완료');
            } else if (action === 'update') {
                const { questionId, updatedQuestion } = payload;
                if (!questionId) {
                    console.error('[SurveyBuilder] questionId가 없습니다:', payload);
                    return;
                }
                setSurveyData(prev => {
                    const questionExists = prev.questions.some(q => (q.id === questionId) || (q._id === questionId));
                    if (!questionExists) {
                        console.error('[SurveyBuilder] 질문을 찾을 수 없습니다:', questionId, prev.questions);
                        return prev;
                    }
                    return {
                        ...prev,
                        questions: prev.questions.map(q => {
                            if (q.id === questionId || q._id === questionId) {
                                // required 값을 명시적으로 boolean으로 변환하여 저장
                                const merged = { ...q, ...updatedQuestion };
                                if ('required' in updatedQuestion) {
                                    merged.required = Boolean(updatedQuestion.required);
                                }
                                return merged;
                            }
                            return q;
                        })
                    };
                });
            } else if (action === 'delete') {
                setSurveyData(prev => ({
                    ...prev,
                    questions: prev.questions.filter(q => q.id !== payload.questionId)
                }));
            } else if (action === 'reorder') {
                // 드래그앤드롭으로 순서 변경
                setSurveyData(prev => ({
                    ...prev,
                    questions: payload.questions
                }));
            } else if (action === 'duplicate') {
                const question = surveyData.questions.find(q => q.id === payload.questionId);
                if (question) {
                    const newId = Math.max(lastQuestionId, ...surveyData.questions.map(q => q.id || 0)) + 1;
                    const questionText = question.text || question.title || question.content || '질문';
                    const duplicated = {
                        ...question,
                        id: newId,
                        title: questionText + ' (복사본)',
                        text: questionText + ' (복사본)',
                        content: questionText + ' (복사본)',
                        options: (question.options || []).map((opt, idx) => {
                            if (typeof opt === 'string') {
                                return { id: Date.now() + idx, text: opt };
                            }
                            return {
                                ...opt,
                                id: Date.now() + idx + Math.random() * 1000,
                                text: opt.text || opt.label || String(opt) || `옵션 ${idx + 1}`,
                                imageBase64: opt.imageBase64 || opt.image || ''
                            };
                        })
                    };
                    setSurveyData(prev => ({
                        ...prev,
                        questions: [...prev.questions, duplicated]
                    }));
                    setLastQuestionId(newId);
                }
            }
        } catch (error) {
            console.error('[SurveyBuilder] handleQuestionsChange 오류:', error);
            alert('질문 처리 중 오류가 발생했습니다: ' + (error.message || '알 수 없는 오류'));
        }
    }, [surveyData.questions, lastQuestionId]);

    // 개인정보 변경 핸들러
    const handlePersonalInfoChange = useCallback((parentKey, childKey, value) => {
        setSurveyData(prev => {
            // 기존 personalInfo 객체를 안전하게 가져오기
            const currentPersonalInfo = prev[parentKey] || {
                enabled: false,
                fields: [],
                consentText: '',
                consentRequired: false,
                customFields: []
            };
            
            // personalInfo만 업데이트하고 나머지 데이터는 그대로 유지
            return {
                ...prev,
                questions: prev.questions || [], // 질문 데이터 보호
                [parentKey]: {
                    ...currentPersonalInfo,
                    [childKey]: value
                }
            };
        });
    }, []);

    // 설문 최종 저장 (중복 저장 방지)
    const handleSave = async () => {
        // 이미 저장 중이면 무시
        if (loading) {
            return;
        }

        // 모든 Step 검증
        if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
            const missingFields = getMissingFields();
            if (missingFields.length > 0) {
                setError(`다음 필수 항목을 입력해주세요:\n\n${missingFields.map(field => `• ${field}`).join('\n')}`);
            } else {
                setError('모든 필수 항목을 입력해주세요.');
            }
            return;
        }

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        if (!surveyData.title.trim()) {
            setError('설문지 제목을 입력해야 합니다.');
            setLoading(false);
            return;
        }
        if (surveyData.questions.length === 0) {
            setError('최소한 하나의 질문을 추가해야 합니다.');
            setLoading(false);
            return;
        }
        
        const token = localStorage.getItem('token');
        if (!token) {
            setError('로그인이 필요합니다.');
            setLoading(false);
            return;
        }

        try {
            const questions = surveyData.questions.map((q, index) => {
                let questionType = 'TEXT';
                const qType = (q.type || '').toLowerCase();
                let finalOptions = (q.options || []).map(opt => {
                    if (typeof opt === 'string') {
                        return opt;
                    }
                    return opt.text || opt.label || String(opt);
                }).filter(opt => opt && opt.trim());
                
                // 예/아니오는 RADIO로 변환하고 옵션을 ['예', '아니오']로 설정
                if (qType === 'yes_no') {
                    questionType = 'RADIO';
                    if (finalOptions.length === 0) {
                        finalOptions = ['예', '아니오'];
                    }
                } else if (['radio', 'single_choice', 'radio_image', 'image_choice'].includes(qType)) {
                    questionType = 'RADIO';
                } else if (['checkbox', 'multiple_choice', 'checkbox_image'].includes(qType)) {
                    questionType = 'CHECKBOX';
                } else if (qType === 'dropdown') {
                    questionType = 'DROPDOWN';
                } else if (qType === 'star_rating') {
                    questionType = 'STAR_RATING';
                    if (finalOptions.length === 0) {
                        finalOptions = ['1', '2', '3', '4', '5'];
                    }
                } else if (qType === 'scale') {
                    questionType = 'SCALE';
                    if (finalOptions.length === 0) {
                        finalOptions = ['매우 동의', '동의', '보통', '비동의', '매우 비동의'];
                    }
                } else if (qType === 'text') {
                    questionType = 'TEXT';
                } else if (['textarea', 'descriptive'].includes(qType)) {
                    questionType = 'TEXTAREA';
                }

                const questionContent = q.title || q.text || q.content || '';
                
                if (!questionContent.trim()) {
                    throw new Error(`질문 ${index + 1}의 내용이 비어있습니다.`);
                }

                return {
                    content: questionContent.trim(),
                    type: questionType,
                    options: finalOptions,
                    order: index,
                    required: q.required || false
                };
            });

            let normalizedPersonalInfo = { enabled: false };
            if (surveyData.personalInfo && surveyData.personalInfo.enabled) {
                normalizedPersonalInfo = {
                    enabled: true,
                    fields: Array.isArray(surveyData.personalInfo.fields) ? surveyData.personalInfo.fields : [],
                    consentText: surveyData.personalInfo.consentText || '',
                    consentRequired: surveyData.personalInfo.consentRequired || false,
                    customFields: Array.isArray(surveyData.personalInfo.customFields) 
                        ? surveyData.personalInfo.customFields.map(field => ({
                            id: typeof field.id === 'number' ? field.id : Number(field.id) || Date.now(),
                            label: String(field.label || ''),
                            type: String(field.type || 'text'),
                            required: Boolean(field.required)
                        }))
                        : []
                };
            }

            const payload = {
                title: surveyData.title.trim(),
                description: surveyData.description?.trim() || '',
                questions: questions,
                personalInfo: normalizedPersonalInfo,
                branding: surveyData.branding || {},
                cover: surveyData.cover || {},
                ending: surveyData.ending || {},
                head: surveyData.head || {},
                foot: surveyData.foot || {},
                status: surveyData.status || 'inactive',
                startAt: surveyData.startAt || null,
                endAt: surveyData.endAt || null,
                isPublic: surveyData.isPublic !== undefined ? surveyData.isPublic : true,
                password: surveyData.password && surveyData.password !== 'temp' ? surveyData.password : ''
            };

            // 디버깅: 전송할 데이터 로그
            console.log('[SurveyBuilder] 전송할 데이터:', {
                title: payload.title,
                questionsCount: payload.questions.length,
                questions: payload.questions.map(q => ({ type: q.type, content: q.content.substring(0, 20) + '...' }))
            });

            let response;
            if (id) {
                response = await axiosInstance.put(`/surveys/${id}`, payload);
            } else {
                response = await axiosInstance.post('/surveys', payload);
            }

            if (!response.data.success) {
                throw new Error(response.data.message || '저장에 실패했습니다.');
            }

            const savedId = response.data.data?._id || response.data.data?.id || id;
            
            setSuccessMessage('✅ 설문지가 성공적으로 저장되었습니다!');
            
            if (savedId && !id) {
                setSurveyData(prev => ({ ...prev, id: savedId }));
            }
            
            setTimeout(() => {
                navigate('/admin', { replace: true });
            }, 1500);

        } catch (err) {
            console.error('========== 저장 실패 ==========');
            console.error('에러 객체:', err);
            console.error('에러 응답:', err.response?.data);
            console.error('에러 상태:', err.response?.status);
            console.error('요청 URL:', err.config?.url);
            console.error('요청 메서드:', err.config?.method);
            
            // payload가 정의되어 있는 경우에만 로그 출력
            try {
                const requestData = err.config?.data ? JSON.parse(err.config.data) : null;
                if (requestData) {
                    console.error('요청 데이터:', JSON.stringify(requestData, null, 2));
                    console.error('질문 데이터:', JSON.stringify(requestData.questions, null, 2));
                }
            } catch (parseErr) {
                console.error('요청 데이터 파싱 실패:', parseErr);
            }
            
            console.error('================================');
            
            let errorMessage = '알 수 없는 오류로 저장에 실패했습니다.';
            
            if (err.response?.data) {
                const responseData = err.response.data;
                errorMessage = responseData.message || responseData.error || errorMessage;
                
                if (responseData.error) {
                    errorMessage += `\n상세: ${responseData.error}`;
                }
                
                // Mongoose validation 에러 처리
                if (responseData.errors) {
                    const validationErrors = Object.values(responseData.errors)
                        .map((e) => {
                            if (e && typeof e === 'object' && e.message) {
                                return e.message;
                            }
                            return String(e);
                        })
                        .join(', ');
                    errorMessage += `\n검증 오류: ${validationErrors}`;
                }
                
                // 전체 응답 데이터를 콘솔에 출력
                console.error('전체 에러 응답:', JSON.stringify(responseData, null, 2));
            } else if (err.message) {
                errorMessage = err.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (loadingSurvey) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mb-4"></div>
                    <p className="text-gray-600 font-medium">설문 데이터를 불러오는 중...</p>
                    <p className="text-sm text-gray-400 mt-2">잠시만 기다려주세요</p>
                </div>
            </div>
        );
    }

    // 탭과 Step 매핑
    const tabToStep = {
        'style': 1,
        'cover': 2,
        'questions': 3,
        'ending': 4,
        'publishing': 4
    };

    const stepToTab = {
        1: 'style',
        2: 'cover',
        3: 'questions',
        4: 'ending'
    };

    // 탭 변경 핸들러
    const handleTabChange = (tab) => {
        setCurrentTab(tab);
        if (tabToStep[tab]) {
            const step = tabToStep[tab];
            if (step <= currentStep || validateStep(step - 1)) {
                setCurrentStep(step);
                setError(null);
            }
        }
    };

    // QR 코드 PNG 다운로드
    const downloadQRCodePNG = (url) => {
        if (!url) {
            alert('설문 링크가 없습니다. 먼저 설문을 저장해주세요.');
            return;
        }

        // QR코드 생성 API 사용 (무료 서비스)
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
        
        // 이미지를 다운로드하기 위해 임시 링크 생성
        fetch(qrCodeUrl)
            .then(response => response.blob())
            .then(blob => {
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `survey-qrcode-${surveyData.id || 'new'}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            })
            .catch(error => {
                console.error('QR코드 다운로드 실패:', error);
                alert('QR코드 다운로드에 실패했습니다.');
            });
    };

    // QR 코드 SVG 다운로드
    const downloadQRCodeSVG = (url) => {
        if (!url) {
            alert('설문 링크가 없습니다. 먼저 설문을 저장해주세요.');
            return;
        }

        // QR코드 SVG 생성 API 사용
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&format=svg&data=${encodeURIComponent(url)}`;
        
        // SVG를 다운로드하기 위해 임시 링크 생성
        fetch(qrCodeUrl)
            .then(response => response.text())
            .then(svgText => {
                const blob = new Blob([svgText], { type: 'image/svg+xml' });
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = `survey-qrcode-${surveyData.id || 'new'}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            })
            .catch(error => {
                console.error('QR코드 SVG 다운로드 실패:', error);
                alert('QR코드 SVG 다운로드에 실패했습니다.');
            });
    };

    // QR 코드 생성 (간단한 mock - 미리보기용)
    const generateQRCode = (url) => {
        if (!url) return '';
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
    };

    // 결과 공유 토큰 생성
    const handleGenerateShareToken = async () => {
        if (!surveyData.id) {
            alert('⚠️ 설문을 먼저 저장(생성)해야 공유 링크를 생성할 수 있습니다.');
            return;
        }

        try {
            setGeneratingShareToken(true);
            const response = await axiosInstance.post(`/surveys/${surveyData.id}/share-token`);
            
            if (response.data.success && response.data.data) {
                const shareUrl = `${window.location.origin}/results/${surveyData.id}/shared/${response.data.data.shareToken}`;
                setResultsShareUrl(shareUrl);
                alert('✅ 결과 공유 링크가 생성되었습니다.');
            } else {
                throw new Error(response.data.message || '공유 토큰 생성에 실패했습니다.');
            }
        } catch (err) {
            console.error('공유 토큰 생성 오류:', err);
            alert('⚠️ 공유 토큰 생성에 실패했습니다: ' + (err.response?.data?.message || err.message));
        } finally {
            setGeneratingShareToken(false);
        }
    };

    const surveyUrl = surveyData.id 
        ? `${window.location.origin}/s/${surveyData.id}` 
        : '';
    const qrPageUrl = surveyData.id 
        ? `${window.location.origin}/qr/${surveyData.id}` 
        : '';

    return (
        <div className="h-full bg-gray-50 flex overflow-hidden" style={{ height: '100%', maxHeight: '100%', overflow: 'hidden' }}>
            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full" style={{ height: '100%', maxHeight: '100%' }}>
                {/* 상단 헤더 */}
                <header className="flex-shrink-0 sticky top-0 z-20 bg-white" style={{ backgroundColor: 'white', border: 'none', boxShadow: 'none' }}>
                    {/* 상단 바 - 탭과 저장 버튼 같은 라인 */}
                    <div className="px-6 py-4 bg-white border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            {/* 탭 네비게이션 */}
                            <div className="flex items-center gap-6">
                            {[
                                { id: 'style', label: '스타일' },
                                { id: 'cover', label: '커버' },
                                { id: 'questions', label: '문제' },
                                { id: 'ending', label: '엔딩' },
                                { id: 'publishing', label: '퍼블리싱' }
                            ].map(tab => {
                                const isActive = currentTab === tab.id;
                                // Admin 메뉴는 고정 색상 사용 (브랜드 컬러와 독립적으로 운영)
                                const adminMenuColor = '#26C6DA'; // 고정 admin 색상
                                
                                return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabChange(tab.id)}
                                    className={`pb-3 px-2 font-medium text-sm transition-colors relative border-0 outline-none ${
                                        isActive
                                            ? 'font-semibold'
                                            : 'text-text-sub hover:text-text-main'
                                    }`}
                                    style={isActive ? {
                                        color: adminMenuColor,
                                        border: 'none',
                                        outline: 'none',
                                        boxShadow: 'none',
                                    } : {
                                        border: 'none',
                                        outline: 'none',
                                        boxShadow: 'none',
                                    }}
                                    aria-current={isActive ? 'page' : undefined}
                                    onFocus={(e) => {
                                        e.currentTarget.style.outline = 'none';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    {tab.label}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                            style={{
                                                backgroundColor: adminMenuColor,
                                            }}
                                        />
                                    )}
                                </button>
                                );
                            })}
                            </div>

                            {/* 우측 액션 영역 */}
                            <div className="flex items-center gap-3">
                                {/* 저장 버튼 */}
                                <button 
                                    type="button"
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="px-4 py-2.5 bg-[#26C6DA] text-white rounded-lg font-medium text-sm hover:bg-[#20B5C8] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                                >
                                    {loading ? (
                                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                    ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    저장
                                </button>

                                {/* 링크 및 공유 영역 */}
                                {surveyData.id && (
                                    <div className="flex items-center gap-2 pl-3 border-l border-gray-200">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                            <span className="text-xs text-text-main font-mono max-w-[200px] truncate">{surveyUrl || '저장 후 표시됩니다'}</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => {
                                                if (surveyUrl) {
                                                    navigator.clipboard.writeText(surveyUrl);
                                                    alert('링크가 복사되었습니다');
                                                }
                                            }}
                                            className="px-3 py-2 bg-white border border-gray-300 text-text-main rounded-lg hover:bg-gray-50 transition-colors text-xs font-medium"
                                        >
                                            복사
                                        </button>
                                        <div className="relative group">
                                            <button 
                                                type="button"
                                                onClick={() => downloadQRCodePNG(surveyUrl)}
                                                className="px-3 py-2 bg-white border border-gray-300 text-text-main rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5 text-xs font-medium"
                                            >
                                                QR코드
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                            {/* 드롭다운 메뉴 */}
                                            <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                                <button
                                                    type="button"
                                                    onClick={() => downloadQRCodePNG(surveyUrl)}
                                                    className="w-full px-3 py-2 text-left text-xs text-text-main hover:bg-gray-50 flex items-center gap-2 rounded-t-lg"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    PNG 다운로드
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => downloadQRCodeSVG(surveyUrl)}
                                                    className="w-full px-3 py-2 text-left text-xs text-text-main hover:bg-gray-50 flex items-center gap-2 rounded-b-lg"
                                                >
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                    </svg>
                                                    SVG 다운로드
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* 상태 메시지 영역 (고정) */}
                <div className="flex-shrink-0">
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mx-4 mt-3 mb-2"
                        >
                            <div className="bg-white border-2 border-red-200 rounded-lg shadow-md overflow-hidden">
                                {/* 헤더 */}
                                <div className="bg-gradient-to-r from-red-50 to-red-100 px-4 py-3 border-b border-red-200">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-red-900">필수 항목을 확인해주세요</h3>
                                            <p className="text-xs text-red-700 mt-0.5">다음 항목을 입력하시면 계속 진행할 수 있습니다</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 항목 리스트 */}
                                <div className="px-4 py-3">
                                    <div className="space-y-2">
                                        {error.split('\n').filter(line => line.trim() && line.includes('•')).map((line, idx) => {
                                            const item = line.replace('•', '').trim();
                                            return (
                                                <div key={idx} className="flex items-start gap-2.5 group">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                                                    </div>
                                                    <span className="text-sm text-gray-800 leading-relaxed group-hover:text-red-700 transition-colors">
                                                        {item}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                        {!error.includes('•') && (
                                            <div className="flex items-start gap-2.5">
                                                <div className="flex-shrink-0 mt-0.5">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5"></div>
                                                </div>
                                                <span className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                                                    {error}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* 닫기 버튼 */}
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={() => setError(null)}
                                        className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {successMessage && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mx-4 mt-3 mb-2"
                        >
                            <div className="bg-white border-2 border-green-200 rounded-lg shadow-md overflow-hidden">
                                {/* 헤더 */}
                                <div className="bg-gradient-to-r from-green-50 to-green-100 px-4 py-3 border-b border-green-200">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-base font-semibold text-green-900">성공</h3>
                                            <p className="text-xs text-green-700 mt-0.5">작업이 완료되었습니다</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 메시지 */}
                                <div className="px-4 py-3">
                                    <p className="text-sm text-gray-800 leading-relaxed">
                                        {successMessage}
                                    </p>
                                </div>
                                
                                {/* 닫기 버튼 */}
                                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex justify-end">
                                    <button
                                        onClick={() => setSuccessMessage(null)}
                                        className="text-xs text-gray-600 hover:text-gray-900 font-medium transition-colors"
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* 메인 콘텐츠 영역 - 좌우 분할 */}
                <div className="flex-1 flex gap-3 p-2 overflow-hidden" style={{ minHeight: 0, maxHeight: '100%', height: '100%' }}>
                    {/* 왼쪽: 편집 영역 (스크롤 가능) */}
                    <div className="flex-1 overflow-x-hidden pr-1 overflow-y-auto" style={{ height: '100%', minHeight: 0 }}>
                        <div className="max-w-3xl">
                            {currentTab === 'style' && (
                                <Step1_Settings
                                    form={surveyData}
                                    handleFormChange={handleFormChange}
                                    onBrandingChange={handleBrandingChange}
                                    onImageChange={handleImageChange}
                                />
                            )}

                            {currentTab === 'cover' && (
                                <Step2_Cover
                                    cover={surveyData.cover}
                                    onCoverChange={handleBrandingChange}
                                    onImageChange={handleImageChange}
                                    branding={surveyData.branding}
                                    survey={surveyData}
                                    onBrandingChange={handleBrandingChange}
                                />
                            )}

                            {currentTab === 'questions' && (
                                <Step3_Questions
                                    questions={surveyData.questions}
                                    lastQuestionId={lastQuestionId}
                                    personalInfo={surveyData.personalInfo}
                                    onQuestionsChange={handleQuestionsChange}
                                    onPersonalInfoChange={handlePersonalInfoChange}
                                    onImageChange={handleImageChange}
                                    branding={surveyData.branding}
                                    onBrandingChange={handleBrandingChange}
                                />
                            )}

                            {currentTab === 'ending' && (
                                <Step4_Ending
                                    ending={surveyData.ending}
                                    onEndingChange={handleBrandingChange}
                                    onImageChange={handleImageChange}
                                />
                            )}

                            {currentTab === 'publishing' && (
                                <div className="space-y-4">
                                    {/* 설문 진행 상태 */}
                                    <div className="bg-white rounded-xl shadow-md p-4">
                                        <h3 className="text-lg font-bold text-text-main mb-4">설문 진행 상태</h3>
                                        
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { value: 'inactive', label: '비활성화', icon: XCircleIcon, color: 'gray' },
                                                { value: 'active', label: '바로 진행', icon: PlayIcon, color: 'green' },
                                                { value: 'scheduled', label: '예약 진행', icon: CalendarIcon, color: 'blue' },
                                                { value: 'paused', label: '일시 정지', icon: PauseIcon, color: 'orange' },
                                            ].map((option) => {
                                                const Icon = option.icon;
                                                const isSelected = surveyData.status === option.value;
                                                
                                                const colorClasses = {
                                                    gray: {
                                                        border: isSelected ? 'border-border' : 'border-border',
                                                        bg: isSelected ? 'bg-bg' : 'bg-white',
                                                        icon: 'text-text-sub',
                                                        text: isSelected ? 'text-text-main' : 'text-text-sub',
                                                    },
                                                    green: {
                                                        border: isSelected ? 'border-success' : 'border-border',
                                                        bg: isSelected ? 'bg-success/10' : 'bg-white',
                                                        icon: 'text-success',
                                                        text: isSelected ? 'text-text-main' : 'text-text-sub',
                                                    },
                                                    blue: {
                                                        border: isSelected ? 'border-blue-500' : 'border-border',
                                                        bg: isSelected ? 'bg-blue-100' : 'bg-white',
                                                        icon: 'text-blue-600',
                                                        text: isSelected ? 'text-text-main' : 'text-text-sub',
                                                    },
                                                    orange: {
                                                        border: isSelected ? 'border-secondary' : 'border-border',
                                                        bg: isSelected ? 'bg-secondary/10' : 'bg-white',
                                                        icon: 'text-secondary',
                                                        text: isSelected ? 'text-text-main' : 'text-text-sub',
                                                    }
                                                };
                                                
                                                const styles = colorClasses[option.color] || colorClasses.gray;
                                                
                                                return (
                                                    <button
                                                        key={option.value}
                                                        type="button"
                                                        onClick={() => {
                                                            console.log('[SurveyBuilder] 설문 진행 상태 변경:', option.value);
                                                            setSurveyData(prev => ({
                                                                ...prev,
                                                                status: option.value
                                                            }));
                                                        }}
                                                        className={`
                                                            relative px-4 py-2 rounded-lg border transition-all duration-200
                                                            ${styles.border} ${styles.bg}
                                                            ${isSelected ? 'shadow-sm' : 'hover:border-gray-300'}
                                                            flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                                                        `}
                                                    >
                                                        <Icon className={`w-4 h-4 ${styles.icon}`} />
                                                        <span className={`font-medium text-sm ${styles.text}`}>
                                                            {option.label}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* 시간 설정 섹션 */}
                                        {(surveyData.status === 'active' || surveyData.status === 'scheduled') && (
                                            <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                                {surveyData.status === 'scheduled' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-text-sub mb-2">
                                                            시작 일시
                                                        </label>
                                                        <div className="flex gap-3 items-end">
                                                            <input
                                                                type="date"
                                                                value={surveyData.startAt ? new Date(surveyData.startAt).toISOString().split('T')[0] : ''}
                                                                onChange={(e) => {
                                                                    const dateValue = e.target.value;
                                                                    if (dateValue) {
                                                                        const existingTime = surveyData.startAt ? new Date(surveyData.startAt) : new Date();
                                                                        const [year, month, day] = dateValue.split('-');
                                                                        const newDate = new Date(year, month - 1, day, existingTime.getHours(), existingTime.getMinutes());
                                                                        setSurveyData(prev => ({
                                                                            ...prev,
                                                                            startAt: newDate.toISOString()
                                                                        }));
                                                                    } else {
                                                                        setSurveyData(prev => ({
                                                                            ...prev,
                                                                            startAt: null
                                                                        }));
                                                                    }
                                                                }}
                                                                className="flex-1 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-offset-0 date-input-branded"
                                                                style={{
                                                                    border: `2px solid ${surveyData.branding?.primaryColor || '#D1D5DB'}`,
                                                                    outline: 'none',
                                                                    accentColor: surveyData.branding?.primaryColor || '#26C6DA',
                                                                    '--brand-color': surveyData.branding?.primaryColor || '#26C6DA'
                                                                }}
                                                                onFocus={(e) => {
                                                                    e.target.style.borderColor = surveyData.branding?.primaryColor || '#26C6DA';
                                                                    e.target.style.boxShadow = `0 0 0 2px ${surveyData.branding?.primaryColor || '#26C6DA'}40`;
                                                                }}
                                                                onBlur={(e) => {
                                                                    e.target.style.borderColor = surveyData.branding?.primaryColor || '#D1D5DB';
                                                                    e.target.style.boxShadow = 'none';
                                                                }}
                                                            />
                                                            <TimePicker
                                                                value={surveyData.startAt || new Date().toISOString()}
                                                                onChange={(e) => {
                                                                    const timeValue = e.target.value;
                                                                    if (timeValue && surveyData.startAt) {
                                                                        const existingDate = new Date(surveyData.startAt);
                                                                        const [datePart, timePart] = timeValue.split('T');
                                                                        const [hours, minutes] = timePart.split(':');
                                                                        existingDate.setHours(parseInt(hours), parseInt(minutes));
                                                                        setSurveyData(prev => ({
                                                                            ...prev,
                                                                            startAt: existingDate.toISOString()
                                                                        }));
                                                                    } else if (timeValue && !surveyData.startAt) {
                                                                        // 날짜가 없으면 오늘 날짜 사용
                                                                        const today = new Date();
                                                                        const [datePart, timePart] = timeValue.split('T');
                                                                        const [hours, minutes] = timePart.split(':');
                                                                        today.setHours(parseInt(hours), parseInt(minutes));
                                                                        setSurveyData(prev => ({
                                                                            ...prev,
                                                                            startAt: today.toISOString()
                                                                        }));
                                                                    }
                                                                }}
                                                                primaryColor={surveyData.branding?.primaryColor || '#26C6DA'}
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-text-sub mb-2">
                                                        종료 일시
                                                    </label>
                                                    <div className="flex gap-3 items-end">
                                                        <input
                                                            type="date"
                                                            value={surveyData.endAt ? new Date(surveyData.endAt).toISOString().split('T')[0] : ''}
                                                            onChange={(e) => {
                                                                const dateValue = e.target.value;
                                                                if (dateValue) {
                                                                    const existingTime = surveyData.endAt ? new Date(surveyData.endAt) : new Date();
                                                                    const [year, month, day] = dateValue.split('-');
                                                                    const newDate = new Date(year, month - 1, day, existingTime.getHours(), existingTime.getMinutes());
                                                                    setSurveyData(prev => ({
                                                                        ...prev,
                                                                        endAt: newDate.toISOString()
                                                                    }));
                                                                } else {
                                                                    setSurveyData(prev => ({
                                                                        ...prev,
                                                                        endAt: null
                                                                    }));
                                                                }
                                                            }}
                                                            className="flex-1 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-offset-0"
                                                            style={{
                                                                border: `2px solid ${surveyData.branding?.primaryColor || '#D1D5DB'}`,
                                                                outline: 'none',
                                                                accentColor: surveyData.branding?.primaryColor || '#26C6DA'
                                                            }}
                                                            onFocus={(e) => {
                                                                e.target.style.borderColor = surveyData.branding?.primaryColor || '#26C6DA';
                                                                e.target.style.boxShadow = `0 0 0 2px ${surveyData.branding?.primaryColor || '#26C6DA'}40`;
                                                            }}
                                                            onBlur={(e) => {
                                                                e.target.style.borderColor = surveyData.branding?.primaryColor || '#D1D5DB';
                                                                e.target.style.boxShadow = 'none';
                                                            }}
                                                        />
                                                        <TimePicker
                                                            value={surveyData.endAt || new Date().toISOString()}
                                                            onChange={(e) => {
                                                                const timeValue = e.target.value;
                                                                if (timeValue && surveyData.endAt) {
                                                                    const existingDate = new Date(surveyData.endAt);
                                                                    const [datePart, timePart] = timeValue.split('T');
                                                                    const [hours, minutes] = timePart.split(':');
                                                                    existingDate.setHours(parseInt(hours), parseInt(minutes));
                                                                    setSurveyData(prev => ({
                                                                        ...prev,
                                                                        endAt: existingDate.toISOString()
                                                                    }));
                                                                } else if (timeValue && !surveyData.endAt) {
                                                                    // 날짜가 없으면 오늘 날짜 사용
                                                                    const today = new Date();
                                                                    const [datePart, timePart] = timeValue.split('T');
                                                                    const [hours, minutes] = timePart.split(':');
                                                                    today.setHours(parseInt(hours), parseInt(minutes));
                                                                    setSurveyData(prev => ({
                                                                        ...prev,
                                                                        endAt: today.toISOString()
                                                                    }));
                                                                }
                                                            }}
                                                            primaryColor={surveyData.branding?.primaryColor || '#26C6DA'}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* 링크 공유 및 QR 코드 */}
                                    <div className="bg-white rounded-xl shadow-md p-4">
                                        <h3 className="text-lg font-bold text-text-main mb-4">링크 공유 및 QR 코드</h3>
                                        
                                        <div className="space-y-4">
                                            {/* 설문 URL 섹션 */}
                                            <div className="space-y-3">
                                                <label htmlFor="surveyUrl" className="block text-sm font-medium text-text-sub mb-2">
                                                    설문 참여 URL
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        id="surveyUrl"
                                                        value={surveyUrl || `http://localhost:5173/surveys/${surveyData.id || 'new'}`}
                                                        readOnly
                                                        className="flex-1 border border-border rounded-l-lg px-4 py-3 bg-bg text-text-sub truncate"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            const url = surveyUrl || (surveyData.id ? `${window.location.origin}/s/${surveyData.id}` : '');
                                                            if (surveyData.id && url) {
                                                                try {
                                                                    await navigator.clipboard.writeText(url);
                                                                    alert('✅ 설문 링크가 클립보드에 복사되었습니다.');
                                                                } catch (err) {
                                                                    console.error('클립보드 복사 실패:', err);
                                                                    // Fallback: 텍스트 선택 방식
                                                                    const input = document.getElementById('surveyUrl');
                                                                    if (input) {
                                                                        input.select();
                                                                        document.execCommand('copy');
                                                                        alert('✅ 설문 링크가 클립보드에 복사되었습니다.');
                                                                    } else {
                                                                        alert('⚠️ 클립보드 복사에 실패했습니다.');
                                                                    }
                                                                }
                                                            } else {
                                                                alert('⚠️ 설문을 먼저 저장(생성)해야 공유 링크를 복사할 수 있습니다.');
                                                            }
                                                        }}
                                                        style={{
                                                            backgroundColor: surveyData.id ? '#26C6DA' : '#9CA3AF', // 고정 admin 색상
                                                            color: '#FFFFFF'
                                                        }}
                                                        className="px-6 py-3 font-medium rounded-r-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                                        disabled={!surveyData.id}
                                                    >
                                                        복사
                                                    </button>
                                                </div>
                                                <p className="text-sm text-text-sub mt-2">
                                                    {surveyData.id ? '이 링크를 복사하여 응답자에게 공유하세요.' : '설문을 저장(생성)해야 URL이 확정됩니다.'}
                                                </p>
                                            </div>

                                            {/* QR 코드 페이지 URL 섹션 */}
                                            <div className="space-y-3">
                                                <label htmlFor="qrPageUrl" className="block text-sm font-medium text-text-sub mb-2">
                                                    QR 코드 페이지 URL (행사용)
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        id="qrPageUrl"
                                                        value={qrPageUrl || `http://localhost:5173/qr/${surveyData.id || 'new'}`}
                                                        readOnly
                                                        className="flex-1 border border-border rounded-l-lg px-4 py-3 bg-bg text-text-sub truncate"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={async () => {
                                                            if (surveyData.id && qrPageUrl) {
                                                                try {
                                                                    await navigator.clipboard.writeText(qrPageUrl);
                                                                    alert('✅ QR 코드 페이지 링크가 클립보드에 복사되었습니다.');
                                                                } catch (err) {
                                                                    console.error('클립보드 복사 실패:', err);
                                                                    const input = document.getElementById('qrPageUrl');
                                                                    if (input) {
                                                                        input.select();
                                                                        document.execCommand('copy');
                                                                        alert('✅ QR 코드 페이지 링크가 클립보드에 복사되었습니다.');
                                                                    } else {
                                                                        alert('⚠️ 클립보드 복사에 실패했습니다.');
                                                                    }
                                                                }
                                                            } else {
                                                                alert('⚠️ 설문을 먼저 저장(생성)해야 QR 코드 페이지 링크를 복사할 수 있습니다.');
                                                            }
                                                        }}
                                                        style={{
                                                            backgroundColor: surveyData.id ? '#26C6DA' : '#9CA3AF', // 고정 admin 색상
                                                            color: '#FFFFFF'
                                                        }}
                                                        className="px-6 py-3 font-medium rounded-r-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                                        disabled={!surveyData.id}
                                                    >
                                                        복사
                                                    </button>
                                                </div>
                                                <p className="text-sm text-text-sub mt-2">
                                                    {surveyData.id ? '행사에서 QR 코드만 표시하는 페이지입니다. 프로젝터나 디스플레이에 표시하여 사용하세요.' : '설문을 저장(생성)해야 URL이 확정됩니다.'}
                                                </p>
                                            </div>

                                            {/* 결과 공유 링크 섹션 */}
                                            <div className="space-y-3">
                                                <label htmlFor="resultsShareUrl" className="block text-sm font-medium text-text-sub mb-2">
                                                    결과 공유 링크 (인증 불필요)
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        id="resultsShareUrl"
                                                        value={resultsShareUrl || ''}
                                                        readOnly
                                                        placeholder={surveyData.id ? '공유 링크 생성 버튼을 클릭하세요' : '설문을 저장(생성)해야 공유 링크를 생성할 수 있습니다.'}
                                                        className="flex-1 border border-border rounded-l-lg px-4 py-3 bg-bg text-text-sub truncate"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleGenerateShareToken}
                                                        disabled={!surveyData.id || generatingShareToken}
                                                        style={{
                                                            backgroundColor: (surveyData.id && !generatingShareToken) ? '#26C6DA' : '#9CA3AF', // 고정 admin 색상
                                                            color: '#FFFFFF'
                                                        }}
                                                        className="px-6 py-3 font-medium rounded-r-lg hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                                                    >
                                                        {generatingShareToken ? '생성 중...' : '링크 생성'}
                                                    </button>
                                                </div>
                                                {resultsShareUrl && (
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                try {
                                                                    await navigator.clipboard.writeText(resultsShareUrl);
                                                                    alert('✅ 결과 공유 링크가 클립보드에 복사되었습니다.');
                                                                } catch (err) {
                                                                    const input = document.getElementById('resultsShareUrl');
                                                                    if (input) {
                                                                        input.select();
                                                                        document.execCommand('copy');
                                                                        alert('✅ 결과 공유 링크가 클립보드에 복사되었습니다.');
                                                                    }
                                                                }
                                                            }}
                                                            style={{
                                                                backgroundColor: '#26C6DA',
                                                                color: '#FFFFFF'
                                                            }}
                                                            className="px-4 py-2 font-medium rounded-lg hover:opacity-90 transition shadow-sm hover:shadow-md text-sm"
                                                        >
                                                            복사
                                                        </button>
                                                    </div>
                                                )}
                                                <p className="text-sm text-text-sub mt-2">
                                                    {surveyData.id 
                                                        ? '이 링크를 통해 다른 사람이 인증 없이 설문 결과를 확인하고 데이터를 다운로드할 수 있습니다.' 
                                                        : '설문을 저장(생성)해야 공유 링크를 생성할 수 있습니다.'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 공개 설정 */}
                                    <div className="bg-white rounded-xl shadow-md p-4">
                                        <h3 className="text-lg font-bold text-text-main mb-4">공개 설정</h3>
                                        
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <label className="text-sm font-medium text-text-sub">
                                                        공개 설문
                                                    </label>
                                                    <p className="text-xs text-text-sub mt-1">
                                                        누구나 링크를 통해 설문에 참여할 수 있습니다
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newData = { ...surveyData, isPublic: !surveyData.isPublic };
                                                        setSurveyData(newData);
                                                    }}
                                                    aria-label="공개 설문"
                                                    aria-checked={surveyData.isPublic || false}
                                                    role="switch"
                                                    className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                    style={{
                                                        padding: '2px',
                                                        backgroundColor: surveyData.isPublic ? '#26C6DA' : '#D1D5DB'
                                                    }}
                                                >
                                                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                                                        surveyData.isPublic ? 'translate-x-6' : 'translate-x-0'
                                                    }`} />
                                                </button>
                                            </div>
                                            
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <label className="text-sm font-medium text-text-sub">
                                                        비밀번호 보호
                                                    </label>
                                                    <p className="text-xs text-text-sub mt-1">
                                                        비밀번호를 입력한 사용자만 설문에 참여할 수 있습니다
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newData = { 
                                                            ...surveyData, 
                                                            password: surveyData.password ? '' : 'temp'
                                                        };
                                                        setSurveyData(newData);
                                                    }}
                                                    aria-label="비밀번호 보호"
                                                    aria-checked={!!surveyData.password}
                                                    role="switch"
                                                    className="relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                                                    style={{
                                                        padding: '2px',
                                                        backgroundColor: surveyData.password ? '#26C6DA' : '#D1D5DB'
                                                    }}
                                                >
                                                    <span className={`inline-block h-4 w-4 rounded-full bg-white transition-all shadow-sm ${
                                                        surveyData.password ? 'translate-x-6' : 'translate-x-0'
                                                    }`} />
                                                </button>
                                            </div>

                                            {/* 비밀번호 입력 필드 */}
                                            {surveyData.password !== undefined && (
                                                <div className={`mt-4 pt-4 border-t border-border transition-all ${
                                                    surveyData.password ? 'opacity-100' : 'opacity-50 pointer-events-none'
                                                }`}>
                                                    <label htmlFor="surveyPassword" className="block text-sm font-medium text-text-sub mb-2">
                                                        설문 비밀번호
                                                    </label>
                                                    <input
                                                        type="password"
                                                        id="surveyPassword"
                                                        value={surveyData.password === 'temp' ? '' : (surveyData.password || '')}
                                                        onChange={(e) => {
                                                            const newData = { ...surveyData, password: e.target.value || 'temp' };
                                                            setSurveyData(newData);
                                                        }}
                                                        placeholder="비밀번호를 입력하세요"
                                                        disabled={!surveyData.password}
                                                        className="w-full border border-border rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    />
                                                    <p className="text-xs text-text-sub mt-1.5">
                                                        {surveyData.password && surveyData.password !== 'temp'
                                                            ? '비밀번호가 설정되었습니다. 설문 참여 시 이 비밀번호를 입력해야 합니다.' 
                                                            : '비밀번호 보호를 활성화하면 비밀번호 입력 필드가 나타납니다.'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* 저장 및 공유 */}
                                    <div className="bg-white rounded-xl shadow-md p-4">
                                        <h3 className="text-lg font-bold text-text-main mb-4">저장 및 공유</h3>
                                        
                                        <div className="space-y-4">
                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                disabled={loading}
                                                style={{
                                                    backgroundColor: loading ? '#9CA3AF' : '#26C6DA', // 고정 admin 색상
                                                    color: '#FFFFFF'
                                                }}
                                                className="w-full px-6 py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                                        저장 중...
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                        설문 저장
                                                    </>
                                                )}
                                            </button>
                                            
                                            {surveyData.id && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => window.open(surveyUrl, '_blank')}
                                                        className="px-4 py-2 bg-bg border border-border rounded-lg hover:bg-primary/10 hover:border-primary transition text-sm text-text-sub font-medium"
                                                    >
                                                        미리보기
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/admin/results/${surveyData.id}`)}
                                                        className="px-4 py-2 bg-bg border border-border rounded-lg hover:bg-primary/10 hover:border-primary transition text-sm text-text-sub font-medium"
                                                    >
                                                        결과 보기
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 오른쪽: 모바일 프리뷰 (고정) */}
                    <div className="w-[391px] flex-shrink-0">
                        <div className="sticky top-0">
                            <MobilePreview
                                surveyData={surveyData}
                                currentTab={currentTab}
                                currentQuestionIndex={previewQuestionIndex}
                                surveyUrl={surveyUrl}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyBuilder;
