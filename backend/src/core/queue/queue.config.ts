import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { redisConfig } from '../../utils/redis.config';

// Initialize Redis connection with error handling
const connection = new IORedis({
  ...redisConfig,
  maxRetriesPerRequest: null, // Prevent connection drop errors
  enableReadyCheck: false, // Skip Redis version check
});

// Handle connection errors
connection.on('error', (err) => {
  console.error('Redis connection error:', err);
});

// Define queue names
export const QUEUE_NAMES = {
  SCRAPING: 'scraping-queue',
  AI_ANALYSIS: 'ai-analysis-queue',
} as const;

// Create queues with enhanced configuration
export const scrapingQueue = new Queue(QUEUE_NAMES.SCRAPING, {
  connection,
  defaultJobOptions: {
    attempts: 3,
    timestamp: Date.now(),
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
    removeOnComplete: {
      age: 3600, // Keep completed jobs for 1 hour
      count: 1000, // Keep last 1000 jobs
    },
    removeOnFail: {
      age: 86400, // Keep failed jobs for 24 hours
    },
  },
});

export const aiAnalysisQueue = new Queue(QUEUE_NAMES.AI_ANALYSIS, {
  connection,
  defaultJobOptions: {
    attempts: 2,
    removeOnComplete: {
      age: 3600,
      count: 1000,
    },
    removeOnFail: {
      age: 86400,
    },
  },
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
  await scrapingQueue.close();
  await aiAnalysisQueue.close();
  await connection.quit();
});

export { connection };
