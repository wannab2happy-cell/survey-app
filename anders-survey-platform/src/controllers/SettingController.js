// src/controllers/SettingController.js (Mongoose 버전)

import db from '../models/index.js';

const { Survey } = db;

// Survey 생성 (user_id not null 오류 해결)
export const createSurvey = async (req, res) => {
    try {
        const { title, description, questions, adminToken } = req.body;
        
        // authMiddleware에서 저장한 user_id를 가져옵니다.
        // req.user가 있는지 먼저 확인합니다.
        const userId = req.user ? req.user.id : null; 

        // user_id가 없으면 DB 저장 전에 인증 실패로 처리
        if (!userId) {
            return res.status(401).json({ error: '인증 실패: 유효한 사용자 ID를 찾을 수 없습니다. (토큰 오류)' });
        }
        
        // 1. 설문 기본 정보 생성
        const newSurvey = await Survey.create({
            title,
            description,
            userId: userId, // MongoDB는 ObjectId 사용
            status: 'draft',
            questions: questions ? questions.map((q, index) => ({
                content: q.content,
                type: q.type || 'TEXT',
                options: q.options || [],
                order: q.order || index
            })) : []
        });

        return res.status(201).json({
            message: '✅ 설문지가 성공적으로 저장되었습니다!',
            surveyId: newSurvey._id,
        });
    } catch (error) {
        console.error('설문 생성 중 오류:', error); 
        return res.status(500).json({ error: '설문지 생성 중 서버 오류가 발생했습니다.', details: error.message });
    }
};

// 누락 함수 1: 모든 설문 조회 (라우터에서 필요)
export const getSurveys = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ error: '인증 정보가 없습니다.' });
        }
        const surveys = await Survey.find({ userId: req.user.id });
        return res.status(200).json(surveys);
    } catch (error) {
        return res.status(500).json({ error: '설문 목록 조회 중 오류가 발생했습니다.', details: error.message });
    }
};

// 누락 함수 2: ID로 특정 설문 조회 (라우터에서 필요)
export const getSurveyById = async (req, res) => {
    try {
        const { surveyId } = req.params;
        const survey = await Survey.findById(surveyId);
        if (!survey) {
            return res.status(404).json({ error: '설문을 찾을 수 없습니다.' });
        }
        return res.status(200).json(survey);
    } catch (error) {
        return res.status(500).json({ error: '설문 조회 중 오류가 발생했습니다.', details: error.message });
    }
};

// 누락 함수 3: 설문 결과 조회 (라우터에서 필요)
export const getSurveyResults = async (req, res) => {
    return res.status(501).json({ message: '설문 결과 조회 기능이 아직 구현되지 않았습니다.' });
};
