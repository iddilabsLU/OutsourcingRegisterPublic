/**
 * API Endpoints Configuration
 *
 * Central location for all API endpoint URLs.
 * Update these based on your backend API structure.
 *
 * Benefits:
 * - Change URLs in one place instead of scattered throughout code
 * - Easy to switch between development/staging/production
 * - Type-safe endpoint references
 * - Clear overview of all available endpoints
 */

/**
 * Base API URL
 * Override with environment variable in production
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

/**
 * API Endpoints
 * Organize by feature/domain
 *
 * @example Usage
 * ```ts
 * import { API_ENDPOINTS } from "@/lib/api/endpoints"
 * import { apiClient } from "@/lib/api/client"
 *
 * // Fetch users
 * const users = await apiClient.get(API_ENDPOINTS.users.list)
 *
 * // Get specific user
 * const user = await apiClient.get(API_ENDPOINTS.users.byId(userId))
 * ```
 */
export const API_ENDPOINTS = {
  // Example: User endpoints
  users: {
    list: "/users",
    byId: (id: string | number) => `/users/${id}`,
    create: "/users",
    update: (id: string | number) => `/users/${id}`,
    delete: (id: string | number) => `/users/${id}`,
  },

  // Example: Authentication endpoints
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    register: "/auth/register",
    refresh: "/auth/refresh",
    me: "/auth/me",
  },

  // Add your own endpoints here
  // Example for a supplier management system:
  // suppliers: {
  //   list: "/suppliers",
  //   byId: (id: string | number) => `/suppliers/${id}`,
  //   create: "/suppliers",
  //   update: (id: string | number) => `/suppliers/${id}`,
  //   delete: (id: string | number) => `/suppliers/${id}`,
  // },
} as const
