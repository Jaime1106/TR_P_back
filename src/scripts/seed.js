const { sequelize, ContribuyenteType, Calendar, Period, CalendarRule } = require('../models');
const fs = require('fs');
const path = require('path');

async function seed() {
  try {
    console.log('🌱 Ejecutando seed...');

    // Verificar si ya hay datos
    const existingRules = await CalendarRule.count();
    if (existingRules > 0) {
      console.log(`✅ Base de datos ya tiene ${existingRules} reglas. Seed omitido.`);
      return;
    }

    // Leer JSON
    const jsonPath = path.join(__dirname, '../data/calendario_2026.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const calendario = JSON.parse(rawData);

    console.log(`📅 Cargando calendario ${calendario.year}...`);

    // Crear tipos de contribuyente
    const tipos = await ContribuyenteType.bulkCreate([
      { name: 'Gran Contribuyente', code: 'gran-contribuyente' },
      { name: 'Responsable de IVA Bimestral', code: 'responsable-iva-bimestral' },
      { name: 'Responsable de IVA Cuatrimestral', code: 'responsable-iva-cuatrimestral' },
      { name: 'No Responsable de IVA', code: 'no-responsable-iva' }
    ]);

    const tipoMap = {};
    tipos.forEach(t => tipoMap[t.name] = t);

    // Procesar cada dígito
    for (const digitData of calendario.digits) {
      for (const contribData of digitData.contribuyentes) {
        const tipo = tipoMap[contribData.tipo];
        if (!tipo) continue;

        for (const impuestoData of contribData.impuestos) {
          // Buscar o crear calendario
          let calendar = await Calendar.findOne({
            where: {
              year: calendario.year,
              taxType: impuestoData.nombre,
              frequency: impuestoData.frecuencia,
              institution: impuestoData.institucion
            }
          });

          if (!calendar) {
            calendar = await Calendar.create({
              year: calendario.year,
              taxType: impuestoData.nombre,
              frequency: impuestoData.frecuencia,
              institution: impuestoData.institucion
            });
          }

          for (const periodoData of impuestoData.periodos) {
            // Crear período
            let period = await Period.findOne({
              where: {
                calendarId: calendar.id,
                period: periodoData.periodo
              }
            });

            if (!period) {
              period = await Period.create({
                calendarId: calendar.id,
                period: periodoData.periodo,
                startMonth: 1,
                endMonth: 12
              });
            }

            // Crear regla
            await CalendarRule.create({
              periodId: period.id,
              contribuyenteTypeId: tipo.id,
              baseDate: periodoData.fecha_vencimiento,
              dayAdjustment: false,
              ultimoDigito: digitData.digit
            });
          }
        }
      }
    }

    const totalRules = await CalendarRule.count();
    console.log(`✅ Seed completado. Total reglas: ${totalRules}`);

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  seed()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seed;