# Export Function Implementation Plan

## Overview
Create Excel and PDF export functionality for the CSSF Supplier Outsourcing Register with:
- **2 export formats:** Full (52 fields) and Summary (8 columns)
- **2 file types:** Excel (.xlsx) and PDF (.pdf)
- **2 scope options:** All suppliers or filtered results
- **Phased implementation** with testing at localhost:3000 after each visual phase

---

## Phase-by-Phase Implementation

### Phase 1: Setup + Field Mapping
**Goal:** Install dependencies and create field mapping infrastructure

**Tasks:**
1. Install npm packages: `xlsx`, `jspdf`, `jspdf-autotable`, `@types/jspdf-autotable`
2. Create `lib/utils/export-field-mapping.ts` with complete 52-field mapping
3. Create `lib/utils/export-formatters.ts` for data transformation utilities
4. Update `lib/types/supplier.ts` comments to match current implementation

**Testing:** No visual testing (infrastructure only)

---

### Phase 2: Excel Summary Export (8 Columns)
**Goal:** Export summary table view to Excel

**Tasks:**
1. Create `lib/utils/export-excel.ts` with summary export function
2. Create `components/shared/export-dialog.tsx` (dialog UI with options)
3. Create `components/shared/export-button.tsx` (top-right toolbar button)
4. Integrate export button into `supplier-register-table.tsx`
5. Implement summary column mapping (8 fields only)

**Testing at localhost:3000:** ✅
- Click Export button → Dialog appears
- Select "Summary export" + "All suppliers" → Download Excel
- Verify 8 columns with correct headers and CSSF references
- Verify pending field markers (*) appear correctly
- Verify data formatting (dates, booleans, enums)

**User Feedback Required:** Confirm summary export works before proceeding

---

### Phase 3: Excel Full Export (52 Fields)
**Goal:** Export all fields to Excel

**Tasks:**
1. Extend `lib/utils/export-excel.ts` with full export function
2. Implement all 52 field mappings
3. Handle conditional fields (Cloud when category=Cloud, Critical when isCritical=true)
4. Handle array fields (comma-separated for simple, pipe-separated for objects)
5. Apply column widths (max 30) and text wrapping

**Testing at localhost:3000:** ✅
- Select "Full export" + "All suppliers" → Download Excel
- Verify all 52 columns present with CSSF references
- Verify Cloud fields show "N/A" for non-cloud suppliers
- Verify Critical fields show "N/A" for non-critical suppliers
- Verify array formatting (commas and pipes)
- Verify subcontractor line breaks work correctly
- Test with filtered results (e.g., only critical suppliers)

**User Feedback Required:** Confirm full export works before proceeding

---

### Phase 4: PDF Summary Export
**Goal:** Export summary table to PDF

**Tasks:**
1. Create `lib/utils/export-pdf.ts` with summary export function
2. Configure landscape orientation
3. Add professional formatting (headers, borders, page numbers, export date)
4. Implement same 8-column summary as Excel

**Testing at localhost:3000:** ✅
- Select "Summary export" + PDF → Download PDF
- Verify landscape orientation
- Verify professional appearance (headers, page numbers)
- Verify data matches Excel summary export
- Verify pending markers (*) appear correctly

**User Feedback Required:** Confirm PDF summary works before proceeding

---

### Phase 5: PDF Full Export (52 Fields)
**Goal:** Export all fields to PDF

**Tasks:**
1. Extend `lib/utils/export-pdf.ts` with full export function
2. Handle multi-page layout (landscape, condensed font for 52 columns)
3. Apply same data formatting as Excel full export
4. Add page breaks if needed for readability

**Testing at localhost:3000:** ✅
- Select "Full export" + PDF → Download PDF
- Verify all 52 columns fit (may require small font or multiple pages)
- Verify data matches Excel full export
- Verify conditional fields (Cloud/Critical) display correctly
- Test with different supplier counts (1, 3, 5 suppliers)

**User Feedback Required:** Confirm PDF full export works before proceeding

---

### Phase 6: Polish & Edge Cases
**Goal:** Handle edge cases and improve UX

**Tasks:**
1. Add loading state to export button (spinner during generation)
2. Handle empty supplier list (show error toast)
3. Handle zero filtered results (show warning)
4. Add toast notifications on successful export
5. Handle errors gracefully (file download failures, browser compatibility)
6. Add filename generation: `supplier-register-summary-2025-10-30.xlsx`

