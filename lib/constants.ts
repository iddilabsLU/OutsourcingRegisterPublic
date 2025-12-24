/**
 * Application Constants
 *
 * Central location for all fixed values used throughout the app.
 * Change these to customize app behavior globally.
 *
 * Benefits:
 * - Change value in ONE place, updates everywhere
 * - Consistent behavior across the app
 * - Easy to find and update settings
 */

/**
 * Pagination Settings
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const

/**
 * File Upload Settings
 */
export const FILE_UPLOAD = {
  MAX_FILE_SIZE_MB: 5,
  MAX_FILE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB in bytes

  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "application/msword", "text/plain"],
  ALLOWED_VIDEO_TYPES: ["video/mp4", "video/webm"],

  // All allowed types combined
  ALLOWED_TYPES: [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "text/plain",
    "video/mp4",
    "video/webm",
  ],
} as const

/**
 * Date & Time Formats
 * Used with formatDate() utility
 */
export const DATE_FORMATS = {
  SHORT: "MM/DD/YYYY",
  LONG: "MMMM D, YYYY",
  WITH_TIME: "MM/DD/YYYY HH:mm",
  TIME_ONLY: "HH:mm",
  ISO: "YYYY-MM-DD",
} as const

/**
 * API Settings
 */
export const API = {
  TIMEOUT_MS: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000, // 1 second
} as const

/**
 * Form Settings
 */
export const FORMS = {
  DEBOUNCE_DELAY_MS: 500,
  MIN_PASSWORD_LENGTH: 8,
  MAX_TEXT_LENGTH: 500,
  MAX_TEXTAREA_LENGTH: 2000,
} as const

/**
 * Status Values
 * Use these for consistent status across your app
 */
export const STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  PENDING: "pending",
  ARCHIVED: "archived",
} as const

/**
 * User Roles (Example)
 * Customize based on your app's permission system
 */
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  GUEST: "guest",
} as const

/**
 * Toast/Notification Settings
 */
export const NOTIFICATIONS = {
  DEFAULT_DURATION_MS: 3000, // 3 seconds
  ERROR_DURATION_MS: 5000, // 5 seconds
  SUCCESS_DURATION_MS: 3000,
} as const

/**
 * Breakpoints (matches Tailwind CSS defaults)
 * Use with useMediaQuery hook
 */
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  "2XL": 1536,
} as const

/**
 * Regular Expressions
 * Common regex patterns used throughout the app
 */
export const REGEX = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\d\s\-\(\)]+$/,
  URL: /^https?:\/\/.+/,
  ALPHANUMERIC: /^[A-Za-z0-9]+$/,
  ALPHA_ONLY: /^[A-Za-z]+$/,
  NUMERIC_ONLY: /^[0-9]+$/,
} as const

/**
 * Local Storage Keys
 * Type-safe keys for localStorage
 */
export const STORAGE_KEYS = {
  THEME: "theme",
  USER_PREFERENCES: "user_preferences",
  AUTH_TOKEN: "auth_token",
  LANGUAGE: "language",
} as const

/**
 * Route Paths
 * Define your app's routes in one place
 */
export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  PROFILE: "/profile",
  SETTINGS: "/settings",

  // Add your own routes here
  // SUPPLIERS: "/suppliers",
  // ORDERS: "/orders",
} as const

/**
 * App Metadata
 * Used for SEO, social sharing, etc.
 */
export const APP_METADATA = {
  NAME: "Boilerplate Theme",
  DESCRIPTION: "A production-ready Next.js boilerplate with TypeScript and Tailwind CSS",
  URL: "https://example.com",
  AUTHOR: "Your Name",
  VERSION: "1.0.0",
} as const

/**
 * Add your own constant groups here based on your app's needs
 *
 * Examples:
 * - Payment settings (currency, methods)
 * - Feature flags (enable/disable features)
 * - Business rules (tax rates, shipping costs)
 * - External service URLs
 * - Error messages
 */
