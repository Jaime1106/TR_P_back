const { adjustDateByLastDigit, getDaysUntilDue, getTaxStatus, getMonthName } = require('./dateCalculator');
const { validateNIT } = require('./nitValidator');

const getTaxObligations = (nit, contribuyenteType, calendarData, year, payments = []) => {
  console.log('🔍 getTaxObligations ejecutándose para:', { nit, contribuyenteType, year });
  
  const obligations = [];
  const { lastDigit } = validateNIT(nit);
  const today = new Date();
  const currentMonth = today.getMonth() + 1;

  const paymentsMap = new Map();
  payments.forEach(p => {
    const key = `${p.taxType}-${p.period}`;
    paymentsMap.set(key, p);
  });

  calendarData.forEach(calendar => {
    if (calendar.Periods && calendar.Periods.length > 0) {
      calendar.Periods.forEach(period => {
        if (period.CalendarRules && period.CalendarRules.length > 0) {
          period.CalendarRules.forEach(rule => {
            // Buscar regla que coincida con el tipo de contribuyente Y el último dígito
            if (rule.ContribuyenteType && 
                rule.ContribuyenteType.name === contribuyenteType &&
                rule.ultimoDigito === lastDigit) {
              
              const dueDate = new Date(rule.baseDate);
              const paymentKey = `${calendar.taxType}-${period.period}`;
              const paid = paymentsMap.has(paymentKey);
              
              const daysUntil = getDaysUntilDue(dueDate);
              const status = getTaxStatus(dueDate, paid);

              obligations.push({
                nit,
                contribuyenteType,
                taxType: calendar.taxType,
                frequency: calendar.frequency,
                institution: calendar.institution,
                period: period.period,
                dueDate: dueDate.toISOString().split('T')[0],
                year,
                month: getMonthName(currentMonth),
                daysUntil,
                status,
                paid,
                ultimoDigito: lastDigit
              });
            }
          });
        }
      });
    }
  });

  console.log(`📊 Encontradas ${obligations.length} obligaciones para último dígito ${lastDigit}`);
  return obligations.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
};

const filterByMonth = (obligations, month) => {
  if (!month) return obligations;
  return obligations.filter(ob => {
    const dueMonth = new Date(ob.dueDate).getMonth() + 1;
    return dueMonth === month;
  });
};

const getMonthlySummary = (obligations) => {
  const summary = {};
  
  obligations.forEach(ob => {
    const month = ob.month;
    if (!summary[month]) {
      summary[month] = { 
        count: 0, 
        vencidos: 0, 
        proximos: 0, 
        vigentes: 0,
        pagados: 0 
      };
    }
    summary[month].count++;
    
    if (ob.status === 'vencido') summary[month].vencidos++;
    else if (ob.status === 'próximo a vencer') summary[month].proximos++;
    else if (ob.status === 'vigente') summary[month].vigentes++;
    else if (ob.status === 'pagado') summary[month].pagados++;
  });
  
  return Object.entries(summary).map(([month, data]) => ({
    month,
    count: data.count,
    vencidos: data.vencidos,
    proximos: data.proximos,
    vigentes: data.vigentes,
    pagados: data.pagados
  }));
};

module.exports = {
  getTaxObligations,
  filterByMonth,
  getMonthlySummary
};