import type { SupplierOutsourcing } from "@/lib/types/supplier"
import type { QuickFilters, CustomFilter, FilterFieldType } from "@/lib/types/filters"

/**
 * Filters suppliers based on quick filters and custom filters
 * All filters are combined using AND logic
 */
export function filterSuppliers(
  suppliers: SupplierOutsourcing[],
  quickFilters: QuickFilters,
  customFilters: CustomFilter[]
): SupplierOutsourcing[] {
  return suppliers.filter((supplier) => {
    // Quick Filter: Critical
    if (quickFilters.critical && !supplier.criticality.isCritical) {
      return false
    }

    // Quick Filter: Non Critical
    if (quickFilters.nonCritical && supplier.criticality.isCritical) {
      return false
    }

    // Quick Filter: Cloud
    if (quickFilters.cloud && supplier.category !== "Cloud") {
      return false
    }

    // Quick Filter: Service Outsourcings (all non-Cloud categories)
    if (quickFilters.serviceOutsourcings && supplier.category === "Cloud") {
      return false
    }

    // Quick Filter: Status (OR logic for multiple selections)
    const statusFilters = quickFilters.status
    const anyStatusSelected =
      statusFilters.active ||
      statusFilters.draft ||
      statusFilters.notYetActive ||
      statusFilters.terminated

    if (anyStatusSelected) {
      const matchesStatus =
        (statusFilters.active && supplier.status === "Active") ||
        (statusFilters.draft && supplier.status === "Draft") ||
        (statusFilters.notYetActive && supplier.status === "Not Yet Active") ||
        (statusFilters.terminated && supplier.status === "Terminated")

      if (!matchesStatus) {
        return false
      }
    }

    // Custom Filters: All must match (AND logic)
    for (const filter of customFilters) {
      // Skip empty filters
      if (!filter.field || !filter.value) continue

      if (!matchesCustomFilter(supplier, filter.field, filter.value)) {
        return false
      }
    }

    return true
  })
}

/**
 * Checks if a supplier matches a specific custom filter
 */
function matchesCustomFilter(
  supplier: SupplierOutsourcing,
  field: FilterFieldType,
  value: string
): boolean {
  const normalizedValue = value.toLowerCase().trim()

  switch (field) {
    case "searchAllFields":
      return searchAllFields(supplier, normalizedValue)

    case "providerName":
      return supplier.serviceProvider.name.toLowerCase().includes(normalizedValue)

    case "category":
      return supplier.category.toLowerCase() === value.toLowerCase()

    case "servicePerformanceCountries":
      // Check if any country in the array matches (case-insensitive partial match)
      return supplier.location.servicePerformanceCountries.some((country) =>
        country.toLowerCase().includes(normalizedValue)
      )

    case "dataLocationCountry":
      // Check if any country in the array matches (case-insensitive partial match)
      return supplier.location.dataLocationCountry.some((country) =>
        country.toLowerCase().includes(normalizedValue)
      )

    case "risk":
      // Only for critical suppliers
      if (!supplier.criticality.isCritical || !supplier.criticalFields) return false
      return supplier.criticalFields.riskAssessment.risk === value

    case "activitiesSubOutsourced":
      // Only for critical suppliers
      if (!supplier.criticality.isCritical || !supplier.criticalFields) return false
      const hasSubOutsourcing = !!supplier.criticalFields.subOutsourcing
      return value === "Yes" ? hasSubOutsourcing : !hasSubOutsourcing

    case "timeCritical":
      // Only for critical suppliers
      if (!supplier.criticality.isCritical || !supplier.criticalFields) return false
      return value === "Yes"
        ? supplier.criticalFields.isTimeCritical
        : !supplier.criticalFields.isTimeCritical

    default:
      return true
  }
}

/**
 * Searches across all supplier fields for a match
 * Used by the "Search All Fields" filter
 */
