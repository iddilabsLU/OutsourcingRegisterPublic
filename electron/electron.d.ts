/**
 * Type declarations for Electron API exposed to the renderer process
 *
 * This file provides TypeScript types for window.electronAPI
 * Import this in your React components to get type safety
 */

import type { SupplierOutsourcing } from '../lib/types/supplier'
import type { EventLog, IssueRecord, CriticalMonitorRecord } from '../lib/types/reporting'

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
