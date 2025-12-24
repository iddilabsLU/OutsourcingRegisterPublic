"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PendingToggle } from "../pending-toggle"
import { CssfReference } from "@/components/shared/cssf-reference"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

interface FormTextInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  circularRef?: string
  placeholder?: string
  required?: boolean
  tooltip?: string
  className?: string
  toggleFieldPending?: (fieldPath: string) => void
  isFieldPending?: (fieldPath: string) => boolean
  disabled?: boolean
}

/**
 * Reusable text input component for forms
 * Integrates with React Hook Form and displays CSSF circular references
 *
 * @example
 * <FormTextInput
 *   control={form.control}
 *   name="referenceNumber"
 *   label="Reference Number"
 *   circularRef="54.a"
 *   placeholder="e.g., 2024-001"
 *   required
 * />
 */
export function FormTextInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  circularRef,
  placeholder,
  required = false,
  tooltip,
  className = "",
  toggleFieldPending,
  isFieldPending,
  disabled = false,
}: FormTextInputProps<TFieldValues>) {
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
            <Input placeholder={placeholder} {...field} className="text-base" disabled={disabled} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
