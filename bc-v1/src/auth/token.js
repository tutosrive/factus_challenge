import axios from 'axios';
import { stringify } from 'qs';

let id_interval;

/**
 * Generar Token cada 55 minutos
 */
export default async function token() {
  const query = async () => {
    const data = {
      client_id: process.env.client_id,
      client_secret: process.env.client_secret,
    };

    // Ya existe un refresh token?
    if (process.env.refresh_token) {
      console.log('SÍ existe un refresh token');
      data.grant_type = 'refresh_token';
      data.refresh_token = process.env.refresh_token;
    } else {
      console.log('NO existe un refresh token');
      data.grant_type = 'password';
      data.password = process.env.password;
      data.username = process.env.email;
    }

    // Configuración de la solicitud
    const config = {
      method: 'post',
      url: `${process.env.url_api}/oauth/token`,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      data: stringify(data),
    };
    try {
      const res = await axios(config);
      process.env.refresh_token = res.data.refresh_token;
      process.env.access_token = res.data.access_token;
    } catch (e) {
      console.log(e);
    }
  };
  await query();
  id_interval = setInterval(() => {
    query();
  }, 3300000); // cada 55 minutos se genera un nuevo token
  return id_interval;
}

// 60000 -> 1 minuto
// 3300000 -> 55 minutos
