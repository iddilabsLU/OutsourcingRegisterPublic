# Data Location Changes - Comprehensive Implementation Plan

**Created:** 2025-11-04
**Status:** Approved - Ready for Implementation
**Estimated Time:** 4 hours (3h development + 1h testing)

---

## Executive Summary

This document outlines the complete implementation plan for converting the data location country field from a single string to an array, adding country dropdown selectors, renaming the data storage location field, and updating all related components across the codebase.

### Key Changes

1. **Convert `dataLocationCountry` from `string` to `string[]`** (array)
2. **Add country dropdown** for both `dataLocationCountry` and `servicePerformanceCountries`
3. **Rename field:** `dataStorageLocation` → `otherDataLocationInfo` (label and path)
4. **Update dashboard** to show top 3 data location countries with "View More" button
5. **Update form layout:** Place both country fields on same row (2 equal columns)
6. **Ensure consistency** across form and detail view components

---

## Affected Files Overview

| Category | Files | Risk Level |
|----------|-------|------------|
| **New Components** | 1 | Low |
| **Type System** | 2 | Medium |
| **Form Components** | 1 | Medium |
| **Detail View** | 1 | Low |
| **Dashboard** | 2 | **HIGH** |
| **Validation** | 1 | Medium |
| **Filters** | 1 | Low |
| **Export** | 1 | Low |
| **Sample Data** | 1 | Low |
| **Documentation** | 1 | Low |
| **TOTAL** | **12** | - |

---

## Implementation Phases

### Phase 1: Create Country Dropdown Component

**Objective:** Build reusable country multi-select component with dropdown

**Files to Create:**
- `components/shared/forms/fields/form-country-multi-select.tsx`

**Sub-Tasks:**

1.1. **Create component file**
   - Copy structure from `FormMultiText`
   - Add country list constants (EU + EEA + Common)
   - Implement dropdown UI (Combobox from shadcn/ui)

1.2. **Add country constants**
```typescript
const EU_COUNTRIES = [
  "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus",
  "Czech Republic", "Denmark", "Estonia", "Finland", "France",
  "Germany", "Greece", "Hungary", "Ireland", "Italy",
  "Latvia", "Lithuania", "Luxembourg", "Malta", "Netherlands",
  "Poland", "Portugal", "Romania", "Slovakia", "Slovenia",
  "Spain", "Sweden"
]

const EEA_COUNTRIES = [
  "Iceland", "Liechtenstein", "Norway", "Switzerland"
]

const COMMON_NON_EU = [
  "United Kingdom", "United States", "Canada", "Australia",
  "Japan", "Singapore", "Hong Kong", "India", "China"
]
```

1.3. **Implement features**
   - Multi-select with checkboxes
   - Search/filter countries
   - Display selected as badges
   - Remove badge on click
   - Pending field toggle support
   - CSSF circular reference display

**Checkpoint 1A:** Component renders without errors

**Testing Steps:**
```bash
# In browser console
$ npm run dev
```
- Navigate to `/suppliers` → Click "New Entry"
- Temporarily add component to form to test in isolation
- Verify dropdown opens
- Verify search works
- Verify can select multiple countries
- Verify badges display correctly

**Expected Outcome:** Component works independently before integration

---

### Phase 2: Type System Updates

**Objective:** Update core type definitions and validation schemas

**Files to Modify:**
1. `lib/types/supplier.ts` (lines 102-104)
2. `lib/validations/supplier-schema.ts` (lines 68-70)

**Sub-Tasks:**

2.1. **Update supplier.ts**

**Before:**
```typescript
location: {
  servicePerformanceCountries: string[]
  dataLocationCountry: string  // ← Change this
  dataStorageLocation: string  // ← Rename this
}
```

**After:**
```typescript
location: {
  servicePerformanceCountries: string[]
  dataLocationCountry: string[]  // ← Now array
  otherDataLocationInfo: string  // ← Renamed
}
```

2.2. **Update supplier-schema.ts**

**Before:**
```typescript
dataLocationCountry: z.string().optional(),
dataStorageLocation: z.string().optional(),
```

**After:**
```typescript
dataLocationCountry: z.array(z.string()).optional(),
otherDataLocationInfo: z.string().optional(),
```

**Checkpoint 2A:** Build breaks with type errors (expected)

**Testing Steps:**
```bash
$ npm run build
```

