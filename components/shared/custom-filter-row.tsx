"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type {
  CustomFilter,
  FilterFieldType} from "@/lib/types/filters";
import {
  FILTER_FIELD_OPTIONS,
} from "@/lib/types/filters"

interface CustomFilterRowProps {
  filter: CustomFilter
  onFieldChange: (filterId: string, field: FilterFieldType | "") => void
  onValueChange: (filterId: string, value: string) => void
  onRemove: (filterId: string) => void
  showRemove?: boolean
}

export function CustomFilterRow({
  filter,
  onFieldChange,
  onValueChange,
  onRemove,
  showRemove = true,
}: CustomFilterRowProps) {
  const selectedFieldOption = FILTER_FIELD_OPTIONS.find(
    (option) => option.value === filter.field
  )

  return (
    <div className="flex items-center gap-1">
      {/* Field Selector */}
      <div className="min-w-[160px]">
        <Select
          value={filter.field}
          onValueChange={(value) => onFieldChange(filter.id, value as FilterFieldType)}
        >
          <SelectTrigger id={`field-${filter.id}`} className="h-8">
            <SelectValue placeholder="Select field..." />
          </SelectTrigger>
          <SelectContent>
            {FILTER_FIELD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Adaptive Value Input */}
      <div className="min-w-[160px]">
        {selectedFieldOption?.inputType === "select" ? (
          <Select value={filter.value} onValueChange={(value) => onValueChange(filter.id, value)}>
            <SelectTrigger id={`value-${filter.id}`} className="h-8">
              <SelectValue placeholder="Select value..." />
            </SelectTrigger>
            <SelectContent>
              {selectedFieldOption.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={`value-${filter.id}`}
            type="text"
            placeholder={
              filter.field
                ? `Enter ${selectedFieldOption?.label.toLowerCase()}...`
                : "Select a field first"
            }
            value={filter.value}
            onChange={(e) => onValueChange(filter.id, e.target.value)}
            disabled={!filter.field}
            className="h-8"
          />
        )}
      </div>

      {/* Remove Button */}
      {showRemove && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(filter.id)}
          className="h-8 w-8 shrink-0"
          title="Remove filter"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
