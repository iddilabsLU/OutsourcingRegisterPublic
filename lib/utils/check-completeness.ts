import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { OutsourcingCategory } from "@/lib/types/supplier"

/**
 * Result of completeness check
 */
export interface CompletenessCheckResult {
  /** Array of field paths that are incomplete (e.g., "serviceProvider.name") */
  incomplete: string[]
  /** User-friendly labels with CSSF references */
  labels: string[]
  /** Whether all mandatory fields are complete */
  isComplete: boolean
}

/**
 * Checks which mandatory fields are missing from a supplier entry
 *
 * Mandatory fields are defined by CSSF Circular 22/806:
 * - Point 54: Mandatory for ALL outsourcing arrangements
 * - Point 54.h: Additional fields if cloud service
 * - Point 55: Additional fields if critical/important function
 *
 * @param data - Partial supplier data from form
 * @param pendingFields - Optional array of field paths marked as pending (will skip validation for these fields)
 * @returns Result object with incomplete field paths and labels
 */
export function checkIncompleteFields(
  data: Partial<SupplierOutsourcing>,
  pendingFields: string[] = []
): CompletenessCheckResult {
  const incomplete: string[] = []
  const labels: string[] = []

  // Helper function to add incomplete field (skip if field is pending)
  const addIncomplete = (path: string, label: string) => {
    // Skip validation if field is marked as pending
    if (pendingFields.includes(path)) {
      return
    }
    incomplete.push(path)
    labels.push(label)
  }

  // ========================================
  // POINT 54: Mandatory for ALL Suppliers
  // ========================================

  // 54.a - Reference Number
  if (!data.referenceNumber || data.referenceNumber.trim() === "") {
    addIncomplete("referenceNumber", "Reference Number (54.a)")
  }

  // 53 - Status
  if (!data.status) {
    addIncomplete("status", "Status (53)")
  }

  // 54.b - Dates (ALL now mandatory)
  if (!data.dates?.startDate || data.dates.startDate.trim() === "") {
    addIncomplete("dates.startDate", "Start Date (54.b)")
  }
  if (!data.dates?.nextRenewalDate || data.dates.nextRenewalDate.trim() === "") {
    addIncomplete("dates.nextRenewalDate", "Next Renewal Date (54.b)")
  }
  if (!data.dates?.endDate || data.dates.endDate.trim() === "") {
    addIncomplete("dates.endDate", "End Date (54.b)")
  }
  if (!data.dates?.serviceProviderNoticePeriod || data.dates.serviceProviderNoticePeriod.trim() === "") {
    addIncomplete("dates.serviceProviderNoticePeriod", "Service Provider Notice Period (54.b)")
  }
  if (!data.dates?.entityNoticePeriod || data.dates.entityNoticePeriod.trim() === "") {
    addIncomplete("dates.entityNoticePeriod", "Entity Notice Period (54.b)")
  }

  // 54.c - Function Description
  if (!data.functionDescription?.name || data.functionDescription.name.trim() === "") {
    addIncomplete("functionDescription.name", "Function Name (54.c)")
  }
  if (!data.functionDescription?.description || data.functionDescription.description.trim() === "") {
    addIncomplete("functionDescription.description", "Function Description (54.c)")
  }
  if (!data.functionDescription?.dataDescription || data.functionDescription.dataDescription.trim() === "") {
    addIncomplete("functionDescription.dataDescription", "Data Description (54.c)")
  }
  if (data.functionDescription?.personalDataInvolved === undefined) {
    addIncomplete("functionDescription.personalDataInvolved", "Personal Data Involved (54.c)")
  }
  if (data.functionDescription?.personalDataTransferred === undefined) {
    addIncomplete("functionDescription.personalDataTransferred", "Personal Data Transferred (54.c)")
  }

  // 54.d - Category
  if (!data.category) {
    addIncomplete("category", "Category (54.d)")
  }

  // 54.e - Service Provider Information
  if (!data.serviceProvider?.name || data.serviceProvider.name.trim() === "") {
    addIncomplete("serviceProvider.name", "Provider Name (54.e)")
  }
  if (
    !data.serviceProvider?.corporateRegistrationNumber ||
    data.serviceProvider.corporateRegistrationNumber.trim() === ""
  ) {
    addIncomplete("serviceProvider.corporateRegistrationNumber", "Corporate Registration Number (54.e)")
  }
  if (!data.serviceProvider?.registeredAddress || data.serviceProvider.registeredAddress.trim() === "") {
    addIncomplete("serviceProvider.registeredAddress", "Registered Address (54.e)")
  }
  if (!data.serviceProvider?.contactDetails || data.serviceProvider.contactDetails.trim() === "") {
    addIncomplete("serviceProvider.contactDetails", "Contact Details (54.e)")
  }

  // 54.f - Location Information (all mandatory)
  if (!data.location?.servicePerformanceCountries || data.location.servicePerformanceCountries.length === 0) {
    addIncomplete("location.servicePerformanceCountries", "Service Performance Countries (54.f)")
  }
  if (!data.location?.dataLocationCountry || data.location.dataLocationCountry.length === 0) {
    addIncomplete("location.dataLocationCountry", "Data Location Countries (54.f)")
  }
  if (!data.location?.otherDataLocationInfo || data.location.otherDataLocationInfo.trim() === "") {
    addIncomplete("location.otherDataLocationInfo", "Other Data Location Information (54.f)")
  }

  // 54.g - Criticality Assessment
  if (data.criticality?.isCritical === undefined) {
    addIncomplete("criticality.isCritical", "Is Critical or Important (54.g)")
  }
  if (!data.criticality?.reasons || data.criticality.reasons.trim() === "") {
    addIncomplete("criticality.reasons", "Criticality Reasons (54.g)")
  }

  // 54.i - Criticality Assessment Date
  if (!data.criticalityAssessmentDate || data.criticalityAssessmentDate.trim() === "") {
    addIncomplete("criticalityAssessmentDate", "Criticality Assessment Date (54.i)")
  }

  // ========================================
  // POINT 54.h: Cloud Service (Conditional)
  // Only check if category is Cloud
  // ========================================

  if (data.category === OutsourcingCategory.CLOUD) {
    if (!data.cloudService?.serviceModel) {
      addIncomplete("cloudService.serviceModel", "Cloud Service Model (54.h)")
    }
    if (!data.cloudService?.deploymentModel) {
      addIncomplete("cloudService.deploymentModel", "Deployment Model (54.h)")
    }
    if (!data.cloudService?.dataNature || data.cloudService.dataNature.trim() === "") {
      addIncomplete("cloudService.dataNature", "Data Nature (54.h)")
    }
    if (!data.cloudService?.storageLocations || data.cloudService.storageLocations.length === 0) {
      addIncomplete("cloudService.storageLocations", "Storage Locations (54.h)")
    }
    // Cloud Officer and Resource Operator now mandatory (with "if any" label)
    if (!data.cloudService?.cloudOfficer || data.cloudService.cloudOfficer.trim() === "") {
      addIncomplete("cloudService.cloudOfficer", "Cloud Officer (54.h) - if any")
    }
    if (!data.cloudService?.resourceOperator || data.cloudService.resourceOperator.trim() === "") {
      addIncomplete("cloudService.resourceOperator", "Resource Operator (54.h) - if any")
    }
  }

  // ========================================
  // POINT 55: Critical Functions (Conditional)
  // ========================================

  if (data.criticality?.isCritical === true && data.criticalFields) {
    const cf = data.criticalFields

    // 55.a - Entities Using
    if (!cf.entitiesUsing?.inScopeEntities || cf.entitiesUsing.inScopeEntities.length === 0) {
      addIncomplete("criticalFields.entitiesUsing.inScopeEntities", "In-Scope Entities (55.a)")
    }

    // 55.b - Group Relationship
    if (cf.groupRelationship?.isPartOfGroup === undefined) {
      addIncomplete("criticalFields.groupRelationship.isPartOfGroup", "Part of Group (55.b)")
    }
    if (cf.groupRelationship?.isOwnedByGroup === undefined) {
      addIncomplete("criticalFields.groupRelationship.isOwnedByGroup", "Owned by Group (55.b)")
    }

    // 55.c - Risk Assessment
    if (!cf.riskAssessment?.risk) {
      addIncomplete("criticalFields.riskAssessment.risk", "Risk Level (55.c)")
    }
    if (!cf.riskAssessment?.lastAssessmentDate || cf.riskAssessment.lastAssessmentDate.trim() === "") {
      addIncomplete("criticalFields.riskAssessment.lastAssessmentDate", "Last Assessment Date (55.c)")
    }
    if (!cf.riskAssessment?.mainResults || cf.riskAssessment.mainResults.trim() === "") {
      addIncomplete("criticalFields.riskAssessment.mainResults", "Summary Results (55.c)")
    }

    // 55.d - Approval
    if (!cf.approval?.approverName || cf.approval.approverName.trim() === "") {
      addIncomplete("criticalFields.approval.approverName", "Approver Name (55.d)")
    }
    if (!cf.approval?.approverRole || cf.approval.approverRole.trim() === "") {
      addIncomplete("criticalFields.approval.approverRole", "Approver Role (55.d)")
    }

    // 55.e - Governing Law
    if (!cf.governingLaw || cf.governingLaw.trim() === "") {
      addIncomplete("criticalFields.governingLaw", "Governing Law (55.e)")
    }

    // 55.f - Audit (now mandatory)
    if (!cf.audit?.lastAuditDate || cf.audit.lastAuditDate.trim() === "") {
      addIncomplete("criticalFields.audit.lastAuditDate", "Last Audit Date (55.f)")
    }
    if (!cf.audit?.nextScheduledAudit || cf.audit.nextScheduledAudit.trim() === "") {
      addIncomplete("criticalFields.audit.nextScheduledAudit", "Next Scheduled Audit (55.f)")
    }

    // 55.g - Sub-Outsourcing (mandatory toggle, conditional array)
    // First check: hasSubOutsourcing toggle is mandatory for critical suppliers
    if (typeof cf.subOutsourcing?.hasSubOutsourcing !== "boolean") {
      addIncomplete(
        "criticalFields.subOutsourcing.hasSubOutsourcing",
        "Activities are Sub-Outsourced? (55.g)"
      )
    }

    // Second check: If toggle = true, validate sub-contractors array
    if (cf.subOutsourcing?.hasSubOutsourcing === true) {
      if (!cf.subOutsourcing.subContractors || cf.subOutsourcing.subContractors.length === 0) {
        addIncomplete(
          "criticalFields.subOutsourcing.subContractors",
          "Sub-Contractors (55.g) - You indicated sub-outsourcing but provided no details"
        )
      } else {
        // Check each sub-contractor's mandatory fields
        cf.subOutsourcing.subContractors.forEach((subContractor, index) => {
          if (!subContractor.name || subContractor.name.trim() === "") {
            addIncomplete(
              `criticalFields.subOutsourcing.subContractors.${index}.name`,
              `Sub-Contractor ${index + 1}: Name (55.g)`
            )
          }
          if (!subContractor.activityDescription || subContractor.activityDescription.trim() === "") {
            addIncomplete(
              `criticalFields.subOutsourcing.subContractors.${index}.activityDescription`,
              `Sub-Contractor ${index + 1}: Activity Description (55.g)`
            )
          }
          if (!subContractor.registrationCountry || subContractor.registrationCountry.trim() === "") {
            addIncomplete(
              `criticalFields.subOutsourcing.subContractors.${index}.registrationCountry`,
              `Sub-Contractor ${index + 1}: Registration Country (55.g)`
            )
          }
          if (!subContractor.servicePerformanceCountry || subContractor.servicePerformanceCountry.trim() === "") {
            addIncomplete(
              `criticalFields.subOutsourcing.subContractors.${index}.servicePerformanceCountry`,
              `Sub-Contractor ${index + 1}: Service Performance Country (55.g)`
            )
          }
          if (!subContractor.dataStorageLocation || subContractor.dataStorageLocation.trim() === "") {
            addIncomplete(
              `criticalFields.subOutsourcing.subContractors.${index}.dataStorageLocation`,
              `Sub-Contractor ${index + 1}: Data Storage Location (55.g)`
            )
          }
        })
      }
    }

    // 55.h - Substitutability Assessment
    if (!cf.substitutability?.outcome) {
      addIncomplete("criticalFields.substitutability.outcome", "Substitutability Outcome (55.h)")
    }
    if (
      !cf.substitutability?.reintegrationAssessment ||
      cf.substitutability.reintegrationAssessment.trim() === ""
    ) {
      addIncomplete("criticalFields.substitutability.reintegrationAssessment", "Reintegration Assessment (55.h)")
    }
    if (
      !cf.substitutability?.discontinuationImpact ||
      cf.substitutability.discontinuationImpact.trim() === ""
    ) {
      addIncomplete("criticalFields.substitutability.discontinuationImpact", "Discontinuation Impact (55.h)")
    }

    // 55.i - Alternative Providers
    if (!cf.alternativeProviders || cf.alternativeProviders.length === 0) {
      addIncomplete("criticalFields.alternativeProviders", "Alternative Providers (55.i)")
    }

    // 55.j - Time Criticality
    if (cf.isTimeCritical === undefined) {
      addIncomplete("criticalFields.isTimeCritical", "Time-Critical Function (55.j)")
    }

    // 55.k - Cost Information (all now mandatory)
    if (cf.estimatedAnnualCost === undefined || cf.estimatedAnnualCost === null) {
      addIncomplete("criticalFields.estimatedAnnualCost", "Estimated Annual Cost (55.k)")
    }
    if (!cf.costComments || cf.costComments.trim() === "") {
      addIncomplete("criticalFields.costComments", "Cost Comments (55.k)")
    }

    // 55.l - Prior Notification Date (now mandatory)
    if (!cf.regulatoryNotification?.notificationDate || cf.regulatoryNotification.notificationDate.trim() === "") {
      addIncomplete("criticalFields.regulatoryNotification.notificationDate", "Prior Notification Date (55.l)")
    }
  }

  return {
    incomplete,
    labels,
    isComplete: incomplete.length === 0,
  }
}

/**
 * Generate auto-incremented reference number
 * In a real application, this would query the database for the latest reference
 *
 * @param existingSuppliers - Array of existing suppliers
 * @returns Next reference number (e.g., "2024-006")
 */
export function generateNextReferenceNumber(existingSuppliers: SupplierOutsourcing[] = []): string {
  const currentYear = new Date().getFullYear()

  if (existingSuppliers.length === 0) {
    return `${currentYear}-001`
  }

  // Extract numbers from existing references for current year
  const currentYearRefs = existingSuppliers
    .filter((s) => s.referenceNumber.startsWith(`${currentYear}-`))
    .map((s) => {
      const match = s.referenceNumber.match(/\d+$/)
      return match ? parseInt(match[0], 10) : 0
    })

  const maxNumber = currentYearRefs.length > 0 ? Math.max(...currentYearRefs) : 0
  const nextNumber = (maxNumber + 1).toString().padStart(3, "0")

  return `${currentYear}-${nextNumber}`
}
