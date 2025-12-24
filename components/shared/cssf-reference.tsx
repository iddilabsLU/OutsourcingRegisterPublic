"use client"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { getCssfReference } from "@/lib/constants/cssf-references"

interface CssfReferenceProps {
  reference: string
}

/**
 * Interactive CSSF reference component
 *
 * Displays CSSF circular reference codes (e.g., "54.a", "55.c") with interactive popover
 * showing the full regulatory text from CSSF Circular 22/806 Section 4.2.7
 *
 * Behavior:
 * - Default: Displays as static gray text "(54.a)"
 * - Hover: Shows dotted underline + pointer cursor
 * - Click: Opens popover with full regulatory text
 * - Keyboard: Tab to focus, Enter/Space to open
 *
 * @example
 * <FormLabel>
 *   Provider Name
 *   <CssfReference reference="54.e" />
 * </FormLabel>
 */
export function CssfReference({ reference }: CssfReferenceProps) {
  const referenceData = getCssfReference(reference)

  // Graceful degradation: if reference not found, show static text
  if (!referenceData) {
    return <span className="text-sm text-muted-foreground ml-1">({reference})</span>
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="text-sm text-muted-foreground ml-1 cursor-pointer hover:underline hover:decoration-dotted hover:decoration-1 hover:underline-offset-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-sm inline-block bg-transparent border-0 p-0"
          aria-label={`View CSSF reference ${reference}`}
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          ({reference})
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[500px] max-h-[400px] overflow-y-auto"
        align="start"
        side="bottom"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold leading-none">
              CSSF 22/806 - Point {referenceData.point}
            </h4>
          </div>
          <div className="border-t border-border pt-3">
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {referenceData.text}
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
