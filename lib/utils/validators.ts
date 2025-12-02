/**
 * Runtime Validation Utilities
 *
 * Quick validation functions for runtime checks.
 * These are different from Zod schemas (which are for forms).
 * Use these for simple yes/no checks in your code.
 */

/**
 * Check if value is a valid email
 *
 * @example
 * ```ts
 * isValidEmail("user@example.com") // true
 * isValidEmail("invalid-email") // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Check if value is a valid URL
 *
 * @example
 * ```ts
 * isValidUrl("https://example.com") // true
 * isValidUrl("not-a-url") // false
 * ```
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Check if value is a valid phone number (basic check)
 *
 * @example
 * ```ts
 * isValidPhone("1234567890") // true
 * isValidPhone("(123) 456-7890") // true
 * isValidPhone("abc") // false
 * ```
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "")
  return cleaned.length >= 10 && cleaned.length <= 15
}

/**
 * Check if string is empty or only whitespace
 *
 * @example
 * ```ts
 * isEmpty("") // true
 * isEmpty("   ") // true
 * isEmpty("hello") // false
 * ```
 */
export function isEmpty(value: string): boolean {
  return value.trim().length === 0
}

/**
 * Check if value is a number
 *
 * @example
 * ```ts
 * isNumber("123") // true
 * isNumber("abc") // false
 * isNumber("12.34") // true
 * ```
 */
export function isNumber(value: string): boolean {
  return !isNaN(parseFloat(value)) && isFinite(Number(value))
}

/**
 * Check if value is a positive number
 *
 * @example
 * ```ts
 * isPositiveNumber(5) // true
 * isPositiveNumber(-5) // false
 * isPositiveNumber(0) // false
 * ```
 */
export function isPositiveNumber(value: number): boolean {
  return typeof value === "number" && value > 0
}

/**
 * Check if date is in the past
 *
 * @example
 * ```ts
 * isInPast(new Date("2020-01-01")) // true
 * isInPast(new Date("2030-01-01")) // false
 * ```
 */
export function isInPast(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj < new Date()
}

/**
 * Check if date is in the future
 *
 * @example
 * ```ts
 * isInFuture(new Date("2030-01-01")) // true
 * isInFuture(new Date("2020-01-01")) // false
 * ```
 */
export function isInFuture(date: Date | string): boolean {
  const dateObj = typeof date === "string" ? new Date(date) : date
  return dateObj > new Date()
}

/**
 * Check if value is within a range
 *
 * @example
 * ```ts
 * isInRange(5, 1, 10) // true
 * isInRange(15, 1, 10) // false
 * ```
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max
}

/**
 * Check if file size is within limit
 *
 * @param fileSizeInBytes - File size in bytes
 * @param maxSizeInMB - Maximum size in megabytes
 *
 * @example
 * ```ts
 * isFileSizeValid(1024 * 1024, 2) // true (1MB file, 2MB limit)
 * isFileSizeValid(1024 * 1024 * 3, 2) // false (3MB file, 2MB limit)
 * ```
 */
export function isFileSizeValid(fileSizeInBytes: number, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return fileSizeInBytes <= maxSizeInBytes
}

/**
 * Check if file type is allowed
 *
 * @param fileType - MIME type (e.g., "image/png")
 * @param allowedTypes - Array of allowed MIME types
 *
 * @example
 * ```ts
 * isFileTypeAllowed("image/png", ["image/png", "image/jpeg"]) // true
 * isFileTypeAllowed("video/mp4", ["image/png", "image/jpeg"]) // false
 * ```
 */
export function isFileTypeAllowed(fileType: string, allowedTypes: string[]): boolean {
  return allowedTypes.includes(fileType)
}

/**
 * Check if string contains only letters
 *
 * @example
 * ```ts
 * isAlpha("Hello") // true
 * isAlpha("Hello123") // false
 * ```
 */
export function isAlpha(value: string): boolean {
  return /^[A-Za-z]+$/.test(value)
}

/**
 * Check if string contains only letters and numbers
 *
 * @example
 * ```ts
 * isAlphanumeric("Hello123") // true
 * isAlphanumeric("Hello 123") // false (space not allowed)
 * ```
 */
export function isAlphanumeric(value: string): boolean {
  return /^[A-Za-z0-9]+$/.test(value)
}

/**
 * Check if password meets strength requirements
 * Requires: min 8 chars, uppercase, lowercase, number, special char
 *
 * @example
 * ```ts
 * isStrongPassword("Pass123!") // true
 * isStrongPassword("password") // false
 * ```
 */
export function isStrongPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
}
