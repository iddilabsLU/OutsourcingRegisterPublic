/**
 * Backup and Restore module for Supplier Outsourcing Register
 * Handles creating backup ZIPs and restoring from them
 */

import fs from 'fs'
import path from 'path'
import archiver from 'archiver'
import AdmZip from 'adm-zip'
import * as XLSX from 'xlsx'
import { getDatabasePath, restoreDatabase, getDatabase, initializeDatabase } from './db'
import { getAllSuppliers, addSupplier, deleteAllSuppliers } from './suppliers'
import { getEvents, deleteAllEvents, addEvent } from './events'
import { getIssues, deleteAllIssues, addIssue } from './issues'
import { getCriticalMonitorRecords, deleteAllCriticalMonitorRecords, upsertCriticalMonitorRecord } from './critical-monitor'
import type { SupplierOutsourcing, OutsourcingStatus, CloudServiceModel, DeploymentModel } from '../../lib/types/supplier'
import type { EventLog, IssueRecord, CriticalMonitorRecord } from '../../lib/types/reporting'

export interface BackupResult {
  success: boolean
  message: string
  path?: string
  files?: string[]
}

export interface RestoreResult {
  success: boolean
  message: string
  stats?: {
    suppliers: number
    events: number
    issues: number
    criticalMonitor: number
  }
}

export interface RestoreOptions {
  suppliers: boolean
  events: boolean
  issues: boolean
  criticalMonitor: boolean
}

/**
 * Create a backup ZIP file containing database and Excel exports
 */
export async function createBackupZip(zipPath: string): Promise<BackupResult> {
  const tempDir = path.join(path.dirname(zipPath), '.backup-temp-' + Date.now())

  try {
    // Create temp directory
    fs.mkdirSync(tempDir, { recursive: true })

    // 1. Copy database file
    const dbPath = getDatabasePath()
    const dbBackupPath = path.join(tempDir, 'database.db')

    // Close, copy, reopen database to ensure clean copy
    const db = getDatabase()
    db.close()
    fs.copyFileSync(dbPath, dbBackupPath)
    initializeDatabase()

    // 2. Generate Excel files
    const suppliers = getAllSuppliers()
    const events = getEvents()
    const issues = getIssues()
    const criticalMonitor = getCriticalMonitorRecords()

    // Suppliers Excel
    const suppliersExcel = generateSuppliersExcel(suppliers)
    fs.writeFileSync(path.join(tempDir, 'Suppliers.xlsx'), suppliersExcel)

    // Events Excel
    const eventsExcel = generateEventsExcel(events)
    fs.writeFileSync(path.join(tempDir, 'Events.xlsx'), eventsExcel)

    // Issues Excel
    const issuesExcel = generateIssuesExcel(issues)
    fs.writeFileSync(path.join(tempDir, 'Issues.xlsx'), issuesExcel)

    // Critical Monitor Excel
    const criticalExcel = generateCriticalMonitorExcel(criticalMonitor, suppliers)
    fs.writeFileSync(path.join(tempDir, 'CriticalMonitor.xlsx'), criticalExcel)

    // 3. Create ZIP archive
    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipPath)
      const archive = archiver('zip', { zlib: { level: 9 } })

      output.on('close', () => resolve())
      archive.on('error', (err) => reject(err))

      archive.pipe(output)
      archive.directory(tempDir, false)
      archive.finalize()
    })

    // 4. Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true })

    return {
      success: true,
      message: 'Backup created successfully',
      path: zipPath,
      files: ['database.db', 'Suppliers.xlsx', 'Events.xlsx', 'Issues.xlsx', 'CriticalMonitor.xlsx'],
    }
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    throw error
  }
}

/**
 * Restore from database file in backup ZIP
 * If all options are selected, restores the entire database file (fastest)
 * If selective, reads from backup database and imports only selected tables
 */
