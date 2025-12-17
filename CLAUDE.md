# Supplier Outsourcing Register

A **desktop application** for managing supplier outsourcing arrangements in compliance with **CSSF Circular 22/806 Section 4.2.7**. Built with Electron, Next.js 15, React 19, TypeScript, and SQLite.

> **Desktop-Only Application**
> Requires Electron to run. Uses SQLite for persistence.
> **Run with:** `npm run electron:dev`

---

## 🚀 Quick Overview

**Purpose:** CSSF-compliant supplier outsourcing register for Luxembourg financial institutions
**Target:** Windows desktop application (.exe installer)
**Database:** SQLite (local database file: `data/suppliers.db`)
**User:** Non-technical user relying on Claude Code for all development

---

## 🧭 Quick Start

```bash
npm run electron:dev       # Start desktop app (dev)
npm run electron:build     # Build installer + unpacked app
npm run electron:compile   # Compile Electron TS + copy schema
npm run lint               # Lint
```

**Note:** Runs only in Electron. `npm run electron:build` produces the Windows installer.

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

## ✅ Current Status (Updated: 2025-12-17)

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

### Recent Changes
- Critical Outsourcing Monitor (new section in Reporting tab: tracks critical active suppliers with inline editing, provider/category filters, Excel export)
- Issue category field added to issue tracker (enables better organization and filtering)
- Excel export for events, issues, and critical monitor data
- New SQLite table `critical_monitor` with 4 user-input fields (contract, suitability assessment, audit reports, CO & RO assessment)

---

## 📚 Documentation

- `context/ARCHITECTURE.md` — architecture overview
- `context/VALIDATION.md` — validation approach
- `context/ROADMAP.md` — implementation steps and milestones
- `context/OFFLINE_SPEC.md` — offline/desktop requirements
- `context/ELECTRON_PACKAGING.md` — packaging instructions, pitfalls, artifacts
- `context/completed/` — archived plans/PRDs

---

## 🎯 Next Priorities

- Multi-user support (local/network DB path)
- Backup/restore UI, Excel import, data location configuration
- Optional future: authentication, audit trail, cloud backup

**Electron Notes**
- Main entry: `dist-electron/electron/main.js`
- DB: `data/suppliers.db` (dev) or `%APPDATA%/SupplierRegister/data.db` (prod)
- Commands: `npm run electron:dev` (dev), `npm run electron:build` (installer), `npm run electron:compile` (TS + schema copy)

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

## 📦 Running & Packaging

```bash
npm run electron:dev    # Development
npm run electron:build  # Installer + unpacked
```

Artifacts: `release/Supplier Outsourcing Register Setup 0.1.0.exe`, `release/win-unpacked/`.

---

**Created with Claude Code** | Last Updated: 2025-12-17
