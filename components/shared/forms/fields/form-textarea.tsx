"use client"

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { PendingToggle } from "../pending-toggle"
import { CssfReference } from "@/components/shared/cssf-reference"
import type { Control, FieldPath, FieldValues } from "react-hook-form"

interface FormTextareaProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  circularRef?: string
  placeholder?: string
  required?: boolean
  tooltip?: string
  rows?: number
  className?: string
  toggleFieldPending?: (fieldPath: string) => void
  isFieldPending?: (fieldPath: string) => boolean
}

/**
 * Reusable textarea component for forms
 * Integrates with React Hook Form and displays CSSF circular references
 *
 * @example
 * <FormTextarea
 *   control={form.control}
 *   name="functionDescription.description"
 *   label="Function Description"
 *   circularRef="54.c"
 *   placeholder="Describe the outsourced function in detail"
 *   rows={4}
 *   required
 * />
 */
export function FormTextarea<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  circularRef,
  placeholder,
  required = false,
  tooltip,
  rows = 3,
  className = "",
  toggleFieldPending,
  isFieldPending,
}: FormTextareaProps<TFieldValues>) {
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
            <Textarea placeholder={placeholder} rows={rows} {...field} className="text-base resize-none" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