export async function restoreFromDatabaseBackup(zipPath: string, options: RestoreOptions): Promise<RestoreResult> {
  const tempDir = path.join(path.dirname(zipPath), '.restore-temp-' + Date.now())
  const allSelected = options.suppliers && options.events && options.issues && options.criticalMonitor

  try {
    // Extract ZIP
    const zip = new AdmZip(zipPath)
    zip.extractAllTo(tempDir, true)

    // Check for database file
    const dbBackupPath = path.join(tempDir, 'database.db')
    if (!fs.existsSync(dbBackupPath)) {
      throw new Error('Backup does not contain a database file')
    }

    let suppliersCount = 0
    let eventsCount = 0
    let issuesCount = 0
    let criticalCount = 0

    if (allSelected) {
      // Restore entire database (fastest)
      restoreDatabase(dbBackupPath)

      // Get stats
      suppliersCount = getAllSuppliers().length
      eventsCount = getEvents().length
      issuesCount = getIssues().length
      criticalCount = getCriticalMonitorRecords().length
    } else {
      // Selective restore: read from backup database and import
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Database = require('better-sqlite3')
      const backupDb = new Database(dbBackupPath, { readonly: true })

      try {
        // Clear and import selected tables
        if (options.criticalMonitor) {
          deleteAllCriticalMonitorRecords()
          const records = backupDb.prepare('SELECT * FROM critical_monitor').all()
          for (const r of records) {
            upsertCriticalMonitorRecord({
              supplierReferenceNumber: r.supplier_reference_number,
              contract: r.contract ?? undefined,
              suitabilityAssessmentDate: r.suitability_assessment_date ?? undefined,
              auditReports: r.audit_reports ?? undefined,
              coRoAssessmentDate: r.co_ro_assessment_date ?? undefined,
            })
            criticalCount++
          }
        }

        if (options.issues) {
          deleteAllIssues()
          const records = backupDb.prepare('SELECT * FROM issues').all()
          for (const r of records) {
            addIssue({
              title: r.title,
              description: r.description,
              category: r.category ?? '',
              status: r.status,
              severity: r.severity ?? undefined,
              owner: r.owner ?? undefined,
              supplierName: r.supplier_name ?? undefined,
              functionName: r.function_name ?? undefined,
              dateOpened: r.date_opened,
              dateLastUpdate: r.date_last_update ?? undefined,
              dateClosed: r.date_closed ?? null,
              dueDate: r.due_date ?? undefined,
              followUps: r.follow_ups ? JSON.parse(r.follow_ups) : undefined,
            })
            issuesCount++
          }
        }

        if (options.events) {
          deleteAllEvents()
          const records = backupDb.prepare('SELECT * FROM events').all()
          for (const r of records) {
            addEvent({
              type: r.type,
              date: r.event_date,
              summary: r.summary,
              oldValue: r.old_value ?? undefined,
              newValue: r.new_value ?? undefined,
              severity: r.severity ?? undefined,
              supplierName: r.supplier_name ?? undefined,
              functionName: r.function_name ?? undefined,
            })
            eventsCount++
          }
        }

        if (options.suppliers) {
          deleteAllSuppliers()
          const records = backupDb.prepare('SELECT * FROM suppliers').all()
          for (const r of records) {
            addSupplier(mapDbRowToSupplier(r))
            suppliersCount++
          }
        }
      } finally {
        backupDb.close()
      }
    }

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true })

    return {
      success: true,
      message: 'Database restored successfully',
      stats: {
        suppliers: suppliersCount,
        events: eventsCount,
        issues: issuesCount,
        criticalMonitor: criticalCount,
      },
    }
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    throw error
  }
}

/**
 * Restore from Excel files in backup ZIP
 * Only imports selected data types based on options
 */
