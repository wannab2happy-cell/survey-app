import express from 'express';
// controller에서 정의된 정확한 함수 이름을 가져옵니다.
import { 
    getSurveyList,
    getSurveyDetails, 
    createSurvey,
    updateSurvey,
    deleteSurvey,
    submitSurveyResponse, 
    getSurveyResults 
} from '../controllers/SurveyController.js'; 

const router = express.Router();

// 1. 설문 목록 가져오기 (GET /api/surveys)
router.get('/', getSurveyList);

// 2. 설문 생성 (POST /api/surveys) - 다른 라우트보다 먼저 정의
router.post('/', createSurvey);

// 3. 특정 설문 상세 정보 가져오기 (GET /api/surveys/:surveyId)
router.get('/:surveyId', getSurveyDetails);

// 4. 설문 수정 (PUT /api/surveys/:surveyId)
router.put('/:surveyId', updateSurvey);

// 5. 설문 삭제 (DELETE /api/surveys/:surveyId)
router.delete('/:surveyId', deleteSurvey);

// 6. 설문 응답 제출 (POST /api/surveys/:surveyId/response)
router.post('/:surveyId/response', submitSurveyResponse);

// 7. 설문 결과 가져오기 (GET /api/surveys/:surveyId/results)
router.get('/:surveyId/results', getSurveyResults);

export default router;
