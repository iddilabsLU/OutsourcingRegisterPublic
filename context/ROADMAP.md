# Product Roadmap

This document outlines the planned features and priorities for the Supplier Register application.

---

## Current Status

**Desktop Application - FULLY FUNCTIONAL** ✅

### What's Working:
- ✅ Supplier Register Table with expand/collapse rows
- ✅ 4-tab detail view (Basic Info, Provider, Cloud, Critical)
- ✅ **Add Supplier Form** - Complete 4-tab form with all 73 CSSF fields
- ✅ **Edit Supplier Form** - Edit existing suppliers with pre-filled data
- ✅ **Delete Supplier** - Remove suppliers with confirmation dialog and toast notification
- ✅ **Duplicate Supplier** - Instantly clone suppliers with new reference number and Draft status
- ✅ **Data Persistence** - SQLite database (`data/suppliers.db`) with automatic persistence
- ✅ **Dashboard Analytics** - 7 CSSF compliance indicators with charts, tables, and risk management
- ✅ **Reporting Tab** - Change log auto-built from supplier updates (pending-safe) + issue tracker with status/severity/owner/due dates
- ✅ **Pending Fields Feature** - Mark incomplete fields, skip validation, amber badges
- ✅ **Form Validation** - Two-layer system (see `VALIDATION.md`)
- ✅ **Save as Draft** - Auto-marks empty required fields as pending
- ✅ **Filtering System** - Quick filters, custom filters, global text search with highlighting
- ✅ **View Navigation** - Segmented control (Register List / New Entry / Dashboard / Reporting)
- ✅ **Export Functionality** - Export to Excel (compact/full) or PDF (compact)
- ✅ **CSSF Compliance** - All 73 fields from Circular 22/806 Points 53, 54, 55

*Desktop application with SQLite database is fully functional.*

---

## Phase 1: Frontend Completion ✅ COMPLETE

All Phase 1 features have been implemented and are working correctly.

---

### 1. Dashboard View ✅ COMPLETED (2025-11-03)

**Goal:** Analytics and insights for compliance officers

**Implemented Features:**

**Phase 1: MVP Dashboard**
- Compliance alerts (overdue reviews, upcoming reviews, missing notifications)
- Key metrics cards (Total, Critical %, Cloud %, Pending %, Completeness)
- Status pie chart and category bar chart

**Phase 2: Risk Management**
- Risk distribution chart (High/Medium/Low for critical suppliers)
- Upcoming reviews timeline (30/90-day groupings)
- Provider concentration table (risk thresholds: >35% High, ≥20% Medium, <20% Low)
- Geographic distribution (EU/EEA/Non-EU jurisdiction analysis)

**Phase 3: Deep Dive Analytics**
- Critical functions analysis (group relationships, substitutability, sub-outsourcing)
- Regulatory notification tracker (CSSF Point 55.l compliance)
- Data completeness metrics with progress tracking

**Technical Implementation:**
- 17 new components (charts/, tables/, cards structure)
- Analytics engine (lib/utils/dashboard-analytics.ts - 702 lines)
- Recharts for data visualization
- Progress component with Radix UI
- Filters fully integrated (dashboard updates with applied filters)

**Actual Effort:** ~8 hours (phases 1-3 completed)
**CSSF Coverage:** Points 53, 54.i, 54.f, 54.d, 55.c, 55.f, 55.l
**Status:** ✅ Core functionality complete, minor UI refinements pending

---

### 1.5 Reporting & Issues ✅ COMPLETED (2025-12-10)

**Goal:** Support management reporting with a curated change log and lightweight issue tracking without duplicating data entry.

**Implemented Features:**
- New Reporting tab (segmented control) with 30/90/all/custom range filters and KPI cards (events, open issues, closed-in-period, risk changes)
- Event log auto-generated from supplier updates (status, risk, criticality flag/assessment date, last risk assessment date, notification date, start/renewal/end dates, supplier creation)
- Pending fields are respected (pending items do not create events)
- Manual event add/edit/delete
- Issue tracker with category/status/severity/owner/due date plus optional supplier/function tags; status updates, edit, delete, and follow-ups supported
- Critical Outsourcing Monitor: displays critical active suppliers with inline editing for 4 user-input fields (contract, suitability assessment date, audit reports, CO & RO assessment date); includes provider and category filters; Excel export

