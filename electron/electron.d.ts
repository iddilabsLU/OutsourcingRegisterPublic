/**
 * Type declarations for Electron API exposed to the renderer process
 *
 * This file provides TypeScript types for window.electronAPI
 * Import this in your React components to get type safety
 */

import type { SupplierOutsourcing } from '../lib/types/supplier'
import type { EventLog, IssueRecord, CriticalMonitorRecord } from '../lib/types/reporting'
import type {
  AuthSettings,
  LoginResult,
  User,
  CreateUserInput,
  UpdateUserInput,
  CanDeleteUserResult,
} from '../lib/types/auth'

// Database configuration types
export interface DatabasePathInfo {
  currentPath: string
  isCustom: boolean
  defaultPath: string
}

export interface ValidatePathResult {
  valid: boolean
  error?: string
  exists: boolean
}

export interface SetPathResult {
  success: boolean
  error?: string
  requiresRestart: boolean
}

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

  // Authentication
  getAuthSettings: () => Promise<AuthSettings>
  enableAuth: () => Promise<void>
  disableAuth: () => Promise<void>
  login: (username: string, password: string) => Promise<LoginResult>
  loginWithMaster: (password: string) => Promise<LoginResult>
  changeMasterPassword: (currentPassword: string, newPassword: string) => Promise<boolean>
  changeUserPassword: (userId: number, currentPassword: string, newPassword: string) => Promise<boolean>

  // User Management
  getAllUsers: () => Promise<User[]>
  createUser: (input: CreateUserInput) => Promise<User>
  updateUser: (id: number, updates: UpdateUserInput) => Promise<User>
  deleteUser: (id: number) => Promise<void>
  canDeleteUser: (id: number) => Promise<CanDeleteUserResult>

  // Backup & Restore
  showBackupSaveDialog: () => Promise<string | null>
  showBackupOpenDialog: () => Promise<string | null>
  createBackup: (zipPath: string) => Promise<{ success: boolean; path?: string; message?: string }>
  restoreFromDatabase: (zipPath: string, options: { suppliers: boolean; events: boolean; issues: boolean; criticalMonitor: boolean }) => Promise<{ success: boolean; message?: string; stats?: { suppliers?: number; events?: number; issues?: number; criticalMonitor?: number } }>
  restoreFromExcel: (zipPath: string, options: { suppliers: boolean; events: boolean; issues: boolean; criticalMonitor: boolean }) => Promise<{ success: boolean; message?: string; stats?: { suppliers?: number; events?: number; issues?: number; criticalMonitor?: number } }>

  // Database Configuration
  getDatabasePathInfo: () => Promise<DatabasePathInfo>
  validateDatabasePath: (path: string) => Promise<ValidatePathResult>
  setDatabasePath: (path: string | null, copyData: boolean) => Promise<SetPathResult>
  showDatabaseFolderDialog: () => Promise<string | null>
  restartApp: () => Promise<void>
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
