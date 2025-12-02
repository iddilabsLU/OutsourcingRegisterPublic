# PRD: Add Supplier Form - Bug Fixes & Requirements

**Document Version:** 1.0
**Created:** 2025-10-23
**Status:** Ready for Implementation
**Scope:** Bug fixes for "Add Supplier" feature only (Edit Supplier remains unimplemented)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Issues & Root Causes](#current-issues--root-causes)
3. [Field Requirements Specification](#field-requirements-specification)
4. [Expected Behavior](#expected-behavior)
5. [Technical Implementation Strategy](#technical-implementation-strategy)
6. [Testing Checklist](#testing-checklist)
7. [Risk Assessment](#risk-assessment)

---

## Executive Summary

The "Add Supplier" form has **7 critical bugs** caused by uninitialized form objects, pre-filled values, unsafe type casting, and inconsistent validation logic. This PRD provides a production-ready fix strategy that:

-  Fixes all reported bugs without introducing new ones
-  Implements proper mandatory/optional field logic (CSSF-compliant)
-  Ensures consistent Save Supplier and Save as Draft behavior
-  Maintains pending field tracking system
-  Refactors code for production quality and maintainability

**Key Changes:**
- All fields mandatory except LEI and Parent Company
- No pre-filled values (user provides all input)
- Proper initialization of conditional sections (Cloud, Critical)
- Validation suppressed on "Save Supplier" button (show dialog only)
- Validation remains active during typing/editing (onBlur mode)
- Group Entities field completely removed

---

## Current Issues & Root Causes

### **Bug 1: "getDate" Error with Critical Function Enabled + Save as Draft**

**Symptom:** When user enables "Is Critical or Important" toggle and clicks "Save as Draft", error appears:
```
Cannot read properties of undefined (reading 'getDate')
```

**Root Cause:**
- `criticalFields` object is **not initialized** in form `defaultValues` (supplier-form.tsx:55-90)
- When user toggles `isCritical = true`, Critical tab appears with empty form fields
- When `handleSaveAsDraft` runs, it calls `checkIncompleteFields` which tries to access:
  ```typescript
  cf.riskAssessment.lastAssessmentDate.trim()
  ```
- Since `criticalFields.riskAssessment` is undefined, this throws error

**Impact:** User cannot save draft if Critical Function is enabled

**Fix Required:** Initialize `criticalFields` structure in `defaultValues` with empty values

---

### **Bug 2: Empty Form + Save as Draft Always Activates Cloud Services**

**Symptom:** When user creates empty form and clicks "Save as Draft", the Cloud Services section appears activated in register view.

**Root Cause:**
- `cloudService` object is **not initialized** in form `defaultValues` (supplier-form.tsx:55-90)
- `category` field is also **not initialized** (defaults to `undefined`)
- When `saveSupplier` function runs, it checks `if (data.cloudService)` (supplier-form.tsx:201)
- If `cloudService` exists (even as empty object), it gets saved to supplier data
- Additionally, `category` might be incorrectly defaulting to `OutsourcingCategory.CLOUD` somewhere

**Impact:** Cloud section shows as active even when not selected

**Fix Required:**
1. Do NOT initialize `cloudService` in `defaultValues` (only create when category = Cloud)
2. Do NOT initialize `category` with any default value
3. Only create `cloudService` object when user selects `category = "Cloud"`

---

### **Bug 3: Incomplete Fields Dialog Only Appears if Basic Info AND Service Provider Filled**

**Symptom:** The "Incomplete Mandatory Fields" dialog only shows if both Basic Info tab and Service Provider tab have data. If only one tab is filled, dialog doesn't appear.

**Root Cause:**
- Likely an issue with how `form.getValues()` or `checkIncompleteFields` processes partially filled form data
- May be related to how React Hook Form handles nested objects when parent is undefined
- Possible short-circuit logic in completeness checker

**Impact:** User can submit incomplete forms without seeing warning dialog

**Fix Required:** Verify that `checkIncompleteFields` correctly processes all fields regardless of which tabs are filled

---

### **Bug 4: Filled Fields Flagged as Incomplete for Critical Suppliers**

**Symptom:** When saving a critical supplier, some fields that are actually filled show as incomplete in the dialog. Clicking "Mark as Pending & Submit" then resets these fields to empty.

**Root Cause:**
- Unsafe type casting in `saveSupplier`: `criticalFields: data.criticalFields as any || undefined` (supplier-form.tsx:211)
- The `as any` cast bypasses TypeScript safety and can cause data loss during transformation
- When `handleIncompleteConfirm` runs, it marks fields as pending, but the underlying data might already be corrupted
- Possible field path mismatch between form field names and pending field array

**Impact:** User loses filled data when marking fields as pending

**Fix Required:**
1. Remove unsafe `as any` casting
2. Properly transform `criticalFields` with explicit field mapping
3. Verify field path consistency between form, pending array, and completeness checker

---

### **Bug 5: Yes/No Toggles Pre-filled Automatically**

**Symptom:** Several yes/no toggles and date fields are pre-filled with default values instead of being empty.

**Root Cause:** Multiple pre-filled values in `defaultValues` (supplier-form.tsx:55-90):
```typescript
status: OutsourcingStatus.NOT_YET_ACTIVE,  // Line 57 - PRE-FILLED
criticalityAssessmentDate: new Date().toISOString().split("T")[0],  // Line 58 - PRE-FILLED
personalDataInvolved: false,  // Line 70 - PRE-FILLED
personalDataTransferred: false,  // Line 71 - PRE-FILLED
isCritical: false,  // Line 74 - PRE-FILLED
```

**Impact:** User sees values they didn't enter, violating "no pre-filled values" requirement

**Fix Required:** Remove all pre-filled values except Reference Number (auto-generated is acceptable)

---

### **Bug 6: Red Borders/Validation Messages Appear on Save Supplier Press**

**Symptom:** When user clicks "Save Supplier" with incomplete form, red borders and error messages appear on all empty fields instead of showing the dialog immediately.

**Root Cause:**
- Form uses `form.handleSubmit(onSubmit, onError)` which triggers Zod validation first (supplier-form.tsx:323)
- If validation fails, `onError` handler runs and marks all fields as errored
- React Hook Form shows red borders and `<FormMessage>` components appear
- User must scroll to see all errors instead of getting clean dialog

**Impact:** Poor user experience, confusing validation display

**Fix Required:**
1. Don't call `form.handleSubmit()` on "Save Supplier" button
2. Instead, directly call `form.getValues()` to get data without validation
3. Run completeness check and show dialog
4. Keep `onBlur` validation active for real-time feedback during typing

---

### **Bug 7: Code Structure Disorganized**

**Symptom:** Code has unsafe type casts, inconsistent initialization, fragile validation logic.

**Root Cause:**
- Two-phase validation (Zod + completeness) is fragile
- Conditional sections (Cloud/Critical) not properly initialized
- Field paths not consistently named
- Missing error handling

**Impact:** Future bugs likely, difficult to maintain

**Fix Required:** Refactor for production quality:
1. Consolidate validation logic
2. Create initialization helper functions
3. Add proper TypeScript types (remove `as any`)
4. Document conditional field logic

---

## Field Requirements Specification

### **Mandatory vs Optional Fields**

Almost **all fields are mandatory** except the following:

#### **Optional Fields (2 total):**
1. **Legal Entity Identifier (LEI)** - Point 54.e - User can leave empty
2. **Parent Company** - Point 54.e - User can leave empty

#### **Removed Fields (1 total):**
1. **Group Entities** - Point 55.a - Completely remove from form, types, and code

#### **Conditional Mandatory Fields:**

**Cloud Services Section (Point 54.h)** - Mandatory ONLY if `category = "Cloud"`:
- Service Model
- Deployment Model
- Data Nature
- Storage Locations
- Cloud Officer **(add "(if any)" text, but still mandatory)**
- Resource Operator **(add "(if any)" text, but still mandatory)**

**Critical Functions Section (Point 55)** - Mandatory ONLY if `isCritical = true`:
- In-Scope Entities (55.a)
- Part of Group (55.b)
- Owned by Group (55.b)
- Risk Level (55.c)
- Last Assessment Date (55.c)
- Summary Results (55.c)
- Approver Name (55.d)
- Approver Role (55.d)
- Governing Law (55.e)
- Last Audit Date (55.f) - **NOW MANDATORY** (was optional)
- Next Scheduled Audit (55.f) - **NOW MANDATORY** (was optional)
- Substitutability Outcome (55.h)
- Reintegration Assessment (55.h)
- Discontinuation Impact (55.h)
- Alternative Providers (55.i)
- Time-Critical Function (55.j)
- Estimated Annual Cost (55.k) - **NOW MANDATORY** (was optional)
- Cost Comments (55.k) - **NOW MANDATORY** (was optional)
- Prior Notification Date (55.l) - **NOW MANDATORY** (was optional)

**Sub-Outsourcing Fields (Point 55.g)** - Mandatory ONLY if `subOutsourcing = true` (toggle within Critical tab):
- Activity Description (55.g)
- Sub-Contractors array with **all 5 fields mandatory** for each sub-contractor:
  1. Name
  2. Activity Description
  3. Registration Country
  4. Service Performance Country
  5. Data Storage Location

#### **Point 54 Mandatory Fields (All Suppliers) - 23 fields:**

| Field Path | Label | CSSF Point | Notes |
|------------|-------|------------|-------|
| `referenceNumber` | Reference Number | 54.a | Auto-generated, user can modify |
| `status` | Status | 53 | User selects from dropdown (no default) |
| `dates.startDate` | Start Date | 54.b | Date picker, no default |
| `dates.nextRenewalDate` | Next Renewal Date | 54.b | **NOW MANDATORY** (was optional) |
| `dates.endDate` | End Date | 54.b | **NOW MANDATORY** (was optional) |
| `dates.serviceProviderNoticePeriod` | Service Provider Notice Period | 54.b | **NOW MANDATORY** (was optional) |
| `dates.entityNoticePeriod` | Entity Notice Period | 54.b | **NOW MANDATORY** (was optional) |
| `functionDescription.name` | Function Name | 54.c | Text input |
| `functionDescription.description` | Function Description | 54.c | Textarea |
| `functionDescription.dataDescription` | Data Description | 54.c | Textarea |
| `functionDescription.personalDataInvolved` | Personal Data Involved | 54.c | Yes/No toggle (no default) |
| `functionDescription.personalDataTransferred` | Personal Data Transferred | 54.c | Yes/No toggle (no default) |
| `category` | Category | 54.d | Dropdown (no default) |
| `serviceProvider.name` | Provider Name | 54.e | Text input |
| `serviceProvider.corporateRegistrationNumber` | Corporate Registration Number | 54.e | Text input |
| `serviceProvider.registeredAddress` | Registered Address | 54.e | Textarea |
| `serviceProvider.contactDetails` | Contact Details | 54.e | Textarea |
| `location.servicePerformanceCountries` | Service Performance Countries | 54.f | Array (min 1 country) |
| `location.dataLocationCountry` | Data Location Country | 54.f | Text input |
| `location.dataStorageLocation` | Data Storage Location | 54.f | **NOW MANDATORY** (was optional) |
| `criticality.isCritical` | Is Critical or Important | 54.g | Yes/No toggle (no default) |
| `criticality.reasons` | Criticality Reasons | 54.g | Textarea |
| `criticalityAssessmentDate` | Criticality Assessment Date | 54.i | Date picker (no default) |

---

## Expected Behavior

### **Form Validation Behavior**

#### **During Typing/Editing (onBlur mode):**
-  **Keep active:** Show red border and error message when user leaves a field with invalid data
-  **Keep active:** Show data type validation errors (e.g., "Invalid date format", "Invalid number")
-  **Keep active:** Show required field errors if user tries to leave field empty

#### **When Clicking "Save Supplier" Button:**
- L **Suppress:** Do NOT show red borders on all empty fields
- L **Suppress:** Do NOT show `<FormMessage>` error text on all empty fields
- L **Suppress:** Do NOT trigger Zod validation that marks untouched fields as errored
-  **Show:** Only the "Incomplete Mandatory Fields" dialog with list of missing fields

### **Save Supplier Button Logic**

**Step-by-step flow:**

1. **Get form data** without triggering validation:
   ```typescript
   const formData = form.getValues()
   ```

2. **Check for invalid data types** (prevent saving bad data):
   ```typescript
   // Validate data types only (dates, numbers, enums)
   // If invalid ’ show error toast "Please fix invalid fields" and return
   ```

3. **Check completeness** (mandatory fields):
   ```typescript
   const completenessResult = checkIncompleteFields(formData, pendingFields)
   ```

4. **If all mandatory fields complete:**
   - Save supplier to register
   - Show success toast: "Supplier saved successfully"
   - Close form and return to register view

5. **If any mandatory fields missing:**
   - Show "Incomplete Mandatory Fields" dialog with:
     - **List of incomplete fields** with CSSF references (e.g., "Provider Name (54.e)")
     - **Two buttons:**
       - **"Go Back to Form"** ’ Close dialog, user can fill missing fields
       - **"Mark as Pending & Submit"** ’ Auto-mark all empty fields as pending and save

### **Mark as Pending & Submit Button Logic**

**Step-by-step flow:**

1. **Get list of incomplete fields** from completeness check result

2. **Mark ALL empty mandatory fields as pending**:
   ```typescript
   const updatedPendingFields = [...pendingFields, ...completenessResult.incomplete]
   ```

3. **Save supplier** with updated pending fields array

4. **Show success toast:**
   ```
   "Supplier saved"
   "X field(s) marked as pending. You can complete them later."
   ```

5. **Close form** and return to register view

**Important:** This button only marks **currently empty fields** as pending. Fields already marked as pending retain their status. Fields with data are NOT marked as pending.

### **Save as Draft Button Logic**

**This button behaves EXACTLY like "Mark as Pending & Submit" but:**

1. **No dialog shown** (silent auto-mark)
2. **Override status** to `OutsourcingStatus.DRAFT` regardless of user input

**Step-by-step flow:**

1. **Get form data** without validation:
   ```typescript
   const formData = form.getValues()
   ```

2. **Check completeness** with empty pending array (to find ALL incomplete fields):
   ```typescript
   const completenessResult = checkIncompleteFields(formData, [])
   ```

3. **Mark ALL empty mandatory fields as pending**:
   ```typescript
   const fieldsToMarkPending = completenessResult.incomplete
   ```

4. **Override status** to Draft:
   ```typescript
   const draftData = {
     ...formData,
     status: OutsourcingStatus.DRAFT,
   }
   ```

5. **Save supplier** with pending fields

6. **Show success toast:**
   ```
   "Draft saved"
   "X field(s) marked as pending for later completion."
   ```

7. **Close form** and return to register view

### **Cancel Button Logic**

**Current behavior:** Uses `window.confirm()` (browser default dialog)

**Expected behavior:** Use styled `AlertDialog` component for consistency

**Step-by-step flow:**

1. **Show confirmation dialog:**
   - Title: "Discard Changes?"
   - Description: "Are you sure you want to cancel? All unsaved changes will be lost."
   - Buttons: "Cancel" (close dialog) | "Discard" (destructive variant)

2. **If user confirms:**
   - Clear any draft data from sessionStorage
   - Call `onCancel()` callback
   - Close form and return to register view

### **Pending Fields Behavior**

#### **Manual Pending Toggle (Amber Pin Icon):**
- User can click amber pin icon next to any field (empty or filled)
- Clicking adds/removes field from `pendingFields` array
- Pending fields **remain pending until manually unmarked** (even if user fills them with data)
- Purpose: Mark fields that need future review or update

#### **Auto-Pending (Save as Draft or Mark as Pending & Submit):**
- System automatically marks all **currently empty** mandatory fields as pending
- Fields already marked as pending keep their status
- Fields with data are NOT auto-marked as pending

#### **Pending Field Display:**
- **In form:** Amber pin icon shows next to field label
- **In register:** Badge shows count (e.g., "2 pending fields")
- **In supplier details:** Amber badge next to field value

#### **Pending Field Validation:**
- Pending fields **skip "required field" validation** in Zod schema
- Pending fields **skip completeness check** (not listed as incomplete)
- Pending fields **still validate data types** (e.g., valid date format)

---

## Technical Implementation Strategy

### **Phase 1: Fix Form Initialization (Bugs 2, 5)**

**File:** components/shared/forms/supplier-form.tsx

**Changes in `defaultValues` (lines 55-90):**

Remove all pre-filled values and explicitly initialize conditional objects as undefined:

```typescript
defaultValues: initialData || {
  referenceNumber: generateNextReferenceNumber(existingSuppliers),
  status: undefined,  //  NO DEFAULT
  criticalityAssessmentDate: "",  //  EMPTY STRING
  category: undefined,  //  NO DEFAULT
  dates: {
    startDate: "",
    nextRenewalDate: "",
    endDate: "",
    serviceProviderNoticePeriod: "",
    entityNoticePeriod: "",
  },
  functionDescription: {
    name: "",
    description: "",
    dataDescription: "",
    personalDataInvolved: undefined,  //  NO DEFAULT
    personalDataTransferred: undefined,  //  NO DEFAULT
  },
  criticality: {
    isCritical: undefined,  //  NO DEFAULT
    reasons: "",
  },
  serviceProvider: {
    name: "",
    corporateRegistrationNumber: "",
    legalEntityIdentifier: "",
    registeredAddress: "",
    contactDetails: "",
    parentCompany: "",
  },
  location: {
    servicePerformanceCountries: [],  //  EMPTY ARRAY
    dataLocationCountry: "",
    dataStorageLocation: "",
  },
  cloudService: undefined,  //  EXPLICIT UNDEFINED
  criticalFields: undefined,  //  EXPLICIT UNDEFINED
}
```

**Add watchers to create/destroy conditional objects:**

Watch category field and manage cloudService:
```typescript
useEffect(() => {
  const subscription = form.watch((value, { name }) => {
    if (name === 'category') {
      if (value.category === OutsourcingCategory.CLOUD) {
        if (!form.getValues('cloudService')) {
          form.setValue('cloudService', createEmptyCloudService())
        }
      } else {
        form.setValue('cloudService', undefined)
      }
    }
  })
  return () => subscription.unsubscribe()
}, [form])
```

Watch isCritical field and manage criticalFields:
```typescript
useEffect(() => {
  const subscription = form.watch((value, { name }) => {
    if (name === 'criticality.isCritical') {
      if (value.criticality?.isCritical === true) {
        if (!form.getValues('criticalFields')) {
          form.setValue('criticalFields', createEmptyCriticalFields())
        }
      } else {
        form.setValue('criticalFields', undefined)
      }
    }
  })
  return () => subscription.unsubscribe()
}, [form])
```

---

### **Phase 2: Create Helper Utilities**

**Create new file:** lib/utils/form-helpers.ts

This file will contain all helper functions for form data manipulation:

1. `normalizeFormData()` - Ensures conditional objects exist before completeness check
2. `validateDataTypes()` - Validates only data types without required field checks
3. `createEmptyCriticalFields()` - Factory function for critical fields structure
4. `createEmptyCloudService()` - Factory function for cloud service structure

(Full implementation provided in Phase 9 section below)

---

### **Phase 3: Fix Save Supplier Validation (Bug 6)**

**File:** components/shared/forms/supplier-form.tsx

**Change form submission:**

```typescript
// Change from:
<form onSubmit={form.handleSubmit(onSubmit, onError)}>

// To:
<form onSubmit={(e) => e.preventDefault()}>
```

**Change Save Supplier button:**

```typescript
// Change from:
<Button type="submit">Save Supplier</Button>

// To:
<Button type="button" onClick={handleSaveSupplier}>Save Supplier</Button>
```

**Create new handleSaveSupplier function:**

```typescript
const handleSaveSupplier = () => {
  // Step 1: Get form data without validation
  const formData = form.getValues()

  // Step 2: Validate data types only (prevent invalid dates, numbers)
  const typeValidation = validateDataTypes(formData)

  if (!typeValidation.valid) {
    toast.error("Please fix invalid fields", {
      description: "Some fields have invalid data (e.g., invalid date format).",
    })
    const firstInvalidField = typeValidation.errors[0].path
    const element = document.getElementsByName(firstInvalidField)[0]
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" })
    }
    return
  }

  // Step 3: Normalize data (ensure conditional objects exist)
  const normalizedData = normalizeFormData(formData)

  // Step 4: Check completeness
  const completenessResult = checkIncompleteFields(
    normalizedData as Partial<SupplierOutsourcing>,
    pendingFields
  )

  if (!completenessResult.isComplete) {
    setIncompleteFieldLabels(completenessResult.labels)
    setPendingData(normalizedData)
    setShowIncompleteDialog(true)
    return
  }

  // Step 5: Save directly
  saveSupplier(normalizedData, [])
}
```

**Keep onBlur validation** (no changes needed):
```typescript
const form = useForm<SupplierFormData>({
  resolver: createPendingFieldResolver(supplierFormSchema, () => pendingFields),
  mode: "onBlur",  //  KEEP THIS
  defaultValues: /* ... */,
})
```

---

### **Phase 4: Fix Save as Draft (Bug 1, 2)**

**File:** components/shared/forms/supplier-form.tsx

**Update handleSaveAsDraft function:**

```typescript
const handleSaveAsDraft = () => {
  setIsDraftSaving(true)
  try {
    // Step 1: Get form data without validation
    const formData = form.getValues()

    // Step 2: Normalize data (ensure conditional objects exist)
    const normalizedData = normalizeFormData(formData)

    // Step 3: Check completeness with empty pending array
    const completenessResult = checkIncompleteFields(
      normalizedData as Partial<SupplierOutsourcing>,
      []
    )

    // Step 4: Mark ALL empty mandatory fields as pending
    const fieldsToMarkPending = completenessResult.incomplete

    // Step 5: Update pending fields state
    setPendingFields(fieldsToMarkPending)

    // Step 6: Override status to Draft
    const draftData = {
      ...normalizedData,
      status: OutsourcingStatus.DRAFT,
    }

    // Step 7: Save supplier
    saveSupplier(draftData, [], true, fieldsToMarkPending)
  } catch (error) {
    console.error("Failed to save draft:", error)
    toast.error("Failed to save draft", {
      description: "Please try again or contact support.",
    })
  } finally {
    setIsDraftSaving(false)
  }
}
```

---

### **Phase 5: Fix saveSupplier Type Casting (Bug 4)**

**File:** components/shared/forms/supplier-form.tsx

**Replace unsafe `as any` cast with explicit field mapping:**

```typescript
// Change from:
criticalFields: data.criticalFields as any || undefined,

// To:
criticalFields: data.criticalFields
  ? {
      entitiesUsing: {
        inScopeEntities: data.criticalFields.entitiesUsing?.inScopeEntities || [],
      },
      groupRelationship: {
        isPartOfGroup: data.criticalFields.groupRelationship?.isPartOfGroup ?? undefined,
        isOwnedByGroup: data.criticalFields.groupRelationship?.isOwnedByGroup ?? undefined,
      },
      riskAssessment: {
        risk: data.criticalFields.riskAssessment?.risk,
        lastAssessmentDate: data.criticalFields.riskAssessment?.lastAssessmentDate || "",
        mainResults: data.criticalFields.riskAssessment?.mainResults || "",
      },
      approval: {
        approverName: data.criticalFields.approval?.approverName || "",
        approverRole: data.criticalFields.approval?.approverRole || "",
      },
      governingLaw: data.criticalFields.governingLaw || "",
      audit: {
        lastAuditDate: data.criticalFields.audit?.lastAuditDate || "",
        nextScheduledAudit: data.criticalFields.audit?.nextScheduledAudit || "",
      },
      subOutsourcing: data.criticalFields.subOutsourcing
        ? {
            activityDescription: data.criticalFields.subOutsourcing.activityDescription || "",
            subContractors: data.criticalFields.subOutsourcing.subContractors || [],
          }
        : undefined,
      substitutability: {
        outcome: data.criticalFields.substitutability?.outcome,
        reintegrationAssessment: data.criticalFields.substitutability?.reintegrationAssessment || "",
        discontinuationImpact: data.criticalFields.substitutability?.discontinuationImpact || "",
      },
      alternativeProviders: data.criticalFields.alternativeProviders || [],
      isTimeCritical: data.criticalFields.isTimeCritical ?? undefined,
      estimatedAnnualCost: data.criticalFields.estimatedAnnualCost ?? undefined,
      costComments: data.criticalFields.costComments || "",
      regulatoryNotification: {
        notificationDate: data.criticalFields.regulatoryNotification?.notificationDate || "",
      },
    }
  : undefined,
```

---

### **Phase 6: Update Completeness Checker (Bug 3)**

**File:** lib/utils/check-completeness.ts

**Key changes:**

1. **Add defensive check at start:**
```typescript
if (!data) {
  return { incomplete: [], labels: [], isComplete: true }
}
```

2. **Add newly mandatory Point 54 fields:**
```typescript
// Dates - ALL now mandatory
if (!data.dates?.nextRenewalDate || data.dates.nextRenewalDate.trim() === "") {
  addIncomplete("dates.nextRenewalDate", "Next Renewal Date (54.b)")
}
if (!data.dates?.endDate || data.dates.endDate.trim() === "") {
  addIncomplete("dates.endDate", "End Date (54.b)")
}
if (!data.dates?.serviceProviderNoticePeriod || data.dates.serviceProviderNoticePeriod.trim() === "") {
  addIncomplete("dates.serviceProviderNoticePeriod", "Service Provider Notice Period (54.b)")
}
if (!data.dates?.entityNoticePeriod || data.dates.entityNoticePeriod.trim() === "") {
  addIncomplete("dates.entityNoticePeriod", "Entity Notice Period (54.b)")
}

// Data Storage Location - NOW mandatory
if (!data.location?.dataStorageLocation || data.location.dataStorageLocation.trim() === "") {
  addIncomplete("location.dataStorageLocation", "Data Storage Location (54.f)")
}
```

3. **Remove LEI and Parent Company checks:**
```typescript
// L REMOVE these checks:
// if (!data.serviceProvider?.legalEntityIdentifier) { ... }
// if (!data.serviceProvider?.parentCompany) { ... }
```

4. **Update Cloud Services section:**
```typescript
if (data.category === OutsourcingCategory.CLOUD) {
  if (!data.cloudService) {
    addIncomplete("cloudService", "Cloud Service Information (54.h)")
  } else {
    // Check all cloud fields
    if (!data.cloudService.serviceModel) {
      addIncomplete("cloudService.serviceModel", "Cloud Service Model (54.h)")
    }
    if (!data.cloudService.deploymentModel) {
      addIncomplete("cloudService.deploymentModel", "Deployment Model (54.h)")
    }
    if (!data.cloudService.dataNature || data.cloudService.dataNature.trim() === "") {
      addIncomplete("cloudService.dataNature", "Data Nature (54.h)")
    }
    if (!data.cloudService.storageLocations || data.cloudService.storageLocations.length === 0) {
      addIncomplete("cloudService.storageLocations", "Storage Locations (54.h)")
    }

    // Cloud Officer and Resource Operator mandatory if category=Cloud
    if (!data.cloudService.cloudOfficer || data.cloudService.cloudOfficer.trim() === "") {
      addIncomplete("cloudService.cloudOfficer", "Cloud Officer (54.h) - if any")
    }
    if (!data.cloudService.resourceOperator || data.cloudService.resourceOperator.trim() === "") {
      addIncomplete("cloudService.resourceOperator", "Resource Operator (54.h) - if any")
    }
  }
}
```

5. **Add newly mandatory Point 55 fields:**
```typescript
if (data.criticality?.isCritical === true) {
  if (!data.criticalFields) {
    addIncomplete("criticalFields", "Critical Function Information (Point 55)")
  } else {
    const cf = data.criticalFields

    // ... existing checks ...

    // Audit dates - NOW mandatory
    if (!cf.audit?.lastAuditDate || cf.audit.lastAuditDate.trim() === "") {
      addIncomplete("criticalFields.audit.lastAuditDate", "Last Audit Date (55.f)")
    }
    if (!cf.audit?.nextScheduledAudit || cf.audit.nextScheduledAudit.trim() === "") {
      addIncomplete("criticalFields.audit.nextScheduledAudit", "Next Scheduled Audit (55.f)")
    }

    // Cost fields - NOW mandatory
    if (cf.estimatedAnnualCost === undefined || cf.estimatedAnnualCost === null) {
      addIncomplete("criticalFields.estimatedAnnualCost", "Estimated Annual Cost (55.k)")
    }
    if (!cf.costComments || cf.costComments.trim() === "") {
      addIncomplete("criticalFields.costComments", "Cost Comments (55.k)")
    }

    // Notification date - NOW mandatory
    if (!cf.regulatoryNotification?.notificationDate || cf.regulatoryNotification.notificationDate.trim() === "") {
      addIncomplete("criticalFields.regulatoryNotification.notificationDate", "Prior Notification Date (55.l)")
    }
  }
}
```

6. **Check ALL 5 sub-contractor fields:**
```typescript
if (cf.subOutsourcing) {
  if (!cf.subOutsourcing.activityDescription || cf.subOutsourcing.activityDescription.trim() === "") {
    addIncomplete("criticalFields.subOutsourcing.activityDescription", "Activity Sub-Outsourced (55.g)")
  }

  if (!cf.subOutsourcing.subContractors || cf.subOutsourcing.subContractors.length === 0) {
    addIncomplete("criticalFields.subOutsourcing.subContractors", "Sub-Contractors (55.g)")
  } else {
    cf.subOutsourcing.subContractors.forEach((subContractor, index) => {
      if (!subContractor.name || subContractor.name.trim() === "") {
        addIncomplete(`criticalFields.subOutsourcing.subContractors.${index}.name`, `Sub-Contractor ${index + 1}: Name (55.g)`)
      }
      if (!subContractor.activityDescription || subContractor.activityDescription.trim() === "") {
        addIncomplete(`criticalFields.subOutsourcing.subContractors.${index}.activityDescription`, `Sub-Contractor ${index + 1}: Activity Description (55.g)`)
      }
      if (!subContractor.registrationCountry || subContractor.registrationCountry.trim() === "") {
        addIncomplete(`criticalFields.subOutsourcing.subContractors.${index}.registrationCountry`, `Sub-Contractor ${index + 1}: Registration Country (55.g)`)
      }
      if (!subContractor.servicePerformanceCountry || subContractor.servicePerformanceCountry.trim() === "") {
        addIncomplete(`criticalFields.subOutsourcing.subContractors.${index}.servicePerformanceCountry`, `Sub-Contractor ${index + 1}: Service Performance Country (55.g)`)
      }
      if (!subContractor.dataStorageLocation || subContractor.dataStorageLocation.trim() === "") {
        addIncomplete(`criticalFields.subOutsourcing.subContractors.${index}.dataStorageLocation`, `Sub-Contractor ${index + 1}: Data Storage Location (55.g)`)
      }
    })
  }
}
```

---

### **Phase 7: Remove Group Entities Field**

**Files to modify:**

1. **lib/types/supplier.ts** - Remove from type definition
2. **components/shared/forms/supplier-form-critical.tsx** - Remove FormMultiText component
3. **components/shared/supplier-critical-functions.tsx** - Remove FieldDisplay component
4. **lib/validations/supplier-schema.ts** - Remove from Zod schema

---

### **Phase 8: Update Form Field Labels**

**File:** components/shared/forms/supplier-form-cloud.tsx

Add "(if any)" text to Cloud Officer and Resource Operator labels:

```typescript
<FormTextInput
  name="cloudService.cloudOfficer"
  label="Cloud Officer (if any)"
  circularRef="54.h"
  // ...
/>

<FormTextInput
  name="cloudService.resourceOperator"
  label="Resource Operator (if any)"
  circularRef="54.h"
  // ...
/>
```

**Remove `required` prop from all form fields** (asterisks are no longer needed):
- Search all form field components for `required={true}`
- Remove the prop entirely

---

### **Phase 9: Replace window.confirm with AlertDialog**

**File:** components/shared/forms/supplier-form.tsx

**Add state:**
```typescript
const [showCancelDialog, setShowCancelDialog] = useState(false)
```

**Replace handleCancel:**
```typescript
const handleCancelClick = () => {
  setShowCancelDialog(true)
}

const handleCancelConfirm = () => {
  sessionStorage.removeItem(DRAFT_STORAGE_KEY)
  setShowCancelDialog(false)
  onCancel()
}
```

**Update Cancel button:**
```typescript
<Button variant="outline" onClick={handleCancelClick}>
  Cancel
</Button>
```

**Add AlertDialog JSX:**
```typescript
<AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Discard Changes?</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to cancel? All unsaved changes will be lost. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Continue Editing</AlertDialogCancel>
      <AlertDialogAction onClick={handleCancelConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
        Discard Changes
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

---

## Testing Checklist

### **Suite 1: Form Initialization** (8 tests)
- [ ] No fields pre-filled except Reference Number
- [ ] Status dropdown shows no selected value
- [ ] Criticality Assessment Date is empty
- [ ] Personal Data toggles show no selected value
- [ ] Is Critical toggle shows no selected value
- [ ] Service Performance Countries is empty array
- [ ] Cloud Services tab hidden (category not selected)
- [ ] Critical Functions tab hidden (isCritical not selected)

### **Suite 2: Conditional Sections** (6 tests)
- [ ] Select Category=Cloud ’ Cloud tab appears
- [ ] Select Category=ICT ’ Cloud tab disappears
- [ ] Toggle isCritical=Yes ’ Critical tab appears
- [ ] Toggle isCritical=No ’ Critical tab disappears
- [ ] Change category after filling Cloud ’ Data cleared
- [ ] Change isCritical after filling Critical ’ Data cleared

### **Suite 3: Real-Time Validation** (5 tests)
- [ ] Empty required field on blur ’ Red border appears
- [ ] Invalid date format ’ Error message appears
- [ ] Fill field with valid data ’ Red border disappears
- [ ] Mark field as pending ’ Validation skipped
- [ ] Unmark pending while empty ’ Red border reappears

### **Suite 4: Save Supplier** (8 tests)
- [ ] All fields complete ’ Success toast, supplier added
- [ ] Only 5 fields filled ’ Dialog shows, no red borders
- [ ] Basic Info + Provider filled ’ Dialog appears (Bug 3 fix)
- [ ] Only Basic Info filled ’ Dialog appears (Bug 3 fix)
- [ ] 3 empty, 2 pending ’ Dialog shows 1 incomplete
- [ ] Invalid date entered ’ Error toast shown
- [ ] Click "Go Back" in dialog ’ Dialog closes
- [ ] Click "Mark as Pending & Submit" ’ Supplier saved

### **Suite 5: Save as Draft** (7 tests)
- [ ] Empty form ’ No error (Bug 1 fix)
- [ ] Fill 3/10 fields ’ 7 marked as pending
- [ ] Critical enabled ’ No "getDate" error (Bug 1 fix)
- [ ] All fields filled ’ Status overridden to "Draft"
- [ ] Check register ’ Status="Draft", pending badge shown
- [ ] Empty form ’ Cloud NOT activated (Bug 2 fix)
- [ ] Category=Cloud, empty fields ’ Cloud fields pending

### **Suite 6: Pending Fields** (6 tests)
- [ ] Click amber pin on empty ’ Marked as pending
- [ ] Fill pending field ’ Amber pin stays
- [ ] Click amber pin on filled ’ Field marked pending
- [ ] Mark 3 as pending ’ Badge shows "3 pending fields"
- [ ] Expand supplier ’ Pending fields show amber badge
- [ ] Mark as pending & submit ’ Count matches

### **Suite 7: Critical Supplier** (4 tests)
- [ ] Critical enabled, all filled ’ No incomplete (Bug 4 fix)
- [ ] Critical, 5 filled, 10 empty ’ Filled NOT reset (Bug 4 fix)
- [ ] Critical, save as draft ’ No data loss
- [ ] All Critical fields filled ’ Success toast

### **Suite 8: Cloud Supplier** (4 tests)
- [ ] Category=Cloud, all filled ’ Success
- [ ] Cloud Officer empty ’ Dialog shows incomplete
- [ ] Cloud Officer="Not applicable" ’ Counts as filled
- [ ] Category=ICT ’ Cloud fields not checked

### **Suite 9: Sub-Contractors** (3 tests)
- [ ] Add sub-contractor, 2/5 filled ’ Dialog shows 3 missing
- [ ] All 5 fields filled ’ No error
- [ ] 2 sub-contractors, 2nd incomplete ’ Shows missing fields

### **Suite 10: Optional Fields** (4 tests)
- [ ] LEI empty ’ No error (optional)
- [ ] Parent Company empty ’ No error (optional)
- [ ] Data Storage Location empty ’ Dialog shows (now mandatory)
- [ ] Next Renewal Date empty ’ Dialog shows (now mandatory)

### **Suite 11: Removed Fields** (3 tests)
- [ ] Critical tab ’ Group Entities NOT present
- [ ] Save critical supplier ’ No error about Group Entities
- [ ] View in register ’ Group Entities NOT shown

### **Suite 12: Cancel Button** (3 tests)
- [ ] Fill fields, click Cancel ’ Styled dialog appears
- [ ] Click "Continue Editing" ’ Dialog closes
- [ ] Click "Discard Changes" ’ Form closes

### **Suite 13: Edge Cases** (6 tests)
- [ ] All filled, 2 pending ’ Success (pending doesn't block)
- [ ] 50/52 filled, 2 pending ’ Success
- [ ] Toggle isCritical multiple times ’ No error
- [ ] Change category multiple times ’ No error
- [ ] Fill Cloud, change to ICT ’ Cloud NOT saved
- [ ] Fill Critical, change to No ’ Critical NOT saved

**Total: 71 tests across 13 suites**

---

## Risk Assessment

### **High Risk Changes**
1. **Form validation refactor** (Phase 3) - Breaking existing validation
   - **Mitigation:** Keep onBlur active, test thoroughly
2. **Conditional object initialization** (Phase 1) - Breaking form state
   - **Mitigation:** Use proper useEffect cleanup
3. **Type casting removal** (Phase 5) - Type errors
   - **Mitigation:** Explicit mapping, TypeScript checks

### **Medium Risk Changes**
4. **Completeness checker updates** (Phase 6) - Missing fields or false positives
   - **Mitigation:** Add defensive checks, thorough testing
5. **Removing Group Entities** (Phase 7) - Breaking data
   - **Mitigation:** Verify no existing data uses this field

### **Low Risk Changes**
6. **Pre-filled values removal** (Phase 1) - Only defaults
7. **Label updates** (Phase 8) - Only UI text
8. **Cancel dialog** (Phase 9) - Component swap

---

## Implementation Order

**Recommended sequence to minimize risk:**

1.  Phase 1 (Form Initialization) - Foundation
2.  Phase 2 (Helper Utilities) - Support functions
3.  Phase 6 (Completeness Checker) - Update validation
4.  Phase 7 (Remove Group Entities) - Clean up types
5.  Phase 5 (saveSupplier Type Casting) - Fix transformation
6.  Phase 4 (Save as Draft) - Now safe
7.  Phase 3 (Save Supplier Validation) - Form behavior
8.  Phase 8 (Label Updates) - UI polish
9.  Phase 9 (Cancel Dialog) - Final touch

---

## Success Criteria

**Implementation complete when:**

1.  All 7 bugs fixed and verified
2.  All 71 tests pass
3.  No TypeScript errors
4.  No ESLint warnings
5.  Production-ready code (no `as any`)
6.  Documentation updated
7.  User confirms expected behavior

---

**Document Status:**  Ready for Implementation
**Next Step:** User review and approval, then proceed with Phase 1
