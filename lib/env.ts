/**
 * Environment Variables Configuration
 *
 * Type-safe environment variables with validation.
 * App will not start if required variables are missing.
 *
 * How to use:
 * 1. Create a .env.local file in project root
 * 2. Add your variables (see .env.example for template)
 * 3. Import and use: import { env } from "@/lib/env"
 */

import { z } from "zod"

/**
 * Environment variable schema
 * Define all your environment variables here
 */
const envSchema = z.object({
  // Next.js built-in
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // API Configuration
  NEXT_PUBLIC_API_URL: z.string().url().optional(),

  // Add your own environment variables here:
  // Database (example - uncomment if you use a database)
  // DATABASE_URL: z.string().url(),

  // Authentication (example - uncomment if you use auth)
  // NEXTAUTH_URL: z.string().url(),
  // NEXTAUTH_SECRET: z.string().min(1),

  // Third-party services (examples)
  // STRIPE_SECRET_KEY: z.string().min(1).optional(),
  // SENDGRID_API_KEY: z.string().min(1).optional(),
  // GOOGLE_ANALYTICS_ID: z.string().optional(),
})

/**
 * Validate and parse environment variables
 * This runs when the module is imported
 */
const parseEnv = () => {
  try {
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV,
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,

      // Add your variables here (must match schema above)
      // DATABASE_URL: process.env.DATABASE_URL,
      // NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      // etc...
    })
  } catch (error) {
    console.error("❌ Invalid environment variables:")
    if (error instanceof z.ZodError) {
      console.error(error.flatten().fieldErrors)
    }
    throw new Error("Invalid environment variables")
  }
}

/**
 * Typed environment variables
 * Import this in your code for autocomplete
 *
 * @example
 * ```ts
 * import { env } from "@/lib/env"
 *
 * const apiUrl = env.NEXT_PUBLIC_API_URL
 * ```
 */
export const env = parseEnv()

/**
 * Type for environment variables
 * Useful for passing env config to functions
 */
export type Env = z.infer<typeof envSchema>
