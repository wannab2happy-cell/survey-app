// migrations/날짜-create-branding-setting-table.js 파일 내부

export default { 
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('BrandingSettings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.DataTypes.INTEGER,
      },
      primaryColor: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
        defaultValue: '#007bff', 
      },
      keyVisualUrl: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      headerImageUrl: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      footerText: {
        type: Sequelize.DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DataTypes.DATE,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('BrandingSettings');
  }
};