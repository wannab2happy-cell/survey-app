// src/app.js (Mongoose 버전)

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

// .env 파일 로드 및 환경 변수 설정
dotenv.config();

import db from './models/index.js'; 
import router from './routes/index.js';
import brandingRoutes from './routes/brandingRoutes.js'; 
import dashboardRoutes from './routes/dashboardRoutes.js';
import authRoutes from './routes/authRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// CORS 설정
const allowedOrigins = process.env.CLIENT_URL 
  ? process.env.CLIENT_URL.split(',').map(url => url.trim())
  : ['http://localhost:5173'];

const corsOptions = {
  origin: function (origin, callback) {
    // 개발 환경에서는 origin이 없는 요청도 허용 (Postman, curl 등)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true,
  optionsSuccessStatus: 200,
};

// 미들웨어 설정
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 요청 로깅 미들웨어 (개발 환경)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// 라우트 설정
app.use('/api', router);
app.use('/api/branding', brandingRoutes);
app.use('/api/admin/dashboard', dashboardRoutes);
app.use('/api/auth', authRoutes); 

// 404 핸들러 (라우트 이후에 위치)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '요청한 리소스를 찾을 수 없습니다.',
    path: req.path,
  });
});

// 전역 에러 핸들러 (모든 미들웨어 이후에 위치)
app.use((err, req, res, next) => {
  console.error(`[${new Date().toISOString()}] Error:`, err);
  
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      success: false,
      message: 'CORS 정책에 의해 요청이 차단되었습니다.',
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || '서버 오류가 발생했습니다.',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// 초기 관리자 계정 생성 함수
const initializeAdminUser = async () => {
    try {
        const { User } = db;
        
        const adminUsername = process.env.ADMIN_USERNAME || 'andersadmin';
        const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
        
        // 기존 관리자 계정 확인
        const existingAdmin = await User.findOne({ 
            username: adminUsername 
        });
        
        if (!existingAdmin) {
            // 비밀번호 해시화
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            
            // 관리자 계정 생성
            await User.create({
                username: adminUsername,
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
            });
            
            console.log(`💡 관리자 계정 생성 완료: ID(${adminUsername}), PW(${adminPassword})`);
            console.log('⚠️  프로덕션 환경에서는 환경 변수를 통해 관리자 계정을 설정하세요.');
        } else {
            console.log(`ℹ️  관리자 계정이 이미 존재합니다: ${adminUsername}`);
        }
    } catch (error) {
        console.error('❌ 초기 관리자 계정 생성 오류:', error.message);
        console.error('Error details:', error);
    }
};

// 서버 시작 함수
const startServer = async () => {
    try {
        // MongoDB 연결은 models/index.js에서 이미 수행됨
        console.log('✅ MongoDB 연결 확인 완료');
        
        // 초기 관리자 계정 생성
        await initializeAdminUser();
        
        app.listen(PORT, () => {
            console.log('\n==============================================');
            console.log(`🚀 플랫폼 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
            console.log(`📡 API URL: http://localhost:${PORT}/api/`);
            console.log(`🌍 환경: ${process.env.NODE_ENV || 'development'}`);
            console.log('==============================================\n');
        });
    } catch (error) {
        console.error('❌ 서버 시작 오류:', error);
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
        process.exit(1); // 오류 시 프로그램 종료
    }
};

// Graceful shutdown 처리
process.on('SIGTERM', async () => {
  console.log('SIGTERM 신호를 받았습니다. 서버를 종료합니다...');
  await db.mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT 신호를 받았습니다. 서버를 종료합니다...');
  await db.mongoose.connection.close();
  process.exit(0);
});

startServer(); // 함수 호출