**Expected Outcome:** TypeScript errors in:
- `dashboard-analytics.ts`
- `check-completeness.ts`
- `filter-suppliers.ts`
- `export-field-mapping.ts`
- `supplier-provider-details.tsx`

**Note:** These errors are EXPECTED and will be fixed in subsequent phases. Do NOT proceed if errors appear in unexpected files.

---

### Phase 3: Form Component Updates

**Objective:** Replace text inputs with country dropdowns and update layout

**File to Modify:**
- `components/shared/forms/supplier-form-provider.tsx` (lines 100-131)

**Sub-Tasks:**

3.1. **Import new component**
```typescript
import { FormCountryMultiSelect } from "./fields/form-country-multi-select"
```

3.2. **Replace servicePerformanceCountries field** (lines 101-112)

**Before:**
```tsx
<FormMultiText
  control={control}
  name="location.servicePerformanceCountries"
  label="Service Performance Countries"
  circularRef="54.f"
  placeholder="e.g., Luxembourg"
  tooltip="Add all countries where the service is performed"
  addButtonLabel="Add Country"
  className="col-span-2"
  toggleFieldPending={toggleFieldPending}
  isFieldPending={isFieldPending}
/>
```

**After:**
```tsx
<FormCountryMultiSelect
  control={control}
  name="location.servicePerformanceCountries"
  label="Service Performance Countries"
  circularRef="54.f"
  tooltip="Select all countries where the service is performed"
  className="col-span-1"
  toggleFieldPending={toggleFieldPending}
  isFieldPending={isFieldPending}
/>
```

3.3. **Replace dataLocationCountry field** (lines 113-120)

**Before:**
```tsx
<FormTextInput
  control={control}
  name="location.dataLocationCountry"
  label="Data Location Country"
  circularRef="54.f"
  placeholder="e.g., Luxembourg"
  toggleFieldPending={toggleFieldPending}
  isFieldPending={isFieldPending}
/>
```

**After:**
```tsx
<FormCountryMultiSelect
  control={control}
  name="location.dataLocationCountry"
  label="Data Location Countries"
  circularRef="54.f"
  tooltip="Select all countries where data is located"
  className="col-span-1"
  toggleFieldPending={toggleFieldPending}
  isFieldPending={isFieldPending}
/>
```

3.4. **Update dataStorageLocation field** (lines 121-127)

**Before:**
```tsx
<FormTextInput
  control={control}
  name="location.dataStorageLocation"
  label="Data Storage Location"
  circularRef="54.f"
  placeholder="e.g., Luxembourg (primary), Belgium (backup)"
  toggleFieldPending={toggleFieldPending}
  isFieldPending={isFieldPending}
/>
```

**After:**
```tsx
<FormTextInput
  control={control}
  name="location.otherDataLocationInfo"
  label="Other Data Location Information (if any) (54.f)"
  circularRef="54.f"
  placeholder="e.g., Luxembourg (primary), Belgium (backup)"
  className="col-span-2"
  toggleFieldPending={toggleFieldPending}
  isFieldPending={isFieldPending}
/>
```

3.5. **Verify layout** (lines 100-131)
- Both country fields on same row (`col-span-1` each)
- Other field spans 2 columns (`col-span-2`)

**Checkpoint 3A:** Form renders without errors

**Testing Steps:**
```bash
$ npm run dev
```
- Navigate to `/suppliers` → Click "New Entry"
- Click "Provider" tab
- Verify both country fields appear side-by-side
- Open dropdown on Service Performance Countries
- Verify countries list appears
- Select Luxembourg, Germany
- Verify badges appear
- Open dropdown on Data Location Countries
- Select Luxembourg
- Verify badge appears
- Fill in Other Data Location Information
- Do NOT save yet (validation will fail)

**Expected Outcome:** Form displays correctly with new layout and dropdowns work

---

### Phase 4: Detail View Updates

**Objective:** Update read-only supplier display to match form

**File to Modify:**
- `components/shared/supplier-provider-details.tsx` (lines 85-91)

**Sub-Tasks:**

4.1. **Update field path** (line 88)

**Before:**
```tsx
<FieldDisplay
  label="Data Location Country"
  value={supplier.location.dataLocationCountry}
  circularRef="54.f"
/>
```

**After:**
```tsx
<FieldDisplay
  label="Data Location Countries"
  value={supplier.location.dataLocationCountry}
  circularRef="54.f"
/>
```

**Note:** FieldDisplay component already handles arrays, so no logic change needed!

4.2. **Update renamed field** (line 91)

