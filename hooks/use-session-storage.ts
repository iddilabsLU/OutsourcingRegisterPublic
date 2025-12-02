import { useState, useEffect } from "react"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { loadSuppliers, saveSuppliers } from "@/lib/utils/session-storage"

/**
 * React hook for managing suppliers with automatic sessionStorage persistence
 *
 * @returns [suppliers, setSuppliers] - State and setter with automatic persistence
 *
 * @example
 * ```tsx
 * const [suppliers, setSuppliers] = useSessionStorage()
 *
 * // Add supplier
 * setSuppliers([...suppliers, newSupplier])
 *
 * // Changes automatically saved to sessionStorage
 * ```
 */
export function useSessionStorage() {
  const [suppliers, setSuppliers] = useState<SupplierOutsourcing[]>([])
  const [mounted, setMounted] = useState(false)

  // Load suppliers from sessionStorage on mount
  useEffect(() => {
    setSuppliers(loadSuppliers())
    setMounted(true)
  }, [])

  // Save to sessionStorage whenever suppliers change
  useEffect(() => {
    if (mounted) {
      saveSuppliers(suppliers)
    }
  }, [suppliers, mounted])

  return [suppliers, setSuppliers] as const
}
