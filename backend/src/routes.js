import { Router } from 'express';

import SessionController from './app/controllers/SessionController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

/** Cria a Sessão do Usuário */
routes.post('/sessions', SessionController.store);

/** Autênticação das rotas */
routes.use(authMiddleware);

export default routes;
