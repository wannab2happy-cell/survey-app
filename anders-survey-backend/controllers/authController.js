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

    const user = await User.findOne({ username });
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
