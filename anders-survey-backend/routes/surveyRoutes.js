import express from 'express';
// controller에서 정의된 정확한 함수 이름(getSurveyDetails, submitSurveyResponse 등)을 가져옵니다.
import { 
    getSurveyList,
    getSurveyDetails, 
    submitSurveyResponse, 
    getSurveyResults 
} from '../controllers/surveyController.js'; 

const router = express.Router();

// 1. 설문 목록 가져오기 (GET /api/surveys)
router.get('/', getSurveyList);

// 2. 특정 설문 상세 정보 가져오기 (GET /api/surveys/:surveyId)
router.get('/:surveyId', getSurveyDetails);

// 3. 설문 응답 제출 (POST /api/surveys/:surveyId/response)
router.post('/:surveyId/response', submitSurveyResponse);

// 4. 설문 결과 가져오기 (GET /api/surveys/:surveyId/results)
router.get('/:surveyId/results', getSurveyResults);

export default router;
