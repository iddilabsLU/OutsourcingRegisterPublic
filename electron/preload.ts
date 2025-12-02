import { contextBridge, ipcRenderer } from 'electron'

/**
 * Preload script - Exposes safe Electron APIs to the renderer process
 *
 * This script runs in a sandboxed context with access to both:
 * - Electron APIs (via ipcRenderer)
 * - Renderer context (via contextBridge)
 *
 * It creates a secure bridge between the main process and the web app.
 */

// Define the API interface for TypeScript
export interface ElectronAPI {
  // System info
  ping: () => Promise<string>

  // Database operations (to be implemented in next step)
  // getSuppliers: () => Promise<SupplierOutsourcing[]>
  // addSupplier: (supplier: SupplierOutsourcing) => Promise<{ id: number }>
  // updateSupplier: (id: number, supplier: SupplierOutsourcing) => Promise<void>
  // deleteSupplier: (id: number) => Promise<void>

  // Backup/restore operations (to be implemented later)
  // backupDatabase: (path: string) => Promise<{ success: boolean; path: string }>
  // restoreDatabase: (path: string) => Promise<{ success: boolean }>

  // File operations (to be implemented later)
  // selectFile: () => Promise<string | null>
  // selectFolder: () => Promise<string | null>
}

// Expose protected methods in the render process
const electronAPI: ElectronAPI = {
  // Test IPC communication
  ping: () => ipcRenderer.invoke('ping'),

  // Database operations (placeholders for now)
  // Will be implemented when we add SQLite integration
}

// Expose the API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', electronAPI)

// Also expose Node.js process info (useful for debugging)
contextBridge.exposeInMainWorld('versions', {
  node: process.versions.node,
  chrome: process.versions.chrome,
  electron: process.versions.electron,
})

// Log that preload script loaded successfully
console.log('✅ Preload script loaded successfully')
