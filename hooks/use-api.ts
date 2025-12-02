"use client"

import { useEffect, useState } from "react"

/**
 * State for API requests
 */
interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

/**
 * Custom hook for fetching data from APIs
 *
 * Handles loading states, errors, and data fetching automatically.
 * Works with the API client in /lib/api/client.ts
 *
 * @param fetchFunction - Async function that fetches data
 * @param dependencies - Array of dependencies (re-fetch when these change)
 *
 * @example
 * ```tsx
 * function UserList() {
 *   const { data, loading, error } = useApi(
 *     () => apiClient.get("/users"),
 *     [] // Empty array = fetch once on mount
 *   )
 *
 *   if (loading) return <Spinner />
 *   if (error) return <ErrorMessage error={error} />
 *   if (!data) return null
 *
 *   return <div>{data.map(user => <UserCard key={user.id} user={user} />)}</div>
 * }
 * ```
 *
 * @example With dependencies
 * ```tsx
 * function FilteredUsers({ status }: { status: string }) {
 *   const { data, loading, error } = useApi(
 *     () => apiClient.get(`/users?status=${status}`),
 *     [status] // Re-fetch when status changes
 *   )
 *
 *   // ... render logic
 * }
 * ```
 */
export function useApi<T>(
  fetchFunction: () => Promise<T>,
  dependencies: unknown[] = []
): UseApiState<T> {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    let cancelled = false

    // Reset to loading state
    setState({ data: null, loading: true, error: null })

    // Fetch data
    fetchFunction()
      .then((data) => {
        if (!cancelled) {
          setState({ data, loading: false, error: null })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setState({
            data: null,
            loading: false,
            error: error instanceof Error ? error : new Error("An error occurred"),
          })
        }
      })

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return state
}
