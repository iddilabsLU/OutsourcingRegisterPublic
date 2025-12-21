# Supplier Outsourcing Register

A **cross-platform desktop application** for managing supplier outsourcing arrangements in compliance with **CSSF Circular 22/806 Section 4.2.7**. Built with Electron, Next.js 15, React 19, TypeScript, and SQLite.

> **Desktop-Only Application**
> Requires Electron to run. Uses SQLite for persistence.
> **Run with:** `npm run electron:dev`

---

## 🚀 Quick Overview

**Purpose:** CSSF-compliant supplier outsourcing register for Luxembourg financial institutions
**Platforms:** Windows and Linux (desktop application)
**Database:** SQLite (local database file: `data/suppliers.db`)
**User:** Non-technical user relying on Claude Code for all development

---

## 🧭 Quick Start

```bash
npm run electron:dev         # Start desktop app (dev)
npm run electron:build       # Build all platforms (Windows + Linux)
npm run electron:build:win   # Build Windows only (.exe + unpacked)
npm run electron:build:linux # Build Linux only (.AppImage + .deb + unpacked)
npm run electron:compile     # Compile Electron TS + copy schema
npm run lint                 # Lint
```

**Note:** Runs only in Electron. Build commands produce platform-specific installers.

---

## 🧰 Tech Stack

- **Desktop:** Electron (main + renderer process)
- **Framework:** Next.js 15.5.9 (App Router, Turbopack)
- **React:** 19.1.4
- **Language:** TypeScript 5
- **Database:** SQLite + better-sqlite3 (synchronous operations)
- **Styling:** Tailwind CSS 4
- **UI:** shadcn/ui (25+ components) + Lucide icons
- **Forms:** React Hook Form + Zod
- **Theme:** Light mode only

---

## ✅ Current Status (Updated: 2025-12-21)

**Desktop Application - FULLY FUNCTIONAL**

### What Works
- Supplier register table with filters/search
- Add/Edit/Delete/Duplicate suppliers
- SQLite persistence
- Dashboard analytics (7 indicators)
- Reporting tab with 3 sections:
  - Auto-generated change log with manual event add/edit/delete
  - Issue tracker with categories, lifecycle, due dates, follow-ups
  - Critical Outsourcing Monitor for critical active suppliers (inline editing, filters, Excel export)
- Export to Excel (compact/full, events, issues, critical monitor) & PDF (compact)
- Pending fields + validation layers
- Desktop packaging: installer generated via `npm run electron:build`
- Authentication with RBAC, optional, can be enabled/disabled, 3 user roles: Viewer (read only-access), Editor (full edit access), Admin Role (editor + user management)
- **Backup & Restore system** (Settings tab) with hybrid restore options
- **Configurable database location** (Settings tab) for multi-user network setups

### Recent Changes
- **Database Location Setting** (Settings tab)
  - Configure custom database path (e.g., network share `\\server\share\data.db`)
  - Enables multi-user access for companies
  - All users can view and change database path (to connect to shared database)
  - Only Admins can copy existing data to new location
  - Path validation before applying
  - App restart required after changing location
- **Backup & Restore System** (Settings tab)
  - Create backup: Database file + 4 Excel exports (Suppliers, Events, Issues, Critical Monitor)
  - Restore with options:
    - **From Database:** Fast, exact restoration using database.db file
    - **From Excel:** Use if you manually edited the Excel files in the backup
  - **Selective restore:** Choose which data to restore (Suppliers, Events, Issues, Critical Monitor)
  - ZIP format: `OutsourcingRegister_Backup_YYYY-MM-DD.zip`
  - User chooses save/load location via file dialogs
  - Info section explains difference between restore methods
- **Authentication System** with Role-Based Access Control (RBAC)
  - 3 roles: Admin (full access + user management), Editor (edit access), Viewer (read-only)
  - Settings tab to enable/disable authentication
  - User management (create, edit, delete users)
  - Master password recovery for emergency access
  - "Remember me" session persistence
  - Default credentials when enabled: `admin` / `admin`
  - Master override password: `master123` (change immediately)
  - **RBAC Enforcement:**
    - Viewers: Hidden "New Entry" tab, no edit controls in Reporting, no 3-dots menu in register
    - Editors: Full edit access to suppliers and reporting
    - Admins: User management + all editor permissions
