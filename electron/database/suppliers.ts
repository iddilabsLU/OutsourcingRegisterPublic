import { getDatabase } from './db'
import type { SupplierOutsourcing } from '../../lib/types/supplier'

/**
 * Database row interface (flat structure with snake_case)
 * Maps to SQLite suppliers table schema
 */
interface SupplierDbRow {
  id: number
  reference_number: string
  status: string
  category: string

  // Dates (54.b)
  start_date: string
  next_renewal_date: string
  end_date: string
  service_provider_notice_period: string
  entity_notice_period: string

  // Function Description (54.c)
  function_name: string
  function_description: string
  data_description: string
  personal_data_involved: number // 0 or 1
  personal_data_transferred: number // 0 or 1

  // Service Provider (54.e)
  provider_name: string
  corporate_registration_number: string
  legal_entity_identifier: string | null
  registered_address: string
  contact_details: string
  parent_company: string | null

  // Location (54.f) - JSON arrays
  service_performance_countries: string
  data_location_country: string
  other_data_location_info: string

  // Criticality (54.g, 54.i)
  is_critical: number // 0 or 1
  criticality_reasons: string
  criticality_assessment_date: string

  // Cloud Service (54.h) - Nullable
  cloud_service_model: string | null
  cloud_deployment_model: string | null
  cloud_data_nature: string | null
  cloud_storage_locations: string | null
  cloud_officer: string | null
  cloud_resource_operator: string | null

  // Critical Fields (Point 55) - JSON blob
  critical_fields: string | null

  // Tracking fields - JSON arrays
  incomplete_fields: string | null
  pending_fields: string | null

  // Metadata
  created_at: string
  updated_at: string
}

/**
 * Convert TypeScript nested object (camelCase) to flat database row (snake_case)
 */
export function toDbRow(supplier: SupplierOutsourcing): Omit<SupplierDbRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    // 54.a - Reference Number
    reference_number: supplier.referenceNumber,

    // 53 - Status
    status: supplier.status,

    // 54.d - Category
    category: supplier.category,

    // 54.b - Dates (flatten nested object)
    start_date: supplier.dates.startDate,
    next_renewal_date: supplier.dates.nextRenewalDate,
    end_date: supplier.dates.endDate,
    service_provider_notice_period: supplier.dates.serviceProviderNoticePeriod,
    entity_notice_period: supplier.dates.entityNoticePeriod,

    // 54.c - Function Description (flatten nested object)
    function_name: supplier.functionDescription.name,
    function_description: supplier.functionDescription.description,
    data_description: supplier.functionDescription.dataDescription,
    personal_data_involved: supplier.functionDescription.personalDataInvolved ? 1 : 0,
    personal_data_transferred: supplier.functionDescription.personalDataTransferred ? 1 : 0,

    // 54.e - Service Provider (flatten nested object)
    provider_name: supplier.serviceProvider.name,
    corporate_registration_number: supplier.serviceProvider.corporateRegistrationNumber,
    legal_entity_identifier: supplier.serviceProvider.legalEntityIdentifier || null,
    registered_address: supplier.serviceProvider.registeredAddress,
    contact_details: supplier.serviceProvider.contactDetails,
    parent_company: supplier.serviceProvider.parentCompany || null,

    // 54.f - Location (flatten nested object, arrays → JSON)
    service_performance_countries: JSON.stringify(supplier.location.servicePerformanceCountries),
    data_location_country: JSON.stringify(supplier.location.dataLocationCountry),
    other_data_location_info: supplier.location.otherDataLocationInfo,

    // 54.g, 54.i - Criticality (flatten nested object)
    is_critical: supplier.criticality.isCritical ? 1 : 0,
    criticality_reasons: supplier.criticality.reasons,
    criticality_assessment_date: supplier.criticalityAssessmentDate,

    // 54.h - Cloud Service (flatten nested object, conditional)
    cloud_service_model: supplier.cloudService?.serviceModel || null,
    cloud_deployment_model: supplier.cloudService?.deploymentModel || null,
    cloud_data_nature: supplier.cloudService?.dataNature || null,
    cloud_storage_locations: supplier.cloudService?.storageLocations
      ? JSON.stringify(supplier.cloudService.storageLocations)
      : null,
    cloud_officer: supplier.cloudService?.cloudOfficer || null,
    cloud_resource_operator: supplier.cloudService?.resourceOperator || null,

    // Point 55 - Critical Fields (entire object → JSON)
    critical_fields: supplier.criticalFields ? JSON.stringify(supplier.criticalFields) : null,

    // Tracking fields (arrays → JSON)
    incomplete_fields: supplier.incompleteFields ? JSON.stringify(supplier.incompleteFields) : null,
    pending_fields: supplier.pendingFields ? JSON.stringify(supplier.pendingFields) : null,
  }
}

