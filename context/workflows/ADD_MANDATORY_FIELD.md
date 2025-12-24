# Workflow: Adding a Mandatory CSSF Field

This guide walks through adding a new mandatory field to the Supplier Register, ensuring CSSF compliance and proper validation.

---

## When to Use This Workflow

- Adding a new CSSF Circular 22/806 field requirement
- Converting an optional field to mandatory
- Adding a conditional field (Cloud or Critical)

---

## Overview

Adding a mandatory field involves 5 steps:

1. **Update TypeScript Types** - Define field structure
2. **Update Zod Schema** - Add type validation (Layer 1)
3. **Update Completeness Checker** - Add business validation (Layer 2)
4. **Add Form Field Component** - Allow user input
5. **Add Display Component** - Show in register table

---

## Step-by-Step Guide

### Step 1: Update TypeScript Types

**File:** `lib/types/supplier.ts`

**Determine where to add field:**
- **Point 54 (All Suppliers)** → `MandatoryOutsourcingFields` interface
- **Point 54.h (Cloud)** → `MandatoryOutsourcingFields.cloudService` object
- **Point 55 (Critical)** → `CriticalOutsourcingFields` interface

**Example: Adding "Backup Officer" to Point 54.e (Service Provider)**

```typescript
// lib/types/supplier.ts:84
export interface MandatoryOutsourcingFields {
  // ... existing fields

  // 54.e - Service Provider Information
  serviceProvider: {
    name: string
    corporateRegistrationNumber: string
    legalEntityIdentifier?: string
    registeredAddress: string
    contactDetails: string
    parentCompany?: string
    backupOfficer: string  // ✅ Add new field
  }
}
```

**Field Type Guidelines:**
- `string` - Text field (name, address, description)
- `string?` - Optional text (LEI, Parent Company)
- `boolean` - Yes/No (isCritical, personalDataInvolved)
- `number` - Numeric (estimatedAnnualCost)
- `string[]` - Multiple values (servicePerformanceCountries, alternativeProviders)
- `EnumName` - Predefined options (OutsourcingStatus, RiskLevel)

---

### Step 2: Update Zod Schema (Layer 1)

**File:** `lib/validations/supplier-schema.ts`

**Add field as `.optional()`** - All fields are optional in Zod schema (validation happens in Layer 2)

**Example:**

```typescript
// lib/validations/supplier-schema.ts:53
export const supplierFormSchema = z.object({
  // ... existing fields

  serviceProvider: z
    .object({
      name: z.string().optional(),
      corporateRegistrationNumber: z.string().optional(),
      legalEntityIdentifier: z.string().optional(),
      registeredAddress: z.string().optional(),
      contactDetails: z.string().optional(),
      parentCompany: z.string().optional(),
      backupOfficer: z.string().optional(),  // ✅ Add new field
    })
    .optional(),
})
```

**Type Mapping:**
- `string` → `z.string().optional()`
- `string?` → `z.string().optional()`
- `boolean` → `z.boolean().optional()`
- `number` → `z.number().optional()`
- `string[]` → `z.array(z.string()).optional()`
- `EnumName` → `z.nativeEnum(EnumName).optional()`

---

### Step 3: Update Completeness Checker (Layer 2)

**File:** `lib/utils/check-completeness.ts`

**Add validation check** - Determine if field is always mandatory or conditional

**Example: Always Mandatory (Point 54)**

```typescript
// lib/utils/check-completeness.ts:98
export function checkIncompleteFields(
  data: Partial<SupplierOutsourcing>,
  pendingFields: string[] = []
): CompletenessCheckResult {
  // ... existing checks

  // 54.e - Service Provider Information
  if (!data.serviceProvider?.name || data.serviceProvider.name.trim() === "") {
    addIncomplete("serviceProvider.name", "Provider Name (54.e)")
  }
  // ... other serviceProvider checks

  // ✅ Add new check
  if (!data.serviceProvider?.backupOfficer || data.serviceProvider.backupOfficer.trim() === "") {
    addIncomplete("serviceProvider.backupOfficer", "Backup Officer (54.e)")
  }
}
```

**Example: Conditional (Cloud Only - Point 54.h)**

```typescript
// lib/utils/check-completeness.ts:144
if (data.category === OutsourcingCategory.CLOUD) {
  if (!data.cloudService?.serviceModel) {
    addIncomplete("cloudService.serviceModel", "Cloud Service Model (54.h)")
  }
  // ✅ Add new conditional check
  if (!data.cloudService?.backupOfficer || data.cloudService.backupOfficer.trim() === "") {
    addIncomplete("cloudService.backupOfficer", "Cloud Backup Officer (54.h)")
  }
}
```

**Example: Conditional (Critical Only - Point 55)**

