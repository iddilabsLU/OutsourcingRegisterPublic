/**
 * Pending Notifications List
 * CSSF Point 55.l - Regulatory Notification Tracker
 */

"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, AlertCircle, CheckCircle2 } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getRegulatoryNotificationStatus } from "@/lib/utils/dashboard-analytics"

interface PendingNotificationsListProps {
  suppliers: SupplierOutsourcing[]
}

export function PendingNotificationsList({ suppliers }: PendingNotificationsListProps) {
  const status = getRegulatoryNotificationStatus(suppliers)

  if (status.total === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Regulatory Notifications</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                CSSF notification status for critical suppliers
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
            <Bell className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm">No critical suppliers</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Separate pending notifications by compliance status
  const activeNonCompliant = status.pendingNotifications.filter(
    (n) => n.isNonCompliant
  )
  const draftOrNotYetActive = status.pendingNotifications.filter(
    (n) => !n.isNonCompliant
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Regulatory Notifications</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                CSSF notification status for critical suppliers
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Point 55.l
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Metrics */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Notified to CSSF
              </span>
              <div className="text-right">
                <div className="text-lg font-semibold">{status.notifiedCount}</div>
                <div className="text-xs text-muted-foreground">
                  {status.notifiedPercentage}%
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                Not Yet Notified
              </span>
              <div className="text-right">
                <div className="text-lg font-semibold">{status.notNotifiedCount}</div>
                <div className="text-xs text-muted-foreground">
                  {status.notNotifiedPercentage}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Notifications List */}
        {status.notNotifiedCount > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Pending Notifications</h4>

            {/* Active Non-Compliant - High Priority */}
            {activeNonCompliant.length > 0 && (
              <div className="rounded-lg border border-destructive bg-destructive/10 p-3">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-destructive">
                      Non-Compliant: Active Suppliers Not Notified ({activeNonCompliant.length})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      These active critical suppliers must be notified to CSSF immediately
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-8">
                  {activeNonCompliant.map((s) => (
                    <Badge key={s.referenceNumber} variant="destructive">
                      {s.referenceNumber}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Draft / Not Yet Active - Lower Priority */}
            {draftOrNotYetActive.length > 0 && (
              <div className="rounded-lg border border-muted bg-muted/30 p-3">
                <div className="flex items-start gap-3 mb-3">
                  <Bell className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      Pending: Draft or Not Yet Active ({draftOrNotYetActive.length})
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Notification required before activation
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 pl-8">
                  {draftOrNotYetActive.map((s) => (
                    <Badge key={s.referenceNumber} variant="outline">
                      {s.referenceNumber}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {status.notNotifiedCount === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            All critical suppliers have been notified to CSSF
          </div>
        )}
      </CardContent>
    </Card>
  )
}
