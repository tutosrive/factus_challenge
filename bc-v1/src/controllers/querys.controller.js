import db from '../database.js';
import { generate_str_of_dict, get_keys_dict } from '../helpers/helpers.mjs';

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
    res.json({ status: 200, message: 'Datos encontrados', data: rows });
  } catch (e) {
    res.status(500).json({ status: res.statusCode, message: 'Error al obtener los datos', error: e });
  }
};

export const get_join = async (req, res) => {
  try {
    const body_query = req.body;
    const { rows, rowCount } = await db.query(body_query.query);
    if (rowCount === 0) {
      return res.status(404).json({ status: res.statusCode, message: 'No se encontraron datos' });
    }
    res.json({ status: 200, message: 'Datos encontrados', data: rows });
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
    const { table } = req.params;
    const data = req.body;
    const str_query = generate_str_of_dict(data, false);
    const cols = get_keys_dict(data);
    const { rows, rowCount } = await db.query(`INSERT INTO ${table}(${cols}) values(${str_query}) RETURNING *`);
    if (rowCount === 0) {
      return res.status(404).json({ status: res.statusCode, message: 'No se agregaron los datos' });
    }
    res.json({ status: 200, message: 'Datos agregados', data: rows[0] });
  } catch (e) {
    res.status(500).json({ status: res.statusCode, message: 'Error al agregar los datos', error: e });
  }
};

export const update_data = async (req, res) => {
  try {
    const { table, property, value } = req.params;
    const data = req.body;
    const str_query = generate_str_of_dict(data);
    const cols = get_keys_dict(data);
    const { rows, rowCount } = await db.query(`UPDATE ${table} SET ${str_query} WHERE ${property} = '${value}' RETURNING *`);
    if (rowCount === 0) {
      return res.status(404).json({ status: res.statusCode, message: 'No se actualizaron los datos' });
    }
    res.json({ status: 200, message: 'Datos actualizados', updated_fields: rows[0] });
  } catch (e) {
    res.status(500).json({ status: res.statusCode, message: 'Error al actualizar los datos', error: e });
  }
};

export const delete_data = async (req, res) => {
  try {
    const { table, property, value } = req.params;
    const { rows, rowCount } = await db.query(`DELETE FROM ${table} WHERE ${property} = '${value}' RETURNING *`);
    if (rowCount === 0) {
      return res.status(404).json({ status: res.statusCode, message: 'No se eliminaron los datos' });
    }
    res.json({ status: 200, message: 'Datos eliminados', deleted: rows[0] });
  } catch (e) {
    res.status(500).json({ status: res.statusCode, message: 'Error al eliminar los datos', error: e });
  }
};
