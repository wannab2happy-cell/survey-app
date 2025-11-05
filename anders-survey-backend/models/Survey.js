// models/Survey.js
import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  content: { type: String, required: true }, // 질문 내용
  type: { type: String, enum: ['TEXT', 'RADIO', 'CHECKBOX'], required: true },
  options: { type: [String], default: [] }, // 선택지 목록
  order: { type: Number, default: 0 },
});

const SurveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [QuestionSchema],               // 질문 배열
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Survey', SurveySchema);
