/**
 * TypeScript types for Dashboard Analytics
 * CSSF Circular 22/806 compliance monitoring
 */

import type { SupplierOutsourcing, OutsourcingStatus } from "./supplier"

export interface OverdueAssessments {
  criticalityCount: number
  riskCount: number
  auditCount: number
  suppliers: SupplierOutsourcing[]
}

export interface UpcomingReviews {
  criticalityCount: number
  riskCount: number
  auditCount: number
  suppliers: SupplierOutsourcing[]
}

export interface UpcomingRenewals {
  total: number
  byMonth: Record<string, SupplierOutsourcing[]>
  suppliers: SupplierOutsourcing[]
}

export interface KeyMetrics {
  total: number
  critical: number
  criticalPercentage: number
  cloud: number
  cloudPercentage: number
  pending: number
  pendingPercentage: number
}

export interface StatusBreakdown {
  name: string
  value: number
  percentage: number
  [key: string]: string | number // Index signature for Recharts compatibility
}

export interface CategoryBreakdown {
  name: string
  count: number
  percentage: number
}

export interface RiskDistribution {
  name: string
  count: number
}

export interface ProviderConcentration {
  provider: string
  count: number
  percentage: number
  risk: "High" | "Medium" | "Low"
}

export interface GeographicBreakdown {
  country: string
  count: number
  percentage: number
  jurisdiction: "EU" | "Non-EU" | "EEA"
}

export interface CountrySupplierMapping {
  country: string
  suppliers: string[] // supplier provider names
  count: number
}

export interface GeographicDistribution {
  // Data Location
  euDataCount: number
  euDataPercentage: number
  nonEuDataCount: number
  nonEuDataPercentage: number
  euDataCountries: CountrySupplierMapping[]
  nonEuDataCountries: CountrySupplierMapping[]

  // Service Performance
  euServiceCount: number
  euServicePercentage: number
  nonEuServiceCount: number
  nonEuServicePercentage: number
  euServiceCountries: CountrySupplierMapping[]
  nonEuServiceCountries: CountrySupplierMapping[]
}

export interface CriticalAnalysis {
  total: number
  groupRelationship: {
    partOfGroup: number
    independent: number
    partOfGroupPercentage: number
    independentPercentage: number
  }
  substitutability: {
    easy: number
    difficult: number
    impossible: number
    easyPercentage: number
    difficultPercentage: number
    impossiblePercentage: number
  }
  subOutsourcing: {
    withSubContractors: number
    withoutSubContractors: number
    withPercentage: number
    withoutPercentage: number
  }
}

export interface NotificationStatus {
  total: number
  notifiedCount: number
  notNotifiedCount: number
  notifiedPercentage: number
  notNotifiedPercentage: number
  pendingNotifications: {
    referenceNumber: string
    providerName: string
    status: OutsourcingStatus
    isNonCompliant: boolean
  }[]
}

export interface PendingFieldsMetrics {
  suppliersWithPending: number
  totalPendingFields: number
  completenessRate: number
  topIncomplete: SupplierOutsourcing[]
}
