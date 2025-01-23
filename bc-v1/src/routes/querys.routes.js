import { Router } from 'express';
import { add_data, get_from } from '../controllers/querys.controller.js';

const querys_route = Router();

querys_route.get('/get-data/:table', get_from);
querys_route.post('/add/:table', add_data);

export default querys_route;
