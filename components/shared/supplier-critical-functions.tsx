import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FieldDisplay } from "./field-display"
import { NotApplicablePlaceholder } from "./not-applicable-placeholder"
import { useSearch } from "@/lib/contexts/search-context"
import type { SupplierOutsourcing } from "@/lib/types/supplier"

interface SupplierCriticalFunctionsProps {
  supplier: SupplierOutsourcing
}

/**
 * Tab 4: Critical Functions - Additional fields for critical suppliers only (Point 55)
 * Shows N/A placeholder if supplier is not critical
 */
export function SupplierCriticalFunctions({ supplier }: SupplierCriticalFunctionsProps) {
  const { searchTerm } = useSearch()
  // Show N/A placeholder if not critical
  if (!supplier.criticality.isCritical || !supplier.criticalFields) {
    return (
      <NotApplicablePlaceholder
        type="critical"
        title="Not Applicable - Non-Critical Function"
        description="This supplier is not classified as critical or important. Additional fields under CSSF Outsourcing Circular Point 55 are not required for non-critical outsourcing arrangements."
        circularRef="CSSF Point 55"
        additionalBadge="Non-Critical"
      />
    )
  }

  const { criticalFields } = supplier

  return (
    <div className="space-y-2 max-w-7xl mx-auto">
      {/* Card 1: Entities, Risk & Approval */}
      <Card className="bg-white shadow-sm gap-4 py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl">Entities, Risk & Approval</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 [&>*]:min-w-0">
            {/* Entities Using */}
            <FieldDisplay
              label="In-Scope Entities"
              circularRef="55.a"
              value={criticalFields.entitiesUsing.inScopeEntities}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.entitiesUsing.inScopeEntities")}
              className="col-span-2"
            />
            {/* Group Relationship */}
            <FieldDisplay
              label="Part of Group"
              circularRef="55.b"
              value={criticalFields.groupRelationship.isPartOfGroup}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.groupRelationship.isPartOfGroup")}
            />
            <FieldDisplay
              label="Owned by Group"
              circularRef="55.b"
              value={criticalFields.groupRelationship.isOwnedByGroup}
              isPending={supplier.pendingFields?.includes("criticalFields.groupRelationship.isOwnedByGroup")}
            />
            {/* Risk Assessment */}
            <FieldDisplay
              label="Risk Level"
              circularRef="55.c"
              value={criticalFields.riskAssessment.risk}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.riskAssessment.risk")}
            />
            <FieldDisplay
              label="Last Assessment Date"
              circularRef="55.c"
              value={criticalFields.riskAssessment.lastAssessmentDate}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.riskAssessment.lastAssessmentDate")}
            />
            <FieldDisplay
              label="Summary Results"
              circularRef="55.c"
              value={criticalFields.riskAssessment.mainResults}
              className="col-span-2"
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.riskAssessment.mainResults")}
            />
            {/* Approval */}
            <FieldDisplay
              label="Approver Name"
              circularRef="55.d"
              value={criticalFields.approval.approverName}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.approval.approverName")}
            />
            <FieldDisplay
              label="Approver Role"
              circularRef="55.d"
              value={criticalFields.approval.approverRole}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.approval.approverRole")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Legal, Audit & Regulatory */}
      <Card className="bg-white shadow-sm gap-4 py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl">Legal, Audit & Regulatory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 [&>*]:min-w-0">
            <FieldDisplay
              label="Last Audit Date"
              circularRef="55.f"
              value={criticalFields.audit.lastAuditDate}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.audit.lastAuditDate")}
            />
            <FieldDisplay
              label="Next Scheduled Audit"
              circularRef="55.f"
              value={criticalFields.audit.nextScheduledAudit}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.audit.nextScheduledAudit")}
            />
            <FieldDisplay
              label="Governing Law"
              circularRef="55.e"
              value={criticalFields.governingLaw}
              isPending={supplier.pendingFields?.includes("criticalFields.governingLaw")}
            />
            {criticalFields.regulatoryNotification && (
              <FieldDisplay
                label="Prior Notification Date"
                circularRef="55.l"
                value={criticalFields.regulatoryNotification.notificationDate}
                searchTerm={searchTerm}
                isPending={supplier.pendingFields?.includes("criticalFields.regulatoryNotification.notificationDate")}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Sub-Outsourcing - Always shown for critical suppliers */}
      <Card className="bg-white shadow-sm gap-4 py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl">Sub-Outsourcing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {/* Toggle field - mandatory for critical suppliers */}
          <FieldDisplay
            label="Activities are Sub-Outsourced"
            circularRef="55.g"
            value={criticalFields.subOutsourcing?.hasSubOutsourcing}
            searchTerm={searchTerm}
            isPending={supplier.pendingFields?.includes("criticalFields.subOutsourcing.hasSubOutsourcing")}
          />

          {/* Subcontractor details - only shown if toggle is Yes */}
          {criticalFields.subOutsourcing?.hasSubOutsourcing === true &&
           criticalFields.subOutsourcing.subContractors &&
           criticalFields.subOutsourcing.subContractors.length > 0 && (
            <>
              {criticalFields.subOutsourcing.subContractors.map((sub, index) => (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border p-2 grid-cols-2 [&>*]:min-w-0"
                >
                  <FieldDisplay
                    label="Activity Sub-Outsourced"
                    circularRef="55.g"
                    value={sub.activityDescription}
                    className="col-span-2"
                    searchTerm={searchTerm}
                    isPending={supplier.pendingFields?.includes(`criticalFields.subOutsourcing.subContractors.${index}.activityDescription`)}
                  />
                  <FieldDisplay
                    label="Sub-Contractor Name"
                    circularRef="55.g"
                    value={sub.name}
                    searchTerm={searchTerm}
                    isPending={supplier.pendingFields?.includes(`criticalFields.subOutsourcing.subContractors.${index}.name`)}
                  />
                  <FieldDisplay
                    label="Registration Country"
                    circularRef="55.g"
                    value={sub.registrationCountry}
                    searchTerm={searchTerm}
                    isPending={supplier.pendingFields?.includes(`criticalFields.subOutsourcing.subContractors.${index}.registrationCountry`)}
                  />
                  <FieldDisplay
                    label="Service Performance Country"
                    circularRef="55.g"
                    value={sub.servicePerformanceCountry}
                    searchTerm={searchTerm}
                    isPending={supplier.pendingFields?.includes(`criticalFields.subOutsourcing.subContractors.${index}.servicePerformanceCountry`)}
                  />
                  <FieldDisplay
                    label="Data Storage Location"
                    circularRef="55.g"
                    value={sub.dataStorageLocation}
                    searchTerm={searchTerm}
                    isPending={supplier.pendingFields?.includes(`criticalFields.subOutsourcing.subContractors.${index}.dataStorageLocation`)}
                  />
                </div>
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {/* Card 4: Substitutability & Operations */}
      <Card className="bg-white shadow-sm gap-4 py-4">
        <CardHeader className="pb-0">
          <CardTitle className="text-xl">Substitutability & Operations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 grid-cols-2 [&>*]:min-w-0">
            {/* Substitutability */}
            <FieldDisplay
              label="Substitutability Outcome"
              circularRef="55.h"
              value={criticalFields.substitutability.outcome}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.substitutability.outcome")}
            />
            <FieldDisplay
              label="Time-Critical Function"
              circularRef="55.j"
              value={criticalFields.isTimeCritical}
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.isTimeCritical")}
            />
            <FieldDisplay
              label="Reintegration Assessment"
              circularRef="55.h"
              value={criticalFields.substitutability.reintegrationAssessment}
              className="col-span-2"
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.substitutability.reintegrationAssessment")}
            />
            <FieldDisplay
              label="Discontinuation Impact"
              circularRef="55.h"
              value={criticalFields.substitutability.discontinuationImpact}
              className="col-span-2"
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.substitutability.discontinuationImpact")}
            />
            <FieldDisplay
              label="Alternative Providers"
              circularRef="55.i"
              value={criticalFields.alternativeProviders}
              className="col-span-2"
              searchTerm={searchTerm}
              isPending={supplier.pendingFields?.includes("criticalFields.alternativeProviders")}
            />
            {/* Operations */}
            <FieldDisplay
              label="Estimated Annual Cost"
              circularRef="55.k"
              value={criticalFields.estimatedAnnualCost}
              isPending={supplier.pendingFields?.includes("criticalFields.estimatedAnnualCost")}
            />
            {criticalFields.costComments && (
              <FieldDisplay
                label="Comments (if any)"
                circularRef="55.k"
                value={criticalFields.costComments}
                isPending={supplier.pendingFields?.includes("criticalFields.costComments")}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
