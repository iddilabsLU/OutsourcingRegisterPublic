# Application Architecture

This document explains how the Supplier Register application is structured and how different parts work together.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [Component Hierarchy](#component-hierarchy)
3. [Data Flow](#data-flow)
4. [File Structure](#file-structure)
5. [CSSF Compliance Mapping](#cssf-compliance-mapping)
6. [Key Patterns & Conventions](#key-patterns--conventions)
7. [State Management](#state-management)
8. [Form Architecture](#form-architecture)

---

## High-Level Overview

The Supplier Register is a **client-side React application** built with Next.js 15 (App Router). It currently has no backend - all data lives in memory and resets on page refresh (persistence planned in roadmap).

### Architecture Layers

```
┌─────────────────────────────────────────────────────┐
│  USER INTERFACE (React Components)                  │
│  - Supplier Register Table                          │
│  - Add Supplier Form (4 tabs, 73 fields)           │
│  - Filter Panel                                      │
│  - View Navigation                                   │
└─────────────────────────────────────────────────────┘
                     ↓ ↑
┌─────────────────────────────────────────────────────┐
│  STATE MANAGEMENT (React State + Context)           │
│  - Suppliers array (in-memory)                      │
│  - Filter state                                      │
│  - Search context                                    │
│  - Pending fields tracking                          │
└─────────────────────────────────────────────────────┘
                     ↓ ↑
┌─────────────────────────────────────────────────────┐
│  BUSINESS LOGIC (TypeScript Functions)              │
│  - Filter suppliers                                  │
│  - Check completeness (CSSF validation)            │
│  - Text highlighting                                 │
│  - Reference number generation                       │
└─────────────────────────────────────────────────────┘
                     ↓ ↑
┌─────────────────────────────────────────────────────┐
│  DATA MODEL (TypeScript Types)                      │
│  - SupplierOutsourcing interface                    │
│  - CSSF enums (Status, Category, Risk, etc.)       │
│  - Filter types                                      │
└─────────────────────────────────────────────────────┘
```

### Key Concepts

1. **No Backend** - Currently a frontend-only demo (Phase 1)
2. **In-Memory Data** - 5 dummy suppliers loaded from `lib/data/suppliers.ts`
3. **Type Safety** - 100% TypeScript coverage
4. **CSSF Compliance** - Implements Circular 22/806 Section 4.2.7 (Points 53, 54, 55)
5. **Two-Layer Validation** - Type safety (Zod) + Business logic (Completeness checker)
6. **Pending Fields** - Mark incomplete fields for later completion

---

## Component Hierarchy

### Page Level (`app/`)

```
app/page.tsx (Main Supplier Register Page)
├── AppLayout (Header + Footer wrapper)
│   ├── Header
│   └── Footer
└── ViewSegmentedControl (Tab Navigation)
    ├── Register List View
    │   ├── FilterPanel
    │   │   ├── QuickFilters (Critical, Cloud)
    │   │   └── CustomFilterRow (up to 3)
    │   ├── ActiveFilterBadges
    │   └── SupplierRegisterTable
    │       ├── Table Header
    │       └── SupplierRow (collapsible)
    │           ├── Compact View (always visible)
    │           │   ├── Reference & Status badges
    │           │   ├── Provider name
    │           │   └── Actions menu (Edit, Duplicate, Delete)
    │           └── Expanded View (on click)
    │               └── SupplierDetailTabs (wraps with SearchProvider)
    │                   ├── BasicInfo (Tab 1)
    │                   ├── ProviderDetails (Tab 2)
    │                   ├── CloudServices (Tab 3, conditional)
    │                   └── CriticalFunctions (Tab 4, conditional)
    │
    ├── New Entry View
    │   └── SupplierForm
    │       ├── SupplierFormTabNav (Tab navigation)
    │       ├── BasicInfoTab (4 card sections)
    │       │   ├── Reference & Status
    │       │   ├── Dates
    │       │   ├── Function Description
    │       │   └── Criticality Assessment
    │       ├── ServiceProviderTab (2 card sections)
    │       │   ├── Service Provider Information
    │       │   └── Location Information
    │       ├── CloudServicesTab (conditional, Point 54.h)
    │       │   └── Cloud Service Information
    │       ├── CriticalFunctionsTab (conditional, Point 55)
    │       │   ├── Entities Using
    │       │   ├── Group Relationship
    │       │   ├── Risk Assessment
    │       │   ├── Approval
    │       │   ├── Governing Law & Audit
    │       │   ├── Sub-Outsourcing (conditional)
    │       │   ├── Substitutability Assessment
    │       │   ├── Alternative Providers
    │       │   ├── Time Criticality
    │       │   ├── Cost Information
    │       │   └── Regulatory Notification
    │       ├── FormActions (Cancel, Save as Draft, Save Supplier)
    │       └── IncompleteFieldsDialog (confirmation)
    │
    └── Dashboard View
        ├── ComplianceAlerts
        │   ├── Overdue Reviews Alert
        │   ├── Upcoming Reviews Alert
        │   └── Missing Notifications Alert
        ├── MetricsCards
        │   ├── Total Suppliers Card
        │   ├── Critical % Card
        │   ├── Cloud % Card
        │   ├── Pending % Card
        │   └── Completeness Rate Card
        ├── Charts Section
        │   ├── StatusPieChart
        │   └── CategoryBarChart
        ├── Risk Management Section
        │   ├── RiskBarChart
        │   ├── UpcomingReviewsCard
        │   ├── ProviderConcentrationTable
        │   └── GeographicDistributionTable
        └── Deep Dive Analytics Section
            ├── CriticalFunctionsCard
            ├── PendingNotificationsList
            └── DataCompletenessCard
```

### Reusable Components

**Display Components:**
- `field-display.tsx` - CSSF-compliant field with label, value, annotations
- `icon-badge.tsx` - Icon container with variants
- `not-applicable-placeholder.tsx` - N/A placeholder for conditional fields

**Form Field Components:**
- `form-text-input.tsx` - Text input with pending toggle
- `form-select.tsx` - Dropdown select
- `form-textarea.tsx` - Multi-line text
- `form-date-picker.tsx` - Calendar date picker
- `form-radio-group.tsx` - Radio button group
- `form-multi-text.tsx` - Dynamic array of text inputs
- `form-country-multi-select.tsx` - Multi-select country dropdown (~195 countries) with badges
- `form-sub-contractor.tsx` - Complex nested sub-contractor fields

**Navigation & Filtering:**
- `view-segmented-control.tsx` - Main view switcher
- `filter-panel.tsx` - Collapsible filter UI
- `active-filter-badges.tsx` - Active filter chips

---

## Data Flow

### Adding a New Supplier

```
1. User clicks "New Entry" tab
   → ViewSegmentedControl updates activeView state
   → SupplierForm component renders

2. User fills form fields
   → React Hook Form tracks values
   → No validation happens during typing
   → Pending toggle marks fields as pending

3. User clicks "Save Supplier"
   → form.getValues() collects all form data
   → checkIncompleteFields() runs (Layer 2 validation)
   → Skips pending fields
   → Returns incomplete field list

4a. If incomplete fields found:
   → IncompleteFieldsDialog shows
   → User chooses "Mark as Pending & Submit" or "Go Back"

4b. If "Mark as Pending & Submit":
   → Adds incomplete fields to pendingFields array
   → Supplier added to suppliers array (state)
   → View switches back to Register List
   → Toast notification shows success

5. Table re-renders with new supplier
   → Shows amber badge if pending fields exist
```

### Filtering Suppliers

```
1. User adds filter (e.g., "Category = Cloud")
   → FilterPanel updates filters state
   → Triggers filterSuppliers() function

2. filterSuppliers() processes:
   → Quick filters (critical, cloud)
   → Custom filters (up to 3)
   → Global text search (if present)
   → Applies AND logic across all filters

3. Filtered suppliers returned
   → SupplierRegisterTable re-renders
   → Shows only matching suppliers
   → ActiveFilterBadges display active filters

4. If text search present:
   → SearchContext provides searchTerm
   → SupplierDetailTabs consumes context
   → FieldDisplay highlights matching text in yellow
```

### Expanding Supplier Details

```
1. User clicks supplier row
   → onClick toggles expandedRowId state

2. Row expands (conditional render)
   → SupplierDetailTabs renders with SearchProvider
   → Provider passes searchTerm from filters

3. User switches tabs
   → Tab navigation updates activeTab state
   → Content switches between BasicInfo/Provider/Cloud/Critical

4. Tab components (BasicInfo, ProviderDetails, etc.):
   → Use useSearch() hook to get searchTerm
   → Pass searchTerm to FieldDisplay components
   → FieldDisplay highlights matching text
```

### Dashboard Analytics Flow

The dashboard is a **read-only analytics view** that calculates metrics from the supplier data:

```
Suppliers Array (from page state)
      ↓
Dashboard View Component
      ↓
Analytics Functions (lib/utils/dashboard-analytics.ts)
  ├── getOverdueAssessments()
  ├── getUpcomingReviews()
  ├── getKeyMetrics()
  ├── getPendingFieldsMetrics()
  ├── getStatusBreakdown()
  ├── getCategoryBreakdown()
  ├── getRiskDistribution()
  ├── getProviderConcentration()
  ├── getGeographicDistribution()
  ├── getCriticalFunctionsAnalysis()
  └── getRegulatoryNotificationStatus()
      ↓
Dashboard Components (receive calculated data)
  ├── ComplianceAlerts
  ├── MetricsCards
  ├── Charts (Recharts visualization)
  └── Tables
```

**Key Points:**
- No state mutations (read-only view)
- Calculations happen on each render (suppliers change → metrics recalculate)
- Respects active filters (uses filteredSuppliers from page)
- CSSF compliance checks (Points 54.i, 55.c, 55.f, 55.l)

---

## File Structure

### `/app` - Next.js App Router Pages

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout with metadata, fonts, theme |
| `page.tsx` | Main supplier register page (loads dummy data) |
| `globals.css` | CSS variables (light theme only), Tailwind base |
| `loading.tsx` | Loading skeleton (shown during page load) |
| `error.tsx` | Error boundary for route errors |
| `not-found.tsx` | 404 page |

### `/components/ui` - shadcn/ui Components

26+ components installed via `npx shadcn@latest add <component>`. These are auto-generated and should not be edited unless customizing globally.

**Key Components:**
- `form.tsx` - React Hook Form integration
- `card.tsx` - Card container with header/content
- `table.tsx` - Table primitives
- `tabs.tsx` - Tab navigation and content
- `dialog.tsx` - Modal dialog
- `badge.tsx` - Status/tag badges
- `button.tsx` - Button variants
- `input.tsx`, `select.tsx`, `textarea.tsx` - Form inputs
- `progress.tsx` - Progress bar component (Radix UI primitive, added for dashboard)

### `/components/shared` - Custom Components

#### Register Table & Display

| File | Purpose | Lines |
|------|---------|-------|
| `supplier-register-table.tsx` | Main register table with expand/collapse | ~600 |
| `supplier-detail-tabs.tsx` | Tab wrapper with SearchProvider | ~50 |
| `supplier-detail-tab-nav.tsx` | Tab navigation bar | ~80 |
| `supplier-basic-info.tsx` | Basic Info tab content | ~300 |
| `supplier-provider-details.tsx` | Provider Details tab | ~200 |
| `supplier-cloud-services.tsx` | Cloud Services tab | ~200 |
| `supplier-critical-functions.tsx` | Critical Functions tab | ~500 |
| `field-display.tsx` | Field label + value with CSSF annotations | ~100 |
| `not-applicable-placeholder.tsx` | N/A placeholder | ~30 |
| `icon-badge.tsx` | Icon container with variants | ~50 |

#### Form Components

| File | Purpose | Lines |
|------|---------|-------|
| `forms/supplier-form.tsx` | Main form container with tab management | ~400 |
| `forms/supplier-form-tab-nav.tsx` | Form tab navigation | ~120 |
| `forms/supplier-form-basic-info.tsx` | Basic Information tab | ~450 |
| `forms/supplier-form-provider.tsx` | Service Provider tab | ~300 |
| `forms/supplier-form-cloud.tsx` | Cloud Services tab (conditional) | ~250 |
| `forms/supplier-form-critical.tsx` | Critical Functions tab (conditional) | ~600 |
| `forms/form-actions.tsx` | Cancel, Save as Draft, Save Supplier buttons | ~120 |
| `forms/incomplete-fields-dialog.tsx` | Confirmation dialog for missing fields | ~150 |
| `forms/pending-toggle.tsx` | Amber pin button for pending fields | ~80 |

#### Form Field Components

| File | Purpose | Lines |
|------|---------|-------|
| `forms/fields/form-text-input.tsx` | Text input with CSSF label + pending toggle | ~120 |
| `forms/fields/form-select.tsx` | Dropdown select | ~100 |
| `forms/fields/form-textarea.tsx` | Multi-line textarea | ~110 |
| `forms/fields/form-date-picker.tsx` | Calendar date picker | ~130 |
| `forms/fields/form-radio-group.tsx` | Radio button group | ~90 |
| `forms/fields/form-multi-text.tsx` | Dynamic array of text inputs | ~150 |
| `forms/fields/form-sub-contractor.tsx` | Sub-contractor detail group | ~200 |

#### Navigation & Filtering

| File | Purpose | Lines |
|------|---------|-------|
| `view-segmented-control.tsx` | Main view switcher (Register/New Entry/Dashboard) | ~100 |
| `filter-panel.tsx` | Collapsible filter panel with quick/custom filters | ~300 |
| `quick-filters.tsx` | Critical and Cloud toggle buttons | ~60 |
| `custom-filter-row.tsx` | Individual filter row | ~200 |
| `active-filter-badges.tsx` | Active filter chips with remove buttons | ~100 |

#### Dashboard Components

| File | Purpose | Lines |
|------|---------|-------|
| `dashboard/dashboard-view.tsx` | Main dashboard container | ~70 |
| `dashboard/compliance-alerts.tsx` | Overdue/upcoming reviews alerts | ~280 |
| `dashboard/metrics-cards.tsx` | Key metrics cards (5 cards) | ~90 |
| `dashboard/upcoming-reviews-card.tsx` | Timeline of upcoming reviews | ~165 |
| `dashboard/critical-functions-card.tsx` | Critical supplier analysis | ~180 |
| `dashboard/data-completeness-card.tsx` | Data quality metrics | ~120 |
| `dashboard/charts/chart-container.tsx` | Reusable chart wrapper | ~25 |
| `dashboard/charts/status-pie-chart.tsx` | Status distribution pie chart | ~75 |
| `dashboard/charts/category-bar-chart.tsx` | Category breakdown bar chart | ~65 |
| `dashboard/charts/risk-bar-chart.tsx` | Risk level distribution | ~80 |
| `dashboard/tables/provider-concentration-table.tsx` | Provider concentration risk | ~115 |
| `dashboard/tables/geographic-distribution-table.tsx` | EU/Non-EU jurisdiction analysis | ~155 |
| `dashboard/tables/pending-notifications-list.tsx` | CSSF notification tracker | ~165 |

### `/lib` - Business Logic & Types

#### `/lib/types` - TypeScript Types

| File | Purpose |
|------|---------|
| `supplier.ts` | CSSF-compliant supplier types (SupplierOutsourcing, enums) |
| `filters.ts` | Filter field types, CustomFilter interface |
| `dashboard.ts` | Dashboard analytics type definitions (7 indicator types) |

**Key Type:** `SupplierOutsourcing`
```typescript
export interface SupplierOutsourcing extends MandatoryOutsourcingFields {
  criticalFields?: CriticalOutsourcingFields  // Point 55 (conditional)
  incompleteFields?: string[]                  // Incomplete field paths
  pendingFields?: string[]                     // Pending field paths
}
```

**Type System Design (Oct 30, 2025):**
The type definitions in `supplier.ts` are intentionally aligned with CSSF Circular 22/806 requirements:
- **Mandatory fields** (all except noted) are marked as **required** (no `?`)
- **CSSF-Optional fields** remain optional: `parentCompany?`, `legalEntityIdentifier?`
- **Conditional objects** remain optional: `cloudService?` (only when category=Cloud), `criticalFields?` (only when isCritical=true), `subOutsourcing?` (when declared)
- The type accurately reflects business logic in `checkIncompleteFields()`, which validates these fields as mandatory per CSSF requirements
- This alignment improves code clarity and eliminates defensive checks for guaranteed-to-exist fields

#### `/lib/data` - Dummy Data

| File | Purpose |
|------|---------|
| `suppliers.ts` | 5 sample suppliers (3 critical, 2 non-critical) |

#### `/lib/utils` - Utility Functions

| File | Purpose | Key Functions |
|------|---------|---------------|
| `check-completeness.ts` | Validates CSSF mandatory fields | `checkIncompleteFields()`, `generateNextReferenceNumber()` |
| `filter-suppliers.ts` | Filters suppliers by criteria | `filterSuppliers()` |
| `highlight-text.tsx` | Highlights search terms in text | `highlightText()` |
| `formatters.ts` | Date, currency formatting | `formatDate()`, `formatCurrency()` |
| `validators.ts` | Runtime validators | `isValidEmail()`, `isValidURL()` |
| `cn.ts` | Tailwind class merger | `cn()` (from clsx + tailwind-merge) |
| `dashboard-analytics.ts` | Dashboard analytics engine (11 calculation functions) | `getOverdueAssessments()`, `getUpcomingReviews()`, `getKeyMetrics()`, `getPendingFieldsMetrics()`, `getStatusBreakdown()`, `getCategoryBreakdown()`, `getRiskDistribution()`, `getProviderConcentration()`, `getGeographicDistribution()`, `getCriticalFunctionsAnalysis()`, `getRegulatoryNotificationStatus()` |

#### `/lib/validations` - Zod Schemas

| File | Purpose |
|------|---------|
| `supplier-schema.ts` | Zod schema for form validation (Layer 1) |

#### `/lib/contexts` - React Contexts

| File | Purpose |
|------|---------|
| `search-context.tsx` | Provides searchTerm for text highlighting |

### `/hooks` - Custom React Hooks

| File | Purpose |
|------|---------|
| `use-media-query.ts` | Responsive breakpoint detection |
| `use-local-storage.ts` | localStorage hook with SSR safety |
| `use-debounce.ts` | Debounced value updates |
| `use-api.ts` | API fetch hook (for future backend) |

---

## CSSF Compliance Mapping

### Point 53: Status of Outsourcing Arrangement

| Field | Type | Path | Implementation |
|-------|------|------|----------------|
| Status | Enum | `supplier.status` | `OutsourcingStatus` enum (Draft, Active, Not Yet Active, Terminated) |

### Point 54: Mandatory for ALL Outsourcing

**Total Fields: 23** (all suppliers must provide these)

| CSSF Point | Field | Type | Path |
|------------|-------|------|------|
| 54.a | Reference Number | string | `supplier.referenceNumber` |
| 54.b | Start Date | string (date) | `supplier.dates.startDate` |
| 54.b | Next Renewal Date | string? | `supplier.dates.nextRenewalDate` |
| 54.b | End Date | string? | `supplier.dates.endDate` |
| 54.b | Service Provider Notice Period | string? | `supplier.dates.serviceProviderNoticePeriod` |
| 54.b | Entity Notice Period | string? | `supplier.dates.entityNoticePeriod` |
| 54.c | Function Name | string | `supplier.functionDescription.name` |
| 54.c | Function Description | string | `supplier.functionDescription.description` |
| 54.c | Data Description | string | `supplier.functionDescription.dataDescription` |
| 54.c | Personal Data Involved | boolean | `supplier.functionDescription.personalDataInvolved` |
| 54.c | Personal Data Transferred | boolean | `supplier.functionDescription.personalDataTransferred` |
| 54.d | Category | enum | `supplier.category` |
| 54.e | Provider Name | string | `supplier.serviceProvider.name` |
| 54.e | Corporate Registration Number | string | `supplier.serviceProvider.corporateRegistrationNumber` |
| 54.e | LEI (if any) | string? | `supplier.serviceProvider.legalEntityIdentifier` |
| 54.e | Registered Address | string | `supplier.serviceProvider.registeredAddress` |
| 54.e | Contact Details | string | `supplier.serviceProvider.contactDetails` |
| 54.e | Parent Company (if any) | string? | `supplier.serviceProvider.parentCompany` |
| 54.f | Service Performance Countries | string[] | `supplier.location.servicePerformanceCountries` |
| 54.f | Data Location Country | string | `supplier.location.dataLocationCountry` |
| 54.f | Data Storage Location | string? | `supplier.location.dataStorageLocation` |
| 54.g | Is Critical | boolean | `supplier.criticality.isCritical` |
| 54.g | Criticality Reasons | string | `supplier.criticality.reasons` |
| 54.i | Criticality Assessment Date | string (date) | `supplier.criticalityAssessmentDate` |

### Point 54.h: Cloud Services (Conditional - 6 fields)

**Only required when `category === OutsourcingCategory.CLOUD`**

| Field | Type | Path |
|-------|------|------|
| Service Model | enum | `supplier.cloudService.serviceModel` |
| Deployment Model | enum | `supplier.cloudService.deploymentModel` |
| Data Nature | string | `supplier.cloudService.dataNature` |
| Storage Locations | string[] | `supplier.cloudService.storageLocations` |
| Cloud Officer (if any) | string? | `supplier.cloudService.cloudOfficer` |
| Resource Operator (if any) | string? | `supplier.cloudService.resourceOperator` |

### Point 55: Critical Functions (Conditional - 18+ fields)

**Only required when `criticality.isCritical === true`**

| CSSF Point | Field | Type | Path |
|------------|-------|------|------|
| 55.a | In-Scope Entities | string[] | `supplier.criticalFields.entitiesUsing.inScopeEntities` |
| 55.b | Part of Group | boolean | `supplier.criticalFields.groupRelationship.isPartOfGroup` |
| 55.b | Owned by Group | boolean | `supplier.criticalFields.groupRelationship.isOwnedByGroup` |
| 55.c | Risk Level | enum | `supplier.criticalFields.riskAssessment.risk` |
| 55.c | Last Assessment Date | string (date) | `supplier.criticalFields.riskAssessment.lastAssessmentDate` |
| 55.c | Summary Results | string | `supplier.criticalFields.riskAssessment.mainResults` |
| 55.d | Approver Name | string | `supplier.criticalFields.approval.approverName` |
| 55.d | Approver Role | string | `supplier.criticalFields.approval.approverRole` |
| 55.e | Governing Law | string | `supplier.criticalFields.governingLaw` |
| 55.f | Last Audit Date | string? (date) | `supplier.criticalFields.audit.lastAuditDate` |
| 55.f | Next Scheduled Audit | string? (date) | `supplier.criticalFields.audit.nextScheduledAudit` |
| 55.g | Sub-Contractors | array | `supplier.criticalFields.subOutsourcing.subContractors` |
| 55.h | Substitutability Outcome | enum | `supplier.criticalFields.substitutability.outcome` |
| 55.h | Reintegration Assessment | string | `supplier.criticalFields.substitutability.reintegrationAssessment` |
| 55.h | Discontinuation Impact | string | `supplier.criticalFields.substitutability.discontinuationImpact` |
| 55.i | Alternative Providers | string[] | `supplier.criticalFields.alternativeProviders` |
| 55.j | Time-Critical Function | boolean | `supplier.criticalFields.isTimeCritical` |
| 55.k | Estimated Annual Cost | number | `supplier.criticalFields.estimatedAnnualCost` |
| 55.k | Cost Comments | string? | `supplier.criticalFields.costComments` |
| 55.l | Prior Notification Date | string? (date) | `supplier.criticalFields.regulatoryNotification.notificationDate` |

**Total CSSF Fields: 73** (23 mandatory + 6 cloud + 18+ critical)

---

## Key Patterns & Conventions

### File Naming

- **Components:** kebab-case (e.g., `supplier-form-basic-info.tsx`)
- **Component Names:** PascalCase (e.g., `SupplierFormBasicInfo`)
- **Utils:** kebab-case (e.g., `check-completeness.ts`)
- **Functions:** camelCase (e.g., `checkIncompleteFields`)

### Component Structure

All components follow this structure:
```tsx
// 1. Imports (external first, then internal)
import { useState } from "react"
import { Button } from "@/components/ui/button"

// 2. Types/Interfaces
interface Props {
  // ...
}

// 3. Component
export function ComponentName({ prop }: Props) {
  // 4. State & Hooks
  const [state, setState] = useState()

  // 5. Event Handlers
  const handleClick = () => {}

  // 6. Render
  return <div>...</div>
}
```

### CSSF Annotations

All field labels include CSSF point references:
```tsx
<FormLabel>Provider Name (54.e)</FormLabel>
<FormLabel>Risk Level (55.c)</FormLabel>
```

### Semantic Colors

Use CSS variable tokens, not hardcoded colors:
```tsx
// ✅ Good
<div className="bg-primary text-primary-foreground">

// ❌ Bad
<div className="bg-blue-600 text-white">
```

**Available Tokens:**
- `--background` / `--foreground` - Page background and text
- `--primary` / `--primary-foreground` - Main brand color
- `--secondary` / `--secondary-foreground` - Secondary actions
- `--muted` / `--muted-foreground` - Subdued elements
- `--accent` / `--accent-foreground` - Highlights
- `--destructive` / `--destructive-foreground` - Errors, critical badges

### Conditional Rendering

**Cloud Services Tab:**
```tsx
{category === OutsourcingCategory.CLOUD && (
  <CloudServicesTab />
)}
```

**Critical Functions Tab:**
```tsx
{criticality?.isCritical === true && (
  <CriticalFunctionsTab />
)}
```

**Sub-Outsourcing:**
```tsx
{criticalFields?.subOutsourcing && (
  <SubContractorFields />
)}
```

---

## State Management

### Current Approach: Component State

**No global state management library** (Redux, Zustand, etc.) - Uses React's built-in state and context.

### State Locations

| State | Location | Purpose |
|-------|----------|---------|
| `suppliers` | `app/page.tsx` | Array of all suppliers (in-memory) |
| `activeView` | `ViewSegmentedControl` | Current view (Register/New Entry/Dashboard) |
| `filters` | `FilterPanel` | Active filters (quick + custom) |
| `expandedRowId` | `SupplierRegisterTable` | Which row is expanded |
| `activeTab` | `SupplierDetailTabs` | Active detail tab (Basic/Provider/Cloud/Critical) |
| `formValues` | `SupplierForm` (React Hook Form) | All form field values |
| `pendingFields` | `SupplierForm` | Set of pending field paths |
| `searchTerm` | `SearchContext` | Global text search term for highlighting |

### Context API Usage

**SearchContext:**
```tsx
// lib/contexts/search-context.tsx
export const SearchContext = createContext<SearchContextType>({
  searchTerm: null,
})

// Usage in detail tabs:
const { searchTerm } = useSearch()
<FieldDisplay value={value} searchTerm={searchTerm} />
```

### Future State Management (Phase 2)

When migrating to desktop app:
- Replace in-memory array with API calls
- Add React Query or SWR for server state
- Keep UI state local (expanded rows, active tabs, etc.)
- Add optimistic updates for better UX

---

## Form Architecture

### React Hook Form Integration

**Why React Hook Form?**
- Excellent TypeScript support
- Minimal re-renders (performance)
- Built-in validation with Zod
- Uncontrolled by default (better performance)

### Form Setup

```tsx
// components/shared/forms/supplier-form.tsx
const form = useForm<SupplierFormData>({
  resolver: zodResolver(supplierFormSchema),  // Zod schema (Layer 1)
  defaultValues: {
    referenceNumber: generateNextReferenceNumber(),
    status: OutsourcingStatus.DRAFT,
    // ... 71 more fields
  },
})
```

### Form Field Pattern

All form fields use shadcn's `FormField` wrapper:
```tsx
<FormField
  control={form.control}
  name="serviceProvider.name"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Provider Name (54.e)</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />  {/* Error message */}
    </FormItem>
  )}
/>
```

### Pending Fields Implementation

**Track with Set:**
```tsx
const [pendingFields, setPendingFields] = useState<Set<string>>(new Set())

const togglePending = (fieldPath: string) => {
  setPendingFields(prev => {
    const next = new Set(prev)
    if (next.has(fieldPath)) {
      next.delete(fieldPath)
    } else {
      next.add(fieldPath)
    }
    return next
  })
}
```

**Pending Toggle Button:**
```tsx
<PendingToggle
  fieldPath="serviceProvider.name"
  isPending={pendingFields.has("serviceProvider.name")}
  onToggle={togglePending}
/>
```

### Tab Navigation

**All Tabs Always Rendered:**
```tsx
// Even if Cloud tab is disabled, it's still in DOM
<div className={cn(activeTab === "cloud" ? "block" : "hidden")}>
  <CloudServicesTab />
</div>
```

**Why?** React Hook Form needs all fields registered for validation to work across hidden tabs.

### Form Submission Flow

```typescript
const handleSaveSupplier = () => {
  // 1. Get all form values
  const formData = form.getValues()

  // 2. Convert pending Set to array
  const pendingFieldsArray = Array.from(pendingFields)

  // 3. Run completeness checker (Layer 2)
  const result = checkIncompleteFields(formData, pendingFieldsArray)

  // 4. If incomplete, show dialog
  if (!result.isComplete) {
    setIncompleteFieldsList(result.labels)
    setShowIncompleteDialog(true)
    return
  }

  // 5. Save supplier
  const newSupplier: SupplierOutsourcing = {
    ...formData as SupplierOutsourcing,
    incompleteFields: [],
    pendingFields: pendingFieldsArray,
  }

  onAddSupplier(newSupplier)
  toast.success("Supplier added successfully!")
}
```

---

## Performance Considerations

### Current Performance

- **Good:** Small dataset (5 suppliers), fast renders
- **Good:** Minimal re-renders (React Hook Form uncontrolled)
- **Good:** No expensive operations (filtering, searching)

### Future Optimizations (When Scaling)

If managing 100+ suppliers:

1. **Virtualized Table** - Use `@tanstack/react-virtual` for large lists
2. **Memoization** - Wrap expensive components with `React.memo()`
3. **Debounced Search** - Already have `use-debounce.ts` hook
4. **Lazy Loading** - Code split form tabs
5. **Web Workers** - Offload filtering/searching to worker thread

---

## Testing Strategy (Not Implemented Yet)

### Recommended Approach

1. **Unit Tests** (Vitest)
   - Test `checkIncompleteFields()` logic
   - Test `filterSuppliers()` with various filters
   - Test `highlightText()` edge cases

2. **Component Tests** (React Testing Library)
   - Test form validation flows
   - Test filter interactions
   - Test pending field toggle

3. **E2E Tests** (Playwright)
   - Test full add supplier flow
   - Test edit/duplicate/delete
   - Test filter + search combinations

---

## Common Questions

### Q: Why no backend?
**A:** Phase 1 is a frontend demo. Phase 2 will add Tauri + SQLite for desktop app.

### Q: Why are all Zod fields `.optional()`?
**A:** To support partial saves and pending fields. Mandatory validation happens in Layer 2 (check-completeness.ts).

### Q: Why are all tabs always rendered?
**A:** React Hook Form needs all fields registered for cross-tab validation. Hidden tabs use `className="hidden"` not conditional rendering.

### Q: How do pending fields skip validation?
**A:** The completeness checker accepts a `pendingFields` array and skips those field paths.

### Q: Where is data persistence?
**A:** Not implemented yet. Planned for roadmap (sessionStorage or localStorage).

---

**Last Updated:** 2025-10-25
**Related Files:** VALIDATION.md, ROADMAP.md, supplier.ts, check-completeness.ts
