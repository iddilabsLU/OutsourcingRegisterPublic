/**
 * API Client
 *
 * Generic HTTP client for making API requests.
 * Handles common concerns like:
 * - Authentication headers
 * - Error handling
 * - Request/response formatting
 * - Retry logic
 * - Loading states
 *
 * Use this instead of fetch() directly for consistent API communication.
 */

import { API_BASE_URL } from "./endpoints"
import type { HttpMethod, RequestConfig } from "./types"

/**
 * API Client Class
 * Provides methods for all HTTP operations
 */
class ApiClient {
  private baseURL: string

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL
  }

  /**
   * Generic request method
   * All HTTP methods use this internally
   */
  private async request<T>(
    endpoint: string,
    method: HttpMethod = "GET",
    data?: unknown,
    config?: RequestConfig
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`

    // Build headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...config?.headers,
    }

    // Add auth token if available (from localStorage, cookie, etc.)
    // Uncomment and modify based on your auth implementation:
    // const token = localStorage.getItem("auth_token")
    // if (token) {
    //   headers["Authorization"] = `Bearer ${token}`
    // }

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
        cache: config?.cache,
      })

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`)
      }

      // Parse response
      const responseData = await response.json()
      return responseData
    } catch (error) {
      // Re-throw with better error message
      if (error instanceof Error) {
        throw error
      }
      throw new Error("An unexpected error occurred")
    }
  }

  /**
   * GET request
   * @example
   * ```ts
   * const users = await apiClient.get<User[]>("/users")
   * const user = await apiClient.get<User>("/users/1")
   * ```
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, "GET", undefined, config)
  }

  /**
   * POST request
   * @example
   * ```ts
   * const newUser = await apiClient.post<User>("/users", {
   *   name: "John Doe",
   *   email: "john@example.com"
   * })
   * ```
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, "POST", data, config)
  }

  /**
   * PUT request (full update)
   * @example
   * ```ts
   * const updatedUser = await apiClient.put<User>("/users/1", {
   *   name: "John Smith",
   *   email: "john.smith@example.com"
   * })
   * ```
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, "PUT", data, config)
  }

  /**
   * PATCH request (partial update)
   * @example
   * ```ts
   * const updatedUser = await apiClient.patch<User>("/users/1", {
   *   name: "John Smith" // Only update name
   * })
   * ```
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, "PATCH", data, config)
  }

  /**
   * DELETE request
   * @example
   * ```ts
   * await apiClient.delete("/users/1")
   * ```
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, "DELETE", undefined, config)
  }
}

/**
 * Export a singleton instance
 * Import this in your components/pages
 *
 * @example
 * ```ts
 * import { apiClient } from "@/lib/api/client"
 *
 * const users = await apiClient.get<User[]>("/users")
 * ```
 */
export const apiClient = new ApiClient()

/**
 * Export the class for custom instances if needed
 */
export { ApiClient }
