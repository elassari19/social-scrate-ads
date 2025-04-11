import { Job } from 'bullmq';
import { scrapingQueue, aiAnalysisQueue } from './queue.config';

export interface ScrapeJobData {
  platform: 'meta' | 'google' | 'tiktok';
  targetUrl: string;
  options?: {
    proxyConfig?: string;
    timeout?: number;
  };
}

export interface AIAnalysisJobData {
  data: unknown;
  analysisType: 'sentiment' | 'trend' | 'text';
  options?: {
    priority?: number;
    language?: string;
  };
}

export class QueueService {
  // Add a scraping job to the queue
  static async addScrapeJob(data: ScrapeJobData): Promise<Job> {
    return scrapingQueue.add('scrape', data, {
      priority: 1,
      jobId: `scrape-${data.platform}-${Date.now()}`,
    });
  }

  // Add an AI analysis job to the queue
  static async addAIAnalysisJob(data: AIAnalysisJobData): Promise<Job> {
    return aiAnalysisQueue.add('analyze', data, {
      priority: data.options?.priority || 2,
      jobId: `ai-${data.analysisType}-${Date.now()}`,
    });
  }

  // Get job status
  static async getJobStatus(
    jobId: string,
    queueType: 'scrape' | 'ai'
  ): Promise<{
    status: string;
    progress?: number;
    result?: unknown;
  }> {
    const queue = queueType === 'scrape' ? scrapingQueue : aiAnalysisQueue;
    const job = await queue.getJob(jobId);

    if (!job) {
      throw new Error('Job not found');
    }

    const [status, progress] = await Promise.all([
      job.getState(),
      job.progress(),
    ]);

    return {
      status,
      progress: progress || 0,
      result: job.returnvalue,
    };
  }
}
