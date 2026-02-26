const { sequelize, ContribuyenteType, Calendar, Period, CalendarRule } = require('../models');
const fs = require('fs');
const path = require('path');

async function seed() {
  try {
    console.log('🌱 Iniciando seed...');

    // 1. PRIMERO: Sincronizar la base de datos (crear tablas)
    console.log('📦 Sincronizando base de datos...');
    await sequelize.sync({ force: true }); // force: true elimina y recrea tablas
    console.log('✅ Tablas creadas correctamente');

    // 2. Leer el archivo JSON
    console.log('📖 Leyendo calendario 2026...');
    const jsonPath = path.join(__dirname, '../data/calendario_2026.json');
    
    if (!fs.existsSync(jsonPath)) {
      throw new Error(`Archivo no encontrado: ${jsonPath}`);
    }

    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const calendario = JSON.parse(rawData);
    console.log(`✅ JSON cargado: ${calendario.digits.length} dígitos`);

    // 3. Crear tipos de contribuyente
    console.log('👤 Creando tipos de contribuyente...');
    const tipos = await ContribuyenteType.bulkCreate([
      { name: 'Gran Contribuyente', code: 'gran-contribuyente' },
      { name: 'Responsable de IVA Bimestral', code: 'responsable-iva-bimestral' },
      { name: 'Responsable de IVA Cuatrimestral', code: 'responsable-iva-cuatrimestral' },
      { name: 'No Responsable de IVA', code: 'no-responsable-iva' }
    ], { ignoreDuplicates: false });

    const tipoMap = {};
    tipos.forEach(t => tipoMap[t.name] = t);
    console.log(`✅ ${tipos.length} tipos creados`);

    // 4. Procesar cada dígito
    let totalReglas = 0;
    for (const digitData of calendario.digits) {
      for (const contribData of digitData.contribuyentes) {
        const tipo = tipoMap[contribData.tipo];
        if (!tipo) {
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
            totalReglas++;
          }
        }
      }
    }

    console.log(`✅ Seed completado. Total reglas creadas: ${totalReglas}`);

    // 5. Verificar
    const verifyCount = await CalendarRule.count();
    console.log(`📊 Verificación: ${verifyCount} reglas en base de datos`);

  } catch (error) {
    console.error('❌ Error en seed:', error);
    throw error;
  }
}

// Si se ejecuta directamente
if (require.main === module) {
  seed()
    .then(() => {
      console.log('🎉 Seed finalizado exitosamente');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Error fatal:', error);
      process.exit(1);
    });
}

module.exports = seed;