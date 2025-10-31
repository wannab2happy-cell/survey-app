// src/controllers/dashboardController.js (ESM)

import db from '../models/index.js';
import { Op, fn, col, literal } from 'sequelize';

const { Survey, Question, Response, Answer } = db;

/**
 * 특정 설문의 실시간 응답 현황 및 집계 데이터를 반환합니다.
 * GET /api/admin/dashboard/surveys/:surveyId/live
 */
export const getLiveSurveyData = async (req, res) => {
    try {
        const surveyId = parseInt(req.params.surveyId, 10);

        if (isNaN(surveyId)) {
            return res.status(400).json({ message: "유효하지 않은 설문 ID입니다." });
        }

        // 1. 설문 기본 정보 및 질문 목록 가져오기
        const survey = await Survey.findByPk(surveyId, {
            include: [
                {
                    model: Question,
                    as: 'questions',
                    attributes: ['id', 'content', 'type', 'options', 'order'],
                },
            ],
            attributes: ['id', 'title'],
        });

        if (!survey) {
            return res.status(404).json({ message: "설문을 찾을 수 없습니다." });
        }
        
        // 2. 총 응답 수 계산
        const totalResponses = await Response.count({
            where: { surveyId },
        });

        // 3. 가장 최근 응답 시각
        const lastResponse = await Response.findOne({
            where: { surveyId },
            order: [['submittedAt', 'DESC']],
            attributes: ['submittedAt'],
        });
        const lastResponseAt = lastResponse ? lastResponse.submittedAt : null;


        // 4. 질문별 실시간 데이터 집계
        const questionsData = survey.questions || [];
        const liveData = [];

        for (const question of questionsData) {
            const questionId = question.id;
            const questionType = question.type;
            
            let responses = [];

            if (questionType === 'TEXT') {
                // 텍스트형 질문: 답변 목록을 가져옴
                const textAnswers = await Answer.findAll({
                    where: { questionId },
                    attributes: ['value'],
                    order: [['createdAt', 'DESC']],
                    limit: 100 // 최근 100개의 답변만 표시
                });
                
                responses = textAnswers.map(answer => answer.value);

            } else if (['RADIO', 'CHECKBOX'].includes(questionType)) {
                // 선택형 질문 (RADIO/CHECKBOX): 옵션별 개수를 집계
                const options = question.options || [];

                const aggregatedCounts = await Answer.findAll({
                    where: { questionId },
                    attributes: [
                        'value', // 답변 값 (예: 'A. 빠른 응답 속도')
                        [fn('COUNT', col('value')), 'count'] // 해당 값의 개수
                    ],
                    group: ['value'], // 답변 값 별로 그룹화
                    raw: true // 순수 JSON 객체로 결과 반환
                });

                // 옵션 배열을 기준으로 집계된 카운트를 매핑
                responses = options.map(option => {
                    const found = aggregatedCounts.find(item => item.value === option);
                    return {
                        option: option,
                        count: found ? parseInt(found.count, 10) : 0,
                    };
                });
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




