// src/controllers/dashboardController.js (Mongoose 버전)

import Survey from '../models/Survey.js';
import Response from '../models/Response.js';

/**
 * 특정 설문의 실시간 응답 현황 및 집계 데이터를 반환합니다.
 * GET /api/admin/dashboard/surveys/:surveyId/live
 */
export const getLiveSurveyData = async (req, res) => {
  try {
    const surveyId = req.params.surveyId;

    // 1. 설문 기본 정보 및 질문 목록 가져오기
    const survey = await Survey.findById(surveyId).lean();
    if (!survey) {
      return res.status(404).json({ message: '설문을 찾을 수 없습니다.' });
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

    for (const question of questionsData) {
      const questionId = question._id || question.id;
      const questionType = question.type;
      let responses = [];

      if (questionType === 'TEXT') {
        // 텍스트형 질문: 최근 100개의 답변
        const textAnswers = await Response.aggregate([
          { $match: { surveyId } },
          { $unwind: '$answers' },
          { $match: { 'answers.questionId': questionId } },
          { $sort: { 'answers.createdAt': -1 } },
          { $limit: 100 },
          { $project: { value: '$answers.value' } },
        ]);
        responses = textAnswers.map((a) => a.value);

      } else if (['RADIO', 'CHECKBOX'].includes(questionType)) {
        // 선택형 질문: 옵션별 카운트
        const counts = await Response.aggregate([
          { $match: { surveyId } },
          { $unwind: '$answers' },
          { $match: { 'answers.questionId': questionId } },
          { $group: { _id: '$answers.value', count: { $sum: 1 } } },
        ]);

        const optionMap = {};
        counts.forEach((c) => (optionMap[c._id] = c.count));

        responses = (question.options || []).map((option) => ({
          option,
          count: optionMap[option] || 0,
        }));
      }

      liveData.push({
        questionId,
        questionContent: question.content,
        questionType,
        responses,
      });
    }

    // 최종 응답 반환
    return res.status(200).json({
      success: true,
      data: {
        surveyTitle: survey.title,
        totalResponses,
        lastResponseAt,
        liveData,
      },
    });
  } catch (error) {
    console.error('라이브 설문 데이터 조회 중 오류 발생:', error);
    return res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * 대시보드 요약 데이터
 * GET /api/admin/dashboard/summary
 */
export const getDashboardSummary = async (req, res) => {
  try {
    const surveyCount = await Survey.countDocuments();
    const responseCount = await Response.countDocuments();
    
    res.status(200).json({
      success: true,
      data: {
        surveyCount,
        responseCount,
      },
    });
  } catch (error) {
    console.error('대시보드 요약 데이터 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
