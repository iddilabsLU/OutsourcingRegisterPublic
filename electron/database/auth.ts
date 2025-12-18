import bcrypt from 'bcryptjs'
import { getDatabase } from './db'
import type {
  User,
  CreateUserInput,
  UpdateUserInput,
  AuthSettings,
  LoginResult,
  CanDeleteUserResult,
  UserRole,
} from '../../lib/types/auth'

// Database row types (snake_case)
interface AuthSettingsRow {
  id: number
  auth_enabled: number
  master_password_hash: string
  master_password_changed: number
  updated_at: string
}

interface UserRow {
  id: number
  username: string
  password_hash: string
  display_name: string
  role: string
  is_system_user: number
  created_at: string
  updated_at: string
}

// Default admin credentials (created when auth is enabled)
const DEFAULT_ADMIN_USERNAME = 'admin'
const DEFAULT_ADMIN_PASSWORD = 'admin'
const DEFAULT_ADMIN_DISPLAY_NAME = 'Administrator'

// ============================================================================
// Password Hashing
// ============================================================================

/**
 * Hash a password using bcrypt
 */
export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

/**
 * Verify a password against a hash
 */
export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

// ============================================================================
// Auth Settings
// ============================================================================

/**
 * Get current authentication settings
 */
export function getAuthSettings(): AuthSettings {
  const db = getDatabase()
  const row = db.prepare('SELECT * FROM auth_settings WHERE id = 1').get() as AuthSettingsRow | undefined

  if (!row) {
    // This shouldn't happen if migration ran correctly
    return {
      authEnabled: false,
      masterPasswordSet: false,
    }
  }

  return {
    authEnabled: row.auth_enabled === 1,
    masterPasswordSet: row.master_password_changed === 1,
  }
}

/**
 * Enable authentication
 * Creates default admin account if no users exist
 */
export function enableAuth(): void {
  const db = getDatabase()

  // Check if any users exist
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }

  if (userCount.count === 0) {
    // Create default admin account
    const passwordHash = hashPassword(DEFAULT_ADMIN_PASSWORD)
    db.prepare(`
      INSERT INTO users (username, password_hash, display_name, role, is_system_user)
      VALUES (?, ?, ?, 'admin', 1)
    `).run(DEFAULT_ADMIN_USERNAME, passwordHash, DEFAULT_ADMIN_DISPLAY_NAME)

    console.log('Created default admin account (admin/admin)')
  }

  // Enable authentication
  db.prepare('UPDATE auth_settings SET auth_enabled = 1 WHERE id = 1').run()

  console.log('Authentication enabled')
}

/**
 * Disable authentication
 */
export function disableAuth(): void {
  const db = getDatabase()
  db.prepare('UPDATE auth_settings SET auth_enabled = 0 WHERE id = 1').run()
  console.log('Authentication disabled')
}

// ============================================================================
// Login
// ============================================================================

/**
 * Convert database row to User object
 */
function rowToUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    role: row.role as UserRole,
    isSystemUser: row.is_system_user === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Authenticate user with username and password
 */
export function loginUser(username: string, password: string): LoginResult {
  const db = getDatabase()

  // Find user by username (case-insensitive due to COLLATE NOCASE)
  const row = db.prepare(`
    SELECT * FROM users WHERE username = ?
  `).get(username) as UserRow | undefined

  if (!row) {
    return {
      success: false,
      error: 'Invalid username or password',
    }
  }

  // Verify password
  if (!verifyPassword(password, row.password_hash)) {
    return {
      success: false,
      error: 'Invalid username or password',
    }
  }

  return {
    success: true,
    user: rowToUser(row),
  }
}

/**
 * Authenticate with master password
 * Returns a virtual admin user for recovery access
 */
