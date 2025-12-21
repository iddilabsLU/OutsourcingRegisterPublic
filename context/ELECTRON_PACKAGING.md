# Electron Packaging Guide

Notes to reproduce the working Electron builds without re-hitting past issues.

## Supported Platforms

| Platform | Formats | Status |
|----------|---------|--------|
| Windows | `.exe` (NSIS installer), `win-unpacked/` (portable) | ✅ Supported |
| Linux | `.AppImage`, `.deb`, `linux-unpacked/` (portable) | ✅ Supported |
| macOS | Not supported | ❌ |

---

## Build Commands

### Development
```bash
npm run electron:dev
```
Runs Next dev server, compiles Electron TS, rebuilds better-sqlite3, then launches Electron pointing to http://localhost:3000/suppliers.

### Production (All Platforms)
```bash
npm run electron:build
```
Builds for all supported platforms (Windows + Linux).

### Platform-Specific Builds
```bash
npm run electron:build:win    # Windows only
npm run electron:build:linux  # Linux only
```

Each build:
1. Runs `next build` (static export)
2. Compiles Electron TypeScript
3. Rebuilds better-sqlite3 native module
4. Packages with electron-builder

---

## Key Configuration Choices

### Next.js Static Export
- `next.config.ts` uses `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`
- No middleware redirect: replaced with `app/page.tsx` client-side redirect to `./suppliers/`

### Electron Load Behavior
- **Dev:** Loads `http://localhost:3000/suppliers`
- **Prod:** Spins a static server (serve-handler) over bundled `resources/out`, logs the port, and loads `/suppliers/`
- **Window show fallbacks:** Shows on `ready-to-show`, `did-finish-load`, and a 4s timeout to avoid invisible window
- Logs `did-fail-load` for troubleshooting

### Packaging Configuration
- `extraResources`: Copies `out` into `resources/out`
- `asarUnpack`: Includes `**/*.node` (better-sqlite3 native module)
- `files`: Include `dist-electron/**/*`, `package.json`; exclude cache files, source maps, markdown
- **Windows icon:** `build/icon.ico`
- **Linux icon:** `build/icon.ico` (electron-builder converts to PNG)

### Native Module Rebuild
`electron:rebuild` (better-sqlite3) runs before launch/package.

---

## Artifact Locations

### Windows
| Artifact | Location |
|----------|----------|
| Installer | `release/Supplier Outsourcing Register Setup X.X.X.exe` |
| Portable | `release/win-unpacked/` |
| Block map | `release/Supplier Outsourcing Register Setup X.X.X.exe.blockmap` |

### Linux
| Artifact | Location |
|----------|----------|
| AppImage | `release/Supplier Outsourcing Register-X.X.X.AppImage` |
| Debian package | `release/Supplier Outsourcing Register-X.X.X.deb` |
| Portable | `release/linux-unpacked/` |

---

## Data Locations

### Windows
| Environment | Path |
|-------------|------|
| Development | `./data/suppliers.db` |
| Production | `%APPDATA%\OutsourcingRegister\data.db` |
| Config file | `%APPDATA%\OutsourcingRegister\app-config.json` |

### Linux
| Environment | Path |
|-------------|------|
| Development | `./data/suppliers.db` |
| Production | `~/.config/OutsourcingRegister/data.db` |
| Config file | `~/.config/OutsourcingRegister/app-config.json` |

---

## Known Pitfalls & Fixes

### Windows: Sharp Platform Bundles
**Problem:** `node_modules/.package-lock.json` references optional macOS/Linux sharp packages that don't exist on Windows.

**Fix:** Delete `.package-lock.json` before building:
```bash
rm node_modules/.package-lock.json
npm run electron:build:win
```

### Windows: winCodeSign Cache (Symlink Issue)
**Problem:** Symlink privilege errors during first build.

**Location:** `%LOCALAPPDATA%\electron-builder\Cache\winCodeSign\winCodeSign-2.6.0`

**Fix:** If cleared, let electron-builder re-download or precreate to avoid symlink privilege errors.

### Invisible Window
**Problem:** Window doesn't appear after launch.

**Fix:** Multiple show triggers are in place (ready-to-show, did-finish-load, timeout). If it reoccurs, run with logging to see load errors.

### Static Export Loading
**Requirement:** Relies on `resources/out/suppliers/index.html`

**Fix:** Ensure `extraResources` is present and static server uses `process.resourcesPath`.

---

## Logging / Debug

### Windows
```powershell
set ELECTRON_ENABLE_LOGGING=1
set ELECTRON_ENABLE_STACK_DUMPING=1
"release\win-unpacked\Supplier Outsourcing Register.exe" --enable-logging --v=1
```

### Linux
```bash
ELECTRON_ENABLE_LOGGING=1 ELECTRON_ENABLE_STACK_DUMPING=1 ./release/linux-unpacked/supplier-outsourcing-register --enable-logging --v=1
```

### What to Look For
- "Static server running at http://localhost:<port>"
- "Renderer failed to load (…)" for load errors
- Preload success log from `dist-electron/electron/preload.js`

---

## Cross-Platform Build Notes

### Building Linux from Windows
You can build Linux packages from Windows, but:
- AppImage works best when built on Linux
- The `.deb` package can be built from Windows but should be tested on Linux

### Recommended Approach
1. **For Windows releases:** Build on Windows with `npm run electron:build:win`
2. **For Linux releases:** Ideally build on Linux with `npm run electron:build:linux`
3. **CI/CD:** Use GitHub Actions with matrix builds for both platforms

### GitHub Actions Example (Future)
```yaml
# .github/workflows/release.yml
jobs:
  build:
    strategy:
      matrix:
        os: [windows-latest, ubuntu-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run electron:build
      - uses: actions/upload-artifact@v4
        with:
          name: release-${{ matrix.os }}
          path: release/*
```

---

## Linux-Specific Notes

### AppImage
- Universal format, works on any Linux distribution
- Users need to make it executable: `chmod +x *.AppImage`
- No installation required, just run directly

### Debian Package (.deb)
- For Debian, Ubuntu, Linux Mint, and derivatives
- Install with: `sudo dpkg -i *.deb` or `sudo apt install ./*.deb`
- Dependencies are declared in package.json `build.deb.depends`

### Network Database Path (Linux)
For multi-user setups with shared network storage:
- Use SMB/CIFS mount: `/mnt/share/data.db`
- Use NFS mount: `/nfs/shared/data.db`
- Configure via Settings > Database Location

---

## Troubleshooting

### "Cannot find module 'better-sqlite3'"
Run `npm run electron:rebuild` to rebuild native modules.

### "ENOENT: no such file or directory, scandir '...sharp-darwin-arm64'"
Delete `node_modules/.package-lock.json` and rebuild.

### Window Shows Blank/White
1. Check if static server started (look for port log)
2. Verify `resources/out/suppliers/index.html` exists
3. Run with debug logging enabled

### Database Not Found
1. Check data directory exists
2. Verify permissions on Windows (`%APPDATA%`) or Linux (`~/.config`)
3. Check if custom path is configured in `app-config.json`