**Before:**
```tsx
<FieldDisplay
  label="Data Storage Location"
  value={supplier.location.dataStorageLocation}
  circularRef="54.f"
/>
```

**After:**
```tsx
<FieldDisplay
  label="Other Data Location Information (if any)"
  value={supplier.location.otherDataLocationInfo}
  circularRef="54.f"
/>
```

4.3. **Verify layout consistency**
- Check if fields need to match form layout (2-column)
- Currently detail view uses automatic layout
- May need grid adjustment for visual consistency

**Checkpoint 4A:** Detail view displays correctly

**Testing Steps:**
- View existing supplier detail (before creating new)
- Verify labels updated
- Verify arrays display as comma-separated (e.g., "Luxembourg, Germany")
- Do NOT test with new data yet (sample data not migrated)

**Expected Outcome:** Detail view shows updated labels, no crashes

---

### Phase 5: Dashboard Analytics and UI (CRITICAL)

**Objective:** Update geographic distribution calculation and display

**Files to Modify:**
1. `lib/utils/dashboard-analytics.ts` (lines 430-460)
2. `components/shared/dashboard/tables/geographic-distribution-table.tsx` (lines 40-65)

**Risk Level:** **HIGH** - App will crash if not done correctly

**Sub-Tasks:**

5.1. **Update getGeographicDistribution function** (dashboard-analytics.ts)

**Before:**
```typescript
// Count data location countries
const dataLocationCounts = suppliers.reduce((acc, s) => {
  const country = s.location.dataLocationCountry
  acc[country] = (acc[country] || 0) + 1
  return acc
}, {} as Record<string, number>)
```

**After:**
```typescript
// Count data location countries (now array)
const dataLocationCounts: Record<string, number> = {}
suppliers.forEach((s) => {
  s.location.dataLocationCountry.forEach((country) => {
    dataLocationCounts[country] = (dataLocationCounts[country] || 0) + 1
  })
})
```

**Explanation:** Since `dataLocationCountry` is now an array, we need to flatten it. Each supplier can contribute to multiple countries.

5.2. **Update Geographic Distribution UI** (geographic-distribution-table.tsx)

**Before (showing only top 1):**
```tsx
{dataLocation.length === 0 ? (
  <div className="text-sm text-muted-foreground text-center py-4">
    No data available
  </div>
) : (
  <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
    <div className="flex items-center gap-3">
      <Globe2 className="h-5 w-5 text-muted-foreground" />
      <div>
        <div className="font-medium">{dataLocation[0].country}</div>
        <div className="text-sm text-muted-foreground">
          {dataLocation[0].count} supplier{dataLocation[0].count !== 1 ? "s" : ""} ({dataLocation[0].percentage}%)
        </div>
      </div>
    </div>
    <Badge className="bg-green-100 text-green-800 border-green-200">
      <CheckCircle2 className="h-3 w-3 mr-1" />
      {dataLocation[0].jurisdiction}
    </Badge>
  </div>
)}
```

**After (showing top 3 + View More):**
```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"

// ... (inside component)

const [showAll, setShowAll] = useState(false)
const displayedLocations = showAll ? dataLocation : dataLocation.slice(0, 3)

{dataLocation.length === 0 ? (
  <div className="text-sm text-muted-foreground text-center py-4">
    No data available
  </div>
) : (
  <div className="space-y-2">
    {displayedLocations.map((location, index) => (
      <div key={index} className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
        <div className="flex items-center gap-3">
          <Globe2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <div className="font-medium">{location.country}</div>
            <div className="text-sm text-muted-foreground">
              {location.count} supplier{location.count !== 1 ? "s" : ""} ({location.percentage}%)
            </div>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          {location.jurisdiction}
        </Badge>
      </div>
    ))}

    {dataLocation.length > 3 && (
      <Button
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => setShowAll(!showAll)}
      >
        {showAll ? (
          <>
            <ChevronUp className="h-4 w-4 mr-2" />
            Show Less
          </>
        ) : (
          <>
            <ChevronDown className="h-4 w-4 mr-2" />
            View More ({dataLocation.length - 3} more)
          </>
        )}
      </Button>
    )}
  </div>
)}
```

**Checkpoint 5A:** Dashboard loads without crash

**Testing Steps:**
```bash
$ npm run dev
```
- Navigate to `/suppliers` → Click "Dashboard" view
- Verify Geographic Distribution card appears
- Verify "Data Location Countries" section shows Luxembourg
- If error appears, check browser console for details

