import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { createServer, type Server } from 'http'
import path from 'path'
import handler from 'serve-handler'
import { initializeDatabase, closeDatabase, getDatabaseStats, getDatabasePath, backupDatabase, restoreDatabase } from './database/db'
import {
  createBackupZip,
  restoreFromDatabaseBackup,
  restoreFromExcelBackup,
  type BackupResult,
  type RestoreResult,
  type RestoreOptions,
} from './database/backup'
import {
  getAllSuppliers,
  getSupplierByReference,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  getNextReferenceNumber,
  getSuppliersCount,
} from './database/suppliers'
import { addEvents, getEvents, addEvent, updateEvent, deleteEvent } from './database/events'
import { addIssue, updateIssue, deleteIssue, getIssues } from './database/issues'
import {
  getCriticalMonitorRecords,
  upsertCriticalMonitorRecord,
  deleteCriticalMonitorRecord,
} from './database/critical-monitor'
import {
  getAuthSettings,
  enableAuth,
  disableAuth,
  loginUser,
  loginWithMasterPassword,
  changeMasterPassword,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  canDeleteUser,
  changeUserPassword,
} from './database/auth'
import { buildSupplierEvents } from './database/event-builder'
import { seedDatabase } from './database/seed'
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

// __dirname is available in CommonJS (which we're compiling to)

let mainWindow: BrowserWindow | null = null
let staticServer: Server | null = null
let staticServerPort: number | null = null

/**
 * Create the main application window
 */
async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    title: 'Supplier Outsourcing Register',
    backgroundColor: '#ffffff',
    show: false, // Show after load to avoid white flash
  })

  // Load the Next.js app - opens directly to /suppliers
  const isDev = process.env.NODE_ENV === 'development'
  if (isDev) {
    await mainWindow.loadURL('http://localhost:3000/suppliers') // Next.js dev server - suppliers page
  } else {
    const outDir = app.isPackaged ? path.join(process.resourcesPath, 'out') : path.join(__dirname, '../../out')

    if (!staticServer) {
      staticServer = createServer((request, response) =>
        handler(request, response, {
          public: outDir,
        })
      )

      await new Promise<void>((resolve, reject) => {
        if (!staticServer) return reject(new Error('Failed to create static server'))
        staticServer.once('error', reject)
        staticServer.listen(0, () => resolve())
      })
    }

    const address = staticServer.address()
    const port = typeof address === 'object' && address ? address.port : 0
    staticServerPort = port
    console.log(`Static server running at http://localhost:${port}`)

    const prodUrl = `http://localhost:${port}/suppliers/`

    await mainWindow.loadURL(prodUrl)
  }

  // Helpful load event logging/fallback to ensure the window becomes visible
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('Renderer finished load')
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show()
    }
  })

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`Renderer failed to load (${errorCode}): ${errorDescription} at ${validatedURL}`)
  })

  // Safety net: if ready-to-show never fires, show after a short delay
  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      console.log('Force-showing main window after timeout')
      mainWindow.show()
    }
  }, 4000)

  // Show window when ready (prevents flash of white)
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  // Open DevTools in development
  if (isDev) {
    mainWindow.webContents.openDevTools()
  }

  // Handle window close
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

/**
 * App lifecycle events
 */

