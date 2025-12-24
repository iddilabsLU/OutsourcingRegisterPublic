/**
 * Validations Index
 *
 * Central export point for all validation schemas.
 * Import validations from here for convenience.
 *
 * @example
 * ```ts
 * import { loginSchema, emailSchema } from "@/lib/validations"
 * ```
 */

// Re-export all common validators
export * from "./common"

// Re-export auth validators
export * from "./auth"

/**
 * Add more exports as you create new validation files:
 * export * from "./user"
 * export * from "./product"
 * export * from "./order"
 */
