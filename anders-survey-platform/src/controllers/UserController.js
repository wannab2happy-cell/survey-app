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

// 사용자 초대 (관리자 전용)
export const inviteUser = async (req, res) => {
    try {
        // 관리자 권한 확인 (미들웨어에서 처리되지만 이중 확인)
        if (!req.user || !req.user.id) { // req.user.role 체크는 미들웨어에 맡김
             return res.status(401).json({ message: '인증이 필요합니다.' });
        }

        const { name, email, role } = req.body;

        if (!name || !email) {
            return res.status(400).json({ message: '이름과 이메일은 필수입니다.' });
        }

        // 이미 존재하는 사용자인지 확인
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: '이미 등록된 이메일입니다.' });
        }

        // 초대 토큰 생성 (유효기간 7일)
        const inviteToken = jwt.sign(
            { email, role, type: 'invite' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        // 클라이언트 URL 처리 (와일드카드 및 다중 URL 대응)
        let clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        
        // 1. 콤마로 구분된 경우 첫 번째 URL 사용
        if (clientUrl.includes(',')) {
            clientUrl = clientUrl.split(',')[0].trim();
        }

        // 2. 와일드카드(*) 처리 - Vercel 프리뷰 배포 대응
        // MAIN_CLIENT_URL 환경 변수가 있으면 최우선 사용
        if (process.env.MAIN_CLIENT_URL) {
            clientUrl = process.env.MAIN_CLIENT_URL.trim();
        } else if (clientUrl.includes('*')) {
            // 와일드카드가 있으면 제거하거나 기본값으로 대체
            // 예: https://*.vercel.app -> https://survey-app.vercel.app (기본값 필요)
            // 여기서는 와일드카드가 포함된 경우, 현재 요청의 Origin 헤더를 사용할 수 있으면 사용
            const reqOrigin = req.headers.origin;
            if (reqOrigin && (reqOrigin.includes('vercel.app') || reqOrigin.includes('localhost'))) {
                clientUrl = reqOrigin;
            } else {
                // 최후의 수단: 와일드카드 제거 (불완전할 수 있음)
                clientUrl = clientUrl.replace('*.', ''); 
            }
        }
        
        // 끝에 슬래시 제거
        clientUrl = clientUrl.replace(/\/$/, '');

        const inviteLink = `${clientUrl}/accept-invite?token=${inviteToken}`;

        // 임시 사용자 생성 (선택사항: 초대 상태 추적을 위해)
        // 비밀번호는 임의로 설정하거나 null로 허용해야 함 (스키마 확인 필요)
        // 여기서는 DB에 저장하지 않고 링크만 반환하는 Stateless 방식으로 구현 (프론트엔드 요청에 맞춤)
        
        // 하지만 프론트엔드에서 목록을 다시 불러오므로 DB에 저장하는 것이 좋음
        // User 스키마가 password required인 경우 더미 비밀번호 사용
        const tempPassword = await bcrypt.hash(Math.random().toString(36), 10);
        
        const newUser = await User.create({
            username: name, // 이름으로 사용
            email,
            password: tempPassword,
            role: role || 'viewer',
            status: 'invited', // 스키마에 status 필드가 없다면 무시될 수 있음
            invitedAt: new Date()
        });

        return res.status(201).json({
            success: true,
            message: '초대 링크가 생성되었습니다.',
            data: {
                inviteLink,
                user: {
                    id: newUser._id,
                    name: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                }
            }
        });

    } catch (error) {
        console.error('사용자 초대 오류:', error);
        return res.status(500).json({ message: '사용자 초대 중 오류가 발생했습니다.', error: error.message });
    }
};

// 초대된 사용자 목록 조회
export const getInvitedUsers = async (req, res) => {
    try {
        // status가 'invited'이거나 특정 조건의 사용자 조회
        // 스키마에 status가 없다면 로직 수정 필요
        // 여기서는 모든 사용자를 조회하되, 비밀번호 제외
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        
        return res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('사용자 목록 조회 오류:', error);
        return res.status(500).json({ message: '사용자 목록을 불러오는 중 오류가 발생했습니다.' });
    }
};

// 초대 취소 (사용자 삭제)
export const deleteInvite = async (req, res) => {
    try {
        const { userId } = req.params;
        const deletedUser = await User.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        }

        return res.status(200).json({
            success: true,
            message: '초대가 취소되었습니다.'
        });
    } catch (error) {
        console.error('초대 취소 오류:', error);
        return res.status(500).json({ message: '초대 취소 중 오류가 발생했습니다.' });
    }
};