**Testing at localhost:3000:** ✅
- Test empty filter results
- Test with 1 supplier
- Test filename generation
- Test error scenarios (if possible)
- Final end-to-end test of all 4 combinations (Summary/Full × Excel/PDF)

**User Feedback Required:** Final approval before completion

---

## Complete Field Mapping (52 Fields)

### Mandatory Fields for ALL Suppliers (25 fields)

| # | Field Path | Column Header | CSSF Ref | Type | Display Rule |
|---|------------|---------------|----------|------|--------------|
| 1 | `referenceNumber` | Reference Number | 54.a | string | As-is + * if pending |
| 2 | `status` | Status | 53 | enum | Full value + * if pending |
| 3 | `dates.startDate` | Start Date | 54.b | date | YYYY-MM-DD + * if pending |
| 4 | `dates.nextRenewalDate` | Next Renewal Date | 54.b | date? | YYYY-MM-DD or blank + * |
| 5 | `dates.endDate` | End Date | 54.b | date? | YYYY-MM-DD or blank + * |
| 6 | `dates.serviceProviderNoticePeriod` | Service Provider Notice Period | 54.b | string? | As-is or blank + * |
| 7 | `dates.entityNoticePeriod` | Entity Notice Period | 54.b | string? | As-is or blank + * |
| 8 | `functionDescription.name` | Function Name | 54.c | string | As-is + * if pending |
| 9 | `functionDescription.description` | Function Description | 54.c | string | As-is + * if pending |
| 10 | `functionDescription.dataDescription` | Data Description | 54.c | string | As-is + * if pending |
| 11 | `functionDescription.personalDataInvolved` | Personal Data Involved? | 54.c | boolean | Yes/No + * if pending |
| 12 | `functionDescription.personalDataTransferred` | Personal Data Transferred? | 54.c | boolean | Yes/No + * if pending |
| 13 | `category` | Category | 54.d | enum | Full value + * if pending |
| 14 | `serviceProvider.name` | Provider Name | 54.e | string | As-is + * if pending |
| 15 | `serviceProvider.corporateRegistrationNumber` | Corporate Registration Number | 54.e | string | As-is + * if pending |
| 16 | `serviceProvider.legalEntityIdentifier` | LEI (if any) | 54.e | string? | As-is or blank + * |
| 17 | `serviceProvider.registeredAddress` | Registered Address | 54.e | string | As-is + * if pending |
| 18 | `serviceProvider.contactDetails` | Contact Details | 54.e | string | As-is + * if pending |
| 19 | `serviceProvider.parentCompany` | Parent Company (if any) | 54.e | string? | As-is or blank + * |
| 20 | `location.servicePerformanceCountries` | Service Performance Countries | 54.f | array | Comma-separated + * |
| 21 | `location.dataLocationCountry` | Data Location Country | 54.f | string | As-is + * if pending |
| 22 | `location.dataStorageLocation` | Data Storage Location | 54.f | string? | As-is or blank + * |
| 23 | `criticality.isCritical` | Is Critical? | 54.g | boolean | Yes/No + * if pending |
| 24 | `criticality.reasons` | Criticality Reasons | 54.g | string | As-is + * if pending |
| 25 | `criticalityAssessmentDate` | Criticality Assessment Date | 54.i | date | YYYY-MM-DD + * if pending |

### Cloud Service Fields (6 fields - conditional)

| # | Field Path | Column Header | CSSF Ref | Type | Display Rule |
|---|------------|---------------|----------|------|--------------|
| 26 | `cloudService.serviceModel` | Cloud Service Model | 54.h | enum | Full value or "N/A" + * |
| 27 | `cloudService.deploymentModel` | Deployment Model | 54.h | enum | Full value or "N/A" + * |
| 28 | `cloudService.dataNature` | Data Nature | 54.h | string | As-is or "N/A" + * |
| 29 | `cloudService.storageLocations` | Storage Locations | 54.h | array | Comma-separated or "N/A" + * |
| 30 | `cloudService.cloudOfficer` | Cloud Officer | 54.h | string? | As-is or "N/A" + * |
| 31 | `cloudService.resourceOperator` | Resource Operator | 54.h | string? | As-is or "N/A" + * |

### Critical Function Fields (21 fields - conditional)

