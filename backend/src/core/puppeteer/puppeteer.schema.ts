import { z } from 'zod';

// Schema for screenshot endpoint
export const screenshotSchema = z.object({
  url: z.string().url(),
  selector: z.string().optional(),
});

// Schema for scrape content endpoint
export const scrapeContentSchema = z.object({
  url: z.string().url(),
  selectors: z.record(z.string()),
});

// Schema for social media ads endpoint
export const socialMediaAdsSchema = z.object({
  platform: z.enum(['facebook', 'twitter', 'linkedin', 'instagram']),
  query: z.string().optional(),
});

// Custom type definitions based on the schemas
export type ScreenshotRequest = z.infer<typeof screenshotSchema>;
export type ScrapeContentRequest = z.infer<typeof scrapeContentSchema>;
export type SocialMediaAdsRequest = z.infer<typeof socialMediaAdsSchema>;
