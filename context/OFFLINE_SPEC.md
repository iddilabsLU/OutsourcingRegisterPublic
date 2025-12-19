# Offline Desktop Application Specification

**Target:** Windows desktop application (.exe installer)
**Database:** SQLite with better-sqlite3
**Status:** Phase 2 - Core Complete ✅ (Started: 2025-12-02, Core Complete: 2025-12-05, Packaging delivered: 2025-12-09)

---

## 🎯 Overview

Convert the web-based demo into a Windows desktop application with SQLite database for persistent, offline data storage. The application will support single-user or small team usage (up to 5 users) via shared network drive.

---

## 🏗️ Technical Architecture

### Desktop Framework
- **Electron** - Cross-platform desktop framework (targets Windows primarily)
- **Next.js 15** - Reuse existing frontend (100% code reuse)
- **Main Process** - Electron main process handles database operations
- **Renderer Process** - Next.js app runs in Electron window

### Database
- **SQLite** - Single-file database for portability
- **better-sqlite3** - Synchronous SQLite binding for Node.js (fast, simple API)
- **File Location:** Configurable (default: `%APPDATA%/OutsourcingRegister/suppliers.db`)

### Communication Layer
- **Electron IPC** - Inter-Process Communication between renderer and main
- **Context Bridge** - Secure API exposure to frontend
- **Preload Script** - Defines `window.electronAPI` for database calls

---

## 👥 User Scenarios

### Scenario 1: Single User (Local Storage)
- **Database Location:** `C:\Users\<username>\AppData\Roaming\OutsourcingRegister\suppliers.db`
- **Access:** Only the user on that Windows machine
- **Use Case:** Individual compliance officer managing supplier register

### Scenario 2: Multi-User (Network Drive)
- **Database Location:** `\\NetworkShare\OutsourcingRegister\suppliers.db` (configurable)
- **Access:** Up to 5 users with read/write access to the network folder
- **Use Case:** Small compliance team sharing the same register
- **Limitations:**
  - No authentication (all users have full access)
  - No roles or permissions
  - No concurrent write locking (SQLite handles basic locking)
  - Network drive must be accessible to all users

---

## 🔐 Authentication & Permissions

**Phase 2 Scope:** No authentication, no roles

- All users have full access (Create, Read, Update, Delete)
- No user tracking or audit trail (Phase 3+ feature)
- No login screen or user management UI

**Rationale:** Keep Phase 2 simple. Focus on core functionality (database persistence, multi-user file access). Add authentication in future phase if needed.

---

## 💾 Database Schema

**Principle:** 1:1 mapping to `lib/types/supplier.ts` TypeScript types

### Table: `suppliers`

Maps to `SupplierOutsourcing` interface from `lib/types/supplier.ts`

**Schema Design:**
```sql
CREATE TABLE suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  reference_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL,
  category TEXT NOT NULL,

  -- Dates (54.b)
  start_date TEXT NOT NULL,
  next_renewal_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  service_provider_notice_period TEXT NOT NULL,
  entity_notice_period TEXT NOT NULL,

  -- Function Description (54.c)
  function_name TEXT NOT NULL,
  function_description TEXT NOT NULL,
  data_description TEXT NOT NULL,
  personal_data_involved INTEGER NOT NULL,
  personal_data_transferred INTEGER NOT NULL,

  -- Service Provider (54.e)
  provider_name TEXT NOT NULL,
  corporate_registration_number TEXT NOT NULL,
  legal_entity_identifier TEXT,
  registered_address TEXT NOT NULL,
  contact_details TEXT NOT NULL,
  parent_company TEXT,

  -- Location (54.f)
  service_performance_countries TEXT NOT NULL, -- JSON array
  data_location_country TEXT NOT NULL, -- JSON array
  other_data_location_info TEXT NOT NULL,

  -- Criticality (54.g, 54.i)
  is_critical INTEGER NOT NULL,
  criticality_reasons TEXT NOT NULL,
  criticality_assessment_date TEXT NOT NULL,

  -- Cloud Service (54.h) - conditional, nullable
  cloud_service_model TEXT,
  cloud_deployment_model TEXT,
  cloud_data_nature TEXT,
  cloud_storage_locations TEXT, -- JSON array
  cloud_officer TEXT,
  cloud_resource_operator TEXT,

  -- Critical Fields (Point 55) - conditional, nullable
  -- Store as JSON blob for simplicity
  critical_fields TEXT, -- JSON object or NULL

  -- Tracking fields
  incomplete_fields TEXT, -- JSON array
  pending_fields TEXT, -- JSON array

  -- Metadata
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_status ON suppliers(status);
CREATE INDEX idx_category ON suppliers(category);
CREATE INDEX idx_is_critical ON suppliers(is_critical);
CREATE INDEX idx_provider_name ON suppliers(provider_name);
```

