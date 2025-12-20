import path from "path"
import fs from "fs"
import { app } from "electron"

/**
 * App configuration module
 * Manages configuration stored as JSON in AppData (separate from database)
 */

export interface AppConfig {
  databasePath: string | null // null = use default
}

const DEFAULT_CONFIG: AppConfig = {
  databasePath: null,
}

/**
 * Get the config file path based on environment
 * - Development: ./data/app-config.json
 * - Production: %APPDATA%/OutsourcingRegister/app-config.json
 */
export function getConfigPath(): string {
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged

  if (isDev) {
    const projectRoot = process.cwd()
    const configDir = path.join(projectRoot, "data")

    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    return path.join(configDir, "app-config.json")
  } else {
    const userDataPath = app.getPath("userData")

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }

    return path.join(userDataPath, "app-config.json")
  }
}

/**
 * Read current config from file
 * Creates default config if file doesn't exist
 */
export function readConfig(): AppConfig {
  const configPath = getConfigPath()

  try {
    if (fs.existsSync(configPath)) {
      const content = fs.readFileSync(configPath, "utf-8")
      const parsed = JSON.parse(content)
      // Merge with defaults to handle missing keys
      return { ...DEFAULT_CONFIG, ...parsed }
    }
  } catch (error) {
    console.error("Error reading config file, using defaults:", error)
  }

  // Return defaults and create file
  writeConfig(DEFAULT_CONFIG)
  return DEFAULT_CONFIG
}

/**
 * Write config to file
 */
export function writeConfig(config: AppConfig): void {
  const configPath = getConfigPath()

  try {
    const content = JSON.stringify(config, null, 2)
    fs.writeFileSync(configPath, content, "utf-8")
    console.log("Config saved to:", configPath)
  } catch (error) {
    console.error("Error writing config file:", error)
    throw error
  }
}

/**
 * Get the default database path (original logic from db.ts)
 * - Development: ./data/suppliers.db
 * - Production: %APPDATA%/OutsourcingRegister/data.db
 */
export function getDefaultDatabasePath(): string {
  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged

  if (isDev) {
    const projectRoot = process.cwd()
    const dbDir = path.join(projectRoot, "data")

    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }

    return path.join(dbDir, "suppliers.db")
  } else {
    const userDataPath = app.getPath("userData")

    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true })
    }

    return path.join(userDataPath, "data.db")
  }
}

/**
 * Get the effective database path (custom or default)
 */
export function getEffectiveDatabasePath(): string {
  const config = readConfig()

  if (config.databasePath) {
    // Ensure directory exists for custom path
    const dbDir = path.dirname(config.databasePath)
    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true })
      } catch (error) {
        console.error("Failed to create custom database directory:", error)
        // Fall back to default
        return getDefaultDatabasePath()
      }
    }
    return config.databasePath
  }

  return getDefaultDatabasePath()
}

/**
 * Validate a database path is accessible and writable
 * @param dbPath Full path to the database file (including filename)
 * @returns Validation result with error message if invalid
 */
export function validateDatabasePath(dbPath: string): {
  valid: boolean
  error?: string
  exists: boolean
} {
  try {
    // Check if it's an absolute path
    if (!path.isAbsolute(dbPath)) {
      return { valid: false, error: "Path must be absolute", exists: false }
    }

    // Check if filename ends with .db
    if (!dbPath.toLowerCase().endsWith(".db")) {
      return { valid: false, error: "Database file must end with .db", exists: false }
    }

    const dbDir = path.dirname(dbPath)

    // Check if directory exists (or try to create it)
    if (!fs.existsSync(dbDir)) {
      try {
        fs.mkdirSync(dbDir, { recursive: true })
      } catch (mkdirError) {
        return {
          valid: false,
          error: `Cannot create directory: ${(mkdirError as Error).message}`,
          exists: false,
        }
      }
    }

    // Check if directory is writable by creating a temp file
    const testFile = path.join(dbDir, `.write-test-${Date.now()}.tmp`)
    try {
      fs.writeFileSync(testFile, "test")
      fs.unlinkSync(testFile)
    } catch (writeError) {
      return {
        valid: false,
        error: `Directory is not writable: ${(writeError as Error).message}`,
        exists: false,
      }
    }

    // Check if database file already exists
    const exists = fs.existsSync(dbPath)

    return { valid: true, exists }
  } catch (error) {
    return {
      valid: false,
      error: `Validation failed: ${(error as Error).message}`,
      exists: false,
    }
  }
}

/**
 * Set a custom database path in config
 * Note: This only updates the config file. App restart is required for change to take effect.
 */
export function setDatabasePath(newPath: string | null): void {
  const config = readConfig()
  config.databasePath = newPath
  writeConfig(config)
}

/**
 * Check if the current config uses a custom path
 */
export function isUsingCustomPath(): boolean {
  const config = readConfig()
  return config.databasePath !== null
}
