/**
 * Upcoming Reviews Timeline Card
 * CSSF Points 54.i, 55.c, 55.f - Annual review requirements
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, FileCheck, ShieldCheck, FileText, CalendarCheck } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getUpcomingReviews } from "@/lib/utils/dashboard-analytics"

interface UpcomingReviewsCardProps {
  suppliers: SupplierOutsourcing[]
}

export function UpcomingReviewsCard({ suppliers }: UpcomingReviewsCardProps) {
  // Next 30 days (335-365 days since last assessment)
  const next30Days = getUpcomingReviews(suppliers, 30)

  // 30-90 days (275-335 days since last assessment)
  const days30to90 = getUpcomingReviews(suppliers, 90)

  // Calculate 30-90 by subtracting next30 from next90
  const next30to90 = {
    criticalityCount: days30to90.criticalityCount - next30Days.criticalityCount,
    riskCount: days30to90.riskCount - next30Days.riskCount,
    auditCount: days30to90.auditCount - next30Days.auditCount,
  }

  const hasNext30 =
    next30Days.criticalityCount > 0 ||
    next30Days.riskCount > 0 ||
    next30Days.auditCount > 0

  const has30to90 =
    next30to90.criticalityCount > 0 ||
    next30to90.riskCount > 0 ||
    next30to90.auditCount > 0

  const hasAnyUpcoming = hasNext30 || has30to90

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Upcoming Reviews</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Annual review schedule (365-day cycle)
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 flex-1">
        {/* Empty state when no upcoming reviews */}
        {!hasAnyUpcoming ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-8">
            <CalendarCheck className="h-10 w-10 text-emerald-500/50" />
            <p className="text-sm text-center">No reviews due in next 90 days</p>
          </div>
        ) : (
          <>
            {/* Next 30 Days */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-amber-100 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  Next 30 Days
                </h4>
                {hasNext30 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 font-medium">
                    {next30Days.criticalityCount + next30Days.riskCount + next30Days.auditCount} due
                  </Badge>
                )}
              </div>

              {!hasNext30 ? (
                <p className="text-sm text-muted-foreground pl-8">
                  No reviews due in next 30 days
                </p>
              ) : (
                <div className="space-y-2 pl-8">
                  {next30Days.criticalityCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                        Criticality Assessments
                      </span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {next30Days.criticalityCount}
                      </Badge>
                    </div>
                  )}
                  {next30Days.riskCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        Risk Assessments
                      </span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {next30Days.riskCount}
                      </Badge>
                    </div>
                  )}
                  {next30Days.auditCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Audits
                      </span>
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                        {next30Days.auditCount}
                      </Badge>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 30-90 Days */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <div className="h-6 w-6 rounded-md bg-blue-100 flex items-center justify-center">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                  </div>
                  30-90 Days
                </h4>
                {has30to90 && (
                  <Badge variant="outline" className="font-medium">
                    {next30to90.criticalityCount + next30to90.riskCount + next30to90.auditCount} due
                  </Badge>
                )}
              </div>

              {!has30to90 ? (
                <p className="text-sm text-muted-foreground pl-8">
                  No reviews due in 30-90 days
                </p>
              ) : (
                <div className="space-y-2 pl-8">
                  {next30to90.criticalityCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <FileCheck className="h-4 w-4 text-muted-foreground" />
                        Criticality Assessments
                      </span>
                      <Badge variant="outline">{next30to90.criticalityCount}</Badge>
                    </div>
                  )}
                  {next30to90.riskCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                        Risk Assessments
                      </span>
                      <Badge variant="outline">{next30to90.riskCount}</Badge>
                    </div>
                  )}
                  {next30to90.auditCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        Audits
                      </span>
                      <Badge variant="outline">{next30to90.auditCount}</Badge>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
