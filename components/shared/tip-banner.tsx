"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Info, X } from "lucide-react"

/**
 * Tip banner that shows helpful information to users
 * Can be dismissed during the session
 */
export function TipBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) {
    return null
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/50 px-4 py-2">
      <div className="flex items-start gap-2">
        <Info className="h-4 w-4 text-muted-foreground" />
        <div className="flex flex-col space-y-1">
          <p className="text-sm text-foreground">
            <span className="font-medium">Tip 1:</span> Click on any row to view full outsourcing
            details
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Tip 2:</span> Press on the 3 dots beside each outsourcing
            to edit, duplicate or delete any entry.
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Tip 3:</span> Use &apos;Mark as pending&apos; for fields
            you need to review. They will turn amber. Set them in the new entry tab or when editing
            a supplier.
          </p>
          <p className="text-sm text-foreground">
            <span className="font-medium">Tip 4:</span> Press on the CSSF reference beside each
            field to view the exact Circular wording.
          </p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsVisible(false)}
        className="h-7 w-7 p-0 hover:bg-background"
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close tip</span>
      </Button>
    </div>
  )
}
