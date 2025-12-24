/**
 * TypeScript types for CSSF Circular 22/806 Supplier Outsourcing Register
 * Reference: Section 4.2.7
 */

// Enums
export enum OutsourcingCategory {
  CLOUD = "Cloud",
  ICT = "ICT Services",
  INTERNAL_CONTROL = "Internal Control Functions",
  PAYMENT_PROCESSING = "Payment Processing",
  DATA_STORAGE = "Data Storage & Hosting",
  CUSTOMER_SERVICE = "Customer Service",
  FACILITIES = "Facilities Management",
  MARKETING = "Marketing & Communications",
  COMPLIANCE = "Compliance Services",
  AUDIT = "Audit Services",
  ACCOUNTING = "Accounting Services",
  OTHER = "Other",
}

export enum CloudServiceModel {
  IAAS = "IaaS (Infrastructure as a Service)",
  PAAS = "PaaS (Platform as a Service)",
  SAAS = "SaaS (Software as a Service)",
  NOT_APPLICABLE = "N/A",
}

export enum DeploymentModel {
  PUBLIC = "Public Cloud",
  PRIVATE = "Private Cloud",
  HYBRID = "Hybrid Cloud",
  COMMUNITY = "Community Cloud",
  NOT_APPLICABLE = "N/A",
}

export enum SubstitutabilityOutcome {
  EASY = "Easy",
  DIFFICULT = "Difficult",
  IMPOSSIBLE = "Impossible",
}

export enum OutsourcingStatus {
  DRAFT = "Draft",
  ACTIVE = "Active",
  NOT_YET_ACTIVE = "Not Yet Active",
  TERMINATED = "Terminated",
}

export enum RiskLevel {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

/**
 * Mandatory fields for ALL outsourcing arrangements (Point 54)
 * 25 fields total. All fields are mandatory per CSSF requirements except:
 * - legalEntityIdentifier (optional "if any")
 * - parentCompany (optional "if any")
 */
export interface MandatoryOutsourcingFields {
  // 54.a - Reference Number
  referenceNumber: string

  // 54.b - Dates (all mandatory per CSSF Point 54.b)
  dates: {
    startDate: string
    nextRenewalDate: string
    endDate: string
    serviceProviderNoticePeriod: string
    entityNoticePeriod: string
  }

  // 53 - Status of outsourcing arrangement
  status: OutsourcingStatus

  // 54.c - Function Description
  functionDescription: {
    name: string
    description: string
    dataDescription: string
    personalDataInvolved: boolean
    personalDataTransferred: boolean
  }

  // 54.d - Category of outsourcing
  category: string // Changed from enum to allow custom categories

  // 54.e - Service Provider Information
  serviceProvider: {
    name: string
    corporateRegistrationNumber: string
    legalEntityIdentifier?: string // Optional: "if any" per CSSF
    registeredAddress: string
    contactDetails: string
    parentCompany?: string // Optional: "if any" per CSSF
  }

  // 54.f - Location Information (all mandatory per CSSF Point 54.f)
  location: {
    servicePerformanceCountries: string[]
    dataLocationCountry: string[]
    otherDataLocationInfo: string
  }

  // 54.g - Criticality Assessment
  criticality: {
    isCritical: boolean // Determines if Point 55 (CriticalOutsourcingFields) is required
    reasons: string
  }

  // 54.i - Criticality Assessment Date
  criticalityAssessmentDate: string

  // 54.h - Cloud Service Information (conditional: entire section only when category = Cloud)
  cloudService?: {
    serviceModel: CloudServiceModel
    deploymentModel: DeploymentModel
    dataNature: string
    storageLocations: string[]
    cloudOfficer?: string // Optional within cloud section
    resourceOperator?: string // Optional within cloud section
    otherInformation?: string // Optional: "Other Relevant Information (if any)"
  }
}

/**
 * Additional fields for CRITICAL functions only (Point 55)
 * 21 fields total. Only required when criticality.isCritical = true
 * All fields are mandatory within this section except:
 * - subOutsourcing.subContractors (conditional: only when hasSubOutsourcing = true)
 */
export interface CriticalOutsourcingFields {
  // 55.a - Entities Using the Outsourcing
  entitiesUsing: {
    inScopeEntities: string[]
  }

  // 55.b - Group Relationship
  groupRelationship: {
    isPartOfGroup: boolean
  }

  // 55.c - Risk Assessment
  riskAssessment: {
    risk: RiskLevel
    lastAssessmentDate: string
    mainResults: string
  }

  // 55.d - Approval
  approval: {
    approverName: string
    approverRole: string
  }

  // 55.e - Governing Law
  governingLaw: string

  // 55.f - Audit Information (all mandatory per CSSF Point 55.f)
  audit: {
    lastAuditDate: string
    nextScheduledAudit: string
  }

  // 55.g - Sub-Outsourcing Information (conditional: only when sub-outsourcing exists)
  subOutsourcing?: {
    hasSubOutsourcing: boolean // Are activities sub-outsourced? (Yes/No)
    subContractors: Array<{
      name: string
      activityDescription: string
      registrationCountry: string
      servicePerformanceCountry: string
      dataStorageLocation: string
      otherInformation?: string // Optional: "Other Sub-Outsourcing Information (if any)"
    }>
  }

  // 55.h - Substitutability Assessment
  substitutability: {
    outcome: SubstitutabilityOutcome
    reintegrationSubstitutabilityAssessment: string
    discontinuationImpact: string
  }

  // 55.i - Alternative Service Providers
  alternativeProviders: string[]

  // 55.j - Time Criticality
  isTimeCritical: boolean

  // 55.k - Cost Information (all mandatory per CSSF Point 55.k)
  estimatedAnnualCost: number
  costComments: string

  // 55.l - Regulatory Notification (all mandatory per CSSF Point 55.l)
  regulatoryNotification: {
    notificationDate: string
  }
}

/**
 * Complete supplier outsourcing type
 * Combines mandatory fields (Point 54: 25 fields) with conditional critical fields (Point 55: 21 fields)
 * Total: 52 CSSF-compliant fields
 */
export interface SupplierOutsourcing extends MandatoryOutsourcingFields {
  /**
   * Critical fields - conditional section only required when criticality.isCritical = true
   * Contains all Point 55 fields (21 fields)
   */
  criticalFields?: CriticalOutsourcingFields

  /**
   * Incomplete fields tracking - array of field paths that are mandatory but not filled
   * Not actively used in Phase 1, reserved for future dashboard/analytics
   * Field path examples: "serviceProvider.name", "dates.startDate"
   */
  incompleteFields?: string[]

  /**
   * Pending fields tracking - array of field paths marked as "to be completed later"
   * Pending fields:
   * - Skip validation (can save supplier with pending fields empty)
   * - Display amber pin indicator in register view
   * - Show "*" marker in exports
   * Field path examples: "referenceNumber", "dates.startDate", "serviceProvider.name", "criticalFields.riskAssessment.risk"
   */
  pendingFields?: string[]
}
