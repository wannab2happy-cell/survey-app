import express from 'express';
import { 
  inviteUser, 
  getInvitedUsers, 
  getInviteByToken, 
  acceptInvite, 
  deleteInvite 
} from '../controllers/UserController.js';
import { verifyToken, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// 사용자 초대 (관리자만)
router.post('/invite', verifyToken, requireAdmin, inviteUser);

// 초대된 사용자 목록 조회 (관리자만)
router.get('/invited', verifyToken, requireAdmin, getInvitedUsers);

// 초대 토큰으로 초대 정보 조회 (공개)
router.get('/invite/:token', getInviteByToken);

// 초대 수락 (공개)
router.post('/accept-invite', acceptInvite);

// 초대 취소/삭제 (관리자만)
router.delete('/invite/:userId', verifyToken, requireAdmin, deleteInvite);

export default router;

