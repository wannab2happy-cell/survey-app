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
import jwt from "jsonwebtoken";

import surveyRoutes from "./routes/surveyRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

// 2. MongoDB 연결
const DB_URI = process.env.MONGO_URI;
mongoose
  .connect(DB_URI)
  .then(() => {
    console.log("✅ MongoDB Atlas 연결 성공!");
    initializeDatabase();
  })
  .catch((err) => console.error("❌ MongoDB Atlas 연결 실패:", err.message));

// 3. User 모델 정의
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
});
const User = mongoose.model("User", UserSchema);

// 4. 초기 관리자 계정 생성 (bcrypt 적용)
async function initializeDatabase() {
  try {
    const adminExists = await User.exists({ username: "andersadmin" });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash("password123", 10);
      await User.create({
        username: "andersadmin",
        password: hashedPassword,
        role: "admin",
      });
      console.log("💡 관리자 계정 생성 완료: ID(andersadmin), PW(password123)");
    }
  } catch (error) {
    console.error("초기 데이터 생성 오류:", error);
  }
}

// 5. Express 앱 생성 및 미들웨어 설정
const app = express();
app.use(express.json());

// 6. CORS 설정
const allowedOrigins = [process.env.CLIENT_URL || "http://localhost:5173"];
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};
app.use(cors(corsOptions));

// =============================================
// ✅ JWT 인증 관련 미들웨어
// =============================================
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "토큰이 없습니다." });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret_key");
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "유효하지 않은 토큰" });
  }
}

// =============================================
// ✅ 로그인 API (JWT 발급)
// =============================================
app.post("/api/login", async (req, res) => {
  console.log("✅ 로그인 요청 수신:", req.body);
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log("❌ 로그인 실패: 사용자 없음");
      return res.status(401).json({ message: "사용자 이름이 잘못되었습니다." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ 로그인 실패: 비밀번호 불일치");
      return res.status(401).json({ message: "비밀번호가 잘못되었습니다." });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      process.env.JWT_SECRET || "default_secret_key",
      { expiresIn: "2h" }
    );

    console.log("👍 로그인 성공!");
    return res.status(200).json({
      message: "로그인 성공!",
      token,
      role: user.role,
    });
  } catch (err) {
    console.error("로그인 처리 오류:", err);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});

// =============================================
// ✅ 라우트 연결
// =============================================
app.use("/api/surveys", verifyToken, surveyRoutes);
app.use("/api/admin/dashboard", verifyToken, dashboardRoutes);

// =============================================
// ✅ 서버 실행
// =============================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n==============================================`);
  console.log(`✅ 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  console.log(`==============================================\n`);
});
