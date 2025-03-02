import { z } from 'zod';

// Create Feature DTO Schema
export const createFeatureDTOSchema = z.object({
  name: z.string().min(1, 'Feature name is required').trim(),
  description: z.string().min(1, 'Feature description is required').trim(),
  enabled: z.boolean().default(false),
});

// Update Feature DTO Schema
export const updateFeatureDTOSchema = z
  .object({
    enabled: z.boolean().optional(),
    description: z
      .string()
      .min(1, 'Feature description is required')
      .trim()
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });
