// src/routes/brandingRoutes.js (ESM)

import express from 'express';
import { getBrandingSetting, updateBrandingSetting } from '../controllers/brandingController.js';
import { verifyToken, requireEditor } from '../middlewares/auth.js';

const router = express.Router();

// 응답자용 API (인증 불필요)
router.get('/', getBrandingSetting); 

// 관리자용 API (admin, editor 가능)
router.put('/admin', verifyToken, requireEditor, updateBrandingSetting); 

export default router;