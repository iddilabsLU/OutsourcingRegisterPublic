import { contextBridge, ipcRenderer } from 'electron'
import type { SupplierOutsourcing } from '../lib/types/supplier'
import type { EventLog, IssueRecord, CriticalMonitorRecord } from '../lib/types/reporting'

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

  // Database CRUD operations
  getAllSuppliers: () => Promise<SupplierOutsourcing[]>
  getSupplierByReference: (referenceNumber: string) => Promise<SupplierOutsourcing | null>
  addSupplier: (supplier: SupplierOutsourcing) => Promise<{ id: number; referenceNumber: string }>
  updateSupplier: (supplier: SupplierOutsourcing) => Promise<void>
  deleteSupplier: (referenceNumber: string) => Promise<void>
  getNextReferenceNumber: () => Promise<string>
  getSuppliersCount: () => Promise<number>

  // Reporting
  getEvents: () => Promise<EventLog[]>
  addEvent: (event: EventLog) => Promise<number>
  updateEvent: (event: EventLog) => Promise<void>
  deleteEvent: (id: number) => Promise<void>
  getIssues: () => Promise<IssueRecord[]>
  addIssue: (issue: IssueRecord) => Promise<number>
  updateIssue: (issue: IssueRecord) => Promise<void>
  deleteIssue: (id: number) => Promise<void>

  // Critical Monitor
  getCriticalMonitorRecords: () => Promise<CriticalMonitorRecord[]>
  upsertCriticalMonitorRecord: (record: CriticalMonitorRecord) => Promise<number>
  deleteCriticalMonitorRecord: (supplierReferenceNumber: string) => Promise<void>

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

  // Database CRUD operations
  getAllSuppliers: () => ipcRenderer.invoke('db:getAllSuppliers'),
  getSupplierByReference: (referenceNumber: string) => ipcRenderer.invoke('db:getSupplierByReference', referenceNumber),
  addSupplier: (supplier: SupplierOutsourcing) => ipcRenderer.invoke('db:addSupplier', supplier),
  updateSupplier: (supplier: SupplierOutsourcing) => ipcRenderer.invoke('db:updateSupplier', supplier),
  deleteSupplier: (referenceNumber: string) => ipcRenderer.invoke('db:deleteSupplier', referenceNumber),
  getNextReferenceNumber: () => ipcRenderer.invoke('db:getNextReferenceNumber'),
  getSuppliersCount: () => ipcRenderer.invoke('db:getSuppliersCount'),

  // Reporting
  getEvents: () => ipcRenderer.invoke('events:get'),
  addEvent: (event: EventLog) => ipcRenderer.invoke('events:add', event),
  updateEvent: (event: EventLog) => ipcRenderer.invoke('events:update', event),
  deleteEvent: (id: number) => ipcRenderer.invoke('events:delete', id),
  getIssues: () => ipcRenderer.invoke('issues:get'),
  addIssue: (issue: IssueRecord) => ipcRenderer.invoke('issues:add', issue),
  updateIssue: (issue: IssueRecord) => ipcRenderer.invoke('issues:update', issue),
  deleteIssue: (id: number) => ipcRenderer.invoke('issues:delete', id),

  // Critical Monitor
  getCriticalMonitorRecords: () => ipcRenderer.invoke('criticalMonitor:get'),
  upsertCriticalMonitorRecord: (record: CriticalMonitorRecord) => ipcRenderer.invoke('criticalMonitor:upsert', record),
  deleteCriticalMonitorRecord: (supplierReferenceNumber: string) => ipcRenderer.invoke('criticalMonitor:delete', supplierReferenceNumber),
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
