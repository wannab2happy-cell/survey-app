// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String },
  role: { type: String, default: 'admin' },
  // 초대 관련 필드
  inviteToken: { type: String, unique: true, sparse: true },
  invitedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  invitedAt: { type: Date },
  inviteAcceptedAt: { type: Date },
  status: { 
    type: String, 
    enum: ['active', 'invited', 'pending'], 
    default: 'active' 
  },
  name: { type: String }, // 초대 시 이름
}, {
  timestamps: true
});

export default mongoose.model('User', UserSchema);