**JSON Fields:**
- `service_performance_countries` - Store as JSON array: `["Luxembourg", "France"]`
- `data_location_country` - Store as JSON array: `["Luxembourg"]`
- `cloud_storage_locations` - Store as JSON array: `["EU-West-1"]`
- `critical_fields` - Store entire `CriticalOutsourcingFields` object as JSON
- `incomplete_fields` - Store as JSON array: `["dates.startDate", "serviceProvider.name"]`
- `pending_fields` - Store as JSON array: `["referenceNumber", "criticalFields.riskAssessment.risk"]`

**Rationale:**
- Simple, single-table design (avoid complex joins for Phase 2)
- JSON fields for arrays/objects (SQLite supports JSON functions)
- 1:1 mapping to TypeScript types (easy serialization/deserialization)
- Metadata fields for future audit trail (Phase 3+)

---

## 🔄 Initial Database Setup

**Current State:** Desktop-only application with SQLite database
**Database Location:** `data/suppliers.db`

### First Launch:
1. **Database Creation:** SQLite database file is created automatically
2. **Schema Initialization:** All tables and indexes are created
3. **Sample Data Seeding:** 5 sample suppliers are seeded on first launch only
4. **Subsequent Launches:** No re-seeding (uses schema_version table tracking)

**Seeding Strategy:**
- Seeds 5 sample CSSF-compliant suppliers on first app launch
- Uses `schema_version` table (version 2) to track seeding status
- Does NOT re-seed if user deletes all suppliers
- Provides realistic demo data for testing and exploration

**Data Import:** Users can import their own data from Excel (bulk import feature - to be implemented)

---

## ✅ Core Features - All Working

All existing features have been successfully migrated to desktop application:

### Fully Implemented
- ✅ **View Suppliers** - Register table with expand/collapse rows
- ✅ **Add Supplier** - 4-tab form with all 73 CSSF fields
- ✅ **Edit Supplier** - Pre-filled form, reference number locked
- ✅ **Delete Supplier** - Confirmation dialog, toast notification
- ✅ **Duplicate Supplier** - Clone with new reference number
- ✅ **Filtering** - Quick filters, custom filters, global text search
- ✅ **Dashboard** - 7 indicators, charts, risk analysis
- ✅ **Export** - Excel (compact/full), PDF (compact)
- ✅ **Validation** - Two-layer system (required fields + pending fields)
- ✅ **Pending Fields** - Mark incomplete fields, skip validation
- ✅ **CSSF References** - Interactive popovers with regulatory text
- ✅ **Provider Autocomplete** - Dropdown of existing supplier names
- ✅ **Country Selection** - Multiple country dropdown (~195 countries)

**Implementation Status:**
- ✅ All React components connected to SQLite database via `hooks/use-database.ts`
- ✅ Electron IPC bridge working for all CRUD operations
- ✅ Desktop-only architecture (no browser fallback)
- ✅ Error handling and loading states implemented
- ✅ Toast notifications for all operations

---

## 🆕 New Features (Phase 2)

### 1. Backup & Restore System ✅ COMPLETED (2025-12-19)

**Goal:** Allow users to backup and restore their complete dataset with flexibility

**UI Location:** Settings tab → Backup & Restore card

#### Create Backup
**Functionality:**
- Button: "Create Backup"
- Action: Opens save dialog for user to choose location
- Default filename: `SupplierRegister_Backup_YYYY-MM-DD.zip`
- Creates ZIP containing:
  - `database.db` - Complete SQLite database
  - `Suppliers.xlsx` - All supplier records
  - `Events.xlsx` - Change log
  - `Issues.xlsx` - Issue tracker
  - `CriticalMonitor.xlsx` - Critical outsourcing monitor data
- Success toast with backup path

**Implementation:**
```typescript
// electron/database/backup.ts
export async function createBackupZip(zipPath: string): Promise<BackupResult> {
  1. Create temp directory
  2. Close database connection
  3. Copy database.db file
  4. Reopen database
  5. Generate 4 Excel exports using XLSX library
  6. Create ZIP archive using archiver
  7. Clean up temp directory
  return { success: true, path: zipPath, files: [...] }
}
```

#### Restore from Backup
**Functionality:**
- Button: "Select Backup File"
- Action: Opens file picker to select backup ZIP
- Two-step confirmation dialog:

  **Step 1: Choose Restore Method**
  - **From Database** - Fast and exact (uses database.db file)
  - **From Excel** - Use if you manually edited the Excel files

  **Step 2: Select Data to Restore** (Selective Restore)
  - ☑ Suppliers
  - ☑ Events (Change Log)
  - ☑ Issues
  - ☑ Critical Monitor
  - Select/deselect individual data types or all

