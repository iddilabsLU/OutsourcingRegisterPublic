"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { PendingToggle } from "../pending-toggle"
import { CssfReference } from "@/components/shared/cssf-reference"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

interface FormRadioGroupProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  circularRef?: string
  required?: boolean
  tooltip?: string
  className?: string
  toggleFieldPending?: (fieldPath: string) => void
  isFieldPending?: (fieldPath: string) => boolean
}

/**
 * Radio group component for Yes/No boolean fields
 * Integrates with React Hook Form and displays CSSF circular references
 *
 * @example
 * <FormRadioGroup
 *   control={form.control}
 *   name="criticality.isCritical"
 *   label="Is Critical or Important"
 *   circularRef="54.g"
 *   required
 *   tooltip="Functions essential to business operations"
 * />
 */
export function FormRadioGroup<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  circularRef,
  required = false,
  tooltip,
  className = "",
  toggleFieldPending,
  isFieldPending,
}: FormRadioGroupProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-center gap-2">
            <FormLabel className="text-base">
              {label}
              {circularRef && <CssfReference reference={circularRef} />}
              {required && <span className="text-destructive ml-1">*</span>}
              {tooltip && (
                <span className="text-xs text-muted-foreground ml-2" title={tooltip}>
                  ⓘ
                </span>
              )}
            </FormLabel>
            {toggleFieldPending && isFieldPending && (
              <PendingToggle
                fieldPath={name as string}
                isPending={isFieldPending(name as string)}
                onToggle={toggleFieldPending}
              />
            )}
          </div>
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                // Convert string "true"/"false" to boolean
                field.onChange(value === "true")
              }}
              value={field.value === undefined || field.value === null ? undefined : String(field.value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id={`${String(name)}-yes`} />
                <Label htmlFor={`${String(name)}-yes`} className="text-base cursor-pointer">
                  Yes
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id={`${String(name)}-no`} />
                <Label htmlFor={`${String(name)}-no`} className="text-base cursor-pointer">
                  No
                </Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
