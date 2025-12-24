/**
 * Data formatting utilities for export functionality
 * Handles conversion of all field types to export-ready strings
 */

import type { SupplierOutsourcing } from "@/lib/types/supplier"
import type { FieldMapping } from "./export-field-mapping"
import { getFieldValue, isConditionalField } from "./export-field-mapping"

/**
 * Format a field value for export based on display rules
 *
 * Display Logic:
 * 1. Value + Pending → "value *"
 * 2. Value + Not Pending → "value"
 * 3. Empty + Pending → "*"
 * 4. Empty + Not Pending + Conditional (N/A) → "N/A"
 * 5. Empty + Not Pending + Optional → "" (blank)
 */
export function formatFieldForExport(
  supplier: SupplierOutsourcing,
  field: FieldMapping
): string {
  const value = getFieldValue(supplier, field.path)
  const pendingFields = supplier.pendingFields || []
  const isPending = pendingFields.includes(field.path)
  const isConditional = isConditionalField(field.path, supplier)

  // Rule 1: Field has value + marked as pending
  if (hasValue(value, field.type) && isPending) {
    return `${formatValue(value, field.type)} *`
  }

  // Rule 2: Field has value + not pending
  if (hasValue(value, field.type) && !isPending) {
    return formatValue(value, field.type)
  }

  // Rule 3: Empty + pending
  if (!hasValue(value, field.type) && isPending) {
    return "*"
  }

  // Rule 4: Empty + not pending + conditional field (Cloud/Critical N/A)
  if (!hasValue(value, field.type) && !isPending && isConditional) {
    return "N/A"
  }

  // Rule 5: Empty + not pending + optional field → blank
  return ""
}

/**
 * Check if a value exists (not empty/null/undefined)
 */
function hasValue(value: unknown, type: FieldMapping["type"]): boolean {
  if (value === null || value === undefined) {
    return false
  }

  // Empty string check
  if (type === "string" && value === "") {
    return false
  }

  // Empty array check
  if ((type === "array" || type === "arrayObject") && Array.isArray(value)) {
    return value.length > 0
  }

  return true
}

/**
 * Format a value based on its type
 */
function formatValue(value: unknown, type: FieldMapping["type"]): string {
  switch (type) {
    case "boolean":
      return formatBoolean(value as boolean)

    case "date":
      return formatDate(value as string)

    case "number":
      return formatNumber(value as number)

    case "array":
      return formatArray(value as string[])

    case "arrayObject":
      return formatArrayObject(value as unknown[])

    case "enum":
    case "string":
    default:
      return String(value)
  }
}

/**
 * Format boolean values
 * @param value - Boolean value
 * @returns "Yes" or "No"
 */
export function formatBoolean(value: boolean): string {
  return value ? "Yes" : "No"
}

/**
 * Format date values
 * Keep as YYYY-MM-DD (no conversion per user requirements)
 * @param value - Date string in YYYY-MM-DD format
 * @returns Date string as-is
 */
export function formatDate(value: string): string {
  return value
}

/**
 * Format number values
 * No thousands separator per user requirements
 * @param value - Number value
 * @returns Number as string without formatting
 */
export function formatNumber(value: number): string {
  return String(value)
}

/**
 * Format simple arrays (strings)
 * @param value - Array of strings
 * @returns Comma-separated string
 * @example ["Luxembourg", "Germany"] → "Luxembourg, Germany"
 */
export function formatArray(value: string[]): string {
  if (!Array.isArray(value) || value.length === 0) {
    return ""
  }
  return value.join(", ")
}

/**
 * Format object arrays (subcontractors)
 * Each object's fields are pipe-separated, objects separated by line breaks
 * @param value - Array of subcontractor objects
 * @returns Formatted string with pipes and line breaks
 * @example
 * Input: [{ name: "A", activity: "B", country: "C", serviceCountry: "D", storage: "E" }]
 * Output: "A | B | C | D | E"
 */
export function formatArrayObject(value: unknown[]): string {
  if (!Array.isArray(value) || value.length === 0) {
    return ""
  }

  // Subcontractor objects have 6 fields in specific order:
  // name, activityDescription, registrationCountry, servicePerformanceCountry, dataStorageLocation, otherInformation
  const formattedObjects = value.map((obj) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const item = obj as any
    const fields = [
      item.name || "",
      item.activityDescription || "",
      item.registrationCountry || "",
      item.servicePerformanceCountry || "",
      item.dataStorageLocation || "",
      item.otherInformation || "",
    ]
    return fields.join(" | ")
  })

  // Join objects with line breaks
  return formattedObjects.join("\n")
}

/**
 * Generate filename for export
 * @param type - Export type ("summary" or "full")
 * @param extension - File extension ("xlsx" or "pdf")
 * @returns Formatted filename with date
 * @example "supplier-register-summary-2025-10-30.xlsx"
 */
export function generateFilename(
  type: "summary" | "full",
  extension: "xlsx" | "pdf"
): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const day = String(today.getDate()).padStart(2, "0")
  const dateStr = `${year}-${month}-${day}`

  return `supplier-register-${type}-${dateStr}.${extension}`
}

/**
 * Get current date in DD/MM/YYYY format for PDF headers
 */
export function getCurrentDateFormatted(): string {
  const today = new Date()
  const day = String(today.getDate()).padStart(2, "0")
  const month = String(today.getMonth() + 1).padStart(2, "0")
  const year = today.getFullYear()
  return `${day}/${month}/${year}`
}