- Warning: "Selected data will be replaced. This action cannot be undone."
- Button: "Restore Selected Data"
- Success toast with stats (X suppliers, Y events, etc.)
- Page reload to reflect restored data

**Implementation:**
```typescript
// electron/database/backup.ts

// Database restore (fast, exact)
export async function restoreFromDatabaseBackup(
  zipPath: string,
  options: RestoreOptions
): Promise<RestoreResult> {
  1. Extract ZIP to temp directory
  2. If ALL options selected: Replace entire database (fastest path)
  3. If SELECTIVE: Open backup DB, read selected tables, import to main DB
  4. Return stats: { suppliers: X, events: Y, issues: Z, criticalMonitor: W }
}

// Excel restore (for manual edits)
export async function restoreFromExcelBackup(
  zipPath: string,
  options: RestoreOptions
): Promise<RestoreResult> {
  1. Extract ZIP to temp directory
  2. Parse selected Excel files (XLSX library)
  3. Delete selected tables in main DB
  4. Import parsed records
  5. Return stats
}
```

**Info Section in UI:**
- Explains ZIP contents (database + 4 Excel files)
- Clarifies difference between restore methods:
  - Database restore: Fastest and most accurate
  - Excel restore: Use only if you manually edited the Excel files in the backup

---

## 📦 Packaging & Distribution (Completed)

### Installer Requirements
- **Target:** Windows 10/11 (64-bit)
- **Installer Type:** `.exe` installer (not `.msi`)
- **Installer Tool:** Electron Builder
- **Installation Path:** `C:\Program Files\OutsourcingRegister`
- **Start Menu:** Add shortcut to Start Menu
- **Desktop Icon:** Optional (ask during install)
- **Uninstaller:** Standard Windows uninstaller

### Build Configuration
```json
// package.json
{
  "build": {
    "appId": "com.outsourcingregister.app",
    "productName": "Supplier Outsourcing Register",
    "win": {
      "target": ["nsis"],
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": "always"
    }
  }
}
```

### Testing Checklist
- [x] Install on Windows 11 (dev box)
- [x] Test local database creation
- [x] Test uninstaller
- [x] Test backup/restore (database and Excel methods)
- [ ] Install on clean Windows 10/11 machine
- [ ] Test network drive database access (multi-user scenario)
- [ ] Test all CRUD operations in packaged app
- [ ] Write user documentation (installation, backup procedures, multi-user setup)

---

## 🚧 Out of Scope (Phase 2)

These features will **NOT** be implemented in Phase 2:

- ❌ User authentication (login/logout)
- ❌ User roles and permissions (admin vs viewer)
- ❌ Audit trail (who changed what, when)
- ❌ Concurrent write conflict resolution
- ❌ Real-time sync across users
- ❌ Cloud backup (Google Drive, Dropbox)
- ❌ Mobile app (Android/iOS)
- ❌ Web version integration (sync between web and desktop)
- ❌ macOS or Linux installers
- ❌ Auto-updates (download new version manually)

**Rationale:** Keep Phase 2 focused on core offline functionality. Add advanced features in Phase 3+ if needed.

---

## 📋 Success Criteria

### Core Functionality (Complete) ✅
1. ✅ App launches and displays supplier register table
2. ✅ User can add, edit, delete, duplicate suppliers
3. ✅ All Phase 1 features work identically (filtering, dashboard, export, validation)
4. ✅ Data persists after app restart (SQLite database)
5. ✅ Desktop-only architecture (no browser fallback)

### Remaining Work (Testing & Deployment)
6. ✅ Windows installer (.exe) - COMPLETED
7. ✅ User can backup database to external file - COMPLETED
8. ✅ User can restore database from backup file - COMPLETED
9. ⏳ Test installer on clean Windows machine
10. ⏳ Test multi-user scenario (shared network database)
11. ⏳ Write user documentation

---

## 🔗 Related Files

- **[ROADMAP.md](ROADMAP.md)** - Phase 2 implementation steps
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Frontend architecture (reused 100%)
- **[VALIDATION.md](VALIDATION.md)** - Validation system (unchanged)
- **[lib/types/supplier.ts](../lib/types/supplier.ts)** - TypeScript types (1:1 mapping to database schema)

---

**Created:** 2025-12-02
**Last Updated:** 2025-12-19
**Status:** Phase 2 - Complete ✅ (All features implemented)
**Next Step:** Testing & Deployment (clean machine testing, multi-user testing, documentation)
