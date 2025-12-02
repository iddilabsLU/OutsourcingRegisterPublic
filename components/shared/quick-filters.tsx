"use client"

import { AlertCircle, Cloud, Briefcase, CheckCircle, FileText, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { QuickFilters as QuickFiltersType } from "@/lib/types/filters"
import { cn } from "@/lib/utils/cn"

interface QuickFiltersProps {
  filters: QuickFiltersType
  onToggleCritical: () => void
  onToggleCloud: () => void
  onToggleServiceOutsourcings: () => void
  onToggleActive: () => void
  onToggleDraft: () => void
  onToggleNotYetActive: () => void
  onToggleTerminated: () => void
}

export function QuickFilters({
  filters,
  onToggleCritical,
  onToggleCloud,
  onToggleServiceOutsourcings,
  onToggleActive,
  onToggleDraft,
  onToggleNotYetActive,
  onToggleTerminated,
}: QuickFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={filters.critical ? "default" : "outline"}
        size="sm"
        onClick={onToggleCritical}
        className={cn(
          "gap-2 transition-all",
          filters.critical && "bg-destructive hover:bg-destructive/90"
        )}
      >
        <AlertCircle className="h-4 w-4" />
        Critical Outsourcings
      </Button>

      <Button
        variant={filters.serviceOutsourcings ? "default" : "outline"}
        size="sm"
        onClick={onToggleServiceOutsourcings}
        className="gap-2 transition-all"
      >
        <Briefcase className="h-4 w-4" />
        Service Outsourcings
      </Button>

      <Button
        variant={filters.cloud ? "default" : "outline"}
        size="sm"
        onClick={onToggleCloud}
        className="gap-2 transition-all"
      >
        <Cloud className="h-4 w-4" />
        Cloud Outsourcings
      </Button>

      <Button
        variant={filters.status.active ? "default" : "outline"}
        size="sm"
        onClick={onToggleActive}
        className="gap-2 transition-all"
      >
        <CheckCircle className="h-4 w-4" />
        Active
      </Button>

      <Button
        variant={filters.status.draft ? "default" : "outline"}
        size="sm"
        onClick={onToggleDraft}
        className="gap-2 transition-all"
      >
        <FileText className="h-4 w-4" />
        Draft
      </Button>

      <Button
        variant={filters.status.notYetActive ? "default" : "outline"}
        size="sm"
        onClick={onToggleNotYetActive}
        className="gap-2 transition-all"
      >
        <Clock className="h-4 w-4" />
        Not Yet Active
      </Button>

      <Button
        variant={filters.status.terminated ? "default" : "outline"}
        size="sm"
        onClick={onToggleTerminated}
        className="gap-2 transition-all"
      >
        <XCircle className="h-4 w-4" />
        Terminated
      </Button>
    </div>
  )
}
