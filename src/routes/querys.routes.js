import { Router } from 'express';
import { get_from } from '../controllers/querys.controller.js';

const querys_route = Router();

querys_route.get('/get-data/:table', get_from);

export default querys_route;
