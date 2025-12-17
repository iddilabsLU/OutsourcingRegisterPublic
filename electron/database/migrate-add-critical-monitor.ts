import { getDatabase } from './db'

export function migrateAddCriticalMonitor(): void {
  const db = getDatabase()

  // Create critical_monitor table if missing
  db.exec(`
    CREATE TABLE IF NOT EXISTS critical_monitor (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      supplier_reference_number TEXT NOT NULL UNIQUE,
      contract TEXT,
      suitability_assessment_date TEXT,
      audit_reports TEXT,
      co_ro_assessment_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (supplier_reference_number) REFERENCES suppliers(reference_number) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_critical_monitor_supplier ON critical_monitor(supplier_reference_number);
  `)

  // Create trigger for updated_at
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_critical_monitor_timestamp
    AFTER UPDATE ON critical_monitor
    FOR EACH ROW
    BEGIN
      UPDATE critical_monitor SET updated_at = datetime('now') WHERE id = NEW.id;
    END;
  `)
}