// Create window when app is ready
app.whenReady().then(async () => {
  // Initialize database before creating window
  try {
    initializeDatabase()
    const stats = getDatabaseStats()
    console.log('📊 Database stats:', stats)

    // Seed database with sample supplier if empty
    seedDatabase()
  } catch (error) {
    console.error('❌ Failed to initialize database:', error)
    // Still create window even if database fails (can show error to user)
  }

  await createWindow()

  // macOS: Re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Clean up database connection when app is quitting
app.on('before-quit', () => {
  closeDatabase()

  if (staticServer) {
    staticServer.close()
    staticServer = null
  }
})

/**
 * IPC Handlers - Database CRUD Operations
 */

// Example: Ping handler (for testing IPC)
ipcMain.handle('ping', async () => {
  return 'pong'
})

// Get all suppliers
ipcMain.handle('db:getAllSuppliers', async (): Promise<SupplierOutsourcing[]> => {
  try {
    return getAllSuppliers()
  } catch (error) {
    console.error('❌ Error getting all suppliers:', error)
    throw error
  }
})

// Get single supplier by reference number
ipcMain.handle('db:getSupplierByReference', async (_event, referenceNumber: string): Promise<SupplierOutsourcing | null> => {
  try {
    return getSupplierByReference(referenceNumber)
  } catch (error) {
    console.error('❌ Error getting supplier:', error)
    throw error
  }
})

// Add new supplier
ipcMain.handle('db:addSupplier', async (_event, supplier: SupplierOutsourcing): Promise<{ id: number; referenceNumber: string }> => {
  try {
    const result = addSupplier(supplier)
    const events = buildSupplierEvents(null, supplier)
    addEvents(events)
    return result
  } catch (error) {
    console.error('❌ Error adding supplier:', error)
    throw error
  }
})

// Update existing supplier
ipcMain.handle('db:updateSupplier', async (_event, supplier: SupplierOutsourcing): Promise<void> => {
  try {
    const existing = getSupplierByReference(supplier.referenceNumber)
    updateSupplier(supplier)
    if (existing) {
      const events = buildSupplierEvents(existing, supplier)
      addEvents(events)
    }
  } catch (error) {
    console.error('❌ Error updating supplier:', error)
    throw error
  }
})

// Delete supplier
ipcMain.handle('db:deleteSupplier', async (_event, referenceNumber: string): Promise<void> => {
  try {
    deleteSupplier(referenceNumber)
  } catch (error) {
    console.error('❌ Error deleting supplier:', error)
    throw error
  }
})

// Get next reference number
ipcMain.handle('db:getNextReferenceNumber', async (): Promise<string> => {
  try {
    return getNextReferenceNumber()
  } catch (error) {
    console.error('❌ Error getting next reference number:', error)
    throw error
  }
})

// Get suppliers count
ipcMain.handle('db:getSuppliersCount', async (): Promise<number> => {
  try {
    return getSuppliersCount()
  } catch (error) {
    console.error('❌ Error getting suppliers count:', error)
    throw error
  }
})


// Events - reporting
ipcMain.handle('events:get', async (): Promise<EventLog[]> => {
  try {
    return getEvents()
  } catch (error) {
    console.error('❌ Error getting events:', error)
    throw error
  }
})

ipcMain.handle('events:add', async (_event, event: EventLog): Promise<number> => {
  try {
    return addEvent(event)
  } catch (error) {
    console.error('❌ Error adding event:', error)
    throw error
  }
})

ipcMain.handle('events:update', async (_event, event: EventLog): Promise<void> => {
  try {
    updateEvent(event)
  } catch (error) {
    console.error('❌ Error updating event:', error)
    throw error
  }
})

ipcMain.handle('events:delete', async (_event, id: number): Promise<void> => {
  try {
    deleteEvent(id)
  } catch (error) {
    console.error('❌ Error deleting event:', error)
    throw error
  }
})

// Issues - reporting
ipcMain.handle('issues:get', async (): Promise<IssueRecord[]> => {
  try {
    return getIssues()
  } catch (error) {
    console.error('❌ Error getting issues:', error)
    throw error
  }
})

ipcMain.handle('issues:add', async (_event, issue: IssueRecord): Promise<number> => {
  try {
    return addIssue(issue)
  } catch (error) {
    console.error('❌ Error adding issue:', error)
    throw error
  }
})

ipcMain.handle('issues:update', async (_event, issue: IssueRecord): Promise<void> => {
  try {
    updateIssue(issue)
  } catch (error) {
    console.error('❌ Error updating issue:', error)
    throw error
  }
})

ipcMain.handle('issues:delete', async (_event, id: number): Promise<void> => {
  try {
    deleteIssue(id)
  } catch (error) {
    console.error('❌ Error deleting issue:', error)
    throw error
  }
})

// Critical Monitor - reporting
ipcMain.handle('criticalMonitor:get', async (): Promise<CriticalMonitorRecord[]> => {
  try {
    return getCriticalMonitorRecords()
  } catch (error) {
    console.error('❌ Error getting critical monitor records:', error)
    throw error
  }
})

ipcMain.handle('criticalMonitor:upsert', async (_event, record: CriticalMonitorRecord): Promise<number> => {
  try {
    return upsertCriticalMonitorRecord(record)
  } catch (error) {
    console.error('❌ Error upserting critical monitor record:', error)
    throw error
  }
})

ipcMain.handle('criticalMonitor:delete', async (_event, supplierReferenceNumber: string): Promise<void> => {
  try {
    deleteCriticalMonitorRecord(supplierReferenceNumber)
  } catch (error) {
    console.error('❌ Error deleting critical monitor record:', error)
    throw error
  }
})

// ============================================================================
// Authentication IPC Handlers
// ============================================================================

// Get auth settings
ipcMain.handle('auth:getSettings', async (): Promise<AuthSettings> => {
  try {
    return getAuthSettings()
  } catch (error) {
    console.error('❌ Error getting auth settings:', error)
    throw error
  }
})

// Enable authentication
ipcMain.handle('auth:enable', async (): Promise<void> => {
  try {
    enableAuth()
  } catch (error) {
    console.error('❌ Error enabling auth:', error)
    throw error
  }
})

// Disable authentication
ipcMain.handle('auth:disable', async (): Promise<void> => {
  try {
    disableAuth()
  } catch (error) {
    console.error('❌ Error disabling auth:', error)
    throw error
  }
})

// Login with username/password
ipcMain.handle('auth:login', async (_event, username: string, password: string): Promise<LoginResult> => {
  try {
    return loginUser(username, password)
  } catch (error) {
    console.error('❌ Error during login:', error)
    throw error
  }
})

// Login with master password
ipcMain.handle('auth:loginMaster', async (_event, password: string): Promise<LoginResult> => {
  try {
    return loginWithMasterPassword(password)
  } catch (error) {
    console.error('❌ Error during master login:', error)
    throw error
  }
})

// Change master password
ipcMain.handle('auth:changeMasterPassword', async (_event, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    return changeMasterPassword(currentPassword, newPassword)
  } catch (error) {
    console.error('❌ Error changing master password:', error)
    throw error
  }
})

// Change user's own password
ipcMain.handle('auth:changeUserPassword', async (_event, userId: number, currentPassword: string, newPassword: string): Promise<boolean> => {
  try {
    return changeUserPassword(userId, currentPassword, newPassword)
  } catch (error) {
    console.error('❌ Error changing user password:', error)
    throw error
  }
})

// ============================================================================
// User Management IPC Handlers
// ============================================================================

// Get all users
ipcMain.handle('users:getAll', async (): Promise<User[]> => {
  try {
    return getAllUsers()
  } catch (error) {
    console.error('❌ Error getting users:', error)
    throw error
  }
})

// Create user
ipcMain.handle('users:create', async (_event, input: CreateUserInput): Promise<User> => {
  try {
    return createUser(input)
  } catch (error) {
    console.error('❌ Error creating user:', error)
    throw error
  }
})

// Update user
ipcMain.handle('users:update', async (_event, id: number, updates: UpdateUserInput): Promise<User> => {
  try {
    return updateUser(id, updates)
  } catch (error) {
    console.error('❌ Error updating user:', error)
    throw error
  }
})

// Delete user
ipcMain.handle('users:delete', async (_event, id: number): Promise<void> => {
  try {
    deleteUser(id)
  } catch (error) {
    console.error('❌ Error deleting user:', error)
    throw error
  }
})

// Check if user can be deleted
ipcMain.handle('users:canDelete', async (_event, id: number): Promise<CanDeleteUserResult> => {
  try {
    return canDeleteUser(id)
  } catch (error) {
    console.error('❌ Error checking if user can be deleted:', error)
    throw error
  }
})

// ============================================================================
// Backup & Restore IPC Handlers
// ============================================================================

// Show save dialog for backup
ipcMain.handle('backup:showSaveDialog', async (): Promise<string | null> => {
  if (!mainWindow) return null

  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const dd = String(today.getDate()).padStart(2, '0')
  const defaultFilename = `SupplierRegister_Backup_${yyyy}-${mm}-${dd}.zip`

  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Save Backup',
    defaultPath: defaultFilename,
    filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
  })

  return result.canceled ? null : result.filePath || null
})

