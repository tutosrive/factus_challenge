import axios from 'axios';
import { validate_body } from '../helpers/helpers.mjs';

export const add_fact = async (req, res) => {
  try {
    // Cuerpo de solicitud
    const data = req.body;
    const validation = validate_body(data);
    if (validation.ok === true) {
      console.log('Validation OK');

      const token = process.env.access_token;
      // Configuración
      const config = {
        url: `${process.env.url_api}/v1/bills/validate`,
        headers: { Accept: 'application/json', 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        method: 'POST',
        data: JSON.stringify(data),
      };
      console.log(config);
      // Para no quemar solicitudes
      // Peticion real
      axios
        .request(config)
        .then((res) => {
          // String: "created"
          console.log(res.data.status);
          if (res.data.status === 'created') {
            return res.json({ message: 'OK', data: res.data });
          }
        })
        .catch((e) => {
          console.log(e);
          return res.json({ messgae: 'ERROR', error: e });
        });
    } else {
      return res.status(400).json({ status: res.statusCode, messaje: 'Hay un problema con el cuerpo de la solicitud', conflict: validation });
    }
  } catch (error) {
    res.status(500).json({ status: res.statusCode, messaje: 'Hubo un error al intentar realizar la solicitud', error });
  }
};
