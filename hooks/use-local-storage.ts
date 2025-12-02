"use client"

import { useState } from "react"

/**
 * Custom hook for localStorage with SSR safety
 *
 * Stores and retrieves values from browser's localStorage.
 * Automatically handles JSON serialization/deserialization.
 * Safe to use in Next.js (handles server-side rendering).
 *
 * @example
 * ```tsx
 * function UserPreferences() {
 *   const [theme, setTheme] = useLocalStorage("theme", "light")
 *   const [itemsPerPage, setItemsPerPage] = useLocalStorage("itemsPerPage", 20)
 *
 *   return (
 *     <div>
 *       <button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
 *         Toggle Theme
 *       </button>
 *       <p>Current theme: {theme}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Only access localStorage on client side
    if (typeof window === "undefined") {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error loading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter function that persists to localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function (same API as useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value

      // Save state
      setStoredValue(valueToStore)

      // Save to localStorage (only on client side)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}
