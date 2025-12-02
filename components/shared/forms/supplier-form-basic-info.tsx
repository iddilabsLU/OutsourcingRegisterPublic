"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormTextInput } from "./fields/form-text-input"
import { FormTextarea } from "./fields/form-textarea"
import { FormSelect } from "./fields/form-select"
import { FormRadioGroup } from "./fields/form-radio-group"
import { FormDatePicker } from "./fields/form-date-picker"
import { OutsourcingCategory, OutsourcingStatus } from "@/lib/types/supplier"
import type { Control } from "react-hook-form"
import type { SupplierFormData } from "@/lib/validations/supplier-schema"

interface SupplierFormBasicInfoProps {
  control: Control<SupplierFormData>
  toggleFieldPending: (fieldPath: string) => void
  isFieldPending: (fieldPath: string) => boolean
  mode?: "add" | "edit"
}

/**
 * Tab 1: Basic Information
 * Contains: Reference & Status, Timeline & Dates, Function Description, Criticality Assessment
 */
export function SupplierFormBasicInfo({
  control,
  toggleFieldPending,
  isFieldPending,
  mode = "add",
}: SupplierFormBasicInfoProps) {
  // Category options
  const categoryOptions = Object.values(OutsourcingCategory).map((cat) => ({
    value: cat,
    label: cat,
  }))

  // Status options
  const statusOptions = Object.values(OutsourcingStatus).map((status) => ({
    value: status,
    label: status,
  }))

  return (
    <div className="space-y-2 max-w-7xl mx-auto">
      {/* Card 1: Reference & Status */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Reference & Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 [&>*]:min-w-0">
            <FormTextInput
              control={control}
              name="referenceNumber"
              label="Reference Number"
              circularRef="54.a"
              placeholder="e.g., 2024-006"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
              disabled={mode === "edit"}
            />
            <FormSelect
              control={control}
              name="status"
              label="Status"
              circularRef="53"
              options={statusOptions}
              placeholder="Select status"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextInput
              control={control}
              name="functionDescription.name"
              label="Function Name"
              circularRef="54.c"
              placeholder="e.g., Cloud Hosting Infrastructure"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormSelect
              control={control}
              name="category"
              label="Category"
              circularRef="54.d"
              options={categoryOptions}
              placeholder="Select category"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Timeline & Dates */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Timeline & Dates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 [&>*]:min-w-0">
            <FormDatePicker
              control={control}
              name="dates.startDate"
              label="Start Date"
              circularRef="54.b"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormDatePicker
              control={control}
              name="dates.nextRenewalDate"
              label="Next Renewal Date"
              circularRef="54.b"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormDatePicker
              control={control}
              name="dates.endDate"
              label="End Date"
              circularRef="54.b"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextInput
              control={control}
              name="dates.serviceProviderNoticePeriod"
              label="Service Provider Notice Period"
              circularRef="54.b"
              placeholder="e.g., 90 days"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextInput
              control={control}
              name="dates.entityNoticePeriod"
              label="Entity Notice Period"
              circularRef="54.b"
              placeholder="e.g., 180 days"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Function Description */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Function Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 [&>*]:min-w-0">
            <FormTextarea
              control={control}
              name="functionDescription.description"
              label="Function Description"
              circularRef="54.c"
              placeholder="Describe the outsourced function in detail"
              rows={4}
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextarea
              control={control}
              name="functionDescription.dataDescription"
              label="Data Description"
              circularRef="54.c"
              placeholder="Describe the data processed or accessed"
              rows={3}
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormRadioGroup
              control={control}
              name="functionDescription.personalDataInvolved"
              label="Personal Data Involved"
              circularRef="54.c"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormRadioGroup
              control={control}
              name="functionDescription.personalDataTransferred"
              label="Personal Data Transferred"
              circularRef="54.c"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 4: Criticality Assessment */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Criticality Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 [&>*]:min-w-0">
            <FormRadioGroup
              control={control}
              name="criticality.isCritical"
              label="Is Critical or Important"
              circularRef="54.g"
              tooltip="Functions essential to business operations"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormDatePicker
              control={control}
              name="criticalityAssessmentDate"
              label="Assessment Date"
              circularRef="54.i"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextarea
              control={control}
              name="criticality.reasons"
              label="Criticality Reasons"
              circularRef="54.g"
              placeholder="Explain why this function is or is not critical"
              rows={4}
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
