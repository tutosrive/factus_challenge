import axios from 'axios';
import { validate_body } from '../helpers/helpers.mjs';

/**
 * Enviar una factura
 * @param {*} req
 * @param {*} res
 * @returns JSON con información respecto a la solicitud
 */
export const add_fact = async (req, res) => {
  try {
    const data = req.body;
    const validation = validate_body(data);
    console.log(data);
    // Cuerpo de solicitud
    if (validation.ok === true) {
      console.log('Validation OK');
      const axio_req = await request_fact('Created', false, data);
      res.status(axio_req.status).json(axio_req);
    } else {
      // Cuerpo de solicitud erróneo
      return res.status(400).json({ status: res.statusCode, messaje: 'Hay un problema con el cuerpo de la solicitud', conflict: validation });
    }
  } catch (error) {
    // Error generado (EXCEPCIÓN)
    res.status(500).json({ status: res.statusCode, messaje: 'Hubo un error al intentar realizar la solicitud', error });
  }
};

/**
 * Obtener las últimas facturas
 * @param {*} req
 * @param {*} res
 */
export const get_all_fact = async (req, res) => {
  try {
    const data = await request_fact('OK');
    res.status(data.status).json(data);
  } catch (error) {
    res.status(500).json({ status: res.statusCode, messaje: 'Hubo un error al intentar realizar la solicitud', error });
  }
};

/**
 * Obtener una factura específica
 * @param {*} req
 * @param {*} res
 */
export const get_one_fact = async (req, res) => {
  try {
    const { number } = req.params;
    // (data = number), (get_one = true) true, number, true
    const data_request = await request_fact('OK', true, number, true);
    res.status(data_request.status).json(data_request);
  } catch (error) {
    res.status(500).json({ status: res.statusCode, messaje: 'Hubo un error al intentar realizar la solicitud', error });
  }
};

/**
 * Enviar solicitudes HTTP, con AXIOS
 * @param {*} str_validation String con el cual se confirma una solicitud
 * @param {*} get ¿El método de la solicitud es `GET`?
 * @param {*} data Sólo para `POST`. Datos que se enviarán en el body
 * @returns JSON con información sobre la respuesta a la solicitud
 */
async function request_fact(str_validation, get = true, data = null, get_one = false) {
  try {
    const config = { url: `${process.env.url_api}/v1/bills/`, method: 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${process.env.access_token}` } };
    if (get === false) {
      config.url += 'validate';
      config.data = JSON.stringify(data);
      config.method = 'POST';
      config.headers['Content-Type'] = 'application/json';
    }
    if (get_one === true) {
      config.url += `show/${data}`;
    }
    const res = await axios.request(config).catch((e) => {
      throw e;
    });

    if (res.data.status === str_validation) {
      let res_data = get === false || get_one === true ? res.data.data : res.data.data.data;
      return { status: 200, message: 'OK', data: res_data };
    } else {
      return { status: 409, message: 'CONFLICT', data: {} };
    }
  } catch (e) {
    let exception = { status: 500, error: 'ERROR INTERNO', data: {} };
    if (e.message) exception.message = e.message;
    if (e.code) exception.code = e.code;
    if (e.name) exception.error_name = e.name;
    if (e.status) exception.status = e.status;
    return exception;
  }
}
