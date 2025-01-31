/**
 * Validar cuerpo de una solicitud para "Factus"
 * @param {Object} body Objeto a validar
 * @returns Object. Objeto con información de la validación
 */
export function validate_body(body) {
  let ok = true;
  let message = '';
  let missing_properties = [];
  let require = [];
  const requeriments = [
    // ['reference_code', 'string'],
    ['observation', 'string'],
    ['payment_method_code', 'number'],
    ['customer', 'object'],
    ['items', 'object'],
  ];
  // Solo se admite un cuerpo en formato Objeto (JSON)
  if (typeof body !== 'object') {
    ok = false;
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
      if (requeriment[0] === 'items') {
        for (let item of body.items) item.code_reference = rd_key(5);
      }
      // Validar longitud de la propiedad "observación"
      if (requeriment[0] === 'observation') {
        const len_obs = body['observation'].length;
        if (len_obs > 249) {
          require.push({ property: 'observation', type_require: 'String, length <= 249', type_received: `${type_received}, length = ${len_obs}` });
          ok = false;
        }
      }
    }
  }
  // Agregar rango de numeración
  body.numbering_range_id = 8;
  body.reference_code = rd_key(10);
  missing_properties.length > 0 || require.length > 0 ? (message = 'Hay errores') : (message = 'OK');
  let validation = { ok, message };
  if (missing_properties.length > 0) validation.missing_properties = missing_properties;
  if (require.length > 0) validation.require = require;
  return validation;
}

/**
 * Generar claves aleatorias con un límite de caracteres
 * @param {Number} limit Cantidad de caracteres
 * @returns String. Cadena de texto con la clave generada
 */
export function rd_key(limit = 5) {
  let key = '';
  for (let i = 0; i < limit; i++) {
    if (i % 2 === 0) {
      key += int_to_char([rdint(65, 89)]);
    } else {
      key += rdint(0, 9);
    }
  }
  if (key.length > limit) {
    key.slice(0, limit);
  }
  return key;
}

/**
 * Obtener un rango de números
 * @param {Number} start Inicio de rango
 * @param {Number} end Fin de rango
 * @param {Number} step Opcional. Paso del contador
 * @returns Arreglo con cada número del rango
 */
export function get_range_int(start, end, step = 1) {
  const range = [];
  for (let i = start; i < end; i += step) range.push(i);
  return range;
}

/**
 * Convertir enteros (códigos ascii) a caracteres
 * @param {[Number] | Number} codes Códigos que desea convetir
 * @returns Caracter que pertenece al código
 */
export function int_to_char(codes) {
  return String.fromCharCode(...codes);
}

/**
 * Generar un número aleatorio
 * @param {Number} start Incio de rango
 * @param {Number} end Fin de rango
 * @returns Número aleatoro generado
 */
export function rdint(start = 0, end = 0) {
  const range = end - start + 1;
  const rd = Math.floor(start + Math.random() * range);
  return rd;
}

/**
 * Generar un `String` para consultas `UPDATE` de `POSTGRES` (`name = 'Nombre'`)
 * @param {Object} dict Objeto con el cual se trabajará
 * @param {boolean} key_value ¿El String generado, debe contener las claves del diccionario?
 * @param {String} restrict Restricción. Por ejemplo el 'id', o 'edad', esto no se agregará al String
 * @returns `String`. Cadena de texto `||` null si no se pasa el `dict`
 */
export function generate_str_of_dict(dict = null, key_value = true, restrict) {
  if (dict !== null) {
    let str = '';
    for (let key in dict) {
      if (key === restrict) continue;
      typeof dict[key] === 'string' ? (dict[key] = `'${dict[key]}'`) : dict[key];
      str += key_value === true ? `${key} = ${dict[key]},` : `${dict[key]},`;
    }
    return str.replace(/,$/, '');
  }
  return null;
}

/**
 * Obtener las claves de un diccionario (Objeto)
 * @param {Object} dict Objeto (`{key:value}`)
 * @returns Array. Arreglo con las claves del objeto `||` null, si no se pasa un Objeto
 */
export function get_keys_dict(dict = null, restrict = null) {
  if (dict !== null) {
    let keys = [];
    for (let key in dict) {
      if (key === restrict) continue;
      keys.push(key);
    }
    return keys;
  }
  return null;
}

/**
 * Obtener un elemento aleatorio de una lista
 * @param {Array} list Arreglo del cual se tomará un elemento aleatorio
 * @returns Un elemento aleatorio de la lista recibida
 */
export function rd_from_list(list = []) {
  const index = rdint(0, list.length - 1);
  return list[index];
}

/**
 * Realizar una solicitud HTTP
 * @param {String} url URL a la cual se enviará la solicitud
 * @param {Object} data Objeto de configuraciones (headers, mode, body, ...)
 * @returns JSON con información, ya sea de la **respuesta** o de un **error**
 */
export async function fetchJSON(url, data = {}) {
  try {
    let res;
    const req = await fetch(url, data);

    if (req.ok) {
      res = await req.json();
    } else {
      res = { message: 'No se pudo realizar la solicitud', data: null };
    }

    return res;
  } catch (error) {
    return { message: 'No se pudo realizar la solicitud', error };
  }
}

/**
 * Validar la longitud de una cadena de Texto u Objeto
 * @param {String|Array} obj El objeto que se quiere validar
 * @param {Number} len Longitud mínima
 * @param {Number} max Longitud máxima
 * @returns `true`: longitud correcta || `false`: Longitud incorrecta
 */
export function validate_len_obj(obj, len, max) {
  if (max) {
    if (obj.length > len && obj.length < max) {
      return true;
    }
  } else {
    if (obj.length === len) {
      return true;
    }
  }

  return false;
}
