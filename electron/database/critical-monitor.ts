import { getDatabase } from './db'
import type { CriticalMonitorRecord } from '../../lib/types/reporting'

const cleanNullable = (value?: string | null): string | null => {
  if (value === undefined || value === null) return null
  const trimmed = typeof value === 'string' ? value.trim() : value
  return trimmed === '' ? null : (trimmed as string)
}

/**
 * Get all critical monitor records
 */
export function getCriticalMonitorRecords(): CriticalMonitorRecord[] {
  const db = getDatabase()
  const rows = db.prepare('SELECT * FROM critical_monitor ORDER BY supplier_reference_number').all() as any[]

  return rows.map((row) => ({
    id: row.id,
    supplierReferenceNumber: row.supplier_reference_number,
    contract: row.contract ?? undefined,
    suitabilityAssessmentDate: row.suitability_assessment_date ?? undefined,
    auditReports: row.audit_reports ?? undefined,
    coRoAssessmentDate: row.co_ro_assessment_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }))
}

/**
 * Get a single critical monitor record by supplier reference number
 */
export function getCriticalMonitorByReference(supplierReferenceNumber: string): CriticalMonitorRecord | null {
  const db = getDatabase()
  const row = db.prepare('SELECT * FROM critical_monitor WHERE supplier_reference_number = ?').get(supplierReferenceNumber) as any

  if (!row) return null

  return {
    id: row.id,
    supplierReferenceNumber: row.supplier_reference_number,
    contract: row.contract ?? undefined,
    suitabilityAssessmentDate: row.suitability_assessment_date ?? undefined,
    auditReports: row.audit_reports ?? undefined,
    coRoAssessmentDate: row.co_ro_assessment_date ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

/**
 * Insert or update a critical monitor record (upsert)
 */
export function upsertCriticalMonitorRecord(record: CriticalMonitorRecord): number {
  const db = getDatabase()

  // Check if record exists
  const existing = db.prepare('SELECT id FROM critical_monitor WHERE supplier_reference_number = ?')
    .get(record.supplierReferenceNumber) as { id: number } | undefined

  if (existing) {
    // Update existing record
    const stmt = db.prepare(`
      UPDATE critical_monitor SET
        contract = @contract,
        suitability_assessment_date = @suitability_assessment_date,
        audit_reports = @audit_reports,
        co_ro_assessment_date = @co_ro_assessment_date
      WHERE supplier_reference_number = @supplier_reference_number
    `)

    stmt.run({
      supplier_reference_number: record.supplierReferenceNumber,
      contract: cleanNullable(record.contract),
      suitability_assessment_date: cleanNullable(record.suitabilityAssessmentDate),
      audit_reports: cleanNullable(record.auditReports),
      co_ro_assessment_date: cleanNullable(record.coRoAssessmentDate),
    })

    return existing.id
  } else {
    // Insert new record
    const stmt = db.prepare(`
      INSERT INTO critical_monitor (
        supplier_reference_number,
        contract,
        suitability_assessment_date,
        audit_reports,
        co_ro_assessment_date
      ) VALUES (
        @supplier_reference_number,
        @contract,
        @suitability_assessment_date,
        @audit_reports,
        @co_ro_assessment_date
      )
    `)

    const result = stmt.run({
      supplier_reference_number: record.supplierReferenceNumber,
      contract: cleanNullable(record.contract),
      suitability_assessment_date: cleanNullable(record.suitabilityAssessmentDate),
      audit_reports: cleanNullable(record.auditReports),
      co_ro_assessment_date: cleanNullable(record.coRoAssessmentDate),
    })

    return result.lastInsertRowid as number
  }
}

/**
 * Delete a critical monitor record by supplier reference number
 */
export function deleteCriticalMonitorRecord(supplierReferenceNumber: string): void {
  const db = getDatabase()
  db.prepare('DELETE FROM critical_monitor WHERE supplier_reference_number = ?').run(supplierReferenceNumber)
}

/**
 * Delete all critical monitor records from database (used for restore)
 */
export function deleteAllCriticalMonitorRecords(): void {
  const db = getDatabase()
  db.prepare('DELETE FROM critical_monitor').run()
}
