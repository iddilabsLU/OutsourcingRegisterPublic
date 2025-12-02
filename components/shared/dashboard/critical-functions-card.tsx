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
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Critical Functions Analysis
          </CardTitle>
          <CardDescription>
            Analysis of critical outsourcing arrangements (Point 55)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-8">
            No critical suppliers
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Critical Functions Analysis
        </CardTitle>
        <CardDescription>
          {analysis.total} critical supplier{analysis.total !== 1 ? "s" : ""} (Point 55)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
              <span>Owned by Group</span>
              <div className="flex items-center gap-2">
                <span className="font-medium w-8 text-right">{analysis.groupRelationship.ownedByGroup}</span>
                <Badge variant="outline" className="min-w-[3.5rem] justify-center">
                  {analysis.groupRelationship.ownedByGroupPercentage}%
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
