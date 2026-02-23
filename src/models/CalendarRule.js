const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CalendarRule = sequelize.define('CalendarRule', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  baseDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  dayAdjustment: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  ultimoDigito: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 9
    }
  }
});

module.exports = CalendarRule;