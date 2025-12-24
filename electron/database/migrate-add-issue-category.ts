import { getDatabase } from './db'

export function migrateAddIssueCategory(): void {
  const db = getDatabase()

  // Check if category column already exists
  const tableInfo = db.prepare('PRAGMA table_info(issues)').all() as { name: string }[]
  const hasCategory = tableInfo.some((col) => col.name === 'category')

  if (!hasCategory) {
    // Add category column with default empty string for existing records
    db.exec(`ALTER TABLE issues ADD COLUMN category TEXT NOT NULL DEFAULT ''`)

    // Create index for category filtering
    db.exec(`CREATE INDEX IF NOT EXISTS idx_issues_category ON issues(category)`)
  }
}
