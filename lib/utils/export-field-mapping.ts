/**
 * Field mapping configuration for CSSF Supplier Register exports
 * Maps all 52 fields to column headers with CSSF circular references
 */

import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { OutsourcingCategory } from "@/lib/types/supplier"

/**
 * Field definition for export mapping
 */
export interface FieldMapping {
  /** Path to field in SupplierOutsourcing object (e.g., "serviceProvider.name") */
  path: string
  /** Column header with CSSF reference (e.g., "Provider Name (54.e)") */
  header: string
  /** CSSF circular reference (e.g., "54.e") */
  cssfRef: string
  /** Field type for formatting */
  type: "string" | "date" | "boolean" | "number" | "enum" | "array" | "arrayObject"
  /** Is this field conditional (Cloud or Critical)? */
  conditional?: "cloud" | "critical"
  /** Column width in characters (for Excel) */
  width: number
}

/**
 * Summary view field mapping (8 columns shown in register table)
 * Note: Headers do NOT include CSSF references (user preference for summary view)
 */
export const SUMMARY_FIELDS: FieldMapping[] = [
  {
    path: "referenceNumber",
    header: "Reference Number",
    cssfRef: "54.a",
    type: "string",
    width: 15,
  },
  {
    path: "functionDescription.name",
    header: "Function Name",
    cssfRef: "54.c",
    type: "string",
    width: 30,
  },
  {
    path: "serviceProvider.name",
    header: "Provider Name",
    cssfRef: "54.e",
    type: "string",
    width: 30,
  },
  {
    path: "category",
    header: "Category",
    cssfRef: "54.d",
    type: "enum",
    width: 20,
  },
  {
    path: "status",
    header: "Status",
    cssfRef: "53",
    type: "enum",
    width: 15,
  },
  {
    path: "criticality.isCritical",
    header: "Is Critical?",
    cssfRef: "54.g",
    type: "boolean",
    width: 10,
  },
  {
    path: "dates.startDate",
    header: "Start Date",
    cssfRef: "54.b",
    type: "date",
    width: 12,
  },
  {
    path: "criticalFields.regulatoryNotification.notificationDate",
    header: "CSSF Notification Date",
    cssfRef: "55.l",
    type: "date",
    conditional: "critical",
    width: 12,
  },
]

/**
 * Full export field mapping (52 fields)
 * Organized by CSSF section: Mandatory → Cloud → Critical
 */
