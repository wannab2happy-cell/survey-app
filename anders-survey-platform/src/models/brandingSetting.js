// src/models/brandingSetting.js (Mongoose 버전)

import mongoose from 'mongoose';

const BrandingSettingSchema = new mongoose.Schema({
  primaryColor: {
    type: String,
    default: '#007bff', // 기본값 설정
  },
  keyVisualUrl: {
    type: String,
    default: null,
  },
  headerImageUrl: {
    type: String,
    default: null,
  },
  footerText: {
    type: String,
    default: null,
  },
}, {
  timestamps: true, // createdAt, updatedAt 자동 생성
});

// 단일 문서만 유지하기 위한 설정
BrandingSettingSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

export default mongoose.model('BrandingSetting', BrandingSettingSchema);