```typescript
// lib/utils/check-completeness.ts:170
if (data.criticality?.isCritical === true && data.criticalFields) {
  const cf = data.criticalFields

  // ✅ Add new critical check
  if (!cf.backupOfficer || cf.backupOfficer.trim() === "") {
    addIncomplete("criticalFields.backupOfficer", "Backup Officer (55.x)")
  }
}
```

**Validation Patterns:**

| Type | Validation Check |
|------|------------------|
| String | `!field || field.trim() === ""` |
| String? | Same as string (optional handled by `addIncomplete` + pending logic) |
| Boolean | `field === undefined` (not `!field` - false is valid) |
| Number | `field === undefined || field === null` |
| Array | `!field || field.length === 0` |
| Enum | `!field` |

---

### Step 4: Add Form Field Component

**Determine which tab:**
- **Basic Information** → `components/shared/forms/supplier-form-basic-info.tsx`
- **Service Provider** → `components/shared/forms/supplier-form-provider.tsx`
- **Cloud Services** → `components/shared/forms/supplier-form-cloud.tsx`
- **Critical Functions** → `components/shared/forms/supplier-form-critical.tsx`

**Example: Adding to Service Provider Tab**

**File:** `components/shared/forms/supplier-form-provider.tsx`

```tsx
// Import field component if not already imported
import { FormTextInput } from "./fields/form-text-input"

// Add inside <Card> within appropriate section
<div className="grid grid-cols-2 gap-x-6 gap-y-4">
  {/* Existing fields */}
  <FormTextInput
    control={form.control}
    name="serviceProvider.name"
    label="Provider Name"
    cssfPoint="54.e"
    required
    pendingFields={pendingFields}
    onTogglePending={onTogglePending}
  />

  {/* ✅ Add new field */}
  <FormTextInput
    control={form.control}
    name="serviceProvider.backupOfficer"
    label="Backup Officer"
    cssfPoint="54.e"
    required
    placeholder="Enter backup officer name"
    pendingFields={pendingFields}
    onTogglePending={onTogglePending}
  />
</div>
```

**Field Component Selection:**

| Field Type | Component | Example |
|------------|-----------|---------|
| Text (short) | `FormTextInput` | Name, email, phone |
| Text (long) | `FormTextarea` | Description, assessment, notes |
| Dropdown | `FormSelect` | Status, category, risk level |
| Date | `FormDatePicker` | Start date, audit date |
| Yes/No | `FormRadioGroup` | isCritical, personalDataInvolved |
| Multiple text | `FormMultiText` | Countries, providers, entities |

**Props for FormTextInput:**
```typescript
{
  control: form.control,           // React Hook Form control
  name: "serviceProvider.backupOfficer",  // Field path (matches Zod schema)
  label: "Backup Officer",          // Display label
  cssfPoint: "54.e",                // CSSF reference
  required: true,                   // Shows red asterisk
  placeholder: "Enter name",        // Optional placeholder
  pendingFields: pendingFields,     // Set of pending field paths
  onTogglePending: onTogglePending, // Toggle function
}
```

---

### Step 5: Add Display Component

**Determine which tab:**
- **Basic Info** → `components/shared/supplier-basic-info.tsx`
- **Provider Details** → `components/shared/supplier-provider-details.tsx`
- **Cloud Services** → `components/shared/supplier-cloud-services.tsx`
- **Critical Functions** → `components/shared/supplier-critical-functions.tsx`

**Example: Adding to Provider Details**

**File:** `components/shared/supplier-provider-details.tsx`

```tsx
import { FieldDisplay } from "./field-display"
import { useSearch } from "@/lib/contexts/search-context"

export function SupplierProviderDetails({ supplier }: Props) {
  const { searchTerm } = useSearch()

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Existing fields */}
      <FieldDisplay
        label="Provider Name"
        value={supplier.serviceProvider.name}
        cssfPoint="54.e"
        searchTerm={searchTerm}
      />

      {/* ✅ Add new field */}
      <FieldDisplay
        label="Backup Officer"
        value={supplier.serviceProvider.backupOfficer}
        cssfPoint="54.e"
        searchTerm={searchTerm}
        isPending={supplier.pendingFields?.includes("serviceProvider.backupOfficer")}
      />
    </div>
  )
}
```

**FieldDisplay Props:**
```typescript
{
  label: "Backup Officer",                    // Display label
  value: supplier.serviceProvider.backupOfficer,  // Field value
  cssfPoint: "54.e",                          // CSSF reference
  searchTerm: searchTerm,                     // For text highlighting
  isPending: supplier.pendingFields?.includes("serviceProvider.backupOfficer"),
}
```

---

## Testing Checklist

After adding the field, test the following:

### ✅ TypeScript Compilation
```bash
$ npm run build
```
- No TypeScript errors
- Field type is recognized throughout codebase

### ✅ Form Validation
1. Open "New Entry" view
2. Leave new field empty
3. Click "Save Supplier"
4. Confirm new field appears in incomplete fields dialog
5. Mark field as pending → save succeeds
6. Fill field → save succeeds without pending

