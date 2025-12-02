"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Info, X } from "lucide-react"

const DISMISSAL_KEY = "demo-banner-dismissed"

/**
 * Demo banner that explains sessionStorage behavior
 * Shows on first visit, can be dismissed permanently
 */
export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle client-side mounting (avoid SSR hydration issues)
  useEffect(() => {
    setMounted(true)
    const dismissed = sessionStorage.getItem(DISMISSAL_KEY)
    setIsVisible(!dismissed)
  }, [])

  const handleDismiss = () => {
    sessionStorage.setItem(DISMISSAL_KEY, "true")
    setIsVisible(false)
  }

  // Don't render until mounted (avoid SSR mismatch)
  if (!mounted || !isVisible) {
    return null
  }

  return (
    <Alert className="relative mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
      <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
      <AlertDescription className="ml-2 pr-8 text-sm leading-relaxed text-blue-900 dark:text-blue-100">
        <span className="inline"><strong>Demo Mode:</strong> Your changes are saved during this browser session only. Refreshing the page will preserve your work, but closing this tab will reset all data to the default 5 suppliers.</span>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0 text-blue-600 hover:bg-blue-100 hover:text-blue-900 dark:text-blue-400 dark:hover:bg-blue-900 dark:hover:text-blue-100"
        onClick={handleDismiss}
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
