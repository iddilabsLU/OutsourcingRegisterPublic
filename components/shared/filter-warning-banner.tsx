"use client"

import { useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"

/**
 * Warning banner that informs users filters affect dashboards
 * Can be dismissed during the session
 */
export function FilterWarningBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <Alert className="relative mb-6 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950">
      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      <AlertDescription className="ml-2 pr-8 text-sm leading-relaxed text-red-900 dark:text-red-100">
        <span className="inline"><strong>Note:</strong> Filters set in the Register List will be reflected on the Dashboard view.</span>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0 text-red-600 hover:bg-red-100 hover:text-red-900 dark:text-red-400 dark:hover:bg-red-900 dark:hover:text-red-100"
        onClick={() => setIsVisible(false)}
        aria-label="Dismiss banner"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  )
}
