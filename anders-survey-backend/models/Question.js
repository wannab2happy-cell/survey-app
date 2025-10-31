// src/models/question.js (수정할 부분)

import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Question = sequelize.define('Question', {
        surveyId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        type: { // 질문 유형 (예: 'TEXT', 'RADIO', 'CHECKBOX')
            type: DataTypes.STRING,
            allowNull: false,
        },
        options: { // RADIO/CHECKBOX용 옵션 (JSON 문자열)
            type: DataTypes.TEXT,
            allowNull: true,
            get() {
                // DB에서 가져올 때 JSON 파싱
                const value = this.getDataValue('options');
                return value ? JSON.parse(value) : null;
            },
            set(val) {
                // DB에 저장할 때 JSON 문자열화
                this.setDataValue('options', val ? JSON.stringify(val) : null);
            }
        },
        order: { // 질문 순서
            type: DataTypes.INTEGER,
            allowNull: false,
        }
    }, {
        // 모델 이름 유지
        tableName: 'Questions',
    });

    Question.associate = (models) => {
        // Question은 하나의 Survey에 속합니다. (N:1 관계)
        Question.belongsTo(models.Survey, {
            foreignKey: 'surveyId',
            as: 'survey',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });

        // Question은 여러 개의 Answer를 가질 수 있습니다. (1:N 관계)
        Question.hasMany(models.Answer, {
            foreignKey: 'questionId',
            as: 'answers',
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE'
        });
    };

    return Question;
};
