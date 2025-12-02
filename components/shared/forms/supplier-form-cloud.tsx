"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormTextInput } from "./fields/form-text-input"
import { FormTextarea } from "./fields/form-textarea"
import { FormSelect } from "./fields/form-select"
import { FormMultiText } from "./fields/form-multi-text"
import { CloudServiceModel, DeploymentModel } from "@/lib/types/supplier"
import type { Control } from "react-hook-form"
import type { SupplierFormData } from "@/lib/validations/supplier-schema"

interface SupplierFormCloudProps {
  control: Control<SupplierFormData>
  toggleFieldPending: (fieldPath: string) => void
  isFieldPending: (fieldPath: string) => boolean
}

/**
 * Tab 3: Cloud Services (Conditional)
 * Contains: Cloud Service Details
 * Only shown when Category = Cloud OR manually enabled
 * All fields (including Cloud Officer/Resource Operator) are mandatory when category = Cloud
 */
export function SupplierFormCloud({ control, toggleFieldPending, isFieldPending }: SupplierFormCloudProps) {
  // Service Model options
  const serviceModelOptions = Object.values(CloudServiceModel)
    .filter((model) => model !== CloudServiceModel.NOT_APPLICABLE)
    .map((model) => ({
      value: model,
      label: model,
    }))

  // Deployment Model options
  const deploymentModelOptions = Object.values(DeploymentModel)
    .filter((model) => model !== DeploymentModel.NOT_APPLICABLE)
    .map((model) => ({
      value: model,
      label: model,
    }))

  return (
    <div className="space-y-2 max-w-7xl mx-auto">
      {/* Card: Cloud Service Details */}
      <Card className="bg-white shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Cloud Service Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 [&>*]:min-w-0">
            <FormSelect
              control={control}
              name="cloudService.serviceModel"
              label="Service Model"
              circularRef="54.h"
              options={serviceModelOptions}
              placeholder="Select service model"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormSelect
              control={control}
              name="cloudService.deploymentModel"
              label="Deployment Model"
              circularRef="54.h"
              options={deploymentModelOptions}
              placeholder="Select deployment model"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextarea
              control={control}
              name="cloudService.dataNature"
              label="Data Nature"
              circularRef="54.h"
              placeholder="Describe the nature of data in the cloud"
              rows={3}
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormMultiText
              control={control}
              name="cloudService.storageLocations"
              label="Storage Locations"
              circularRef="54.h"
              placeholder="e.g., Luxembourg (primary)"
              tooltip="Add all data storage locations"
              addButtonLabel="Add Location"
              className="col-span-2"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextInput
              control={control}
              name="cloudService.cloudOfficer"
              label="Cloud Officer (if any)"
              circularRef="54.h"
              placeholder="e.g., Jean Dupont"
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
            <FormTextInput
              control={control}
              name="cloudService.resourceOperator"
              label="Resource Operator (if any)"
              circularRef="54.h"
              placeholder="e.g., CloudTech Operations S.A."
              toggleFieldPending={toggleFieldPending}
              isFieldPending={isFieldPending}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
