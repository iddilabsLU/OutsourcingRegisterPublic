# Workflow: Deploying to Vercel

This guide walks through deploying the Supplier Register application to Vercel.

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All TypeScript errors fixed (`npm run build` succeeds)
- [ ] All ESLint warnings resolved (`npm run lint` passes)
- [ ] All features tested locally (`npm run dev`)
- [ ] CLAUDE.md updated with latest changes
- [ ] Git committed and pushed to GitHub

---

## Step 1: Fix Build Errors

### Run Build Locally

```bash
$ npm run build
```

**Expected Output:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (X/X)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    X kB           XX kB
└ ○ /_not-found                          X kB           XX kB
```

### Common Build Errors

#### Error: "Type error: Property does not exist"
**Cause:** TypeScript type mismatch
**Solution:** See [DEBUG_FORM.md - TypeScript Issues](./DEBUG_FORM.md#typescript-issues)

#### Error: "Module not found"
**Cause:** Missing import or incorrect path
**Solution:**
```typescript
// ❌ Wrong (absolute path)
import { Button } from "components/ui/button"

// ✅ Correct (alias path)
import { Button } from "@/components/ui/button"
```

#### Error: "X is defined but never used"
**Cause:** Unused variable or import
**Solution:**
- Remove unused code
- Or prefix with underscore: `const _unused = ...`
- Or disable ESLint for that line: `// eslint-disable-next-line @typescript-eslint/no-unused-vars`

---

## Step 2: Fix Linting Warnings

### Run Linter

```bash
$ npm run lint
```

**Expected Output:**
```
✔ No ESLint warnings or errors
```

### Common Warnings

#### "React Hook useEffect has a missing dependency"
**Solution:**
```typescript
// ❌ Warning
useEffect(() => {
  doSomething(value)
}, [])

// ✅ Fixed
useEffect(() => {
  doSomething(value)
}, [value])  // Add dependency

// Or ignore if intentional:
// eslint-disable-next-line react-hooks/exhaustive-deps
```

#### "img elements must have an alt attribute"
**Solution:**
```tsx
{/* ❌ Warning */}
<img src="/logo.png" />

{/* ✅ Fixed */}
<img src="/logo.png" alt="Company logo" />
```

#### "Anchor elements must have content"
**Solution:**
```tsx
{/* ❌ Warning */}
<a href="/"></a>

{/* ✅ Fixed */}
<a href="/">Home</a>
```

---

## Step 3: Optimize for Production

### 1. Update Environment Variables (if any)

Create `.env.local` for local secrets (not committed):
```bash
# .env.local (DO NOT COMMIT)
NEXT_PUBLIC_API_URL=https://api.example.com
```

Create `.env.production` for Vercel production values:
```bash
# .env.production (committed, no secrets)
NEXT_PUBLIC_APP_ENV=production
```

### 2. Check Image Optimization

If using images, ensure they're in `/public`:
```
public/
├── images/
│   ├── logo.png
│   └── hero.jpg
└── icons/
    └── favicon.ico
```

Use Next.js Image component:
```tsx
import Image from "next/image"

<Image
  src="/images/logo.png"
  alt="Logo"
  width={200}
  height={50}
/>
```

### 3. Review Bundle Size (Optional)

Install bundle analyzer:
```bash
$ npm install --save-dev @next/bundle-analyzer
```

Update `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
  // ... existing config
})
```

Analyze:
```bash
$ ANALYZE=true npm run build
```

---

## Step 4: Deploy to Vercel

### First-Time Deployment

1. **Push to GitHub**
```bash
$ git add .
$ git commit -m "Prepare for deployment"
$ git push origin main
```

2. **Visit Vercel**
Go to: https://vercel.com/

3. **Import Project**
- Click "Add New..." → "Project"
- Select GitHub repository
- Click "Import"

4. **Configure Project**
- **Framework Preset:** Next.js (auto-detected)
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `.next` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

5. **Environment Variables** (if needed)
Add any production environment variables:
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://api.example.com`

6. **Deploy**
Click "Deploy" button

7. **Wait for Build**
Build takes 1-3 minutes. Watch build logs for errors.

8. **Visit Site**
Vercel provides URL: `https://your-project.vercel.app`

---

### Subsequent Deployments

Vercel automatically deploys on every push to `main` branch:

```bash
$ git add .
$ git commit -m "Add feature X"
$ git push origin main
```

**Deployment triggers automatically:**
- Vercel detects push
- Runs `npm run build`
- Deploys if successful
- Notifies via email/Slack (if configured)

---

## Step 5: Verify Deployment

### 1. Check All Pages Load

- **Landing Page:** `https://your-project.vercel.app`
- **Register:** `https://your-project.vercel.app/suppliers` (or wherever register lives)

### 2. Test Core Features

- [ ] View supplier register table
- [ ] Expand supplier row
- [ ] Switch between detail tabs
- [ ] Open "New Entry" view
- [ ] Fill form and save supplier (with validation)
- [ ] Test filtering (quick + custom)
- [ ] Test global text search
- [ ] Test pending fields feature

### 3. Check Console for Errors

Open browser DevTools → Console:
- No red errors
- No failed network requests (404s)

### 4. Test Performance

Use Lighthouse (Chrome DevTools → Lighthouse tab):
- **Performance:** > 90
- **Accessibility:** > 95
- **Best Practices:** > 90
- **SEO:** > 90

---

## Troubleshooting Deployment Issues

### Build Fails on Vercel (But Works Locally)

**Cause:** Different Node.js version or dependency issue

