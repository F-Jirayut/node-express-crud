'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'username', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      after: 'email'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'username');
  }
};
