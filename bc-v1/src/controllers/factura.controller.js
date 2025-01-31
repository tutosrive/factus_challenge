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
    // Cuerpo de solicitud
    if (validation.ok === true) {
      const axio_req = await request_fact('Created', 'post', data);
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
 * Obtener el pdf codificado
 * @param {*} req
 * @param {*} res
 */
export const get_pdf64_fact = async (req, res) => {
  try {
    const { number } = req.params;
    const data = await request_fact('OK', 'download', number);
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
    const data_request = await request_fact('OK', 'get_one', number);
    res.status(data_request.status).json(data_request);
  } catch (error) {
    res.status(500).json({ status: res.statusCode, messaje: 'Hubo un error al intentar realizar la solicitud', error });
  }
};

/**
 * Eliminar facturas sin validar
 * @param {*} req
 * @param {*} res
 */
export const delete_fact = async (req, res) => {
  try {
    const { reference_code } = req.params;
    const data_request = await request_fact('OK', 'delete', reference_code);
    res.status(data_request.status).json(data_request);
  } catch (error) {
    res.status(500).json({ status: res.statusCode, messaje: 'Hubo un error al intentar realizar la solicitud', error });
  }
};

/**
 * Enviar solicitudes HTTP, con AXIOS
 * @param {String} str_validation String con el cual se confirma una solicitud
 * @param {String} req_method El método de la solicitud `get - post - get_one - delete`
 * @param {*} data Sólo para `post || delete`. Datos que se enviarán en el body (o en la URL para el delete)
 * @returns JSON con información sobre la respuesta a la solicitud
 */
async function request_fact(str_validation, req_method = 'get', data = null) {
  try {
    const config = { url: `${process.env.url_api}/v1/bills/`, method: 'GET', headers: { Accept: 'application/json', Authorization: `Bearer ${process.env.access_token}` } };
    if (req_method === 'post') {
      config.url += 'validate';
      config.data = JSON.stringify(data);
      config.method = 'POST';
    }
    // Agregar tipo de contenido
    if (req_method === 'post' || req_method === 'delete') {
      config.headers['Content-Type'] = 'application/json';
    }
    if (req_method === 'get_one') {
      config.url += `show/${data}`;
    }
    if (req_method === 'download') {
      config.url += `download-pdf/${data}`;
    }
    // agregar código de referencia a la URL
    if (req_method === 'delete') {
      config.method = 'DELETE';
      config.url += `destroy/reference/${data}`;
    }
    const res = await axios.request(config).catch((e) => {
      throw e;
    });
    // Métodos [GET, POST]
    if (req_method !== 'delete') {
      if (res.data.status === str_validation) {
        let res_data = req_method === 'post' || req_method === 'get_one' || req_method === 'download' ? res.data.data : res.data.data.data;
        return { status: 200, message: 'OK', data: res_data };
      } else {
        return { status: 409, message: 'CONFLICT', data: {} };
      }
    }
    // Método DELETE
    else {
      return { status: 200, message: res.data.message };
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
