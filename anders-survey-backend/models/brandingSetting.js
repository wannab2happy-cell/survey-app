// src/models/brandingSetting.js (ESM)

import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const BrandingSetting = sequelize.define('BrandingSetting', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER,
    },
    primaryColor: {
      type: DataTypes.STRING,
      allowNull: true, // 설정 안 할 경우 기본값 사용
      defaultValue: '#007bff', // 기본값 설정
    },
    keyVisualUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    headerImageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    footerText: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  }, {
    tableName: 'BrandingSettings',
  });

  return BrandingSetting;
};