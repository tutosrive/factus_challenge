import { Router } from 'express';
import { add_data, dates, get_from, get_join, update_data } from '../controllers/querys.controller.js';

const querys_route = Router();

querys_route.get('/get-data/:table', get_from);
querys_route.get('/dates', dates);

querys_route.post('/add-data/:table', add_data);
querys_route.post('/get-join', get_join);
querys_route.put('/update-data/:table/:property/:value', update_data);
querys_route.patch('/update-data/:table/:property/:value', update_data);

export default querys_route;
