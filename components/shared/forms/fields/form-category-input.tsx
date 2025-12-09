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
import { OutsourcingCategory } from "@/lib/types/supplier"
import { type Control, type FieldPath, type FieldValues } from "react-hook-form"

interface FormCategoryInputProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>
  name: FieldPath<TFieldValues>
  label: string
  circularRef?: string
  placeholder?: string
  required?: boolean
  className?: string
  toggleFieldPending?: (fieldPath: string) => void
  isFieldPending?: (fieldPath: string) => boolean
  existingCategories: string[]
}

/**
 * Category autocomplete component with enum suggestions
 * Displays standard OutsourcingCategory enum values + existing custom categories
 * Allows free-form entry for new custom categories
 *
 * Pattern: Hybrid of FormSelect (enum options) + FormProviderInput (autocomplete)
 *
 * @example
 * <FormCategoryInput
 *   control={form.control}
 *   name="category"
 *   label="Category"
 *   circularRef="54.d"
 *   existingCategories={["Cloud", "ICT Services", "Custom Category 1"]}
 * />
 */
export function FormCategoryInput<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  circularRef,
  placeholder = "Select or enter category",
  required = false,
  className = "",
  toggleFieldPending,
  isFieldPending,
  existingCategories,
}: FormCategoryInputProps<TFieldValues>) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  // Combine enum + custom categories (deduplicated)
  const allCategories = [
    ...Object.values(OutsourcingCategory),
    ...existingCategories.filter(
      (cat) => !Object.values(OutsourcingCategory).includes(cat as OutsourcingCategory)
    ),
  ]

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const filteredCategories = allCategories.filter((cat) =>
          cat.toLowerCase().includes(searchValue.toLowerCase())
        )

        const handleSelect = (category: string) => {
          field.onChange(category)
          setSearchValue("")
          setOpen(false)
        }

        const handleCreateNew = (value: string) => {
          if (value.trim()) {
            field.onChange(value.trim())
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
                    placeholder="Search categories or type new..."
                    value={searchValue}
                    onValueChange={setSearchValue}
                  />
                  <CommandEmpty>
                    {searchValue ? (
                      <div className="py-6 px-4 text-center text-sm">
                        <div className="text-muted-foreground mb-2">No matching category found.</div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreateNew(searchValue)}
                        >
                          Create &quot;{searchValue}&quot;
                        </Button>
                      </div>
                    ) : (
                      "No categories available."
                    )}
                  </CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-auto">
                    {filteredCategories.map((category) => (
                      <CommandItem
                        key={category}
                        value={category}
                        onSelect={() => handleSelect(category)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            field.value === category ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {category}
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
