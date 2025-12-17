/**
 * Main Dashboard View
 * CSSF Circular 22/806 Compliance Monitoring Dashboard
 */

import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { ComplianceAlerts } from "./compliance-alerts"
import { MetricsCards } from "./metrics-cards"
import { StatusPieChart } from "./charts/status-pie-chart"
import { CategoryBarChart } from "./charts/category-bar-chart"
import { RiskBarChart } from "./charts/risk-bar-chart"
import { UpcomingReviewsCard } from "./upcoming-reviews-card"
import { ProviderConcentrationTable } from "./tables/provider-concentration-table"
import { GeographicDistributionTable } from "./tables/geographic-distribution-table"
import { CriticalFunctionsCard } from "./critical-functions-card"
import { PendingNotificationsList } from "./tables/pending-notifications-list"
import { DataCompletenessCard } from "./data-completeness-card"
import { PieChart, ShieldAlert, Search } from "lucide-react"

interface DashboardViewProps {
  suppliers: SupplierOutsourcing[]
}

/** Reusable section header with icon */
function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description?: string
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  )
}

export function DashboardView({ suppliers }: DashboardViewProps) {
  return (
    <div className="space-y-8">
      {/* Compliance Alerts Section */}
      <ComplianceAlerts suppliers={suppliers} />

      {/* Key Metrics Cards */}
      <section>
        <MetricsCards suppliers={suppliers} />
      </section>

      {/* Portfolio Overview Section */}
      <section className="space-y-4">
        <SectionHeader
          icon={PieChart}
          title="Portfolio Overview"
          description="Status and category distribution across all suppliers"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <StatusPieChart suppliers={suppliers} />
          <CategoryBarChart suppliers={suppliers} />
        </div>
      </section>

      {/* Risk Management Section */}
      <section className="space-y-4">
        <SectionHeader
          icon={ShieldAlert}
          title="Risk Management"
          description="Risk assessment, concentration analysis, and geographic distribution"
        />

        {/* Risk Chart + Upcoming Reviews */}
        <div className="grid gap-4 md:grid-cols-2">
          <RiskBarChart suppliers={suppliers} />
          <UpcomingReviewsCard suppliers={suppliers} />
        </div>

        {/* Provider Concentration + Geographic Distribution */}
        <div className="grid gap-4 md:grid-cols-2">
          <ProviderConcentrationTable suppliers={suppliers} />
          <GeographicDistributionTable suppliers={suppliers} />
        </div>
      </section>

      {/* Deep Dive Analytics Section */}
      <section className="space-y-4">
        <SectionHeader
          icon={Search}
          title="Deep Dive Analytics"
          description="Critical functions analysis and data completeness tracking"
        />
        <div className="grid gap-4 md:grid-cols-2">
          <CriticalFunctionsCard suppliers={suppliers} />
          <PendingNotificationsList suppliers={suppliers} />
        </div>

        {/* Data Completeness - Full Width */}
        <DataCompletenessCard suppliers={suppliers} />
      </section>
    </div>
  )
}
