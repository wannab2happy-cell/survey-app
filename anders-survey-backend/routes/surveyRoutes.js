import express from "express";
import {
  createSurvey,
  getSurveyList,
  getSurveyDetails,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse,
  getSurveyResults,
} from "../controllers/SurveyController.js";

const router = express.Router();

// ✅ 설문 생성 (POST /api/surveys)
router.post("/", createSurvey);

// 설문 목록 조회
router.get("/", getSurveyList);

// 설문 상세 조회
router.get("/:surveyId", getSurveyDetails);

// ✅ 설문 수정 (PUT /api/surveys/:surveyId)
router.put("/:surveyId", updateSurvey);

// ✅ 설문 삭제 (DELETE /api/surveys/:surveyId)
router.delete("/:surveyId", deleteSurvey);

// 설문 응답 제출
router.post("/:surveyId/response", submitSurveyResponse);

// 설문 결과 조회
router.get("/:surveyId/results", getSurveyResults);

export default router;
