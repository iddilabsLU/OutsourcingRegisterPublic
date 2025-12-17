/**
 * Critical Functions Analysis Card
 * CSSF Point 55 - Analysis of critical outsourcing arrangements
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
import {
  ShieldCheck,
  Users,
  RefreshCw,
  GitBranch,
  AlertTriangle,
  XCircle,
  CheckCircle,
} from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getCriticalFunctionsAnalysis } from "@/lib/utils/dashboard-analytics"

interface CriticalFunctionsCardProps {
  suppliers: SupplierOutsourcing[]
}

export function CriticalFunctionsCard({ suppliers }: CriticalFunctionsCardProps) {
  const analysis = getCriticalFunctionsAnalysis(suppliers)

  if (analysis.total === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Critical Functions Analysis</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Analysis of critical outsourcing arrangements
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
            <ShieldCheck className="h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm">No critical suppliers</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Critical Functions Analysis</CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Analysis of critical outsourcing arrangements
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Point 55
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Group Relationships */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Group Relationships
          </h4>
          <div className="space-y-2 pl-6">
            <div className="flex items-center justify-between text-sm">
              <span>Part of Group</span>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8 text-right">{analysis.groupRelationship.partOfGroup}</span>
                <Badge variant="outline" className="min-w-[3.5rem] justify-center">
                  {analysis.groupRelationship.partOfGroupPercentage}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Independent</span>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8 text-right">{analysis.groupRelationship.independent}</span>
                <Badge variant="outline" className="min-w-[3.5rem] justify-center">
                  {analysis.groupRelationship.independentPercentage}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Substitutability */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-primary" />
            Substitutability
          </h4>
          <div className="space-y-2 pl-6">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-600" />
                Easy
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8 text-right">{analysis.substitutability.easy}</span>
                <Badge variant="outline" className="bg-green-100 text-green-800 min-w-[3.5rem] justify-center">
                  {analysis.substitutability.easyPercentage}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <AlertTriangle className="h-3 w-3 text-amber-600" />
                Difficult
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8 text-right">{analysis.substitutability.difficult}</span>
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 min-w-[3.5rem] justify-center">
                  {analysis.substitutability.difficultPercentage}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <XCircle className="h-3 w-3 text-destructive" />
                Impossible
              </span>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8 text-right">{analysis.substitutability.impossible}</span>
                <Badge variant="destructive" className="min-w-[3.5rem] justify-center">
                  {analysis.substitutability.impossiblePercentage}%
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Outsourcing */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <GitBranch className="h-4 w-4 text-primary" />
            Sub-Outsourcing
          </h4>
          <div className="space-y-2 pl-6">
            <div className="flex items-center justify-between text-sm">
              <span>With Sub-Contractors</span>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8 text-right">{analysis.subOutsourcing.withSubContractors}</span>
                <Badge variant="outline" className="min-w-[3.5rem] justify-center">
                  {analysis.subOutsourcing.withPercentage}%
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Without Sub-Contractors</span>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8 text-right">{analysis.subOutsourcing.withoutSubContractors}</span>
                <Badge variant="outline" className="min-w-[3.5rem] justify-center">
                  {analysis.subOutsourcing.withoutPercentage}%
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
