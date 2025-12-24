/**
 * Provider Concentration Table
 * Identifies concentration risk from multiple arrangements with same provider
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
import { AlertTriangle, Building2, CheckCircle2 } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getProviderConcentration } from "@/lib/utils/dashboard-analytics"

interface ProviderConcentrationTableProps {
  suppliers: SupplierOutsourcing[]
}

export function ProviderConcentrationTable({ suppliers }: ProviderConcentrationTableProps) {
  const data = getProviderConcentration(suppliers)

  const hasHighRisk = data.some((item) => item.risk === "High")

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Provider Concentration</CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Providers with multiple outsourcing arrangements
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Warning Banner */}
        {hasHighRisk && (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-3 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-destructive">
                High Concentration Risk Detected
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                One or more providers account for &gt;35% of total outsourcing arrangements
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-3">
            <CheckCircle2 className="h-10 w-10 text-emerald-500/50" />
            <p className="text-sm">No concentration risk detected</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Arrangements</TableHead>
                  <TableHead className="text-right">% of Total</TableHead>
                  <TableHead className="text-right">Risk</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.provider}>
                    <TableCell className="font-medium">{item.provider}</TableCell>
                    <TableCell className="text-right">{item.count}</TableCell>
                    <TableCell className="text-right">{item.percentage}%</TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          item.risk === "High"
                            ? "destructive"
                            : item.risk === "Medium"
                            ? "secondary"
                            : "outline"
                        }
                        className={
                          item.risk === "Medium"
                            ? "bg-amber-100 text-amber-800"
                            : ""
                        }
                      >
                        {item.risk}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
