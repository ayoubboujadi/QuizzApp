'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'password', { type: Sequelize.STRING, allowNull: false });
    await queryInterface.addColumn('Users', 'lastLogin', { type: Sequelize.DATE });
    await queryInterface.addColumn('Users', 'isEnabled', { type: Sequelize.BOOLEAN, defaultValue: true });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'password');
    await queryInterface.removeColumn('Users', 'lastLogin');
    await queryInterface.removeColumn('Users', 'isEnabled');
  }
};
