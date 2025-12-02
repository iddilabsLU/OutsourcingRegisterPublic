import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { initializeDatabase, closeDatabase, getDatabaseStats } from './database/db'

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
 * IPC Handlers (for future database operations)
 * These will be implemented when we add SQLite integration
 */

// Example: Ping handler (for testing IPC)
ipcMain.handle('ping', async () => {
  return 'pong'
})

// Placeholder: Database handlers (to be implemented in next step)
// ipcMain.handle('database:getSuppliers', async () => { ... })
// ipcMain.handle('database:addSupplier', async (event, supplier) => { ... })
// ipcMain.handle('database:updateSupplier', async (event, id, supplier) => { ... })
// ipcMain.handle('database:deleteSupplier', async (event, id) => { ... })
