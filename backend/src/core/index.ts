import express from 'express';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import passport from 'passport';
import { errorHandler, notFoundHandler } from './errors';

// Import passport configuration
import './auth/passport.config';

// Import routes
import usersRouter from './users/users.routes';
import authRouter from './auth/auth.routes';
import subscriptionRoute from './subscription/subscription.routes';

// Import GraphQL server
import { createApolloServer } from './graphql/server';

import { redisSession } from '../utils/redis.config';

export const createApp = async () => {
  /* CONFIGURATIONS */
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: {
        directives: {
          imgSrc: [
            `'self'`,
            'data:',
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
          manifestSrc: [
            `'self'`,
            'apollo-server-landing-page.cdn.apollographql.com',
          ],
          frameSrc: [`'self'`, 'sandbox.embed.apollographql.com'],
        },
      },
    })
  );
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
  app.use('/auth', authRouter);
  app.use('/users', usersRouter);
  app.use('/subscription', subscriptionRoute);

  // Initialize Apollo Server - await it properly
  await createApolloServer(app);
  console.log('GraphQL server initialized');

  // Root route should be defined before error handlers
  app.get('/', (req, res) => {
    res.send(
      'Greetings from scrapper backend! Visit /graphql to access the GraphQL playground.'
    );
  });

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
