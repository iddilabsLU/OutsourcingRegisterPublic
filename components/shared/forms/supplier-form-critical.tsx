"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormTextInput } from "./fields/form-text-input"
import { FormTextarea } from "./fields/form-textarea"
import { FormSelect } from "./fields/form-select"
import { FormRadioGroup } from "./fields/form-radio-group"
import { FormDatePicker } from "./fields/form-date-picker"
import { FormMultiText } from "./fields/form-multi-text"
import { FormSubContractor } from "./fields/form-sub-contractor"
import { RiskLevel, SubstitutabilityOutcome } from "@/lib/types/supplier"
import type { Control } from "react-hook-form"
import type { SupplierFormData } from "@/lib/validations/supplier-schema"
import { useWatch } from "react-hook-form"

interface SupplierFormCriticalProps {
  control: Control<SupplierFormData>
  toggleFieldPending: (fieldPath: string) => void
  isFieldPending: (fieldPath: string) => boolean
}

/**
 * Tab 4: Critical Functions (Conditional - only if isCritical = Yes)
 * Contains all Point 55 fields with sub-outsourcing section
 */
export function SupplierFormCritical({
  control,
  toggleFieldPending,
  isFieldPending,
}: SupplierFormCriticalProps) {
  // Watch hasSubOutsourcing field to control conditional visibility
  const hasSubOutsourcing = useWatch({
    control,
    name: "criticalFields.subOutsourcing.hasSubOutsourcing",
  })

  // Risk Level options
  const riskOptions = Object.values(RiskLevel).map((risk) => ({
    value: risk,
    label: risk,
  }))

  // Substitutability options
  const substitutabilityOptions = Object.values(SubstitutabilityOutcome).map((outcome) => ({
    value: outcome,
    label: outcome,
  }))

  return (
    <div className="space-y-2 max-w-7xl mx-auto">
      {/* Card 1: Entities, Risk & Approval */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Entities, Risk & Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 [&>*]:min-w-0">
            <FormMultiText
              control={control}
              name="criticalFields.entitiesUsing.inScopeEntities"
              label="In-Scope Entities"
              circularRef="55.a"
              placeholder="e.g., BankCorp S.A."
              addButtonLabel="Add Entity"
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormRadioGroup
              control={control}
              name="criticalFields.groupRelationship.isPartOfGroup"
              label="Part of Group"
              circularRef="55.b"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormRadioGroup
              control={control}
              name="criticalFields.groupRelationship.isOwnedByGroup"
              label="Owned by Group"
              circularRef="55.b"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormSelect
              control={control}
              name="criticalFields.riskAssessment.risk"
              label="Risk Level"
              circularRef="55.c"
              options={riskOptions}
              placeholder="Select risk level"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormDatePicker
              control={control}
              name="criticalFields.riskAssessment.lastAssessmentDate"
              label="Last Assessment Date"
              circularRef="55.c"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextarea
              control={control}
              name="criticalFields.riskAssessment.mainResults"
              label="Summary Results"
              circularRef="55.c"
              placeholder="Main results of the risk assessment"
              rows={4}
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextInput
              control={control}
              name="criticalFields.approval.approverName"
              label="Approver Name"
              circularRef="55.d"
              placeholder="e.g., Board of Directors"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextInput
              control={control}
              name="criticalFields.approval.approverRole"
              label="Approver Role"
              circularRef="55.d"
              placeholder="e.g., Management Body"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Legal, Audit & Regulatory */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Legal, Audit & Regulatory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 [&>*]:min-w-0">
            <FormTextInput
              control={control}
              name="criticalFields.governingLaw"
              label="Governing Law"
              circularRef="55.e"
              placeholder="e.g., Luxembourg Law"
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormDatePicker
              control={control}
              name="criticalFields.audit.lastAuditDate"
              label="Last Audit Date"
              circularRef="55.f"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormDatePicker
              control={control}
              name="criticalFields.audit.nextScheduledAudit"
              label="Next Scheduled Audit"
              circularRef="55.f"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormDatePicker
              control={control}
              name="criticalFields.regulatoryNotification.notificationDate"
              label="Prior Notification Date"
              circularRef="55.l"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Sub-Outsourcing (Conditional) */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Sub-Outsourcing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Toggle for sub-outsourcing - now properly wired to React Hook Form */}
            <FormRadioGroup
              control={control}
              name="criticalFields.subOutsourcing.hasSubOutsourcing"
              label="Activities are Sub-Outsourced"
              circularRef="55.g"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />

            {hasSubOutsourcing === true && (
              <div className="space-y-4 pt-2">
                <FormSubContractor
                  control={control}
                  name="criticalFields.subOutsourcing.subContractors"
                  toggleFieldPending={toggleFieldPending}
                  isFieldPending={isFieldPending}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Substitutability & Operations */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Substitutability & Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 [&>*]:min-w-0">
            <FormSelect
              control={control}
              name="criticalFields.substitutability.outcome"
              label="Substitutability Outcome"
              circularRef="55.h"
              options={substitutabilityOptions}
              placeholder="Select outcome"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormRadioGroup
              control={control}
              name="criticalFields.isTimeCritical"
              label="Time-Critical Function"
              circularRef="55.j"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextarea
              control={control}
              name="criticalFields.substitutability.reintegrationAssessment"
              label="Reintegration Assessment"
              circularRef="55.h"
              placeholder="Assess the feasibility of reintegrating this function"
              rows={3}
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextarea
              control={control}
              name="criticalFields.substitutability.discontinuationImpact"
              label="Discontinuation Impact"
              circularRef="55.h"
              placeholder="Describe the impact if this service is discontinued"
              rows={3}
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormMultiText
              control={control}
              name="criticalFields.alternativeProviders"
              label="Alternative Providers"
              circularRef="55.i"
              placeholder="e.g., Azure Government Cloud"
              addButtonLabel="Add Provider"
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextInput
              control={control}
              name="criticalFields.estimatedAnnualCost"
              label="Estimated Annual Cost"
              circularRef="55.k"
              placeholder="e.g., 850000"
              tooltip="Enter cost in EUR"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextarea
              control={control}
              name="criticalFields.costComments"
              label="Cost Comments"
              circularRef="55.k"
              placeholder="Optional - any relevant cost notes"
              rows={2}
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