export async function restoreFromExcelBackup(zipPath: string, options: RestoreOptions): Promise<RestoreResult> {
  const tempDir = path.join(path.dirname(zipPath), '.restore-temp-' + Date.now())

  try {
    // Extract ZIP
    const zip = new AdmZip(zipPath)
    zip.extractAllTo(tempDir, true)

    // Check for Excel files
    const suppliersPath = path.join(tempDir, 'Suppliers.xlsx')
    const eventsPath = path.join(tempDir, 'Events.xlsx')
    const issuesPath = path.join(tempDir, 'Issues.xlsx')
    const criticalPath = path.join(tempDir, 'CriticalMonitor.xlsx')

    let suppliersCount = 0
    let eventsCount = 0
    let issuesCount = 0
    let criticalCount = 0

    // Import suppliers if selected
    if (options.suppliers) {
      if (!fs.existsSync(suppliersPath)) {
        throw new Error('Backup does not contain Suppliers.xlsx')
      }
      deleteAllSuppliers()
      const suppliers = parseSuppliersExcel(suppliersPath)
      for (const supplier of suppliers) {
        addSupplier(supplier)
        suppliersCount++
      }
    }

    // Import events if selected
    if (options.events && fs.existsSync(eventsPath)) {
      deleteAllEvents()
      const events = parseEventsExcel(eventsPath)
      for (const event of events) {
        addEvent(event as EventLog)
        eventsCount++
      }
    }

    // Import issues if selected
    if (options.issues && fs.existsSync(issuesPath)) {
      deleteAllIssues()
      const issues = parseIssuesExcel(issuesPath)
      for (const issue of issues) {
        addIssue(issue as IssueRecord)
        issuesCount++
      }
    }

    // Import critical monitor if selected
    if (options.criticalMonitor && fs.existsSync(criticalPath)) {
      deleteAllCriticalMonitorRecords()
      const criticalRecords = parseCriticalMonitorExcel(criticalPath)
      for (const record of criticalRecords) {
        upsertCriticalMonitorRecord(record)
        criticalCount++
      }
    }

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true })

    return {
      success: true,
      message: 'Data restored from Excel files successfully',
      stats: {
        suppliers: suppliersCount,
        events: eventsCount,
        issues: issuesCount,
        criticalMonitor: criticalCount,
      },
    }
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    throw error
  }
}

// ============================================================================
// Excel Generation Functions
// ============================================================================

