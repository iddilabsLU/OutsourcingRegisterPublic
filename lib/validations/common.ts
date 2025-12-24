/**
 * Common Validation Schemas
 *
 * Reusable Zod validators for common data types.
 * Use these across different forms to ensure consistency.
 */

import * as z from "zod"

/**
 * Email validation
 * Ensures valid email format
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   email: emailSchema
 * })
 * ```
 */
export const emailSchema = z.string().email({
  message: "Please enter a valid email address.",
})

/**
 * Password validation
 * Minimum 8 characters
 *
 * @example
 * ```ts
 * const schema = z.object({
 *   password: passwordSchema
 * })
 * ```
 */
export const passwordSchema = z.string().min(8, {
  message: "Password must be at least 8 characters.",
})

/**
 * Strong password validation
 * Requires uppercase, lowercase, number, special character
 */
export const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

/**
 * Name validation
 * At least 2 characters, letters and spaces only
 */
export const nameSchema = z
  .string()
  .min(2, {
    message: "Name must be at least 2 characters.",
  })
  .max(100, {
    message: "Name must be less than 100 characters.",
  })

/**
 * Phone number validation (basic)
 * Allows various formats: (123) 456-7890, 123-456-7890, 1234567890
 */
export const phoneSchema = z.string().regex(/^[\d\s\-\(\)]+$/, {
  message: "Please enter a valid phone number.",
})

/**
 * URL validation
 * Ensures valid URL format
 */
export const urlSchema = z.string().url({
  message: "Please enter a valid URL.",
})

/**
 * Required text field
 * Non-empty string with trimming
 */
export const requiredTextSchema = z.string().trim().min(1, {
  message: "This field is required.",
})

/**
 * Optional text field
 * Allows empty or valid text
 */
export const optionalTextSchema = z.string().trim().optional()

/**
 * Positive number validation
 * Must be greater than 0
 */
export const positiveNumberSchema = z.number().positive({
  message: "Must be a positive number.",
})

/**
 * Non-negative number validation
 * Must be 0 or greater
 */
export const nonNegativeNumberSchema = z.number().nonnegative({
  message: "Must be 0 or greater.",
})

/**
 * Date string validation
 * Ensures valid ISO date string
 */
export const dateStringSchema = z.string().datetime({
  message: "Please enter a valid date.",
})

/**
 * Future date validation
 * Date must be in the future
 */
export const futureDateSchema = z.string().refine(
  (date) => {
    const inputDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return inputDate >= today
  },
  {
    message: "Date must be today or in the future.",
  }
)

/**
 * File upload validation
 * Checks file size and type
 *
 * @param maxSizeMB - Maximum file size in megabytes
 * @param allowedTypes - Array of allowed MIME types
 */
export const createFileSchema = (maxSizeMB: number, allowedTypes: string[]) => {
  return z
    .instanceof(File)
    .refine((file) => file.size <= maxSizeMB * 1024 * 1024, {
      message: `File size must be less than ${maxSizeMB}MB.`,
    })
    .refine((file) => allowedTypes.includes(file.type), {
      message: `File type must be one of: ${allowedTypes.join(", ")}`,
    })
}
