/**
 * Reusable Chart Container Component
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { Info } from "lucide-react"

interface ChartContainerProps {
  title: string
  description?: string
  regulatoryPoint?: string
  children: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
}

export function ChartContainer({
  title,
  description,
  regulatoryPoint,
  children,
  icon: Icon,
}: ChartContainerProps) {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-primary" />
              </div>
            )}
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <CardDescription className="flex items-center gap-1.5 mt-0.5">
                  {description}
                  {regulatoryPoint && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-muted-foreground cursor-help inline-flex shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>CSSF Circular 22/806, {regulatoryPoint}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </CardDescription>
              )}
            </div>
          </div>
          {regulatoryPoint && (
            <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">
              {regulatoryPoint}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 pt-2">{children}</CardContent>
    </Card>
  )
}
