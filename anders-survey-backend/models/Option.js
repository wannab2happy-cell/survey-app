// src/models/Option.js

import { DataTypes } from 'sequelize'; // DataTypes import 추가

export default (sequelize) => {
    const Option = sequelize.define('Option', {
        question_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        text: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        order: { // 옵션 순서
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1,
        }
    }, {
        // 기타 모델 옵션
    });

    return Option;
};
