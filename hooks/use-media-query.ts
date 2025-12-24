"use client"

import { useEffect, useState } from "react"

/**
 * Custom hook for responsive design breakpoints
 *
 * Detects screen size and returns boolean for different device types.
 * Useful for showing/hiding elements or changing layouts based on screen size.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const isMobile = useMediaQuery("(max-width: 768px)")
 *   const isDesktop = useMediaQuery("(min-width: 1024px)")
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileMenu />}
 *       {isDesktop && <DesktopSidebar />}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Create media query
    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create listener function
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add listener for changes
    media.addEventListener("change", listener)

    // Cleanup
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}

/**
 * Common breakpoint helpers
 * Use these for standard responsive design patterns
 */
export const useIsMobile = () => useMediaQuery("(max-width: 768px)")
export const useIsTablet = () => useMediaQuery("(min-width: 769px) and (max-width: 1023px)")
export const useIsDesktop = () => useMediaQuery("(min-width: 1024px)")