| # | Field Path | Column Header | CSSF Ref | Type | Display Rule |
|---|------------|---------------|----------|------|--------------|
| 32 | `criticalFields.entitiesUsing.inScopeEntities` | In-Scope Entities | 55.a | array | Comma-separated or "N/A" + * |
| 33 | `criticalFields.groupRelationship.isPartOfGroup` | Part of Group? | 55.b | boolean | Yes/No or "N/A" + * |
| 34 | `criticalFields.groupRelationship.isOwnedByGroup` | Owned by Group? | 55.b | boolean | Yes/No or "N/A" + * |
| 35 | `criticalFields.riskAssessment.risk` | Risk Level | 55.c | enum | Full value or "N/A" + * |
| 36 | `criticalFields.riskAssessment.lastAssessmentDate` | Last Risk Assessment Date | 55.c | date | YYYY-MM-DD or "N/A" + * |
| 37 | `criticalFields.riskAssessment.mainResults` | Risk Assessment Summary | 55.c | string | As-is or "N/A" + * |
| 38 | `criticalFields.approval.approverName` | Approver Name | 55.d | string | As-is or "N/A" + * |
| 39 | `criticalFields.approval.approverRole` | Approver Role | 55.d | string | As-is or "N/A" + * |
| 40 | `criticalFields.governingLaw` | Governing Law | 55.e | string | As-is or "N/A" + * |
| 41 | `criticalFields.audit.lastAuditDate` | Last Audit Date | 55.f | date? | YYYY-MM-DD or "N/A" + * |
| 42 | `criticalFields.audit.nextScheduledAudit` | Next Scheduled Audit | 55.f | date? | YYYY-MM-DD or "N/A" + * |
| 43 | `criticalFields.subOutsourcing.hasSubOutsourcing` | Activities are Sub-Outsourced? | 55.g | boolean | Yes/No or "N/A" + * |
| 44 | `criticalFields.subOutsourcing.subContractors` | Sub-Contractors | 55.g | array[obj] | Pipe-separated or "N/A" + * |
| 45 | `criticalFields.substitutability.outcome` | Substitutability Outcome | 55.h | enum | Full value or "N/A" + * |
| 46 | `criticalFields.substitutability.reintegrationAssessment` | Reintegration Assessment | 55.h | string | As-is or "N/A" + * |
| 47 | `criticalFields.substitutability.discontinuationImpact` | Discontinuation Impact | 55.h | string | As-is or "N/A" + * |
| 48 | `criticalFields.alternativeProviders` | Alternative Providers | 55.i | array | Comma-separated or "N/A" + * |
| 49 | `criticalFields.isTimeCritical` | Time-Critical Function? | 55.j | boolean | Yes/No or "N/A" + * |
| 50 | `criticalFields.estimatedAnnualCost` | Estimated Annual Cost | 55.k | number | As-is or "N/A" + * |
| 51 | `criticalFields.costComments` | Cost Comments | 55.k | string? | As-is or "N/A" + * |
| 52 | `criticalFields.regulatoryNotification.notificationDate` | CSSF Notification Date | 55.l | date? | YYYY-MM-DD or "N/A" + * |

---

## Summary View Mapping (8 Columns)

| # | Field Path | Column Header | CSSF Ref | Source |
|---|------------|---------------|----------|--------|
| 1 | `referenceNumber` | Reference Number | 54.a | referenceNumber |
| 2 | `functionDescription.name` | Function Name | 54.c | functionDescription.name |
| 3 | `serviceProvider.name` | Provider Name | 54.e | serviceProvider.name |
| 4 | `category` | Category | 54.d | category |
| 5 | `status` | Status | 53 | status |
| 6 | `criticality.isCritical` | Is Critical? | 54.g | criticality.isCritical (Yes/No) |
| 7 | `dates.startDate` | Start Date | 54.b | dates.startDate |
| 8 | `criticalFields?.regulatoryNotification?.notificationDate` | CSSF Notification Date | 55.l | criticalFields.regulatoryNotification.notificationDate or "N/A" |

---

## Display Logic Decision Tree

