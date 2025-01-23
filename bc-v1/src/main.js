import express from 'express';
import querys_route from './routes/querys.routes.js';
import morgan from 'morgan';
import factura_route from './routes/factura.routes.js';
import token from './auth/token.js';

// Principal app
const app = express();
const port = process.env.PORT || 4500;

// Generar token
token();

// Escuchar puerto (localhost:4500)
app.listen(port, () => {
  console.log('Running server in port: ', port);
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Para que la API comprenda los "POST" con body JSON
app.use(express.json());

// "Debug", mostrar solicitudes realizadas
app.use(morgan('dev'));

app.use([querys_route, factura_route]);
