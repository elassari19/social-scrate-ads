import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import session from 'express-session';
import Redis from 'ioredis';
import ConnectRedis from 'connect-redis';
import { errorHandler, notFoundHandler } from './errors';

// import routes
import usersRouter from './users/users.routes';
import { redisSession } from '../utils/redis.config';

export const createApp = () => {
  /* CONFIGURATIONS */
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(helmet());
  app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
  app.use(morgan('common'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cors());

  // Session middleware configuration
  app.use(redisSession);

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Routes
  app.use('/users', usersRouter);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  app.use('/', (req, res) => {
    res.send('Greetings from scrapper backend!');
  });

  return app;
};
