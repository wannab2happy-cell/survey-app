// src/models/Setting.js

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Setting = sequelize.define('Setting', {
    // 키 (예: 'primary_color', 'font_family')
    key: { 
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // 키는 하나만 존재해야 합니다.
        primaryKey: true 
    },
    // 값 (예: '#007AFF', 'Nanum Gothic')
    value: { 
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    timestamps: true,
    tableName: 'Settings'
});

export default Setting;