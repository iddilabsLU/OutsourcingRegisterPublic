"use client"

import { useState } from "react"
import { countries } from "countries-list"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Check, ChevronsUpDown, X } from "lucide-react"
import { PendingToggle } from "../pending-toggle"
import { CssfReference } from "@/components/shared/cssf-reference"
import { cn } from "@/lib/utils"
import { type Control, type FieldPath, type FieldValues } from "react-hook-form"

// All world countries alphabetically (~195 countries)
const ALL_COUNTRIES = Object.values(countries)
  .map((country) => country.name)
  .sort()

interface FormCountryMultiSelectProps<TFieldValues extends FieldValues> {
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
 * Country multi-select dropdown component
 * Allows selecting multiple countries from complete world country list (~195 countries)
 * Displays selected countries as removable badges
 * Includes built-in search functionality
 *
 * @example
 * <FormCountryMultiSelect
 *   control={form.control}
 *   name="location.dataLocationCountry"
 *   label="Data Location Countries"
 *   circularRef="54.f"
 *   required
 * />
 */
export function FormCountryMultiSelect<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  circularRef,
  required = false,
  tooltip,
  className = "",
  toggleFieldPending,
  isFieldPending,
}: FormCountryMultiSelectProps<TFieldValues>) {
  const [open, setOpen] = useState(false)

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedCountries = (field.value as string[]) || []

        const handleSelect = (country: string) => {
          const updatedCountries = selectedCountries.includes(country)
            ? selectedCountries.filter((c) => c !== country)
            : [...selectedCountries, country]
          field.onChange(updatedCountries)
        }

        const handleRemove = (country: string) => {
          const updatedCountries = selectedCountries.filter((c) => c !== country)
          field.onChange(updatedCountries)
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

            <div className="space-y-2">
              {/* Selected Countries Badges */}
              {selectedCountries.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedCountries.map((country) => (
                    <Badge
                      key={country}
                      variant="secondary"
                      className="gap-1 pr-1"
                    >
                      {country}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-auto p-1 hover:bg-transparent"
                        onClick={() => handleRemove(country)}
                      >
                        <X className="h-3 w-3" />
                        <span className="sr-only">Remove {country}</span>
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Country Selector Dropdown */}
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between"
                  >
                    {selectedCountries.length > 0
                      ? `${selectedCountries.length} selected`
                      : "Select countries..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search countries..." />
                    <CommandEmpty>No country found.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-auto">
                      {ALL_COUNTRIES.map((country) => (
                        <CommandItem
                          key={country}
                          value={country}
                          onSelect={() => handleSelect(country)}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCountries.includes(country)
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {country}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <FormMessage />
          </FormItem>
        )
      }}
    />
  )
}
