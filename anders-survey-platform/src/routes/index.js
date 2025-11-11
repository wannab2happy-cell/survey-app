import express from 'express';
import dashboardRoutes from './dashboardRoutes.js';
// 새로 추가된 설문 라우트
import surveyRoutes from './surveyRoutes.js'; 

const router = express.Router();

// 관리자 대시보드 API (Admin Dashboard)
router.use('/admin/dashboard', dashboardRoutes);

// 일반 설문 API (Public Survey Access)
// 경로를 /api/surveys로 연결합니다.
router.use('/surveys', surveyRoutes); 

// 기본 상태 확인
router.get('/', (req, res) => {
    res.status(200).json({ 
        message: 'Survey Platform API Operational',
        status: 'OK'
    });
});

export default router;
