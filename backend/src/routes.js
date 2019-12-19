import { Router } from 'express';

import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

/** Cria a Sessão do Usuário */
routes.post('/sessions', SessionController.store);

/** Autênticação das rotas */
routes.use(authMiddleware);

/* CRUD de Estudantes */
routes.get('/students', StudentController.index);
routes.get('/students/:id', StudentController.show);
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);

export default routes;
