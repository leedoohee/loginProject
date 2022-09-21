import homeController from '../controllers/homeConstroller.js';
import isLoggedIn from '../middleware/login.js';
import checkToken from '../middleware/auth.js';
import express from 'express';

const homeRouter = express.Router();

homeRouter.get('/', isLoggedIn, homeController.homePage);

export default homeRouter;