```typescript
function formatFieldValue(value: any, fieldPath: string, pendingFields: string[], isConditionalField: boolean): string {
  const isPending = pendingFields.includes(fieldPath)

  // Rule 1: Field has value + marked as pending
  if (value && isPending) {
    return `${formatValue(value)} *`
  }

  // Rule 2: Field has value + not pending
  if (value && !isPending) {
    return formatValue(value)
  }

  // Rule 3: Empty + pending
  if (!value && isPending) {
    return "*"
  }

  // Rule 4: Empty + not pending + conditional field (Cloud/Critical N/A)
  if (!value && !isPending && isConditionalField) {
    return "N/A"
  }

  // Rule 5: Empty + not pending + optional field
  if (!value && !isPending && !isConditionalField) {
    return "" // blank cell
  }
}
```

---

## Data Formatting Specifications

### Dates
- Format: **YYYY-MM-DD** (no conversion)
- Example: `"2022-01-15"`

### Booleans
- `true` → `"Yes"`
- `false` → `"No"`

### Numbers
- Format: As-is (no thousands separator)
- Example: `850000` (not `850,000`)

### Enums
- Format: Full enum value
- Example: `"IaaS (Infrastructure as a Service)"`

### Arrays (Simple)
- Format: Comma-separated in single cell
- Example: `"Luxembourg, Germany, Ireland"`

### Arrays (Object - Subcontractors)
- Format: Pipe-separated fields, line breaks between objects
- Example:
```
SecureNet Data Centers GmbH | Physical data center infrastructure... | Germany | Germany | Frankfurt, Germany
SWIFT Belgium | International wire transfer messaging... | Belgium | Belgium | Brussels, Belgium
```

### Empty Values
- **Empty optional field:** blank `""`
- **Empty array:** blank `""`
- **Conditional N/A:** `"N/A"`

---

## Export Dialog Flow

