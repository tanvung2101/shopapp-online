'use strict';
/** @type {import('sequelize-cli').Migration} */
export default  {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key:'id'
        }
      },
      status: {
        type: Sequelize.INTEGER
      },
      note: {
        type: Sequelize.TEXT
      },
      phone: {
        type: Sequelize.TEXT
      },
      address: {
        type: Sequelize.TEXT
      },
      total: {
        type: Sequelize.INTEGER
      },
      session_id: {
        type: Sequelize.STRING
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('orders');
  }
};