**Technical Implementation:**
- New SQLite tables: `events`, `issues` (migration `migrate-add-events-issues.ts`), `critical_monitor` (migration `migrate-add-critical-monitor.ts`)
- Added follow-ups and category columns via migrations; stored as JSON
- Event builder in Electron main process to diff supplier changes (`electron/database/event-builder.ts`), invoked on add/update supplier
- Critical Monitor CRUD operations in `electron/database/critical-monitor.ts`
- IPC + preload surface event/issue/critical monitor CRUD; renderer hook `use-reporting` fetches data
- UI: `components/shared/reporting/reporting-view.tsx` with period filter (including custom range), search, lists, manual event logging, follow-ups, issue composer, and Critical Monitor section
- Excel export functions: `exportEventsToExcel()`, `exportIssuesToExcel()`, `exportCriticalMonitorToExcel()` in `lib/utils/export-reporting.ts`

**Status:** ✅ Complete

---

### 2. Export Functionality ✅ COMPLETED

**Goal:** Export supplier data to Excel/PDF

#### Excel Export (.xlsx)
**Library:** SheetJS (xlsx)

**Features:**
- Export all suppliers or filtered results
- One row per supplier
- All 73 CSSF fields as columns
- Column headers with CSSF references (e.g., "Provider Name (54.e)")
- Conditional columns (Cloud/Critical fields)
- Auto-column width
- Header row bold + background color

**Implementation:**
```typescript
import * as XLSX from 'xlsx'

function exportToExcel(suppliers: SupplierOutsourcing[]) {
  const data = suppliers.map(supplier => ({
    'Reference Number (54.a)': supplier.referenceNumber,
    'Status (53)': supplier.status,
    'Provider Name (54.e)': supplier.serviceProvider.name,
    // ... map all 73 fields
  }))

  const worksheet = XLSX.utils.json_to_sheet(data)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers')
  XLSX.writeFile(workbook, 'supplier-register.xlsx')
}
```

#### PDF Export
**Library:** jsPDF + jsPDF-AutoTable (recommended) or react-pdf

**Features:**
- Export all suppliers or filtered results
- Table format with all fields
- Multi-page support
- Header: "CSSF Supplier Outsourcing Register"
- Footer: Page numbers, export date
- Conditional sections (show Cloud/Critical only if applicable)

**Implementation:**
```typescript
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

function exportToPDF(suppliers: SupplierOutsourcing[]) {
  const doc = new jsPDF({ orientation: 'landscape' })

  doc.text('CSSF Supplier Outsourcing Register', 14, 15)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 22)

  const tableData = suppliers.map(s => [
    s.referenceNumber,
    s.serviceProvider.name,
    s.category,
    s.status,
    s.criticality.isCritical ? 'Yes' : 'No',
    // ... key fields
  ])

  autoTable(doc, {
    head: [['Ref', 'Provider', 'Category', 'Status', 'Critical', ...]],
    body: tableData,
    startY: 25,
  })

  doc.save('supplier-register.pdf')
}
```

**Files to Create:**
- `lib/utils/export-excel.ts` - Excel export logic
- `lib/utils/export-pdf.ts` - PDF export logic
- `components/shared/export-menu.tsx` - Export dropdown button

**Files to Modify:**
- `components/shared/supplier-register-table.tsx` - Add export button

**Estimated Effort:** 3-4 hours (Actual: ~4 hours)

**Status:** ✅ COMPLETED (2025-10-31)
- Excel export: Summary (8 columns) + Full (52 fields) ✅
- PDF export: Summary (8 columns) only ✅
- Full PDF intentionally removed (layout too messy for 52 fields)
- Both formats support filtered results
- Export feature complete (Phase 1-4 of ExportFunctionPlan.md)

