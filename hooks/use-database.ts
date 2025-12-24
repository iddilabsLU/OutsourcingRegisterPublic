import { useState, useEffect, useCallback } from "react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"

/**
 * React hook for managing suppliers with automatic database persistence
 *
 * **Desktop-only app** - This hook requires Electron environment
 * Run the app with: npm run electron:dev
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
   * Verify Electron environment
   */
  const checkElectronAPI = useCallback(() => {
    if (typeof window === 'undefined' || typeof window.electronAPI === 'undefined') {
      throw new Error(
        'This app must run in Electron. Use: npm run electron:dev\n\n' +
        'This is a desktop application and requires the Electron runtime to access the SQLite database.'
      )
    }
  }, [])

  /**
   * Load suppliers from database
   */
  const loadSuppliersFromSource = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      checkElectronAPI()
      const data = await window.electronAPI.getAllSuppliers()
      setSuppliers(data)
    } catch (err) {
      console.error('Failed to load suppliers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load suppliers')
    } finally {
      setIsLoading(false)
    }
  }, [checkElectronAPI])

  /**
   * Add a new supplier
   */
  const addSupplier = useCallback(async (supplier: SupplierOutsourcing) => {
    try {
      checkElectronAPI()
      await window.electronAPI.addSupplier(supplier)
      await loadSuppliersFromSource()
    } catch (err) {
      console.error('Failed to add supplier:', err)
      throw err
    }
  }, [checkElectronAPI, loadSuppliersFromSource])

  /**
   * Update an existing supplier
   */
  const updateSupplier = useCallback(async (supplier: SupplierOutsourcing) => {
    try {
      checkElectronAPI()
      await window.electronAPI.updateSupplier(supplier)
      await loadSuppliersFromSource()
    } catch (err) {
      console.error('Failed to update supplier:', err)
      throw err
    }
  }, [checkElectronAPI, loadSuppliersFromSource])

  /**
   * Delete a supplier
   */
  const deleteSupplier = useCallback(async (referenceNumber: string) => {
    try {
      checkElectronAPI()
      await window.electronAPI.deleteSupplier(referenceNumber)
      await loadSuppliersFromSource()
    } catch (err) {
      console.error('Failed to delete supplier:', err)
      throw err
    }
  }, [checkElectronAPI, loadSuppliersFromSource])

  /**
   * Duplicate a supplier with a new reference number
   */
  const duplicateSupplier = useCallback(async (supplier: SupplierOutsourcing, status: string) => {
    try {
      checkElectronAPI()
      const newReferenceNumber = await window.electronAPI.getNextReferenceNumber()

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
  }, [checkElectronAPI, addSupplier])

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
    setSuppliers, // Keep for filtering
  }
}