function searchAllFields(supplier: SupplierOutsourcing, searchTerm: string): boolean {
  // Helper to safely check if a string contains the search term
  const contains = (text: string | undefined | null): boolean => {
    if (!text) return false
    return text.toLowerCase().includes(searchTerm)
  }

  // Helper to check if any item in an array contains the search term
  const containsInArray = (arr: string[] | undefined | null): boolean => {
    if (!arr || arr.length === 0) return false
    return arr.some((item) => contains(item))
  }

  // Search basic info
  if (contains(supplier.referenceNumber)) return true
  if (contains(supplier.status)) return true
  if (contains(supplier.category)) return true

  // Search function description
  if (contains(supplier.functionDescription.name)) return true
  if (contains(supplier.functionDescription.description)) return true
  if (contains(supplier.functionDescription.dataDescription)) return true

  // Search service provider
  if (contains(supplier.serviceProvider.name)) return true
  if (contains(supplier.serviceProvider.parentCompany)) return true
  if (contains(supplier.serviceProvider.corporateRegistrationNumber)) return true
  if (contains(supplier.serviceProvider.legalEntityIdentifier)) return true
  if (contains(supplier.serviceProvider.registeredAddress)) return true
  if (contains(supplier.serviceProvider.contactDetails)) return true

  // Search location
  if (containsInArray(supplier.location.servicePerformanceCountries)) return true
  if (containsInArray(supplier.location.dataLocationCountry)) return true
  if (contains(supplier.location.otherDataLocationInfo)) return true

  // Search dates (convert to string for matching)
  if (contains(supplier.dates.startDate)) return true
  if (contains(supplier.dates.nextRenewalDate)) return true
  if (contains(supplier.dates.endDate)) return true
  if (contains(supplier.dates.serviceProviderNoticePeriod)) return true
  if (contains(supplier.dates.entityNoticePeriod)) return true

  // Search criticality
  if (contains(supplier.criticality.reasons)) return true
  if (contains(supplier.criticalityAssessmentDate)) return true

  // Search cloud service fields (if applicable)
  if (supplier.cloudService) {
    if (contains(supplier.cloudService.serviceModel)) return true
    if (contains(supplier.cloudService.deploymentModel)) return true
    if (contains(supplier.cloudService.dataNature)) return true
    if (containsInArray(supplier.cloudService.storageLocations)) return true
    if (contains(supplier.cloudService.cloudOfficer)) return true
    if (contains(supplier.cloudService.resourceOperator)) return true
  }

  // Search critical fields (if applicable)
  if (supplier.criticalFields) {
    const cf = supplier.criticalFields

    // Entities
    if (containsInArray(cf.entitiesUsing.inScopeEntities)) return true

    // Risk assessment
    if (contains(cf.riskAssessment.risk)) return true
    if (contains(cf.riskAssessment.lastAssessmentDate)) return true
    if (contains(cf.riskAssessment.mainResults)) return true

    // Approval
    if (contains(cf.approval.approverName)) return true
    if (contains(cf.approval.approverRole)) return true

    // Legal & audit
    if (contains(cf.governingLaw)) return true
    if (contains(cf.audit.lastAuditDate)) return true
    if (contains(cf.audit.nextScheduledAudit)) return true

    // Sub-outsourcing
    if (cf.subOutsourcing) {
      cf.subOutsourcing.subContractors.forEach((sub) => {
        if (contains(sub.activityDescription)) return true
        if (contains(sub.name)) return true
        if (contains(sub.registrationCountry)) return true
        if (contains(sub.servicePerformanceCountry)) return true
        if (contains(sub.dataStorageLocation)) return true
      })
    }

    // Substitutability
    if (contains(cf.substitutability.outcome)) return true
    if (contains(cf.substitutability.reintegrationSubstitutabilityAssessment)) return true
    if (contains(cf.substitutability.discontinuationImpact)) return true
    if (containsInArray(cf.alternativeProviders)) return true

    // Cost
    if (contains(cf.estimatedAnnualCost?.toString())) return true
    if (contains(cf.costComments)) return true

    // Regulatory
    if (cf.regulatoryNotification) {
      if (contains(cf.regulatoryNotification.notificationDate)) return true
    }
  }

  return false
}

/**
 * Counts the number of active filters
 */
export function countActiveFilters(
  quickFilters: QuickFilters,
  customFilters: CustomFilter[]
): number {
  let count = 0

  if (quickFilters.critical) count++
  if (quickFilters.nonCritical) count++
  if (quickFilters.cloud) count++
  if (quickFilters.serviceOutsourcings) count++

  // Count each status toggle
  if (quickFilters.status.active) count++
  if (quickFilters.status.draft) count++
  if (quickFilters.status.notYetActive) count++
  if (quickFilters.status.terminated) count++

  customFilters.forEach((filter) => {
    if (filter.field && filter.value) count++
  })

  return count
}
