import { useState, useEffect, useCallback } from "react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { loadSuppliers, saveSuppliers } from "@/lib/utils/session-storage"

/**
 * Check if running in Electron environment
 */
function isElectron(): boolean {
  return typeof window !== 'undefined' && typeof window.electronAPI !== 'undefined'
}

/**
 * React hook for managing suppliers with automatic database persistence (Electron)
 * Falls back to sessionStorage when running in browser (development)
 *
 * @returns Object with suppliers state, setter, and CRUD operations
 *
 * @example
 * ```tsx
 * const { suppliers, isLoading, addSupplier, updateSupplier, deleteSupplier, duplicateSupplier } = useDatabase()
 * ```
 */
export function useDatabase() {
  const [suppliers, setSuppliers] = useState<SupplierOutsourcing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Load suppliers from database (or sessionStorage in browser)
   */
  const loadSuppliersFromSource = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (isElectron()) {
        // Running in Electron - use database
        const data = await window.electronAPI.getAllSuppliers()
        setSuppliers(data)
      } else {
        // Running in browser (development) - use sessionStorage
        const data = loadSuppliers()
        setSuppliers(data)
      }
    } catch (err) {
      console.error('Failed to load suppliers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load suppliers')
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * Add a new supplier
   */
  const addSupplier = useCallback(async (supplier: SupplierOutsourcing) => {
    try {
      if (isElectron()) {
        // Add to database
        await window.electronAPI.addSupplier(supplier)
        // Reload suppliers from database
        await loadSuppliersFromSource()
      } else {
        // Add to sessionStorage
        const newSuppliers = [...suppliers, supplier]
        setSuppliers(newSuppliers)
        saveSuppliers(newSuppliers)
      }
    } catch (err) {
      console.error('Failed to add supplier:', err)
      throw err
    }
  }, [suppliers, loadSuppliersFromSource])

  /**
   * Update an existing supplier
   */
  const updateSupplier = useCallback(async (supplier: SupplierOutsourcing) => {
    try {
      if (isElectron()) {
        // Update in database
        await window.electronAPI.updateSupplier(supplier)
        // Reload suppliers from database
        await loadSuppliersFromSource()
      } else {
        // Update in sessionStorage
        const newSuppliers = suppliers.map((s) =>
          s.referenceNumber === supplier.referenceNumber ? supplier : s
        )
        setSuppliers(newSuppliers)
        saveSuppliers(newSuppliers)
      }
    } catch (err) {
      console.error('Failed to update supplier:', err)
      throw err
    }
  }, [suppliers, loadSuppliersFromSource])

  /**
   * Delete a supplier
   */
  const deleteSupplier = useCallback(async (referenceNumber: string) => {
    try {
      if (isElectron()) {
        // Delete from database
        await window.electronAPI.deleteSupplier(referenceNumber)
        // Reload suppliers from database
        await loadSuppliersFromSource()
      } else {
        // Delete from sessionStorage
        const newSuppliers = suppliers.filter((s) => s.referenceNumber !== referenceNumber)
        setSuppliers(newSuppliers)
        saveSuppliers(newSuppliers)
      }
    } catch (err) {
      console.error('Failed to delete supplier:', err)
      throw err
    }
  }, [suppliers, loadSuppliersFromSource])

  /**
   * Duplicate a supplier with a new reference number
   */
  const duplicateSupplier = useCallback(async (supplier: SupplierOutsourcing, status: string) => {
    try {
      let newReferenceNumber: string

      if (isElectron()) {
        // Get next reference number from database
        newReferenceNumber = await window.electronAPI.getNextReferenceNumber()
      } else {
        // Generate reference number from current suppliers
        const { generateNextReferenceNumber } = await import('@/lib/utils/check-completeness')
        newReferenceNumber = generateNextReferenceNumber(suppliers)
      }

      const duplicatedSupplier: SupplierOutsourcing = {
        ...supplier,
        referenceNumber: newReferenceNumber,
        status: status as any,
      }

      await addSupplier(duplicatedSupplier)
      return duplicatedSupplier
    } catch (err) {
      console.error('Failed to duplicate supplier:', err)
      throw err
    }
  }, [suppliers, addSupplier])

  /**
   * Refresh suppliers from database
   */
  const refreshSuppliers = useCallback(async () => {
    await loadSuppliersFromSource()
  }, [loadSuppliersFromSource])

  // Load suppliers on mount
  useEffect(() => {
    loadSuppliersFromSource()
  }, [loadSuppliersFromSource])

  return {
    suppliers,
    isLoading,
    error,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    duplicateSupplier,
    refreshSuppliers,
    setSuppliers, // Keep for backward compatibility with filtering
  }
}
