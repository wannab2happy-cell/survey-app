import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET 환경 변수가 설정되지 않았습니다.');
}

export const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 입력 검증
    if (!username || !password) {
      return res.status(400).json({ 
        success: false,
        message: "사용자 이름과 비밀번호를 입력해주세요." 
      });
    }

    // 기존: const user = await User.findOne({ username });
    // 개선: username 혹은 email 로 조회
    const user = await User.findOne({
      $or: [{ username }, { email: username }]
    });
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: "사용자 이름이 잘못되었습니다." 
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false,
        message: "비밀번호가 잘못되었습니다." 
      });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role },
      JWT_SECRET || "default_secret_key",
      { expiresIn: "2h" }
    );

    res.status(200).json({
      success: true,
      message: "로그인 성공!",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("로그인 처리 오류:", err);
    res.status(500).json({ 
      success: false,
      message: "서버 오류가 발생했습니다." 
    });
  }
};

// 프로필 조회
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    });
  } catch (error) {
    console.error('프로필 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로필 조회 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};

// 프로필 업데이트
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { username, email, name, currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '인증이 필요합니다.'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '사용자를 찾을 수 없습니다.'
      });
    }

    // username 변경 시 중복 확인
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: '이미 사용 중인 사용자명입니다.'
        });
      }
      user.username = username;
    }

    // email 변경
    if (email !== undefined) {
      // 이메일 형식 검증
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (email && !emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: '올바른 이메일 형식이 아닙니다.'
        });
      }
      user.email = email;
    }

    // name 변경
    if (name !== undefined) {
      user.name = name;
    }

    // 비밀번호 변경
    if (newPassword) {
      // 현재 비밀번호 확인 필수
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: '현재 비밀번호를 입력해주세요.'
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: '현재 비밀번호가 일치하지 않습니다.'
        });
      }

      // 새 비밀번호 길이 검증
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: '새 비밀번호는 최소 6자 이상이어야 합니다.'
        });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: '프로필이 업데이트되었습니다.',
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('프로필 업데이트 오류:', error);
    res.status(500).json({
      success: false,
      message: '프로필 업데이트 중 오류가 발생했습니다.',
      error: error.message
    });
  }
};
