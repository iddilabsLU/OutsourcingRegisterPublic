import { getDatabase } from './db'
import type { IssueRecord, IssueFollowUp } from '../../lib/types/reporting'

const cleanNullable = (value?: string | null): string | null => {
  if (value === undefined || value === null) return null
  const trimmed = typeof value === 'string' ? value.trim() : value
  return trimmed === '' ? null : (trimmed as string)
}

export function addIssue(issue: IssueRecord): number {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO issues (
      title,
      description,
      status,
      severity,
      owner,
      supplier_name,
      function_name,
      date_opened,
      date_last_update,
      date_closed,
      due_date,
      follow_ups
    ) VALUES (
      @title,
      @description,
      @status,
      @severity,
      @owner,
      @supplier_name,
      @function_name,
      @date_opened,
      @date_last_update,
      @date_closed,
      @due_date,
      @follow_ups
    )
  `)

  const now = new Date().toISOString()
  const result = stmt.run({
    title: issue.title,
    description: issue.description,
    status: issue.status,
    severity: cleanNullable(issue.severity),
    owner: cleanNullable(issue.owner),
    supplier_name: cleanNullable(issue.supplierName),
    function_name: cleanNullable(issue.functionName),
    date_opened: issue.dateOpened && issue.dateOpened.trim() ? issue.dateOpened : now,
    date_last_update: issue.dateLastUpdate && issue.dateLastUpdate.trim() ? issue.dateLastUpdate : now,
    date_closed: cleanNullable(issue.dateClosed ?? null),
    due_date: cleanNullable(issue.dueDate ?? null),
    follow_ups: serializeFollowups(issue.followUps),
  })

  return result.lastInsertRowid as number
}

export function updateIssue(issue: IssueRecord): void {
  if (!issue.id) throw new Error('Issue id is required to update')
  const db = getDatabase()
  const stmt = db.prepare(`
    UPDATE issues SET
      title = @title,
      description = @description,
      status = @status,
      severity = @severity,
      owner = @owner,
      supplier_name = @supplier_name,
      function_name = @function_name,
      date_last_update = @date_last_update,
      date_closed = @date_closed,
      due_date = @due_date,
      follow_ups = @follow_ups
    WHERE id = @id
  `)

  const now = new Date().toISOString()

  const result = stmt.run({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    status: issue.status,
    severity: cleanNullable(issue.severity),
    owner: cleanNullable(issue.owner),
    supplier_name: cleanNullable(issue.supplierName),
    function_name: cleanNullable(issue.functionName),
    date_last_update: issue.dateLastUpdate && issue.dateLastUpdate.trim() ? issue.dateLastUpdate : now,
    date_closed: cleanNullable(issue.dateClosed ?? null),
    due_date: cleanNullable(issue.dueDate ?? null),
    follow_ups: serializeFollowups(issue.followUps),
  })

  if (result.changes === 0) {
    throw new Error(`Issue with id ${issue.id} not found`)
  }
}

export function deleteIssue(id: number): void {
  const db = getDatabase()
  const result = db.prepare('DELETE FROM issues WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new Error(`Issue with id ${id} not found`)
  }
}

export function getIssues(): IssueRecord[] {
  const db = getDatabase()
  const rows = db.prepare('SELECT * FROM issues ORDER BY date_opened DESC, id DESC').all() as any[]

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status,
    severity: row.severity ?? undefined,
    owner: row.owner ?? undefined,
    supplierName: row.supplier_name ?? undefined,
    functionName: row.function_name ?? undefined,
    dateOpened: row.date_opened,
    dateLastUpdate: row.date_last_update,
    dateClosed: row.date_closed ?? undefined,
    dueDate: row.due_date ?? undefined,
    followUps: parseFollowups(row.follow_ups),
    createdAt: row.created_at,
  }))
}

function serializeFollowups(followUps?: IssueFollowUp[]): string | null {
  if (!followUps || followUps.length === 0) return null
  return JSON.stringify(followUps)
}

function parseFollowups(value?: unknown): IssueFollowUp[] | undefined {
  if (!value) return undefined
  try {
    const parsed = JSON.parse(String(value))
    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => {
          if (item && typeof item.note === 'string' && typeof item.date === 'string') return { note: item.note, date: item.date }
          return null
        })
        .filter(Boolean) as IssueFollowUp[]
    }
  } catch {
    // ignore parse errors; treat as undefined
  }
  return undefined
}
