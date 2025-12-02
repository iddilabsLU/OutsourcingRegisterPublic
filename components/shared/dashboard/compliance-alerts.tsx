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
import { AlertCircle, ChevronDown, ChevronRight, Bell, Info } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import {
  getOverdueAssessments,
  getRegulatoryNotificationStatus,
} from "@/lib/utils/dashboard-analytics"

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

  return (
    <div className="space-y-3 rounded-lg border-l-4 border-red-500 bg-red-50/50 p-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Compliance Alerts</h2>
        <p className="text-muted-foreground">
          CSSF Circular 22/806 compliance monitoring
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Overdue Assessments */}
        <Card className={hasOverdue ? "border-destructive" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                Overdue Reviews
              </CardTitle>
              {hasOverdue && (
                <Badge variant="destructive">Action Required</Badge>
              )}
            </div>
            <CardDescription>
              Reviews overdue (&gt;365 days since last assessment)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!hasOverdue ? (
              <div className="text-sm text-muted-foreground">
                ✅ All reviews are up to date
              </div>
            ) : (
              <>
                <div className="space-y-2">
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
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      {overdueOpen ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      View {overdue.suppliers.length} supplier
                      {overdue.suppliers.length !== 1 ? "s" : ""}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-2">
                    {overdue.suppliers.map((supplier) => (
                      <div
                        key={supplier.referenceNumber}
                        className="text-xs pl-6 py-1 text-muted-foreground"
                      >
                        {supplier.referenceNumber} - {supplier.serviceProvider.name}
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </>
            )}
          </CardContent>
        </Card>

        {/* Missing Notifications */}
        <Card className={hasMissingNotifications ? "border-destructive" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Bell className="h-4 w-4 text-destructive" />
                CSSF Notifications
              </CardTitle>
              {hasMissingNotifications && (
                <Badge variant="destructive">Missing</Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-1">
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
              <div className="text-sm text-muted-foreground">
                ✅ All critical suppliers notified
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-sm">
                  <span>Not yet notified</span>
                  <Badge variant="destructive">
                    {notifications.notNotifiedCount}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Already notified</span>
                  <span>{notifications.notifiedCount}</span>
                </div>

                <Collapsible
                  open={notificationsOpen}
                  onOpenChange={setNotificationsOpen}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      {notificationsOpen ? (
                        <ChevronDown className="h-4 w-4 mr-2" />
                      ) : (
                        <ChevronRight className="h-4 w-4 mr-2" />
                      )}
                      View pending notifications
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 mt-2">
                    {notifications.pendingNotifications.map((item) => (
                      <div
                        key={item.referenceNumber}
                        className="text-xs pl-6 py-1 flex items-center justify-between"
                      >
                        <span className="text-muted-foreground">
                          {item.referenceNumber} - {item.providerName}
                        </span>
                        {item.isNonCompliant && (
                          <Badge variant="destructive" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                    ))}
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
