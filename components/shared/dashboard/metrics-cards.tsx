/**
 * Key Metrics Cards
 * Dashboard overview metrics for supplier register
 */

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Users, Shield, Cloud, AlertCircle, CheckCircle2 } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getKeyMetrics, getPendingFieldsMetrics } from "@/lib/utils/dashboard-analytics"
import { useCountUp } from "@/hooks/use-count-up"
import { cn } from "@/lib/utils"

interface MetricsCardsProps {
  suppliers: SupplierOutsourcing[]
}

interface MetricCardProps {
  title: string
  value: number | string
  subtitle: string
  tooltip: string
  icon: React.ComponentType<{ className?: string }>
  progress?: number
  variant?: "default" | "warning" | "success"
}

function MetricCard({
  title,
  value,
  subtitle,
  tooltip,
  icon: Icon,
  progress,
  variant = "default",
}: MetricCardProps) {
  const variantStyles = {
    default: {
      icon: "bg-primary/10 text-primary",
      progress: "bg-primary",
    },
    warning: {
      icon: "bg-amber-100 text-amber-600",
      progress: "bg-amber-500",
    },
    success: {
      icon: "bg-emerald-100 text-emerald-600",
      progress: "bg-emerald-500",
    },
  }

  const styles = variantStyles[variant]

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="relative overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/20 group">
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          <CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2 flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className="text-3xl font-bold tracking-tight tabular-nums">{value}</p>
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              </div>
              <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", styles.icon)}>
                <Icon className="h-5 w-5" />
              </div>
            </div>

            {progress !== undefined && (
              <div className="mt-3">
                <Progress
                  value={progress}
                  className="h-1.5"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p className="text-sm">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
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
    <TooltipProvider delayDuration={300}>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="Total Suppliers"
          value={totalCount}
          subtitle="All outsourcing arrangements"
          tooltip="Total number of registered outsourcing arrangements"
          icon={Users}
        />

        <MetricCard
          title="Critical Functions"
          value={criticalCount}
          subtitle={`${metrics.criticalPercentage}% of total suppliers`}
          tooltip="Suppliers performing critical or important functions (CSSF Point 55)"
          icon={Shield}
          progress={metrics.criticalPercentage}
        />

        <MetricCard
          title="Cloud Services"
          value={cloudCount}
          subtitle={`${metrics.cloudPercentage}% of total suppliers`}
          tooltip="Suppliers providing cloud-based services (CSSF Point 54.h)"
          icon={Cloud}
          progress={metrics.cloudPercentage}
        />

        <MetricCard
          title="Incomplete"
          value={pendingCount}
          subtitle={`${metrics.pendingPercentage}% with pending fields`}
          tooltip="Suppliers with incomplete or pending field data requiring attention"
          icon={AlertCircle}
          progress={metrics.pendingPercentage}
          variant={metrics.pending > 0 ? "warning" : "default"}
        />

        <MetricCard
          title="Completeness"
          value={`${completenessCount}%`}
          subtitle="Overall data quality"
          tooltip="Percentage of all required fields completed across all suppliers"
          icon={CheckCircle2}
          progress={pendingMetrics.completenessRate}
          variant={pendingMetrics.completenessRate >= 80 ? "success" : "default"}
        />
      </div>
    </TooltipProvider>
  )
}
