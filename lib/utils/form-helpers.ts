import type { SupplierFormData } from "@/lib/validations/supplier-schema"
import { OutsourcingCategory } from "@/lib/types/supplier"

/**
 * Ensures all conditional objects (cloudService, criticalFields) have proper structure
 * Prevents "cannot read properties of undefined" errors in completeness check
 *
 * @param data - Form data from React Hook Form
 * @returns Normalized form data with conditional objects initialized
 */
export function normalizeFormData(data: SupplierFormData): SupplierFormData {
  const normalized = { ...data }

  // If category is Cloud but cloudService is undefined, create empty structure
  if (normalized.category === OutsourcingCategory.CLOUD && !normalized.cloudService) {
    normalized.cloudService = createEmptyCloudService()
  }

  // If isCritical is true but criticalFields is undefined, create empty structure
  if (normalized.criticality?.isCritical === true && !normalized.criticalFields) {
    normalized.criticalFields = createEmptyCriticalFields()
  }

  return normalized
}

/**
 * Validates only data types (dates, numbers, enums) without checking required fields
 * Returns list of invalid fields with type errors
 *
 * @param data - Form data to validate
 * @returns Validation result with errors array
 */
export function validateDataTypes(data: SupplierFormData): {
  valid: boolean
  errors: Array<{ path: string; message: string }>
} {
  const errors: Array<{ path: string; message: string }> = []

  // Helper to check if date string is valid
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return true // Empty is okay (not checking required here)
    const date = new Date(dateStr)
    return !isNaN(date.getTime())
  }

  // Validate dates in main dates object (if filled)
  if (data.dates?.startDate && !isValidDate(data.dates.startDate)) {
    errors.push({ path: "dates.startDate", message: "Invalid date format" })
  }
  if (data.dates?.nextRenewalDate && !isValidDate(data.dates.nextRenewalDate)) {
    errors.push({ path: "dates.nextRenewalDate", message: "Invalid date format" })
  }
  if (data.dates?.endDate && !isValidDate(data.dates.endDate)) {
    errors.push({ path: "dates.endDate", message: "Invalid date format" })
  }

  // Validate criticality assessment date (if filled)
  if (data.criticalityAssessmentDate && !isValidDate(data.criticalityAssessmentDate)) {
    errors.push({ path: "criticalityAssessmentDate", message: "Invalid date format" })
  }

  // Validate critical fields dates (if filled)
  if (data.criticalFields) {
    if (
      data.criticalFields.riskAssessment?.lastAssessmentDate &&
      !isValidDate(data.criticalFields.riskAssessment.lastAssessmentDate)
    ) {
      errors.push({ path: "criticalFields.riskAssessment.lastAssessmentDate", message: "Invalid date format" })
    }
    if (data.criticalFields.audit?.lastAuditDate && !isValidDate(data.criticalFields.audit.lastAuditDate)) {
      errors.push({ path: "criticalFields.audit.lastAuditDate", message: "Invalid date format" })
    }
    if (data.criticalFields.audit?.nextScheduledAudit && !isValidDate(data.criticalFields.audit.nextScheduledAudit)) {
      errors.push({ path: "criticalFields.audit.nextScheduledAudit", message: "Invalid date format" })
    }
    if (
      data.criticalFields.regulatoryNotification?.notificationDate &&
      !isValidDate(data.criticalFields.regulatoryNotification.notificationDate)
    ) {
      errors.push({
        path: "criticalFields.regulatoryNotification.notificationDate",
        message: "Invalid date format",
      })
    }

    // Validate estimated annual cost (if filled)
    if (data.criticalFields.estimatedAnnualCost !== undefined && data.criticalFields.estimatedAnnualCost !== null) {
      if (isNaN(Number(data.criticalFields.estimatedAnnualCost))) {
        errors.push({ path: "criticalFields.estimatedAnnualCost", message: "Invalid number" })
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Creates initial criticalFields structure with empty values
 * Used when user toggles "Is Critical" = Yes
 *
 * @returns Empty critical fields object
 */
export function createEmptyCriticalFields() {
  return {
    entitiesUsing: {
      inScopeEntities: [],
    },
    groupRelationship: {
      isPartOfGroup: undefined,
      isOwnedByGroup: undefined,
    },
    riskAssessment: {
      risk: undefined,
      lastAssessmentDate: "",
      mainResults: "",
    },
    approval: {
      approverName: "",
      approverRole: "",
    },
    governingLaw: "",
    audit: {
      lastAuditDate: "",
      nextScheduledAudit: "",
    },
    subOutsourcing: undefined,
    substitutability: {
      outcome: undefined,
      reintegrationAssessment: "",
      discontinuationImpact: "",
    },
    alternativeProviders: [],
    isTimeCritical: undefined,
    estimatedAnnualCost: undefined,
    costComments: "",
    regulatoryNotification: {
      notificationDate: "",
    },
  }
}

/**
 * Creates initial cloudService structure with empty values
 * Used when user selects Category = "Cloud"
 *
 * @returns Empty cloud service object
 */
export function createEmptyCloudService() {
  return {
    serviceModel: undefined,
    deploymentModel: undefined,
    dataNature: "",
    storageLocations: [],
    cloudOfficer: "",
    resourceOperator: "",
  }
}
