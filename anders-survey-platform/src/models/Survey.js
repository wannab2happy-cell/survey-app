// src/models/Survey.js (Mongoose 버전)

import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  content: { type: String, required: true }, // 질문 내용
  type: { type: String, enum: ['TEXT', 'TEXTAREA', 'RADIO', 'CHECKBOX', 'DROPDOWN', 'STAR_RATING', 'SCALE'], required: true },
  options: { type: [String], default: [] }, // 선택지 목록
  order: { type: Number, default: 0 },
  required: { type: Boolean, default: false },
}, { _id: true });

const PersonalInfoSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false },
  fields: { type: [String], default: [] },
  consentText: { type: String, default: '' },
  consentRequired: { type: Boolean, default: false },
  customFields: { type: [mongoose.Schema.Types.Mixed], default: [] }
}, { _id: false });

const SurveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  slug: { type: String, unique: true, sparse: true }, // URL 친화적 식별자 (선택사항)
  questions: [QuestionSchema], // 질문 배열
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // 설문을 생성한 사용자 ID
  status: { type: String, enum: ['draft', 'published', 'closed', 'inactive', 'active', 'scheduled', 'completed'], default: 'inactive' },
  personalInfo: { type: PersonalInfoSchema, default: () => ({ enabled: false }) },
  branding: { type: mongoose.Schema.Types.Mixed, default: {} },
  cover: { type: mongoose.Schema.Types.Mixed, default: {} },
  ending: { type: mongoose.Schema.Types.Mixed, default: {} },
  head: { type: mongoose.Schema.Types.Mixed, default: {} },
  foot: { type: mongoose.Schema.Types.Mixed, default: {} },
  startAt: { type: Date, default: null },
  endAt: { type: Date, default: null },
  createdAt: { type: Date, default: Date.now },
}, {
  timestamps: true,
});

// 모델이 이미 존재하면 삭제하고 다시 생성 (스키마 변경 시 필요)
if (mongoose.models.Survey) {
  delete mongoose.models.Survey;
}

export default mongoose.model('Survey', SurveySchema);
