/**
 * Generic Data Table Component
 *
 * Reusable table component with sorting, pagination, and filtering.
 * Use this as a template for all tables in your app.
 *
 * Features:
 * - Responsive design
 * - Column sorting
 * - Pagination
 * - Empty state
 * - Loading state
 * - Customizable columns
 *
 * @example
 * ```tsx
 * <DataTable
 *   data={users}
 *   columns={[
 *     { header: "Name", accessorKey: "name" },
 *     { header: "Email", accessorKey: "email" },
 *   ]}
 *   pagination={{ page: 1, limit: 20, total: 100 }}
 *   onPageChange={(page) => setPage(page)}
 * />
 * ```
 */

"use client"

import * as React from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

/**
 * Column definition
 */
export interface DataTableColumn<T> {
  header: string
  accessorKey: keyof T
  cell?: (value: T[keyof T], row: T) => React.ReactNode
  sortable?: boolean
}

/**
 * Pagination configuration
 */
export interface DataTablePagination {
  page: number
  limit: number
  total: number
  totalPages?: number
}

/**
 * DataTable props
 */
export interface DataTableProps<T> {
  data: T[]
  columns: DataTableColumn<T>[]
  pagination?: DataTablePagination
  onPageChange?: (page: number) => void
  loading?: boolean
  emptyMessage?: string
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  pagination,
  onPageChange,
  loading = false,
  emptyMessage = "No data available.",
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{
    key: keyof T | null
    direction: "asc" | "desc"
  }>({ key: null, direction: "asc" })

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortConfig.key) return data

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue === bValue) return 0

      const direction = sortConfig.direction === "asc" ? 1 : -1
      return aValue > bValue ? direction : -direction
    })
  }, [data, sortConfig])

  // Handle sort
  const handleSort = (key: keyof T) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Calculate total pages
  const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 1
  const currentPage = pagination?.page || 1

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((column) => (
                    <TableHead
                      key={String(column.accessorKey)}
                      className={column.sortable ? "cursor-pointer select-none" : ""}
                      onClick={() => column.sortable && handleSort(column.accessorKey)}
                    >
                      <div className="flex items-center gap-2">
                        {column.header}
                        {column.sortable && sortConfig.key === column.accessorKey && (
                          <span>{sortConfig.direction === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : sortedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {emptyMessage}
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData.map((row, index) => (
                    <TableRow key={index}>
                      {columns.map((column) => (
                        <TableCell key={String(column.accessorKey)}>
                          {column.cell
                            ? column.cell(row[column.accessorKey], row)
                            : String(row[column.accessorKey] || "")}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pagination.limit + 1} to{" "}
            {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total}{" "}
            results
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(1)}
              disabled={currentPage === 1}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="text-sm">
              Page {currentPage} of {totalPages}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange?.(totalPages)}
              disabled={currentPage === totalPages}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
