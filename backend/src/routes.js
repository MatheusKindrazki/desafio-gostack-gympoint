import { Router } from 'express';

import CheckinController from './app/controllers/CheckinController';
import EnrollmentController from './app/controllers/EnrollmentController';
import HelpStudentController from './app/controllers/HelpStudentController';
import PlanController from './app/controllers/PlanController';
import SessionController from './app/controllers/SessionController';
import StudentController from './app/controllers/StudentController';
import authMiddleware from './app/middlewares/auth';

const routes = new Router();

/** Cria a Sessão do Usuário */
routes.post('/sessions', SessionController.store);

/** Checkin do Aluno */
routes.get('/students/:id/checkins', CheckinController.index);
routes.post('/students/:id/checkins', CheckinController.store);

/** Help Order do Aluno */
routes.get('/students/:id/help-orders', HelpStudentController.index);
routes.post('/students/:id/help-orders', HelpStudentController.store);

/** Autênticação das rotas */
routes.use(authMiddleware);

/* CRUD de Estudantes */
routes.get('/students', StudentController.index);
routes.get('/students/:id', StudentController.show);
routes.post('/students', StudentController.store);
routes.put('/students/:id', StudentController.update);
routes.delete('/students/:id', StudentController.delete);

/* CRUD de Planos */
routes.get('/plans', PlanController.index);
routes.get('/plans/:id', PlanController.show);
routes.post('/plans', PlanController.store);
routes.put('/plans/:id', PlanController.update);
routes.delete('/plans/:id', PlanController.delete);

/** CRUD de Matriculas */
routes.get('/enrollments', EnrollmentController.index);
routes.get('/enrollments/:id', EnrollmentController.show);
routes.post('/enrollments', EnrollmentController.store);
routes.put('/enrollments/:id', EnrollmentController.update);
routes.delete('/enrollments/:id', EnrollmentController.delete);

export default routes;
