// server.js
// =============================================
// JWT 인증 포함 백엔드 전체 통합 버전
// =============================================

// 1. 라이브러리 import
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import surveyRoutes from "./routes/surveyRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import brandingRoutes from "./routes/brandingRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { verifyToken, optionalVerifyToken } from "./middlewares/auth.js";
import { loginUser } from "./controllers/authController.js";
import User from "./models/User.js";

dotenv.config();

// 2. MongoDB 연결
const DB_URI = process.env.MONGO_URI;

if (!DB_URI) {
  console.error("❌ MONGO_URI 환경 변수가 설정되지 않았습니다.");
  process.exit(1);
}

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas 연결 성공!");
    initializeDatabase();
  })
  .catch((err) => {
    console.error("❌ MongoDB Atlas 연결 실패:", err.message);
    process.exit(1);
  });

// 3. 초기 관리자 계정 생성 (bcrypt 적용)
async function initializeDatabase() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || "andersadmin";
    const adminPassword = process.env.ADMIN_PASSWORD || "password123";
    
    const adminExists = await User.exists({ username: adminUsername });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        username: adminUsername,
        password: hashedPassword,
        role: "admin",
      });
      console.log(`💡 관리자 계정 생성 완료: ID(${adminUsername}), PW(${adminPassword})`);
      console.log("⚠️  프로덕션 환경에서는 환경 변수를 통해 관리자 계정을 설정하세요.");
    } else {
      console.log(`ℹ️  관리자 계정이 이미 존재합니다: ${adminUsername}`);
    }
  } catch (error) {
    console.error("❌ 초기 데이터 생성 오류:", error.message);
    console.error("Error details:", error);
  }
}

// 5. Express 앱 생성 및 미들웨어 설정
const app = express();

// Body parser 설정 - 이미지 Base64를 포함한 큰 페이로드를 위해 크기 제한 증가 (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 6. CORS 설정
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

const corsOptions = {
  origin: function (origin, callback) {
    // 개발 환경에서는 origin이 없는 요청도 허용 (Postman, curl 등)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 개발 환경에서는 모든 origin 허용 (에러 대신 경고만)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️  CORS 경고: ${origin}에서의 요청이 허용되지 않았지만 개발 환경이므로 허용합니다.`);
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    }
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  exposedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24시간
};
app.use(cors(corsOptions));

// 요청 로깅 미들웨어 (개발 환경) - 라우트 설정 전에 배치
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// =============================================
// ✅ 로그인 API (JWT 발급)
// =============================================
app.post("/api/login", loginUser);

// =============================================
// ✅ 라우트 연결
// =============================================
// 설문 라우트: 토큰이 있으면 검증하고, 없으면 그냥 통과 (선택적 인증)
app.use("/api/surveys", optionalVerifyToken, surveyRoutes);
app.use("/api/admin/dashboard", verifyToken, dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/branding", brandingRoutes); // 브랜딩 라우트 (인증 불필요)

// =============================================
// ✅ 404 핸들러 (라우트 이후에 위치)
// =============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "요청한 리소스를 찾을 수 없습니다.",
    path: req.path,
  });
});

// =============================================
// ✅ 전역 에러 핸들러 (모든 미들웨어 이후에 위치)
// =============================================
app.use((err, req, res, next) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] 전역 에러 핸들러:`, {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });
  
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: "CORS 정책에 의해 요청이 차단되었습니다.",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "서버 오류가 발생했습니다.",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// =============================================
// ✅ 서버 실행
// =============================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`✅ 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`📡 API URL: http://localhost:${PORT}/api/`);
  console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
  console.log(`==============================================\n`);
});

// Graceful shutdown 처리
process.on('SIGTERM', async () => {
  console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT 신호를 받았습니다. 서버를 종료합니다...');
  await mongoose.connection.close();
  process.exit(0);
});
