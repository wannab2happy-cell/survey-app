// src/controllers/brandingController.js (ESM)

import db from '../models/index.js'; // DB 모델 가져오기
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

        // BrandingSetting 테이블은 설정이 하나만 존재해야 합니다. (WHERE id = 1)
        let setting = await BrandingSetting.findByPk(1);

        if (!setting) {
            // 설정이 없으면 새로 생성
            setting = await BrandingSetting.create({
                id: 1, // id를 1로 고정
                primaryColor, 
                keyVisualUrl, 
                headerImageUrl, 
                footerText 
            });
        } else {
            // 설정이 있으면 업데이트
            setting = await setting.update({
                primaryColor,
                keyVisualUrl,
                headerImageUrl,
                footerText
            });
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
        // ID 1번 설정을 조회
        const setting = await BrandingSetting.findByPk(1, {
            // 응답자에게는 불필요한 DB 필드 제외
            attributes: ['primaryColor', 'keyVisualUrl', 'headerImageUrl', 'footerText']
        });

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
            data: setting
        });
    } catch (error) {
        console.error("브랜딩 설정 조회 오류:", error);
        return res.status(500).json({ message: '서버 오류 발생', error: error.message });
    }
};