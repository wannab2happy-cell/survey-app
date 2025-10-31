// server.js 파일 전체 내용 (MongoDB 연결 추가)

// 1. 필요한 라이브러리 불러오기
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // MongoDB 연결을 위한 Mongoose 라이브러리

// 2. DB 연결 문자열 설정 (★ 이 부분을 반드시 수정해야 합니다! ★)
// <db_password> 부분에 MongoDB Atlas에서 설정한 실제 비밀번호를 넣으세요.
const DB_URI = 'mongodb+srv://andersidea_db_user:ym7K8oo3UAmok3j7@andersidea.lxgxjfc.mongodb.net/?appName=andersidea';

// 3. Mongoose를 사용하여 MongoDB에 연결
mongoose.connect(DB_URI, {
    // useNewUrlParser: true,  // Mongoose 6.0 이상에서는 기본값이므로 생략 가능
    // useUnifiedTopology: true, // Mongoose 6.0 이상에서는 기본값이므로 생략 가능
})
.then(() => {
    console.log('✅ MongoDB Atlas 연결 성공!');
    initializeDatabase(); // DB 연결 성공 시 초기 데이터 생성 함수 실행
})
.catch(err => {
    console.error('❌ MongoDB Atlas 연결 실패:', err.message);
    // 연결 실패 시 서버가 바로 꺼지지 않도록 여기서 exit하지 않습니다.
});

// 4. Mongoose 모델 정의 (사용자 계정 정보 저장용)
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // 실제 프로젝트에서는 해싱(암호화) 필요
    role: { type: String, default: 'admin' }
});

const User = mongoose.model('User', UserSchema);

// 5. 초기 데이터 생성 함수
async function initializeDatabase() {
    try {
        const adminUserCount = await User.countDocuments({ username: 'andersadmin' });

        if (adminUserCount === 0) {
            // 임시 관리자 계정 생성 (테스트용)
            await User.create({
                username: 'andersadmin',
                password: 'password123', // ★ 테스트용 비밀번호입니다. ★
                role: 'admin'
            });
            console.log('💡 테스트용 관리자 계정 생성 완료: ID(andersadmin), PW(password123)');
        }
    } catch (error) {
        console.error('초기 데이터 생성 중 오류 발생:', error);
    }
}


// 6. Express 앱 설정 (CORS, JSON 미들웨어 등)
const app = express();
const PORT = 3000;
// ... (이하 CORS 설정 및 미들웨어는 이전과 동일) ...

// CORS 설정 (프론트엔드 URL을 정확히 명시)
const allowedOrigins = [
    'http://localhost:5173',
    'https://andersidea.github.io/anders-survey-platform'
];

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`Not allowed by CORS: ${origin}`));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// 7. [실제 로그인 API] 사용자 인증 라우트 (DB 연동)
// 주소: http://localhost:3000/api/login
app.post('/api/login', async (req, res) => {
    console.log('✅ 프론트엔드에서 로그인 요청 수신:', req.body);
    const { username, password } = req.body;

    // 7-1. DB에서 사용자 찾기
    const user = await User.findOne({ username });

    if (!user) {
        console.log('❌ 로그인 실패: 사용자를 찾을 수 없음');
        return res.status(401).json({ message: '사용자 이름이 잘못되었습니다.' });
    }

    // 7-2. 비밀번호 확인 (실제는 암호화 비교 로직 필요)
    if (user.password === password) { 
        console.log('👍 로그인 성공!');
        // 실제 프로젝트에서는 JWT 토큰 생성 및 반환
        return res.status(200).json({ 
            message: '로그인 성공!',
            token: 'valid_jwt_token',
            role: user.role
        });
    } else {
        console.log('❌ 로그인 실패: 비밀번호 불일치');
        return res.status(401).json({ message: '비밀번호가 잘못되었습니다.' });
    }
});

// 8. 서버 시작
app.listen(PORT, () => {
    console.log(`\n==============================================`);
    console.log(`✅ 백엔드 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
    console.log(`==============================================\n`);
});