**Expected Outcome:** Dashboard displays, no crashes, shows countries

**Checkpoint 5B:** Geographic distribution displays correctly

**Testing Steps:**
- View data location countries
- If more than 3 countries exist, verify "View More" button appears
- Click "View More", verify all countries display
- Click "Show Less", verify only 3 display
- Verify counts and percentages are correct

**Expected Outcome:** All countries display correctly with accurate counts

---

### Phase 6: Validation and Filters

**Objective:** Update completeness check and filter logic for array handling

**Files to Modify:**
1. `lib/utils/check-completeness.ts` (line 119 + rename field)
2. `lib/utils/filter-suppliers.ts` (line 67-68 + rename field)

**Sub-Tasks:**

6.1. **Update check-completeness.ts**

**Find and replace:**

**Before (line 119):**
```typescript
|| data.location.dataLocationCountry.trim() === ""
```

**After:**
```typescript
|| data.location.dataLocationCountry.length === 0
```

**Before (rename check - search for `dataStorageLocation`):**
```typescript
|| data.location.dataStorageLocation.trim() === ""
```

**After:**
```typescript
|| data.location.otherDataLocationInfo.trim() === ""
```

6.2. **Update filter-suppliers.ts**

**Before (lines 67-68):**
```typescript
return supplier.location.dataLocationCountry
  .toLowerCase()
  .includes(normalizedValue)
```

**After:**
```typescript
return supplier.location.dataLocationCountry.some((country) =>
  country.toLowerCase().includes(normalizedValue)
)
```

**Before (rename - search for `dataStorageLocation`):**
```typescript
supplier.location.dataStorageLocation.toLowerCase().includes(normalizedValue)
```

**After:**
```typescript
supplier.location.otherDataLocationInfo.toLowerCase().includes(normalizedValue)
```

**Checkpoint 6A:** Form validation works

**Testing Steps:**
- Create new supplier
- Leave Data Location Countries empty
- Try to save with Status = "Active"
- Verify validation error appears
- Add Luxembourg to Data Location Countries
- Save successfully

**Expected Outcome:** Validation prevents saving without data location

**Checkpoint 6B:** Filters work

**Testing Steps:**
- On supplier list view, open filter panel
- Select "Data Location Country" field
- Type "Luxembourg"
- Verify suppliers with Luxembourg appear
- Clear filter
- Type "Germany"
- Verify suppliers with Germany appear

**Expected Outcome:** Filtering works for array fields

---

### Phase 7: Export System

**Objective:** Update export field mapping for new types and renamed field

**File to Modify:**
- `lib/utils/export-field-mapping.ts` (lines 245-250)

**Sub-Tasks:**

7.1. **Update dataLocationCountry field** (line 248)

**Before:**
```typescript
{
  header: "Data Location Country (54.f)",
  path: "location.dataLocationCountry",
  category: "location",
  type: "string",
  circularPoint: "54.f",
},
```

**After:**
```typescript
{
  header: "Data Location Countries (54.f)",
  path: "location.dataLocationCountry",
  category: "location",
  type: "array",
  circularPoint: "54.f",
},
```

7.2. **Rename dataStorageLocation field** (line 250)

**Before:**
```typescript
{
  header: "Data Storage Location (54.f)",
  path: "location.dataStorageLocation",
  category: "location",
  type: "string",
  circularPoint: "54.f",
},
```

**After:**
```typescript
{
  header: "Other Data Location Information (54.f)",
  path: "location.otherDataLocationInfo",
  category: "location",
  type: "string",
  circularPoint: "54.f",
},
```

**Checkpoint 7A:** Export to Excel works

**Testing Steps:**
- Create/edit a supplier with multiple data location countries
- Save supplier
- Go to supplier list
- Click "Export" → "Excel (Full View)"
- Open downloaded Excel file
- Find "Data Location Countries (54.f)" column
- Verify countries appear as comma-separated (e.g., "Luxembourg, Germany")
- Find "Other Data Location Information (54.f)" column
- Verify data appears correctly

**Expected Outcome:** Excel export shows arrays as comma-separated strings

**Checkpoint 7B:** Export to PDF works

**Testing Steps:**
- Export to PDF (Compact View)
- Verify "Data Location Countries" column exists
- Verify data displays correctly

**Expected Outcome:** PDF export works without errors

---

### Phase 8: Sample Data Migration

**Objective:** Update all 5 demo suppliers to use new array format and renamed field