export function loginWithMasterPassword(password: string): LoginResult {
  const db = getDatabase()

  // Get master password hash
  const settings = db.prepare('SELECT master_password_hash FROM auth_settings WHERE id = 1').get() as { master_password_hash: string } | undefined

  if (!settings) {
    return {
      success: false,
      error: 'Authentication not configured',
    }
  }

  // Verify master password
  if (!verifyPassword(password, settings.master_password_hash)) {
    return {
      success: false,
      error: 'Invalid master password',
    }
  }

  // Return virtual admin user for master override
  return {
    success: true,
    isMasterOverride: true,
    user: {
      id: 0,
      username: 'master',
      displayName: 'Master Override',
      role: 'admin',
      isSystemUser: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  }
}

/**
 * Change the master password
 */
export function changeMasterPassword(currentPassword: string, newPassword: string): boolean {
  const db = getDatabase()

  // Get current hash
  const settings = db.prepare('SELECT master_password_hash FROM auth_settings WHERE id = 1').get() as { master_password_hash: string } | undefined

  if (!settings) {
    return false
  }

  // Verify current password
  if (!verifyPassword(currentPassword, settings.master_password_hash)) {
    return false
  }

  // Update with new hash
  const newHash = hashPassword(newPassword)
  db.prepare(`
    UPDATE auth_settings
    SET master_password_hash = ?, master_password_changed = 1
    WHERE id = 1
  `).run(newHash)

  console.log('Master password changed')
  return true
}

// ============================================================================
// User Management
// ============================================================================

/**
 * Get all users
 */
export function getAllUsers(): User[] {
  const db = getDatabase()
  const rows = db.prepare(`
    SELECT * FROM users ORDER BY created_at ASC
  `).all() as UserRow[]

  return rows.map(rowToUser)
}

/**
 * Get user by ID
 */
export function getUserById(id: number): User | null {
  const db = getDatabase()
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined

  return row ? rowToUser(row) : null
}

/**
 * Get user by username
 */
export function getUserByUsername(username: string): User | null {
  const db = getDatabase()
  const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as UserRow | undefined

  return row ? rowToUser(row) : null
}

/**
 * Create a new user
 */
export function createUser(input: CreateUserInput): User {
  const db = getDatabase()

  // Check if username already exists
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(input.username)
  if (existing) {
    throw new Error('Username already exists')
  }

  // Hash password and insert
  const passwordHash = hashPassword(input.password)
  const result = db.prepare(`
    INSERT INTO users (username, password_hash, display_name, role)
    VALUES (?, ?, ?, ?)
  `).run(input.username, passwordHash, input.displayName, input.role)

  const userId = result.lastInsertRowid as number

  // Return the created user
  const user = getUserById(userId)
  if (!user) {
    throw new Error('Failed to create user')
  }

  console.log(`User created: ${input.username} (${input.role})`)
  return user
}

/**
 * Update an existing user
 */
export function updateUser(id: number, updates: UpdateUserInput): User {
  const db = getDatabase()

  // Get current user
  const current = getUserById(id)
  if (!current) {
    throw new Error('User not found')
  }

  // Build update query dynamically
  const updateParts: string[] = []
  const params: (string | number)[] = []

  if (updates.displayName !== undefined) {
    updateParts.push('display_name = ?')
    params.push(updates.displayName)
  }

  if (updates.role !== undefined) {
    // Don't allow changing role of system user
    if (current.isSystemUser && updates.role !== 'admin') {
      throw new Error('Cannot change role of system user')
    }
    updateParts.push('role = ?')
    params.push(updates.role)
  }

  if (updates.password !== undefined && updates.password.length > 0) {
    updateParts.push('password_hash = ?')
    params.push(hashPassword(updates.password))
  }

  if (updateParts.length === 0) {
    // Nothing to update
    return current
  }

  params.push(id)

  db.prepare(`
    UPDATE users SET ${updateParts.join(', ')} WHERE id = ?
  `).run(...params)

  const updated = getUserById(id)
  if (!updated) {
    throw new Error('Failed to update user')
  }

  console.log(`User updated: ${updated.username}`)
  return updated
}

/**
 * Check if a user can be deleted
 */
export function canDeleteUser(id: number): CanDeleteUserResult {
  const db = getDatabase()

  // Get user
  const user = getUserById(id)
  if (!user) {
    return {
      canDelete: false,
      reason: 'User not found',
    }
  }

  // Cannot delete system user
  if (user.isSystemUser) {
    return {
      canDelete: false,
      reason: 'Cannot delete the system administrator account',
    }
  }

  // Check if this is the last admin
  if (user.role === 'admin') {
    const adminCount = db.prepare(`
      SELECT COUNT(*) as count FROM users WHERE role = 'admin'
    `).get() as { count: number }

    if (adminCount.count <= 1) {
      return {
        canDelete: false,
        reason: 'Cannot delete the last administrator account',
      }
    }
  }

  return { canDelete: true }
}

/**
 * Delete a user
 */
export function deleteUser(id: number): void {
  const db = getDatabase()

  // Check if can delete
  const check = canDeleteUser(id)
  if (!check.canDelete) {
    throw new Error(check.reason)
  }

  // Get username for logging
  const user = getUserById(id)
  const username = user?.username ?? 'unknown'

  db.prepare('DELETE FROM users WHERE id = ?').run(id)

  console.log(`User deleted: ${username}`)
}

/**
 * Change password for current user
 */
export function changeUserPassword(id: number, currentPassword: string, newPassword: string): boolean {
  const db = getDatabase()

  // Get user with password hash
  const row = db.prepare('SELECT password_hash FROM users WHERE id = ?').get(id) as { password_hash: string } | undefined

  if (!row) {
    return false
  }

  // Verify current password
  if (!verifyPassword(currentPassword, row.password_hash)) {
    return false
  }

  // Update password
  const newHash = hashPassword(newPassword)
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(newHash, id)

  console.log(`Password changed for user ID ${id}`)
  return true
}
