"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PendingToggle } from "../pending-toggle"
import { CssfReference } from "@/components/shared/cssf-reference"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

interface SelectOption {
  value: string
  label: string
}

interface FormSelectProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  circularRef?: string
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  tooltip?: string
  className?: string
  toggleFieldPending?: (fieldPath: string) => void
  isFieldPending?: (fieldPath: string) => boolean
}

/**
 * Reusable select dropdown component for forms
 * Integrates with React Hook Form and displays CSSF circular references
 *
 * @example
 * <FormSelect
 *   control={form.control}
 *   name="status"
 *   label="Status"
 *   circularRef="53"
 *   options={[
 *     { value: "Active", label: "Active" },
 *     { value: "Not Yet Active", label: "Not Yet Active" },
 *   ]}
 *   placeholder="Select status"
 *   required
 * />
 */
export function FormSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  circularRef,
  options,
  placeholder = "Select an option",
  required = false,
  tooltip,
  className = "",
  toggleFieldPending,
  isFieldPending,
}: FormSelectProps<TFieldValues>) {
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
          <Select onValueChange={field.onChange} value={field.value}>
            <FormControl>
              <SelectTrigger className="text-base">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="text-base">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
