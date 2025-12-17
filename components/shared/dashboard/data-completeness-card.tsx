/**
 * Data Completeness Card
 * Tracks pending fields and overall data quality
 */

"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { FileCheck, TrendingUp } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getPendingFieldsMetrics } from "@/lib/utils/dashboard-analytics"

interface DataCompletenessCardProps {
  suppliers: SupplierOutsourcing[]
}

export function DataCompletenessCard({ suppliers }: DataCompletenessCardProps) {
  const metrics = getPendingFieldsMetrics(suppliers)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileCheck className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Data Completeness</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Pending fields and overall data quality metrics
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Summary Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-1 text-center">
            <p className="text-xs text-muted-foreground">Suppliers with Pending Fields</p>
            <p className="text-3xl font-bold tracking-tight">{metrics.suppliersWithPending}</p>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-xs text-muted-foreground">Total Pending Fields</p>
            <p className="text-3xl font-bold tracking-tight">{metrics.totalPendingFields}</p>
          </div>
          <div className="space-y-1 text-center">
            <p className="text-xs text-muted-foreground">Completeness Rate</p>
            <div className="flex items-baseline gap-2 justify-center">
              <p className="text-3xl font-bold tracking-tight">{metrics.completenessRate}%</p>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>

        {/* Incomplete Suppliers */}
        {metrics.topIncomplete.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Incomplete Suppliers</h4>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Function Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Critical</TableHead>
                    <TableHead className="text-right">Pending Fields</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {metrics.topIncomplete.map((supplier) => (
                    <TableRow key={supplier.referenceNumber}>
                      <TableCell className="font-medium align-top">
                        {supplier.referenceNumber}
                      </TableCell>
                      <TableCell className="align-top">{supplier.serviceProvider.name}</TableCell>
                      <TableCell className="align-top">{supplier.functionDescription.name || "N/A"}</TableCell>
                      <TableCell className="align-top">{supplier.category}</TableCell>
                      <TableCell className="align-top text-center">
                        <Badge
                          variant={
                            supplier.status === "Active" ? "default" :
                            supplier.status === "Not Yet Active" ? "secondary" :
                            "outline"
                          }
                        >
                          {supplier.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top text-center">
                        <Badge variant={supplier.criticality.isCritical ? "destructive" : "secondary"}>
                          {supplier.criticality.isCritical ? "Critical" : "Non-Critical"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right align-top">
                        <Badge variant="secondary">
                          {supplier.pendingFields?.length || 0}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {metrics.topIncomplete.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            <FileCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
            All suppliers have complete data
          </div>
        )}
      </CardContent>
    </Card>
  )
}
