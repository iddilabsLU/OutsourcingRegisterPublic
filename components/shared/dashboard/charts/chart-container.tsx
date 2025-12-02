/**
 * Reusable Chart Container Component
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

interface ChartContainerProps {
  title: string
  description?: string
  regulatoryPoint?: string
  children: React.ReactNode
}

export function ChartContainer({ title, description, regulatoryPoint, children }: ChartContainerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && (
          <CardDescription className="flex items-center gap-1">
            {description}
            {regulatoryPoint && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help inline-flex" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>CSSF Circular 22/806, {regulatoryPoint}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}
