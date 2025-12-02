/**
 * Excel export functionality using SheetJS (xlsx)
 * Handles both summary (8 columns) and full (52 fields) exports
 */

import * as XLSX from "xlsx"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { SUMMARY_FIELDS, FULL_FIELDS } from "./export-field-mapping"
import type { FieldMapping } from "./export-field-mapping"
import { formatFieldForExport, generateFilename } from "./export-formatters"

/**
 * Export suppliers to Excel (summary view - 8 columns)
 * @param suppliers - Array of suppliers to export
 * @param filename - Optional custom filename
 */
export function exportSummaryToExcel(
  suppliers: SupplierOutsourcing[],
  filename?: string
): void {
  const data = suppliers.map((supplier) =>
    exportSupplierRow(supplier, SUMMARY_FIELDS)
  )

  createAndDownloadExcel(
    data,
    SUMMARY_FIELDS.map((f) => f.header),
    SUMMARY_FIELDS.map((f) => f.width),
    filename || generateFilename("summary", "xlsx")
  )
}

/**
 * Export suppliers to Excel (full export - 52 fields)
 * @param suppliers - Array of suppliers to export
 * @param filename - Optional custom filename
 */
export function exportFullToExcel(
  suppliers: SupplierOutsourcing[],
  filename?: string
): void {
  const data = suppliers.map((supplier) =>
    exportSupplierRow(supplier, FULL_FIELDS)
  )

  createAndDownloadExcel(
    data,
    FULL_FIELDS.map((f) => f.header),
    FULL_FIELDS.map((f) => f.width),
    filename || generateFilename("full", "xlsx")
  )
}

/**
 * Convert a supplier to a row object with formatted values
 * @param supplier - Supplier to export
 * @param fields - Field mappings to use
 * @returns Object with field headers as keys and formatted values
 */
function exportSupplierRow(
  supplier: SupplierOutsourcing,
  fields: FieldMapping[]
): Record<string, string> {
  const row: Record<string, string> = {}

  for (const field of fields) {
    row[field.header] = formatFieldForExport(supplier, field)
  }

  return row
}

/**
 * Create Excel workbook and trigger download
 * @param data - Array of row objects
 * @param headers - Column headers
 * @param columnWidths - Width for each column
 * @param filename - Download filename
 */
function createAndDownloadExcel(
  data: Record<string, string>[],
  headers: string[],
  columnWidths: number[],
  filename: string
): void {
  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Apply column widths
  worksheet["!cols"] = columnWidths.map((width) => ({ wch: width }))

  // Enable text wrapping for all cells
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col })
      if (!worksheet[cellAddress]) continue

      // Add cell style for text wrapping
      worksheet[cellAddress].s = {
        alignment: {
          vertical: "top",
          horizontal: "left",
          wrapText: true,
        },
      }
    }
  }

  // Format header row (first row)
  for (let col = range.s.c; col <= range.e.c; col++) {
    const headerAddress = XLSX.utils.encode_cell({ r: 0, c: col })
    if (!worksheet[headerAddress]) continue

    worksheet[headerAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "F3F4F6" } },
      alignment: {
        vertical: "top",
        horizontal: "left",
        wrapText: false,
      },
    }
  }

  // Create workbook
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers")

  // Trigger download
  XLSX.writeFile(workbook, filename)
}
