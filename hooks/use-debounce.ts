"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook for debouncing values
 *
 * Delays updating a value until after a specified time has passed.
 * Useful for search inputs - prevents searching on every keystroke.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 500ms)
 *
 * @example
 * ```tsx
 * function SearchBox() {
 *   const [searchTerm, setSearchTerm] = useState("")
 *   const debouncedSearch = useDebounce(searchTerm, 500)
 *
 *   useEffect(() => {
 *     // This only runs 500ms after user stops typing
 *     if (debouncedSearch) {
 *       fetchSearchResults(debouncedSearch)
 *     }
 *   }, [debouncedSearch])
 *
 *   return (
 *     <input
 *       type="text"
 *       value={searchTerm}
 *       onChange={(e) => setSearchTerm(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   )
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cancel the timeout if value changes (cleanup function)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
