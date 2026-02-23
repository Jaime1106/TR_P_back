const { sequelize, Calendar, Period, CalendarRule, ContribuyenteType } = require('../models');

async function verificarBD() {
  try {
    console.log('🔍 VERIFICACIÓN COMPLETA DE LA BASE DE DATOS\n');

    // 1. Verificar tipos de contribuyente
    const tipos = await ContribuyenteType.findAll();
    console.log('📌 TIPOS DE CONTRIBUYENTE:');
    tipos.forEach(t => console.log(`   - ${t.id}: ${t.name} (${t.code})`));
    console.log(`   Total: ${tipos.length}\n`);

    // 2. Verificar calendarios
    const calendarios = await Calendar.findAll();
    console.log('📅 CALENDARIOS:');
    for (const cal of calendarios) {
      console.log(`   - ${cal.id}: ${cal.taxType} ${cal.frequency} ${cal.year} (${cal.institution})`);
    }
    console.log(`   Total: ${calendarios.length}\n`);

    // 3. Verificar períodos
    const periodos = await Period.findAll();
    console.log('📆 PERÍODOS:');
    const periodosPorCalendario = {};
    periodos.forEach(p => {
      if (!periodosPorCalendario[p.calendarId]) periodosPorCalendario[p.calendarId] = [];
      periodosPorCalendario[p.calendarId].push(p.period);
    });
    
    Object.entries(periodosPorCalendario).forEach(([calId, per]) => {
      console.log(`   Calendario ${calId}: ${per.length} períodos`);
      per.slice(0, 3).forEach(p => console.log(`      - ${p}`));
      if (per.length > 3) console.log(`      ... y ${per.length - 3} más`);
    });
    console.log(`   Total períodos: ${periodos.length}\n`);

    // 4. Verificar reglas (¡LO MÁS IMPORTANTE!)
    const reglas = await CalendarRule.findAll({
      include: [ContribuyenteType]
    });
    
    console.log('📊 REGLAS POR DÍGITO:');
    const reglasPorDigito = {};
    const reglasPorTipo = {};
    
    reglas.forEach(r => {
      const digito = r.ultimoDigito;
      const tipo = r.ContribuyenteType?.name || 'Desconocido';
      
      if (!reglasPorDigito[digito]) reglasPorDigito[digito] = 0;
      reglasPorDigito[digito]++;
      
      if (!reglasPorTipo[tipo]) reglasPorTipo[tipo] = 0;
      reglasPorTipo[tipo]++;
    });
    
    // Mostrar por dígito
    for (let d = 0; d <= 9; d++) {
      console.log(`   Dígito ${d}: ${reglasPorDigito[d] || 0} reglas`);
    }
    
    console.log('\n📊 REGLAS POR TIPO DE CONTRIBUYENTE:');
    Object.entries(reglasPorTipo).forEach(([tipo, count]) => {
      console.log(`   ${tipo}: ${count} reglas`);
    });
    
    console.log(`\n✅ TOTAL DE REGLAS: ${reglas.length}`);

    // 5. Mostrar ejemplo de una regla
    if (reglas.length > 0) {
      console.log('\n📝 EJEMPLO DE REGLA:');
      const ejemplo = reglas[0];
      console.log({
        ultimoDigito: ejemplo.ultimoDigito,
        baseDate: ejemplo.baseDate,
        contribuyenteType: ejemplo.ContribuyenteType?.name,
        dayAdjustment: ejemplo.dayAdjustment
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
  }
}

verificarBD();