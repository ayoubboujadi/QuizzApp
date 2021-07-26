'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CandidateSubmissions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      candidateId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Candidates', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      quizId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Quizzes', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      token: {
        type: Sequelize.STRING
      },
      dateStarted: {
        type: Sequelize.DATE
      },
      dateFinished: {
        type: Sequelize.DATE
      },
      isStarted: {
        type: Sequelize.BOOLEAN
      },
      isFinished: {
        type: Sequelize.BOOLEAN
      },
      results: {
        type: Sequelize.JSON
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
    await queryInterface.dropTable('CandidateSubmissions');
  }
};