// src/models/Response.js (Mongoose 버전)

import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId }, // Survey.questions 내 ObjectId
  value: { type: mongoose.Schema.Types.Mixed }, // 텍스트 or 선택지 값
  createdAt: { type: Date, default: Date.now },
});

const ResponseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey', required: true },
  answers: [AnswerSchema],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 응답을 제출한 사용자 ID (옵션)
  submittedAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

export default mongoose.model('Response', ResponseSchema);
