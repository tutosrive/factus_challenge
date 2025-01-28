import { Router } from 'express';
import { get_home } from '../controllers/page.controller.js';

const page_route = Router();

page_route.get('/', get_home);

export default page_route;
