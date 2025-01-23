import axios from 'axios';
import { stringify } from 'qs';

let id_interval;

/**
 * Generar Token cada 55 minutos
 */
export async function token() {
  const query = () => {
    const data = stringify({
      grant_type: 'password',
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
      password: process.env.password,
      username: process.env.email,
    });

    // Configuración de la solicitud
    const config = {
      method: 'post',
      url: `${process.env.url_api}/oauth/token`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: data,
    };

    axios(config)
      .then((res) => {
        process.env.access_token = res.data.access_token;
        console.log(process.env.access_token);
      })
      .catch((e) => {
        console.log(e);
      });
  };
  query();
  id_interval = setInterval(() => {
    query();
  }, 3300000); // cada 55 minutos se genera un nuevo token
}

export default token;
