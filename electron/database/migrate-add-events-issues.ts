import { getDatabase } from './db'

export function migrateAddEventsAndIssues(): void {
  const db = getDatabase()

  // Create events table if missing
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      event_date TEXT NOT NULL,
      summary TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      risk_before TEXT,
      risk_after TEXT,
      severity TEXT,
      supplier_name TEXT,
      function_name TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
    CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
  `)

  // Create issues table if missing
  db.exec(`
    CREATE TABLE IF NOT EXISTS issues (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL,
      severity TEXT,
      owner TEXT,
      supplier_name TEXT,
      function_name TEXT,
      date_opened TEXT NOT NULL,
      date_last_update TEXT NOT NULL DEFAULT (datetime('now')),
      date_closed TEXT,
      due_date TEXT,
      follow_ups TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_issues_status ON issues(status);
    CREATE INDEX IF NOT EXISTS idx_issues_severity ON issues(severity);
    CREATE INDEX IF NOT EXISTS idx_issues_due ON issues(due_date);
  `)
}
