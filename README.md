# Supplier Outsourcing Register

A **desktop application** for managing supplier outsourcing arrangements in compliance with **CSSF Circular 22/806 Section 4.2.7**. Built for Luxembourg financial institutions to maintain a comprehensive register of all outsourcing arrangements with SQLite database persistence.

> **⚠️ Desktop-Only Application** - Requires Electron. Run with `npm run electron:dev`

![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)
![Next.js](https://img.shields.io/badge/Next.js-15.5.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.0-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🎯 Purpose

This application helps Luxembourg financial institutions comply with **CSSF Circular 22/806** by providing:

- **Comprehensive Register** - Track all 73 CSSF-required fields across 4 organized tabs
- **Compliance Monitoring** - Dashboard with 7 indicators for regulatory oversight
- **Risk Management** - Assess and monitor critical supplier relationships
- **Data Export** - Generate Excel and PDF reports for regulatory submissions
- **User-Friendly Interface** - Intuitive desktop-first design for compliance officers

---

## ✨ Features

### Core Functionality
- ✅ **Supplier Register Table** - View, filter, and search 73 CSSF-compliant fields
- ✅ **Add/Edit/Delete Suppliers** - Full CRUD operations with validation
- ✅ **Duplicate Suppliers** - Clone existing suppliers with new reference numbers
- ✅ **Data Persistence** - SQLite database with automatic persistence
- ✅ **Pending Fields** - Mark incomplete fields for later completion
- ✅ **Smart Validation** - Two-layer system (type safety + business logic)

### Compliance Features
- ✅ **CSSF Point 53** - Status tracking (Draft, Active, Not Yet Active, Terminated)
- ✅ **CSSF Point 54** - Mandatory fields for ALL suppliers (23 fields)
- ✅ **CSSF Point 54.h** - Cloud service fields (6 conditional fields)
- ✅ **CSSF Point 55** - Critical function fields (18+ conditional fields)
- ✅ **Geographic Distribution** - Multi-country selection (~195 countries)
- ✅ **Provider Autocomplete** - Consistent naming with dropdown suggestions

### Analytics Dashboard
- ✅ **Compliance Alerts** - Overdue assessments, upcoming reviews, missing notifications
- ✅ **Key Metrics** - Total suppliers, critical %, cloud %, pending %, completeness rate
- ✅ **Risk Distribution** - High/Medium/Low risk analysis for critical suppliers
- ✅ **Provider Concentration** - Identify single points of failure
- ✅ **Geographic Analysis** - EU/EEA/Non-EU jurisdiction breakdown
- ✅ **Regulatory Tracking** - CSSF notification status monitoring

### Reporting & Issues
- ✅ **Change Log** - Auto-generated events (status, risk, criticality, assessment dates, notification/start/renewal/end dates) pulled from the supplier register; manual add/edit/delete supported
- ✅ **Period Filtering** - 30/90 days, all-time, or custom date range views for management meetings
- ✅ **Issue Tracker** - Ordered list with status, severity, owner, due date, optional supplier/function tags, follow-ups, and lifecycle timestamps
- ✅ **Pending-Safe** - Pending fields are ignored when generating change events

### Data Management
- ✅ **Export to Excel** - Compact (8 columns) or Full (52 fields) formats
- ✅ **Export to PDF** - Compact summary view for reports
- ✅ **Advanced Filtering** - Quick filters, custom filters, global text search
- ✅ **Text Highlighting** - Search terms highlighted in yellow
- ✅ **Expandable Rows** - Click to view full supplier details in 4 tabs

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (20.x recommended)
- npm, yarn, pnpm, or bun
- Windows 10/11 (desktop application)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/supplierregister.git
   cd supplierregister
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript for Electron**
   ```bash
   npm run electron:compile
   ```

4. **Start desktop application**
   ```bash
   npm run electron:dev
   ```

5. **App opens in desktop window**
   - Database: `data/suppliers.db`
   - 5 sample suppliers seeded on first launch

---

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm run electron:dev` | Start desktop application (Electron + Next.js) |
| `npm run electron:compile` | Compile TypeScript for Electron |
| `npm run lint` | Run ESLint (0 errors, 0 warnings) |
| `npm run build` | Build Next.js (for Electron renderer) |

---

## 🏛️ CSSF Compliance

This application implements **CSSF Circular 22/806 Section 4.2.7** requirements:

### Regulatory Points Covered

| CSSF Point | Description | Fields |
|------------|-------------|--------|
| **Point 53** | Status of outsourcing arrangement | 1 field |
| **Point 54** | Mandatory for ALL suppliers | 23 fields |
| **Point 54.h** | Cloud services (conditional) | 6 fields |
| **Point 55** | Critical functions (conditional) | 18+ fields |

**Total Tracked Fields:** 73 (including pending fields, dates, assessments)

### Conditional Logic

- **Cloud Fields** - Only required when Category = "Cloud"
- **Critical Fields** - Only required when Is Critical = "Yes"
- **Sub-Outsourcing** - Only required when declared by critical supplier

### Mandatory vs Optional

- **Mandatory Fields:** All except LEI and Parent Company
- **Pending Fields:** Mark incomplete fields for later completion
- **Save as Draft:** Auto-marks empty required fields as pending

---

## 🛠 Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| Desktop | Electron | Cross-platform desktop framework |
| Database | SQLite + better-sqlite3 | Local database with synchronous operations |
| Framework | Next.js 15.5.4 | App Router, Server Components, Turbopack |
| UI Library | React 19.1.0 | Latest React features |
| Language | TypeScript 5 | 100% type safety coverage |
| Styling | Tailwind CSS 4 | Utility-first CSS with semantic tokens |
| Components | shadcn/ui | 25+ accessible components |
| Icons | Lucide React | Consistent iconography |
| Forms | React Hook Form + Zod | Form handling & validation |
| Charts | Recharts | Dashboard data visualization |
| Toasts | Sonner | Toast notifications |
| Theme | Light mode only | OKLCH color system |

---

## 📁 Project Structure

```
supplierregister/
├── app/
│   ├── page.tsx                 # Landing page with features
│   ├── suppliers/page.tsx       # Main register view
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Theme tokens
│
├── components/
│   ├── ui/                      # shadcn components (25+)
│   ├── shared/                  # Custom components
│   │   ├── supplier-register-table.tsx
│   │   ├── forms/               # Add/Edit supplier forms
│   │   ├── dashboard/           # Analytics components
│   │   └── filter-panel.tsx
│   └── layouts/
│       ├── header.tsx
│       └── footer.tsx
│
├── lib/
│   ├── types/
│   │   └── supplier.ts          # CSSF-compliant types
│   ├── utils/
│   │   ├── check-completeness.ts    # Validation layer 2
│   │   ├── filter-suppliers.ts      # Filter engine
│   │   ├── dashboard-analytics.ts   # Analytics calculations
│   │   ├── export-excel.ts          # Excel export
│   │   └── export-pdf.ts            # PDF export
│   ├── validations/
│   │   └── supplier-schema.ts   # Zod schema (layer 1)
│   ├── data/
│   │   └── suppliers.ts         # Sample data (5 suppliers)
│   └── contexts/
│       └── search-context.tsx   # Text highlighting
│
├── hooks/                       # Custom React hooks
│   └── use-reporting.ts         # Reporting bridge (events/issues via Electron)
├── public/                      # Static assets
└── context/                     # Documentation
    ├── CLAUDE.md                # Main project guide
    ├── ARCHITECTURE.md          # Technical architecture
    ├── VALIDATION.md            # Validation system
    ├── ROADMAP.md               # Feature roadmap
    └── workflows/               # Deployment guides
```

---

## 📊 Project Metrics

- **Components:** 82+ (25+ shadcn/ui + 57+ custom)
- **Form Fields:** 73 CSSF-compliant fields
- **Dashboard Indicators:** 7 compliance metrics
- **Lines of Code:** ~9,500+ (excluding dependencies)
- **TypeScript Coverage:** 100%
- **Build Status:** ✅ 0 errors, 0 warnings
- **Test Coverage:** Not implemented (Phase 2)

---

## 🎨 Design Principles

1. **Desktop-First** - Optimized for desktop screens (mobile not prioritized)
2. **CSSF Annotations** - All fields labeled with circular points (54.a, 55.c, etc.)
3. **Semantic Colors** - Uses CSS variables (--primary, --foreground, etc.)
4. **Type Safety** - 100% TypeScript coverage with strict mode
5. **Accessibility** - shadcn components maintain WCAG AAA standards
6. **User Guidance** - Contextual banners and tooltips for feature discovery

---

## 📚 Documentation

Comprehensive documentation is available in the `/context` folder:

- **[CLAUDE.md](context/CLAUDE.md)** - Main project guide (start here!)
- **[ARCHITECTURE.md](context/ARCHITECTURE.md)** - How the app works
- **[VALIDATION.md](context/VALIDATION.md)** - Two-layer validation approach
- **[ROADMAP.md](context/ROADMAP.md)** - Future priorities and features
- **[workflows/DEPLOY.md](context/workflows/DEPLOY.md)** - Vercel deployment guide

---

## 🎯 Current Status

**Desktop Application - Core Complete** ✅

All core features are implemented and working:
- ✅ Supplier CRUD operations (Add, Edit, Delete, Duplicate)
- ✅ Data persistence (SQLite database)
- ✅ Dashboard analytics (7 compliance indicators)
- ✅ Export functionality (Excel, PDF)
- ✅ Advanced filtering (Quick filters, custom filters, global search)
- ✅ Pending fields (Mark incomplete, skip validation)
- ✅ Form validation (Two-layer system)
- ✅ Country selection (~195 countries)
- ✅ Provider autocomplete
- ✅ Desktop-only architecture (Electron + SQLite)

### What's Next?

**Phase 2.5: Additional Features** (Next Priority)
- Database backup/restore functionality
- Excel import (bulk import suppliers)
- Data location configuration (local or network drive)
- Windows installer (.exe)
- Multi-user support (shared network database)

See [ROADMAP.md](context/ROADMAP.md) for detailed plans.

---

## 🐛 Known Issues

*No known issues at this time.*

Build passes with 0 errors and 0 warnings.

---

## 📦 Packaging

### Desktop Application

The application runs as a desktop app using Electron. Windows installer (.exe) packaging is available.

**Current Status:**
- ✅ Runs in development mode with `npm run electron:dev`
- ✅ SQLite database persists at `data/suppliers.db`
- ✅ All features working (CRUD, dashboard, export, filtering)
- ✅ Windows installer (.exe) produced via `npm run electron:build`
  - Installer: `release/Supplier Outsourcing Register Setup 0.1.0.exe`
  - Unpacked: `release/win-unpacked/Supplier Outsourcing Register.exe`

**How to build:**
- `npm run electron:dev` (dev)
- `npm run electron:build` (creates installer + unpacked)

See [context/ELECTRON_PACKAGING.md](context/ELECTRON_PACKAGING.md) for packaging details and troubleshooting.

---

## 📖 Usage Examples

### Adding a New Supplier

1. Click "New Entry" tab
2. Fill in the 4-tab form (Basic Info, Provider, Cloud, Critical)
3. Mark incomplete fields as "Pending" (amber pin button)
4. Click "Save Supplier" or "Save as Draft"
5. Supplier appears in register table

### Filtering Suppliers

1. Click "Show Filters" in register view
2. Use Quick Filters (Critical, Cloud) for instant filtering
3. Add Custom Filters (up to 3) for advanced queries
4. Type in global search to highlight matching text
5. Clear filters with "Clear All" button

### Exporting Data

1. Apply filters if needed (optional)
2. Click "Export" button in register header
3. Choose format:
   - **Excel (Compact)** - 8 key columns
   - **Excel (Full)** - All 52 CSSF fields
   - **PDF (Compact)** - 8 columns, print-ready
4. File downloads automatically

---

## 🔗 External Resources

- [CSSF Circular 22/806](https://www.cssf.lu/en/Document/circular-cssf-22-806/) - Official regulatory circular
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [shadcn/ui Docs](https://ui.shadcn.com) - Component library
- [React Hook Form](https://react-hook-form.com) - Form handling
- [Zod Validation](https://zod.dev) - Schema validation

---

## 📄 License

MIT License - Feel free to use this demo for any purpose.

---

## 🤝 Contributing

This is a desktop application for Luxembourg financial institutions. For production use, consider:
- Adding user authentication and roles
- Implementing audit trail (who changed what, when)
- Adding automatic backup functionality
- Multi-user conflict resolution
- Cloud backup integration

---

## 🎉 What Makes This Special

✅ **CSSF-Compliant** - Implements all fields from Circular 22/806
✅ **Production-Ready UI** - Professional interface for compliance officers
✅ **Smart Validation** - Two-layer approach supporting pending fields
✅ **Dashboard Analytics** - 7 compliance indicators for regulatory oversight
✅ **Data Export** - Excel and PDF reports for submissions
✅ **Type-Safe** - 100% TypeScript coverage with strict mode
✅ **Well-Documented** - Comprehensive guides for non-technical users
✅ **Built with Claude Code** - Developed entirely with AI assistance

---

**Built with ❤️ for Luxembourg Financial Institutions**
**Compliance Made Simple with Next.js and shadcn/ui**

---

**Last Updated:** 2025-12-12
**Version:** 2.0.0 (Desktop Application - Core Complete)
