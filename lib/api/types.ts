/**
 * Generic API Types
 *
 * These types are used across the entire application for API communication.
 * They provide consistent structure for requests and responses.
 */

/**
 * Standard API Response wrapper
 * All API responses should follow this structure
 *
 * @example
 * ```ts
 * const response: ApiResponse<User> = {
 *   success: true,
 *   data: { id: 1, name: "John" },
 *   message: "User fetched successfully"
 * }
 * ```
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: ApiError
}

/**
 * API Error structure
 * Provides detailed error information
 */
export interface ApiError {
  code: string
  message: string
  details?: unknown
  statusCode?: number
}

/**
 * Pagination parameters for list requests
 *
 * @example
 * ```ts
 * const params: PaginationParams = {
 *   page: 1,
 *   limit: 20,
 *   sortBy: "createdAt",
 *   sortOrder: "desc"
 * }
 * ```
 */
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: "asc" | "desc"
}

/**
 * Paginated response wrapper
 * Used when returning lists of data
 *
 * @example
 * ```ts
 * const response: PaginatedResponse<User> = {
 *   items: [{ id: 1, name: "John" }, { id: 2, name: "Jane" }],
 *   total: 100,
 *   page: 1,
 *   limit: 20,
 *   totalPages: 5
 * }
 * ```
 */
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/**
 * HTTP Methods supported by the API client
 */
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

/**
 * Request configuration options
 */
export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  retries?: number
  cache?: RequestCache
}