function generateSuppliersExcel(suppliers: SupplierOutsourcing[]): Buffer {
  const data = suppliers.map((s) => ({
    // Core fields
    'Reference Number': s.referenceNumber,
    'Status': s.status ?? '',
    'Category': s.category ?? '',
    // Dates
    'Start Date': formatDate(s.dates?.startDate),
    'Next Renewal Date': formatDate(s.dates?.nextRenewalDate),
    'End Date': formatDate(s.dates?.endDate),
    'Provider Notice Period': s.dates?.serviceProviderNoticePeriod ?? '',
    'Entity Notice Period': s.dates?.entityNoticePeriod ?? '',
    // Function Description
    'Function Name': s.functionDescription?.name ?? '',
    'Function Description': s.functionDescription?.description ?? '',
    'Data Description': s.functionDescription?.dataDescription ?? '',
    'Personal Data Involved': s.functionDescription?.personalDataInvolved ? 'Yes' : 'No',
    'Personal Data Transferred': s.functionDescription?.personalDataTransferred ? 'Yes' : 'No',
    // Service Provider
    'Provider Name': s.serviceProvider?.name ?? '',
    'Corporate Registration': s.serviceProvider?.corporateRegistrationNumber ?? '',
    'Legal Entity Identifier': s.serviceProvider?.legalEntityIdentifier ?? '',
    'Registered Address': s.serviceProvider?.registeredAddress ?? '',
    'Contact Details': s.serviceProvider?.contactDetails ?? '',
    'Parent Company': s.serviceProvider?.parentCompany ?? '',
    // Location
    'Service Countries': JSON.stringify(s.location?.servicePerformanceCountries ?? []),
    'Data Location Countries': JSON.stringify(s.location?.dataLocationCountry ?? []),
    'Other Location Info': s.location?.otherDataLocationInfo ?? '',
    // Criticality
    'Is Critical': s.criticality?.isCritical ? 'Yes' : 'No',
    'Criticality Reasons': s.criticality?.reasons ?? '',
    'Criticality Assessment Date': formatDate(s.criticalityAssessmentDate),
    // Cloud Service
    'Cloud Service Model': s.cloudService?.serviceModel ?? '',
    'Cloud Deployment Model': s.cloudService?.deploymentModel ?? '',
    'Cloud Data Nature': s.cloudService?.dataNature ?? '',
    'Cloud Storage Locations': JSON.stringify(s.cloudService?.storageLocations ?? []),
    'Cloud Officer': s.cloudService?.cloudOfficer ?? '',
    'Resource Operator': s.cloudService?.resourceOperator ?? '',
    'Cloud Other Info': s.cloudService?.otherInformation ?? '',
    // Critical Fields (stored as JSON)
    'Critical Fields': s.criticalFields ? JSON.stringify(s.criticalFields) : '',
    // Tracking
    'Incomplete Fields': JSON.stringify(s.incompleteFields ?? []),
    'Pending Fields': JSON.stringify(s.pendingFields ?? []),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers')
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
}

function generateEventsExcel(events: EventLog[]): Buffer {
  const data = events.map((e) => ({
    'ID': e.id ?? '',
    'Date': e.date ?? '',
    'Type': e.type ?? '',
    'Summary': e.summary ?? '',
    'Severity': e.severity ?? '',
    'Supplier Name': e.supplierName ?? '',
    'Function Name': e.functionName ?? '',
    'Old Value': e.oldValue ?? '',
    'New Value': e.newValue ?? '',
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Events')
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
}

function generateIssuesExcel(issues: IssueRecord[]): Buffer {
  const data = issues.map((i) => ({
    'ID': i.id ?? '',
    'Title': i.title ?? '',
    'Description': i.description ?? '',
    'Category': i.category ?? '',
    'Status': i.status ?? '',
    'Severity': i.severity ?? '',
    'Owner': i.owner ?? '',
    'Supplier Name': i.supplierName ?? '',
    'Function Name': i.functionName ?? '',
    'Date Opened': i.dateOpened ?? '',
    'Date Last Update': i.dateLastUpdate ?? '',
    'Date Closed': i.dateClosed ?? '',
    'Due Date': i.dueDate ?? '',
    'Follow-ups': JSON.stringify(i.followUps ?? []),
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Issues')
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
}

function generateCriticalMonitorExcel(
  records: CriticalMonitorRecord[],
  suppliers: SupplierOutsourcing[]
): Buffer {
  const supplierMap = new Map(suppliers.map((s) => [s.referenceNumber, s]))

  const data = records.map((r) => {
    const supplier = supplierMap.get(r.supplierReferenceNumber)
    return {
      'Supplier Reference': r.supplierReferenceNumber,
      'Provider Name': supplier?.serviceProvider?.name ?? '',
      'Function Name': supplier?.functionDescription?.name ?? '',
      'Category': supplier?.category ?? '',
      'Contract': r.contract ?? '',
      'Criticality Assessment Date': formatDate(supplier?.criticalityAssessmentDate),
      'Suitability Assessment Date': r.suitabilityAssessmentDate ?? '',
      'Audit Reports': r.auditReports ?? '',
      'CO RO Assessment Date': r.coRoAssessmentDate ?? '',
    }
  })

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Critical Monitor')
  return Buffer.from(XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }))
}

// ============================================================================
// Excel Parsing Functions
// ============================================================================

function parseSuppliersExcel(filePath: string): SupplierOutsourcing[] {
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  return data.map((row) => {
    // Parse JSON arrays safely
    const parseJsonArray = (value: unknown): string[] => {
      if (!value) return []
      try {
        const parsed = JSON.parse(String(value))
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    // Parse critical fields JSON
    let criticalFields = undefined
    const criticalFieldsStr = String(row['Critical Fields'] ?? '')
    if (criticalFieldsStr) {
      try {
        criticalFields = JSON.parse(criticalFieldsStr)
      } catch {
        criticalFields = undefined
      }
    }

    const supplier: SupplierOutsourcing = {
      referenceNumber: String(row['Reference Number'] ?? ''),
      status: (String(row['Status'] ?? 'Draft') as OutsourcingStatus),
      category: String(row['Category'] ?? 'Other'),
      dates: {
        startDate: parseExcelDate(row['Start Date']),
        nextRenewalDate: parseExcelDate(row['Next Renewal Date']),
        endDate: parseExcelDate(row['End Date']),
        serviceProviderNoticePeriod: String(row['Provider Notice Period'] ?? ''),
        entityNoticePeriod: String(row['Entity Notice Period'] ?? ''),
      },
      functionDescription: {
        name: String(row['Function Name'] ?? ''),
        description: String(row['Function Description'] ?? ''),
        dataDescription: String(row['Data Description'] ?? ''),
        personalDataInvolved: String(row['Personal Data Involved']).toLowerCase() === 'yes',
        personalDataTransferred: String(row['Personal Data Transferred']).toLowerCase() === 'yes',
      },
      serviceProvider: {
        name: String(row['Provider Name'] ?? ''),
        corporateRegistrationNumber: String(row['Corporate Registration'] ?? ''),
        legalEntityIdentifier: String(row['Legal Entity Identifier'] ?? '') || undefined,
        registeredAddress: String(row['Registered Address'] ?? ''),
        contactDetails: String(row['Contact Details'] ?? ''),
        parentCompany: String(row['Parent Company'] ?? '') || undefined,
      },
      location: {
        servicePerformanceCountries: parseJsonArray(row['Service Countries']),
        dataLocationCountry: parseJsonArray(row['Data Location Countries']),
        otherDataLocationInfo: String(row['Other Location Info'] ?? ''),
      },
      criticality: {
        isCritical: String(row['Is Critical']).toLowerCase() === 'yes',
        reasons: String(row['Criticality Reasons'] ?? ''),
      },
      criticalityAssessmentDate: parseExcelDate(row['Criticality Assessment Date']),
      cloudService: row['Cloud Service Model'] ? {
        serviceModel: String(row['Cloud Service Model']) as CloudServiceModel,
        deploymentModel: String(row['Cloud Deployment Model']) as DeploymentModel,
        dataNature: String(row['Cloud Data Nature'] ?? ''),
        storageLocations: parseJsonArray(row['Cloud Storage Locations']),
        cloudOfficer: String(row['Cloud Officer'] ?? '') || undefined,
        resourceOperator: String(row['Resource Operator'] ?? '') || undefined,
        otherInformation: String(row['Cloud Other Info'] ?? '') || undefined,
      } : undefined,
      criticalFields,
      incompleteFields: parseJsonArray(row['Incomplete Fields']),
      pendingFields: parseJsonArray(row['Pending Fields']),
    }

    return supplier
  })
}

function parseEventsExcel(filePath: string): Omit<EventLog, 'id'>[] {
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  return data.map((row) => ({
    date: String(row['Date'] ?? ''),
    type: String(row['Type'] ?? '') as EventLog['type'],
    summary: String(row['Summary'] ?? ''),
    severity: String(row['Severity'] ?? '') || undefined,
    supplierName: String(row['Supplier Name'] ?? '') || undefined,
    functionName: String(row['Function Name'] ?? '') || undefined,
    oldValue: String(row['Old Value'] ?? '') || undefined,
    newValue: String(row['New Value'] ?? '') || undefined,
  }))
}

function parseIssuesExcel(filePath: string): Omit<IssueRecord, 'id'>[] {
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  return data.map((row) => {
    let followUps: IssueRecord['followUps'] = []
    try {
      const followUpsStr = String(row['Follow-ups'] ?? '[]')
      if (followUpsStr && followUpsStr !== '[]') {
        followUps = JSON.parse(followUpsStr)
      }
    } catch {
      followUps = []
    }

    return {
      title: String(row['Title'] ?? ''),
      description: String(row['Description'] ?? ''),
      category: String(row['Category'] ?? ''),
      status: String(row['Status'] ?? 'Open') as IssueRecord['status'],
      severity: String(row['Severity'] ?? '') || undefined,
      owner: String(row['Owner'] ?? '') || undefined,
      supplierName: String(row['Supplier Name'] ?? '') || undefined,
      functionName: String(row['Function Name'] ?? '') || undefined,
      dateOpened: String(row['Date Opened'] ?? ''),
      dateLastUpdate: String(row['Date Last Update'] ?? '') || undefined,
      dateClosed: row['Date Closed'] ? String(row['Date Closed']) : null,
      dueDate: String(row['Due Date'] ?? '') || undefined,
      followUps,
    }
  })
}

function parseCriticalMonitorExcel(filePath: string): CriticalMonitorRecord[] {
  const workbook = XLSX.readFile(filePath)
  const sheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet)

  return data.map((row) => ({
    supplierReferenceNumber: String(row['Supplier Reference'] ?? ''),
    contract: String(row['Contract'] ?? '') || undefined,
    suitabilityAssessmentDate: String(row['Suitability Assessment Date'] ?? '') || undefined,
    auditReports: String(row['Audit Reports'] ?? '') || undefined,
    coRoAssessmentDate: String(row['CO RO Assessment Date'] ?? '') || undefined,
  }))
}

// ============================================================================
// Utility Functions
// ============================================================================

function formatDate(value?: string | null): string {
  if (!value) return ''
  const parsed = new Date(value)
  if (isNaN(parsed.getTime())) return value
  const day = parsed.getUTCDate().toString().padStart(2, '0')
  const month = (parsed.getUTCMonth() + 1).toString().padStart(2, '0')
  const year = parsed.getUTCFullYear()
  return `${day}/${month}/${year}`
}

function parseExcelDate(value: unknown): string {
  if (!value) return ''
  if (typeof value === 'number') {
    // Excel serial date
    const date = XLSX.SSF.parse_date_code(value)
    if (date) {
      const year = date.y
      const month = String(date.m).padStart(2, '0')
      const day = String(date.d).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }
  if (typeof value === 'string') {
    // Try to parse DD/MM/YYYY format
    const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/)
    if (match) {
      return `${match[3]}-${match[2]}-${match[1]}`
    }
    return value
  }
  return ''
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbRowToSupplier(r: any): SupplierOutsourcing {
  const parseJsonArray = (value: unknown): string[] => {
    if (!value) return []
    try {
      const parsed = JSON.parse(String(value))
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return {
    referenceNumber: r.reference_number,
    status: r.status,
    category: r.category,
    dates: {
      startDate: r.start_date ?? '',
      nextRenewalDate: r.next_renewal_date ?? '',
      endDate: r.end_date ?? '',
      serviceProviderNoticePeriod: r.service_provider_notice_period ?? '',
      entityNoticePeriod: r.entity_notice_period ?? '',
    },
    functionDescription: {
      name: r.function_name ?? '',
      description: r.function_description ?? '',
      dataDescription: r.data_description ?? '',
      personalDataInvolved: !!r.personal_data_involved,
      personalDataTransferred: !!r.personal_data_transferred,
    },
    serviceProvider: {
      name: r.provider_name ?? '',
      corporateRegistrationNumber: r.corporate_registration_number ?? '',
      legalEntityIdentifier: r.legal_entity_identifier ?? undefined,
      registeredAddress: r.registered_address ?? '',
      contactDetails: r.contact_details ?? '',
      parentCompany: r.parent_company ?? undefined,
    },
    location: {
      servicePerformanceCountries: parseJsonArray(r.service_performance_countries),
      dataLocationCountry: parseJsonArray(r.data_location_country),
      otherDataLocationInfo: r.other_data_location_info ?? '',
    },
    criticality: {
      isCritical: !!r.is_critical,
      reasons: r.criticality_reasons ?? '',
    },
    criticalityAssessmentDate: r.criticality_assessment_date ?? '',
    cloudService: r.cloud_service_model ? {
      serviceModel: r.cloud_service_model,
      deploymentModel: r.cloud_deployment_model,
      dataNature: r.cloud_data_nature ?? '',
      storageLocations: parseJsonArray(r.cloud_storage_locations),
      cloudOfficer: r.cloud_officer ?? undefined,
      resourceOperator: r.cloud_resource_operator ?? undefined,
      otherInformation: r.cloud_other_information ?? undefined,
    } : undefined,
    criticalFields: r.critical_fields ? JSON.parse(r.critical_fields) : undefined,
    incompleteFields: parseJsonArray(r.incomplete_fields),
    pendingFields: parseJsonArray(r.pending_fields),
  }
}
