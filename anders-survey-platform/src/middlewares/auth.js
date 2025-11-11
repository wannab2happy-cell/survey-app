// src/middlewares/auth.js (최종 수정)

import jwt from 'jsonwebtoken';
import db from '../models/index.js'; // DB 조회를 위해 모델 임포트
const { User } = db;
import dotenv from 'dotenv';

dotenv.config();

// 1. JWT 토큰 검증 미들웨어
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.id, {
        attributes: ['id', 'name', 'email', 'role'] 
      });

      if (!user) {
        return res.status(401).json({ error: '유효하지 않은 토큰입니다. 사용자를 찾을 수 없습니다.' });
      }

      req.user = user; 
      next();
      
    } catch (error) {
      return res.status(401).json({ error: '유효하지 않은 토큰입니다.' });
    }
  }

  if (!token) {
    return res.status(401).json({ error: '인증 토큰이 누락되었습니다.' });
  }
};

// 2. 관리자 권한 확인 미들웨어 (Step N-1)
export const admin = (req, res, next) => {
    // protect 미들웨어 이후에 호출되므로 req.user 객체에 접근 가능
    if (req.user && req.user.role === 'admin') {
        next(); // 관리자 역할이 맞으면 다음(라우터)으로 이동
    } else {
        // 권한이 없으면 403 Forbidden 반환
        res.status(403).json({ error: '접근 권한이 없습니다. 관리자 계정만 이용 가능합니다.' });
    }
};