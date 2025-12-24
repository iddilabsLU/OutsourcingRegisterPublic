# Validation System

This document explains how form validation works in the Supplier Register application.

---

## Overview

The application uses a **two-layer validation approach** to separate technical checks from business logic:

1. **Layer 1: Zod Schema** (Type Safety) - Validates data types only
2. **Layer 2: Completeness Checker** (Business Logic) - Validates CSSF mandatory fields

This separation allows for:
- **Pending Fields Feature** - Mark incomplete fields for later completion
- **Save as Draft** - Save partially complete suppliers without validation errors
- **Type Safety** - Prevent runtime errors from invalid data types
- **Reporting Alignment** - Event generation for the reporting change log skips fields marked as pending, so incomplete/pending data does not create change events
- **Issue Follow-Ups** - Follow-ups are free-form notes and are not subject to the CSSF completeness checks; they remain optional

---

## Layer 1: Zod Schema (Type Safety)

**File:** `lib/validations/supplier-schema.ts`

### Purpose
Validates that data has the correct **structure and types** (string, number, boolean, enum) but does NOT validate content.

### Key Characteristics
- **All fields are `.optional()`** - No required field validation at this layer
- **No content validation** - No `.min()`, `.max()`, `.refine()`, or custom rules
- **Type safety only** - Ensures strings are strings, numbers are numbers, enums are valid values
- **No red borders on blur** - Real-time validation is disabled

### Example Schema Structure
```typescript
export const supplierFormSchema = z.object({
  referenceNumber: z.string().optional(),              // ✅ Type check only
  status: z.nativeEnum(OutsourcingStatus).optional(),  // ✅ Valid enum only
  dates: z.object({
    startDate: z.string().optional(),                  // ✅ Type check only
    // ... other date fields
  }).optional(),
  // ... 73 total fields
})
```

### What It Catches
- ❌ Passing a number when expecting a string
- ❌ Invalid enum values (e.g., "InvalidStatus" for OutsourcingStatus)
- ❌ Invalid data structure (e.g., passing string when expecting object)

### What It Allows
- ✅ Empty strings (`""`)
- ✅ Missing fields (`undefined`)
- ✅ Partial form data

---

## Layer 2: Completeness Checker (Business Logic)

**File:** `lib/utils/check-completeness.ts`

### Purpose
Validates that **all mandatory fields required by CSSF Circular 22/806** are present and non-empty.

### Key Characteristics
- **Runs ONLY when clicking "Save Supplier"** button
- **Respects pending fields** - Skips validation for fields marked as pending
- **CSSF-compliant** - Implements Point 54, 54.h, and 55 requirements
- **User-friendly labels** - Shows field names with CSSF references (e.g., "Provider Name (54.e)")
- **Conditional logic** - Only checks cloud fields if Category = Cloud, critical fields if Is Critical = Yes

### Function Signature
```typescript
export function checkIncompleteFields(
  data: Partial<SupplierOutsourcing>,
  pendingFields: string[] = []
): CompletenessCheckResult
```

**Parameters:**
- `data` - The form data to validate
- `pendingFields` - Array of field paths marked as pending (e.g., `["serviceProvider.name", "dates.startDate"]`)

**Returns:**
```typescript
{
  incomplete: string[],     // Field paths that are missing (e.g., "serviceProvider.name")
  labels: string[],          // User-friendly labels (e.g., "Provider Name (54.e)")
  isComplete: boolean        // True if all mandatory fields are complete
}
```

### Validation Rules

#### Point 54: Mandatory for ALL Suppliers (23 fields)
```typescript
// Examples:
- referenceNumber: must be non-empty string
- status: must be valid enum value
- dates.startDate: must be non-empty string
- functionDescription.name: must be non-empty string
- serviceProvider.name: must be non-empty string
- location.servicePerformanceCountries: must be non-empty array
- location.dataLocationCountry: must be non-empty array (ARRAY TYPE - updated Nov 2025)
- criticality.isCritical: must be true or false (not undefined)
// ... 16 more fields
```

#### Array Field Validation (NEW - Nov 2025)

**Breaking Change:** `dataLocationCountry` changed from `string` to `string[]` (array type)

**Why This Change:**
- Suppliers often store data in multiple countries
- Single-string field was artificial limitation
- Array allows more accurate compliance tracking

**How Array Validation Works:**

**Zod Schema (Layer 1):**
```typescript
location: z.object({
  dataLocationCountry: z.array(z.string()).optional(),  // Any array of strings allowed
  servicePerformanceCountries: z.array(z.string()).optional(),
  otherDataLocationInfo: z.string().optional(),
}).optional(),
```

**Completeness Checker (Layer 2):**
```typescript
// ✅ Validation passes if:
- Array has at least 1 country: ["Luxembourg"]
- Array has multiple countries: ["Luxembourg", "Germany", "USA"]

// ❌ Validation fails if:
- Array is empty: []
- Field is undefined/null
- Field is marked as pending (then it's skipped)
```

