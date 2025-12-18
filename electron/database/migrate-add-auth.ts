import { getDatabase } from './db'
import bcrypt from 'bcryptjs'

// Default master password (user should change this immediately)
const DEFAULT_MASTER_PASSWORD = 'master123'

export function migrateAddAuth(): void {
  const db = getDatabase()

  // Check if auth_settings table already exists
  const authSettingsExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='auth_settings'
  `).get()

  if (!authSettingsExists) {
    console.log('Creating auth_settings table...')

    // Hash the default master password
    const masterPasswordHash = bcrypt.hashSync(DEFAULT_MASTER_PASSWORD, 10)

    // Create auth_settings table (single row enforced by CHECK constraint)
    db.exec(`
      CREATE TABLE IF NOT EXISTS auth_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        auth_enabled INTEGER NOT NULL DEFAULT 0 CHECK(auth_enabled IN (0, 1)),
        master_password_hash TEXT NOT NULL,
        master_password_changed INTEGER NOT NULL DEFAULT 0 CHECK(master_password_changed IN (0, 1)),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `)

    // Insert default settings with hashed master password
    db.prepare(`
      INSERT INTO auth_settings (id, auth_enabled, master_password_hash, master_password_changed)
      VALUES (1, 0, ?, 0)
    `).run(masterPasswordHash)

    // Create trigger for updated_at
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_auth_settings_timestamp
      AFTER UPDATE ON auth_settings
      FOR EACH ROW
      BEGIN
        UPDATE auth_settings SET updated_at = datetime('now') WHERE id = NEW.id;
      END;
    `)

    console.log('  auth_settings table created with default master password')
  }

  // Check if users table already exists
  const usersExists = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type='table' AND name='users'
  `).get()

  if (!usersExists) {
    console.log('Creating users table...')

    // Create users table
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE COLLATE NOCASE,
        password_hash TEXT NOT NULL,
        display_name TEXT NOT NULL,
        role TEXT NOT NULL CHECK(role IN ('admin', 'editor', 'viewer')),
        is_system_user INTEGER NOT NULL DEFAULT 0 CHECK(is_system_user IN (0, 1)),
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `)

    // Create trigger for updated_at
    db.exec(`
      CREATE TRIGGER IF NOT EXISTS update_users_timestamp
      AFTER UPDATE ON users
      FOR EACH ROW
      BEGIN
        UPDATE users SET updated_at = datetime('now') WHERE id = NEW.id;
      END;
    `)

    console.log('  users table created')
  }
}
