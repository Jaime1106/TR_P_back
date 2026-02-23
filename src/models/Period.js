const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Period = sequelize.define('Period', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  period: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startMonth: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  endMonth: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});

module.exports = Period;