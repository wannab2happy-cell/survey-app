// models/Survey.js
import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  content: { type: String, required: true }, // 질문 내용
  type: { type: String, enum: ['TEXT', 'TEXTAREA', 'RADIO', 'CHECKBOX', 'DROPDOWN', 'STAR_RATING', 'SCALE'], required: true },
  options: { type: [String], default: [] }, // 선택지 목록
  order: { type: Number, default: 0 },
  required: { type: Boolean, default: false }, // 필수 응답 여부
});

// 커스텀 필드 서브도큐먼트 스키마
const CustomFieldSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  label: { type: String, required: true },
  type: { type: String, default: 'text' },
  required: { type: Boolean, default: false }
}, { _id: false });

const PersonalInfoSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: false }, // 개인정보 수집 활성화 여부
  fields: { type: [String], default: [] }, // 수집할 필드 목록 (name, phone, email 등)
  consentText: { type: String, default: '' }, // 동의 문구
  consentRequired: { type: Boolean, default: false }, // 동의 필수 여부
  customFields: { type: [CustomFieldSchema], default: [] } // 커스텀 필드 배열
}, { _id: false });

const BrandingSchema = new mongoose.Schema({
  primaryColor: { type: String, default: '#4F46E5' },
  secondaryColor: { type: String, default: '#00A3FF' },
  tertiaryColor: { type: String, default: '#22C55E' },
  font: { type: String, default: 'Noto Sans KR' },
  buttonShape: { type: String, default: 'rounded-lg' },
  logoBase64: { type: String, default: '' },
  bgImageBase64: { type: String, default: '' }
}, { _id: false });

const CoverSchema = new mongoose.Schema({
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  imageBase64: { type: String, default: '' }
}, { _id: false });

const EndingSchema = new mongoose.Schema({
  title: { type: String, default: '설문이 완료되었습니다!' },
  description: { type: String, default: '귀하의 소중한 의견에 감사드립니다.' },
  imageBase64: { type: String, default: '' }
}, { _id: false });

const SurveySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  questions: [QuestionSchema],               // 질문 배열
  personalInfo: { type: PersonalInfoSchema, default: { enabled: false } }, // 개인정보 수집 설정
  branding: { type: BrandingSchema, default: {} }, // 브랜딩 설정
  cover: { type: CoverSchema, default: {} }, // 커버 페이지 설정
  ending: { type: EndingSchema, default: {} }, // 완료 페이지 설정
  status: { type: String, enum: ['active', 'inactive', 'scheduled', 'paused'], default: 'inactive' }, // 설문 상태
  startAt: { type: Date }, // 시작 일시
  endAt: { type: Date }, // 종료 일시
  createdAt: { type: Date, default: Date.now },
});

// 모델이 이미 존재하면 삭제하고 다시 생성 (스키마 변경 시 필요)
if (mongoose.models.Survey) {
  delete mongoose.models.Survey;
}

export default mongoose.model('Survey', SurveySchema);
