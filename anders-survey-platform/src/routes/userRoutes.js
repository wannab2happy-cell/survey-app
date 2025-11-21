import express from 'express';
import { inviteUser, getInvitedUsers, deleteInvite } from '../controllers/UserController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

// 사용자 초대 (POST /api/users/invite)
router.post('/invite', authMiddleware, inviteUser);

// 초대된 사용자 목록 (GET /api/users/invited)
router.get('/invited', authMiddleware, getInvitedUsers);

// 초대 취소 (DELETE /api/users/invite/:userId)
router.delete('/invite/:userId', authMiddleware, deleteInvite);

export default router;
