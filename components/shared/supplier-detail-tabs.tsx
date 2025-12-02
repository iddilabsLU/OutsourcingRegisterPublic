"use client"

import { useState } from "react"
import { SupplierDetailTabNav, type TabType } from "./supplier-detail-tab-nav"
import { SupplierBasicInfo } from "./supplier-basic-info"
import { SupplierProviderDetails } from "./supplier-provider-details"
import { SupplierCloudServices } from "./supplier-cloud-services"
import { SupplierCriticalFunctions } from "./supplier-critical-functions"
import { SearchProvider } from "@/lib/contexts/search-context"
import type { SupplierOutsourcing } from "@/lib/types/supplier"

interface SupplierDetailTabsProps {
  supplier: SupplierOutsourcing
  searchTerm?: string
}

/**
 * Main tabbed interface for supplier details
 * Replaces the scrollable card view with organized, tab-based navigation
 */
export function SupplierDetailTabs({ supplier, searchTerm = "" }: SupplierDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>("basic-info")

  // Determine if cloud and critical tabs are applicable
  const isCloudApplicable = !!supplier.cloudService
  const isCritical = supplier.criticality.isCritical && !!supplier.criticalFields

  // Render active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "basic-info":
        return <SupplierBasicInfo supplier={supplier} />
      case "provider-details":
        return <SupplierProviderDetails supplier={supplier} />
      case "cloud-services":
        return <SupplierCloudServices supplier={supplier} />
      case "critical-functions":
        return <SupplierCriticalFunctions supplier={supplier} />
      default:
        return null
    }
  }

  return (
    <SearchProvider searchTerm={searchTerm}>
      <div className="space-y-4">
        {/* Tab Navigation */}
        <SupplierDetailTabNav
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isCloudApplicable={isCloudApplicable}
          isCritical={isCritical}
        />

        {/* Tab Content */}
        <div
          role="tabpanel"
          aria-label={`${activeTab} content`}
          className="animate-in fade-in-50 duration-200"
        >
          {renderTabContent()}
        </div>
      </div>
    </SearchProvider>
  )
}
