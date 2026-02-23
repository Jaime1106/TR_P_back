const getDaysUntilDue = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getTaxStatus = (dueDate, paid = false) => {
  if (paid) return 'pagado';
  
  const daysUntil = getDaysUntilDue(dueDate);
  
  if (daysUntil < 0) return 'vencido';
  if (daysUntil <= 7) return 'próximo a vencer';
  return 'vigente';
};

const adjustDateByLastDigit = (baseDate, lastDigit) => {
  const date = new Date(baseDate);
  const dayAdjustment = Math.floor(lastDigit / 2);
  date.setDate(date.getDate() + dayAdjustment);
  return date;
};

const getMonthName = (month) => {
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  return months[month - 1];
};

module.exports = {
  getDaysUntilDue,
  getTaxStatus,
  adjustDateByLastDigit,
  getMonthName
};