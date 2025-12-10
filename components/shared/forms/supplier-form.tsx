"use client"

import { useState, useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Form } from "@/components/ui/form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SupplierFormTabNav, type FormTabType } from "./supplier-form-tab-nav"
import { SupplierFormBasicInfo } from "./supplier-form-basic-info"
import { SupplierFormProvider } from "./supplier-form-provider"
import { SupplierFormCloud } from "./supplier-form-cloud"
import { SupplierFormCritical } from "./supplier-form-critical"
import { IncompleteFieldsDialog } from "./incomplete-fields-dialog"
import { FormActions } from "./form-actions"
import { supplierFormSchema, type SupplierFormData } from "@/lib/validations/supplier-schema"
import { checkIncompleteFields, generateNextReferenceNumber } from "@/lib/utils/check-completeness"
import { createEmptyCloudService, createEmptyCriticalFields, normalizeFormData } from "@/lib/utils/form-helpers"
import { OutsourcingCategory, OutsourcingStatus } from "@/lib/types/supplier"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { toast } from "sonner"

interface SupplierFormProps {
  existingSuppliers: SupplierOutsourcing[]
  onSave: (supplier: SupplierOutsourcing) => void
  onCancel: () => void
  initialData?: Partial<SupplierOutsourcing>
  mode?: "add" | "edit"
}

const DRAFT_STORAGE_KEY = "supplier-form-draft"

/**
 * Main supplier form container
 * Manages all form state, validation, and submission logic
 */
