import { z } from 'zod';
import { ROLES } from '../constants/index.js';

// * Base user schema (shared fields)
const baseUserSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email format').toLowerCase(),
});

// * DTO Schemas
export const createUserDTOSchema = baseUserSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character',
    ),
});

export const loginUserDTOSchema = z.object({
  email: z.string().email('Invalid email format').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserDTOSchema = baseUserSchema
  .partial() // * All fields optional
  .extend({
    role: z.enum(Object.values(ROLES)).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  });

// * Since no transformations are needed (e.g., reshaping req.body into a different structure), DTOs in the controller aren’t necessary
// export const toCreateUserDTO = (data) => createUserDTOSchema.parse(data);
// export const toLoginUserDTO = (data) => loginUserDTOSchema.parse(data);
// export const toUpdateUserDTO = (data) => updateUserDTOSchema.parse(data);
