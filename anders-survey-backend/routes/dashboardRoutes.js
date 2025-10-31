// src/routes/dashboardRoutes.js (ESM)

import express from 'express';
// 컨트롤러에서 함수명이 getLiveDashboardData -> getLiveSurveyData로 변경되었으므로 수정합니다.
import { getLiveSurveyData, getDashboardSummary } from '../controllers/dashboardController.js'; 

const router = express.Router();

// 설문 대시보드 라이브 데이터 조회
// GET /api/admin/dashboard/surveys/:surveyId/live
router.get('/surveys/:surveyId/live', getLiveSurveyData);

// 대시보드 전체 요약 정보 (미구현 상태)
// GET /api/admin/dashboard/summary
router.get('/summary', getDashboardSummary);

export default router;