/**
 * Convert flat database row (snake_case) to TypeScript nested object (camelCase)
 */
export function fromDbRow(row: SupplierDbRow): SupplierOutsourcing {
  const supplier: SupplierOutsourcing = {
    // 54.a - Reference Number
    referenceNumber: row.reference_number,

    // 53 - Status
    status: row.status as any,

    // 54.b - Dates (reconstruct nested object)
    dates: {
      startDate: row.start_date,
      nextRenewalDate: row.next_renewal_date,
      endDate: row.end_date,
      serviceProviderNoticePeriod: row.service_provider_notice_period,
      entityNoticePeriod: row.entity_notice_period,
    },

    // 54.c - Function Description (reconstruct nested object)
    functionDescription: {
      name: row.function_name,
      description: row.function_description,
      dataDescription: row.data_description,
      personalDataInvolved: row.personal_data_involved === 1,
      personalDataTransferred: row.personal_data_transferred === 1,
    },

    // 54.d - Category
    category: row.category as any,

    // 54.e - Service Provider (reconstruct nested object)
    serviceProvider: {
      name: row.provider_name,
      corporateRegistrationNumber: row.corporate_registration_number,
      legalEntityIdentifier: row.legal_entity_identifier || undefined,
      registeredAddress: row.registered_address,
      contactDetails: row.contact_details,
      parentCompany: row.parent_company || undefined,
    },

    // 54.f - Location (reconstruct nested object, JSON → arrays)
    location: {
      servicePerformanceCountries: JSON.parse(row.service_performance_countries),
      dataLocationCountry: JSON.parse(row.data_location_country),
      otherDataLocationInfo: row.other_data_location_info,
    },

    // 54.g - Criticality (reconstruct nested object)
    criticality: {
      isCritical: row.is_critical === 1,
      reasons: row.criticality_reasons,
    },

    // 54.i - Criticality Assessment Date
    criticalityAssessmentDate: row.criticality_assessment_date,

    // 54.h - Cloud Service (reconstruct nested object, conditional)
    cloudService:
      row.cloud_service_model || row.cloud_deployment_model
        ? {
            serviceModel: row.cloud_service_model as any,
            deploymentModel: row.cloud_deployment_model as any,
            dataNature: row.cloud_data_nature || '',
            storageLocations: row.cloud_storage_locations ? JSON.parse(row.cloud_storage_locations) : [],
            cloudOfficer: row.cloud_officer || undefined,
            resourceOperator: row.cloud_resource_operator || undefined,
          }
        : undefined,

    // Point 55 - Critical Fields (JSON → object)
    criticalFields: row.critical_fields ? JSON.parse(row.critical_fields) : undefined,

    // Tracking fields (JSON → arrays)
    incompleteFields: row.incomplete_fields ? JSON.parse(row.incomplete_fields) : undefined,
    pendingFields: row.pending_fields ? JSON.parse(row.pending_fields) : undefined,
  }

  return supplier
}

/**
 * Get all suppliers from database
 */
export function getAllSuppliers(): SupplierOutsourcing[] {
  const db = getDatabase()
  const rows = db.prepare('SELECT * FROM suppliers ORDER BY reference_number').all() as SupplierDbRow[]
  return rows.map(fromDbRow)
}

/**
 * Get single supplier by reference number
 */
export function getSupplierByReference(referenceNumber: string): SupplierOutsourcing | null {
  const db = getDatabase()
  const row = db
    .prepare('SELECT * FROM suppliers WHERE reference_number = ?')
    .get(referenceNumber) as SupplierDbRow | undefined

  return row ? fromDbRow(row) : null
}

/**
 * Add new supplier to database
 */