**Solution:**
1. Check Node.js version in Vercel dashboard (Settings → General → Node.js Version)
2. Match local Node.js version:
```bash
$ node --version
v20.x.x
```
3. Specify Node version in `package.json`:
```json
{
  "engines": {
    "node": ">=20.0.0"
  }
}
```

---

### Environment Variables Not Working

**Cause:** Variables not added to Vercel or missing `NEXT_PUBLIC_` prefix

**Solution:**
1. Client-side variables MUST start with `NEXT_PUBLIC_`:
```bash
NEXT_PUBLIC_API_URL=https://api.example.com  # ✅ Accessible in browser
API_KEY=secret123                            # ❌ Server-only
```

2. Add variables in Vercel:
- Dashboard → Project → Settings → Environment Variables
- Add each variable
- Select "Production" environment
- Save and redeploy

---

### CSS Styles Not Applied

**Cause:** Tailwind CSS not building properly

**Solution:**
1. Check `tailwind.config.ts` includes all content paths:
```typescript
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ...
}
```

2. Ensure `globals.css` is imported in `app/layout.tsx`:
```typescript
import "./globals.css"
```

---

### Images Not Loading

**Cause:** Incorrect image paths or missing files

**Solution:**
1. Check images are in `/public`:
```
public/images/logo.png  # ✅ Correct
src/images/logo.png     # ❌ Wrong
```

2. Reference without `/public`:
```tsx
<img src="/images/logo.png" alt="Logo" />  # ✅ Correct
<img src="/public/images/logo.png" alt="Logo" />  # ❌ Wrong
```

---

### Fonts Not Loading

**Cause:** Font files missing or incorrect path

**Solution:**
1. Use Next.js Font Optimization:
```typescript
// app/layout.tsx
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      {children}
    </html>
  )
}
```

---

### 404 on Custom Routes

**Cause:** Missing page files or incorrect file structure

**Solution:**
Ensure App Router structure:
```
app/
├── page.tsx              # Route: /
├── suppliers/
│   └── page.tsx          # Route: /suppliers
└── dashboard/
    └── page.tsx          # Route: /dashboard
```

---

## Custom Domain Setup (Optional)

### Add Custom Domain to Vercel

1. **Buy Domain** (e.g., Namecheap, GoDaddy)

2. **Add to Vercel**
- Dashboard → Project → Settings → Domains
- Enter domain: `example.com`
- Click "Add"

3. **Configure DNS**
Vercel provides DNS records:
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

4. **Update DNS Provider**
- Go to domain registrar (Namecheap, GoDaddy, etc.)
- DNS Settings → Add records from Vercel
- Save

5. **Wait for DNS Propagation**
Takes 24-48 hours. Check status: https://www.whatsmydns.net/

---

## Monitoring & Analytics

### Vercel Analytics (Recommended)

**Free tier includes:**
- Page views
- Top pages
- Devices
- Browsers
- Countries

**Enable:**
1. Dashboard → Project → Analytics
2. Click "Enable Analytics"
3. Add `@vercel/analytics` to project:
```bash
$ npm install @vercel/analytics
```

4. Add to layout:
```typescript
// app/layout.tsx
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

---

### Error Tracking (Optional)

Use Sentry for error tracking:

1. **Install:**
```bash
$ npm install @sentry/nextjs
```

2. **Configure:**
```bash
$ npx @sentry/wizard@latest -i nextjs
```

3. **Add DSN to Vercel:**
- Dashboard → Settings → Environment Variables
- Key: `NEXT_PUBLIC_SENTRY_DSN`
- Value: `https://xxx@xxx.ingest.sentry.io/xxx`

---

## Rollback Strategy

### Revert to Previous Deployment

1. **View Deployments**
Dashboard → Project → Deployments

2. **Find Last Working Deployment**
Click on deployment from before issue

3. **Promote to Production**
Click "..." menu → "Promote to Production"

4. **Verify**
Visit site, confirm issue is resolved

---

## Deployment Checklist Summary

### Before Every Deploy
- [ ] Run `npm run build` locally (succeeds)
- [ ] Run `npm run lint` (no warnings)
- [ ] Test all features locally
- [ ] Update CLAUDE.md if needed
- [ ] Commit and push to GitHub

### After Deploy
- [ ] Check Vercel build logs (no errors)
- [ ] Visit production URL
- [ ] Test core features on production
- [ ] Check browser console (no errors)
- [ ] Run Lighthouse audit (scores > 90)

### Optional
- [ ] Enable Vercel Analytics
- [ ] Configure custom domain
- [ ] Set up error tracking (Sentry)
- [ ] Add staging environment

---

## CI/CD Best Practices

### Branch-Based Deployments

Vercel automatically creates preview deployments for branches:

```bash
# Create feature branch
$ git checkout -b feature/edit-supplier

# Make changes
$ git add .
$ git commit -m "Add edit supplier feature"

# Push to GitHub
$ git push origin feature/edit-supplier
```

**Vercel creates preview:**
- URL: `https://your-project-git-feature-edit-supplier.vercel.app`
- Test feature in isolation
- Share preview link with team
- Merge to main when ready → auto-deploys to production

---

### Automated Checks (Optional)

Add GitHub Actions for automated checks:

Create `.github/workflows/ci.yml`:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm run lint
```

---

## Production URLs

After deployment, note these URLs:

- **Production:** `https://your-project.vercel.app`
- **Preview (branches):** `https://your-project-git-branch-name.vercel.app`
- **Custom Domain:** `https://example.com` (if configured)

---

**Last Updated:** 2025-10-25
**Related Files:** CLAUDE.md, package.json, next.config.js
**Useful Links:**
- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Analytics](https://vercel.com/analytics)
