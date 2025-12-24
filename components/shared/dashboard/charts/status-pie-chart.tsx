/**
 * Status Breakdown Pie Chart
 * CSSF Point 53 - Status of outsourcing arrangement
 */

"use client"

import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getStatusBreakdown } from "@/lib/utils/dashboard-analytics"
import { ChartContainer } from "./chart-container"
import { Activity, FileBox } from "lucide-react"

interface StatusPieChartProps {
  suppliers: SupplierOutsourcing[]
}

// Chart colors mapped to status - using theme-appropriate colors
const STATUS_COLORS: Record<string, string> = {
  Active: "#2D3E50", // primary ink blue
  Draft: "#94A3B8", // slate-400
  "Not Yet Active": "#CBD5E1", // slate-300
  Terminated: "#E2E8F0", // slate-200
}

export function StatusPieChart({ suppliers }: StatusPieChartProps) {
  const data = getStatusBreakdown(suppliers)

  if (data.length === 0) {
    return (
      <ChartContainer
        title="Status Breakdown"
        description="Distribution by outsourcing status"
        regulatoryPoint="Point 53"
        icon={Activity}
      >
        <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground gap-3">
          <FileBox className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm">No data available</p>
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title="Status Breakdown"
      description="Distribution by outsourcing status"
      regulatoryPoint="Point 53"
      icon={Activity}
    >
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            labelLine={false}
            label={({ name, percentage }) => `${name}: ${percentage}%`}
            outerRadius={85}
            innerRadius={40}
            fill="#2D3E50"
            dataKey="value"
            stroke="hsl(var(--background))"
            strokeWidth={2}
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={STATUS_COLORS[entry.name] || "hsl(var(--muted))"}
              />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md">
                    <div className="flex flex-col gap-0.5">
                      <span className="uppercase opacity-70">
                        {payload[0].name}
                      </span>
                      <span className="font-bold">
                        {payload[0].value} Outsourcings
                      </span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            wrapperStyle={{ color: "hsl(var(--foreground))", fontSize: "12px" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