export function SupplierForm({
  existingSuppliers,
  onSave,
  onCancel,
  initialData,
  mode = "add",
}: SupplierFormProps) {
  const [activeTab, setActiveTab] = useState<FormTabType>("basic-info")
  const [showIncompleteDialog, setShowIncompleteDialog] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [incompleteFieldLabels, setIncompleteFieldLabels] = useState<string[]>([])
  const [pendingData, setPendingData] = useState<SupplierFormData | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [pendingFields, setPendingFields] = useState<string[]>(initialData?.pendingFields || [])

  // Initialize form with React Hook Form
  const form = useForm<SupplierFormData>({
    resolver: zodResolver(supplierFormSchema),
    mode: "onBlur",
    defaultValues: initialData || {
      referenceNumber: generateNextReferenceNumber(existingSuppliers),
      status: undefined, // ✅ NO DEFAULT - user must select
      criticalityAssessmentDate: "", // ✅ EMPTY STRING - user must select date
      category: undefined, // ✅ NO DEFAULT - user must select
      dates: {
        startDate: "",
        nextRenewalDate: "",
        endDate: "",
        serviceProviderNoticePeriod: "",
        entityNoticePeriod: "",
      },
      functionDescription: {
        name: "",
        description: "",
        dataDescription: "",
        personalDataInvolved: undefined, // ✅ NO DEFAULT - user must select
        personalDataTransferred: undefined, // ✅ NO DEFAULT - user must select
      },
      criticality: {
        isCritical: undefined, // ✅ NO DEFAULT - user must select
        reasons: "",
      },
      serviceProvider: {
        name: "",
        corporateRegistrationNumber: "",
        legalEntityIdentifier: "",
        registeredAddress: "",
        contactDetails: "",
        parentCompany: "",
      },
      location: {
        servicePerformanceCountries: [], // ✅ EMPTY ARRAY - user must add countries
        dataLocationCountry: [], // ✅ EMPTY ARRAY - user must add countries
        otherDataLocationInfo: "",
      },
      cloudService: createEmptyCloudService(), // ✅ Always initialized to prevent React warnings
      criticalFields: createEmptyCriticalFields(), // ✅ Always initialized to prevent React warnings
    },
  })

  // Watch critical fields for conditional tab visibility
  const isCritical = form.watch("criticality.isCritical")
  const category = form.watch("category")

  // Determine tab visibility
  const showCloudTab = category?.toLowerCase() === "cloud"
  const showCriticalTab = isCritical === true

  // Extract unique provider names for autocomplete dropdown
  const existingProviderNames = useMemo(() => {
    return [...new Set(existingSuppliers.map((s) => s.serviceProvider.name))]
      .filter((name) => name && name.trim() !== "")
      .sort()
  }, [existingSuppliers])

  // Extract unique categories for autocomplete dropdown
  const existingCategories = useMemo(() => {
    return [...new Set(existingSuppliers.map((s) => s.category))]
      .filter((cat) => cat && cat.trim() !== "")
      .sort()
  }, [existingSuppliers])

  // Watch category changes and reset cloudService data when switching away from Cloud
  useEffect(() => {
    if (category !== OutsourcingCategory.CLOUD) {
      // If category is NOT Cloud, reset cloud service data to empty
      const currentCloudService = form.getValues("cloudService")
      // Only reset if it has data (to avoid unnecessary re-renders)
      if (
        currentCloudService?.serviceModel ||
        currentCloudService?.deploymentModel ||
        currentCloudService?.dataNature ||
        currentCloudService?.storageLocations?.length ||
        currentCloudService?.cloudOfficer ||
        currentCloudService?.resourceOperator
      ) {
        form.setValue("cloudService", createEmptyCloudService())
      }
    }
  }, [category, form])

  // Watch isCritical changes and reset criticalFields data when switching to not critical
  useEffect(() => {
    if (isCritical !== true) {
      // If NOT critical, reset critical fields data to empty
      const currentCriticalFields = form.getValues("criticalFields")
      // Only reset if it has data (to avoid unnecessary re-renders)
      if (
        currentCriticalFields?.entitiesUsing?.inScopeEntities?.length ||
        currentCriticalFields?.governingLaw ||
        currentCriticalFields?.approval?.approverName
        // Check a few key fields to see if there's any data
      ) {
        form.setValue("criticalFields", createEmptyCriticalFields())
      }
    }
  }, [isCritical, form])

  // Pending fields helper functions
  const toggleFieldPending = (fieldPath: string) => {
    setPendingFields((prev) => {
      if (prev.includes(fieldPath)) {
        // Remove from pending
        return prev.filter((path) => path !== fieldPath)
      } else {
        // Add to pending
        return [...prev, fieldPath]
      }
    })
  }

  const isFieldPending = (fieldPath: string): boolean => {
    return pendingFields.includes(fieldPath)
  }

  // Handle Save Supplier button click (does NOT trigger full Zod validation)
  const handleSaveSupplier = () => {
    // Step 1: Get form data without triggering validation
    const formData = form.getValues()

    // Step 2: Normalize data (ensure cloudService and criticalFields exist)
    const normalizedData = normalizeFormData(formData)

    // Step 3: Check completeness (mandatory fields)
    // Note: Invalid data (e.g., partial dates) is already caught by onBlur validation
    const completenessResult = checkIncompleteFields(normalizedData as Partial<SupplierOutsourcing>, pendingFields)

    if (!completenessResult.isComplete) {
      // Show incomplete fields dialog
      setIncompleteFieldLabels(completenessResult.labels)
      setPendingData(normalizedData)
      setShowIncompleteDialog(true)
      return
    }

    // Step 4: All mandatory fields complete - save directly
    saveSupplier(normalizedData, [])
  }


  // Save supplier (called after confirmation or if complete)
  const saveSupplier = (data: SupplierFormData, incompleteFields: string[], isDraft: boolean = false, pendingFieldsOverride?: string[]) => {
    setIsSubmitting(true)

    try {
      // Use override if provided, otherwise use state
      const finalPendingFields = pendingFieldsOverride !== undefined ? pendingFieldsOverride : pendingFields

      const rawEstimatedCost = data.criticalFields?.estimatedAnnualCost
      const parsedEstimatedCost =
        rawEstimatedCost === "" || rawEstimatedCost === undefined || rawEstimatedCost === null
          ? undefined
          : Number(rawEstimatedCost)
      const estimatedAnnualCost = Number.isNaN(parsedEstimatedCost) ? undefined : parsedEstimatedCost

      // Transform form data to SupplierOutsourcing
      const supplier: SupplierOutsourcing = {
        referenceNumber: data.referenceNumber!,
        status: data.status!,
        dates: {
          startDate: data.dates?.startDate || "",
          nextRenewalDate: data.dates?.nextRenewalDate || "",
          endDate: data.dates?.endDate || "",
          serviceProviderNoticePeriod: data.dates?.serviceProviderNoticePeriod || "",
          entityNoticePeriod: data.dates?.entityNoticePeriod || "",
        },
        functionDescription: {
          name: data.functionDescription?.name || "",
          description: data.functionDescription?.description || "",
          dataDescription: data.functionDescription?.dataDescription || "",
          personalDataInvolved: data.functionDescription?.personalDataInvolved || false,
          personalDataTransferred: data.functionDescription?.personalDataTransferred || false,
        },
        category: data.category!,
        serviceProvider: {
          name: data.serviceProvider?.name || "",
          corporateRegistrationNumber: data.serviceProvider?.corporateRegistrationNumber || "",
          legalEntityIdentifier: data.serviceProvider?.legalEntityIdentifier,
          registeredAddress: data.serviceProvider?.registeredAddress || "",
          contactDetails: data.serviceProvider?.contactDetails || "",
          parentCompany: data.serviceProvider?.parentCompany,
        },
        location: {
          servicePerformanceCountries: data.location?.servicePerformanceCountries || [],
          dataLocationCountry: data.location?.dataLocationCountry || [],
          otherDataLocationInfo: data.location?.otherDataLocationInfo || "",
        },
        criticality: {
          isCritical: data.criticality?.isCritical || false,
          reasons: data.criticality?.reasons || "",
        },
        criticalityAssessmentDate: data.criticalityAssessmentDate || "",
        cloudService:
          data.category?.toLowerCase() === "cloud"
            ? {
                serviceModel: data.cloudService?.serviceModel,
                deploymentModel: data.cloudService?.deploymentModel,
                dataNature: data.cloudService?.dataNature || "",
                storageLocations: data.cloudService?.storageLocations || [],
                cloudOfficer: data.cloudService?.cloudOfficer,
                resourceOperator: data.cloudService?.resourceOperator,
                otherInformation: data.cloudService?.otherInformation,
              }
            : undefined,
        criticalFields:
          data.criticality?.isCritical === true && data.criticalFields
            ? {
                entitiesUsing: {
                  inScopeEntities: data.criticalFields.entitiesUsing?.inScopeEntities || [],
                },
                groupRelationship: {
                  isPartOfGroup: data.criticalFields.groupRelationship?.isPartOfGroup ?? undefined,
                },
                riskAssessment: {
                  risk: data.criticalFields.riskAssessment?.risk,
                  lastAssessmentDate: data.criticalFields.riskAssessment?.lastAssessmentDate || "",
                  mainResults: data.criticalFields.riskAssessment?.mainResults || "",
                },
                approval: {
                  approverName: data.criticalFields.approval?.approverName || "",
                  approverRole: data.criticalFields.approval?.approverRole || "",
                },
                governingLaw: data.criticalFields.governingLaw || "",
                audit: {
                  lastAuditDate: data.criticalFields.audit?.lastAuditDate || "",
                  nextScheduledAudit: data.criticalFields.audit?.nextScheduledAudit || "",
                },
                subOutsourcing: data.criticalFields.subOutsourcing
                  ? {
                      hasSubOutsourcing: data.criticalFields.subOutsourcing.hasSubOutsourcing ?? false,
                      subContractors: data.criticalFields.subOutsourcing.subContractors || [],
                    }
                  : undefined,
                substitutability: {
                  outcome: data.criticalFields.substitutability?.outcome,
                  reintegrationSubstitutabilityAssessment: data.criticalFields.substitutability?.reintegrationSubstitutabilityAssessment || "",
                  discontinuationImpact: data.criticalFields.substitutability?.discontinuationImpact || "",
                },
                alternativeProviders: data.criticalFields.alternativeProviders || [],
                isTimeCritical: data.criticalFields.isTimeCritical ?? undefined,
                estimatedAnnualCost: estimatedAnnualCost ?? undefined,
                costComments: data.criticalFields.costComments || "",
                regulatoryNotification: {
                  notificationDate: data.criticalFields.regulatoryNotification?.notificationDate || "",
                },
              }
            : undefined,
        incompleteFields: incompleteFields.length > 0 ? incompleteFields : undefined,
        pendingFields: finalPendingFields.length > 0 ? finalPendingFields : undefined,
      } as SupplierOutsourcing

      // Call parent save handler
      onSave(supplier)

      // Clear draft
      sessionStorage.removeItem(DRAFT_STORAGE_KEY)

      // Show success toast based on action type and mode
      const actionVerb = mode === "edit" ? "updated" : "saved"

      if (isDraft) {
        if (finalPendingFields.length > 0) {
          toast.success(`Draft ${actionVerb}`, {
            description: `${finalPendingFields.length} field(s) marked as pending for later completion.`,
          })
        } else {
          toast.success(`Draft ${actionVerb} successfully`, {
            description: "You can continue editing this supplier later.",
          })
        }
      } else if (incompleteFields.length > 0) {
        toast.success(`Supplier ${actionVerb} as draft`, {
          description: `${incompleteFields.length} mandatory field(s) still need to be completed.`,
        })
      } else if (finalPendingFields.length > 0) {
        toast.success(`Supplier ${actionVerb}`, {
          description: `${finalPendingFields.length} field(s) marked as pending. You can complete them later.`,
        })
      } else {
        toast.success(`Supplier ${actionVerb} successfully`, {
          description: "All mandatory fields are complete.",
        })
      }
    } catch (error) {
      console.error("Failed to save supplier:", error)
      toast.error("Failed to save supplier", {
        description: "Please try again or contact support.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle dialog confirmation - mark incomplete fields as pending
  const handleIncompleteConfirm = () => {
    if (pendingData) {
      // Normalize data first (data was already normalized when dialog opened, but be safe)
      const normalizedData = normalizeFormData(pendingData)

      // Get current incomplete fields (not marked as pending)
      const completenessResult = checkIncompleteFields(normalizedData as Partial<SupplierOutsourcing>, pendingFields)

      // Mark all incomplete fields as pending
      const updatedPendingFields = [...pendingFields, ...completenessResult.incomplete]

      // Update state for current session
      setPendingFields(updatedPendingFields)

      // Save supplier with updated pending fields (no incomplete fields since they're all pending now)
      saveSupplier(normalizedData, [], false, updatedPendingFields)

      setShowIncompleteDialog(false)
      setPendingData(null)
    }
  }

  // Handle save as draft (no validation, auto-marks empty fields as pending)
  const handleSaveAsDraft = () => {
    setIsDraftSaving(true)
    try {
      // Step 1: Get current form data without validation
      const formData = form.getValues()

      // Step 2: Normalize data (ensure cloudService and criticalFields exist)
      const normalizedData = normalizeFormData(formData)

      // Step 3: Check for incomplete required fields (pass empty pending array to find ALL incomplete)
      const completenessResult = checkIncompleteFields(normalizedData as Partial<SupplierOutsourcing>, [])

      // Step 4: Merge existing pending fields (manually marked by user) + new incomplete fields (empty)
      // This preserves fields marked as pending even if filled (uncertain data)
      const combinedPendingFields = [...pendingFields, ...completenessResult.incomplete]

      // Step 5: Remove duplicates
      const uniquePendingFields = [...new Set(combinedPendingFields)]

      // Step 6: Update the pendingFields state (for the current form session)
      setPendingFields(uniquePendingFields)

      // Step 7: Force status to "Draft"
      const draftData = {
        ...normalizedData,
        status: OutsourcingStatus.DRAFT,
      }

      // Step 8: Save with merged pending fields (manual + auto-marked)
      saveSupplier(draftData, [], true, uniquePendingFields)
    } catch (error) {
      console.error("Failed to save draft:", error)
      toast.error("Failed to save draft", {
        description: "Please try again or contact support.",
      })
    } finally {
      setIsDraftSaving(false)
    }
  }

  // Handle cancel - always show confirmation dialog
  const handleCancelClick = () => {
    setShowCancelDialog(true)
  }

  const handleCancelConfirm = () => {
    sessionStorage.removeItem(DRAFT_STORAGE_KEY)
    setShowCancelDialog(false)
    onCancel()
  }



  return (
    <>
      <Form {...form}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* Tab Navigation */}
          <SupplierFormTabNav
            activeTab={activeTab}
            onTabChange={setActiveTab}
            showCloudTab={showCloudTab}
            showCriticalTab={showCriticalTab}
          />

          {/* Tab Content - All tabs always rendered for validation */}
          <div className="min-h-[400px] relative">
            <div className={activeTab === "basic-info" ? "relative z-10" : "absolute top-0 left-0 w-full opacity-0 pointer-events-none z-0"}>
              <SupplierFormBasicInfo
                control={form.control}
                toggleFieldPending={toggleFieldPending}
                isFieldPending={isFieldPending}
                existingCategories={existingCategories}
                mode={mode}
              />
            </div>
            <div className={activeTab === "provider" ? "relative z-10" : "absolute top-0 left-0 w-full opacity-0 pointer-events-none z-0"}>
              <SupplierFormProvider
                control={form.control}
                toggleFieldPending={toggleFieldPending}
                isFieldPending={isFieldPending}
                existingProviderNames={existingProviderNames}
              />
            </div>
            <div className={activeTab === "cloud" ? "relative z-10" : "absolute top-0 left-0 w-full opacity-0 pointer-events-none z-0"}>
              <SupplierFormCloud
                control={form.control}
                toggleFieldPending={toggleFieldPending}
                isFieldPending={isFieldPending}
              />
            </div>
            <div className={activeTab === "critical" ? "relative z-10" : "absolute top-0 left-0 w-full opacity-0 pointer-events-none z-0"}>
              <SupplierFormCritical
                control={form.control}
                toggleFieldPending={toggleFieldPending}
                isFieldPending={isFieldPending}
              />
            </div>
          </div>

          {/* Form Actions */}
          <FormActions
            onCancel={handleCancelClick}
            onSave={handleSaveSupplier}
            onSaveAsDraft={handleSaveAsDraft}
            isSubmitting={isSubmitting}
            isDraftSaving={isDraftSaving}
            mode={mode}
          />
        </form>
      </Form>

      {/* Incomplete Fields Dialog */}
      <IncompleteFieldsDialog
        open={showIncompleteDialog}
        onOpenChange={setShowIncompleteDialog}
        incompleteFields={incompleteFieldLabels}
        onConfirm={handleIncompleteConfirm}
      />

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel? All unsaved changes will be lost. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
