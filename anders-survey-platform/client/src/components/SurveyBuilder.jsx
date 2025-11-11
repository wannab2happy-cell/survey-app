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
        buttonShape: 'rounded-lg',
        logoBase64: '',
        bgImageBase64: ''
    },
    cover: {
        title: '',
        description: '',
        imageBase64: '',
        logoBase64: '',
        showParticipantCount: false
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
                        
                        return {
                            id: Date.now() + index,
                            type: questionType,
                            title: q.content || '',
                            text: q.content || '',
                            content: q.content || '',
                            options: convertedOptions,
                            required: q.required || false,
                            image: '',
                            show_image_upload: false
                        };
                    });
                    
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
                            bgImageBase64: ''
                        },
                        cover: {
                            title: loadedSurvey.cover?.title || '',
                            description: loadedSurvey.cover?.description || '',
                            imageBase64: loadedSurvey.cover?.imageBase64 || '',
                            logoBase64: loadedSurvey.cover?.logoBase64 || '',
                            showParticipantCount: loadedSurvey.cover?.showParticipantCount || false
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
            setError(`Step ${currentStep}의 필수 항목을 모두 입력해주세요.`);
            return;
        }
        if (currentStep < 4) {
            setCurrentStep(currentStep + 1);
            setError(null);
        }
    }, [currentStep, validateStep]);

    // 이전 Step으로 이동
    const handlePrevStep = useCallback(() => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            setError(null);
        }
    }, [currentStep]);

    // 폼 데이터 변경 핸들러
    const handleFormChange = useCallback((key, value) => {
        setSurveyData(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    // 브랜딩, 커버, 엔딩 등 중첩 객체 변경 핸들러
    const handleBrandingChange = useCallback((parentKey, childKey, value) => {
        setSurveyData(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                [childKey]: value
            }
        }));
    }, []);

    // 이미지 변경 핸들러
    const handleImageChange = useCallback((parentKey, childKey, event) => {
        const base64Value = event.target.value;
        setSurveyData(prev => ({
            ...prev,
            [parentKey]: {
                ...prev[parentKey],
                [childKey]: base64Value
            }
        }));
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
                setSurveyData(prev => ({
                    ...prev,
                    questions: prev.questions.map(q => 
                        q.id === questionId ? { ...q, ...updatedQuestion } : q
                    )
                }));
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
        setSurveyData(prev => ({
            ...prev,
            [parentKey]: {
                ...(prev[parentKey] || {}),
                [childKey]: value
            }
        }));
    }, []);

    // 설문 최종 저장 (중복 저장 방지)
    const handleSave = async () => {
        // 이미 저장 중이면 무시
        if (loading) {
            return;
        }

        // 모든 Step 검증
        if (!validateStep(1) || !validateStep(2) || !validateStep(3) || !validateStep(4)) {
            setError('모든 필수 항목을 입력해주세요.');
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

    // QR 코드 생성 (간단한 mock)
    const generateQRCode = (url) => {
        return `data:image/svg+xml;base64,${btoa(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="white"/><text x="50" y="50" text-anchor="middle" font-size="10">QR</text></svg>`)}`;
    };

    const surveyUrl = surveyData.id 
        ? `${window.location.origin}/s/${surveyData.id}` 
        : '';

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
                {/* 왼쪽 사이드바 */}
            <div className="w-16 bg-gray-100 flex flex-col items-center py-4 flex-shrink-0">
                {/* 로고 */}
                <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mb-8">
                    <span className="text-white font-bold text-xl">S</span>
                </div>
                {/* 하단 아이콘 */}
                <div className="mt-auto space-y-4">
                    <button className="w-10 h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </button>
                    <button className="w-10 h-10 rounded-lg hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* 메인 콘텐츠 영역 */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* 상단 헤더 */}
                <header className="flex-shrink-0" style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}>
                    {/* 상단 바 */}
                    <div className="px-4 py-3 flex items-center justify-between">
                        {/* 타이틀 */}
                        <h1 className="text-2xl font-bold text-gray-900">설문지</h1>

                        {/* 유틸리티 아이콘 및 링크 */}
                        <div className="flex items-center gap-4">
                            {/* 유틸리티 아이콘 */}
                            <div className="flex items-center gap-2">
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="도움말">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="분석">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="되돌리기">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </button>
                                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="모바일/데스크톱">
                                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </button>
                                <button 
                                    type="button"
                                    onClick={handleSave}
                                    disabled={loading}
                                    style={{
                                        backgroundColor: loading ? '#9CA3AF' : 'var(--primary, #26C6DA)',
                                        color: '#FFFFFF'
                                    }}
                                    className="px-4 py-2 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-sm"
                                >
                                    {loading ? (
                                        <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    )}
                                    저장
                                </button>
                            </div>

                            {/* 링크 및 공유 */}
                            {surveyData.id && (
                                <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                                    <span className="text-sm text-text-sub">링크:</span>
                                    <span className="text-sm text-primary font-mono max-w-xs truncate">{surveyUrl || '저장 후 표시됩니다'}</span>
                                    <button 
                                        onClick={() => {
                                            if (surveyUrl) {
                                                navigator.clipboard.writeText(surveyUrl);
                                                alert('링크가 복사되었습니다');
                                            }
                                        }}
                                        className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        복사
                                    </button>
                                    <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                                        QR코드
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 탭 네비게이션 */}
                    <div className="px-4 flex items-center gap-4" style={{ backgroundColor: 'transparent', border: 'none', boxShadow: 'none' }}>
                        {[
                            { id: 'style', label: '스타일' },
                            { id: 'cover', label: '커버' },
                            { id: 'questions', label: '문제' },
                            { id: 'ending', label: '엔딩' },
                            { id: 'publishing', label: '퍼블리싱' }
                        ].map(tab => {
                            const isActive = currentTab === tab.id;
                            // 브랜드 컬러 가져오기 (설문 데이터 또는 기본값)
                            const primaryColor = surveyData?.branding?.primaryColor || surveyData?.cover?.primaryColor || 'var(--primary, #6B46C1)';
                            
                            return (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => handleTabChange(tab.id)}
                                className={`pb-3 px-1 font-medium text-sm transition-colors relative border-0 outline-none ${
                                    isActive
                                        ? 'font-semibold'
                                        : 'text-text-sub hover:text-text-main'
                                }`}
                                style={isActive ? {
                                    color: primaryColor,
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
                                        className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                                        style={{
                                            backgroundColor: primaryColor,
                                        }}
                                    />
                                )}
                            </button>
                            );
                        })}
                    </div>
                </header>

                {/* 상태 메시지 영역 (고정) */}
                <div className="flex-shrink-0">
                    {error && (
                        <div className="mx-4 mt-3 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-lg">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">오류</span>
                            </div>
                            <p className="mt-1 text-sm whitespace-pre-line">{error}</p>
                        </div>
                    )}
                    {successMessage && (
                        <div className="mx-6 mt-4 p-4 bg-green-50 border-l-4 border-green-500 text-green-700 rounded-lg">
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                <span className="font-medium">성공</span>
                            </div>
                            <p className="mt-1 text-sm">{successMessage}</p>
                        </div>
                    )}
                </div>

                {/* 메인 콘텐츠 영역 - 좌우 분할 */}
                <div className="flex-1 flex gap-4 p-4 overflow-hidden" style={{ minHeight: 0 }}>
                    {/* 왼쪽: 편집 영역 (스크롤 가능) */}
                    <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2" style={{ height: '100%' }}>
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
                                    </div>

                                    {/* 링크 공유 및 QR 코드 */}
                                    <div className="bg-white rounded-xl shadow-md p-4">
                                        <h3 className="text-lg font-bold text-text-main mb-4">링크 공유 및 QR 코드</h3>
                                        
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            {/* URL 공유 섹션 */}
                                            <div className="flex-1 space-y-3 w-full">
                                                <label htmlFor="surveyUrl" className="block text-sm font-medium text-text-sub mb-2">
                                                    설문 URL
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
                                                            backgroundColor: surveyData.id ? 'var(--primary, #26C6DA)' : '#9CA3AF',
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
                                            
                                            {/* QR 코드 섹션 */}
                                            <div className="w-32 flex-shrink-0 text-center">
                                                <h4 className="text-sm font-medium text-text-sub mb-2">QR 코드</h4>
                                                {surveyData.id && surveyUrl ? (
                                                    <>
                                                        <div className="w-32 h-32 border-2 border-border rounded-lg bg-white p-2 flex items-center justify-center mx-auto">
                                                            <img 
                                                                src={generateQRCode(surveyUrl)} 
                                                                alt="QR Code" 
                                                                className="w-full h-full"
                                                            />
                                                        </div>
                                                        <p className="text-xs text-primary mt-2">저장된 설문의 QR 코드</p>
                                                    </>
                                                ) : (
                                                    <div className="w-32 h-32 border-2 border-dashed border-border rounded-lg bg-bg flex items-center justify-center text-xs text-text-sub mx-auto">
                                                        설문 저장 후<br />생성
                                                    </div>
                                                )}
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
                                                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                                        surveyData.isPublic ? 'bg-primary' : 'bg-gray-300'
                                                    }`}
                                                    style={{ padding: '2px' }}
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
                                                    className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                                                        surveyData.password ? 'bg-primary' : 'bg-gray-300'
                                                    }`}
                                                    style={{ padding: '2px' }}
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
                                                    backgroundColor: loading ? '#9CA3AF' : 'var(--primary, #26C6DA)',
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
                    <div className="w-[320px] flex-shrink-0">
                        <div className="sticky top-6">
                            <MobilePreview
                                surveyData={surveyData}
                                currentTab={currentTab}
                                currentQuestionIndex={previewQuestionIndex}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveyBuilder;
