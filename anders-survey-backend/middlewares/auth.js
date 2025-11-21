// 통합 인증 미들웨어
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET 환경 변수가 설정되지 않았습니다. 기본 키를 사용합니다.');
}

/**
 * JWT 토큰 검증 미들웨어
 * Authorization 헤더에서 Bearer 토큰을 추출하여 검증합니다.
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        success: false,
        message: '인증 토큰이 제공되지 않았습니다.' 
      });
    }

    // Bearer 토큰 형식 확인
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false,
        message: '유효하지 않은 토큰 형식입니다.' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: '토큰이 없습니다.' 
      });
    }

    // 토큰 검증
    const decoded = jwt.verify(token, JWT_SECRET || 'default_secret_key');
    
    // req.user에 사용자 정보 저장
    req.user = decoded;
    next();
    
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        message: '토큰이 만료되었습니다.' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ 
        success: false,
        message: '유효하지 않은 토큰입니다.' 
      });
    }
    
    console.error('토큰 검증 오류:', error);
    return res.status(500).json({ 
      success: false,
      message: '서버 오류가 발생했습니다.' 
    });
  }
};

/**
 * 선택적 토큰 검증 미들웨어
 * 토큰이 있으면 검증하고, 없으면 그냥 통과시킵니다.
 */
export const optionalVerifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    // 토큰이 없으면 그냥 통과
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      req.user = null;
      return next();
    }

    // 토큰 검증 시도
    try {
      const decoded = jwt.verify(token, JWT_SECRET || 'default_secret_key');
      req.user = decoded;
    } catch (error) {
      // 토큰이 만료되었거나 유효하지 않으면 그냥 통과 (에러 무시)
      console.log('선택적 토큰 검증 실패 (무시):', error.message);
      req.user = null;
    }
    
    next();
  } catch (error) {
    // 예상치 못한 에러가 발생해도 통과
    console.error('선택적 토큰 검증 오류:', error);
    req.user = null;
    next();
  }
};

/**
 * 관리자 권한 확인 미들웨어
 * verifyToken 미들웨어 이후에 사용해야 합니다.
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: '인증이 필요합니다.' 
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false,
      message: '관리자 권한이 필요합니다.' 
    });
  }

  next();
};

/**
 * 편집자 이상 권한 확인 미들웨어 (admin, editor)
 * verifyToken 미들웨어 이후에 사용해야 합니다.
 */
export const requireEditor = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: '인증이 필요합니다.' 
    });
  }

  if (req.user.role !== 'admin' && req.user.role !== 'editor') {
    return res.status(403).json({ 
      success: false,
      message: '편집 권한이 필요합니다.' 
    });
  }

  next();
};

/**
 * 조회자 이상 권한 확인 미들웨어 (admin, editor, viewer)
 * verifyToken 미들웨어 이후에 사용해야 합니다.
 */
export const requireViewer = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ 
      success: false,
      message: '인증이 필요합니다.' 
    });
  }

  const allowedRoles = ['admin', 'editor', 'viewer'];
  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      message: '조회 권한이 필요합니다.' 
    });
  }

  next();
};

// 하위 호환성을 위한 별칭 (기존 코드와의 호환성 유지)
export const protect = verifyToken;
export const admin = requireAdmin;