---

## Phase 2: Desktop Application (IN PROGRESS)

**Status:** In Progress
**Started:** 2025-12-02

### Goals:
- Package web app as Windows desktop application
- Add local SQLite database for persistent storage
- Support full CRUD operations offline
- Multi-user support (up to 5 users via shared network drive)
- Data import from Excel, export to Excel/PDF
- Database backup/restore functionality

### Technology Stack:
- **Electron** - Cross-platform desktop framework
- **SQLite** - Local database (single file)
- **better-sqlite3** - Fast, synchronous SQLite binding for Node.js
- **Existing Next.js frontend** - Reuse 100% of current UI

### Implementation Steps:

#### Step 1: Project Setup ✅ COMPLETED (2025-12-02)
- [x] Install Electron and dependencies
- [x] Configure Electron with Next.js (main process + renderer)
- [x] Set up development and build scripts
- [x] Test basic Electron window with Next.js app

**Notes:**
- Fixed package.json main entry point: `dist-electron/electron/main.js`
- Updated electron:compile script to copy schema.sql to correct path
- TypeScript compilation preserves full directory structure from root

#### Step 2: Database Design ✅ COMPLETED (2025-12-02)
- [x] Design SQLite schema (1:1 mapping to `lib/types/supplier.ts`)
- [x] Create database initialization script
- [x] Implement database connection management
- [x] Add database file location configuration (local AppData / network drive)

**Implementation Details:**
- Database file: `data/suppliers.db`
- Schema: `electron/database/schema.sql` (comprehensive CSSF-compliant schema)
- CRUD functions: `electron/database/suppliers.ts` (toDbRow, fromDbRow, getAllSuppliers, addSupplier, updateSupplier, deleteSupplier)
- Seeding: `electron/database/seed.ts` (seeds all 5 suppliers from lib/data/suppliers.ts)
- Connection management: `electron/database/db.ts` (WAL mode, foreign keys enabled)

**Database Seeding:**
- All 5 suppliers copied inline to seed.ts (avoids frontend import issues)
- Seeds only ONCE on first app launch (uses schema_version table tracking)
- Does NOT re-seed if user deletes all suppliers
- Logs each supplier added with reference number and provider name

#### Step 3: API Layer ✅ COMPLETED (2025-12-02)
- [x] Create IPC (Inter-Process Communication) handlers for Electron
- [x] Implement CRUD operations: Create, Read, Update, Delete suppliers
- Filtering, searching, sorting: Handled in frontend (loads all suppliers, filters in JavaScript)
- Dashboard analytics: Calculated in frontend from getAllSuppliers() data

**Implementation Details:**
- CRUD functions: `getAllSuppliers()`, `getSupplierByReference()`, `addSupplier()`, `updateSupplier()`, `deleteSupplier()`, `getNextReferenceNumber()`, `getSuppliersCount()`
- Type conversion: `toDbRow()` converts TypeScript objects to flat SQLite rows, `fromDbRow()` reconstructs nested objects
- All operations are synchronous using better-sqlite3
- Small dataset approach: Frontend loads all suppliers once, handles filtering/sorting in JavaScript (optimal for <1000 records)

#### Step 4: React Integration ✅ COMPLETED (2025-12-05)
- [x] Replaced sessionStorage with Electron IPC calls
- [x] Created `hooks/use-database.ts` hook for all database operations
- [x] Updated `app/suppliers/page.tsx` to use useDatabase hook
- [x] All CRUD operations working (Add, Edit, Delete, Duplicate)
- [x] Removed browser fallback code (desktop-only app)
- [x] All features tested: filtering, export, dashboard analytics

**Implementation Details:**
- Created useDatabase hook with: loadSuppliersFromSource, addSupplier, updateSupplier, deleteSupplier, duplicateSupplier
- All operations async with proper error handling and toast notifications
- Loading states implemented for better UX
- Database auto-refreshes after CRUD operations
- Desktop-only: App requires Electron, throws error if run in browser

