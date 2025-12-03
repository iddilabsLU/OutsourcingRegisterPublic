# Supplier Outsourcing Register

A demo application for managing supplier outsourcing arrangements in compliance with **CSSF Circular 22/806 Section 4.2.7**. Built with Next.js 15, React 19, TypeScript, and Tailwind CSS 4.

---

## 📋 Quick Overview

**Purpose:** CSSF-compliant supplier outsourcing register for Luxembourg financial institutions
**Target:** Windows desktop application (.exe installer)
**Deployment:** Electron + SQLite (Phase 2), Vercel demo (Phase 1)
**User:** Non-technical user relying on Claude Code for all development

---

## 🚀 Quick Start

```bash
$ npm run dev          # Start development server (localhost:3000)
$ npm run build        # Build for production
$ npm run lint         # Check code quality
```

---

## 🛠 Tech Stack

- **Framework:** Next.js 15.5.4 (App Router, Turbopack)
- **React:** 19.1.0
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI:** shadcn/ui (25+ components) + Lucide icons
- **Forms:** React Hook Form + Zod
- **Theme:** Light mode only
- **Desktop:** Electron (Phase 2)
- **Database:** SQLite + better-sqlite3 (Phase 2)

---

## ✅ Current Status (Updated: 2025-12-02)

**Phase 1: Frontend Demo - COMPLETE** ✅
**Phase 2: Desktop Application - IN PROGRESS** 🔄

### What Works:
- **Supplier Register Table** - View, filter, search 73 CSSF-compliant fields
- **Add Supplier Form** - Complete 4-tab form with pending fields feature
- **Edit Supplier** - Edit existing suppliers, form pre-fills with data, reference locked
- **Delete Supplier** - Remove suppliers with confirmation dialog
- **Duplicate Supplier** - Instantly clone suppliers with new reference number and Draft status
- **Data Persistence** - sessionStorage saves changes across page refreshes (within session)
- **Export Functionality** - Export to Excel (compact 8 cols / full 52 fields) or PDF (compact 8 cols)
- **Dashboard Analytics** - CSSF compliance monitoring with 7 indicators, charts, and risk management
- **Country Selection** - Multiple country dropdown for data location and service performance (~195 countries)
- **Provider Name Autocomplete** - Dropdown suggests existing supplier names to prevent duplicates
- **Interactive CSSF References** - Click CSSF codes (54.a, 55.c, etc.) to view full regulatory text via popover
- **Validation System** - Two-layer approach (see `context/VALIDATION.md`)
- **Filtering** - Quick filters, custom filters, global text search with highlighting
- **Pending Fields** - Mark incomplete fields, auto-mark on draft, skip validation
- **Build & Deployment** - All TypeScript errors fixed, ready for Vercel

### Recent Changes:
- ✅ **Electron + SQLite Database** (Dec 02) - Desktop app scaffolding complete, database schema implemented, seeds 5 suppliers on first run
- ✅ **Interactive CSSF References** (Nov 07) - Click any CSSF reference to see full Circular 22/806 regulatory text in popover (forms + expanded cards)
- ✅ **Performance Optimization** (Nov 06) - Faster page load with reduced fonts and loading skeleton animation
- ✅ **Provider Name Autocomplete** (Nov 04) - Dropdown list of existing supplier names prevents duplicates and ensures data consistency
- ✅ **UI Improvements & User Guidance** (Nov 06) - Landing page icon refresh, footer redesign with IDDI Labs branding, warning/tip banners
- ✅ **Country Selection & Geographic Distribution Redesign** (Nov 04) - Multiple country selection from ~195 countries, cleaner EU/Non-EU dashboard indicators, field rename: dataStorageLocation → otherDataLocationInfo

---

## 📚 Detailed Documentation

For detailed information, see these files:

- **[ARCHITECTURE.md](context/ARCHITECTURE.md)** - How the app works (components, data flow, file structure)
- **[VALIDATION.md](context/VALIDATION.md)** - Current validation approach (two-layer system)
- **[ROADMAP.md](context/ROADMAP.md)** - Phase 2 progress and implementation steps
- **[OFFLINE_SPEC.md](context/OFFLINE_SPEC.md)** - Desktop application requirements (Electron + SQLite)
- **[Completed Work](context/completed/)** - Archive of finished PRDs and changelogs

---

## 🎯 Next Priorities

**Phase 2: Desktop Application - IN PROGRESS** 🔄

Converting the web demo into a Windows desktop application with SQLite database:

1. ✅ **Electron Setup** - Electron project initialized, runs in desktop window with Next.js
2. ✅ **SQLite Database** - Schema designed, CRUD operations implemented, database seeds with 5 suppliers
3. ✅ **API Layer** - IPC handlers and CRUD operations complete (getAllSuppliers, addSupplier, updateSupplier, deleteSupplier)
4. **Data Migration** - Connect React components to SQLite database (CURRENT PRIORITY)
5. **Multi-User Support** - Local or network drive database access (up to 5 users)
6. **New Features** - Database backup/restore, Excel import, data location configuration
7. **Packaging** - Build Windows installer (.exe)

**Electron Configuration Notes:**
- Main entry: `dist-electron/electron/main.js` (full path required due to tsconfig rootDir)
- Database location: `data/suppliers.db`
- Seed data: 5 suppliers copied inline to `electron/database/seed.ts` (avoids frontend import issues)
- Commands: `npm run electron:dev` (dev), `npm run electron:compile` (compile TS + copy schema)

See `context/OFFLINE_SPEC.md` for complete requirements and `context/ROADMAP.md` for detailed steps

---

## 🏛️ CSSF Compliance

This app implements **CSSF Circular 22/806 Section 4.2.7** requirements:

- **Point 53:** Status of outsourcing arrangement
- **Point 54:** Mandatory fields for ALL suppliers (23 fields)
- **Point 54.h:** Cloud service fields (6 fields, conditional)
- **Point 55:** Critical function fields (18+ fields, conditional)

**Total Fields:** 52 CSSF-compliant fields across 4 tabs

**Mandatory Fields:** All except LEI and Parent Company
**Conditional Fields:** Cloud (when category=Cloud), Critical (when isCritical=Yes)

Full mapping available in `context/ARCHITECTURE.md`

---

## 🎨 Design Principles

1. **Desktop-First** - Optimized for desktop screens (mobile not prioritized)
2. **CSSF Annotations** - All fields labeled with circular points (54.a, 55.c, etc.)
3. **Semantic Colors** - Uses CSS variables (--primary, --foreground, etc.)
4. **Type Safety** - 100% TypeScript coverage
5. **Accessibility** - shadcn components maintain WCAG AAA standards

---

## 💡 Key Patterns

### Adding New Fields
See `context/workflows/ADD_MANDATORY_FIELD.md` for step-by-step guide

### Debugging Forms
See `context/workflows/DEBUG_FORM.md` for common issues

### Deployment
See `context/workflows/DEPLOY.md` for Vercel checklist

---

## 🐛 Known Issues

*No known issues at this time.*

---

## 📊 Project Metrics

- **Components:** 84+ (25+ shadcn/ui + 59+ custom)
- **Form Fields:** 73 CSSF-compliant fields
- **Lines of Code:** ~9,500+ (excluding dependencies)
- **TypeScript Coverage:** 100%
- **Build Status:** ✅ Successful (0 errors, 0 warnings)

---

## 🔗 External Resources

- [CSSF Circular 22/806](https://www.cssf.lu/en/Document/circular-cssf-22-806/)
- [Next.js Docs](https://nextjs.org/docs)
- [shadcn/ui Docs](https://ui.shadcn.com)
- [React Hook Form](https://react-hook-form.com)
- [Zod Validation](https://zod.dev)

---

**Created with Claude Code** | Last Updated: 2025-12-02
