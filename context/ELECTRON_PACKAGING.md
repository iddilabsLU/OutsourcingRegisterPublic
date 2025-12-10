# Electron Packaging Guide

Notes to reproduce the working Electron builds without re-hitting past issues.

## Build Commands
- Dev (Electron + Next): `npm run electron:dev`
  - Runs Next dev server, compiles Electron TS, rebuilds better-sqlite3, then launches Electron pointing to http://localhost:3000/suppliers.
- Prod (packaged): `npm run electron:build`
  - Runs `next build` + static export, compiles Electron TS, rebuilds better-sqlite3, packages with electron-builder.

## Key Configuration Choices
- Next static export: `next.config.ts` uses `output: "export"`, `trailingSlash: true`, `assetPrefix` removed, `images.unoptimized: true`.
- No middleware redirect: replaced with `app/page.tsx` client-side redirect to `./suppliers/` so export works.
- Electron load:
  - Dev: loads `http://localhost:3000/suppliers`.
  - Prod: spins a static server (serve-handler) over bundled `resources/out`, logs the port, and loads `/suppliers/`.
  - Window show fallbacks: shows on `ready-to-show`, `did-finish-load`, and a 4s timeout to avoid invisible window.
  - Logs `did-fail-load` for troubleshooting.
- Packaging extras:
  - `extraResources`: copies `out` into `resources/out`.
  - `asarUnpack`: includes `**/*.node` (better-sqlite3).
  - `files`: include `out/**/*`, `dist-electron/**/*`, `public/**/*`, `package.json`; exclude unused `@img` platform bundles.
  - Icon: `build/icon.ico`.
- Native module rebuild: `electron:rebuild` (better-sqlite3) before launch/package.

## Known Pitfalls & Fixes
- winCodeSign cache (symlink issue on Windows): cache seeded at `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0`. If cleared, let electron-builder re-download or precreate to avoid symlink privilege errors.
- `@img/sharp-*` optional platform bundles: placeholders were created to silence missing-package scans; they are excluded from packaged files.
- Invisible window: fixed by multiple show triggers (ready-to-show, did-finish-load, timeout). If it reoccurs, run with logging to see load errors.
- Static export loading: relies on `resources/out/suppliers/index.html`; ensure `extraResources` is present and static server uses `process.resourcesPath`.

## Data Locations
- Prod packaged: `%APPDATA%\SupplierRegister\data.db`.
- Dev: `./data/suppliers.db` in repo root.

## Logging / Debug
- Enable logging when launching packaged app:
  ```powershell
  set ELECTRON_ENABLE_LOGGING=1
  set ELECTRON_ENABLE_STACK_DUMPING=1
  "release\win-unpacked\Supplier Outsourcing Register.exe" --enable-logging --v=1
  ```
- Look for:
  - “Static server running at http://localhost:<port>”
  - “Renderer failed to load (…)” for load errors
  - Preload success log from `dist-electron/electron/preload.js`

## Artifact Locations
- Installer: `release/Supplier Outsourcing Register Setup 0.1.0.exe`
- Unpacked: `release/win-unpacked/` (bundled `resources/out` and app asar).

