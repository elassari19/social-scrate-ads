import { Request, Response, NextFunction } from 'express';
import { RedisService } from './redis.service';

export const cacheMiddleware = (expirationInSeconds = 300, keyPrefix = '') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const cacheKey = `${keyPrefix}:${req.originalUrl}`;
    const redisService = RedisService.getInstance();

    try {
      const cachedData = await redisService.get(cacheKey);

      if (cachedData) {
        return res.json(JSON.parse(cachedData));
      }

      // Store original res.json method
      const originalJson = res.json.bind(res);

      // Override res.json method to cache the response
      res.json = ((data: any) => {
        redisService
          .set(cacheKey, JSON.stringify(data), expirationInSeconds)
          .catch((err) => console.error('Cache storage error:', err));

        return originalJson(data);
      }) as Response['json'];

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

export const clearCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redisService = RedisService.getInstance();
      const client = redisService.getClient();

      const keys = await client.keys(`cache:${pattern}`);
      if (keys.length > 0) {
        await client.del(...keys);
      }
      next();
    } catch (error) {
      console.error('Clear cache error:', error);
      next(error);
    }
  };
};
