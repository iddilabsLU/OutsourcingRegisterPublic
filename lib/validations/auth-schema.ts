import { z } from 'zod'

/**
 * Validation schema for login form
 */
export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean(),
})

export type LoginFormData = z.infer<typeof loginSchema>

/**
 * Validation schema for master password login
 */
export const masterLoginSchema = z.object({
  password: z.string().min(1, 'Master password is required'),
})

export type MasterLoginFormData = z.infer<typeof masterLoginSchema>

/**
 * Validation schema for creating a new user
 */
export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be less than 100 characters'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters'),
  role: z.enum(['admin', 'editor', 'viewer']),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>

/**
 * Validation schema for editing a user (password optional)
 */
export const editUserSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(100, 'Display name must be less than 100 characters'),
  password: z
    .string()
    .max(100, 'Password must be less than 100 characters')
    .refine((val) => !val || val.length >= 6, {
      message: 'Password must be at least 6 characters',
    }),
  role: z.enum(['admin', 'editor', 'viewer']),
})

export type EditUserFormData = z.infer<typeof editUserSchema>

/**
 * Validation schema for changing password
 */
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(6, 'New password must be at least 6 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>

/**
 * Validation schema for changing master password
 */
export const changeMasterPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current master password is required'),
    newPassword: z
      .string()
      .min(8, 'Master password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type ChangeMasterPasswordFormData = z.infer<typeof changeMasterPasswordSchema>