```tsx
<Dialog>
  <DialogTitle>Export Suppliers Register</DialogTitle>
  <DialogContent>
    {/* Export Scope */}
    <Label>Export Scope:</Label>
    <RadioGroup>
      <Radio value="all">All suppliers ({allCount})</Radio>
      <Radio value="filtered">Filtered results only ({filteredCount})</Radio>
    </RadioGroup>

    {/* Export Format */}
    <Label>Export Format:</Label>
    <RadioGroup>
      <Radio value="full">Full export (52 fields)</Radio>
      <Radio value="summary">Summary export (8 columns)</Radio>
    </RadioGroup>

    {/* File Type Buttons */}
    <DialogFooter>
      <Button onClick={handleExportExcel}>Export as Excel</Button>
      <Button onClick={handleExportPDF}>Export as PDF</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Excel Technical Specifications

### Column Widths
- **All text fields:** `{ wch: 30 }` (max width 30, wrap text enabled)
- **Dates:** `{ wch: 12 }`
- **Numbers:** `{ wch: 15 }`
- **Booleans:** `{ wch: 10 }`

### Header Formatting
- **Font:** Bold
- **Background:** Light gray (#F3F4F6)
- **Alignment:** Left

### Cell Formatting
- **Text wrapping:** Enabled for all text fields
- **Alignment:** Top-left
- **Borders:** Optional (not required)

### Filename Format
```
supplier-register-summary-2025-10-30.xlsx
supplier-register-full-2025-10-30.xlsx
```

---

## PDF Technical Specifications

### Page Setup
- **Orientation:** Landscape (both summary and full)
- **Margins:** 10mm all sides
- **Font:** Helvetica 8pt (for full export to fit 52 columns)

### Header Section
```
CSSF Supplier Outsourcing Register
Export Type: [Full Export / Summary Export]
Export Date: DD/MM/YYYY
Total Suppliers: X
```

### Footer Section
```
Page X of Y                    Generated by Supplier Register v0.1.0
```

### Table Formatting
- **Header row:** Bold, light gray background
- **Borders:** All cells
- **Text wrapping:** Enabled for text fields
- **Auto-page breaks:** Enabled

### Filename Format
```
supplier-register-summary-2025-10-30.pdf
supplier-register-full-2025-10-30.pdf
```

---

## File Structure

### New Files (7)
1. **`context/ExportFunctionPlan.md`** - This document
2. **`lib/utils/export-field-mapping.ts`** - 52-field mapping with CSSF refs
3. **`lib/utils/export-formatters.ts`** - Data transformation utilities
4. **`lib/utils/export-excel.ts`** - Excel export logic (summary + full)
5. **`lib/utils/export-pdf.ts`** - PDF export logic (summary + full)
6. **`components/shared/export-dialog.tsx`** - Export options dialog
7. **`components/shared/export-button.tsx`** - Export button component

### Modified Files (3)
1. **`components/shared/supplier-register-table.tsx`** - Add export button to toolbar
2. **`package.json`** - Add dependencies
3. **`lib/types/supplier.ts`** - Update outdated comments

---

## Dependencies

```bash
npm install xlsx jspdf jspdf-autotable
npm install --save-dev @types/jspdf-autotable
```

**Versions (latest stable):**
- `xlsx`: ^0.18.5
- `jspdf`: ^2.5.1
- `jspdf-autotable`: ^3.8.2

---

## Edge Cases & Error Handling

### Empty Supplier List
- Show error toast: "No suppliers to export"
- Disable export button

### Zero Filtered Results
- Show warning toast: "No suppliers match current filters"
- Allow user to export all suppliers instead

### Large Datasets (Future)
- If >100 suppliers, show progress indicator
- Stream processing for Excel (current implementation OK for <100)

### Browser Compatibility
- Test file download in Chrome, Firefox, Edge
- Handle Safari download restrictions (may need workaround)

### Subcontractor Line Breaks
- Excel: Use `\n` within cell (enable wrapText)
- PDF: Use `\n` in jsPDF-AutoTable (supports multiline cells)

### Conditional Field Detection
```typescript
function isConditionalField(fieldPath: string, supplier: SupplierOutsourcing): boolean {
  // Cloud fields conditional
  if (fieldPath.startsWith('cloudService') && supplier.category !== OutsourcingCategory.CLOUD) {
    return true
  }

  // Critical fields conditional
  if (fieldPath.startsWith('criticalFields') && !supplier.criticality.isCritical) {
    return true
  }

  return false
}
```

---

## Testing Strategy

### Phase 2 Testing (Summary Excel)
- ✅ Export 5 suppliers → verify 8 columns
- ✅ Verify Supplier 1 pending markers (2 fields pending)
- ✅ Verify CSSF headers correct
- ✅ Verify date format (YYYY-MM-DD)
- ✅ Verify boolean (Yes/No)

### Phase 3 Testing (Full Excel)
- ✅ Export all 5 suppliers → verify 52 columns
- ✅ Verify Supplier 1 (Cloud + Critical) has all fields
- ✅ Verify Supplier 2 (Non-critical) shows N/A for critical fields
- ✅ Verify array formatting (comma-separated)
- ✅ Verify subcontractor pipe formatting with line breaks
- ✅ Verify column widths (30 max) and text wrapping
- ✅ Export filtered (only critical) → verify 3 suppliers

### Phase 4 Testing (Summary PDF)
- ✅ Verify landscape orientation
- ✅ Verify header/footer formatting
- ✅ Verify data matches Excel summary
- ✅ Verify professional appearance

### Phase 5 Testing (Full PDF)
- ✅ Verify all 52 columns fit (may need small font)
- ✅ Verify multi-page layout works
- ✅ Verify data matches Excel full export

### Phase 6 Testing (Edge Cases)
- ✅ Empty filter results → warning toast
- ✅ Export 1 supplier only
- ✅ Verify filename generation
- ✅ Test all 4 combinations (Summary/Full × Excel/PDF)

---

## Success Criteria

### Excel Export
- ✅ Summary: 8 columns, correct data, pending markers
- ✅ Full: 52 columns, conditional N/A handling, array formatting
- ✅ Download works in browser
- ✅ File opens correctly in Excel/Google Sheets

### PDF Export
- ✅ Landscape orientation
- ✅ Professional formatting (headers, page numbers)
- ✅ Data matches Excel exports
- ✅ Readable and print-ready

### UX
- ✅ Export button visible in top-right
- ✅ Dialog is intuitive and clear
- ✅ Loading states work correctly
- ✅ Toast notifications on success/error
- ✅ Filtered export respects current filters

---

## Implementation Notes

1. **Testing after each phase** - User will test at localhost:3000 and provide feedback before proceeding to next phase
2. **Incremental approach** - Build summary first (simpler), then full export
3. **Excel before PDF** - Excel is more complex, get it working first
4. **Edge cases last** - Focus on happy path first, polish at the end

---

**Plan Status:** ✅ Approved
**Last Updated:** 2025-10-30
**Current Phase:** Phase 1 - Setup & Field Mapping
