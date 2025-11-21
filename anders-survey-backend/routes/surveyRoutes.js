import express from "express";
import {
  createSurvey,
  getSurveyList,
  getSurveyDetails,
  updateSurvey,
  deleteSurvey,
  submitSurveyResponse,
  getSurveyResults,
  generateShareToken,
  getSurveyResultsShared,
} from "../controllers/SurveyController.js";
import { verifyToken, requireAdmin, requireEditor, requireViewer } from "../middlewares/auth.js";

const router = express.Router();

// ✅ 설문 생성 (POST /api/surveys) - admin, editor만 가능
router.post("/", verifyToken, requireEditor, createSurvey);

// 설문 목록 조회 - admin, editor, viewer 모두 가능
router.get("/", verifyToken, requireViewer, getSurveyList);

// 설문 상세 조회 - admin, editor, viewer 모두 가능
router.get("/:surveyId", getSurveyDetails); // 공개 설문 응답용이므로 인증 불필요

// ✅ 설문 수정 (PUT /api/surveys/:surveyId) - admin, editor만 가능
router.put("/:surveyId", verifyToken, requireEditor, updateSurvey);

// ✅ 설문 삭제 (DELETE /api/surveys/:surveyId) - admin만 가능
router.delete("/:surveyId", verifyToken, requireEditor, deleteSurvey);

// 설문 응답 제출 - 인증 불필요 (공개)
router.post("/:surveyId/response", submitSurveyResponse);

// 설문 결과 조회 - admin, editor, viewer 모두 가능
router.get("/:surveyId/results", verifyToken, requireViewer, getSurveyResults);

// 공유 토큰 생성 - admin, editor만 가능
router.post("/:surveyId/share-token", verifyToken, requireEditor, generateShareToken);

// 공유 토큰으로 설문 결과 조회 (인증 불필요)
router.get("/:surveyId/results/shared/:token", getSurveyResultsShared);

export default router;
