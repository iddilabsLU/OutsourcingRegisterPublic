/**
 * Dashboard Analytics Utilities
 * CSSF Circular 22/806 compliance monitoring calculations
 */

import type { SupplierOutsourcing } from "@/lib/types/supplier"
import type {
  OverdueAssessments,
  UpcomingReviews,
  UpcomingRenewals,
  KeyMetrics,
  StatusBreakdown,
  CategoryBreakdown,
  RiskDistribution,
  ProviderConcentration,
  GeographicDistribution,
  CriticalAnalysis,
  NotificationStatus,
  PendingFieldsMetrics,
} from "@/lib/types/dashboard"

// ============================================================================
// Date Helper Functions
// ============================================================================

/**
 * Calculate days between a date string and current date
 * Returns Infinity for invalid dates (never overdue)
 */
export function daysBetween(dateStr: string, currentDate: Date): number {
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) {
      return Infinity // Invalid date = never overdue
    }
    const diffMs = currentDate.getTime() - date.getTime()
    return Math.floor(diffMs / (1000 * 60 * 60 * 24))
  } catch {
    return Infinity
  }
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Group array by key function
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce((acc, item) => {
    const key = keyFn(item)
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

// ============================================================================
// Phase 1 Analytics Functions
// ============================================================================

/**
 * Get overdue assessments (Point 54.i, 55.c, 55.f)
 * Overdue = >365 days since last assessment
 */
export function getOverdueAssessments(
  suppliers: SupplierOutsourcing[]
): OverdueAssessments {
  const today = new Date()
  const overdueThreshold = 365

  // Criticality assessments (ALL suppliers - Point 54.i)
  const overdueCriticality = suppliers.filter((s) => {
    const daysSince = daysBetween(s.criticalityAssessmentDate, today)
    return daysSince > overdueThreshold
  })

  // Risk assessments (Critical only - Point 55.c)
  const overdueRisk = suppliers.filter((s) => {
    if (
      !s.criticality.isCritical ||
      !s.criticalFields?.riskAssessment.lastAssessmentDate
    ) {
      return false
    }
    const daysSince = daysBetween(
      s.criticalFields.riskAssessment.lastAssessmentDate,
      today
    )
    return daysSince > overdueThreshold
  })

  // Audits (Critical only - Point 55.f)
  const overdueAudits = suppliers.filter((s) => {
    if (
      !s.criticality.isCritical ||
      !s.criticalFields?.audit.lastAuditDate
    ) {
      return false
    }
    const daysSince = daysBetween(s.criticalFields.audit.lastAuditDate, today)
    return daysSince > overdueThreshold
  })

  // Combine all overdue suppliers (unique set)
  const allOverdueSuppliers = new Set([
    ...overdueCriticality,
    ...overdueRisk,
    ...overdueAudits,
  ])

  return {
    criticalityCount: overdueCriticality.length,
    riskCount: overdueRisk.length,
    auditCount: overdueAudits.length,
    suppliers: Array.from(allOverdueSuppliers),
  }
}

/**
 * Get upcoming reviews (within 30 days of annual deadline)
 * Upcoming = 335-365 days since last assessment
 */
export function getUpcomingReviews(
  suppliers: SupplierOutsourcing[],
  days: number = 30
): UpcomingReviews {
  const today = new Date()
  const upcomingMin = 365 - days // e.g., 335 for 30-day warning
  const upcomingMax = 365

  // Criticality assessments (ALL suppliers - Point 54.i)
  const upcomingCriticality = suppliers.filter((s) => {
    const daysSince = daysBetween(s.criticalityAssessmentDate, today)
    return daysSince >= upcomingMin && daysSince <= upcomingMax
  })

  // Risk assessments (Critical only - Point 55.c)
  const upcomingRisk = suppliers.filter((s) => {
    if (
      !s.criticality.isCritical ||
      !s.criticalFields?.riskAssessment.lastAssessmentDate
    ) {
      return false
    }
    const daysSince = daysBetween(
      s.criticalFields.riskAssessment.lastAssessmentDate,
      today
    )
    return daysSince >= upcomingMin && daysSince <= upcomingMax
  })

  // Audits (Critical only - Point 55.f)
  const upcomingAudits = suppliers.filter((s) => {
    if (
      !s.criticality.isCritical ||
      !s.criticalFields?.audit.lastAuditDate
    ) {
      return false
    }
    const daysSince = daysBetween(s.criticalFields.audit.lastAuditDate, today)
    return daysSince >= upcomingMin && daysSince <= upcomingMax
  })

  // Combine all upcoming suppliers (unique set)
  const allUpcomingSuppliers = new Set([
    ...upcomingCriticality,
    ...upcomingRisk,
    ...upcomingAudits,
  ])

  return {
    criticalityCount: upcomingCriticality.length,
    riskCount: upcomingRisk.length,
    auditCount: upcomingAudits.length,
    suppliers: Array.from(allUpcomingSuppliers),
  }
}

/**
 * Get upcoming contract renewals (Point 54.b)
 */
export function getUpcomingRenewals(
  suppliers: SupplierOutsourcing[],
  days: number = 90
): UpcomingRenewals {
  const today = new Date()
  const futureDate = addDays(today, days)

  const upcoming = suppliers.filter((s) => {
    if (!s.dates.nextRenewalDate) return false
    const renewalDate = new Date(s.dates.nextRenewalDate)
    return renewalDate >= today && renewalDate <= futureDate
  })

  // Group by month (YYYY-MM format)
  const byMonth = groupBy(upcoming, (s) => {
    const date = new Date(s.dates.nextRenewalDate!)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`
  })

  // Sort suppliers by renewal date
  const sortedSuppliers = upcoming.sort((a, b) => {
    const dateA = new Date(a.dates.nextRenewalDate!).getTime()
    const dateB = new Date(b.dates.nextRenewalDate!).getTime()
    return dateA - dateB
  })

  return {
    total: upcoming.length,
    byMonth,
    suppliers: sortedSuppliers,
  }
}

/**
 * Get key metrics for dashboard cards
 */
export function getKeyMetrics(suppliers: SupplierOutsourcing[]): KeyMetrics {
  const total = suppliers.length
  const critical = suppliers.filter((s) => s.criticality.isCritical).length
  const cloud = suppliers.filter(
    (s) => s.category === "Cloud"
  ).length
  const pending = suppliers.filter(
    (s) => s.pendingFields && s.pendingFields.length > 0
  ).length

  return {
    total,
    critical,
    criticalPercentage: total > 0 ? Math.round((critical / total) * 100) : 0,
    cloud,
    cloudPercentage: total > 0 ? Math.round((cloud / total) * 100) : 0,
    pending,
    pendingPercentage: total > 0 ? Math.round((pending / total) * 100) : 0,
  }
}

/**
 * Get pending fields metrics
 */
export function getPendingFieldsMetrics(
  suppliers: SupplierOutsourcing[]
): PendingFieldsMetrics {
  const suppliersWithPending = suppliers.filter(
    (s) => s.pendingFields && s.pendingFields.length > 0
  )

  const totalPendingFields = suppliers.reduce(
    (sum, s) => sum + (s.pendingFields?.length || 0),
    0
  )

  // Calculate completeness rate
  const totalFields = 52 // CSSF compliant fields per supplier
  const totalPossibleFields = suppliers.length * totalFields
  const completenessRate =
    totalPossibleFields > 0
      ? Math.round(
          ((totalPossibleFields - totalPendingFields) / totalPossibleFields) *
            100
        )
      : 100

  // Top 5 incomplete suppliers
  const topIncomplete = suppliersWithPending
    .sort((a, b) => (b.pendingFields?.length || 0) - (a.pendingFields?.length || 0))
    .slice(0, 5)

  return {
    suppliersWithPending: suppliersWithPending.length,
    totalPendingFields,
    completenessRate,
    topIncomplete,
  }
}

/**
 * Get status breakdown for pie chart
 */
export function getStatusBreakdown(
  suppliers: SupplierOutsourcing[]
): StatusBreakdown[] {
  const counts = suppliers.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(counts).map(([status, value]) => ({
    name: status,
    value,
    percentage: Math.round((value / suppliers.length) * 100),
  }))
}

/**
 * Get category breakdown for bar chart
 */
export function getCategoryBreakdown(
  suppliers: SupplierOutsourcing[]
): CategoryBreakdown[] {
  const counts = suppliers.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: Math.round((count / suppliers.length) * 100),
    }))
    .sort((a, b) => b.count - a.count) // Descending by count
}

// ============================================================================
// Phase 2 Analytics Functions
// ============================================================================

/**
 * Get risk distribution (critical suppliers only)
 */
export function getRiskDistribution(
  suppliers: SupplierOutsourcing[]
): RiskDistribution[] {
  // Filter to only critical suppliers
  const criticalSuppliers = suppliers.filter((s) => s.criticality.isCritical)

  // Count by risk level
  const counts = criticalSuppliers.reduce((acc, s) => {
    const risk = s.criticalFields?.riskAssessment?.risk
    if (risk) {
      acc[risk] = (acc[risk] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  // Return in expected order: High, Medium, Low
  const order = ["High", "Medium", "Low"]
  return order.map((name) => ({
    name,
    count: counts[name] || 0,
  }))
}

/**
 * Get provider concentration risk analysis
 * Identifies providers with multiple outsourcing arrangements
 * Risk thresholds: High >35%, Medium ≥20%, Low <20%
 */
export function getProviderConcentration(
  suppliers: SupplierOutsourcing[]
): ProviderConcentration[] {
  const total = suppliers.length

  if (total === 0) return []

  // Group by provider name
  const providerCounts = suppliers.reduce((acc, s) => {
    const provider = s.serviceProvider.name
    acc[provider] = (acc[provider] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Filter to only providers with multiple arrangements and map to result format
  return Object.entries(providerCounts)
    .filter(([, count]) => count > 1) // Only providers with 2+ arrangements
    .map(([provider, count]) => {
      const percentage = Math.round((count / total) * 100)

      // Determine risk level based on concentration
      let risk: "High" | "Medium" | "Low"
      if (percentage > 35) {
        risk = "High"
      } else if (percentage >= 20) {
        risk = "Medium"
      } else {
        risk = "Low"
      }

      return {
        provider,
        count,
        percentage,
        risk,
      }
    })
    .sort((a, b) => b.count - a.count) // Sort descending by count
}

/**
 * Get geographic distribution (data location & service performance)
 * Returns country-to-supplier mappings grouped by EU/Non-EU
 */
export function getGeographicDistribution(
  suppliers: SupplierOutsourcing[]
): GeographicDistribution {
  const total = suppliers.length

  if (total === 0) {
    return {
      euDataCount: 0,
      euDataPercentage: 0,
      nonEuDataCount: 0,
      nonEuDataPercentage: 0,
      euDataCountries: [],
      nonEuDataCountries: [],
      euServiceCount: 0,
      euServicePercentage: 0,
      nonEuServiceCount: 0,
      nonEuServicePercentage: 0,
      euServiceCountries: [],
      nonEuServiceCountries: [],
    }
  }

  // ============================================================================
  // Data Location Country-to-Suppliers Mapping
  // ============================================================================
  const euDataMap = new Map<string, string[]>()
  const nonEuDataMap = new Map<string, string[]>()
  const euDataSupplierSet = new Set<string>()
  const nonEuDataSupplierSet = new Set<string>()

  suppliers.forEach((supplier) => {
    if (
      supplier.location.dataLocationCountry &&
      supplier.location.dataLocationCountry.length > 0
    ) {
      supplier.location.dataLocationCountry.forEach((country) => {
        if (isEU(country)) {
          const existing = euDataMap.get(country) || []
          euDataMap.set(country, [...existing, supplier.serviceProvider.name])
          euDataSupplierSet.add(supplier.referenceNumber)
        } else {
          const existing = nonEuDataMap.get(country) || []
          nonEuDataMap.set(country, [...existing, supplier.serviceProvider.name])
          nonEuDataSupplierSet.add(supplier.referenceNumber)
        }
      })
    }
  })

  // Convert maps to arrays and sort by count descending
  const euDataCountries = Array.from(euDataMap.entries())
    .map(([country, suppliers]) => ({
      country,
      suppliers,
      count: suppliers.length,
    }))
    .sort((a, b) => b.count - a.count)

  const nonEuDataCountries = Array.from(nonEuDataMap.entries())
    .map(([country, suppliers]) => ({
      country,
      suppliers,
      count: suppliers.length,
    }))
    .sort((a, b) => b.count - a.count)

  // ============================================================================
  // Service Performance Country-to-Suppliers Mapping
  // ============================================================================
  const euServiceMap = new Map<string, string[]>()
  const nonEuServiceMap = new Map<string, string[]>()
  const euServiceSupplierSet = new Set<string>()
  const nonEuServiceSupplierSet = new Set<string>()

  suppliers.forEach((supplier) => {
    if (
      supplier.location.servicePerformanceCountries &&
      supplier.location.servicePerformanceCountries.length > 0
    ) {
      supplier.location.servicePerformanceCountries.forEach((country) => {
        if (isEU(country)) {
          const existing = euServiceMap.get(country) || []
          euServiceMap.set(country, [...existing, supplier.serviceProvider.name])
          euServiceSupplierSet.add(supplier.referenceNumber)
        } else {
          const existing = nonEuServiceMap.get(country) || []
          nonEuServiceMap.set(country, [...existing, supplier.serviceProvider.name])
          nonEuServiceSupplierSet.add(supplier.referenceNumber)
        }
      })
    }
  })

  // Convert maps to arrays and sort by count descending
  const euServiceCountries = Array.from(euServiceMap.entries())
    .map(([country, suppliers]) => ({
      country,
      suppliers,
      count: suppliers.length,
    }))
    .sort((a, b) => b.count - a.count)

  const nonEuServiceCountries = Array.from(nonEuServiceMap.entries())
    .map(([country, suppliers]) => ({
      country,
      suppliers,
      count: suppliers.length,
    }))
    .sort((a, b) => b.count - a.count)

  // ============================================================================
  // Calculate Summary Counts and Percentages
  // ============================================================================
  const euDataCount = euDataSupplierSet.size
  const nonEuDataCount = nonEuDataSupplierSet.size
  const euServiceCount = euServiceSupplierSet.size
  const nonEuServiceCount = nonEuServiceSupplierSet.size

  return {
    euDataCount,
    euDataPercentage: Math.round((euDataCount / total) * 100),
    nonEuDataCount,
    nonEuDataPercentage: Math.round((nonEuDataCount / total) * 100),
    euDataCountries,
    nonEuDataCountries,
    euServiceCount,
    euServicePercentage: Math.round((euServiceCount / total) * 100),
    nonEuServiceCount,
    nonEuServicePercentage: Math.round((nonEuServiceCount / total) * 100),
    euServiceCountries,
    nonEuServiceCountries,
  }
}

/**
 * EU Member States (27 countries as of 2024)
 */
const EU_COUNTRIES = new Set([
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
])

/**
 * EEA countries (non-EU members: Iceland, Liechtenstein, Norway, Switzerland)
 */
const EEA_NON_EU = new Set([
  "Iceland",
  "Liechtenstein",
  "Norway",
  "Switzerland",
])

/**
 * Check if country is in EU
 */
export function isEU(country: string): boolean {
  return EU_COUNTRIES.has(country)
}

/**
 * Classify country jurisdiction (EU, Non-EU, EEA)
 */
export function classifyJurisdiction(
  country: string
): "EU" | "Non-EU" | "EEA" {
  if (EU_COUNTRIES.has(country)) {
    return "EU"
  }
  if (EEA_NON_EU.has(country)) {
    return "EEA"
  }
  return "Non-EU"
}

// ============================================================================
// Phase 3 Analytics Functions
// ============================================================================

/**
 * Get critical functions analysis (Point 55)
 * Analyzes group relationships, substitutability, and sub-outsourcing for critical suppliers
 */
export function getCriticalFunctionsAnalysis(
  suppliers: SupplierOutsourcing[]
): CriticalAnalysis {
  // Filter to critical suppliers only
  const criticalSuppliers = suppliers.filter((s) => s.criticality.isCritical)
  const total = criticalSuppliers.length

  if (total === 0) {
    return {
      total: 0,
      groupRelationship: {
        partOfGroup: 0,
        independent: 0,
        partOfGroupPercentage: 0,
        independentPercentage: 0,
      },
      substitutability: {
        easy: 0,
        difficult: 0,
        impossible: 0,
        easyPercentage: 0,
        difficultPercentage: 0,
        impossiblePercentage: 0,
      },
      subOutsourcing: {
        withSubContractors: 0,
        withoutSubContractors: 0,
        withPercentage: 0,
        withoutPercentage: 0,
      },
    }
  }

  // Group Relationship Analysis
  let partOfGroup = 0
  let independent = 0

  criticalSuppliers.forEach((s) => {
    const gr = s.criticalFields?.groupRelationship
    if (gr) {
      if (gr.isPartOfGroup) partOfGroup++
      if (!gr.isPartOfGroup) independent++
    }
  })

  // Substitutability Analysis
  let easy = 0
  let difficult = 0
  let impossible = 0

  criticalSuppliers.forEach((s) => {
    const outcome = s.criticalFields?.substitutability?.outcome
    if (outcome === "Easy") easy++
    else if (outcome === "Difficult") difficult++
    else if (outcome === "Impossible") impossible++
  })

  // Sub-Outsourcing Analysis
  let withSubContractors = 0
  let withoutSubContractors = 0

  criticalSuppliers.forEach((s) => {
    const hasSubOutsourcing = s.criticalFields?.subOutsourcing?.hasSubOutsourcing
    if (hasSubOutsourcing === true) {
      withSubContractors++
    } else if (hasSubOutsourcing === false) {
      withoutSubContractors++
    }
  })

  return {
    total,
    groupRelationship: {
      partOfGroup,
      independent,
      partOfGroupPercentage: Math.round((partOfGroup / total) * 100),
      independentPercentage: Math.round((independent / total) * 100),
    },
    substitutability: {
      easy,
      difficult,
      impossible,
      easyPercentage: Math.round((easy / total) * 100),
      difficultPercentage: Math.round((difficult / total) * 100),
      impossiblePercentage: Math.round((impossible / total) * 100),
    },
    subOutsourcing: {
      withSubContractors,
      withoutSubContractors,
      withPercentage: Math.round((withSubContractors / total) * 100),
      withoutPercentage: Math.round((withoutSubContractors / total) * 100),
    },
  }
}

/**
 * Get regulatory notification status (Point 55.l)
 * Critical suppliers must be notified to CSSF. Active suppliers without notification are non-compliant.
 */
export function getRegulatoryNotificationStatus(
  suppliers: SupplierOutsourcing[]
): NotificationStatus {
  // Filter to critical suppliers only
  const criticalSuppliers = suppliers.filter((s) => s.criticality.isCritical)
  const total = criticalSuppliers.length

  if (total === 0) {
    return {
      total: 0,
      notifiedCount: 0,
      notNotifiedCount: 0,
      notifiedPercentage: 0,
      notNotifiedPercentage: 0,
      pendingNotifications: [],
    }
  }

  // Check notification status
  const notified = criticalSuppliers.filter(
    (s) => s.criticalFields?.regulatoryNotification?.notificationDate
  )
  const notNotified = criticalSuppliers.filter(
    (s) => !s.criticalFields?.regulatoryNotification?.notificationDate
  )

  // Map to pending notifications format
  const pendingNotifications = notNotified.map((s) => ({
    referenceNumber: s.referenceNumber,
    providerName: s.serviceProvider.name,
    status: s.status,
    isNonCompliant: s.status === "Active", // Active suppliers without notification are non-compliant
  }))

  return {
    total,
    notifiedCount: notified.length,
    notNotifiedCount: notNotified.length,
    notifiedPercentage: Math.round((notified.length / total) * 100),
    notNotifiedPercentage: Math.round((notNotified.length / total) * 100),
    pendingNotifications,
  }
}
