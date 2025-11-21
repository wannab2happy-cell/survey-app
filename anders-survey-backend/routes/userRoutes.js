import express from 'express';
import { 
  inviteUser, 
  getInvitedUsers, 
  getInviteByToken, 
  acceptInvite, 
  deleteInvite 
} from '../controllers/UserController.js';
import { verifyToken, requireAdmin, requireEditor } from '../middlewares/auth.js';

const router = express.Router();

// 사용자 초대 (admin, editor 가능)
router.post('/invite', verifyToken, requireEditor, inviteUser);

// 초대된 사용자 목록 조회 (admin, editor 가능)
router.get('/invited', verifyToken, requireEditor, getInvitedUsers);

// 초대 토큰으로 초대 정보 조회 (공개)
router.get('/invite/:token', getInviteByToken);

// 초대 수락 (공개)
router.post('/accept-invite', acceptInvite);

// 초대 취소/삭제 (admin, editor 가능)
router.delete('/invite/:userId', verifyToken, requireEditor, deleteInvite);

export default router;

