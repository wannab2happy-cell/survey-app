// src/controllers/ResponseController.js
// ✅ 수정된 부분: { sequelize, Response, Answer } 대신 models 전체를 default import
import models from '../models/index.js'; 
const { sequelize, Response, Answer } = models; // ✅ 가져온 models 객체에서 구조 분해 할당

// 응답 제출 (POST /api/surveys/:surveyId/responses)
const submitResponse = async (req, res) => { 
    // ... (이하 submitResponse 함수 코드는 그대로 유지)
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

    // 2. **[트랜잭션 시작]** Response와 Answer 테이블에 데이터 동시 저장 보장
    const t = await sequelize.transaction(); // sequelize 인스턴스 사용

    try {
        // 3. Response 테이블에 응답 정보 생성
        const newResponse = await Response.create({
            surveyId: surveyId,
            respondentIp: req.ip || null, 
            submittedAt: new Date()
        }, { transaction: t });
        
        // 4. Answer 테이블에 개별 답변 정보 생성
        const answersToCreate = answers.map(answer => ({
            responseId: newResponse.id, // 3단계에서 생성된 ID를 사용
            questionId: answer.questionId,
            value: answer.value // 답변 내용 (객관식/주관식 등)
        }));

        await Answer.bulkCreate(answersToCreate, { transaction: t }); // Answer 모델 사용

        // 5. 모든 작업이 성공했으므로 트랜잭션 커밋
        await t.commit();

        // 6. **[성공 응답 정의]** 확정된 구조로 성공 메시지 반환
        return res.status(201).json({
            success: true,
            message: "설문 응답이 성공적으로 제출되었습니다. 감사합니다.",
            responseId: newResponse.id
        });

    } catch (error) {
        // 7. 트랜잭션 중 오류 발생 시 롤백 (데이터 불일치 방지)
        await t.rollback();
        console.error("응답 제출 중 오류 발생:", error);
        
        // 8. 서버 오류 응답
        return res.status(500).json({ 
            success: false, 
            message: "500 Internal Server Error: 응답 제출 중 서버 오류가 발생했습니다." 
        });
    }
};

export { submitResponse };