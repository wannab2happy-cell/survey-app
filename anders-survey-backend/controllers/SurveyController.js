// controllers/surveyController.js
import Survey from "../models/Survey.js";
import Response from "../models/Response.js";

// ============================================================
// 1️⃣ 설문 생성 (POST /api/surveys)
// ============================================================
export async function createSurvey(req, res) {
  try {
    const { title, description, questions } = req.body;

    // 필수 값 확인
    if (!title || !questions || questions.length === 0) {
      return res.status(400).json({ message: "제목과 문항은 필수 항목입니다." });
    }

    // 새 설문 저장
    const newSurvey = new Survey({
      title,
      description,
      questions,
    });

    const savedSurvey = await newSurvey.save();
    res.status(201).json(savedSurvey);
  } catch (error) {
    console.error("❌ 설문 생성 오류:", error);
    res.status(500).json({ message: "서버 오류로 설문을 생성할 수 없습니다." });
  }
}

// ============================================================
// 2️⃣ 설문 목록 조회 (GET /api/surveys)
// ============================================================
export async function getSurveyList(req, res) {
  try {
    const surveys = await Survey.find({}, "title description createdAt");
    res.status(200).json(surveys);
  } catch (error) {
    console.error("❌ 설문 목록 조회 오류:", error);
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
}

// ============================================================
// 3️⃣ 설문 상세 조회 (GET /api/surveys/:surveyId)
// ============================================================
export async function getSurveyDetails(req, res) {
  try {
    const { surveyId } = req.params;
    const survey = await Survey.findById(surveyId);
    if (!survey) {
      return res.status(404).json({ message: "설문을 찾을 수 없습니다." });
    }
    res.status(200).json(survey);
  } catch (error) {
    console.error("❌ 설문 상세 조회 오류:", error);
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
}

// ============================================================
// 4️⃣ 설문 응답 제출 (POST /api/surveys/:surveyId/response)
// ============================================================
export async function submitSurveyResponse(req, res) {
  try {
    const { answers } = req.body;
    const { surveyId } = req.params;

    if (!answers || answers.length === 0) {
      return res.status(400).json({ message: "답변 내용이 필요합니다." });
    }

    const newResponse = new Response({ surveyId, answers });
    await newResponse.save();

    res.status(201).json({
      message: "응답이 성공적으로 저장되었습니다.",
      responseId: newResponse._id,
    });
  } catch (error) {
    console.error("❌ 설문 응답 저장 오류:", error);
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
}

// ============================================================
// 5️⃣ 설문 결과 조회 (GET /api/surveys/:surveyId/results)
// ============================================================
export async function getSurveyResults(req, res) {
  try {
    const { surveyId } = req.params;
    const responses = await Response.find({ surveyId });

    res.status(200).json({
      totalResponses: responses.length,
      results: responses.map((r) => ({
        id: r._id,
        answers: r.answers,
        submittedAt: r.submittedAt,
      })),
    });
  } catch (error) {
    console.error("❌ 설문 결과 조회 오류:", error);
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
}
