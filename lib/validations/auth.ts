/**
 * Authentication Validation Schemas
 *
 * Zod schemas for login, registration, and password management.
 * These are generic patterns you can customize for your app.
 */

import * as z from "zod"
import { emailSchema, passwordSchema, nameSchema } from "./common"

/**
 * Login Form Schema
 * Email and password required
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   resolver: zodResolver(loginSchema),
 *   defaultValues: { email: "", password: "" }
 * })
 * ```
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  rememberMe: z.boolean().optional(),
})

/**
 * Registration Form Schema
 * Name, email, password, and password confirmation
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   resolver: zodResolver(registerSchema),
 * })
 * ```
 */
export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

/**
 * Forgot Password Schema
 * Just email required
 */
export const forgotPasswordSchema = z.object({
  email: emailSchema,
})

/**
 * Reset Password Schema
 * New password and confirmation
 */
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })

/**
 * Change Password Schema
 * Current password, new password, and confirmation
 */
export const changePasswordSchema = z
  .object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })

/**
 * TypeScript types inferred from schemas
 * Use these for form data types
 */
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
