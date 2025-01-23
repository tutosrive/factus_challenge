import { Router } from 'express';
import { add_fact } from '../controllers/factura.controller.js';

const factura_route = Router();

factura_route.post('/factura', add_fact);

export default factura_route;