**Example - Adding Multiple Countries:**
```typescript
// Old (pre-Nov 2025):
location: {
  dataLocationCountry: "Luxembourg"
}

// New (Nov 2025+):
location: {
  dataLocationCountry: ["Luxembourg", "Germany", "Belgium"]
}
```

**Dashboard Integration:**
- Suppliers with data in Luxembourg AND Germany both contribute to:
  - **EU Data Count:** +1 (counted once per supplier)
  - **Data Location Countries:** Both countries tracked separately
- Example: 5 suppliers with data in Luxembourg = Luxembourg: 5 suppliers
- If same supplier has data in both Luxembourg AND USA = appears in both EU and Non-EU sections

#### Point 54.h: Cloud Services (Conditional - 6 fields)
**Only checked when `category === OutsourcingCategory.CLOUD`**

```typescript
- cloudService.serviceModel: must be valid enum (IaaS, PaaS, SaaS)
- cloudService.deploymentModel: must be valid enum (Public, Private, Hybrid, Community)
- cloudService.dataNature: must be non-empty string
- cloudService.storageLocations: must be non-empty array
- cloudService.cloudOfficer: must be non-empty string (or pending)
- cloudService.resourceOperator: must be non-empty string (or pending)
```

#### Point 55: Critical Functions (Conditional - 18+ fields)
**Only checked when `criticality.isCritical === true`**

```typescript
- criticalFields.entitiesUsing.inScopeEntities: must be non-empty array
- criticalFields.groupRelationship.isPartOfGroup: must be true or false
- criticalFields.riskAssessment.risk: must be valid enum (Low, Medium, High)
- criticalFields.approval.approverName: must be non-empty string
- criticalFields.governingLaw: must be non-empty string
- criticalFields.audit.lastAuditDate: must be non-empty string
// ... 12+ more fields

// Sub-outsourcing toggle and subcontractors:
- criticalFields.subOutsourcing.hasSubOutsourcing: must be true or false (not undefined)

// If hasSubOutsourcing = true:
- criticalFields.subOutsourcing.subContractors: must be non-empty array
  - Each sub-contractor must have: name, activityDescription, registrationCountry,
    servicePerformanceCountry, dataStorageLocation
```

### How Pending Fields Work

The completeness checker has a helper function that skips validation for pending fields:

```typescript
const addIncomplete = (path: string, label: string) => {
  // Skip validation if field is marked as pending
  if (pendingFields.includes(path)) {
    return  // ✅ Skip this field
  }
  incomplete.push(path)
  labels.push(label)
}
```

**Example:**
- User marks `serviceProvider.name` as pending (amber pin button)
- `pendingFields = ["serviceProvider.name"]`
- When completeness checker runs, it **skips** this field
- User can save supplier without completing this field

**Note on Sub-Outsourcing:**
- The `hasSubOutsourcing` toggle is always checked first (must be true/false)
- If toggle = true, then subcontractor array is checked
- If toggle = false, subcontractor validation is skipped
- This two-step validation allows proper pending field handling

---

## When Validation Happens

### ❌ Validation Does NOT Happen On:
- Typing in fields
- Blurring (leaving) a field
- Switching tabs
- Loading form
- Clicking "Cancel"

### ✅ Validation ONLY Happens When:
1. **Clicking "Save Supplier" button**
   - Runs completeness checker
   - If incomplete fields found → shows confirmation dialog
   - Dialog lists all missing fields with CSSF references

2. **Clicking "Save as Draft" button**
   - Does NOT run completeness checker
   - Automatically marks ALL empty required fields as pending
   - Saves supplier immediately without validation

---

## User Flow Examples

### Example 1: Complete Supplier (All Fields Filled)
```
1. User fills all 73 fields
2. User clicks "Save Supplier"
3. Completeness checker runs → isComplete: true
4. Supplier saved successfully ✅
5. Toast: "Supplier added successfully!"
```

### Example 2: Incomplete Supplier (Missing Fields)
```
1. User fills 50/73 fields
2. User clicks "Save Supplier"
3. Completeness checker runs → incomplete: 23 fields
4. Confirmation dialog appears:

   "The following mandatory fields are incomplete:"
   - Provider Name (54.e)
   - Contact Details (54.e)
   - Data Location Country (54.f)
   ... (20 more)

   [Mark as Pending & Submit] [Go Back to Form]

5. If "Go Back to Form" → returns to form, no save
6. If "Mark as Pending & Submit" → marks 23 fields as pending, saves supplier ✅
```

### Example 3: Save as Draft
```
1. User fills 30/73 fields
2. User clicks "Save as Draft"
3. NO validation runs
4. System finds all 43 empty required fields
5. Automatically marks 43 fields as pending
6. Supplier saved with status "Draft" ✅
7. Toast: "Supplier saved as draft"
```

### Example 4: Pending Fields Feature
```
1. User fills 60/73 fields
2. User manually marks 10 empty fields as pending (amber pin button)
3. User fills 3 more fields (now 63/73 complete)
4. User clicks "Save Supplier"
5. Completeness checker runs:
   - 10 fields pending → skipped ✅
   - 3 fields empty + not pending → incomplete ❌
6. Dialog shows only 3 missing fields
7. User can mark these 3 as pending or go back
```

