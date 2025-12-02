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
} from "recharts"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getCategoryBreakdown } from "@/lib/utils/dashboard-analytics"
import { ChartContainer } from "./chart-container"

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
      >
        <div className="flex h-[300px] items-center justify-center text-muted-foreground">
          No data available
        </div>
      </ChartContainer>
    )
  }

  return (
    <ChartContainer
      title="Category Breakdown"
      description="Distribution by outsourcing category"
      regulatoryPoint="Point 54.d"
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
          <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
          <YAxis dataKey="name" type="category" width={90} stroke="hsl(var(--muted-foreground))" />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
