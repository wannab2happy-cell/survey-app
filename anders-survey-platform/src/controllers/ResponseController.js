// src/controllers/ResponseController.js (Mongoose 버전)

import db from '../models/index.js';
const { Response } = db;

// 응답 제출 (POST /api/surveys/:surveyId/responses)
const submitResponse = async (req, res) => { 
    // 1. **[유효성 검증 시작]** 필수 데이터 확인
    const { answers } = req.body;
    const surveyId = req.params.surveyId;

    if (!answers || answers.length === 0) {
        // 필수 답변 배열이 없거나 비어있는 경우
        return res.status(400).json({ 
            success: false, 
            message: "400 Bad Request: 답변(answers) 데이터가 유효하지 않습니다." 
        });
    }

    // 각 답변 객체의 필수 필드 확인 (questionId, value)
    for (const answer of answers) {
        if (!answer.questionId || answer.value === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: "400 Bad Request: 개별 답변에 questionId 또는 value가 누락되었습니다." 
            });
        }
    }
    // **[유효성 검증 완료]**

    try {
        // 2. Response 생성 (Mongoose는 자동으로 트랜잭션을 처리)
        const newResponse = await Response.create({
            surveyId: surveyId,
            answers: answers.map(answer => ({
                questionId: answer.questionId,
                value: answer.value
            })),
            submittedAt: new Date()
        });

        // 3. **[성공 응답 정의]** 확정된 구조로 성공 메시지 반환
        return res.status(201).json({
            success: true,
            message: "설문 응답이 성공적으로 제출되었습니다. 감사합니다.",
            responseId: newResponse._id
        });

    } catch (error) {
        // 4. 서버 오류 응답
        console.error("응답 제출 중 오류 발생:", error);
        
        return res.status(500).json({ 
            success: false, 
            message: "500 Internal Server Error: 응답 제출 중 서버 오류가 발생했습니다.",
            error: error.message
        });
    }
};

export { submitResponse };
