// src/models/response.js (최종 ESM 버전, 관계 설정 포함)

import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Response = sequelize.define('Response', {
        id: {
            allowNull: false,
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER,
        },
        surveyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        // 응답을 제출한 사용자 ID (옵션: 비회원 응답도 가능하므로 allowNull: true)
        userId: { 
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        submittedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        }
    }, {
        tableName: 'Responses', 
        // Sequelize가 createdAt/updatedAt을 자동으로 관리하도록 설정 (기본값)
    });

    // ------------------------------------------------
    // ✅ 관계 설정 (associate)
    // ------------------------------------------------
    Response.associate = (db) => {
        // 1. Response는 Survey에 속한다 (N:1 관계)
        db.Response.belongsTo(db.Survey, {
            foreignKey: 'surveyId',
            onDelete: 'CASCADE',
            as: 'Survey'
        });

        // 2. Response는 여러 개의 Answer를 가진다 (1:N 관계)
        db.Response.hasMany(db.Answer, {
            foreignKey: 'responseId',
            onDelete: 'CASCADE',
            as: 'Answers'
        });
    };

    return Response;
};