---

## Conditional Validation Logic

### Cloud Services Tab
```typescript
if (data.category === OutsourcingCategory.CLOUD) {
  // Check 6 cloud-specific fields (Point 54.h)
  // Examples: serviceModel, deploymentModel, dataNature, storageLocations
}
```

**When Tab is Hidden:** Cloud fields are NOT checked (tab is disabled)
**When Tab is Visible:** All 6 cloud fields become mandatory

### Critical Functions Tab
```typescript
if (data.criticality?.isCritical === true) {
  // Check 18+ critical-specific fields (Point 55)
  // Examples: entitiesUsing, riskAssessment, approval, governingLaw
}
```

**When Tab is Hidden:** Critical fields are NOT checked (tab is disabled)
**When Tab is Visible:** All 18+ critical fields become mandatory

### Sub-Outsourcing (Within Critical)
```typescript
// Step 1: Always check toggle for critical suppliers
if (data.criticality?.isCritical === true) {
  // hasSubOutsourcing toggle must be true or false
}

// Step 2: If toggle = true, check subcontractors
if (data.criticalFields?.subOutsourcing?.hasSubOutsourcing === true) {
  // Check sub-contractor array is non-empty
  // Check each sub-contractor has 5 mandatory fields
}
```

**When Hidden:** Sub-contractor fields are NOT checked
**When Toggle = No:** Sub-contractor fields are NOT checked
**When Toggle = Yes:** Sub-contractor array and all sub-contractor fields become mandatory

---

## Error Handling & User Feedback

### No Red Borders During Typing
- Zod schema does NOT trigger errors on blur
- No real-time validation feedback
- Form always appears "valid" until save

### Confirmation Dialog on Save
**Appears when:** User clicks "Save Supplier" with incomplete fields

**Shows:**
- Count of missing fields (e.g., "23 mandatory fields are incomplete")
- List of field labels with CSSF references
- Two action buttons:
  1. **Mark as Pending & Submit** - Marks all missing fields as pending, saves supplier
  2. **Go Back to Form** - Closes dialog, returns to form

**Does NOT show:**
- Pending fields (these are intentionally skipped)
- Optional fields (LEI, Parent Company)

### Amber Badges in Register Table
After saving with pending fields:
- Supplier row shows amber badge: "X pending fields"
- Clicking row expands details
- Pending fields display amber 📌 icon

---

## File Reference

| File | Purpose | Lines |
|------|---------|-------|
| `lib/validations/supplier-schema.ts` | Zod schema for type safety (Layer 1) | 196 |
| `lib/utils/check-completeness.ts` | Mandatory field checker (Layer 2) | 334 |
| `components/shared/forms/supplier-form.tsx` | Form container, validation orchestration | ~400 |
| `components/shared/forms/incomplete-fields-dialog.tsx` | Confirmation dialog UI | ~100 |
| `components/shared/forms/pending-toggle.tsx` | Amber pin button for marking fields | ~50 |

---

## Technical Implementation Notes

### Why Two Layers?

**Problem:** React Hook Form + Zod traditionally shows red borders on blur, which is annoying for users filling 73 fields.

**Solution:** Split validation into two independent layers:
1. **Zod** - Type safety only (prevents crashes)
2. **Completeness Checker** - Business logic (CSSF compliance)

### Key Code Locations

**Zod Schema Definition:**
```typescript
// lib/validations/supplier-schema.ts:20
export const supplierFormSchema = z.object({
  referenceNumber: z.string().optional(),  // All fields optional
  // ... 73 fields
})
```

**Completeness Checker:**
```typescript
// lib/utils/check-completeness.ts:28
export function checkIncompleteFields(
  data: Partial<SupplierOutsourcing>,
  pendingFields: string[] = []
): CompletenessCheckResult
```

**Validation Trigger:**
```typescript
// components/shared/forms/supplier-form.tsx (Save Supplier handler)
const handleSaveSupplier = () => {
  const formData = form.getValues()
  const pendingFieldsArray = Array.from(pendingFields)

  // Run completeness checker (Layer 2)
  const result = checkIncompleteFields(formData, pendingFieldsArray)

  if (!result.isComplete) {
    setIncompleteFieldsList(result.labels)
    setShowIncompleteDialog(true)  // Show dialog
  } else {
    // Save supplier ✅
  }
}
```

---

## Future Enhancements

### Possible Improvements (Not Implemented)
1. **Real-time field count** - Show "X/73 fields complete" in form header
2. **Tab completion indicators** - Badge showing "8/12 complete" per tab
3. **Smart auto-save** - Periodic draft saves every 5 minutes
4. **Field history** - Track which fields were pending and when completed
5. **Validation presets** - Common pending field combinations (e.g., "Mark all dates pending")

---

**Last Updated:** 2025-12-10
**Related Files:** supplier-schema.ts, check-completeness.ts, supplier-form.tsx
