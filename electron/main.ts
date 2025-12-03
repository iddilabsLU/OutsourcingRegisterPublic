import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { initializeDatabase, closeDatabase, getDatabaseStats } from './database/db'
import {
  getAllSuppliers,
  getSupplierByReference,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  getNextReferenceNumber,
  getSuppliersCount,
} from './database/suppliers'
import { seedDatabase } from './database/seed'
import type { SupplierOutsourcing } from '../lib/types/supplier'

// __dirname is available in CommonJS (which we're compiling to)

let mainWindow: BrowserWindow | null = null

/**
 * Create the main application window
 */
function createWindow() {
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
    show: false, // Don't show until ready
  })

  // Load the Next.js app
  const isDev = process.env.NODE_ENV === 'development'
  const url = isDev
    ? 'http://localhost:3000' // Next.js dev server
    : `file://${path.join(__dirname, '../out/index.html')}` // Production build

  mainWindow.loadURL(url)

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
app.whenReady().then(() => {
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

  createWindow()

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
    return addSupplier(supplier)
  } catch (error) {
    console.error('❌ Error adding supplier:', error)
    throw error
  }
})

// Update existing supplier
ipcMain.handle('db:updateSupplier', async (_event, supplier: SupplierOutsourcing): Promise<void> => {
  try {
    updateSupplier(supplier)
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
