"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

export type FormTabType = "basic-info" | "provider" | "cloud" | "critical"

interface SupplierFormTabNavProps {
  activeTab: FormTabType
  onTabChange: (tab: FormTabType) => void
  showCloudTab: boolean
  showCriticalTab: boolean
}

/**
 * Tab navigation for supplier form
 * All tabs always visible - Cloud and Critical tabs are greyed out when disabled
 */
export function SupplierFormTabNav({
  activeTab,
  onTabChange,
  showCloudTab,
  showCriticalTab,
}: SupplierFormTabNavProps) {
  const tabs = [
    { id: "basic-info" as const, label: "Basic Information", enabled: true },
    { id: "provider" as const, label: "Service Provider", enabled: true },
    { id: "cloud" as const, label: "Cloud Services", enabled: showCloudTab },
    { id: "critical" as const, label: "Critical Functions", enabled: showCriticalTab },
  ]

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="flex justify-center gap-2 px-1">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            type="button"
            variant="ghost"
            disabled={!tab.enabled}
            onClick={() => tab.enabled && onTabChange(tab.id)}
            className={cn(
              "relative rounded-b-none border-b-2 border-transparent px-4 py-2 text-base font-medium transition-colors",
              "hover:border-muted-foreground/50 hover:bg-transparent",
              activeTab === tab.id && "border-primary text-primary bg-muted/50",
              !tab.enabled && "text-muted-foreground/40 cursor-not-allowed opacity-50"
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
