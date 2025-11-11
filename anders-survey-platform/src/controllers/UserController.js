// src/controllers/UserController.js (Mongoose 버전)

import db from '../models/index.js';
const { User } = db;
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_in_production';

// 사용자 ID를 임시로 설정합니다.
// 실제 앱에서는 JWT 토큰이나 세션을 통해 인증해야 합니다.
const TEMP_USER_ID = null; // MongoDB는 ObjectId 사용

// [TBD: 실제 사용자 ID를 반환하는 미들웨어 필요]
const getUserIdFromRequest = (req) => {
    // 실제로는 req.user.id 등 인증된 사용자 정보를 사용해야 합니다.
    // 현재는 임시로 고정된 사용자 ID를 반환합니다.
    return TEMP_USER_ID;
};

// 회원가입
const signup = async (req, res) => {
    try {
        const { username, email, password, role } = req.body;

        // 입력 validation
        if (!username || !email || !password) {
            return res.status(400).json({ 
                message: '사용자명, 이메일, 비밀번호는 필수입니다.' 
            });
        }

        // 중복 확인
        const existingUser = await User.findOne({
            $or: [
                { username: username },
                { email: email }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: '이미 존재하는 사용자명 또는 이메일입니다.' 
            });
        }

        // 비밀번호 해시화
        const hashedPassword = await bcrypt.hash(password, 10);

        // 사용자 생성
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role: role || 'user'
        });

        return res.status(201).json({
            message: '회원가입이 완료되었습니다.',
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('회원가입 오류:', error);
        return res.status(500).json({ 
            message: '서버 오류가 발생했습니다.', 
            error: error.message 
        });
    }
};

// 로그인
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 입력 validation
        if (!username || !password) {
            return res.status(400).json({ 
                message: '사용자명과 비밀번호는 필수입니다.' 
            });
        }

        // 사용자 찾기
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ 
                message: '아이디 또는 비밀번호가 잘못되었습니다.' 
            });
        }

        // 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: '아이디 또는 비밀번호가 잘못되었습니다.' 
            });
        }

        // JWT 토큰 생성
        const token = jwt.sign(
            { 
                id: user._id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(200).json({
            message: '로그인 성공',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('로그인 오류:', error);
        return res.status(500).json({ 
            message: '서버 오류가 발생했습니다.', 
            error: error.message 
        });
    }
};

// ✅ 최종 내보내기: 라우터에서 사용할 모든 함수들을 명시적으로 named export 합니다.
export { getUserIdFromRequest, signup, login };
