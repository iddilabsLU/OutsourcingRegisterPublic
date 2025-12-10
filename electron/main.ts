import { app, BrowserWindow, ipcMain } from 'electron'
import { createServer, type Server } from 'http'
import path from 'path'
import handler from 'serve-handler'
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
