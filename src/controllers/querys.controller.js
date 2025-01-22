import db from '../database.js';

/**
 * Obtener todos los datos de una tabla (se debe enviar el parámetro `:table`)
 */
export const get_from = async (req, res) => {
  try {
    const { table } = req.params;
    const { rows, rowCount } = await db.query(`SELECT * FROM ${table}`);

    if (rowCount === 0) {
      return res.status(404).json({ status: res.statusCode, message: 'No se encontraron datos' });
    }

    res.json({ status: 'OK', message: 'Datos encontrados', data: rows });
  } catch (e) {
    res.status(500).json({ status: res.statusCode, message: 'Error al obtener los datos', error: e });
  }
};

/**
 * Cuando necesito agregar datos a la base de datos
 * @param {*} req
 * @param {*} res
 * @returns
 */
export const add_data = async (req, res) => {
  try {
    const data = req.body;

    const { rows, rowCount } = await db.query('INSERT INTO unit_measure values($1, $2, $3)', [data.id, data.code, data.name]);
    if (rowCount === 0) {
      return res.status(404).json({ status: res.statusCode, message: 'No se encontraron datos' });
    }
    res.json({ message: 'Datos agregados' });
  } catch (e) {
    res.status(500).json({ status: res.statusCode, message: 'Error al obtener los datos', error: e });
  }
};
