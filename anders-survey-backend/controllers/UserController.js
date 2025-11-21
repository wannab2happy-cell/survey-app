// controllers/UserController.js
import User from '../models/User.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

// 사용자 초대
export const inviteUser = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    const inviterId = req.user?.id; // 인증 미들웨어에서 설정된 사용자 ID

    // 입력 검증
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: '이름과 이메일을 입력해주세요.'
      });
    }

    // 역할 권한 검증
    const inviterRole = req.user?.role;
    const targetRole = role || 'viewer';

    // editor는 viewer만 초대 가능, admin/editor 초대 불가
    if (inviterRole === 'editor' && (targetRole === 'admin' || targetRole === 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'editor는 viewer만 초대할 수 있습니다.'
      });
    }

    // 유효한 역할인지 확인
    const validRoles = ['admin', 'editor', 'viewer'];
    if (!validRoles.includes(targetRole)) {
      return res.status(400).json({
        success: false,
        message: '유효하지 않은 역할입니다. (admin, editor, viewer 중 선택)'
      });
    }

    // 이메일 중복 확인
    const existingUser = await User.findOne({ 
      $or: [
        { email: email },
        { username: email } // 이메일을 username으로도 사용할 수 있음
      ]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: '이미 등록된 이메일입니다.'
      });
    }

    // 초대 토큰 생성
    const inviteToken = crypto.randomBytes(32).toString('hex');
    
    // 초대 만료일 (7일 후)
    const invitedAt = new Date();
    const expiresAt = new Date(invitedAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    // 임시 비밀번호 생성 (초대된 사용자는 나중에 비밀번호를 설정)
    const tempPasswordPlain = crypto.randomBytes(16).toString('hex');
    const tempPasswordHash = await bcrypt.hash(tempPasswordPlain, 10);

    // 초대된 사용자 생성 (비밀번호는 나중에 설정)
    const invitedUser = await User.create({
      username: email, // 임시로 이메일을 username으로 사용
      email: email,
      name: name,
      role: targetRole,
      password: tempPasswordHash,
      inviteToken: inviteToken,
      invitedBy: inviterId || null,
      invitedAt: invitedAt,
      status: 'invited'
    });

    // 초대 링크 생성 (프론트엔드 URL + 토큰)
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const inviteLink = `${baseUrl}/accept-invite?token=${inviteToken}`;

    res.status(201).json({
      success: true,
      message: `${name}님을 초대했습니다.`,
      data: {
        user: {
          id: invitedUser._id,
          name: invitedUser.name,
          email: invitedUser.email,
          role: invitedUser.role,
          status: invitedUser.status,
          invitedAt: invitedUser.invitedAt
        },
        inviteLink: inviteLink,
        inviteToken: inviteToken // 개발용, 프로덕션에서는 제거 권장
      }
    });
  } catch (error) {
    console.error('사용자 초대 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 초대 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 초대된 사용자 목록 조회
export const getInvitedUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'invited' })
      .populate('invitedBy', 'username name')
      .select('-password -inviteToken')
      .sort({ invitedAt: -1 });

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('초대된 사용자 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '사용자 목록을 불러오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 초대 수락 (토큰으로 사용자 정보 조회)
export const getInviteByToken = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ 
      inviteToken: token,
      status: 'invited'
    }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유효하지 않거나 만료된 초대 링크입니다.'
      });
    }

    // 초대 만료 확인 (7일)
    const daysSinceInvite = (new Date() - user.invitedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceInvite > 7) {
      return res.status(400).json({
        success: false,
        message: '초대 링크가 만료되었습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('초대 토큰 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '초대 정보를 불러오는 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 초대 수락 처리 (비밀번호 설정)
export const acceptInvite = async (req, res) => {
  try {
    const { token, password, username } = req.body;

    if (!token || !password || !username) {
      return res.status(400).json({
        success: false,
        message: '토큰, 사용자명, 비밀번호를 모두 입력해주세요.'
      });
    }

    const user = await User.findOne({ 
      inviteToken: token,
      status: 'invited'
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '유효하지 않거나 만료된 초대 링크입니다.'
      });
    }

    // 초대 만료 확인
    const daysSinceInvite = (new Date() - user.invitedAt) / (1000 * 60 * 60 * 24);
    if (daysSinceInvite > 7) {
      return res.status(400).json({
        success: false,
        message: '초대 링크가 만료되었습니다.'
      });
    }

    // username 중복 확인
    const existingUsername = await User.findOne({ username });
    if (existingUsername && existingUsername._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: '이미 사용 중인 사용자명입니다.'
      });
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(password, 10);

    // 사용자 정보 업데이트
    user.username = username;
    user.password = hashedPassword;
    user.status = 'active';
    user.inviteAcceptedAt = new Date();
    user.inviteToken = undefined; // 토큰 제거
    await user.save();

    res.status(200).json({
      success: true,
      message: '초대가 수락되었습니다. 로그인해주세요.',
      data: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('초대 수락 오류:', error);
    res.status(500).json({
      success: false,
      message: '초대 수락 처리 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 초대 취소/삭제
export const deleteInvite = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // 역할 권한 검증
    const deleterRole = req.user?.role;
    const targetRole = user.role;

    // editor는 viewer만 삭제 가능, admin/editor 삭제 불가
    if (deleterRole === 'editor' && (targetRole === 'admin' || targetRole === 'editor')) {
      return res.status(403).json({
        success: false,
        message: 'editor는 viewer만 삭제할 수 있습니다.'
      });
    }

    if (user.status !== 'invited') {
      return res.status(400).json({
        success: false,
        message: '초대 상태가 아닌 사용자는 삭제할 수 없습니다.'
      });
    }

    await User.findByIdAndDelete(userId);

    res.status(200).json({
      success: true,
      message: '초대가 취소되었습니다.'
    });
  } catch (error) {
    console.error('초대 취소 오류:', error);
    res.status(500).json({
      success: false,
      message: '초대 취소 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};