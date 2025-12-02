"use client"

import { cn } from "@/lib/utils/cn"

export type TabType = "basic-info" | "provider-details" | "cloud-services" | "critical-functions"

interface SupplierDetailTabNavProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  isCloudApplicable: boolean
  isCritical: boolean
}

interface TabConfig {
  value: TabType
  label: string
  shortLabel: string
  isDisabled: (isCloudApplicable: boolean, isCritical: boolean) => boolean
  ariaLabel: (isCloudApplicable: boolean, isCritical: boolean) => string
}

const tabs: TabConfig[] = [
  {
    value: "basic-info",
    label: "Basic Info",
    shortLabel: "Basic Info",
    isDisabled: () => false,
    ariaLabel: () => "Basic Information",
  },
  {
    value: "provider-details",
    label: "Provider Details",
    shortLabel: "Provider",
    isDisabled: () => false,
    ariaLabel: () => "Provider Details",
  },
  {
    value: "cloud-services",
    label: "Cloud Services",
    shortLabel: "Cloud",
    isDisabled: (isCloudApplicable) => !isCloudApplicable,
    ariaLabel: (isCloudApplicable) =>
      isCloudApplicable
        ? "Cloud Services"
        : "Cloud Services - Not applicable for this supplier",
  },
  {
    value: "critical-functions",
    label: "Critical Functions",
    shortLabel: "Critical",
    isDisabled: (_isCloudApplicable, isCritical) => !isCritical,
    ariaLabel: (_isCloudApplicable, isCritical) =>
      isCritical
        ? "Critical Functions"
        : "Critical Functions - Not applicable for non-critical suppliers",
  },
]

/**
 * Tab navigation bar for supplier detail tabs
 * Visually distinct from page-level tabs with secondary colors and compact styling
 */
export function SupplierDetailTabNav({
  activeTab,
  onTabChange,
  isCloudApplicable,
  isCritical,
}: SupplierDetailTabNavProps) {
  return (
    <div className="flex justify-center w-full">
      <nav
        className="inline-flex items-center rounded-md bg-secondary/20 border border-border p-0.5 gap-1.5 w-full max-w-7xl"
        role="tablist"
        aria-label="Supplier detail sections"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.value
          const isDisabled = tab.isDisabled(isCloudApplicable, isCritical)
          const ariaLabel = tab.ariaLabel(isCloudApplicable, isCritical)

          return (
            <button
              key={tab.value}
              role="tab"
              aria-selected={isActive}
              aria-label={ariaLabel}
              onClick={() => onTabChange(tab.value)}
              className={cn(
                "px-6 py-1.5 text-sm font-medium rounded-sm transition-all duration-200 flex-1",
                isActive &&
                  !isDisabled &&
                  "bg-white text-foreground border border-primary/30 shadow-sm font-semibold",
                isActive &&
                  isDisabled &&
                  "bg-white text-muted-foreground border border-border shadow-sm font-semibold",
                !isActive &&
                  !isDisabled &&
                  "bg-transparent text-muted-foreground hover:bg-white/50 hover:text-foreground",
                !isActive &&
                  isDisabled &&
                  "bg-muted/30 text-muted-foreground/40 opacity-50 hover:opacity-70"
              )}
            >
              {/* Use full label on larger screens, short label on smaller */}
              <span className="hidden xl:inline">{tab.label}</span>
              <span className="xl:hidden">{tab.shortLabel}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
