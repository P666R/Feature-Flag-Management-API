import morgan from 'morgan';
import express from 'express';
import { morganMiddleware } from './utils/logger.js';

const createApp = () => {
  const app = express();

  if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
  }

  app.use(express.json());

  app.use(morganMiddleware);

  app.get('/', (req, res) => {
    res.send('Hello World');
  });

  return app;
};

export default createApp;
