import jwt from 'jsonwebtoken';

// UserController.js에서 사용된 키와 동일해야 합니다!
const JWT_SECRET = 'your_super_secret_key'; 

export const authMiddleware = (req, res, next) => {
    // 1. Authorization 헤더 (Bearer)에서 토큰 추출 시도
    let token = req.headers.authorization;

    if (token && token.startsWith('Bearer ')) {
        token = token.slice(7, token.length); 
    } else {
        // 2. 프론트엔드에서 req.body로 보낸 adminToken 추출 시도
        token = req.body.adminToken || token;
    }
    
    if (!token) {
        return res.status(401).json({ error: '인증 실패: 토큰이 제공되지 않았습니다.' });
    }

    try {
        // 3. 토큰 검증 및 해독
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 4. 해독된 유저 ID를 req.user 객체에 저장
        // SurveyController에서 req.user.id로 접근하게 됩니다.
        req.user = { id: decoded.id }; 

        next();
    } catch (err) {
        console.error('JWT 검증 실패:', err.message);
        return res.status(401).json({ error: '인증 실패: 유효하지 않은 토큰입니다.' });
    }
};
