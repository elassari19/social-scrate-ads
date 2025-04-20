import { z } from 'zod';

// Schema for creating a new actor
export const createActorSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    namespace: z
      .string()
      .min(1, 'Namespace is required')
      .regex(
        /^[a-z0-9-]+$/,
        'Namespace must contain only lowercase letters, numbers, and hyphens'
      ),
    description: z.string().min(1, 'Description is required'),
    stars: z.string(),
    rating: z.number().min(0).max(5),
    authorName: z.string().min(1, 'Author name is required'),
    authorBadgeColor: z.string(),
    icon: z.string(),
    iconBg: z.string(),
    script: z.string().min(1, 'Puppeteer script is required'),
  }),
});

// Schema for updating an actor
export const updateActorSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid actor ID'),
  }),
  body: z.object({
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
    stars: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    authorName: z.string().min(1, 'Author name is required').optional(),
    authorBadgeColor: z.string().optional(),
    icon: z.string().optional(),
    iconBg: z.string().optional(),
    script: z.string().min(1, 'Puppeteer script is required').optional(),
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

// Custom type definitions based on the schemas
export type CreateActorRequest = z.infer<typeof createActorSchema>['body'];
export type UpdateActorRequest = z.infer<typeof updateActorSchema>['body'];
export type ExecuteActorRequest = z.infer<typeof executeActorSchema>['body'];
