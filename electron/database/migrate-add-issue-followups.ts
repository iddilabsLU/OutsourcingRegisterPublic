import { getDatabase } from './db'

export function migrateAddIssueFollowups(): void {
  const db = getDatabase()
  const hasColumn = db
    .prepare("SELECT 1 FROM pragma_table_info('issues') WHERE name = 'follow_ups'")
    .get() as { 1?: number } | undefined

  if (!hasColumn) {
    db.exec(`
      ALTER TABLE issues ADD COLUMN follow_ups TEXT;
    `)
  }
}
