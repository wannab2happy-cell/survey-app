// src/models/index.js (Mongoose 버전)

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

// MongoDB 연결 URI
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

// Mongoose 연결 설정
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB 연결 성공!');
  })
  .catch((err) => {
    console.error('❌ MongoDB 연결 실패:', err.message);
    process.exit(1);
  });

// 모델 Import
import User from './User.js';
import Survey from './Survey.js';
import Response from './Response.js';
import BrandingSetting from './brandingSetting.js';

// 모델들을 객체로 export
const db = {
  mongoose,
  User,
  Survey,
  Response,
  BrandingSetting,
};

export default db;
