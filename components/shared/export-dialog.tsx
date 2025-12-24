"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Loader2 } from "lucide-react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { exportSummaryToExcel, exportFullToExcel } from "@/lib/utils/export-excel"
import { exportSummaryToPDF } from "@/lib/utils/export-pdf"
import { toast } from "sonner"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  allSuppliers: SupplierOutsourcing[]
  filteredSuppliers: SupplierOutsourcing[]
}

export function ExportDialog({
  open,
  onOpenChange,
  allSuppliers,
  filteredSuppliers,
}: ExportDialogProps) {
  const [scope, setScope] = useState<"all" | "filtered">("all")
  const [format, setFormat] = useState<"summary" | "full">("summary")
  const [isExporting, setIsExporting] = useState(false)

  const suppliersToExport = scope === "all" ? allSuppliers : filteredSuppliers
  const allCount = allSuppliers.length
  const filteredCount = filteredSuppliers.length
  const isFiltered = filteredCount < allCount
  const isPdfDisabled = format === "full" // PDF only available for summary

  const handleExportExcel = () => {
    if (suppliersToExport.length === 0) {
      toast.error("No suppliers to export", {
        description: "The current selection contains no suppliers.",
      })
      return
    }

    setIsExporting(true)
    try {
      if (format === "summary") {
        exportSummaryToExcel(suppliersToExport)
        toast.success("Summary exported successfully", {
          description: `Exported ${suppliersToExport.length} supplier(s) to Excel`,
        })
      } else {
        exportFullToExcel(suppliersToExport)
        toast.success("Full export completed successfully", {
          description: `Exported ${suppliersToExport.length} supplier(s) with all 52 fields`,
        })
      }
      onOpenChange(false)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Export failed", {
        description: "An error occurred while generating the Excel file.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportPDF = () => {
    if (suppliersToExport.length === 0) {
      toast.error("No suppliers to export", {
        description: "The current selection contains no suppliers.",
      })
      return
    }

    // PDF export only available for summary format
    if (format === "full") {
      toast.info("PDF not available for full export", {
        description: "Please use Excel for full export (52 fields) or select Summary format for PDF.",
      })
      return
    }

    setIsExporting(true)
    try {
      exportSummaryToPDF(suppliersToExport)
      toast.success("Summary PDF exported successfully", {
        description: `Exported ${suppliersToExport.length} supplier(s) to PDF`,
      })
      onOpenChange(false)
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Export failed", {
        description: "An error occurred while generating the PDF file.",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Suppliers Register</DialogTitle>
          <DialogDescription>
            Choose your export options and file format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Export Scope */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Scope</Label>
            <RadioGroup value={scope} onValueChange={(v) => setScope(v as "all" | "filtered")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="scope-all" />
                <Label htmlFor="scope-all" className="font-normal cursor-pointer">
                  All suppliers ({allCount})
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="filtered" id="scope-filtered" disabled={!isFiltered} />
                <Label
                  htmlFor="scope-filtered"
                  className={`font-normal ${isFiltered ? "cursor-pointer" : "text-muted-foreground cursor-not-allowed"}`}
                >
                  Filtered results only ({filteredCount})
                  {!isFiltered && " - No filters applied"}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-base font-semibold">Export Format</Label>
            <RadioGroup value={format} onValueChange={(v) => setFormat(v as "summary" | "full")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="summary" id="format-summary" />
                <Label htmlFor="format-summary" className="font-normal cursor-pointer">
                  Summary export (8 columns)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="full" id="format-full" />
                <Label htmlFor="format-full" className="font-normal cursor-pointer">
                  Full export (52 fields)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        {/* Helper text for PDF limitation */}
        {isPdfDisabled && (
          <p className="text-sm text-muted-foreground text-center">
            PDF export is only available for Summary format. Use Excel for full export (52 fields).
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExportExcel} className="gap-2" disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <line x1="10" y1="9" x2="8" y2="9" />
              </svg>
            )}
            {isExporting ? "Exporting..." : "Export as Excel"}
          </Button>
          <Button onClick={handleExportPDF} variant="secondary" className="gap-2" disabled={isPdfDisabled || isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            )}
            {isExporting ? "Exporting..." : "Export as PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
