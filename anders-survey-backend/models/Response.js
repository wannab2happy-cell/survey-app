// models/Response.js
import mongoose from 'mongoose';

const AnswerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId }, // Survey.questions 내 ObjectId
  value: { type: mongoose.Schema.Types.Mixed },          // 텍스트 or 선택지 값
  createdAt: { type: Date, default: Date.now },
});

const ResponseSchema = new mongoose.Schema({
  surveyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Survey' },
  answers: [AnswerSchema],
  personalInfo: { type: mongoose.Schema.Types.Mixed, default: {} }, // 개인정보 수집 데이터
  consentChecked: { type: Boolean, default: false }, // 동의 여부
  submittedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Response', ResponseSchema);
