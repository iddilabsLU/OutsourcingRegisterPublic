/**
 * Common TypeScript Types
 *
 * Shared types used across the application.
 * Keep these generic and reusable.
 */

/**
 * Generic User type
 * Customize based on your application's needs
 */
export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Pagination metadata
 * Used with paginated API responses
 */
export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

/**
 * Sort configuration
 * Used for table sorting
 */
export interface SortConfig {
  field: string
  direction: "asc" | "desc"
}

/**
 * Filter configuration
 * Used for table filtering and search
 */
export interface FilterConfig {
  field: string
  value: unknown
  operator?: "equals" | "contains" | "startsWith" | "endsWith" | "gt" | "lt"
}

/**
 * Generic list query parameters
 * Combine pagination, sorting, and filtering
 */
export interface ListQueryParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
  search?: string
  filters?: FilterConfig[]
}

/**
 * Upload file metadata
 * Used for file upload tracking
 */
export interface FileMetadata {
  id: string
  name: string
  size: number
  type: string
  url?: string
  uploadedAt?: string
}

/**
 * Generic status types
 * Use for records that have status fields
 */
export type Status = "active" | "inactive" | "pending" | "archived"

/**
 * Generic form state
 * Track form submission status
 */
export interface FormState {
  isSubmitting: boolean
  isSuccess: boolean
  isError: boolean
  message?: string
}

/**
 * Toast/Notification type
 * For toast notification systems
 */
export interface Notification {
  id: string
  type: "success" | "error" | "warning" | "info"
  title: string
  message?: string
  duration?: number
}

/**
 * Generic option type for select/dropdown components
 */
export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
}

/**
 * Generic metadata type
 * For additional flexible data
 */
export type Metadata = Record<string, unknown>

/**
 * Type-safe localStorage keys
 * Add your keys here for autocomplete
 */
export type LocalStorageKey = "theme" | "user" | "preferences" | "auth_token"
