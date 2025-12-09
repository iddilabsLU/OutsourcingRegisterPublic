"use client"

import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type {
  QuickFilters,
  CustomFilter} from "@/lib/types/filters";
import {
  FILTER_FIELD_OPTIONS,
} from "@/lib/types/filters"

interface ActiveFilterBadgesProps {
  quickFilters: QuickFilters
  customFilters: CustomFilter[]
  onRemoveQuickFilter: (
    filterType: "critical" | "nonCritical" | "cloud" | "serviceOutsourcings" | "active" | "draft" | "notYetActive" | "terminated"
  ) => void
  onRemoveCustomFilter: (filterId: string) => void
}

export function ActiveFilterBadges({
  quickFilters,
  customFilters,
  onRemoveQuickFilter,
  onRemoveCustomFilter,
}: ActiveFilterBadgesProps) {
  const hasActiveFilters =
    quickFilters.critical ||
    quickFilters.nonCritical ||
    quickFilters.cloud ||
    quickFilters.serviceOutsourcings ||
    quickFilters.status.active ||
    quickFilters.status.draft ||
    quickFilters.status.notYetActive ||
    quickFilters.status.terminated ||
    customFilters.some((f) => f.field && f.value)

  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Active filters:</span>

      {/* Quick Filter: Critical */}
      {quickFilters.critical && (
        <Badge variant="destructive" className="gap-1 pr-1">
          Critical
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveQuickFilter("critical")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Quick Filter: Non Critical */}
      {quickFilters.nonCritical && (
        <Badge variant="secondary" className="gap-1 pr-1">
          Non Critical
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveQuickFilter("nonCritical")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Quick Filter: Cloud */}
      {quickFilters.cloud && (
        <Badge variant="default" className="gap-1 pr-1">
          Cloud
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveQuickFilter("cloud")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Quick Filter: Service Outsourcings */}
      {quickFilters.serviceOutsourcings && (
        <Badge variant="default" className="gap-1 pr-1">
          Service Outsourcings
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveQuickFilter("serviceOutsourcings")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Quick Filter: Active Status */}
      {quickFilters.status.active && (
        <Badge variant="default" className="gap-1 pr-1">
          Status: Active
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveQuickFilter("active")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Quick Filter: Draft Status */}
      {quickFilters.status.draft && (
        <Badge variant="default" className="gap-1 pr-1">
          Status: Draft
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveQuickFilter("draft")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Quick Filter: Not Yet Active Status */}
      {quickFilters.status.notYetActive && (
        <Badge variant="default" className="gap-1 pr-1">
          Status: Not Yet Active
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveQuickFilter("notYetActive")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Quick Filter: Terminated Status */}
      {quickFilters.status.terminated && (
        <Badge variant="default" className="gap-1 pr-1">
          Status: Terminated
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0 hover:bg-transparent"
            onClick={() => onRemoveQuickFilter("terminated")}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {/* Custom Filters */}
      {customFilters
        .filter((f) => f.field && f.value)
        .map((filter) => {
          const fieldOption = FILTER_FIELD_OPTIONS.find((opt) => opt.value === filter.field)
          const fieldLabel = fieldOption?.label || filter.field

          return (
            <Badge key={filter.id} variant="secondary" className="gap-1 pr-1">
              {fieldLabel}: {filter.value}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => onRemoveCustomFilter(filter.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )
        })}
    </div>
  )
}
