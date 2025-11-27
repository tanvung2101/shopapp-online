'use strict';

export default {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('products', 'total_ratings', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });

    await queryInterface.addColumn('products', 'total_sold', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'total_ratings');
    await queryInterface.removeColumn('products', 'total_sold');
  }
};
