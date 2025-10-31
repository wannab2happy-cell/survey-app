// src/routes/brandingRoutes.js (ESM)

import express from 'express';
import { getBrandingSetting, updateBrandingSetting } from '../controllers/brandingController.js';

const router = express.Router();

// 응답자용 API (인증 불필요)
router.get('/', getBrandingSetting); 

// 관리자용 API (향후 관리자 인증 미들웨어 추가 예정)
router.put('/admin', updateBrandingSetting); 

export default router;