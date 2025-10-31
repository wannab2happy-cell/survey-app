// src/models/User.js

import { DataTypes } from 'sequelize'; // DataTypes import 추가

export default (sequelize) => {
    const User = sequelize.define('User', {
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: { // 예: 'admin', 'user'
            type: DataTypes.STRING,
            defaultValue: 'user',
        }
    }, {
        // 기타 모델 옵션
    });

    return User;
};