// src/models/Survey.js

import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Survey = sequelize.define('Survey', {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        user_id: { // 설문을 생성한 사용자 ID (외래 키)
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        status: { // 설문 상태 (예: 'draft', 'published', 'closed')
            type: DataTypes.STRING,
            defaultValue: 'draft',
            allowNull: false,
        }
    }, {
        // 모델 이름 유지
        tableName: 'Surveys',
    });

    Survey.associate = (models) => {
        // Survey는 여러 개의 Question을 가질 수 있습니다.
        Survey.hasMany(models.Question, {
            foreignKey: 'surveyId', // Question 테이블의 컬럼 이름
            as: 'questions', // 별칭
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Survey는 여러 개의 Response를 가질 수 있습니다.
        Survey.hasMany(models.Response, {
            foreignKey: 'surveyId',
            as: 'responses',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Survey;
};
