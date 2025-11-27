'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'rating', {
      type: Sequelize.DECIMAL(2, 1),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'rating');
  }
};