export const FULL_FIELDS: FieldMapping[] = [
  // ====================
  // MANDATORY FIELDS (25 fields) - Point 54
  // ====================
  {
    path: "referenceNumber",
    header: "Reference Number (54.a)",
    cssfRef: "54.a",
    type: "string",
    width: 15,
  },
  {
    path: "status",
    header: "Status (53)",
    cssfRef: "53",
    type: "enum",
    width: 15,
  },
  // Dates (Point 54.b)
  {
    path: "dates.startDate",
    header: "Start Date (54.b)",
    cssfRef: "54.b",
    type: "date",
    width: 12,
  },
  {
    path: "dates.nextRenewalDate",
    header: "Next Renewal Date (54.b)",
    cssfRef: "54.b",
    type: "date",
    width: 12,
  },
  {
    path: "dates.endDate",
    header: "End Date (54.b)",
    cssfRef: "54.b",
    type: "date",
    width: 12,
  },
  {
    path: "dates.serviceProviderNoticePeriod",
    header: "Service Provider Notice Period (54.b)",
    cssfRef: "54.b",
    type: "string",
    width: 30,
  },
  {
    path: "dates.entityNoticePeriod",
    header: "Entity Notice Period (54.b)",
    cssfRef: "54.b",
    type: "string",
    width: 30,
  },
  // Function Description (Point 54.c)
  {
    path: "functionDescription.name",
    header: "Function Name (54.c)",
    cssfRef: "54.c",
    type: "string",
    width: 30,
  },
  {
    path: "functionDescription.description",
    header: "Function Description (54.c)",
    cssfRef: "54.c",
    type: "string",
    width: 30,
  },
  {
    path: "functionDescription.dataDescription",
    header: "Data Description (54.c)",
    cssfRef: "54.c",
    type: "string",
    width: 30,
  },
  {
    path: "functionDescription.personalDataInvolved",
    header: "Personal Data Involved? (54.c)",
    cssfRef: "54.c",
    type: "boolean",
    width: 10,
  },
  {
    path: "functionDescription.personalDataTransferred",
    header: "Personal Data Transferred? (54.c)",
    cssfRef: "54.c",
    type: "boolean",
    width: 10,
  },
  // Category (Point 54.d)
  {
    path: "category",
    header: "Category (54.d)",
    cssfRef: "54.d",
    type: "enum",
    width: 20,
  },
  // Service Provider (Point 54.e)
  {
    path: "serviceProvider.name",
    header: "Provider Name (54.e)",
    cssfRef: "54.e",
    type: "string",
    width: 30,
  },
  {
    path: "serviceProvider.corporateRegistrationNumber",
    header: "Corporate Registration Number (54.e)",
    cssfRef: "54.e",
    type: "string",
    width: 20,
  },
  {
    path: "serviceProvider.legalEntityIdentifier",
    header: "LEI (if any) (54.e)",
    cssfRef: "54.e",
    type: "string",
    width: 20,
  },
  {
    path: "serviceProvider.registeredAddress",
    header: "Registered Address (54.e)",
    cssfRef: "54.e",
    type: "string",
    width: 30,
  },
  {
    path: "serviceProvider.contactDetails",
    header: "Contact Details (54.e)",
    cssfRef: "54.e",
    type: "string",
    width: 30,
  },
  {
    path: "serviceProvider.parentCompany",
    header: "Parent Company (if any) (54.e)",
    cssfRef: "54.e",
    type: "string",
    width: 30,
  },
  // Location (Point 54.f)
  {
    path: "location.servicePerformanceCountries",
    header: "Service Performance Countries (54.f)",
    cssfRef: "54.f",
    type: "array",
    width: 30,
  },
  {
    path: "location.dataLocationCountry",
    header: "Data Location Countries (54.f)",
    cssfRef: "54.f",
    type: "array",
    width: 30,
  },
  {
    path: "location.otherDataLocationInfo",
    header: "Other Data Location Information (54.f)",
    cssfRef: "54.f",
    type: "string",
    width: 30,
  },
  // Criticality Assessment (Point 54.g)
  {
    path: "criticality.isCritical",
    header: "Is Critical? (54.g)",
    cssfRef: "54.g",
    type: "boolean",
    width: 10,
  },
  {
    path: "criticality.reasons",
    header: "Criticality Reasons (54.g)",
    cssfRef: "54.g",
    type: "string",
    width: 30,
  },
  // Criticality Assessment Date (Point 54.i)
  {
    path: "criticalityAssessmentDate",
    header: "Criticality Assessment Date (54.i)",
    cssfRef: "54.i",
    type: "date",
    width: 12,
  },

  // ====================
  // CLOUD SERVICE FIELDS (6 fields) - Point 54.h (Conditional)
  // ====================
  {
    path: "cloudService.serviceModel",
    header: "Cloud Service Model (54.h)",
    cssfRef: "54.h",
    type: "enum",
    conditional: "cloud",
    width: 30,
  },
  {
    path: "cloudService.deploymentModel",
    header: "Deployment Model (54.h)",
    cssfRef: "54.h",
    type: "enum",
    conditional: "cloud",
    width: 20,
  },
  {
    path: "cloudService.dataNature",
    header: "Data Nature (54.h)",
    cssfRef: "54.h",
    type: "string",
    conditional: "cloud",
    width: 30,
  },
  {
    path: "cloudService.storageLocations",
    header: "Storage Locations (54.h)",
    cssfRef: "54.h",
    type: "array",
    conditional: "cloud",
    width: 30,
  },
  {
    path: "cloudService.cloudOfficer",
    header: "Cloud Officer (54.h)",
    cssfRef: "54.h",
    type: "string",
    conditional: "cloud",
    width: 30,
  },
  {
    path: "cloudService.resourceOperator",
    header: "Resource Operator (54.h)",
    cssfRef: "54.h",
    type: "string",
    conditional: "cloud",
    width: 30,
  },
  {
    path: "cloudService.otherInformation",
    header: "Other Cloud Information (if any) (54.h)",
    cssfRef: "54.h",
    type: "string",
    conditional: "cloud",
    width: 30,
  },

  // ====================
  // CRITICAL FUNCTION FIELDS (20 fields) - Point 55 (Conditional)
  // ====================
  {
    path: "criticalFields.entitiesUsing.inScopeEntities",
    header: "In-Scope Entities (55.a)",
    cssfRef: "55.a",
    type: "array",
    conditional: "critical",
    width: 30,
  },
  {
    path: "criticalFields.groupRelationship.isPartOfGroup",
    header: "Part of Group? (55.b)",
    cssfRef: "55.b",
    type: "boolean",
    conditional: "critical",
    width: 10,
  },
  {
    path: "criticalFields.riskAssessment.risk",
    header: "Risk Level (55.c)",
    cssfRef: "55.c",
    type: "enum",
    conditional: "critical",
    width: 15,
  },
  {
    path: "criticalFields.riskAssessment.lastAssessmentDate",
    header: "Last Risk Assessment Date (55.c)",
    cssfRef: "55.c",
    type: "date",
    conditional: "critical",
    width: 12,
  },
  {
    path: "criticalFields.riskAssessment.mainResults",
    header: "Risk Assessment Summary (55.c)",
    cssfRef: "55.c",
    type: "string",
    conditional: "critical",
    width: 30,
  },
  {
    path: "criticalFields.approval.approverName",
    header: "Approver Name & Role (55.d)",
    cssfRef: "55.d",
    type: "string",
    conditional: "critical",
    width: 30,
  },
  {
    path: "criticalFields.approval.approverRole",
    header: "Board Approval (55.d)",
    cssfRef: "55.d",
    type: "string",
    conditional: "critical",
    width: 30,
  },
  {
    path: "criticalFields.governingLaw",
    header: "Governing Law (55.e)",
    cssfRef: "55.e",
    type: "string",
    conditional: "critical",
    width: 30,
  },
  {
    path: "criticalFields.audit.lastAuditDate",
    header: "Last Audit Date (55.f)",
    cssfRef: "55.f",
    type: "date",
    conditional: "critical",
    width: 12,
  },
  {
    path: "criticalFields.audit.nextScheduledAudit",
    header: "Next Scheduled Audit (55.f)",
    cssfRef: "55.f",
    type: "date",
    conditional: "critical",
    width: 12,
  },
  {
    path: "criticalFields.subOutsourcing.hasSubOutsourcing",
    header: "Activities are Sub-Outsourced? (55.g)",
    cssfRef: "55.g",
    type: "boolean",
    conditional: "critical",
    width: 15,
  },
  {
    path: "criticalFields.subOutsourcing.subContractors",
    header: "Sub-Contractors (55.g): Name | Activity | Reg. Country | Service Country | Data Storage | Other Info",
    cssfRef: "55.g",
    type: "arrayObject",
    conditional: "critical",
    width: 35,
  },
  {
    path: "criticalFields.substitutability.outcome",
    header: "Substitutability Outcome (55.h)",
    cssfRef: "55.h",
    type: "enum",
    conditional: "critical",
    width: 20,
  },
  {
    path: "criticalFields.substitutability.reintegrationSubstitutabilityAssessment",
    header: "Reintegration/Substitutability Assessment (55.h)",
    cssfRef: "55.h",
    type: "string",
    conditional: "critical",
    width: 30,
  },
  {
    path: "criticalFields.substitutability.discontinuationImpact",
    header: "Discontinuation Impact (55.h)",
    cssfRef: "55.h",
    type: "string",
    conditional: "critical",
    width: 30,
  },
  {
    path: "criticalFields.alternativeProviders",
    header: "Alternative Providers (55.i)",
    cssfRef: "55.i",
    type: "array",
    conditional: "critical",
    width: 30,
  },
  {
    path: "criticalFields.isTimeCritical",
    header: "Time-Critical Function? (55.j)",
    cssfRef: "55.j",
    type: "boolean",
    conditional: "critical",
    width: 10,
  },
  {
    path: "criticalFields.estimatedAnnualCost",
    header: "Estimated Annual Cost (55.k)",
    cssfRef: "55.k",
    type: "number",
    conditional: "critical",
    width: 15,
  },
  {
    path: "criticalFields.costComments",
    header: "Cost Comments (55.k)",
    cssfRef: "55.k",
    type: "string",
    conditional: "critical",
    width: 30,
  },
  {
    path: "criticalFields.regulatoryNotification.notificationDate",
    header: "CSSF Notification Date (55.l)",
    cssfRef: "55.l",
    type: "date",
    conditional: "critical",
    width: 12,
  },
]

/**
 * Helper function to check if a field is conditional (Cloud or Critical)
 */
export function isConditionalField(
  fieldPath: string,
  supplier: SupplierOutsourcing
): boolean {
  // Cloud fields are conditional when category !== CLOUD
  if (fieldPath.startsWith("cloudService")) {
    return supplier.category !== OutsourcingCategory.CLOUD
  }

  // Critical fields are conditional when not critical
  if (fieldPath.startsWith("criticalFields")) {
    return !supplier.criticality.isCritical
  }

  return false
}

/**
 * Helper function to get nested field value from supplier object
 * @param supplier - Supplier object
 * @param path - Dot-notation path (e.g., "serviceProvider.name")
 * @returns Field value or undefined
 */
export function getFieldValue(
  supplier: SupplierOutsourcing,
  path: string
): unknown {
  const keys = path.split(".")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = supplier

  for (const key of keys) {
    if (value === null || value === undefined) {
      return undefined
    }
    value = value[key]
  }

  return value
}
