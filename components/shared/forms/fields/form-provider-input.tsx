"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Check, ChevronsUpDown } from "lucide-react"
import { PendingToggle } from "../pending-toggle"
import { CssfReference } from "@/components/shared/cssf-reference"
import { cn } from "@/lib/utils"
import { type Control, type FieldPath, type FieldValues } from "react-hook-form"

interface FormProviderInputProps<TFieldValues extends FieldValues> {
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
  existingProviderNames: string[]
}

/**
 * Provider name autocomplete component
 * Displays existing provider names as suggestions while allowing free-form entry
 * Integrates with React Hook Form and supports pending fields
 *
 * @example
 * <FormProviderInput
 *   control={form.control}
 *   name="serviceProvider.name"
 *   label="Provider Name"
 *   circularRef="54.e"
 *   existingProviderNames={["AWS", "Azure", "Google Cloud"]}
 *   placeholder="e.g., CloudTech Solutions S.A."
 * />
 */
export function FormProviderInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  circularRef,
  placeholder = "e.g., CloudTech Solutions S.A.",
  required = false,
  tooltip,
  className = "",
  toggleFieldPending,
  isFieldPending,
  existingProviderNames,
}: FormProviderInputProps<TFieldValues>) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Filter suggestions based on search input (case-insensitive)
        const filteredProviders = existingProviderNames.filter((name) =>
          name.toLowerCase().includes(searchValue.toLowerCase())
        )

        const handleSelect = (provider: string) => {
          field.onChange(provider)
          setSearchValue("")
          setOpen(false)
        }

        const handleCreateNew = (value: string) => {
          if (value.trim()) {
            field.onChange(value)
            setSearchValue("")
            setOpen(false)
          }
        }

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

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between text-base"
                >
                  {field.value || placeholder}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[500px] p-0">
                <Command>
                  <CommandInput
                    placeholder="Search providers or type new name..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandEmpty>
                    {searchValue ? (
                      <div className="py-6 px-4 text-center text-sm">
                        <div className="text-muted-foreground mb-2">No matching provider found.</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateNew(searchValue)}
                        >
                          Create &quot;{searchValue}&quot;
                        </Button>
                      </div>
                    ) : (
                      "No existing providers."
                    )}
                  </CommandEmpty>
                  <CommandGroup className="max-h-[200px] overflow-auto">
                    {filteredProviders.map((provider) => (
                      <CommandItem
                        key={provider}
                        value={provider}
                        onSelect={() => handleSelect(provider)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === provider ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {provider}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>

            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
