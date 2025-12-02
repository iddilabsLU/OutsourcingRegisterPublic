"use client"

import { List, FileText, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils/cn"

export type ViewType = "list" | "new" | "dashboard"

interface ViewSegmentedControlProps {
  activeView: ViewType
  onViewChange: (view: ViewType) => void
}

export function ViewSegmentedControl({
  activeView,
  onViewChange,
}: ViewSegmentedControlProps) {
  const views: { value: ViewType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "list", label: "Register List", icon: List },
    { value: "new", label: "New Entry", icon: FileText },
    { value: "dashboard", label: "Dashboard", icon: BarChart3 },
  ]

  return (
    <div className="flex justify-center">
      <div className="inline-flex items-center rounded-lg bg-muted p-1 gap-1">
        {views.map((view) => {
          const Icon = view.icon
          const isActive = activeView === view.value

          return (
            <Button
              key={view.value}
              variant="ghost"
              size="sm"
              onClick={() => onViewChange(view.value)}
              className={cn(
                "gap-2 transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary hover:text-primary-foreground"
                  : "hover:bg-background/50 text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {view.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
