'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Quizzes', 'timeLimitMinutes', { type: Sequelize.INTEGER, allowNull: true });
    await queryInterface.addColumn('Quizzes', 'availableFromDate', { type: Sequelize.DATE, allowNull: true });
    await queryInterface.addColumn('Quizzes', 'availableToDate', { type: Sequelize.DATE, allowNull: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Quizzes', 'timeLimitMinutes');
    await queryInterface.removeColumn('Quizzes', 'availableFromDate');
    await queryInterface.removeColumn('Quizzes', 'availableToDate');
  }
};