#### Step 5: New Features
- [ ] Database backup functionality (copy .sqlite file)
- [ ] Database restore functionality (replace .sqlite file)
- [ ] Excel import (bulk import suppliers)
- [ ] Data location configuration UI (choose local or network path)

#### Step 6: Packaging & Distribution
- [x] Configure Electron Builder for Windows
- [x] Create Windows installer (.exe)
- [ ] Test installer on clean Windows machine
- [ ] Write user documentation (installation, backup, network setup)

### Architecture Notes:
- **Database File:** Single `.sqlite` file (portable, easy to backup)
- **Multi-User:** Share database file via network drive (Windows file share)
- **No Authentication:** All users have full access (Phase 2 scope)
- **No Roles:** Single permission level for all users (Phase 2 scope)

---

## Future Enhancements (Backlog)

### User Experience
- **Sort table columns** - Click column headers to sort
- **Column visibility toggle** - Show/hide columns
- **Bulk actions** - Select multiple suppliers, delete/export in bulk
- **Print view** - Print-friendly table format
- **Keyboard shortcuts** - Power user navigation

### Compliance Features
- **Audit trail** - Track all changes to suppliers (who, when, what changed)
- **Version history** - Revert to previous versions
- **Approval workflow** - Require manager approval for critical suppliers
- **Reminders** - Email notifications for upcoming renewals/audits
- **Risk monitoring** - Flag suppliers with overdue audits

### Data Management
- **Import from Excel** - Bulk import suppliers
- **Data validation rules** - Custom business rules per field
- **Duplicate detection** - Warn when adding similar suppliers
- **Archive suppliers** - Soft delete instead of hard delete

### Integration
- **API access** - RESTful API for third-party integrations
- **Webhook notifications** - Real-time updates
- **CSSF reporting** - Direct export to CSSF format
- **Active Directory integration** - Corporate user management

---

## Priority Matrix

| Feature | Priority | Effort | Impact | Status |
|---------|----------|--------|--------|--------|
| Edit Supplier | 🔥 High | 2h | High | ✅ Done |
| Data Persistence | 🔥 High | 1-2h | High | ✅ Done |
| Delete Supplier | 🔸 Medium | 30m | Medium | ✅ Done |
| Duplicate Supplier | 🔸 Medium | 1h | Medium | ✅ Done |
| Export (Excel/PDF) | 🔸 Medium | 3-4h | Medium | ✅ Done |
| Dashboard View | 🔹 Low | 8h | High | ✅ Done |
| Desktop App (Tauri) | 🔹 Future | 2-3w | High | Not Started |

---

## Next Steps (Immediate)

**Desktop Application - Core Complete** ✅

### Current Focus:
**Step 5: New Features** - Database backup/restore, Excel import, data location configuration

### Completed Milestones:
- [x] Step 1: Project Setup (Electron + Next.js) ✅
- [x] Step 2: Database Design (SQLite schema) ✅
- [x] Step 3: API Layer (IPC handlers, CRUD operations) ✅
- [x] Step 4: React Integration (useDatabase hook, desktop-only) ✅

### Next Milestones:
- [ ] Step 5: New Features (backup, restore, Excel import)
- [x] Step 6: Packaging (Windows installer)

See Phase 2 section above for detailed implementation steps.

### Optional Backlog Features (Phase 3+)
- Sort table columns by clicking headers
- Column visibility toggle
- Bulk actions (select multiple, export/delete in bulk)
- Print-friendly view
- Keyboard shortcuts for power users
- Audit trail and version history
- Email reminders for upcoming renewals
- User authentication and roles

---

**Last Updated:** 2025-12-17
**Phase Status:** Phase 2 - Core Complete ✅
**Current Priority:** New Features (Step 5: Backup/Restore, Excel Import)
**Related Files:** CLAUDE.md, OFFLINE_SPEC.md, VALIDATION.md, ARCHITECTURE.md
