/**
 * Type declarations for Electron API exposed to the renderer process
 *
 * This file provides TypeScript types for window.electronAPI
 * Import this in your React components to get type safety
 */

export interface ElectronAPI {
  // System info
  ping: () => Promise<string>

  // Database operations (to be implemented in next step)
  // getSuppliers: () => Promise<SupplierOutsourcing[]>
  // addSupplier: (supplier: SupplierOutsourcing) => Promise<{ id: number }>
  // updateSupplier: (id: number, supplier: SupplierOutsourcing) => Promise<void>
  // deleteSupplier: (id: number) => Promise<void>
}

export interface Versions {
  node: string
  chrome: string
  electron: string
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
    versions: Versions
  }
}

export {}
