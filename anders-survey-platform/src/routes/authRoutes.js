import express from 'express';
import { signup, login } from '../controllers/UserController.js';

const router = express.Router();

// 회원가입 (POST /api/auth/signup)
router.post('/signup', signup);

// 로그인 (POST /api/auth/login)
router.post('/login', login);

export default router;


