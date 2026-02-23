const { Calendar, Period, CalendarRule, ContribuyenteType } = require('../models');
const { validateNIT } = require('../utils/nitValidator');
const { getTaxObligations, filterByMonth, getMonthlySummary } = require('../utils/taxRules');

const queryCalendar = async (req, res) => {
  try {
    const { nit, contribuyenteType, month, year } = req.query;

    console.log('📥 Consulta recibida:', { nit, contribuyenteType, month, year });

    // Validar NIT
    const nitValidation = validateNIT(nit);
    if (!nitValidation.valid) {
      return res.status(400).json({ success: false, error: nitValidation.error });
    }

    // Validar tipo de contribuyente
    if (!contribuyenteType) {
      return res.status(400).json({ success: false, error: 'Debe especificar el tipo de contribuyente' });
    }

    const queryYear = year ? parseInt(year) : new Date().getFullYear();

    // Buscar calendarios
    const calendarData = await Calendar.findAll({
      where: { year: queryYear, active: true },
      include: [
        {
          model: Period,
          include: [
            {
              model: CalendarRule,
              include: [ContribuyenteType]
            }
          ]
        }
      ]
    });

    console.log(`📅 Calendarios encontrados: ${calendarData.length}`);

    if (!calendarData || calendarData.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: `No hay calendario disponible para el año ${queryYear}` 
      });
    }

    // Convertir a JSON plano para procesar
    const plainData = calendarData.map(c => c.toJSON());

    // Verificar que la función existe
    console.log('🔧 getTaxObligations es:', typeof getTaxObligations);

    // Obtener obligaciones
    let obligations = getTaxObligations(
      nitValidation.fullNIT,
      contribuyenteType,
      plainData,
      queryYear,
      [] // payments (vacío por ahora)
    );

    // Filtrar por mes si se especifica
    if (month && month !== '') {
      obligations = filterByMonth(obligations, parseInt(month));
    }

    // Generar resumen mensual
    const monthlySummary = getMonthlySummary(obligations);

    console.log(`✅ Respuesta: ${obligations.length} obligaciones encontradas`);

    res.json({
      success: true,
      data: {
        nit: nitValidation.fullNIT,
        lastDigit: nitValidation.lastDigit,
        contribuyenteType,
        year: queryYear,
        totalObligations: obligations.length,
        obligations,
        monthlySummary,
        queryDate: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error en queryCalendar:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error al consultar el calendario',
      details: error.message 
    });
  }
};

module.exports = {
  queryCalendar
};