"use client"

import React, { useState } from "react"
import { MoreVertical, Edit, Copy, Trash2, Pin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { SupplierDetailTabs } from "./supplier-detail-tabs"
import { formatDateShort } from "@/lib/utils/formatters"
import { toast } from "sonner"
import { ExportButton } from "./export-button"

interface SupplierRegisterTableProps {
  suppliers: SupplierOutsourcing[]
  searchTerm?: string
  onEdit?: (supplier: SupplierOutsourcing) => void
  onDuplicate?: (supplier: SupplierOutsourcing) => void
  onDelete?: (supplier: SupplierOutsourcing) => void
  allSuppliers?: SupplierOutsourcing[] // For export: all suppliers before filtering
}

export function SupplierRegisterTable({
  suppliers,
  searchTerm = "",
  onEdit,
  onDuplicate,
  onDelete,
  allSuppliers,
}: SupplierRegisterTableProps) {
  // Use allSuppliers if provided, otherwise use suppliers (for backward compatibility)
  const suppliersForExport = allSuppliers || suppliers
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierOutsourcing | null>(null)

  // Check if user has any edit permissions (hide actions menu for viewers)
  const hasAnyEditPermission = !!(onEdit || onDuplicate || onDelete)

  const toggleRow = (referenceNumber: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(referenceNumber)) {
      newExpanded.delete(referenceNumber)
    } else {
      newExpanded.add(referenceNumber)
    }
    setExpandedRows(newExpanded)
  }

  const handleEdit = (supplier: SupplierOutsourcing) => {
    if (onEdit) {
      onEdit(supplier)
    } else {
      toast.info("Edit functionality coming soon", {
        description: `Editing ${supplier.serviceProvider.name}`,
      })
    }
  }

  const handleDuplicate = (supplier: SupplierOutsourcing) => {
    if (onDuplicate) {
      onDuplicate(supplier)
    } else {
      toast.success("Duplicate functionality coming soon", {
        description: `Duplicating ${supplier.serviceProvider.name}`,
      })
    }
  }

  const handleDeleteClick = (supplier: SupplierOutsourcing) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (supplierToDelete) {
      if (onDelete) {
        onDelete(supplierToDelete)
      }
      toast.success("Supplier deleted", {
        description: `${supplierToDelete.serviceProvider.name} has been removed from the register.`,
      })
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
    }
  }

  return (
    <div className="w-full space-y-3">
      {/* Toolbar with Export Button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {suppliers.length === suppliersForExport.length ? (
            <span>Showing {suppliers.length} supplier{suppliers.length !== 1 ? "s" : ""}</span>
          ) : (
            <span>
              Showing {suppliers.length} of {suppliersForExport.length} suppliers (filtered)
            </span>
          )}
        </div>
        <ExportButton allSuppliers={suppliersForExport} filteredSuppliers={suppliers} />
      </div>

      <div className="rounded-md border bg-white">
        <Table className="w-full table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[2.5%]" />
              <TableHead className="w-[6%] text-base">Ref.</TableHead>
              <TableHead className="w-[17%] text-base">Function</TableHead>
              <TableHead className="w-[14%] text-base">Provider</TableHead>
              <TableHead className="w-[12%] text-base">Category</TableHead>
              <TableHead className="w-[9%] text-base">Status</TableHead>
              <TableHead className="w-[8%] text-base">Critical</TableHead>
              <TableHead className="w-[7%] text-base">Start</TableHead>
              <TableHead className="w-[5%] text-base">CSSF Notif.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((supplier) => {
              const isExpanded = expandedRows.has(supplier.referenceNumber)
              return (
                <React.Fragment key={supplier.referenceNumber}>
                  <TableRow
                    className="cursor-pointer transition-colors hover:bg-muted/50 even:bg-muted/20"
                    onClick={() => toggleRow(supplier.referenceNumber)}
                  >
                    <TableCell className="align-top">
                      {hasAnyEditPermission && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEdit(supplier)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Supplier
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDuplicate(supplier)
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteClick(supplier)
                              }}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </TableCell>
                    <TableCell className="font-medium whitespace-normal break-words leading-tight align-top text-base">
                      <div className="flex items-center gap-2">
                        {supplier.referenceNumber}
                        {supplier.incompleteFields && supplier.incompleteFields.length > 0 && (
                          <span
                            className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs font-bold"
                            title={`${supplier.incompleteFields.length} incomplete mandatory field(s)`}
                          >
                            !
                          </span>
                        )}
                        {supplier.pendingFields && supplier.pendingFields.length > 0 && (
                          <span
                            className="inline-flex items-center justify-center gap-1 px-1.5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium border border-amber-300"
                            title={`${supplier.pendingFields.length} field(s) marked as pending`}
                          >
                            <Pin className="h-3 w-3 fill-amber-600" />
                            {supplier.pendingFields.length}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-normal break-words leading-tight align-top text-base">
                      {supplier.functionDescription.name}
                    </TableCell>
                    <TableCell className="whitespace-normal break-words leading-tight align-top text-base">{supplier.serviceProvider.name}</TableCell>
                    <TableCell className="whitespace-normal break-words leading-tight align-top text-base">{supplier.category}</TableCell>
                    <TableCell className="align-top">
                      <Badge
                        variant={
                          supplier.status === "Active" ? "default" :
                          supplier.status === "Not Yet Active" ? "secondary" :
                          "outline"
                        }
                      >
                        {supplier.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant={supplier.criticality.isCritical ? "destructive" : "secondary"}>
                        {supplier.criticality.isCritical ? "Critical" : "Non-Critical"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-base align-top">{formatDateShort(supplier.dates.startDate)}</TableCell>
                    <TableCell className="text-base align-top">
                      {supplier.criticality.isCritical && supplier.criticalFields?.regulatoryNotification
                        ? formatDateShort(supplier.criticalFields.regulatoryNotification.notificationDate)
                        : "N/A"}
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={9} className="bg-muted/30 p-6">
                        <SupplierDetailTabs supplier={supplier} searchTerm={searchTerm} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold">{supplierToDelete?.serviceProvider.name}</span>? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
