import { z } from "zod"
import { OutsourcingStatus, CloudServiceModel, DeploymentModel, RiskLevel, SubstitutabilityOutcome } from "@/lib/types/supplier"

/**
 * Zod validation schema for Supplier Outsourcing Form
 *
 * NOTE: All fields are optional to allow partial saves.
 * Mandatory field checking is handled separately by check-completeness.ts
 * This schema only validates data types and structure (no content validation).
 * Real-time validation (red borders) is disabled - validation happens on save via completeness checker.
 */

export const supplierFormSchema = z.object({
  // 54.a - Reference Number
  referenceNumber: z.string().optional(),

  // 53 - Status
  status: z.nativeEnum(OutsourcingStatus).optional(),

  // 54.b - Dates
  dates: z
    .object({
      startDate: z.string().optional(),
      nextRenewalDate: z.string().optional(),
      endDate: z.string().optional(),
      serviceProviderNoticePeriod: z.string().optional(),
      entityNoticePeriod: z.string().optional(),
    })
    .optional(),

  // 54.c - Function Description
  functionDescription: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      dataDescription: z.string().optional(),
      personalDataInvolved: z.boolean().optional(),
      personalDataTransferred: z.boolean().optional(),
    })
    .optional(),

  // 54.d - Category
  category: z.string().min(1, "Category is required").optional(),

  // 54.e - Service Provider Information
  serviceProvider: z
    .object({
      name: z.string().optional(),
      corporateRegistrationNumber: z.string().optional(),
      legalEntityIdentifier: z.string().optional(),
      registeredAddress: z.string().optional(),
      contactDetails: z.string().optional(),
      parentCompany: z.string().optional(),
    })
    .optional(),

  // 54.f - Location Information
  location: z
    .object({
      servicePerformanceCountries: z.array(z.string()).optional(),
      dataLocationCountry: z.array(z.string()).optional(),
      otherDataLocationInfo: z.string().optional(),
    })
    .optional(),

  // 54.g - Criticality Assessment
  criticality: z
    .object({
      isCritical: z.boolean().optional(),
      reasons: z.string().optional(),
    })
    .optional(),

  // 54.i - Criticality Assessment Date
  criticalityAssessmentDate: z.string().optional(),

  // 54.h - Cloud Service Information (conditional)
  cloudService: z
    .object({
      serviceModel: z.nativeEnum(CloudServiceModel).optional(),
      deploymentModel: z.nativeEnum(DeploymentModel).optional(),
      dataNature: z.string().optional(),
      storageLocations: z.array(z.string()).optional(),
      cloudOfficer: z.string().optional(),
      resourceOperator: z.string().optional(),
      otherInformation: z.string().optional(),
    })
    .optional()
    .nullable(),

  // Critical Fields (Point 55) - only if critical
  criticalFields: z
    .object({
      // 55.a - Entities Using
      entitiesUsing: z
        .object({
          inScopeEntities: z.array(z.string()).optional(),
        })
        .optional(),

      // 55.b - Group Relationship
      groupRelationship: z
        .object({
          isPartOfGroup: z.boolean().optional(),
        })
        .optional(),

      // 55.c - Risk Assessment
      riskAssessment: z
        .object({
          risk: z.nativeEnum(RiskLevel).optional(),
          lastAssessmentDate: z.string().optional(),
          mainResults: z.string().optional(),
        })
        .optional(),

      // 55.d - Approval
      approval: z
        .object({
          approverName: z.string().optional(),
          approverRole: z.string().optional(),
        })
        .optional(),

      // 55.e - Governing Law
      governingLaw: z.string().optional(),

      // 55.f - Audit Information
      audit: z
        .object({
          lastAuditDate: z.string().optional(),
          nextScheduledAudit: z.string().optional(),
        })
        .optional(),

      // 55.g - Sub-Outsourcing Information
      subOutsourcing: z
        .object({
          hasSubOutsourcing: z.boolean().optional(),
          subContractors: z
            .array(
              z.object({
                name: z.string().optional(),
                activityDescription: z.string().optional(),
                registrationCountry: z.string().optional(),
                servicePerformanceCountry: z.string().optional(),
                dataStorageLocation: z.string().optional(),
                otherInformation: z.string().optional(),
              })
            )
            .optional(),
        })
        .optional()
        .nullable(),

      // 55.h - Substitutability Assessment
      substitutability: z
        .object({
          outcome: z.nativeEnum(SubstitutabilityOutcome).optional(),
          reintegrationSubstitutabilityAssessment: z.string().optional(),
          discontinuationImpact: z.string().optional(),
        })
        .optional(),

      // 55.i - Alternative Service Providers
      alternativeProviders: z.array(z.string()).optional(),

      // 55.j - Time Criticality
      isTimeCritical: z.boolean().optional(),

      // 55.k - Cost Information
      estimatedAnnualCost: z.union([z.string(), z.number()]).optional(),
      costComments: z.string().optional(),

      // 55.l - Regulatory Notification
      regulatoryNotification: z
        .object({
          notificationDate: z.string().optional(),
        })
        .optional()
        .nullable(),
    })
    .optional()
    .nullable(),

  // Incomplete fields tracking (populated on save)
  incompleteFields: z.array(z.string()).optional(),
})

export type SupplierFormData = z.infer<typeof supplierFormSchema>
