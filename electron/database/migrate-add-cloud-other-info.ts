import { getDatabase } from './db'

/**
 * Migration: Add cloud_other_information column
 * Adds the missing cloud_other_information column to support Feature 1
 */
export function migrateAddCloudOtherInformation(): void {
  const db = getDatabase()

  try {
    // Check if column already exists
    const tableInfo = db.prepare('PRAGMA table_info(suppliers)').all() as Array<{ name: string }>
    const columnExists = tableInfo.some((col) => col.name === 'cloud_other_information')

    if (columnExists) {
      console.log('✓ Column cloud_other_information already exists. Skipping migration.')
      return
    }

    // Add the column
    db.prepare('ALTER TABLE suppliers ADD COLUMN cloud_other_information TEXT').run()
    console.log('✓ Added column cloud_other_information to suppliers table')

    // Update schema version
    const currentVersion = (
      db.prepare('SELECT MAX(version) as version FROM schema_version').get() as { version: number }
    ).version

    const newVersion = currentVersion + 1
    db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(newVersion)
    console.log(`✓ Updated schema version to ${newVersion}`)
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  }
}
