const fs = require('fs');
const path = require('path');
const { sequelize, ContribuyenteType, Calendar, Period, CalendarRule } = require('../models');

async function seed() {
  try {
    console.log('🌱 Cargando datos iniciales - CALENDARIO 2026...');

    // Sincronizar base de datos
    await sequelize.sync({ force: true });
    console.log('✅ Tablas creadas');

    // Crear tipos de contribuyente (solo 4 tipos)
    const tipos = await ContribuyenteType.bulkCreate([
      { name: 'Gran Contribuyente', code: 'gran-contribuyente' },
      { name: 'Responsable de IVA Bimestral', code: 'responsable-iva-bimestral' },
      { name: 'Responsable de IVA Cuatrimestral', code: 'responsable-iva-cuatrimestral' },
      { name: 'No Responsable de IVA', code: 'no-responsable-iva' }
    ]);

    // Mapa para buscar tipos por nombre
    const tipoMap = {};
    tipos.forEach(t => tipoMap[t.name] = t);

    // Leer el JSON
    const rawData = fs.readFileSync(path.join(__dirname, '../data/calendario_2026.json'));
    const calendario = JSON.parse(rawData);

    console.log(`📅 Procesando calendario ${calendario.year}...`);

    // Procesar cada dígito
    for (const digitData of calendario.digits) {
      const ultimoDigito = digitData.digit;
      
      for (const contribData of digitData.contribuyentes) {
        const tipoId = tipoMap[contribData.tipo]?.id;
        if (!tipoId) {
          console.warn(`⚠️ Tipo no encontrado: ${contribData.tipo}`);
          continue;
        }

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
            // Extraer mes de inicio del período
            let startMonth = 1;
            if (periodoData.periodo.includes('Ene-Feb')) startMonth = 1;
            else if (periodoData.periodo.includes('Mar-Abr')) startMonth = 3;
            else if (periodoData.periodo.includes('May-Jun')) startMonth = 5;
            else if (periodoData.periodo.includes('Jul-Ago')) startMonth = 7;
            else if (periodoData.periodo.includes('Sep-Oct')) startMonth = 9;
            else if (periodoData.periodo.includes('Nov-Dic')) startMonth = 11;
            else if (periodoData.periodo.includes('Enero')) startMonth = 1;
            else if (periodoData.periodo.includes('Febrero')) startMonth = 2;
            // ... agregar más meses según necesites

            // Buscar o crear período
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
                startMonth,
                endMonth: startMonth + 1 // Simplificado, ajusta según frecuencia
              });
            }

            // Crear regla con el dígito específico
            await CalendarRule.create({
              periodId: period.id,
              contribuyenteTypeId: tipoId,
              baseDate: periodoData.fecha_vencimiento,
              dayAdjustment: false, // Ya no necesitamos ajuste porque las fechas ya están por dígito
              ultimoDigito // Nuevo campo que debemos agregar al modelo
            });
          }
        }
      }
    }

    console.log('✅ Calendario cargado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

seed();