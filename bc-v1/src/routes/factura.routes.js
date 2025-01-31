import { Router } from 'express';
import { add_fact, delete_fact, get_all_fact, get_one_fact, get_pdf64_fact } from '../controllers/factura.controller.js';

const factura_route = Router();

factura_route.get('/factura', get_all_fact);
factura_route.get('/factura/:number', get_one_fact);
factura_route.get('/factura-download/:number', get_pdf64_fact);
factura_route.post('/factura', add_fact);
factura_route.delete('/factura/:reference_code', delete_fact);

export default factura_route;
