// src/models/answer.js (최종 ESM 버전, 관계 설정 포함)

import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Answer = sequelize.define('Answer', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        responseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        questionId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        value: { // 응답 값 (객관식 옵션, 주관식 텍스트 등)
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        tableName: 'Answers',
        // 기타 모델 옵션
    });

    // ------------------------------------------------
    // ✅ 관계 설정 (associate)
    // ------------------------------------------------
    Answer.associate = (db) => {
        // 1. Answer는 Question에 속한다 (N:1 관계)
        db.Answer.belongsTo(db.Question, {
            foreignKey: 'questionId',
            onDelete: 'CASCADE',
            as: 'Question'
        });

        // 2. Answer는 Response에 속한다 (N:1 관계)
        db.Answer.belongsTo(db.Response, {
            foreignKey: 'responseId',
            onDelete: 'CASCADE',
            as: 'Response' // dashboardController에서 Response ID를 가져올 때 사용됩니다.
        });
    };

    return Answer;
};