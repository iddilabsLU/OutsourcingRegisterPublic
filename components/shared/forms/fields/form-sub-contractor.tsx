"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X } from "lucide-react"
import { PendingToggle } from "../pending-toggle"
import { CssfReference } from "@/components/shared/cssf-reference"
import { useFieldArray, type Control, type FieldPath, type FieldValues } from "react-hook-form"

interface FormSubContractorProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  toggleFieldPending?: (fieldPath: string) => void
  isFieldPending?: (fieldPath: string) => boolean
}

/**
 * Sub-contractor array component
 * Each sub-contractor has: activityDescription, name, registrationCountry, servicePerformanceCountry, dataStorageLocation
 * Used in Critical Functions tab for Point 55.g
 *
 * @example
 * <FormSubContractor
 *   control={form.control}
 *   name="criticalFields.subOutsourcing.subContractors"
 * />
 */
export function FormSubContractor<TFieldValues extends FieldValues>({
  control,
  name,
  toggleFieldPending,
  isFieldPending,
}: FormSubContractorProps<TFieldValues>) {
  const { fields, append, remove } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: name as any,
  })

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FormLabel className="text-base">
          Sub-Contractors <CssfReference reference="55.g" />
          <span className="text-destructive ml-1">*</span>
        </FormLabel>
        {toggleFieldPending && isFieldPending && (
          <PendingToggle
            fieldPath={name as string}
            isPending={isFieldPending(name as string)}
            onToggle={toggleFieldPending}
          />
        )}
      </div>

      {fields.length === 0 && (
        <p className="text-sm text-muted-foreground">No sub-contractors added yet.</p>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="relative">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Sub-Contractor #{index + 1}</CardTitle>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Remove sub-contractor</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="grid gap-3 grid-cols-2 [&>*]:min-w-0">
            <FormField
              control={control}
              name={`${name}.${index}.activityDescription` as FieldPath<TFieldValues>}
              render={({ field: inputField }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-base">Activity Sub-Outsourced</FormLabel>
                  <FormControl>
                    <Textarea
                      {...inputField}
                      placeholder="Describe the activity that is sub-outsourced to this sub-contractor"
                      rows={2}
                      className="text-base"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${name}.${index}.name` as FieldPath<TFieldValues>}
              render={({ field: inputField }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-base">Name</FormLabel>
                  <FormControl>
                    <Input {...inputField} placeholder="e.g., SecureNet Data Centers GmbH" className="text-base" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${name}.${index}.registrationCountry` as FieldPath<TFieldValues>}
              render={({ field: inputField }) => (
                <FormItem>
                  <FormLabel className="text-base">Registration Country</FormLabel>
                  <FormControl>
                    <Input {...inputField} placeholder="e.g., Germany" className="text-base" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${name}.${index}.servicePerformanceCountry` as FieldPath<TFieldValues>}
              render={({ field: inputField }) => (
                <FormItem>
                  <FormLabel className="text-base">Service Performance Country</FormLabel>
                  <FormControl>
                    <Input {...inputField} placeholder="e.g., Germany" className="text-base" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name={`${name}.${index}.dataStorageLocation` as FieldPath<TFieldValues>}
              render={({ field: inputField }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-base">Data Storage Location</FormLabel>
                  <FormControl>
                    <Input {...inputField} placeholder="e.g., Frankfurt, Germany" className="text-base" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const newSubContractor: any = {
            activityDescription: "",
            name: "",
            registrationCountry: "",
            servicePerformanceCountry: "",
            dataStorageLocation: "",
          }
          append(newSubContractor)
        }}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Sub-Contractor
      </Button>
    </div>
  )
}
