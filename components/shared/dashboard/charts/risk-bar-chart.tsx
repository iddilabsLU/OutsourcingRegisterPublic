/**
 * Risk Distribution Bar Chart
 * CSSF Point 55.c - Risk Assessment (Critical Suppliers Only)
 */

"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getRiskDistribution } from "@/lib/utils/dashboard-analytics"
import { ChartContainer } from "./chart-container"

interface RiskBarChartProps {
  suppliers: SupplierOutsourcing[]
}

// Color mapping for risk levels - using CSS chart colors
const RISK_COLORS = {
  High: "#C4604C", // Terracotta (chart-3) - for high risk
  Medium: "#E8C57A", // Amber (chart-4) - for medium risk
  Low: "#7FA896", // Sage (chart-2) - for low risk
}

export function RiskBarChart({ suppliers }: RiskBarChartProps) {
  const data = getRiskDistribution(suppliers)

  // Calculate total critical suppliers for subtitle
  const totalCritical = data.reduce((sum, item) => sum + item.count, 0)

  if (totalCritical === 0) {
    return (
      <ChartContainer
        title="Risk Distribution"
        description="Critical suppliers by risk level"
        regulatoryPoint="Point 55.c"
      >
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          No critical suppliers
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title="Risk Distribution"
      description={`Critical suppliers by risk level (${totalCritical} total)`}
      regulatoryPoint="Point 55.c"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
          <YAxis dataKey="name" type="category" width={50} stroke="hsl(var(--muted-foreground))" />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry) => (
              <Cell
                key={`cell-${entry.name}`}
                fill={RISK_COLORS[entry.name as keyof typeof RISK_COLORS]}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
