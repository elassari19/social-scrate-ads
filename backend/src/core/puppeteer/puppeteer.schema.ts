import { z } from 'zod';

// Schema for web content processing with DeepSeek AI
export const webContentDeepSeekSchema = z.object({
  url: z.string().url(),
  prompt: z.string(),
  customSelectors: z.record(z.string()).optional(),
  fullPageContent: z.boolean().optional().default(false),
  additionalContext: z.record(z.any()).optional(),
});

export type WebContentDeepSeekRequest = z.infer<
  typeof webContentDeepSeekSchema
>;
