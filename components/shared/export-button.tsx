"use client"

import { useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ExportDialog } from "./export-dialog"
import type { SupplierOutsourcing } from "@/lib/types/supplier"

interface ExportButtonProps {
  allSuppliers: SupplierOutsourcing[]
  filteredSuppliers: SupplierOutsourcing[]
}

export function ExportButton({ allSuppliers, filteredSuppliers }: ExportButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant="outline"
        className="gap-2"
        disabled={allSuppliers.length === 0}
      >
        <Download className="h-4 w-4" />
        Export
      </Button>

      <ExportDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        allSuppliers={allSuppliers}
        filteredSuppliers={filteredSuppliers}
      />
    </>
  )
}
