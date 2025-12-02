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

interface DashboardViewProps {
  suppliers: SupplierOutsourcing[]
}

export function DashboardView({ suppliers }: DashboardViewProps) {
  return (
    <div className="space-y-4">
      {/* Compliance Alerts Section */}
      <ComplianceAlerts suppliers={suppliers} />

      {/* Key Metrics Cards */}
      <MetricsCards suppliers={suppliers} />

      {/* Charts Section - 2 column grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <StatusPieChart suppliers={suppliers} />
        <CategoryBarChart suppliers={suppliers} />
      </div>

      {/* Risk Management Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-3">Risk Management</h2>

        {/* Risk Chart + Upcoming Reviews - equal width */}
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <RiskBarChart suppliers={suppliers} />
          <UpcomingReviewsCard suppliers={suppliers} />
        </div>

        {/* Provider Concentration + Geographic Distribution - side by side */}
        <div className="grid gap-4 md:grid-cols-2">
          <ProviderConcentrationTable suppliers={suppliers} />
          <GeographicDistributionTable suppliers={suppliers} />
        </div>
      </div>

      {/* Deep Dive Analytics Section */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight mb-3">Deep Dive Analytics</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <CriticalFunctionsCard suppliers={suppliers} />
          <PendingNotificationsList suppliers={suppliers} />
        </div>

        {/* Data Completeness - Full Width */}
        <div className="mt-4">
          <DataCompletenessCard suppliers={suppliers} />
        </div>
      </div>
    </div>
  )
}
