// src/controllers/brandingController.js (Mongoose 버전)

import db from '../models/index.js';
const { BrandingSetting } = db;

/**
 * 💡 [PUT /api/admin/branding] 관리자가 브랜딩 설정을 저장/업데이트
 * @param {object} req - 요청 객체 (primaryColor, keyVisualUrl 등 포함)
 * @param {object} res - 응답 객체
 */
export const updateBrandingSetting = async (req, res) => {
    try {
        // 관리자 인증 로직 (현재는 생략)
        // if (!req.user || req.user.role !== 'admin') { return res.status(403).json({ message: '접근 권한이 없습니다.' }); }

        const { primaryColor, keyVisualUrl, headerImageUrl, footerText } = req.body;

        // BrandingSetting은 단일 문서만 유지합니다.
        let setting = await BrandingSetting.findOne();

        if (!setting) {
            // 설정이 없으면 새로 생성
            setting = await BrandingSetting.create({
                primaryColor, 
                keyVisualUrl, 
                headerImageUrl, 
                footerText 
            });
        } else {
            // 설정이 있으면 업데이트
            setting.primaryColor = primaryColor;
            setting.keyVisualUrl = keyVisualUrl;
            setting.headerImageUrl = headerImageUrl;
            setting.footerText = footerText;
            await setting.save();
        }

        return res.status(200).json({
            status: 'success',
            message: '브랜딩 설정이 성공적으로 업데이트되었습니다.',
            data: setting
        });
    } catch (error) {
        console.error("브랜딩 설정 업데이트 오류:", error);
        return res.status(500).json({ message: '서버 오류 발생', error: error.message });
    }
};

/**
 * 💡 [GET /api/branding] 응답자에게 브랜딩 설정 조회
 * @param {object} req - 요청 객체
 * @param {object} res - 응답 객체
 */
export const getBrandingSetting = async (req, res) => {
    try {
        // 단일 설정 문서 조회
        const setting = await BrandingSetting.findOne();

        // 설정이 없으면 기본값으로 응답
        if (!setting) {
            return res.status(200).json({
                status: 'success',
                data: {
                    primaryColor: '#007bff', // 기본 파란색
                    keyVisualUrl: null,
                    headerImageUrl: null,
                    footerText: null
                }
            });
        }

        return res.status(200).json({
            status: 'success',
            data: {
                primaryColor: setting.primaryColor,
                keyVisualUrl: setting.keyVisualUrl,
                headerImageUrl: setting.headerImageUrl,
                footerText: setting.footerText
            }
        });
    } catch (error) {
        console.error("브랜딩 설정 조회 오류:", error);
        return res.status(500).json({ message: '서버 오류 발생', error: error.message });
    }
};