export function addSupplier(supplier: SupplierOutsourcing): { id: number; referenceNumber: string } {
  const db = getDatabase()
  const dbRow = toDbRow(supplier)

  const stmt = db.prepare(`
    INSERT INTO suppliers (
      reference_number, status, category,
      start_date, next_renewal_date, end_date, service_provider_notice_period, entity_notice_period,
      function_name, function_description, data_description, personal_data_involved, personal_data_transferred,
      provider_name, corporate_registration_number, legal_entity_identifier, registered_address, contact_details, parent_company,
      service_performance_countries, data_location_country, other_data_location_info,
      is_critical, criticality_reasons, criticality_assessment_date,
      cloud_service_model, cloud_deployment_model, cloud_data_nature, cloud_storage_locations, cloud_officer, cloud_resource_operator,
      critical_fields, incomplete_fields, pending_fields
    ) VALUES (
      @reference_number, @status, @category,
      @start_date, @next_renewal_date, @end_date, @service_provider_notice_period, @entity_notice_period,
      @function_name, @function_description, @data_description, @personal_data_involved, @personal_data_transferred,
      @provider_name, @corporate_registration_number, @legal_entity_identifier, @registered_address, @contact_details, @parent_company,
      @service_performance_countries, @data_location_country, @other_data_location_info,
      @is_critical, @criticality_reasons, @criticality_assessment_date,
      @cloud_service_model, @cloud_deployment_model, @cloud_data_nature, @cloud_storage_locations, @cloud_officer, @cloud_resource_operator,
      @critical_fields, @incomplete_fields, @pending_fields
    )
  `)

  const result = stmt.run(dbRow)

  return {
    id: result.lastInsertRowid as number,
    referenceNumber: supplier.referenceNumber,
  }
}

/**
 * Update existing supplier in database
 */
export function updateSupplier(supplier: SupplierOutsourcing): void {
  const db = getDatabase()
  const dbRow = toDbRow(supplier)

  const stmt = db.prepare(`
    UPDATE suppliers SET
      status = @status,
      category = @category,
      start_date = @start_date,
      next_renewal_date = @next_renewal_date,
      end_date = @end_date,
      service_provider_notice_period = @service_provider_notice_period,
      entity_notice_period = @entity_notice_period,
      function_name = @function_name,
      function_description = @function_description,
      data_description = @data_description,
      personal_data_involved = @personal_data_involved,
      personal_data_transferred = @personal_data_transferred,
      provider_name = @provider_name,
      corporate_registration_number = @corporate_registration_number,
      legal_entity_identifier = @legal_entity_identifier,
      registered_address = @registered_address,
      contact_details = @contact_details,
      parent_company = @parent_company,
      service_performance_countries = @service_performance_countries,
      data_location_country = @data_location_country,
      other_data_location_info = @other_data_location_info,
      is_critical = @is_critical,
      criticality_reasons = @criticality_reasons,
      criticality_assessment_date = @criticality_assessment_date,
      cloud_service_model = @cloud_service_model,
      cloud_deployment_model = @cloud_deployment_model,
      cloud_data_nature = @cloud_data_nature,
      cloud_storage_locations = @cloud_storage_locations,
      cloud_officer = @cloud_officer,
      cloud_resource_operator = @cloud_resource_operator,
      critical_fields = @critical_fields,
      incomplete_fields = @incomplete_fields,
      pending_fields = @pending_fields
    WHERE reference_number = @reference_number
  `)

  const result = stmt.run(dbRow)

  if (result.changes === 0) {
    throw new Error(`Supplier with reference ${supplier.referenceNumber} not found`)
  }
}

/**
 * Delete supplier from database by reference number
 */
export function deleteSupplier(referenceNumber: string): void {
  const db = getDatabase()
  const stmt = db.prepare('DELETE FROM suppliers WHERE reference_number = ?')
  const result = stmt.run(referenceNumber)

  if (result.changes === 0) {
    throw new Error(`Supplier with reference ${referenceNumber} not found`)
  }
}

/**
 * Generate next reference number (e.g., "2024-006")
 * Format: YYYY-NNN (year + 3-digit sequence)
 */
export function getNextReferenceNumber(): string {
  const db = getDatabase()
  const currentYear = new Date().getFullYear()

  // Get the highest reference number for current year
  const row = db
    .prepare(
      `SELECT reference_number FROM suppliers
       WHERE reference_number LIKE ?
       ORDER BY reference_number DESC
       LIMIT 1`
    )
    .get(`${currentYear}-%`) as { reference_number: string } | undefined

  if (!row) {
    // No suppliers for current year, start with 001
    return `${currentYear}-001`
  }

  // Extract sequence number and increment
  const lastRef = row.reference_number
  const lastSequence = parseInt(lastRef.split('-')[1], 10)
  const nextSequence = lastSequence + 1

  // Format with leading zeros (3 digits)
  return `${currentYear}-${nextSequence.toString().padStart(3, '0')}`
}

/**
 * Get total count of suppliers
 */
export function getSuppliersCount(): number {
  const db = getDatabase()
  const row = db.prepare('SELECT COUNT(*) as count FROM suppliers').get() as { count: number }
  return row.count
}
