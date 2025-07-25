import { z } from 'zod';

// Schema for web content processing with DeepSeek AI
export const webContentDeepSeekSchema = z.object({
  url: z.string().url().optional(), // Now optional as DeepSeek will generate the URL
  prompt: z.string().min(1, 'Prompt is required'),
  customSelectors: z.record(z.string()).optional(),
  fullPageContent: z.boolean().optional().default(false),
  actorNamespace: z.string().optional(), // Added to support actor-based scraping
  additionalContext: z.record(z.any()).optional(),
});

// Schema for generated URL and selectors from DeepSeek
export const urlAndSelectorsSchema = z.object({
  url: z.string().url(),
  selectors: z.record(z.string()),
  pagination: z
    .object({
      nextPageSelector: z.string().optional(),
      maxPages: z.number().int().positive().default(1),
    })
    .optional(),
});

// New schema for analyzing actor ratings
export const analyzeRatingsSchema = z.object({
  actorId: z.string().uuid('Invalid actor ID'),
  prompt: z.string().optional(),
  additionalContext: z.record(z.any()).optional(),
});

// New schema for selecting a specific response
export const selectResponseSchema = z.object({
  actorId: z.string().uuid('Invalid actor ID'),
  responseId: z.string().min(1, 'Response ID is required'),
  properties: z.array(z.string()).optional(),
  dataPath: z.string().optional(),
  defaultResult: z.number().int().min(1).max(1000).optional(),
});

export type WebContentDeepSeekRequest = z.infer<
  typeof webContentDeepSeekSchema
>;
export type UrlAndSelectorsResponse = z.infer<typeof urlAndSelectorsSchema>;
export type AnalyzeRatingsRequest = z.infer<typeof analyzeRatingsSchema>;
export type SelectResponseRequest = z.infer<typeof selectResponseSchema>;
