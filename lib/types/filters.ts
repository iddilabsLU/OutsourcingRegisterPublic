/**
 * Type definitions for the filtering system
 */

export type FilterFieldType =
  | "searchAllFields"
  | "providerName"
  | "category"
  | "servicePerformanceCountries"
  | "dataLocationCountry"
  | "risk"
  | "activitiesSubOutsourced"
  | "timeCritical"

export interface CustomFilter {
  id: string
  field: FilterFieldType | ""
  value: string
}

export interface QuickFilters {
  critical: boolean
  nonCritical: boolean
  cloud: boolean
  serviceOutsourcings: boolean
  status: {
    active: boolean
    draft: boolean
    notYetActive: boolean
    terminated: boolean
  }
}

export interface FilterState {
  quickFilters: QuickFilters
  customFilters: CustomFilter[]
}

export interface FilterFieldOption {
  value: FilterFieldType
  label: string
  inputType: "text" | "select"
  options?: Array<{ value: string; label: string }>
}

// Available filter field options with their metadata
export const FILTER_FIELD_OPTIONS: FilterFieldOption[] = [
  {
    value: "searchAllFields",
    label: "Search All Fields",
    inputType: "text",
  },
  {
    value: "providerName",
    label: "Provider Name",
    inputType: "text",
  },
  {
    value: "category",
    label: "Category",
    inputType: "select",
    options: [
      { value: "Cloud", label: "Cloud" },
      { value: "ICT Services", label: "ICT Services" },
      { value: "Internal Control Functions", label: "Internal Control Functions" },
      { value: "Payment Processing", label: "Payment Processing" },
      { value: "Data Storage & Hosting", label: "Data Storage & Hosting" },
      { value: "Customer Service", label: "Customer Service" },
      { value: "Facilities Management", label: "Facilities Management" },
      { value: "Marketing & Communications", label: "Marketing & Communications" },
      { value: "Compliance Services", label: "Compliance Services" },
      { value: "Audit Services", label: "Audit Services" },
      { value: "Other", label: "Other" },
    ],
  },
  {
    value: "servicePerformanceCountries",
    label: "Service Performance Countries",
    inputType: "text",
  },
  {
    value: "dataLocationCountry",
    label: "Data Location Country",
    inputType: "text",
  },
  {
    value: "risk",
    label: "Risk",
    inputType: "select",
    options: [
      { value: "Low", label: "Low" },
      { value: "Medium", label: "Medium" },
      { value: "High", label: "High" },
    ],
  },
  {
    value: "activitiesSubOutsourced",
    label: "Activities sub-outsourced?",
    inputType: "select",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
  },
  {
    value: "timeCritical",
    label: "Time-Critical Function",
    inputType: "select",
    options: [
      { value: "Yes", label: "Yes" },
      { value: "No", label: "No" },
    ],
  },
]
