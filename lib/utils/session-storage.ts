import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { suppliers as dummySuppliers } from "@/lib/data/suppliers"

const STORAGE_KEY = "supplier-register-data"

/**
 * Save suppliers array to sessionStorage
 * @param suppliers - Array of suppliers to save
 */
export function saveSuppliers(suppliers: SupplierOutsourcing[]): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers))
  } catch (_error) {
    console.error("Failed to save suppliers to sessionStorage:", _error)
  }
}

/**
 * Load suppliers from sessionStorage
 * Returns dummy suppliers if no data exists in storage
 * @returns Array of suppliers
 */
export function loadSuppliers(): SupplierOutsourcing[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored) as SupplierOutsourcing[]
    }
  } catch (_error) {
    console.error("Failed to load suppliers from sessionStorage:", _error)
  }

  // Return dummy data if nothing in storage or error occurred
  return dummySuppliers
}

/**
 * Clear all suppliers from sessionStorage
 * Useful for reset functionality
 */
export function clearSuppliers(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch (_error) {
    console.error("Failed to clear suppliers from sessionStorage:", _error)
  }
}

/**
 * Check if suppliers data exists in sessionStorage
 * @returns True if data exists, false otherwise
 */
export function hasSavedSuppliers(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) !== null
  } catch {
    return false
  }
}
