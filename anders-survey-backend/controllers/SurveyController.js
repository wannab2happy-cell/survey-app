import db from '../db/index.js';

const { Survey, Question, Response, Answer } = db;

// 설문 목록 조회
export const getSurveyList = async (req, res) => {
    try {
        const surveys = await Survey.findAll({ attributes: ['id', 'title'] });
        return res.status(200).json(surveys);
    } catch (error) {
        console.error("설문 목록 조회 중 오류 발생:", error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 설문 상세 정보 (질문 포함) 조회
export const getSurveyDetails = async (req, res) => {
    try {
        const { surveyId } = req.params;

        const survey = await Survey.findByPk(surveyId, {
            include: [
                {
                    model: Question,
                    attributes: ['id', 'text', 'type', 'options'],
                    as: 'Questions'
                }
            ],
            attributes: ['id', 'title', 'description']
        });

        if (!survey) {
            return res.status(404).json({ message: "설문을 찾을 수 없습니다." });
        }

        return res.status(200).json(survey);
    } catch (error) {
        console.error("설문 상세 정보 조회 중 오류 발생:", error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 설문 응답 제출
export const submitSurveyResponse = async (req, res) => {
    const { userId, answers } = req.body;
    const { surveyId } = req.params;

    if (!userId || !answers || answers.length === 0) {
        return res.status(400).json({ message: "사용자 ID와 답변이 필요합니다." });
    }

    try {
        const response = await Response.create({
            surveyId: surveyId,
            userId: userId
        });

        const answerRecords = answers.map(answer => ({
            responseId: response.id,
            questionId: answer.questionId,
            content: JSON.stringify(answer.content)
        }));

        await Answer.bulkCreate(answerRecords);

        return res.status(201).json({
            message: "응답이 성공적으로 제출되었습니다.",
            responseId: response.id
        });
    } catch (error) {
        console.error("설문 응답 제출 중 오류 발생:", error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};

// 설문 결과 조회 (관리자 대시보드용)
export const getSurveyResults = async (req, res) => {
    try {
        const totalResponses = await Response.count();

        const surveyCounts = await Response.findAll({
            attributes: [
                'surveyId',
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'responseCount']
            ],
            group: ['surveyId'],
            order: [[db.sequelize.col('responseCount'), 'DESC']],
            limit: 5,
            include: [{ model: Survey, attributes: ['title'] }]
        });

        const recentResponses = await Response.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: Survey, attributes: ['title'] }]
        });

        return res.status(200).json({
            totalResponses,
            surveyCounts: surveyCounts.map(item => ({
                surveyTitle: item.Survey.title,
                responseCount: item.get('responseCount')
            })),
            recentResponses: recentResponses.map(item => ({
                id: item.id,
                surveyTitle: item.Survey.title,
                submittedAt: item.createdAt
            }))
        });
    } catch (error) {
        console.error("설문 결과 조회 중 오류 발생:", error);
        return res.status(500).json({ message: "서버 오류 발생", error: error.message });
    }
};
