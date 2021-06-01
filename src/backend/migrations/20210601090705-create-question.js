'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Questions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      quizId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Quizzes', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      questionType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      questionText: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      points: {
        type: Sequelize.DECIMAL
      },
      useQuestionPoints: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      answersData: {
        type: Sequelize.JSON
      },
      questionData: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Questions');
  }
};