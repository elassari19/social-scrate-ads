import { useState } from 'react';
import { puppeteerApi } from '@/lib/puppeteer-api';

interface UsePuppeteerOptions {
  onError?: (error: Error) => void;
}

export function usePuppeteer(hookOptions: UsePuppeteerOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Scrape content from a webpage
  const scrapeContent = async (
    url: string,
    selectors: Record<string, string>
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await puppeteerApi.scrapeContent({ url, selectors });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      hookOptions.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Scrape social media ads
  const scrapeSocialMediaAds = async (
    platform: 'facebook' | 'twitter' | 'linkedin' | 'instagram',
    query?: string
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await puppeteerApi.scrapeSocialMediaAds({ platform, query });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      hookOptions.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Use DeepSeek AI to scrape data based on actor script
  const scrapeWithDeepSeekAI = async (
    actorNamespace: string,
    functionOptions?: {
      location?: string;
      jobs?: string[];
      posts?: string[];
      additionalContext?: Record<string, any>;
    }
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await puppeteerApi.scrapeWithDeepSeekAI({
        actorNamespace,
        location: functionOptions?.location,
        jobs: functionOptions?.jobs,
        posts: functionOptions?.posts,
        additionalContext: functionOptions?.additionalContext,
      });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      hookOptions.onError?.(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    scrapeContent,
    scrapeSocialMediaAds,
    scrapeWithDeepSeekAI,
  };
}
