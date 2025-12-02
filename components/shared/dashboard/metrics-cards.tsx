/**
 * Key Metrics Cards
 * Dashboard overview metrics for supplier register
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Users, Shield, Cloud, Pin, CheckCircle } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getKeyMetrics, getPendingFieldsMetrics } from "@/lib/utils/dashboard-analytics"
import { useCountUp } from "@/hooks/use-count-up"

interface MetricsCardsProps {
  suppliers: SupplierOutsourcing[]
}

export function MetricsCards({ suppliers }: MetricsCardsProps) {
  const metrics = getKeyMetrics(suppliers)
  const pendingMetrics = getPendingFieldsMetrics(suppliers)

  // Count-up animations
  const totalCount = useCountUp(metrics.total, 1200)
  const criticalCount = useCountUp(metrics.critical, 1200)
  const cloudCount = useCountUp(metrics.cloud, 1200)
  const pendingCount = useCountUp(metrics.pending, 1200)
  const completenessCount = useCountUp(pendingMetrics.completenessRate, 1200)

  return (
    <TooltipProvider>
      <div className="grid gap-6 md:grid-cols-5">
        {/* Total Suppliers */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-base font-medium">Total Suppliers</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-bold tracking-tight">{totalCount}</div>
                <p className="text-xs text-muted-foreground">
                  All outsourcing arrangements
                </p>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Total number of registered outsourcing arrangements</p>
          </TooltipContent>
        </Tooltip>

        {/* Critical Functions */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-base font-medium">Critical Functions</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-bold tracking-tight">{criticalCount}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  {metrics.criticalPercentage}% of total suppliers
                </p>
                <Progress value={metrics.criticalPercentage} className="h-1.5" />
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Suppliers performing critical or important functions</p>
          </TooltipContent>
        </Tooltip>

        {/* Cloud Services */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-base font-medium">Cloud Services</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-bold tracking-tight">{cloudCount}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  {metrics.cloudPercentage}% of total suppliers
                </p>
                <Progress value={metrics.cloudPercentage} className="h-1.5" />
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Suppliers providing cloud-based services</p>
          </TooltipContent>
        </Tooltip>

        {/* Not completed */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-base font-medium">Not completed</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Pin className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-bold tracking-tight">{pendingCount}</div>
                <p className="text-xs text-muted-foreground mb-2">
                  {metrics.pendingPercentage}% with incomplete data
                </p>
                <Progress value={metrics.pendingPercentage} className="h-1.5" />
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Suppliers with incomplete or pending field data</p>
          </TooltipContent>
        </Tooltip>

        {/* Completeness Rate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-base font-medium">Completeness</CardTitle>
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-4xl font-bold tracking-tight">{completenessCount}%</div>
                <p className="text-xs text-muted-foreground mb-2">
                  Overall data quality
                </p>
                {/* Circular progress indicator */}
                <div className="relative pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="w-full bg-secondary rounded-full h-1.5">
                      <div
                        className="bg-primary h-1.5 rounded-full transition-all duration-1000"
                        style={{ width: `${pendingMetrics.completenessRate}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent>
            <p>Percentage of all fields completed across all suppliers</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
