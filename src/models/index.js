const sequelize = require('../config/database');
const ContribuyenteType = require('./ContribuyenteType');
const Calendar = require('./Calendar');
const Period = require('./Period');
const CalendarRule = require('./CalendarRule');

// Definir relaciones
Calendar.hasMany(Period, { foreignKey: 'calendarId' });
Period.belongsTo(Calendar, { foreignKey: 'calendarId' });

Period.hasMany(CalendarRule, { foreignKey: 'periodId' });
CalendarRule.belongsTo(Period, { foreignKey: 'periodId' });

ContribuyenteType.hasMany(CalendarRule, { foreignKey: 'contribuyenteTypeId' });
CalendarRule.belongsTo(ContribuyenteType, { foreignKey: 'contribuyenteTypeId' });

module.exports = {
  sequelize,
  ContribuyenteType,
  Calendar,
  Period,
  CalendarRule
};