**File to Modify:**
- `lib/data/suppliers.ts` (all suppliers, ~5 locations)

**Sub-Tasks:**

8.1. **Update Supplier 1** (lines 45-52)

**Before:**
```typescript
location: {
  servicePerformanceCountries: ["Luxembourg", "Germany", "Ireland"],
  dataLocationCountry: "Luxembourg",
  dataStorageLocation: "Luxembourg, Germany (backup)",
},
```

**After:**
```typescript
location: {
  servicePerformanceCountries: ["Luxembourg", "Germany", "Ireland"],
  dataLocationCountry: ["Luxembourg"],
  otherDataLocationInfo: "Luxembourg, Germany (backup)",
},
```

8.2. **Update Supplier 2** (find similar pattern)

**Pattern to find:** `dataLocationCountry: "Luxembourg"`

**Replace with:** `dataLocationCountry: ["Luxembourg"]`

**And rename:** `dataStorageLocation` → `otherDataLocationInfo`

8.3. **Repeat for all 5 suppliers**

**Verification checklist:**
- [ ] Supplier 1 updated
- [ ] Supplier 2 updated
- [ ] Supplier 3 updated
- [ ] Supplier 4 updated
- [ ] Supplier 5 updated

**Checkpoint 8A:** Demo data loads correctly

**Testing Steps:**
```bash
$ npm run dev
```
- Clear browser cache (Ctrl+Shift+Delete)
- Reload page
- Navigate to `/suppliers`
- Verify all 5 suppliers appear
- Click on each supplier
- Verify "Data Location Countries" shows as array
- Verify "Other Data Location Information" displays correctly

**Expected Outcome:** All demo suppliers display without errors

**Checkpoint 8B:** Dashboard shows updated data

**Testing Steps:**
- Go to Dashboard view
- Check Geographic Distribution card
- Verify data location countries appear
- Verify counts are correct

**Expected Outcome:** Dashboard reflects sample data changes

---

## Final Verification Phase

### Checkpoint FINAL-A: Full Build Test

**Testing Steps:**
```bash
$ npm run build
```

**Expected Outcome:** Build succeeds with 0 errors

**If build fails:**
1. Check TypeScript error messages
2. Identify which file has the issue
3. Review that file's changes
4. Common issues:
   - Missed field rename (`dataStorageLocation` → `otherDataLocationInfo`)
   - String vs array mismatch
   - Import statements missing

### Checkpoint FINAL-B: Complete User Flow Test

**Scenario 1: Create New Supplier**
1. Click "New Entry"
2. Fill "Identification & Status" tab
3. Go to "Provider" tab
4. Select Service Performance Countries: Luxembourg, Germany
5. Select Data Location Countries: Luxembourg
6. Fill Other Data Location Information: "Primary: Luxembourg, Backup: Germany"
7. Complete other tabs
8. Save
9. Verify supplier appears in list
10. View detail, verify all location fields display correctly

**Scenario 2: Edit Existing Supplier**
1. Open existing supplier
2. Click "Edit" (pencil icon)
3. Go to "Provider" tab
4. Change Data Location Countries: Add "Germany"
5. Save
6. Verify changes persist
7. Go to Dashboard
8. Verify Germany now appears in geographic distribution

**Scenario 3: Filter Suppliers**
1. Go to supplier list
2. Open filter panel
3. Select field: "Data Location Country"
4. Enter: "Germany"
5. Verify filtered results show only suppliers with Germany

**Scenario 4: Export Suppliers**
1. Export to Excel (Full View)
2. Check "Data Location Countries" column
3. Verify comma-separated countries
4. Check "Other Data Location Information" column
5. Verify data appears correctly

**Expected Outcome:** All scenarios work without errors

---

## Rollback Plan

If critical issues occur during implementation:

### Emergency Rollback (Type System)

**Step 1:** Revert type changes
```typescript
// lib/types/supplier.ts
location: {
  dataLocationCountry: string  // ← Revert to string
  dataStorageLocation: string  // ← Revert name
}
```

**Step 2:** Revert validation schema
```typescript
// lib/validations/supplier-schema.ts
dataLocationCountry: z.string().optional(),
dataStorageLocation: z.string().optional(),
```

**Step 3:** Rebuild
```bash
$ npm run build
```

**Result:** App returns to working state (before changes)

### Partial Rollback (Keep Some Changes)

