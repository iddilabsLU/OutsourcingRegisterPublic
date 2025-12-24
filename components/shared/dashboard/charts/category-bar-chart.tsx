/**
 * Category Breakdown Bar Chart
 * CSSF Point 54.d - Category of outsourcing
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
import { getCategoryBreakdown } from "@/lib/utils/dashboard-analytics"
import { ChartContainer } from "./chart-container"
import { FolderKanban, FileBox } from "lucide-react"

interface CategoryBarChartProps {
  suppliers: SupplierOutsourcing[]
}

// Using primary color shades for each category
const CATEGORY_COLORS = [
  "#2D3E50", // primary ink blue (darkest)
  "#4A5F75", // 20% lighter
  "#6B7F95", // 40% lighter
  "#899DAE", // 60% lighter
  "#B8C5D0", // 80% lighter
]

export function CategoryBarChart({ suppliers }: CategoryBarChartProps) {
  const data = getCategoryBreakdown(suppliers)

  if (data.length === 0) {
    return (
      <ChartContainer
        title="Category Breakdown"
        description="Distribution by outsourcing category"
        regulatoryPoint="Point 54.d"
        icon={FolderKanban}
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
      title="Category Breakdown"
      description="Distribution by outsourcing category"
      regulatoryPoint="Point 54.d"
      icon={FolderKanban}
    >
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} horizontal={true} vertical={false} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis dataKey="name" type="category" width={160} stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
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
                        {payload[0].value} Outsourcings
                      </span>
                    </div>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={32}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
