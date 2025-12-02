"use client"

import { Button } from "@/components/ui/button"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Plus, X } from "lucide-react"
import { PendingToggle } from "../pending-toggle"
import { CssfReference } from "@/components/shared/cssf-reference"
import { useFieldArray, type Control, type FieldPath, type FieldValues } from "react-hook-form"

interface FormMultiTextProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  circularRef?: string
  placeholder?: string
  required?: boolean
  tooltip?: string
  className?: string
  addButtonLabel?: string
  toggleFieldPending?: (fieldPath: string) => void
  isFieldPending?: (fieldPath: string) => boolean
}

/**
 * Multi-text input component for array fields
 * Allows adding/removing multiple text values (e.g., countries, storage locations)
 * Uses React Hook Form's useFieldArray
 *
 * @example
 * <FormMultiText
 *   control={form.control}
 *   name="location.servicePerformanceCountries"
 *   label="Service Performance Countries"
 *   circularRef="54.f"
 *   placeholder="e.g., Luxembourg"
 *   required
 *   addButtonLabel="Add Country"
 * />
 */
export function FormMultiText<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  circularRef,
  placeholder,
  required = false,
  tooltip,
  className = "",
  addButtonLabel = "Add",
  toggleFieldPending,
  isFieldPending,
}: FormMultiTextProps<TFieldValues>) {
  const { fields, append, remove } = useFieldArray({
    control,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    name: name as any,
  })

  return (
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
      <div className="space-y-2">
        {fields.map((field, index) => (
          <FormField
            key={field.id}
            control={control}
            name={`${name}.${index}` as FieldPath<TFieldValues>}
            render={({ field: inputField }) => (
              <FormItem>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      {...inputField}
                      placeholder={placeholder}
                      className="text-base"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => remove(index)}
                      className="shrink-0"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove</span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onClick={() => append("" as any)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          {addButtonLabel}
        </Button>
      </div>
    </FormItem>
  )
}
