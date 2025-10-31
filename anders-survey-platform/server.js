// Express 애플리케이션 생성 및 설정
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // ⭐ 1. CORS 모듈 추가
const models = require('./src/models');
const authRoutes = require('./src/routes/auth.routes'); // ⭐ 2. 인증 라우터 로드

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
// ⭐ 3. CORS 설정: 프론트엔드 서버 주소만 허용 (http://localhost:5173)
app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 데이터베이스 연결 및 모델 동기화
models.sequelize.sync().then(() => {
    console.log('✅ All models were synchronized successfully (Tables checked/created).');
}).catch(err => {
    console.error('❌ Failed to synchronize database models:', err);
});

// ⭐ 4. 라우터 연결: /api/auth 경로로 인증 관련 요청을 연결
app.use('/api/auth', authRoutes);

// 기본 루트 경로
app.get('/', (req, res) => {
    res.send('Anders Survey Platform Backend API is running.');
});

// 서버 시작
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
    console.log(`URL: http://localhost:${PORT}/`);
});
