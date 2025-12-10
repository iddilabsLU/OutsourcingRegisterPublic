"use client"

import { useState, useMemo, useEffect } from "react"
import { AppLayout } from "@/components/layouts/app-layout"
import { SupplierRegisterTable } from "@/components/shared/supplier-register-table"
import { FilterPanel } from "@/components/shared/filter-panel"
import { ViewSegmentedControl, type ViewType } from "@/components/shared/view-segmented-control"
import { SupplierForm } from "@/components/shared/forms/supplier-form"
import { FilterWarningBanner } from "@/components/shared/filter-warning-banner"
import { TipBanner } from "@/components/shared/tip-banner"
import { DashboardView } from "@/components/shared/dashboard/dashboard-view"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { MobileBlock } from "@/components/shared/mobile-block"
import { useDatabase } from "@/hooks/use-database"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import type { QuickFilters, CustomFilter } from "@/lib/types/filters"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { OutsourcingStatus } from "@/lib/types/supplier"
import { filterSuppliers } from "@/lib/utils/filter-suppliers"

export default function SuppliersPage() {
  // View state
  const [activeView, setActiveView] = useState<ViewType>("list")

  // Suppliers state with database persistence (Electron) or sessionStorage (browser)
  const {
    suppliers,
    isLoading,
    error,
    addSupplier: dbAddSupplier,
    updateSupplier: dbUpdateSupplier,
    deleteSupplier: dbDeleteSupplier,
    duplicateSupplier: dbDuplicateSupplier,
  } = useDatabase()

  // Edit state
  const [editingSupplier, setEditingSupplier] = useState<SupplierOutsourcing | null>(null)

  // Filter state
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    critical: false,
    nonCritical: false,
    cloud: false,
    serviceOutsourcings: false,
    status: {
      active: false,
      draft: false,
      notYetActive: false,
      terminated: false,
    },
  })

  const [customFilters, setCustomFilters] = useState<CustomFilter[]>([
    {
      id: "filter-initial",
      field: "",
      value: "",
    },
  ])

  // Counter for generating unique filter IDs
  const [filterCounter, setFilterCounter] = useState(1)

  // Apply filters
  const filteredSuppliers = useMemo(() => {
    return filterSuppliers(suppliers, quickFilters, customFilters)
  }, [suppliers, quickFilters, customFilters])

  // Extract search term from customFilters for highlighting
  const searchTerm = useMemo(() => {
    const searchFilter = customFilters.find((f) => f.field === "searchAllFields" && f.value)
    return searchFilter?.value || ""
  }, [customFilters])

  // Statistics (kept for future Dashboard tab)
  const totalCount = suppliers.length
  const filteredCount = filteredSuppliers.length

  // Clear all filters
  const handleClearAll = () => {
    setQuickFilters({
      critical: false,
      nonCritical: false,
      cloud: false,
      serviceOutsourcings: false,
      status: {
        active: false,
        draft: false,
        notYetActive: false,
        terminated: false,
      },
    })
    setCustomFilters([
      {
        id: "filter-initial",
        field: "",
        value: "",
      },
    ])
    setFilterCounter(1)
  }

  // Handle custom filter changes with auto-add logic
  const handleCustomFiltersChange = (filters: CustomFilter[]) => {
    // Check if we should auto-add a new filter row
    const filledFilters = filters.filter((f) => f.field && f.value)
    const shouldAddNew =
      filledFilters.length === filters.length && filters.length < 3

    if (shouldAddNew) {
      const newCounter = filterCounter + 1
      setFilterCounter(newCounter)
      setCustomFilters([
        ...filters,
        {
          id: `filter-${newCounter}`,
          field: "",
          value: "",
        },
      ])
    } else {
      setCustomFilters(filters)
    }
  }

  // Handle saving new supplier
  const handleSaveSupplier = async (supplier: SupplierOutsourcing) => {
    try {
      await dbAddSupplier(supplier)
      setEditingSupplier(null)
      setActiveView("list")
      toast.success("Supplier added", {
        description: `${supplier.referenceNumber} has been added successfully`,
      })
    } catch (error) {
      toast.error("Failed to add supplier", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Handle edit supplier click
  const handleEditSupplier = (supplier: SupplierOutsourcing) => {
    setEditingSupplier(supplier)
    setActiveView("new")
  }

  // Handle updating existing supplier
  const handleUpdateSupplier = async (updatedSupplier: SupplierOutsourcing) => {
    try {
      await dbUpdateSupplier(updatedSupplier)
      setEditingSupplier(null)
      setActiveView("list")
      toast.success("Supplier updated", {
        description: `${updatedSupplier.referenceNumber} has been updated successfully`,
      })
    } catch (error) {
      toast.error("Failed to update supplier", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Handle delete supplier
  const handleDeleteSupplier = async (supplier: SupplierOutsourcing) => {
    try {
      await dbDeleteSupplier(supplier.referenceNumber)
      toast.success("Supplier deleted", {
        description: `${supplier.referenceNumber} has been deleted successfully`,
      })
    } catch (error) {
      toast.error("Failed to delete supplier", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Handle duplicate supplier
  const handleDuplicateSupplier = async (supplier: SupplierOutsourcing) => {
    try {
      const duplicatedData = await dbDuplicateSupplier(supplier, OutsourcingStatus.DRAFT)
      toast.success("Supplier duplicated", {
        description: `Created ${duplicatedData.referenceNumber} based on ${supplier.referenceNumber}`,
      })
    } catch (error) {
      toast.error("Failed to duplicate supplier", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    }
  }

  // Handle cancel form
  const handleCancelForm = () => {
    setEditingSupplier(null)
    setActiveView("list")
  }

  // Show error toast if there's a database error
  useEffect(() => {
    if (error) {
      toast.error("Database error", {
        description: error,
        icon: <AlertCircle className="h-5 w-5" />,
      })
    }
  }, [error])

  // Show loading skeleton during initial load
  if (isLoading) {
    return (
      <MobileBlock>
        <AppLayout>
          <LoadingSkeleton />
        </AppLayout>
      </MobileBlock>
    )
  }

  return (
    <MobileBlock>
      <AppLayout>
      <div className="space-y-6">
        {/* View Segmented Control */}
        <ViewSegmentedControl activeView={activeView} onViewChange={setActiveView} />

        {/* Register List View */}
        {activeView === "list" && (
          <>
            {/* Tip Banner */}
            <TipBanner />

            {/* Filter Panel */}
            <FilterPanel
              quickFilters={quickFilters}
              customFilters={customFilters}
              onQuickFilterChange={setQuickFilters}
              onCustomFiltersChange={handleCustomFiltersChange}
              onClearAll={handleClearAll}
            />

            {/* Result Counter */}
            {filteredCount !== totalCount && (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="text-sm font-medium text-foreground">
                  Displaying {filteredCount} of {totalCount} suppliers
                </p>
              </div>
            )}

            {/* Register Table or Empty State */}
            {filteredCount > 0 ? (
              <SupplierRegisterTable
                suppliers={filteredSuppliers}
                searchTerm={searchTerm}
                onEdit={handleEditSupplier}
                onDuplicate={handleDuplicateSupplier}
                onDelete={handleDeleteSupplier}
                allSuppliers={suppliers}
              />
            ) : (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30 p-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No suppliers match your filters</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Try adjusting or clearing your filters to see more results.
                </p>
              </div>
            )}
          </>
        )}

        {/* New Entry View */}
        {activeView === "new" && (
          <SupplierForm
            existingSuppliers={suppliers}
            onSave={editingSupplier ? handleUpdateSupplier : handleSaveSupplier}
            onCancel={handleCancelForm}
            initialData={editingSupplier || undefined}
            mode={editingSupplier ? "edit" : "add"}
          />
        )}

        {/* Dashboard View */}
        {activeView === "dashboard" && (
          <>
            {/* Filter Warning Banner */}
            <FilterWarningBanner />

            <DashboardView suppliers={filteredSuppliers} />
          </>
        )}
      </div>
    </AppLayout>
    </MobileBlock>
  )
}
