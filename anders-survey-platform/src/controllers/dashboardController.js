// src/controllers/dashboardController.js (Mongoose 버전)

import db from '../models/index.js';

const { Survey, Response } = db;

/**
 * 특정 설문의 실시간 응답 현황 및 집계 데이터를 반환합니다.
 * GET /api/admin/dashboard/surveys/:surveyId/live
 */
export const getLiveSurveyData = async (req, res) => {
    try {
        const surveyId = req.params.surveyId;

        if (!surveyId) {
            return res.status(400).json({ message: "유효하지 않은 설문 ID입니다." });
        }

        // 1. 설문 기본 정보 및 질문 목록 가져오기
        const survey = await Survey.findById(surveyId).select('_id title questions');

        if (!survey) {
            return res.status(404).json({ message: "설문을 찾을 수 없습니다." });
        }
        
        // 2. 총 응답 수 계산
        const totalResponses = await Response.countDocuments({ surveyId });

        // 3. 가장 최근 응답 시각
        const lastResponse = await Response.findOne({ surveyId })
            .sort({ submittedAt: -1 })
            .select('submittedAt');
        const lastResponseAt = lastResponse ? lastResponse.submittedAt : null;

        // 4. 질문별 실시간 데이터 집계
        const questionsData = survey.questions || [];
        const liveData = [];

        // 해당 설문의 모든 응답 가져오기
        const allResponses = await Response.find({ surveyId }).select('answers');

        for (const question of questionsData) {
            const questionId = question._id ? question._id.toString() : null;
            const questionType = question.type;
            
            let responses = [];

            if (questionType === 'TEXT') {
                // 텍스트형 질문: 답변 목록을 가져옴
                const textAnswers = [];
                allResponses.forEach(response => {
                    response.answers.forEach(answer => {
                        if (answer.questionId && answer.questionId.toString() === questionId) {
                            textAnswers.push({ value: answer.value, createdAt: answer.createdAt });
                        }
                    });
                });
                
                // 최근 100개만 정렬하여 반환
                responses = textAnswers
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .slice(0, 100)
                    .map(answer => answer.value);

            } else if (['RADIO', 'CHECKBOX'].includes(questionType)) {
                // 선택형 질문 (RADIO/CHECKBOX): 옵션별 개수를 집계
                const options = question.options || [];
                const answerCounts = {};

                // 모든 응답에서 해당 질문의 답변 수집
                allResponses.forEach(response => {
                    response.answers.forEach(answer => {
                        if (answer.questionId && answer.questionId.toString() === questionId) {
                            const value = answer.value;
                            answerCounts[value] = (answerCounts[value] || 0) + 1;
                        }
                    });
                });

                // 옵션 배열을 기준으로 집계된 카운트를 매핑
                responses = options.map(option => ({
                    option: option,
                    count: answerCounts[option] || 0,
                }));
            }

            liveData.push({
                questionId: questionId,
                questionContent: question.content,
                questionType: questionType,
                responses: responses,
            });
        }
        
        // 최종 응답 반환
        return res.status(200).json({
            surveyTitle: survey.title,
            totalResponses: totalResponses,
            lastResponseAt: lastResponseAt,
            liveData: liveData,
        });

    } catch (error) {
        console.error('라이브 설문 데이터 조회 중 오류 발생:', error);
        // 오류 메시지를 포함하여 응답합니다.
        return res.status(500).json({ 
            message: "서버 오류 발생", 
            error: error.message || "알 수 없는 오류" 
        });
    }
};

/**
 * 기타 대시보드 요약 데이터를 반환하는 함수 (예: 전체 설문 개수, 응답률 등)
 * GET /api/admin/dashboard/summary
 */
export const getDashboardSummary = async (req, res) => {
    // 이 부분은 대시보드 메인 화면 구현 시 추가됩니다.
    res.status(501).json({ message: "Not Implemented Yet" });
};
