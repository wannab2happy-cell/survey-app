// server.js
// =============================================
// 백엔드 전체 통합 버전 (Render 배포용)
// =============================================

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

// =============================================
// 1. MongoDB 연결
// =============================================
const DB_URI = process.env.MONGODB_URI;

if (!DB_URI) {
  console.error("❌ MONGODB_URI 환경 변수가 없습니다.");
  process.exit(1);
}

mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("✅ MongoDB 연결 성공");
    initializeAdmin();
  })
  .catch((err) => {
    console.error("❌ MongoDB 연결 실패:", err.message);
    process.exit(1);
  });

// =============================================
// 2. 관리자 계정 자동 생성
// =============================================
async function initializeAdmin() {
  try {
    const adminUsername = process.env.ADMIN_USERNAME || "andersadmin";
    const adminPassword = process.env.ADMIN_PASSWORD || "password123";

    const exists = await User.exists({ username: adminUsername });
    if (!exists) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({
        username: adminUsername,
        password: hashed,
        role: "admin",
      });

      console.log(`💡 관리자 계정 생성됨 → ID: ${adminUsername}`);
    } else {
      console.log(`ℹ️ 관리자 계정 이미 존재 → ${adminUsername}`);
    }
  } catch (err) {
    console.error("❌ 관리자 계정 생성 오류:", err.message);
  }
}

// =============================================
// 3. 서버 초기 설정
// =============================================
const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// =============================================
// 4. CORS (Render+Vercel 연결용)
// =============================================
const allowedOrigins = [
  process.env.CLIENT_URL,                  // Vercel 프로덕션
  "https://survey-8ke8ggum8-anders-projects-2d7c87b2.vercel.app", // Specific Vercel Preview
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel preview deployment
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      console.warn("⚠️ CORS 차단:", origin);
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 600,
  })
);

// =============================================
// 5. 로그인 (JWT 발급)
// =============================================
app.post("/api/login", loginUser);

// =============================================
// 6. API 라우트 연결
// =============================================
app.use("/api/surveys", optionalVerifyToken, surveyRoutes);
app.use("/api/admin/dashboard", verifyToken, dashboardRoutes);
app.use("/api/users", userRoutes);
app.use("/api/branding", brandingRoutes);

// =============================================
// 7. 404 핸들러
// =============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "요청하신 API를 찾을 수 없습니다.",
    path: req.path,
  });
});

// =============================================
// 8. 글로벌 에러 핸들러
// =============================================
app.use((err, req, res, next) => {
  console.error("🔥 서버 에러 발생:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "서버 오류",
  });
});

// =============================================
// 9. 서버 실행 (Render 포트 사용 필수)
// =============================================
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("==============================================");
  console.log(`🚀 Server running on port: ${PORT}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL}`);
  console.log(`📡 API Base URL: /api`);
  console.log("==============================================");
});

// =============================================
// 10. 종료 처리
// =============================================
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.connection.close();
  process.exit(0);
});
