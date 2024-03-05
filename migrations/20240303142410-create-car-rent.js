'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('CarRents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      sname: {
        type: Sequelize.STRING,
        allowNull: false,
        

      },
      vno: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      sno: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      rpd: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('CarRents');
  }
};