// Show open dialog for restore
ipcMain.handle('backup:showOpenDialog', async (): Promise<string | null> => {
  if (!mainWindow) return null

  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Backup File',
    filters: [{ name: 'ZIP Archive', extensions: ['zip'] }],
    properties: ['openFile'],
  })

  return result.canceled || result.filePaths.length === 0 ? null : result.filePaths[0]
})

// Create backup ZIP
ipcMain.handle('backup:create', async (_event, zipPath: string): Promise<BackupResult> => {
  try {
    return await createBackupZip(zipPath)
  } catch (error) {
    console.error('❌ Error creating backup:', error)
    throw error
  }
})

// Restore from database file in backup
ipcMain.handle('backup:restoreFromDatabase', async (_event, zipPath: string, options: RestoreOptions): Promise<RestoreResult> => {
  try {
    return await restoreFromDatabaseBackup(zipPath, options)
  } catch (error) {
    console.error('❌ Error restoring from database:', error)
    throw error
  }
})

// Restore from Excel files in backup
ipcMain.handle('backup:restoreFromExcel', async (_event, zipPath: string, options: RestoreOptions): Promise<RestoreResult> => {
  try {
    return await restoreFromExcelBackup(zipPath, options)
  } catch (error) {
    console.error('❌ Error restoring from Excel:', error)
    throw error
  }
})
