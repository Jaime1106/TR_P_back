const validateNIT = (nit) => {
  // Limpiar el NIT (quitar puntos, guiones, espacios)
  const cleanNIT = nit.replace(/[\.\-\s]/g, '');
  
  // Verificar que solo contenga dígitos
  if (!/^\d+$/.test(cleanNIT)) {
    return {
      valid: false,
      error: 'El NIT solo debe contener números'
    };
  }

  // Verificar longitud (debe ser 9 dígitos)
  if (cleanNIT.length !== 9) {
    return {
      valid: false,
      error: 'El NIT debe tener exactamente 9 dígitos'
    };
  }

  // Obtener el último dígito
  const lastDigit = parseInt(cleanNIT.substring(cleanNIT.length - 1), 10);

  return {
    valid: true,
    baseNIT: cleanNIT,
    lastDigit,
    fullNIT: cleanNIT
  };
};

module.exports = { validateNIT };