# Workflow: Debugging Form Issues

This guide helps diagnose and fix common form problems in the Supplier Register application.

---

## Quick Diagnostic Checklist

Use this checklist to quickly identify the issue category:

- [ ] **TypeScript Errors** → See [TypeScript Issues](#typescript-issues)
- [ ] **Field Not Saving** → See [Field Value Issues](#field-value-issues)
- [ ] **Validation Not Working** → See [Validation Issues](#validation-issues)
- [ ] **Pending Toggle Broken** → See [Pending Field Issues](#pending-field-issues)
- [ ] **Tab Not Showing** → See [Tab Visibility Issues](#tab-visibility-issues)
- [ ] **Form Not Submitting** → See [Submission Issues](#submission-issues)
- [ ] **Performance Slow** → See [Performance Issues](#performance-issues)

---

## TypeScript Issues

### Error: "Property does not exist on type"

**Example:**
```
Property 'backupOfficer' does not exist on type 'ServiceProvider'
```

**Cause:** Field added to form/display but not to TypeScript type

**Solution:**
1. Open `lib/types/supplier.ts`
2. Add field to appropriate interface:
```typescript
serviceProvider: {
  name: string
  // ... other fields
  backupOfficer: string  // ✅ Add here
}
```
3. Rebuild: `npm run build`

---

### Error: "Type is not assignable to type"

**Example:**
```
Type 'string | undefined' is not assignable to type 'string'
```

**Cause:** Mismatch between TypeScript type (required) and Zod schema (optional)

**Solution:**
- If field is mandatory → Keep TypeScript type as `string`
- If field is optional → Change TypeScript type to `string?`

**Example:**
```typescript
// lib/types/supplier.ts
legalEntityIdentifier?: string  // Optional field (LEI)
parentCompany?: string          // Optional field
```

---

### Error: "Object is possibly undefined"

**Example:**
```
Object is possibly 'undefined'. Cannot read property 'name' of undefined.
```

**Cause:** Accessing nested field without optional chaining

**Solution:**
Use optional chaining (`?.`) or nullish coalescing (`??`)

**Before:**
```typescript
const name = supplier.serviceProvider.name
```

**After:**
```typescript
const name = supplier.serviceProvider?.name ?? "N/A"
```

---

## Field Value Issues

### Field Value Not Saving

**Symptoms:**
- Fill field in form
- Click "Save Supplier"
- Field is empty in register table

**Diagnosis Steps:**

1. **Check field name matches Zod schema**
```tsx
// Form field name:
<FormTextInput name="serviceProvider.backupOfficer" />

// Must match Zod schema path:
serviceProvider: z.object({
  backupOfficer: z.string().optional()  // ✅ Same name
})
```

2. **Check React Hook Form registration**
Open React DevTools → Components → SupplierForm → hooks → "formState"
- Verify field appears in `values` object
- Check field path is correct

3. **Check form.getValues() output**
Add temporary logging:
```typescript
const handleSaveSupplier = () => {
  const formData = form.getValues()
  console.log("Form data:", formData)  // ✅ Debug output
  // ... rest of code
}
```

4. **Check default values**
Ensure field has default value in form setup:
```typescript
const form = useForm<SupplierFormData>({
  defaultValues: {
    serviceProvider: {
      name: "",
      backupOfficer: "",  // ✅ Add default
    }
  }
})
```

---

### Field Value Resets Unexpectedly

**Symptoms:**
- Fill field
- Switch tabs
- Field is empty when returning

**Cause:** Tab component unmounting/remounting

**Solution:**
Verify tabs are always rendered (not conditionally rendered)

**❌ Wrong (conditional render):**
```tsx
{activeTab === "basic" && <BasicInfoTab />}
```

**✅ Correct (always render, hide with CSS):**
```tsx
<div className={cn(activeTab === "basic" ? "block" : "hidden")}>
  <BasicInfoTab />
</div>
```

---

### Select Dropdown Shows Wrong Value

**Symptoms:**
- Select option in dropdown
- Dropdown shows wrong value or empty

**Cause:** Value mismatch between form value and select options

**Solution:**
1. Check form value:
```typescript
console.log(form.watch("status"))  // Check current value
```

2. Check select options have matching values:
```tsx
<FormSelect name="status">
  <option value="Active">Active</option>
  <option value="Not Yet Active">Not Yet Active</option>
  {/* ✅ Values must match OutsourcingStatus enum */}
</FormSelect>
```

---

## Validation Issues

### Validation Not Triggering

**Symptoms:**
- Click "Save Supplier" with empty fields
- No validation errors shown

**Diagnosis Steps:**

1. **Check completeness checker is called**
```typescript
const handleSaveSupplier = () => {
  const formData = form.getValues()
  const result = checkIncompleteFields(formData, pendingFieldsArray)
  console.log("Validation result:", result)  // ✅ Debug output
}
```

2. **Check field is in completeness checker**
Open `lib/utils/check-completeness.ts`
Search for field path (e.g., "serviceProvider.backupOfficer")

3. **Check field path is correct**
```typescript
// Must match exactly:
Form: name="serviceProvider.backupOfficer"
Completeness: addIncomplete("serviceProvider.backupOfficer", ...)
Display: isPending={supplier.pendingFields?.includes("serviceProvider.backupOfficer")}
```

---

### Wrong Fields Marked as Incomplete

**Symptoms:**
- Fill all fields
- Still shows incomplete validation errors

**Cause:** Completeness checker logic error

**Solution:**

1. **Check for typos in field path**
```typescript
// ❌ Wrong
addIncomplete("serviceProvider.backupOfficer", "Backup Officer (54.e)")

// ✅ Correct (must match type definition)
addIncomplete("serviceProvider.backupOfficer", "Backup Officer (54.e)")
```

2. **Check validation logic**
```typescript
// ❌ Wrong (checks for falsy, but empty string is falsy)
if (!data.serviceProvider?.backupOfficer) {
  addIncomplete(...)
}

// ✅ Correct (checks for empty or whitespace)
if (!data.serviceProvider?.backupOfficer || data.serviceProvider.backupOfficer.trim() === "") {
  addIncomplete(...)
}
```

3. **For boolean fields:**
```typescript
// ❌ Wrong (false is valid but !false is true)
if (!data.criticality?.isCritical) {
  addIncomplete(...)
}

// ✅ Correct (checks for undefined)
if (data.criticality?.isCritical === undefined) {
  addIncomplete(...)
}
```

---

### Conditional Validation Not Working

**Symptoms:**
- Cloud/Critical fields validated when tab is hidden
- Or: Cloud/Critical fields NOT validated when tab is visible

**Solution:**

1. **Check conditional logic in completeness checker**
```typescript
// Cloud fields (Point 54.h)
if (data.category === OutsourcingCategory.CLOUD) {
  // ✅ Only check cloud fields here
  if (!data.cloudService?.serviceModel) {
    addIncomplete("cloudService.serviceModel", "Cloud Service Model (54.h)")
  }
}

// Critical fields (Point 55)
if (data.criticality?.isCritical === true && data.criticalFields) {
  // ✅ Only check critical fields here
}
```

2. **Check enum value matches exactly**
```typescript
// ✅ Use enum constant
if (data.category === OutsourcingCategory.CLOUD)

// ❌ Don't use string literal (typo risk)
if (data.category === "Cloud")
```

---

## Pending Field Issues

### Pending Toggle Doesn't Work

**Symptoms:**
- Click amber pin button
- Nothing happens
- Or: Field doesn't skip validation

**Diagnosis Steps:**

1. **Check onTogglePending is passed**
```tsx
<FormTextInput
  name="serviceProvider.backupOfficer"
  pendingFields={pendingFields}
  onTogglePending={onTogglePending}  // ✅ Must be passed
/>
```

2. **Check field path is correct**
```tsx
// In form component:
const togglePending = (fieldPath: string) => {
  console.log("Toggling:", fieldPath)  // ✅ Debug output
  setPendingFields(prev => {
    const next = new Set(prev)
    if (next.has(fieldPath)) {
      next.delete(fieldPath)
    } else {
      next.add(fieldPath)
    }
    return next
  })
}
```

3. **Check pending fields are passed to completeness checker**
```typescript
const handleSaveSupplier = () => {
  const pendingFieldsArray = Array.from(pendingFields)
  console.log("Pending fields:", pendingFieldsArray)  // ✅ Debug
  const result = checkIncompleteFields(formData, pendingFieldsArray)
}
```

---

### Pending Badge Not Showing in Register

**Symptoms:**
- Mark field as pending
- Save supplier
- No amber badge in register table

**Cause:** Pending fields not saved with supplier data

**Solution:**
Check supplier creation includes `pendingFields`:
```typescript
const newSupplier: SupplierOutsourcing = {
  ...formData as SupplierOutsourcing,
  incompleteFields: [],
  pendingFields: Array.from(pendingFields),  // ✅ Must include
}
```

---

## Tab Visibility Issues

### Tab Not Enabling/Disabling

**Symptoms:**
- Change Category to "Cloud"
- Cloud tab doesn't enable
- Or: Change to "ICT Services" but Cloud tab still enabled

**Solution:**

1. **Check tab disable logic**
```tsx
// In SupplierFormTabNav:
const isCloudDisabled = category !== OutsourcingCategory.CLOUD
const isCriticalDisabled = criticality?.isCritical !== true

<TabsTrigger disabled={isCloudDisabled}>Cloud Services</TabsTrigger>
<TabsTrigger disabled={isCriticalDisabled}>Critical Functions</TabsTrigger>
```

2. **Check watch is working**
```tsx
const category = form.watch("category")
const criticality = form.watch("criticality")

console.log("Category:", category)  // ✅ Debug
console.log("Criticality:", criticality)  // ✅ Debug
```

3. **Check enum comparison**
```tsx
// ✅ Correct
const isCloudDisabled = category !== OutsourcingCategory.CLOUD

// ❌ Wrong (string comparison)
const isCloudDisabled = category !== "Cloud"
```

---

### Tab Content Not Showing

**Symptoms:**
- Click tab
- Content area is blank

**Cause:** Tab content not rendered or CSS issue

**Solution:**

1. **Check tab is always rendered**
```tsx
<TabsContent value="cloud" className="mt-6">
  <div className={cn(activeTab === "cloud" ? "block" : "hidden")}>
    <CloudServicesTab />
  </div>
</TabsContent>
```

2. **Check TabsContent value matches TabsTrigger value**
```tsx
<TabsTrigger value="cloud">Cloud Services</TabsTrigger>
{/* ✅ Must match */}
<TabsContent value="cloud">...</TabsContent>
```

---

## Submission Issues

### Form Submits But Supplier Not Added

**Symptoms:**
- Click "Save Supplier"
- Toast shows success
- Supplier not in register table

**Cause:** Supplier not added to state, or view not switching

**Solution:**

1. **Check onAddSupplier is called**
```typescript
const handleSaveSupplier = () => {
  // ... validation
  const newSupplier: SupplierOutsourcing = { ... }
  console.log("Adding supplier:", newSupplier)  // ✅ Debug
  onAddSupplier(newSupplier)  // ✅ Must call this
}
```

2. **Check parent component receives supplier**
```tsx
// In app/page.tsx:
const handleAddSupplier = (supplier: SupplierOutsourcing) => {
  console.log("Received supplier:", supplier)  // ✅ Debug
  setSuppliers(prev => [...prev, supplier])
  setActiveView("register")  // ✅ Switch view
}
```

---

### Incomplete Fields Dialog Doesn't Show

**Symptoms:**
- Submit form with missing fields
- No dialog appears
- Form submits anyway

**Cause:** Dialog not triggered or state issue

**Solution:**

1. **Check result.isComplete**
```typescript
const result = checkIncompleteFields(formData, pendingFieldsArray)
console.log("Is complete:", result.isComplete)  // ✅ Debug
console.log("Incomplete fields:", result.labels)  // ✅ Debug

if (!result.isComplete) {
  setIncompleteFieldsList(result.labels)
  setShowIncompleteDialog(true)  // ✅ Must set to true
  return  // ✅ Must return early
}
```

2. **Check dialog is rendered**
```tsx
<IncompleteFieldsDialog
  open={showIncompleteDialog}
  onOpenChange={setShowIncompleteDialog}
  incompleteFields={incompleteFieldsList}
  onMarkAsPending={handleMarkAsPendingAndSubmit}
/>
```

---

## Performance Issues

### Form Typing is Slow

**Symptoms:**
- Type in input
- Delay before character appears

**Cause:** Too many re-renders

**Solution:**

1. **Check for expensive operations in render**
```tsx
// ❌ Bad (runs on every render)
const filteredSuppliers = suppliers.filter(...)

// ✅ Good (only runs when dependencies change)
const filteredSuppliers = useMemo(
  () => suppliers.filter(...),
  [suppliers]
)
```

2. **Check form is uncontrolled**
React Hook Form should use uncontrolled inputs (default behavior)

```tsx
// ✅ Good (uncontrolled)
<FormField
  control={form.control}
  name="serviceProvider.name"
  render={({ field }) => <Input {...field} />}
/>

// ❌ Bad (controlled, causes re-renders)
<Input value={name} onChange={(e) => setName(e.target.value)} />
```

---

### Form Takes Long to Submit

**Symptoms:**
- Click "Save Supplier"
- Several seconds delay before toast

**Cause:** Expensive validation or data processing

**Solution:**

1. **Profile checkIncompleteFields()**
```typescript
const handleSaveSupplier = () => {
  console.time("Validation")
  const result = checkIncompleteFields(formData, pendingFieldsArray)
  console.timeEnd("Validation")  // ✅ Should be < 50ms
}
```

2. **Check for unnecessary data transformations**
```typescript
// ❌ Bad (multiple iterations)
const fields1 = Object.keys(data).map(...)
const fields2 = fields1.filter(...)
const fields3 = fields2.map(...)

// ✅ Good (single iteration)
const fields = Object.keys(data).reduce((acc, key) => {
  // ... combine logic
}, [])
```

---

## Debugging Tools

### React DevTools
**Install:** [Chrome Extension](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)

**Usage:**
1. Open DevTools → Components tab
2. Select `SupplierForm` component
3. View `hooks` → `formState` → `values` to see all form data
4. View `props` to see passed props

### Console Logging
```typescript
// Debug form values
console.log("Form values:", form.getValues())

// Debug specific field
console.log("Provider name:", form.watch("serviceProvider.name"))

// Debug validation result
const result = checkIncompleteFields(data)
console.log("Validation:", result)

// Debug pending fields
console.log("Pending:", Array.from(pendingFields))
```

### TypeScript Compiler
```bash
# Check for TypeScript errors
$ npm run build

# Or watch mode:
$ npx tsc --watch --noEmit
```

---

## Common Error Messages

### "Cannot read property 'X' of undefined"
**Cause:** Accessing nested property without checking parent exists
**Solution:** Use optional chaining: `supplier.serviceProvider?.name`

### "Rendered fewer hooks than expected"
**Cause:** Conditional hook usage
**Solution:** Move hooks to top of component, never inside conditions

### "Objects are not valid as a React child"
**Cause:** Trying to render object directly
**Solution:** Convert to string or access property:
```tsx
{/* ❌ Wrong */}
<div>{supplier.serviceProvider}</div>

{/* ✅ Correct */}
<div>{supplier.serviceProvider.name}</div>
```

### "Maximum update depth exceeded"
**Cause:** setState called in render (infinite loop)
**Solution:** Move setState to event handler or useEffect

---

## Getting Help

If issue persists after following this guide:

1. **Check ARCHITECTURE.md** - Understand data flow
2. **Check VALIDATION.md** - Understand validation system
3. **Search codebase** - Look for similar field implementations
4. **Create minimal reproduction** - Isolate the issue
5. **Ask Claude Code** - Provide specific error message and code context

---

**Last Updated:** 2025-10-25
**Related Files:** ARCHITECTURE.md, VALIDATION.md, supplier-form.tsx, check-completeness.ts
