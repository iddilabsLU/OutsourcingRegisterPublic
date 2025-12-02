/**
 * Status Breakdown Pie Chart
 * CSSF Point 53 - Status of outsourcing arrangement
 */

"use client"

import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from "recharts"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getStatusBreakdown } from "@/lib/utils/dashboard-analytics"
import { ChartContainer } from "./chart-container"

interface StatusPieChartProps {
  suppliers: SupplierOutsourcing[]
}

// Chart colors mapped to status - using theme colors
const STATUS_COLORS: Record<string, string> = {
  Active: "#2D3E50", // primary ink blue
  Draft: "#899DAE", // lighter blue
  "Not Yet Active": "#B8C5D0", // even lighter blue
  Terminated: "#E5E7EB", // muted gray
}

export function StatusPieChart({ suppliers }: StatusPieChartProps) {
  const data = getStatusBreakdown(suppliers)

  if (data.length === 0) {
    return (
      <ChartContainer
        title="Status Breakdown"
        description="Distribution by outsourcing status"
        regulatoryPoint="Point 53"
      >
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          No data available
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title="Status Breakdown"
      description="Distribution by outsourcing status"
      regulatoryPoint="Point 53"
    >
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={80}
            fill="#2D3E50"
            dataKey="value"
            stroke="hsl(var(--background))"
            strokeWidth={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"}
              />
            ))}
          </Pie>
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ color: "hsl(var(--foreground))" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
