import { getDatabase } from './db'
import type { EventLog } from '../../lib/types/reporting'

export function addEvent(event: EventLog): number {
  const db = getDatabase()
  const stmt = db.prepare(`
    INSERT INTO events (
      type,
      event_date,
      summary,
      old_value,
      new_value,
      risk_before,
      risk_after,
      severity,
      supplier_name,
      function_name
    ) VALUES (
      @type,
      @event_date,
      @summary,
      @old_value,
      @new_value,
      @risk_before,
      @risk_after,
      @severity,
      @supplier_name,
      @function_name
    )
  `)

  const result = stmt.run({
    type: event.type,
    event_date: event.date,
    summary: event.summary,
    old_value: event.oldValue ?? null,
    new_value: event.newValue ?? null,
    risk_before: event.riskBefore ?? null,
    risk_after: event.riskAfter ?? null,
    severity: event.severity ?? null,
    supplier_name: event.supplierName ?? null,
    function_name: event.functionName ?? null,
  })

  return result.lastInsertRowid as number
}

export function updateEvent(event: EventLog): void {
  if (!event.id) throw new Error('Event id is required to update')

  const db = getDatabase()
  const stmt = db.prepare(`
    UPDATE events SET
      type = @type,
      event_date = @event_date,
      summary = @summary,
      old_value = @old_value,
      new_value = @new_value,
      risk_before = @risk_before,
      risk_after = @risk_after,
      severity = @severity,
      supplier_name = @supplier_name,
      function_name = @function_name
    WHERE id = @id
  `)

  const result = stmt.run({
    id: event.id,
    type: event.type,
    event_date: event.date,
    summary: event.summary,
    old_value: event.oldValue ?? null,
    new_value: event.newValue ?? null,
    risk_before: event.riskBefore ?? null,
    risk_after: event.riskAfter ?? null,
    severity: event.severity ?? null,
    supplier_name: event.supplierName ?? null,
    function_name: event.functionName ?? null,
  })

  if (result.changes === 0) {
    throw new Error(`Event with id ${event.id} not found`)
  }
}

export function deleteEvent(id: number): void {
  const db = getDatabase()
  const result = db.prepare('DELETE FROM events WHERE id = ?').run(id)
  if (result.changes === 0) {
    throw new Error(`Event with id ${id} not found`)
  }
}

export function addEvents(events: EventLog[]): void {
  if (events.length === 0) return
  const db = getDatabase()
  const insert = db.prepare(`
    INSERT INTO events (
      type,
      event_date,
      summary,
      old_value,
      new_value,
      risk_before,
      risk_after,
      severity,
      supplier_name,
      function_name
    ) VALUES (
      @type,
      @event_date,
      @summary,
      @old_value,
      @new_value,
      @risk_before,
      @risk_after,
      @severity,
      @supplier_name,
      @function_name
    )
  `)

  const transaction = db.transaction((rows: EventLog[]) => {
    for (const row of rows) {
      insert.run({
        type: row.type,
        event_date: row.date,
        summary: row.summary,
        old_value: row.oldValue ?? null,
        new_value: row.newValue ?? null,
        risk_before: row.riskBefore ?? null,
        risk_after: row.riskAfter ?? null,
        severity: row.severity ?? null,
        supplier_name: row.supplierName ?? null,
        function_name: row.functionName ?? null,
      })
    }
  })

  transaction(events)
}

export function getEvents(): EventLog[] {
  const db = getDatabase()
  const rows = db.prepare('SELECT * FROM events ORDER BY event_date DESC, id DESC').all() as any[]

  return rows.map((row) => ({
    id: row.id,
    type: row.type,
    date: row.event_date,
    summary: row.summary,
    oldValue: row.old_value ?? undefined,
    newValue: row.new_value ?? undefined,
    riskBefore: row.risk_before ?? undefined,
    riskAfter: row.risk_after ?? undefined,
    severity: row.severity ?? undefined,
    supplierName: row.supplier_name ?? undefined,
    functionName: row.function_name ?? undefined,
    createdAt: row.created_at,
  }))
}
