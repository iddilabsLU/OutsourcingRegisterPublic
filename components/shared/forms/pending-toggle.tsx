"use client"

import { Pin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PendingToggleProps {
  /**
   * The field path identifier (e.g., "serviceProvider.name", "dates.startDate")
   */
  fieldPath: string

  /**
   * Whether the field is currently marked as pending
   */
  isPending: boolean

  /**
   * Callback function to toggle the pending state
   */
  onToggle: (fieldPath: string) => void
}

/**
 * PendingToggle Component
 *
 * A small pin icon button that allows users to mark any field as "Pending".
 * Pending fields skip validation and are highlighted in amber in the register view.
 *
 * Visual states:
 * - Inactive: Gray/muted color
 * - Active (pending): Amber color
 *
 * @example
 * <PendingToggle
 *   fieldPath="serviceProvider.name"
 *   isPending={isFieldPending("serviceProvider.name")}
 *   onToggle={toggleFieldPending}
 * />
 */
export function PendingToggle({ fieldPath, isPending, onToggle }: PendingToggleProps) {
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onToggle(fieldPath)}
            className={cn(
              "h-5 w-5 p-0 hover:bg-transparent",
              isPending
                ? "text-amber-500 hover:text-amber-600"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label={isPending ? "Remove pending status" : "Mark as pending"}
          >
            <Pin
              className={cn(
                "h-4 w-4 transition-colors",
                isPending && "fill-amber-500"
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <p>{isPending ? "Remove pending status" : "Mark as pending"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
