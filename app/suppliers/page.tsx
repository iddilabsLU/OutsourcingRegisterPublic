"use client"

import { useState, useMemo, useEffect } from "react"
import { AppLayout } from "@/components/layouts/app-layout"
import { SupplierRegisterTable } from "@/components/shared/supplier-register-table"
import { FilterPanel } from "@/components/shared/filter-panel"
import { ViewSegmentedControl, type ViewType } from "@/components/shared/view-segmented-control"
import { SupplierForm } from "@/components/shared/forms/supplier-form"
import { DemoBanner } from "@/components/shared/demo-banner"
import { FilterWarningBanner } from "@/components/shared/filter-warning-banner"
import { TipBanner } from "@/components/shared/tip-banner"
import { DashboardView } from "@/components/shared/dashboard/dashboard-view"
import { LoadingSkeleton } from "@/components/shared/loading-skeleton"
import { MobileBlock } from "@/components/shared/mobile-block"
import { useSessionStorage } from "@/hooks/use-session-storage"
import { toast } from "sonner"
import { AlertCircle } from "lucide-react"
import type { QuickFilters, CustomFilter } from "@/lib/types/filters"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { OutsourcingStatus } from "@/lib/types/supplier"
import { filterSuppliers } from "@/lib/utils/filter-suppliers"
import { generateNextReferenceNumber } from "@/lib/utils/check-completeness"

export default function SuppliersPage() {
  // Loading state
  const [isLoading, setIsLoading] = useState(true)

  // View state
  const [activeView, setActiveView] = useState<ViewType>("list")

  // Suppliers state with sessionStorage persistence
  const [suppliers, setSuppliers] = useSessionStorage()

  // Edit state
  const [editingSupplier, setEditingSupplier] = useState<SupplierOutsourcing | null>(null)

  // Filter state
  const [quickFilters, setQuickFilters] = useState<QuickFilters>({
    critical: false,
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
  const handleSaveSupplier = (supplier: SupplierOutsourcing) => {
    setSuppliers([...suppliers, supplier])
    setEditingSupplier(null)
    setActiveView("list")
  }

  // Handle edit supplier click
  const handleEditSupplier = (supplier: SupplierOutsourcing) => {
    setEditingSupplier(supplier)
    setActiveView("new")
  }

  // Handle updating existing supplier
  const handleUpdateSupplier = (updatedSupplier: SupplierOutsourcing) => {
    setSuppliers(
      suppliers.map((s) => (s.referenceNumber === updatedSupplier.referenceNumber ? updatedSupplier : s))
    )
    setEditingSupplier(null)
    setActiveView("list")
  }

  // Handle delete supplier
  const handleDeleteSupplier = (supplier: SupplierOutsourcing) => {
    setSuppliers(suppliers.filter((s) => s.referenceNumber !== supplier.referenceNumber))
  }

  // Handle duplicate supplier
  const handleDuplicateSupplier = (supplier: SupplierOutsourcing) => {
    const duplicatedData: SupplierOutsourcing = {
      ...supplier,
      referenceNumber: generateNextReferenceNumber(suppliers),
      status: OutsourcingStatus.DRAFT,
    }
    setSuppliers([...suppliers, duplicatedData])
    toast.success("Supplier duplicated", {
      description: `Created ${duplicatedData.referenceNumber} based on ${supplier.referenceNumber}`,
    })
  }

  // Handle cancel form
  const handleCancelForm = () => {
    setEditingSupplier(null)
    setActiveView("list")
  }

  // Set loading to false after initial mount and data load
  useEffect(() => {
    // Short delay to allow sessionStorage data to load
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

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

        {/* Demo Banner */}
        <DemoBanner />

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
