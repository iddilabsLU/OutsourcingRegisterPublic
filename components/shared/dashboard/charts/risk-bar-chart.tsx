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
  Tooltip,
} from "recharts"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getRiskDistribution } from "@/lib/utils/dashboard-analytics"
import { ChartContainer } from "./chart-container"
import { TriangleAlert, ShieldOff } from "lucide-react"

interface RiskBarChartProps {
  suppliers: SupplierOutsourcing[]
}

// Color mapping for risk levels - using CSS chart colors
const RISK_COLORS = {
  High: "#DC2626", // Red-600 - for high risk
  Medium: "#F59E0B", // Amber-500 - for medium risk
  Low: "#10B981", // Emerald-500 - for low risk
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
        icon={TriangleAlert}
      >
        <div className="flex h-[280px] flex-col items-center justify-center text-muted-foreground gap-3">
          <ShieldOff className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm">No critical suppliers</p>
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title="Risk Distribution"
      description={`Critical suppliers by risk level (${totalCritical} total)`}
      regulatoryPoint="Point 55.c"
      icon={TriangleAlert}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={true} vertical={false} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" width={70} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md">
                    <div className="flex flex-col gap-0.5">
                      <span className="uppercase opacity-70">
                        {payload[0].payload.name}
                      </span>
                      <span className="font-bold">
                        {payload[0].value} Critical Outsourcings
                      </span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32}>
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
