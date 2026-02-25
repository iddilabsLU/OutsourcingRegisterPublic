# Supplier Outsourcing Register

A **cross-platform desktop application** for managing supplier outsourcing arrangements in compliance with **CSSF Circular 22/806 Section 4.2.7**. Built for Luxembourg financial institutions to maintain a comprehensive register of all outsourcing arrangements with SQLite database persistence.

> **⚠️ Desktop-Only Application** - Runs on Windows and Linux. Requires Electron.

![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)
![Next.js](https://img.shields.io/badge/Next.js-15.5.9-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.1.4-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)
![License](https://img.shields.io/badge/License-MIT-green)

---
## YouTube video: https://youtu.be/6cZ0UkFOze0?si=iYw-yu3xf_RC5N2Q

## Online demo: https://outsourcing.iddi-labs.com/

## In Depth guide: https://www.iddi-labs.com/blog/outsourcingregister-guidelines


## 📥 Download & Install

### For End Users (Windows)

1. **Download**
  - https://github.com/iddilabsLU/OutsourcingRegisterPublic/releases

2. **Run the installer**
   - Double-click the `.exe` file
   - Windows may show a security warning (see note below)
   - Choose installation directory
   - Desktop and Start Menu shortcuts will be created

3. **Launch the application**
   - Desktop shortcut: "Supplier Outsourcing Register"
   - Or run from: `C:\Program Files\Supplier Outsourcing Register\`

4. **First launch**
   - Database will be created at: `%APPDATA%\OutsourcingRegister\data.db`
   - 5 sample suppliers will be seeded automatically

> **⚠️ Windows Security Warning**
>
> Windows Defender SmartScreen may show "Windows protected your PC" because the installer is not code-signed. This is normal for free open source software.
>
> **To install:** Click "More info" → "Run anyway"

### For End Users (Linux)

**AppImage (Universal - Recommended)**
1. Download `Supplier Outsourcing Register-0.1.0.AppImage`
2. Make it executable: `chmod +x *.AppImage`
3. Run directly: `./Supplier\ Outsourcing\ Register-0.1.0.AppImage`

**Debian/Ubuntu (.deb)**
1. Download `Supplier Outsourcing Register-0.1.0.deb`
2. Install: `sudo apt install ./Supplier\ Outsourcing\ Register-0.1.0.deb`
3. Run from applications menu or: `supplier-outsourcing-register`

**Data location:** `~/.config/OutsourcingRegister/data.db`

---

## 🎯 Purpose

This application helps Luxembourg financial institutions comply with **CSSF Circular 22/806** by providing:

- **Comprehensive Register** - Track all 73 CSSF-required fields across 4 organized tabs
- **Compliance Monitoring** - Dashboard with 7 indicators for regulatory oversight
- **Risk Management** - Assess and monitor critical supplier relationships
- **Data Export** - Generate Excel and PDF reports for regulatory submissions
- **Multi-User Support** - Optional authentication with role-based access control
- **Backup & Restore** - Protect your data with flexible backup options
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

### Reporting & Change Tracking
- ✅ **Change Log** - Auto-generated events from supplier register changes
  - Tracks: status, risk level, criticality, assessment dates, notification/start/renewal/end dates
  - Manual add/edit/delete supported
  - Period filtering: 30/90 days, all-time, or custom date range
- ✅ **Issue Tracker** - Manage compliance issues with:
  - Status, severity, owner, due date
  - Optional supplier/function tags
  - Follow-ups and lifecycle timestamps
  - Category-based organization
- ✅ **Critical Outsourcing Monitor** - Track critical active suppliers
  - Inline editing
  - Advanced filters
  - Excel export capability

### Authentication & Security (Optional)
- ✅ **Role-Based Access Control (RBAC)** - 3 user roles:
  - **Admin:** Full access + user management
  - **Editor:** Full edit access to suppliers and reporting
  - **Viewer:** Read-only access
- ✅ **Enable/Disable Auth** - Toggle authentication in Settings
- ✅ **Master Password Recovery** - Emergency access mechanism
- ✅ **Session Persistence** - "Remember me" functionality
- ✅ **Default Credentials:** `admin` / `admin` (change immediately)
- ✅ **Master Override:** `master123` (change immediately)

### Backup & Restore
- ✅ **Create Backups** - ZIP archive containing:
  - Database file (database.db)
  - Excel exports (Suppliers, Events, Issues, Critical Monitor)
- ✅ **Hybrid Restore Options:**
  - **From Database:** Fast, exact restoration
  - **From Excel:** Use if you edited Excel files manually
- ✅ **Selective Restore** - Choose which data to restore
- ✅ **User-Chosen Location** - Save/load from anywhere

### Multi-User Setup
- ✅ **Configurable Database Location** - Settings tab allows:
  - Custom database path (e.g., network share `\\server\share\data.db`)
  - Path validation before applying
  - Optional data copy to new location (Admin only)
  - App restart required for changes
- ✅ **Network Share Support** - Enables multiple users to access shared database

### Data Management
- ✅ **Export to Excel** - Compact (8 columns) or Full (52 fields) formats
- ✅ **Export to PDF** - Compact summary view for reports
- ✅ **Export Events/Issues** - Dedicated Excel exports for change log and issue tracker
- ✅ **Advanced Filtering** - Quick filters, custom filters, global text search
- ✅ **Text Highlighting** - Search terms highlighted in yellow
- ✅ **Expandable Rows** - Click to view full supplier details in 4 tabs

---

## 🚀 Quick Start (For Developers)

### Prerequisites
- Node.js 18+ (20.x recommended)
- npm, yarn, pnpm, or bun
- Windows 10/11 or Linux

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/OutsourcingRegister.git
   cd OutsourcingRegister
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development mode**
   ```bash
   npm run electron:dev
   ```

4. **App opens in desktop window**
   - Database: `data/suppliers.db`
   - 5 sample suppliers seeded on first launch

---

## 📋 Build Commands

| Command | Description |
|---------|-------------|
| `npm run electron:dev` | Start desktop app (dev mode) |
| `npm run electron:build` | Build all platforms (Windows + Linux) |
| `npm run electron:build:win` | Build Windows only (.exe + unpacked) |
| `npm run electron:build:linux` | Build Linux only (.AppImage + .deb + unpacked) |
| `npm run electron:compile` | Compile Electron TypeScript + copy schema |
| `npm run lint` | Run ESLint |

### Build Artifacts

**Windows:**
- `release/Supplier Outsourcing Register Setup X.X.X.exe` - Installer (NSIS)
- `release/win-unpacked/` - Portable app

**Linux:**
- `release/Supplier Outsourcing Register-X.X.X.AppImage` - Universal Linux app
- `release/Supplier Outsourcing Register-X.X.X.deb` - Debian/Ubuntu package
- `release/linux-unpacked/` - Portable app

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
| Desktop | Electron 39 | Cross-platform desktop framework |
| Database | SQLite + better-sqlite3 | Local database with synchronous operations |
| Framework | Next.js 15.5.9 | App Router, Server Components, Turbopack |
| UI Library | React 19.1.4 | Latest React features |
| Language | TypeScript 5 | 100% type safety coverage |
| Styling | Tailwind CSS 4 | Utility-first CSS with semantic tokens |
| Components | shadcn/ui | 25+ accessible components |
| Icons | Lucide React | Consistent iconography |
| Forms | React Hook Form + Zod | Form handling & validation |
| Charts | Recharts | Dashboard data visualization |
| Authentication | bcrypt | Password hashing (cost factor: 10) |
| Backup | adm-zip + xlsx | ZIP archives with Excel exports |

---

## 📁 Project Structure

```
OutsourcingRegister/
├── app/
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
│   │   ├── reporting/           # Events, Issues, Critical Monitor
│   │   └── settings/            # Auth, Backup, Database config
│   └── layouts/
│       ├── header.tsx
│       └── footer.tsx
│
├── electron/
│   ├── main.ts                  # Electron main process
│   ├── preload.ts               # IPC bridge
│   └── database/
│       ├── db.ts                # Database initialization
│       ├── suppliers.ts         # Supplier CRUD
│       ├── events.ts            # Event CRUD
│       ├── issues.ts            # Issue CRUD
│       ├── critical-monitor.ts  # Critical monitor CRUD
│       ├── auth.ts              # Authentication service
│       ├── backup.ts            # Backup/restore system
│       ├── config.ts            # Database path config
│       └── schema.sql           # Database schema
│
├── lib/
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utilities
│   ├── validations/             # Zod schemas
│   └── contexts/                # React contexts
│
├── context/                     # Documentation
│   ├── CLAUDE.md                # Main project guide
│   ├── ARCHITECTURE.md          # Technical architecture
│   ├── VALIDATION.md            # Validation system
│   ├── ROADMAP.md               # Feature roadmap
│   └── ELECTRON_PACKAGING.md    # Packaging guide
│
└── public/                      # Static assets
```

---

## 📖 Usage Examples

### Adding a New Supplier

1. Click "New Entry" tab
2. Fill in the 4-tab form (Basic Info, Provider, Cloud, Critical)
3. Mark incomplete fields as "Pending" (amber pin button)
4. Click "Save Supplier" or "Save as Draft"
5. Supplier appears in register table

### Enabling Authentication

1. Go to Settings tab
2. Click "Security Settings"
3. Toggle "Enable Authentication"
4. Log in with default: `admin` / `admin`
5. **Change the default password immediately!**
6. Create additional users in User Management section

### Creating a Backup

1. Go to Settings tab
2. Click "Backup & Restore"
3. Click "Create Backup"
4. Choose save location
5. ZIP file created with database + Excel files

### Multi-User Setup (Network Share)

1. **Admin:** Set up network share (e.g., `\\server\share\`)
2. **Admin:** Settings > Database Location
3. **Admin:** Enter path: `\\server\share\data.db`
4. **Admin:** Check "Copy existing data"
5. **Admin:** Click "Apply" and restart app
6. **Other Users:** Settings > Database Location
7. **Other Users:** Enter same path: `\\server\share\data.db`
8. **Other Users:** Uncheck "Copy existing data"
9. **Other Users:** Click "Apply" and restart app

---

## 🎨 Design Principles

1. **Desktop-First** - Optimized for desktop screens (mobile not prioritized)
2. **CSSF Annotations** - All fields labeled with circular points (54.a, 55.c, etc.)
3. **Semantic Colors** - Uses CSS variables (--primary, --foreground, etc.)
4. **Type Safety** - 100% TypeScript coverage
5. **Accessibility** - shadcn components maintain WCAG AAA standards
6. **User Guidance** - Contextual banners and tooltips for feature discovery

---

## 📚 Documentation

Comprehensive documentation is available in the `/context` folder:

- **[CLAUDE.md](context/CLAUDE.md)** - Main project guide (start here!)
- **[ARCHITECTURE.md](context/ARCHITECTURE.md)** - How the app works
- **[VALIDATION.md](context/VALIDATION.md)** - Two-layer validation approach
- **[ROADMAP.md](context/ROADMAP.md)** - Future priorities and features
- **[ELECTRON_PACKAGING.md](context/ELECTRON_PACKAGING.md)** - Build and packaging guide

---

## 🎯 Current Status

**Phase 2 Complete ✅** - All core features implemented

### What Works
- ✅ Supplier CRUD operations (Add, Edit, Delete, Duplicate)
- ✅ Data persistence (SQLite database)
- ✅ Dashboard analytics (7 compliance indicators)
- ✅ Export functionality (Excel, PDF)
- ✅ Advanced filtering (Quick filters, custom filters, global search)
- ✅ Pending fields (Mark incomplete, skip validation)
- ✅ Form validation (Two-layer system)
- ✅ Reporting tab (Change log, Issue tracker, Critical monitor)
- ✅ Authentication with RBAC (optional)
- ✅ Backup & Restore system
- ✅ Configurable database location (multi-user support)
- ✅ Cross-platform builds (Windows + Linux)

### Data Locations

| Platform | Default Database Path |
|----------|----------------------|
| Windows (dev) | `./data/suppliers.db` |
| Windows (prod) | `%APPDATA%/OutsourcingRegister/data.db` |
| Linux (dev) | `./data/suppliers.db` |
| Linux (prod) | `~/.config/OutsourcingRegister/data.db` |

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
- **NOT suitable for internet-facing deployment**

**Data Protection:**
- Manual backup system (user-initiated) with hybrid restore
- SQLite database (local file-based storage)
- Network share support for multi-user scenarios

---

## 🐛 Known Issues

*No known issues at this time.*

Build passes with 0 errors and 0 warnings.

---

## 🔗 External Resources

- [CSSF Circular 22/806](https://www.cssf.lu/en/Document/circular-cssf-22-806/) - Official regulatory circular
- [Next.js Docs](https://nextjs.org/docs) - Framework documentation
- [shadcn/ui Docs](https://ui.shadcn.com) - Component library
- [Electron Docs](https://www.electronjs.org/docs/latest) - Desktop framework

---

## 📄 License

MIT License - Feel free to use this for any purpose.

---

## 🤝 Contributing

This is an open source desktop application for Luxembourg financial institutions. Contributions are welcome!

**For production use, consider:**
- Code signing the installer (removes Windows security warnings)
- Backend permission validation (IPC handler security)
- Audit trail implementation (who changed what, when)
- Automated testing (currently not implemented)
- CI/CD pipeline for cross-platform builds

---

## 🎉 What Makes This Special

✅ **CSSF-Compliant** - Implements all fields from Circular 22/806
✅ **Production-Ready UI** - Professional interface for compliance officers
✅ **Smart Validation** - Two-layer approach supporting pending fields
✅ **Dashboard Analytics** - 7 compliance indicators for regulatory oversight
✅ **Data Export** - Excel and PDF reports for submissions
✅ **Multi-User Ready** - RBAC + network database support
✅ **Backup & Restore** - Protect your data with flexible options
✅ **Cross-Platform** - Windows and Linux support
✅ **Type-Safe** - 100% TypeScript coverage
✅ **Well-Documented** - Comprehensive guides for non-technical users
✅ **Built with Claude Code** - Developed entirely with AI assistance

---

**Built in Luxembourg by a Risk Manager**
**Compliance Made Simple with Electron, Next.js, and shadcn/ui**

---

**Last Updated:** 2025-12-21
**Version:** 0.1.0 (Cross-Platform Desktop Application)
