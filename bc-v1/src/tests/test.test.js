function validate_body(body) {
  let ok = true;
  let message = '';
  let missing_properties = [];
  let require = [];
  const requeriments = [
    ['reference_code', 'string'],
    ['observation', 'string'],
    ['payment_method_code', 'number'],
    ['customer', 'object'],
    ['items', 'object'],
  ];
  // Solo se admite un cuerpo en formato Objeto (JSON)
  if (typeof body !== 'object') {
    return false;
  }
  // Verificar propiedades
  for (let i = 0; i < requeriments.length; i++) {
    const requeriment = requeriments[i];
    // No tiene propiedad requerida
    if (!body.hasOwnProperty(requeriment[0])) {
      missing_properties.push(requeriment[0]);
      ok = false;
    } else {
      // Validar tipo de propiedad
      const type_received = typeof body[requeriment[0]];
      if (type_received !== requeriment[1]) {
        require.push({ property: requeriment[0], type_require: requeriment[1], type_received });
        ok = false;
      }
    }
  }
  // Agregar rango de numeración
  body.numbering_range_id = 8;
  let validation = { ok };
  missing_properties.length > 0 || require.length > 0 ? (validation.message = 'Hay errores') : (validation.message = 'OK');

  if (missing_properties.length > 0) validation.missing_properties = missing_properties;
  if (require.length > 0) validation.require = require;

  return validation;
}

const body = {};

console.log(validate_body(body));
