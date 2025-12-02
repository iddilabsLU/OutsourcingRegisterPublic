"use client"

import { useIsMobile } from "@/hooks/use-media-query"
import { Monitor } from "lucide-react"

/**
 * MobileBlock Component
 *
 * Blocks mobile device access (screens < 768px) and displays a friendly message.
 * Allows normal content on desktop and tablet devices.
 *
 * @example
 * ```tsx
 * <MobileBlock>
 *   <YourDesktopOnlyContent />
 * </MobileBlock>
 * ```
 */
export function MobileBlock({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile()

  if (isMobile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-8">
        <div className="max-w-md space-y-6 text-center">
          <Monitor className="mx-auto h-16 w-16 text-primary" />
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Desktop Only
            </h1>
            <p className="text-muted-foreground">
              This CSSF compliance register requires a larger screen. Please
              access from a laptop, desktop, or tablet for the best experience.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
