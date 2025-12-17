/**
 * Compliance Alerts Section
 * CSSF Circular 22/806 - Points 54.i, 55.c, 55.f, 55.l
 */

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { AlertCircle, ChevronDown, ChevronRight, Bell, Info, ShieldCheck, CheckCircle2 } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import {
  getOverdueAssessments,
  getRegulatoryNotificationStatus,
} from "@/lib/utils/dashboard-analytics"
import { cn } from "@/lib/utils"

interface ComplianceAlertsProps {
  suppliers: SupplierOutsourcing[]
}

export function ComplianceAlerts({ suppliers }: ComplianceAlertsProps) {
  const overdue = getOverdueAssessments(suppliers)
  const notifications = getRegulatoryNotificationStatus(suppliers)

  const [overdueOpen, setOverdueOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const hasOverdue =
    overdue.criticalityCount > 0 ||
    overdue.riskCount > 0 ||
    overdue.auditCount > 0
  const hasMissingNotifications = notifications.notNotifiedCount > 0
  const hasAnyAlerts = hasOverdue || hasMissingNotifications

  return (
    <div
      className={cn(
        "rounded-xl border p-5 transition-colors",
        hasAnyAlerts
          ? "border-destructive/30 bg-destructive/5"
          : "border-emerald-200 bg-emerald-50/50"
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            hasAnyAlerts ? "bg-destructive/10" : "bg-emerald-100"
          )}
        >
          {hasAnyAlerts ? (
            <ShieldCheck className="h-5 w-5 text-destructive" />
          ) : (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold tracking-tight">Compliance Status</h2>
            {hasAnyAlerts && (
              <Badge variant="destructive" className="text-xs">
                {(hasOverdue ? 1 : 0) + (hasMissingNotifications ? 1 : 0)} alert{hasOverdue && hasMissingNotifications ? "s" : ""}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            CSSF Circular 22/806 compliance monitoring
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Overdue Assessments */}
        <Card className={cn("transition-colors", hasOverdue && "border-destructive/50 bg-destructive/[0.02]")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  hasOverdue ? "bg-destructive/10" : "bg-muted"
                )}>
                  <AlertCircle className={cn("h-4 w-4", hasOverdue ? "text-destructive" : "text-muted-foreground")} />
                </div>
                Overdue Reviews
              </CardTitle>
              {hasOverdue && (
                <Badge variant="destructive" className="font-medium">Action Required</Badge>
              )}
            </div>
            <CardDescription className="mt-1.5">
              Reviews overdue (&gt;365 days since last assessment)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!hasOverdue ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3">
                <CheckCircle2 className="h-4 w-4" />
                All reviews are up to date
              </div>
            ) : (
              <>
                <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                  {overdue.criticalityCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Criticality Assessments</span>
                      <Badge variant="destructive">{overdue.criticalityCount}</Badge>
                    </div>
                  )}
                  {overdue.riskCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Risk Assessments</span>
                      <Badge variant="destructive">{overdue.riskCount}</Badge>
                    </div>
                  )}
                  {overdue.auditCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span>Audits</span>
                      <Badge variant="destructive">{overdue.auditCount}</Badge>
                    </div>
                  )}
                </div>

                <Collapsible open={overdueOpen} onOpenChange={setOverdueOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                      {overdueOpen ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      View {overdue.suppliers.length} affected supplier{overdue.suppliers.length !== 1 ? "s" : ""}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-1 pl-2 border-l-2 border-muted ml-2">
                      {overdue.suppliers.map((supplier) => (
                        <div
                          key={supplier.referenceNumber}
                          className="text-xs py-1.5 px-2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span className="font-medium">{supplier.referenceNumber}</span> — {supplier.serviceProvider.name}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </CardContent>
        </Card>

        {/* Missing Notifications */}
        <Card className={cn("transition-colors", hasMissingNotifications && "border-destructive/50 bg-destructive/[0.02]")}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <div className={cn(
                  "h-8 w-8 rounded-lg flex items-center justify-center",
                  hasMissingNotifications ? "bg-destructive/10" : "bg-muted"
                )}>
                  <Bell className={cn("h-4 w-4", hasMissingNotifications ? "text-destructive" : "text-muted-foreground")} />
                </div>
                CSSF Notifications
              </CardTitle>
              {hasMissingNotifications && (
                <Badge variant="destructive" className="font-medium">Missing</Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-1 mt-1.5">
              Critical suppliers requiring CSSF notification
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help inline-flex" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>CSSF Circular 22/806, Point 55.l</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!hasMissingNotifications ? (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3">
                <CheckCircle2 className="h-4 w-4" />
                All critical suppliers notified
              </div>
            ) : (
              <>
                <div className="space-y-2 bg-muted/50 rounded-lg p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Not yet notified</span>
                    <Badge variant="destructive">
                      {notifications.notNotifiedCount}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Already notified</span>
                    <span className="font-medium">{notifications.notifiedCount}</span>
                  </div>
                </div>

                <Collapsible
                  open={notificationsOpen}
                  onOpenChange={setNotificationsOpen}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground hover:text-foreground">
                      {notificationsOpen ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      View pending notifications
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2">
                    <div className="space-y-1 pl-2 border-l-2 border-muted ml-2">
                      {notifications.pendingNotifications.map((item) => (
                        <div
                          key={item.referenceNumber}
                          className="text-xs py-1.5 px-2 flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span>
                            <span className="font-medium">{item.referenceNumber}</span> — {item.providerName}
                          </span>
                          {item.isNonCompliant && (
                            <Badge variant="destructive" className="text-xs h-5">
                              Active
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
