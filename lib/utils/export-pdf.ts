/**
 * PDF export functionality using jsPDF + jsPDF-AutoTable
 * Handles summary export (8 columns) only
 * Note: Full export (52 fields) is available only in Excel format due to layout limitations
 */

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { SUMMARY_FIELDS } from "./export-field-mapping"
import { formatFieldForExport, generateFilename } from "./export-formatters"

/**
 * Export suppliers to PDF (summary view - 8 columns)
 * @param suppliers - Array of suppliers to export
 * @param filename - Optional custom filename
 */
export function exportSummaryToPDF(
  suppliers: SupplierOutsourcing[],
  filename?: string
): void {
  // Create PDF with landscape orientation for better table fit
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  })

  // Add document header
  addDocumentHeader(doc, "Summary Export", suppliers.length)

  // Prepare table data
  const headers = [SUMMARY_FIELDS.map((field) => field.header)]
  const rows = suppliers.map((supplier) =>
    SUMMARY_FIELDS.map((field) => formatFieldForExport(supplier, field))
  )

  // Generate table
  autoTable(doc, {
    head: headers,
    body: rows,
    startY: 35, // Start below header
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246], // Blue header (matching primary color)
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
      overflow: "linebreak",
      halign: "left",
      valign: "top",
    },
    columnStyles: {
      0: { cellWidth: 25 }, // Reference Number
      1: { cellWidth: 40 }, // Function Name
      2: { cellWidth: 40 }, // Provider Name
      3: { cellWidth: 30 }, // Category
      4: { cellWidth: 25 }, // Status
      5: { cellWidth: 20 }, // Is Critical
      6: { cellWidth: 25 }, // Start Date
      7: { cellWidth: 30 }, // CSSF Notification Date
    },
    didDrawPage: (data) => {
      // Add page numbers in footer
      addPageNumbers(doc, data.pageNumber)
    },
  })

  // Save PDF
  doc.save(filename || generateFilename("summary", "pdf"))
}

/**
 * Add document header with title and metadata
 */
function addDocumentHeader(doc: jsPDF, exportType: string, supplierCount: number): void {
  const pageWidth = doc.internal.pageSize.getWidth()

  // Title
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("CSSF Supplier Outsourcing Register", pageWidth / 2, 15, {
    align: "center",
  })

  // Subtitle
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  doc.text(`${exportType} (${supplierCount} supplier${supplierCount !== 1 ? "s" : ""})`, pageWidth / 2, 22, {
    align: "center",
  })

  // Export date
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  const exportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
  doc.text(`Export Date: ${exportDate}`, pageWidth / 2, 28, {
    align: "center",
  })

  // Reset text color
  doc.setTextColor(0, 0, 0)
}

/**
 * Add page numbers to footer
 */
function addPageNumbers(doc: jsPDF, currentPage: number): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const totalPages = doc.getNumberOfPages()

  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text(`Page ${currentPage} of ${totalPages}`, pageWidth / 2, pageHeight - 10, {
    align: "center",
  })

  // Reset text color
  doc.setTextColor(0, 0, 0)
}
