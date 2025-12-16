import type { SupplierOutsourcing } from '../../lib/types/supplier'
import type { EventLog, EventType } from '../../lib/types/reporting'

const pathEqualsPending = (pending: Set<string>, path: string) => pending.has(path)

const toStr = (value: unknown): string => {
  if (value === undefined || value === null) return ''
  return String(value)
}

const TRACKED_PENDING_FIELDS: Record<string, string> = {
  status: 'Status',
  category: 'Category',
  'criticality.isCritical': 'Criticality',
  criticalityAssessmentDate: 'Criticality assessment date',
  'criticalFields.riskAssessment.risk': 'Risk level',
  'criticalFields.riskAssessment.lastAssessmentDate': 'Risk assessment date',
  'criticalFields.regulatoryNotification.notificationDate': 'Notification date',
  'dates.startDate': 'Start date',
  'dates.nextRenewalDate': 'Next renewal date',
  'dates.endDate': 'End date',
}

const getPathValue = (obj: any, path: string): unknown => {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj)
}

export function buildSupplierEvents(
  previous: SupplierOutsourcing | null,
  current: SupplierOutsourcing
): EventLog[] {
  const events: EventLog[] = []
  const pending = new Set(current.pendingFields ?? [])
  const previousPending = new Set(previous?.pendingFields ?? [])
  const now = new Date().toISOString()
  const supplierName = current.serviceProvider?.name
  const functionName = current.functionDescription?.name

  const pushChange = (
    type: EventType,
    path: string,
    oldVal: unknown,
    newVal: unknown,
    opts?: { severity?: string; summary?: string }
  ) => {
    if (pathEqualsPending(pending, path)) return
    const oldStr = toStr(oldVal)
    const newStr = toStr(newVal)
    if (oldStr === newStr) return

    events.push({
      type,
      date: now,
      summary: opts?.summary || `${type.replace(/_/g, ' ')}: ${oldStr || 'n/a'} → ${newStr || 'n/a'}`,
      oldValue: oldStr || undefined,
      newValue: newStr || undefined,
      severity: opts?.severity,
      supplierName,
      functionName,
    })
  }

  // New supplier created
  if (!previous) {
    events.push({
      type: 'supplier_created',
      date: now,
      summary: `Supplier created${supplierName ? `: ${supplierName}` : ''}`,
      supplierName,
      functionName,
    })
    return events
  }

  // Status change
  pushChange('status_changed', 'status', previous.status, current.status, {
    summary: `Status changed: ${previous.status} → ${current.status}`,
  })

  // Risk change (critical suppliers)
  const prevRisk = previous.criticalFields?.riskAssessment?.risk
  const newRisk = current.criticalFields?.riskAssessment?.risk
  pushChange('risk_changed', 'criticalFields.riskAssessment.risk', prevRisk, newRisk, {
    summary: `Risk changed: ${prevRisk ?? 'n/a'} → ${newRisk ?? 'n/a'}`,
  })

  // Criticality flag
  pushChange(
    'criticality_changed',
    'criticality.isCritical',
    previous.criticality?.isCritical,
    current.criticality?.isCritical,
    {
      summary: `Criticality changed: ${previous.criticality?.isCritical ? 'Yes' : 'No'} → ${
        current.criticality?.isCritical ? 'Yes' : 'No'
      }`,
    }
  )

  // Criticality assessment date
  pushChange(
    'criticality_assessment_changed',
    'criticalityAssessmentDate',
    previous.criticalityAssessmentDate,
    current.criticalityAssessmentDate,
    {
      summary: `Criticality assessment date: ${previous.criticalityAssessmentDate || 'n/a'} → ${
        current.criticalityAssessmentDate || 'n/a'
      }`,
    }
  )

  // Risk assessment date (last assessment)
  pushChange(
    'assessment_date_changed',
    'criticalFields.riskAssessment.lastAssessmentDate',
    previous.criticalFields?.riskAssessment?.lastAssessmentDate,
    current.criticalFields?.riskAssessment?.lastAssessmentDate,
    {
      summary: `Risk assessment date: ${
        previous.criticalFields?.riskAssessment?.lastAssessmentDate || 'n/a'
      } → ${current.criticalFields?.riskAssessment?.lastAssessmentDate || 'n/a'}`,
    }
  )

  // Notification date
  pushChange(
    'notification_date_changed',
    'criticalFields.regulatoryNotification.notificationDate',
    previous.criticalFields?.regulatoryNotification?.notificationDate,
    current.criticalFields?.regulatoryNotification?.notificationDate,
    {
      summary: `Notification date: ${
        previous.criticalFields?.regulatoryNotification?.notificationDate || 'n/a'
      } → ${current.criticalFields?.regulatoryNotification?.notificationDate || 'n/a'}`,
    }
  )

  // Dates
  pushChange(
    'start_date_changed',
    'dates.startDate',
    previous.dates.startDate,
    current.dates.startDate,
    { summary: `Start date: ${previous.dates.startDate || 'n/a'} → ${current.dates.startDate || 'n/a'}` }
  )

  pushChange(
    'renewal_date_changed',
    'dates.nextRenewalDate',
    previous.dates.nextRenewalDate,
    current.dates.nextRenewalDate,
    {
      summary: `Next renewal date: ${previous.dates.nextRenewalDate || 'n/a'} → ${
        current.dates.nextRenewalDate || 'n/a'
      }`,
    }
  )

  pushChange(
    'end_date_changed',
    'dates.endDate',
    previous.dates.endDate,
    current.dates.endDate,
    { summary: `End date: ${previous.dates.endDate || 'n/a'} → ${current.dates.endDate || 'n/a'}` }
  )

  // Pending fields cleared (confirmation events)
  previousPending.forEach((path) => {
    if (!pending.has(path) && TRACKED_PENDING_FIELDS[path]) {
      const currentValue = getPathValue(current, path)
      const label = TRACKED_PENDING_FIELDS[path]
      events.push({
        type: 'pending_cleared',
        date: now,
        summary: `Pending cleared. ${label}: ${toStr(currentValue) || 'n/a'}`,
        oldValue: 'pending',
        newValue: toStr(currentValue) || undefined,
        supplierName,
        functionName,
      })
    }
  })

  return events
}
