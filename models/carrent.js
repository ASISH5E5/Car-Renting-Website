'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CarRent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
    static addCar({ sname, vno, sno,rpd }) {
      return this.create({ sname, vno, sno,rpd  }); // Fix method call
    }
  }
  CarRent.init({
    sname: DataTypes.STRING,
    vno: DataTypes.STRING,
    sno: DataTypes.INTEGER,
    rpd: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CarRent',
  });
  return CarRent;
};