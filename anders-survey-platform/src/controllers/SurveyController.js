// src/controllers/SurveyController.js (Mongoose 버전)

import db from '../models/index.js';

const { Survey, Response, User } = db;

// 설문 목록 조회
export const getSurveyList = async (req, res) => {
    try {
        const surveys = await Survey.find({})
            .select('_id title description status createdAt updatedAt')
            .sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            data: surveys
        });
    } catch (error) {
        console.error("설문 목록 조회 중 오류 발생:", error);
        return res.status(500).json({ 
            success: false,
            message: "서버 오류 발생", 
            error: error.message 
        });
    }
};

// 설문 상세 정보 (질문 포함) 조회
export const getSurveyDetails = async (req, res) => {
    try {
        const { surveyId } = req.params;

        // slug 또는 ObjectId로 조회 시도
        let survey = null;
        if (surveyId.match(/^[0-9a-fA-F]{24}$/)) {
            // MongoDB ObjectId 형식
            survey = await Survey.findById(surveyId);
        } else {
            // slug로 조회 시도
            survey = await Survey.findOne({ slug: surveyId });
            // slug가 없으면 ObjectId로 재시도 (하위 호환성)
            if (!survey) {
                survey = await Survey.findById(surveyId);
            }
        }

        if (!survey) {
            return res.status(404).json({ message: "설문을 찾을 수 없습니다." });
        }

        // Mongoose 문서를 일반 객체로 변환하고 questions 정리
        const surveyData = {
            id: survey._id,
            _id: survey._id, // 프론트엔드 호환성
            title: survey.title,
            description: survey.description || '',
            status: survey.status || 'inactive',
            questions: survey.questions.map((q, index) => ({
                id: q._id || index,
                _id: q._id || index, // 프론트엔드 호환성
                content: q.content,
                text: q.content, // 프론트엔드 호환성 (content와 text 둘 다 제공)
                type: (q.type || '').toUpperCase(), // 타입 정규화 (대문자로 통일)
                options: q.options || [],
                required: q.required || false
            })),
            personalInfo: survey.personalInfo || { enabled: false },
            branding: survey.branding || {},
            cover: survey.cover || {},
            ending: survey.ending || {},
            head: survey.head || {},
            foot: survey.foot || {},
            startAt: survey.startAt || null,
            endAt: survey.endAt || null,
            createdAt: survey.createdAt,
            updatedAt: survey.updatedAt
        };

        return res.status(200).json({
            success: true,
            data: surveyData
        });
    } catch (error) {
        console.error("설문 상세 정보 조회 중 오류 발생:", error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 설문 응답 제출
export const submitSurveyResponse = async (req, res) => {
    const { userId, answers } = req.body;
    const { surveyId } = req.params;

    if (!answers || answers.length === 0) {
        return res.status(400).json({ message: "답변이 필요합니다." });
    }

    try {
        // Survey 존재 확인 (slug 또는 ObjectId로 조회)
        let survey = null;
        if (surveyId.match(/^[0-9a-fA-F]{24}$/)) {
            // MongoDB ObjectId 형식
            survey = await Survey.findById(surveyId);
        } else {
            // slug로 조회 시도
            survey = await Survey.findOne({ slug: surveyId });
            // slug가 없으면 ObjectId로 재시도 (하위 호환성)
            if (!survey) {
                survey = await Survey.findById(surveyId);
            }
        }
        
        if (!survey) {
            return res.status(404).json({ message: "설문을 찾을 수 없습니다." });
        }
        
        // 실제 surveyId는 survey._id 사용
        const actualSurveyId = survey._id.toString();

        // Response 생성 (answers는 서브스키마로 포함)
        const response = await Response.create({
            surveyId: actualSurveyId,
            userId: userId || null,
            answers: answers.map(answer => ({
                questionId: answer.questionId,
                value: typeof answer.content === 'object' ? answer.content : answer.content
            }))
        });

        return res.status(201).json({
            message: "응답이 성공적으로 제출되었습니다.",
            responseId: response._id
        });
    } catch (error) {
        console.error("설문 응답 제출 중 오류 발생:", error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 설문 생성
export const createSurvey = async (req, res) => {
    try {
        const { title, description, questions, personalInfo, branding, cover, ending, head, foot, status, startAt, endAt } = req.body;
        
        // 인증 확인
        const token = req.headers.authorization?.replace('Bearer ', '');
        let userId = null;
        
        if (token) {
            try {
                const jwt = await import('jsonwebtoken');
                const decoded = jwt.default.verify(token, process.env.JWT_SECRET);
                userId = decoded.id || decoded.userId;
            } catch (err) {
                console.log('토큰 검증 실패 (선택적):', err.message);
            }
        }

        // 필수 필드 검증
        if (!title || !title.trim()) {
            return res.status(400).json({ 
                success: false,
                message: "설문 제목은 필수입니다." 
            });
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "최소한 하나의 질문이 필요합니다." 
            });
        }

        // 질문 데이터 정규화
        const normalizedQuestions = questions.map((q, index) => {
            let questionType = 'TEXT';
            const qType = (q.type || '').toLowerCase();
            let finalOptions = (q.options || []).map(opt => {
                if (typeof opt === 'string') return opt;
                return opt.text || opt.label || String(opt);
            }).filter(opt => opt && opt.trim());
            
            // 디버깅: 질문 타입 변환 로그
            console.log(`[createSurvey] 질문 ${index + 1}:`, {
                원본타입: q.type,
                소문자타입: qType,
                변환전옵션: q.options
            });

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

            return {
                content: (q.content || q.title || q.text || '').trim(),
                type: questionType,
                options: finalOptions,
                order: index,
                required: q.required || false
            };
        });

        // personalInfo 정규화
        const normalizedPersonalInfo = personalInfo && personalInfo.enabled ? {
            enabled: true,
            fields: Array.isArray(personalInfo.fields) ? personalInfo.fields : [],
            consentText: personalInfo.consentText || '',
            consentRequired: personalInfo.consentRequired || false,
            customFields: Array.isArray(personalInfo.customFields) ? personalInfo.customFields : []
        } : { enabled: false };

        // 디버깅: 최종 전송 데이터 로그
        console.log('[createSurvey] 최종 전송 데이터:', {
            title: title.trim(),
            questionsCount: normalizedQuestions.length,
            questions: normalizedQuestions.map(q => ({ type: q.type, content: q.content.substring(0, 20) + '...' }))
        });
        
        // slug 생성 (제목 기반 또는 ObjectId 사용)
        const generateSlug = (text) => {
            return text
                .toLowerCase()
                .replace(/[^\w\s-]/g, '') // 특수문자 제거
                .replace(/\s+/g, '-') // 공백을 하이픈으로
                .replace(/-+/g, '-') // 연속된 하이픈 제거
                .trim();
        };
        
        let slug = req.body.slug || generateSlug(title);
        // slug 중복 확인 및 처리
        let existingSurvey = await Survey.findOne({ slug });
        let slugSuffix = 1;
        while (existingSurvey) {
            slug = `${generateSlug(title)}-${slugSuffix}`;
            existingSurvey = await Survey.findOne({ slug });
            slugSuffix++;
        }

        // 설문 생성
        const newSurvey = await Survey.create({
            title: title.trim(),
            description: description?.trim() || '',
            slug: slug,
            questions: normalizedQuestions,
            userId: userId,
            status: status || 'inactive',
            personalInfo: normalizedPersonalInfo,
            branding: branding || {},
            cover: cover || {},
            ending: ending || {},
            head: head || {},
            foot: foot || {},
            startAt: startAt || null,
            endAt: endAt || null
        });

        return res.status(201).json({
            success: true,
            message: "설문이 성공적으로 생성되었습니다.",
            data: newSurvey
        });
    } catch (error) {
        console.error("========== 설문 생성 중 오류 발생 ==========");
        console.error("에러 이름:", error.name);
        console.error("에러 메시지:", error.message);
        console.error("에러 스택:", error.stack);
        console.error("전체 에러 객체:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
        
        // Mongoose validation 에러 처리
        if (error.name === 'ValidationError') {
            console.error("ValidationError 상세:");
            Object.keys(error.errors).forEach(key => {
                console.error(`  - ${key}:`, error.errors[key].message);
            });
            const validationErrors = Object.values(error.errors).map((e) => e.message || String(e));
            return res.status(400).json({ 
                success: false,
                message: "데이터 검증 오류가 발생했습니다.",
                error: error.message,
                errors: error.errors,
                validationErrors: validationErrors
            });
        }
        
        // Mongoose cast 에러 처리
        if (error.name === 'CastError') {
            console.error("CastError 상세:", error.path, error.value, error.kind);
            return res.status(400).json({ 
                success: false,
                message: "잘못된 데이터 형식입니다.",
                error: error.message,
                path: error.path,
                value: error.value
            });
        }
        
        console.error("==========================================");
        return res.status(500).json({ 
            success: false,
            message: "서버 오류 발생", 
            error: error.message 
        });
    }
};

// 설문 수정
export const updateSurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const { title, description, questions, personalInfo, branding, cover, ending, head, foot, status, startAt, endAt } = req.body;

        // 설문 존재 확인
        const survey = await Survey.findById(surveyId);
        if (!survey) {
            return res.status(404).json({ 
                success: false,
                message: "설문을 찾을 수 없습니다." 
            });
        }

        // 필수 필드 검증
        if (!title || !title.trim()) {
            return res.status(400).json({ 
                success: false,
                message: "설문 제목은 필수입니다." 
            });
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "최소한 하나의 질문이 필요합니다." 
            });
        }

        // 질문 데이터 정규화 (createSurvey와 동일)
        const normalizedQuestions = questions.map((q, index) => {
            let questionType = 'TEXT';
            const qType = (q.type || '').toLowerCase();
            let finalOptions = (q.options || []).map(opt => {
                if (typeof opt === 'string') return opt;
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

            return {
                content: (q.content || q.title || q.text || '').trim(),
                type: questionType,
                options: finalOptions,
                order: index,
                required: q.required || false
            };
        });

        // personalInfo 정규화
        const normalizedPersonalInfo = personalInfo && personalInfo.enabled ? {
            enabled: true,
            fields: Array.isArray(personalInfo.fields) ? personalInfo.fields : [],
            consentText: personalInfo.consentText || '',
            consentRequired: personalInfo.consentRequired || false,
            customFields: Array.isArray(personalInfo.customFields) ? personalInfo.customFields : []
        } : { enabled: false };

        // 설문 업데이트
        const updatedSurvey = await Survey.findByIdAndUpdate(
            surveyId,
            {
                title: title.trim(),
                description: description?.trim() || '',
                questions: normalizedQuestions,
                status: status || survey.status,
                personalInfo: normalizedPersonalInfo,
                branding: branding || survey.branding,
                cover: cover || survey.cover,
                ending: ending || survey.ending,
                head: head || survey.head,
                foot: foot || survey.foot,
                startAt: startAt !== undefined ? startAt : survey.startAt,
                endAt: endAt !== undefined ? endAt : survey.endAt
            },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "설문이 성공적으로 수정되었습니다.",
            data: updatedSurvey
        });
    } catch (error) {
        console.error("설문 수정 중 오류 발생:", error);
        
        // Mongoose validation 에러 처리
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map((e) => e.message || String(e));
            return res.status(400).json({ 
                success: false,
                message: "데이터 검증 오류가 발생했습니다.",
                error: error.message,
                errors: error.errors
            });
        }
        
        // Mongoose cast 에러 처리
        if (error.name === 'CastError') {
            return res.status(400).json({ 
                success: false,
                message: "잘못된 데이터 형식입니다.",
                error: error.message
            });
        }
        
        return res.status(500).json({ 
            success: false,
            message: "서버 오류 발생", 
            error: error.message 
        });
    }
};

// 설문 삭제
export const deleteSurvey = async (req, res) => {
    try {
        const { surveyId } = req.params;

        const survey = await Survey.findById(surveyId);
        if (!survey) {
            return res.status(404).json({ 
                success: false,
                message: "설문을 찾을 수 없습니다." 
            });
        }

        await Survey.findByIdAndDelete(surveyId);

        return res.status(200).json({
            success: true,
            message: "설문이 성공적으로 삭제되었습니다."
        });
    } catch (error) {
        console.error("설문 삭제 중 오류 발생:", error);
        return res.status(500).json({ 
            success: false,
            message: "서버 오류 발생", 
            error: error.message 
        });
    }
};

// 설문 결과 조회 (관리자 대시보드용) - 특정 설문의 응답 결과 반환
export const getSurveyResults = async (req, res) => {
    try {
        const { surveyId } = req.params;

        if (!surveyId) {
            return res.status(400).json({ message: "설문 ID가 필요합니다." });
        }

        // 설문 존재 확인
        const survey = await Survey.findById(surveyId);
        if (!survey) {
            return res.status(404).json({ message: "설문을 찾을 수 없습니다." });
        }

        // 해당 설문의 모든 응답 조회
        const responses = await Response.find({ surveyId })
            .sort({ submittedAt: -1 })
            .select('answers submittedAt userId');

        // 응답 데이터 변환
        const results = responses.map((response, index) => ({
            id: response._id.toString(),
            answers: response.answers.map(answer => ({
                questionId: answer.questionId?.toString() || answer.questionId,
                answer: answer.value, // value를 answer로 변환
            })),
            submittedAt: response.submittedAt || response.createdAt,
            userId: response.userId || null,
        }));

        return res.status(200).json({
            success: true,
            surveyId: surveyId,
            totalResponses: results.length,
            results: results
        });
    } catch (error) {
        console.error("설문 결과 조회 중 오류 발생:", error);
        return res.status(500).json({ 
            success: false,
            message: "서버 오류 발생", 
            error: error.message 
        });
    }
};