If dashboard works but form has issues:
- Keep Phase 5 changes (dashboard)
- Revert Phase 3 changes (form)
- Test dashboard independently

---

## Dependencies and Risk Matrix

| Component | Depends On | Risk if Broken | Mitigation |
|-----------|------------|----------------|------------|
| FormCountryMultiSelect | - | Low | Isolated component |
| Type System | - | **CRITICAL** | Test build immediately |
| Form Component | Phase 1, 2 | High | Test save operation |
| Detail View | Phase 2 | Medium | FieldDisplay handles arrays |
| Dashboard | Phase 2 | **CRITICAL** | Test immediately after Phase 5 |
| Validation | Phase 2 | High | Test form save with validation |
| Filters | Phase 2 | Medium | Test search functionality |
| Export | Phase 2 | Low | Test export after data migration |
| Sample Data | Phase 2 | Medium | Clear cache before testing |

---

## Common Issues and Solutions

### Issue 1: "Cannot read property 'forEach' of undefined"
**Location:** dashboard-analytics.ts
**Cause:** `dataLocationCountry` is undefined or null
**Solution:** Add null check:
```typescript
if (s.location.dataLocationCountry && s.location.dataLocationCountry.length > 0) {
  s.location.dataLocationCountry.forEach((country) => {
    dataLocationCounts[country] = (dataLocationCounts[country] || 0) + 1
  })
}
```

### Issue 2: Form shows validation error "Expected array, received string"
**Location:** Form save operation
**Cause:** Old sample data still in sessionStorage
**Solution:** Clear browser storage:
```javascript
// In browser console
sessionStorage.clear()
localStorage.clear()
```

### Issue 3: Export shows "[object Object]" instead of country names
**Location:** Excel/PDF export
**Cause:** Array not converted to comma-separated string
**Solution:** Check export formatter handles arrays correctly (should already work)

### Issue 4: Cannot save form - "dataStorageLocation is not defined"
**Location:** Form submission
**Cause:** Field path not updated everywhere
**Solution:** Search codebase for "dataStorageLocation" and replace with "otherDataLocationInfo"

---

## Success Criteria

### Must Pass (Critical)
- [ ] Build completes with 0 errors
- [ ] Dashboard loads without crash
- [ ] Can create new supplier with multiple data location countries
- [ ] Can edit existing supplier
- [ ] Can save form successfully
- [ ] Detail view displays arrays correctly
- [ ] Export to Excel works

### Should Pass (Important)
- [ ] Filters work for array fields
- [ ] Validation prevents empty data location
- [ ] All 5 demo suppliers load correctly
- [ ] Dashboard shows top 3 countries
- [ ] "View More" button works on dashboard

### Nice to Have (Optional)
- [ ] Form layout looks visually consistent
- [ ] Dropdown search is fast
- [ ] Badge removal works smoothly
- [ ] Export PDF looks formatted correctly

---

## Post-Implementation Tasks

1. **Update ARCHITECTURE.md**
   - Document `dataLocationCountry` as array type
   - Document renamed field `otherDataLocationInfo`
   - Update field count (still 52, just type changes)

2. **Update UPDATES.md**
   - Log this change with date
   - Reference this plan document

3. **Create Git Commit**
   - Title: "feat: convert data location to array + add country dropdowns"
   - Body: Reference this plan, list all phases

4. **Test on Clean Browser**
   - Open incognito window
   - Test all scenarios
   - Verify no cache issues

---

## Timeline Estimate

| Phase | Time | Cumulative |
|-------|------|------------|
| Phase 1: Component | 30 min | 30 min |
| Phase 2: Types | 10 min | 40 min |
| Phase 3: Form | 30 min | 1h 10min |
| Phase 4: Detail View | 15 min | 1h 25min |
| Phase 5: Dashboard | 45 min | 2h 10min |
| Phase 6: Validation | 15 min | 2h 25min |
| Phase 7: Export | 10 min | 2h 35min |
| Phase 8: Sample Data | 15 min | 2h 50min |
| Final Verification | 1h 10min | **4h total** |

---

## Sign-Off Checklist

Before marking this plan as complete:

- [ ] All 9 phases completed
- [ ] All checkpoints passed
- [ ] Final verification passed
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] Documentation updated
- [ ] Git commit created
- [ ] User tested all scenarios

---

**Plan Status:** APPROVED
**Ready for Implementation:** YES
**Next Step:** Execute Phase 1

---

*This document will be updated with actual implementation notes and any deviations from the plan.*
