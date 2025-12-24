import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { migrateAddCloudOtherInformation } from './migrate-add-cloud-other-info'
import { migrateAddEventsAndIssues } from './migrate-add-events-issues'
import { migrateAddIssueFollowups } from './migrate-add-issue-followups'
import { migrateAddIssueCategory } from './migrate-add-issue-category'
import { migrateAddCriticalMonitor } from './migrate-add-critical-monitor'
import { migrateAddAuth } from './migrate-add-auth'
import { getEffectiveDatabasePath, getDefaultDatabasePath } from './config'

/**
 * Database module for CSSF Supplier Outsourcing Register
 * Uses better-sqlite3 for fast, synchronous SQLite access
 */

let db: Database.Database | null = null

/**
 * Get the database file path
 * Uses custom path from config if set, otherwise uses default
 */
export function getDatabasePath(): string {
  return getEffectiveDatabasePath()
}

/**
 * Get the default database path (for display in UI)
 */
export { getDefaultDatabasePath }

/**
 * Initialize the database
 * - Creates database file if it doesn't exist
 * - Runs schema.sql to create tables
 * - Sets up indexes and triggers
 */
export function initializeDatabase(): Database.Database {
  const dbPath = getDatabasePath()

  console.log(`📁 Database path: ${dbPath}`)

  // Open database connection (creates file if doesn't exist)
  db = new Database(dbPath, {
    verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
  })

  // Enable foreign keys (SQLite doesn't enable by default)
  db.pragma('foreign_keys = ON')

  // Set journal mode to WAL for better concurrent access
  // (Allows multiple readers while writing)
  db.pragma('journal_mode = WAL')

  // Read and execute schema.sql
  const schemaPath = path.join(__dirname, 'schema.sql')
  const schema = fs.readFileSync(schemaPath, 'utf-8')

  // Execute the entire schema as a single script
  // better-sqlite3 can handle multi-statement exec
  try {
    db.exec(schema)
  } catch (error) {
    console.error(`❌ Error executing schema:`, error)
    throw error
  }

  console.log('✅ Database initialized successfully')

  // Run migrations after schema is set up
  runMigrations()

  return db
}

/**
 * Run all pending database migrations
 */
function runMigrations(): void {
  // Run migrations in order
  migrateAddCloudOtherInformation()
  migrateAddEventsAndIssues()
  migrateAddIssueFollowups()
  migrateAddIssueCategory()
  migrateAddCriticalMonitor()
  migrateAddAuth()
}

/**
 * Get the database connection
 * Throws error if database is not initialized
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.')
  }
  return db
}

/**
 * Close the database connection
 * Should be called when app is shutting down
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
    console.log('🔒 Database connection closed')
  }
}

/**
 * Get database statistics
 * Useful for debugging and dashboard
 */
export function getDatabaseStats(): {
  path: string
  size: number
  totalSuppliers: number
  schemaVersion: number
} {
  const dbPath = getDatabasePath()
  const stats = fs.statSync(dbPath)
  const database = getDatabase()

  const totalSuppliers = database
    .prepare('SELECT COUNT(*) as count FROM suppliers')
    .get() as { count: number }

  const schemaVersionRow = database
    .prepare('SELECT MAX(version) as version FROM schema_version')
    .get() as { version: number }

  return {
    path: dbPath,
    size: stats.size,
    totalSuppliers: totalSuppliers.count,
    schemaVersion: schemaVersionRow.version,
  }
}

/**
 * Backup database to specified path
 * @param destinationPath - Full path where backup should be saved
 */
export function backupDatabase(destinationPath: string): void {
  const dbPath = getDatabasePath()

  // Close database before backup (ensures all writes are flushed)
  if (db) {
    db.close()
  }

  // Copy database file
  fs.copyFileSync(dbPath, destinationPath)

  // Reopen database
  db = new Database(dbPath)
  db.pragma('foreign_keys = ON')
  db.pragma('journal_mode = WAL')

  console.log(`✅ Database backed up to: ${destinationPath}`)
}

/**
 * Restore database from backup file
 * @param backupPath - Full path to backup file
 */
export function restoreDatabase(backupPath: string): void {
  const dbPath = getDatabasePath()

  // Close current database
  if (db) {
    db.close()
    db = null
  }

  // Replace current database with backup
  fs.copyFileSync(backupPath, dbPath)

  // Reopen database
  db = new Database(dbPath)
  db.pragma('foreign_keys = ON')
  db.pragma('journal_mode = WAL')

  console.log(`✅ Database restored from: ${backupPath}`)
}

/**
 * Check if database exists
 */
export function databaseExists(): boolean {
  const dbPath = getDatabasePath()
  return fs.existsSync(dbPath)
}

/**
 * Copy database to a new location
 * Used for data migration when changing database path
 * @param destinationPath - Full path where database should be copied
 */
export function copyDatabaseTo(destinationPath: string): void {
  const currentPath = getDatabasePath()

  // Close database before copying
  if (db) {
    db.close()
    db = null
  }

  // Copy database file
  fs.copyFileSync(currentPath, destinationPath)

  // Also copy WAL and SHM files if they exist (for WAL mode)
  const walPath = currentPath + '-wal'
  const shmPath = currentPath + '-shm'

  if (fs.existsSync(walPath)) {
    fs.copyFileSync(walPath, destinationPath + '-wal')
  }
  if (fs.existsSync(shmPath)) {
    fs.copyFileSync(shmPath, destinationPath + '-shm')
  }

  console.log(`Database copied from ${currentPath} to ${destinationPath}`)
}

// Export types for better TypeScript support
export type { Database } from 'better-sqlite3'
