import { z } from 'zod';

// * Create Feature DTO Schema
export const createFeatureDTOSchema = z.object({
  name: z.string().min(1, 'Feature name is required').trim(),
  description: z.string().min(1, 'Feature description is required').trim(),
  enabled: z.boolean().default(false),
  env: z.enum(['development', 'production', 'test']).default('development'),
  version: z.string().default('v1'),
  percentage: z.number().min(0).max(100).default(100),
  users: z.array(z.string()).optional(),
  expiresAt: z.coerce.date().optional(), // * Coerce string to Date
  dependencies: z.array(z.string()).optional(),
  activatesAt: z.coerce.date().optional(),
  deactivatesAt: z.coerce.date().optional(),
  group: z.string().optional(),
  metadata: z.record(z.any()).optional(), // * Flexible key-value pairs
  rateLimit: z
    .number()
    .min(1, 'Rate limit must be at least 1 request per minute')
    .optional(),
  fallbackFlag: z.string().optional(),
  priority: z.number().default(0),
});

// * Update Feature DTO Schema
export const updateFeatureDTOSchema = z
  .object({
    enabled: z.boolean().optional(),
    description: z
      .string()
      .min(1, 'Feature description is required')
      .trim()
      .optional(),
    env: z.enum(['development', 'production', 'test']).optional(),
    version: z.string().optional(),
    percentage: z.number().min(0).max(100).optional(),
    users: z.array(z.string()).optional(),
    expiresAt: z.coerce.date().optional(),
    dependencies: z.array(z.string()).optional(),
    activatesAt: z.coerce.date().optional(),
    deactivatesAt: z.coerce.date().optional(),
    group: z.string().optional(),
    metadata: z.record(z.any()).optional(),
    rateLimit: z
      .number()
      .min(1, 'Rate limit must be at least 1 request per minute')
      .optional(),
    fallbackFlag: z.string().optional(),
    priority: z.number().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// * Toggle Group DTO Schema
export const toggleGroupDTOSchema = z.object({
  enabled: z.boolean().refine((val) => typeof val === 'boolean', {
    message: 'Enabled must be a boolean',
  }),
});
