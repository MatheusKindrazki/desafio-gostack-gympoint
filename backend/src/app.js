import cors from 'cors';
import express from 'express';
import Youch from 'youch';
import 'express-async-errors';

import routes from './routes';

class App {
  constructor() {
    this.server = express();

    this.middleware();
    this.routes();
  }

  middleware() {
    this.server.use(cors({ exposedHeaders: 'Total-Pages' }));
    this.server.use(express.json());

    this.server.use(cors({ origin: '*' }));
  }

  routes() {
    this.server.use(routes);
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

export default new App().server;
