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

## ✅ Current Status (Updated: 2025-12-12)

**Desktop Application - FULLY FUNCTIONAL**

### What Works
- Supplier register table with filters/search
- Add/Edit/Delete/Duplicate suppliers
- SQLite persistence
- Dashboard analytics (7 indicators)
- Reporting tab (auto-generated change log + manual event add/edit/delete + issue tracker with lifecycle/due dates and follow-ups; filters include 30/90/all/custom range)
- Export to Excel (compact/full) & PDF (compact)
- Pending fields + validation layers
- Desktop packaging: installer generated via `npm run electron:build`

### Recent Changes
- Reporting tab added (period filter, change log from supplier updates, issue lifecycle controls)
- New SQLite tables (`events`, `issues`) via migration; event-builder diff skips pending fields
- Windows installer & unpacked build (`release/Supplier Outsourcing Register Setup 0.1.0.exe`, `release/win-unpacked/`)
- Static export served inside Electron with fallback show logic
- Desktop-only architecture and SQLite integration

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

**Created with Claude Code** | Last Updated: 2025-12-09