### ✅ Pending Fields Feature
1. Click pending toggle (amber pin) → icon appears
2. Save supplier → field marked as pending
3. View in register table → amber badge shows
4. Expand row → field shows amber 📌 icon

### ✅ Display in Register
1. Add supplier with new field filled
2. Expand row in register table
3. Navigate to appropriate tab
4. Confirm field displays with correct label and CSSF point

### ✅ Text Highlighting (if applicable)
1. Add filter: "Search All Fields" with text matching field value
2. Expand supplier row
3. Confirm matching text is highlighted in yellow

### ✅ Conditional Logic (if applicable)
**For Cloud fields:**
1. Add supplier with Category = "Cloud"
2. Confirm Cloud tab is enabled
3. Confirm new field is visible and validated
4. Change category to "ICT Services"
5. Confirm Cloud tab is disabled
6. Save supplier → no validation errors for cloud fields

**For Critical fields:**
1. Add supplier with "Is Critical" = Yes
2. Confirm Critical Functions tab is enabled
3. Confirm new field is visible and validated
4. Change to "Is Critical" = No
5. Confirm Critical Functions tab is disabled
6. Save supplier → no validation errors for critical fields

---

## Common Issues & Solutions

### Issue: TypeScript error "Property does not exist"
**Cause:** Field not added to TypeScript type
**Solution:** Add field to appropriate interface in `lib/types/supplier.ts`

### Issue: Field not validated on save
**Cause:** Missing check in completeness checker
**Solution:** Add validation logic in `lib/utils/check-completeness.ts`

### Issue: Field doesn't appear in form
**Cause:** Missing form field component
**Solution:** Add field to appropriate tab component in `components/shared/forms/`

### Issue: Field doesn't show in register table
**Cause:** Missing display component
**Solution:** Add `FieldDisplay` to appropriate detail tab component

### Issue: Pending toggle doesn't work
**Cause:** Wrong field path used
**Solution:** Verify field path matches exactly across all files (e.g., `"serviceProvider.backupOfficer"`)

### Issue: Text highlighting doesn't work
**Cause:** `searchTerm` not passed to FieldDisplay
**Solution:** Use `useSearch()` hook and pass `searchTerm` prop

---

## Field Path Reference

When adding fields, use these exact path formats:

### Top-Level Fields
```typescript
"referenceNumber"
"status"
"category"
"criticalityAssessmentDate"
```

### Nested Fields (Dot Notation)
```typescript
"dates.startDate"
"functionDescription.name"
"serviceProvider.name"
"location.dataLocationCountry"
"criticality.isCritical"
"cloudService.serviceModel"
```

### Deep Nested Fields
```typescript
"criticalFields.entitiesUsing.inScopeEntities"
"criticalFields.riskAssessment.risk"
"criticalFields.approval.approverName"
```

### Array Fields
```typescript
"location.servicePerformanceCountries"  // string[]
"criticalFields.alternativeProviders"   // string[]
```

### Sub-Contractor Fields (with index)
```typescript
"criticalFields.subOutsourcing.subContractors.0.name"
"criticalFields.subOutsourcing.subContractors.1.activityDescription"
```

---

## Example: Complete Field Addition

**Scenario:** Add "Emergency Contact Email" to Point 54.e (Service Provider)

### 1. TypeScript Type
```typescript
// lib/types/supplier.ts:84
serviceProvider: {
  // ... existing fields
  emergencyContactEmail: string  // ✅ New field
}
```

### 2. Zod Schema
```typescript
// lib/validations/supplier-schema.ts:53
serviceProvider: z.object({
  // ... existing fields
  emergencyContactEmail: z.string().optional(),  // ✅ New field
}).optional(),
```

### 3. Completeness Checker
```typescript
// lib/utils/check-completeness.ts:98
if (!data.serviceProvider?.emergencyContactEmail || data.serviceProvider.emergencyContactEmail.trim() === "") {
  addIncomplete("serviceProvider.emergencyContactEmail", "Emergency Contact Email (54.e)")
}
```

### 4. Form Field
```tsx
// components/shared/forms/supplier-form-provider.tsx
<FormTextInput
  control={form.control}
  name="serviceProvider.emergencyContactEmail"
  label="Emergency Contact Email"
  cssfPoint="54.e"
  required
  placeholder="email@example.com"
  pendingFields={pendingFields}
  onTogglePending={onTogglePending}
/>
```

### 5. Display Field
```tsx
// components/shared/supplier-provider-details.tsx
<FieldDisplay
  label="Emergency Contact Email"
  value={supplier.serviceProvider.emergencyContactEmail}
  cssfPoint="54.e"
  searchTerm={searchTerm}
  isPending={supplier.pendingFields?.includes("serviceProvider.emergencyContactEmail")}
/>
```

---

**Last Updated:** 2025-10-25
**Related Files:** supplier.ts, supplier-schema.ts, check-completeness.ts, form components, display components