- Critical Outsourcing Monitor (new section in Reporting tab)
- Issue category field added to issue tracker
- Excel export for events, issues, and critical monitor data

---

## 📚 Documentation

- `context/ARCHITECTURE.md` — architecture overview
- `context/VALIDATION.md` — validation approach
- `context/ROADMAP.md` — implementation steps and milestones
- `context/OFFLINE_SPEC.md` — offline/desktop requirements
- `context/ELECTRON_PACKAGING.md` — packaging instructions, pitfalls, artifacts
- `context/completed/` — archived plans/PRDs

---

## 🎯 Next Steps

**Phase 2 Complete ✅** - All core features implemented

**Testing & Deployment:**
- Test installer on clean Windows machine
- Test multi-user scenario (shared network database)
- Write user documentation (installation, backup procedures, multi-user setup)

**Future Enhancements (Optional):**
- Backend permission validation (IPC handler security)
- Audit log for change tracking
- Excel import for bulk supplier creation

**Electron Notes**
- Main entry: `dist-electron/electron/main.js`
- DB default (Windows): `data/suppliers.db` (dev) or `%APPDATA%/OutsourcingRegister/data.db` (prod)
- DB default (Linux): `data/suppliers.db` (dev) or `~/.config/OutsourcingRegister/data.db` (prod)
- DB custom: Configurable via Settings > Database Location (stored in `app-config.json`)
- Commands: `npm run electron:dev` (dev), `npm run electron:build` (all platforms), `npm run electron:build:win` (Windows), `npm run electron:build:linux` (Linux)

---

## 📏 Compliance (CSSF 22/806 Section 4.2.7)

- Point 53: Status
- Point 54: Mandatory fields for all suppliers (23 fields)
- Point 54.h: Cloud fields (conditional)
- Point 55: Critical function fields (conditional)
- Total tracked fields: 73 across 4 tabs

---

## 🧠 Design Principles

1. Desktop-first
2. CSSF annotations on fields
3. Semantic tokens for colors
4. Type-safe (TypeScript)
5. Accessible components (shadcn/ui)

---

## 🔒 Security & Deployment

**Deployment Context:**
- Single laptop or on-premises server (physically secured)
- No external network exposure
- Controlled access environment

**Security Approach:**
- Frontend RBAC enforcement (UI-level permission checks)
- Session management with "remember me" persistence
- Password hashing with bcrypt (cost factor: 10)
- Master password recovery mechanism
- System designed for on-premises, controlled environments
- Suitable for internal use, not for internet-facing deployment

**Data Protection:**
- Manual backup system (user-initiated) with hybrid restore
- SQLite database (local file-based storage)

---

## 📦 Running & Packaging

```bash
npm run electron:dev         # Development
npm run electron:build       # Build all platforms
npm run electron:build:win   # Windows only
npm run electron:build:linux # Linux only
```

### Build Artifacts (`release/` folder)

**Windows:**
| File | Description |
|------|-------------|
| `Supplier Outsourcing Register Setup X.X.X.exe` | Windows installer (NSIS) |
| `win-unpacked/` | Portable Windows app |

**Linux:**
| File | Description |
|------|-------------|
| `Supplier Outsourcing Register-X.X.X.AppImage` | Universal Linux app (recommended) |
| `Supplier Outsourcing Register-X.X.X.deb` | Debian/Ubuntu package |
| `linux-unpacked/` | Portable Linux app |

### Data Locations

| Platform | Default Database Path |
|----------|----------------------|
| Windows (dev) | `./data/suppliers.db` |
| Windows (prod) | `%APPDATA%/OutsourcingRegister/data.db` |
| Linux (prod) | `~/.config/OutsourcingRegister/data.db` |

---

**Created with Claude Code** | Last Updated: 2025-12-21
