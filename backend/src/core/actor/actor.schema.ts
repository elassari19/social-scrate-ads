import { z } from 'zod';

// Schema for creating a new actor
export const createActorSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  namespace: z
    .string()
    .min(1, 'Namespace is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Namespace must contain only lowercase letters, numbers, and hyphens'
    ),
  description: z.string().min(1, 'Description is required'),
  authorName: z.string().min(1, 'Author name is required'),
  icon: z.string(),
  page: z
    .any()
    .optional()
    .refine(
      (val) => val === undefined || val !== null,
      'Puppeteer script cannot be null'
    ),
  prompt: z.string().optional(), // Main prompt for DeepSeek AI integration
  prompts: z.record(z.string()).optional().default({}), // Additional prompts for AI analysis
  tags: z.array(z.string()).optional().default([]),
  dependencies: z.array(z.string()).optional().default([]),
  platform: z.string().optional(), // Optional platform field for categorization
});

// Schema for updating an actor
export const updateActorSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  namespace: z
    .string()
    .min(1, 'Namespace is required')
    .regex(
      /^[a-z0-9-]+$/,
      'Namespace must contain only lowercase letters, numbers, and hyphens'
    )
    .optional(),
  description: z.string().min(1, 'Description is required').optional(),
  authorName: z.string().min(1, 'Author name is required').optional(),
  icon: z.string().url().optional(),
  page: z
    .any()
    .optional()
    .refine(
      (val) => val === undefined || val !== null,
      'Puppeteer script cannot be null'
    ),
  prompt: z.string().optional(),
  prompts: z.record(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  platform: z.string().optional(), // Optional platform field for categorization
});

// Schema for actor rating
export const rateActorSchema = z.object({
  params: z.object({
    actorId: z.string().uuid('Invalid actor ID'),
  }),
  body: z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().optional(),
  }),
});

// Schema for executing an actor
export const executeActorSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid actor ID'),
  }),
  body: z.object({
    url: z.string().url('Invalid URL').optional(),
    options: z.record(z.any()).optional(),
  }),
});

// Schema for DeepSeek AI integration
export const deepSeekActorSchema = z.object({
  platform: z.string().min(3, 'Platform is required'),
  prompt: z.string().min(20, 'Prompt is required'),
  additionalContext: z.record(z.any()).optional().default({}),
});

// Custom type definitions based on the schemas
export type CreateActorRequest = z.infer<typeof createActorSchema>;
export type UpdateActorRequest = z.infer<typeof updateActorSchema>;
export type RateActorRequest = z.infer<typeof rateActorSchema>;
export type ExecuteActorRequest = z.infer<typeof executeActorSchema>;
export type DeepSeekActorRequest = z.infer<typeof deepSeekActorSchema>;
