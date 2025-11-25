// src/models/User.js (Mongoose 버전)

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' },
  status: { type: String, enum: ['invited', 'active', 'inactive'], default: 'active' },
  invitedAt: { type: Date },
}, {
  timestamps: true,
});

export default mongoose.model('User', UserSchema);
