export type EventType =
  | 'status_changed'
  | 'risk_changed'
  | 'criticality_changed'
  | 'criticality_assessment_changed'
  | 'assessment_date_changed'
  | 'notification_date_changed'
  | 'start_date_changed'
  | 'renewal_date_changed'
  | 'end_date_changed'
  | 'pending_cleared'
  | 'supplier_created'

export interface EventLog {
  id?: number
  type: EventType | string
  date: string
  summary: string
  oldValue?: string
  newValue?: string
  severity?: string
  supplierName?: string
  functionName?: string
  createdAt?: string
}

export type IssueStatus = 'Open' | 'In Progress' | 'Blocked' | 'Closed'

export interface IssueFollowUp {
  note: string
  date: string
}

export interface IssueRecord {
  id?: number
  title: string
  description: string
  category: string
  status: IssueStatus
  severity?: string
  owner?: string
  supplierName?: string
  functionName?: string
  dateOpened: string
  dateLastUpdate?: string
  dateClosed?: string | null
  dueDate?: string
  followUps?: IssueFollowUp[]
  createdAt?: string
}

// Critical Outsourcing Monitor - user-input fields stored separately
export interface CriticalMonitorRecord {
  id?: number
  supplierReferenceNumber: string
  contract?: string
  suitabilityAssessmentDate?: string
  auditReports?: string
  coRoAssessmentDate?: string
  createdAt?: string
  updatedAt?: string
}

// Combined view with supplier data + user-input fields
export interface CriticalMonitorView extends CriticalMonitorRecord {
  providerName: string
  functionName: string
  category: string
  criticalityAssessmentDate?: string
  riskAssessment?: string
  lastAuditDate?: string
  cloudOfficer?: string
  resourceOperator?: string
}
