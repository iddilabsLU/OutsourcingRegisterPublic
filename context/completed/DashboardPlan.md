# Dashboard Implementation Plan

## Overview

Create a comprehensive analytics dashboard for CSSF Circular 22/806 compliance monitoring with **7 priority indicators**, professional charts, and real-time data aggregation.

**Implementation Approach:** Phase-by-phase with visual testing and PO approval between phases
**Target Users:** Compliance officers, risk managers, senior management
**Design:** Desktop-first, professional appearance, WCAG AAA accessible

---

## Table of Contents

1. [Scope & Goals](#scope--goals)
2. [CSSF Compliance Mapping](#cssf-compliance-mapping)
3. [Dashboard Design Specifications](#dashboard-design-specifications)
4. [Technical Design](#technical-design)
5. [Implementation Phases](#implementation-phases)
6. [Test Plan](#test-plan)
7. [Risk Log & Mitigations](#risk-log--mitigations)
8. [File Structure](#file-structure)
9. [Success Criteria](#success-criteria)

---

## Scope & Goals

### Primary Objectives

1. **Regulatory Compliance Monitoring** - Real-time tracking of CSSF Circular 22/806 obligations
2. **Risk Visibility** - Concentration risk, geographic risk, substitutability analysis
3. **Data Completeness** - Pending fields tracking and completeness metrics
4. **Proactive Alerts** - Overdue reviews, upcoming deadlines, missing notifications

### Out of Scope (Phase 1)

- Historical trend analysis (future: track metrics over time)
- Automated email notifications (future: alert system)
- Custom dashboard configuration (future: user preferences)
- Data export from dashboard (current: use main export feature)
- Mobile responsive design (desktop-first as per project guidelines)

---

## CSSF Compliance Mapping

### Point 54.i - Criticality Assessment Date
**Requirement:** Annual criticality assessment for ALL suppliers
**Dashboard Implementation:**
- Overdue assessment indicator (>365 days)
- Upcoming assessment indicator (within 30 days)
- Compliance rate metric (% assessed within 12 months)

### Point 55.c - Risk Assessment Date
**Requirement:** Annual risk assessment for CRITICAL suppliers
**Dashboard Implementation:**
- Overdue risk assessment indicator (>365 days)
- Upcoming risk assessment indicator (within 30 days)
- Risk distribution chart (High/Medium/Low)

### Point 55.f - Audit Information
**Requirement:** Regular audits for CRITICAL suppliers
**Dashboard Implementation:**
- Overdue audit indicator (past lastAuditDate, no nextScheduledAudit)
- Upcoming scheduled audits (within 90 days)

### Point 55.l - Regulatory Notification
**Requirement:** Prior notification to CSSF for critical outsourcing
**Dashboard Implementation:**
- Missing notification tracker (isCritical=true, no notificationDate)
- Non-compliance alert indicator

### Point 54.b - Renewal Dates
**Requirement:** Track outsourcing arrangement renewals
**Dashboard Implementation:**
- Upcoming renewals timeline (next 90 days)
- Renewal calendar view

---

## Dashboard Design Specifications

### Layout Structure

```
┌────────────────────────────────────────────────────────────────────┐
│  SUPPLIER REGISTER DASHBOARD                                       │
│  Comprehensive analytics for CSSF Circular 22/806 compliance       │
└────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│  🚨 COMPLIANCE ALERTS (Always visible - Red/Amber/Green status)     │
│  ┌────────────────┬────────────────┬────────────────────────────────┐
│  │ OVERDUE (Red)  │ UPCOMING (Amber) │ MISSING NOTIF (Red)          │
│  │ 5 criticality  │ 8 criticality   │ 3 suppliers not notified     │
│  │ 3 risk assess  │ 4 risk assess   │                              │
│  │ 2 audits       │ 2 audits        │                              │
│  └────────────────┴────────────────┴────────────────────────────────┘
└──────────────────────────────────────────────────────────────────────┘

┌────────────┬────────────┬────────────┬────────────┬────────────────┐
│ TOTAL      │ CRITICAL   │ CLOUD      │ PENDING    │ COMPLETENESS   │
│ 73         │ 28 (38%)   │ 15 (21%)   │ 12 (16%)   │ 85%            │
│ suppliers  │ functions  │ services   │ suppliers  │ overall        │
└────────────┴────────────┴────────────┴────────────┴────────────────┘

┌─────────────────────────────┬───────────────────────────────────────┐
│  STATUS BREAKDOWN           │  CATEGORY BREAKDOWN                   │
│  (Pie Chart)                │  (Bar Chart - Horizontal)             │
│                             │                                       │
│  • Active: 55 (75%)         │  Cloud: ████████████ 15               │
│  • Draft: 10 (14%)          │  ICT: ███████████████████ 25          │
│  • Not Yet Active: 5 (7%)   │  Payment: ███████ 10                  │
│  • Terminated: 3 (4%)       │  Compliance: ████ 6                   │
│                             │  Facilities: ███ 5                    │
│                             │  Marketing: ██ 3                      │
│                             │  Other: ████████ 12                   │
└─────────────────────────────┴───────────────────────────────────────┘

┌─────────────────────────────┬───────────────────────────────────────┐
│  UPCOMING REVIEWS (Timeline)│  RISK DISTRIBUTION (Critical only)    │
│                             │  (Bar Chart - Horizontal)             │
│  Next 30 days:              │                                       │
│  • 8 Criticality assess     │  High Risk: ████████ 8                │
│  • 4 Risk assessments       │  Medium Risk: ███████████████ 15      │
│  • 2 Audits                 │  Low Risk: ████ 5                     │
│                             │                                       │
│  30-90 days:                │  Total: 28 critical suppliers         │
│  • 3 Contract renewals      │                                       │
└─────────────────────────────┴───────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  PROVIDER CONCENTRATION RISK                                       │
│  ┌────────────────────────────────────────────────────────────────┐
│  │ Provider Name          │ Arrangements │ % of Total │ Risk      │
│  ├────────────────────────────────────────────────────────────────┤
│  │ AWS                    │ 8            │ 11%        │ ⚠️ High   │
│  │ Microsoft Azure        │ 5            │ 7%         │ Medium    │
│  │ Deloitte               │ 4            │ 5%         │ Medium    │
│  │ IBM                    │ 3            │ 4%         │ Low       │
│  └────────────────────────────────────────────────────────────────┘
│  ⚠️ Warning: AWS exceeds 10% concentration threshold               │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  GEOGRAPHIC DISTRIBUTION                                           │
│  ┌────────────────────────────────────────────────────────────────┐
│  │ Data Location Country  │ Count │ % of Total │ Jurisdictional   │
│  ├────────────────────────────────────────────────────────────────┤
│  │ Luxembourg             │ 35    │ 48%        │ ✅ EU            │
│  │ Germany                │ 18    │ 25%        │ ✅ EU            │
│  │ Ireland                │ 10    │ 14%        │ ✅ EU            │
│  │ USA                    │ 8     │ 11%        │ ⚠️ Non-EU       │
│  │ Switzerland            │ 2     │ 3%         │ ℹ️ EEA          │
│  └────────────────────────────────────────────────────────────────┘
│  Service Performance: EU-only: 55 (75%), Mixed: 15 (21%), Non-EU: 3│
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬───────────────────────────────────────┐
│  CRITICAL FUNCTIONS ANALYSIS│  REGULATORY NOTIFICATION STATUS       │
│                             │                                       │
│  Total Critical: 28         │  Critical suppliers: 28               │
│                             │  • Notified to CSSF: 25 (89%)         │
│  Group Relationships:       │  • Not yet notified: 3 (11%) 🚨       │
│  • Part of Group: 15 (54%)  │                                       │
│  • Owned by Group: 8 (29%)  │  Pending notifications:               │
│  • Independent: 5 (18%)     │  1. REF-2024-045 (Draft status)       │
│                             │  2. REF-2024-053 (Not Yet Active)     │
│  Substitutability:          │  3. REF-2024-061 (Active) 🚨          │
│  • Easy: 5 (18%)            │                                       │
│  • Difficult: 18 (64%) ⚠️   │                                       │
│  • Impossible: 5 (18%) 🚨   │                                       │
│                             │                                       │
│  Sub-Outsourcing:           │                                       │
│  • With sub-contractors: 12 │                                       │
│  • No sub-contractors: 16   │                                       │
└─────────────────────────────┴───────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│  DATA COMPLETENESS                                                 │
│  ┌────────────────────────────────────────────────────────────────┐
│  │ • 12 suppliers with pending fields (16% of total)              │
│  │ • 45 total pending fields across register                      │
│  │ • 85% overall completeness rate                                │
│  │                                                                 │
│  │ Top incomplete suppliers:                                       │
│  │ 1. REF-2024-003: 8 pending fields                              │
│  │ 2. REF-2024-007: 6 pending fields                              │
│  │ 3. REF-2024-012: 4 pending fields                              │
│  └────────────────────────────────────────────────────────────────┘
└────────────────────────────────────────────────────────────────────┘
```

---

## Indicator Specifications

### 1. Compliance Date Monitoring (Priority 1)

**CSSF References:** Points 54.i, 55.c, 55.f

#### Overdue Assessments Alert

**Data Sources:**
- `supplier.criticalityAssessmentDate` (ALL suppliers - Point 54.i)
- `supplier.criticalFields.riskAssessment.lastAssessmentDate` (Critical only - Point 55.c)
- `supplier.criticalFields.audit.lastAuditDate` (Critical only - Point 55.f)

**Calculation Logic:**
```typescript
function getOverdueAssessments(suppliers: SupplierOutsourcing[]): OverdueAssessments {
  const today = new Date()
  const overdueThreshold = 365 // days

  const overdueCriticality = suppliers.filter(s => {
    const daysSince = daysBetween(s.criticalityAssessmentDate, today)
    return daysSince > overdueThreshold
  })

  const overdueRisk = suppliers.filter(s => {
    if (!s.criticality.isCritical || !s.criticalFields?.riskAssessment.lastAssessmentDate) {
      return false
    }
    const daysSince = daysBetween(s.criticalFields.riskAssessment.lastAssessmentDate, today)
    return daysSince > overdueThreshold
  })

  const overdueAudits = suppliers.filter(s => {
    if (!s.criticality.isCritical || !s.criticalFields?.audit.lastAuditDate) {
      return false
    }
    const daysSince = daysBetween(s.criticalFields.audit.lastAuditDate, today)
    return daysSince > overdueThreshold
  })

  return {
    criticalityCount: overdueCriticality.length,
    riskCount: overdueRisk.length,
    auditCount: overdueAudits.length,
    suppliers: [...overdueCriticality, ...overdueRisk, ...overdueAudits]
  }
}
```

**Display:**
- Red alert badge if any count > 0
- "5 criticality assessments overdue"
- "3 risk assessments overdue"
- "2 audits overdue"
- Clicking expands to show supplier list with reference numbers

#### Upcoming Reviews (30 days)

**Calculation Logic:**
```typescript
function getUpcomingReviews(suppliers: SupplierOutsourcing[], days: number = 30): UpcomingReviews {
  const today = new Date()
  const upcomingMin = 335 // 365 - 30 days warning
  const upcomingMax = 365 // Annual requirement

  const upcomingCriticality = suppliers.filter(s => {
    const daysSince = daysBetween(s.criticalityAssessmentDate, today)
    return daysSince >= upcomingMin && daysSince <= upcomingMax
  })

  // Similar logic for risk assessments and audits

  return {
    criticalityCount: upcomingCriticality.length,
    riskCount: upcomingRisk.length,
    auditCount: upcomingAudits.length,
    suppliers: [...upcomingCriticality, ...upcomingRisk, ...upcomingAudits]
  }
}
```

**Display:**
- Amber warning badge if any count > 0
- "8 criticality assessments due soon (within 30 days)"
- Timeline view with dates

#### Upcoming Renewals (90 days)

**Data Source:** `supplier.dates.nextRenewalDate`

**Calculation Logic:**
```typescript
function getUpcomingRenewals(suppliers: SupplierOutsourcing[], days: number = 90): UpcomingRenewals {
  const today = new Date()
  const futureDate = addDays(today, days)

  const upcoming = suppliers.filter(s => {
    if (!s.dates.nextRenewalDate) return false
    const renewalDate = new Date(s.dates.nextRenewalDate)
    return renewalDate >= today && renewalDate <= futureDate
  })

  // Group by month
  const byMonth = groupBy(upcoming, s => {
    const date = new Date(s.dates.nextRenewalDate!)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
  })

  return {
    total: upcoming.length,
    byMonth,
    suppliers: upcoming.sort((a, b) =>
      new Date(a.dates.nextRenewalDate!).getTime() - new Date(b.dates.nextRenewalDate!).getTime()
    )
  }
}
```

**Display:**
- "3 renewals in next 90 days"
- Grouped by month: "Nov 2025: 3 suppliers", "Dec 2025: 5 suppliers"

---

### 2. Pending Fields Indicator (Priority 2)

**CSSF Reference:** Data quality monitoring (implicit requirement)

**Data Source:** `supplier.pendingFields` array

**Calculation Logic:**
```typescript
function getPendingFieldsMetrics(suppliers: SupplierOutsourcing[]): PendingFieldsMetrics {
  const suppliersWithPending = suppliers.filter(s =>
    s.pendingFields && s.pendingFields.length > 0
  )

  const totalPendingFields = suppliers.reduce((sum, s) =>
    sum + (s.pendingFields?.length || 0), 0
  )

  // Calculate completeness rate
  const totalFields = 52 // CSSF compliant fields per supplier
  const totalPossibleFields = suppliers.length * totalFields
  const completenessRate = ((totalPossibleFields - totalPendingFields) / totalPossibleFields) * 100

  // Top incomplete suppliers
  const topIncomplete = suppliersWithPending
    .sort((a, b) => (b.pendingFields?.length || 0) - (a.pendingFields?.length || 0))
    .slice(0, 5)

  return {
    suppliersWithPending: suppliersWithPending.length,
    totalPendingFields,
    completenessRate: Math.round(completenessRate),
    topIncomplete
  }
}
```

**Display:**
- Metric card: "12 suppliers with pending fields (16%)"
- "45 total pending fields across register"
- "85% overall completeness rate"
- Progress bar showing completeness
- Top 5 incomplete suppliers table

---

### 3. Overall Outsourcing Breakdown (Priority 3)

#### Key Metrics Cards

**Data Sources:** `suppliers` array

**Calculation Logic:**
```typescript
function getKeyMetrics(suppliers: SupplierOutsourcing[]): KeyMetrics {
  const total = suppliers.length
  const critical = suppliers.filter(s => s.criticality.isCritical).length
  const cloud = suppliers.filter(s => s.category === OutsourcingCategory.CLOUD).length
  const pending = suppliers.filter(s => s.pendingFields && s.pendingFields.length > 0).length

  return {
    total,
    critical,
    criticalPercentage: Math.round((critical / total) * 100),
    cloud,
    cloudPercentage: Math.round((cloud / total) * 100),
    pending,
    pendingPercentage: Math.round((pending / total) * 100)
  }
}
```

**Display:** 5 metric cards in row layout

#### Status Breakdown (Pie Chart)

**Data Source:** `supplier.status`

**Chart Spec:**
- **Type:** Pie chart with labels
- **Library:** Recharts `<PieChart>` + `<Pie>` + `<Cell>`
- **Colors:**
  - Active: `--chart-1` (navy blue)
  - Draft: `--chart-4` (amber)
  - Not Yet Active: `--chart-2` (sage green)
  - Terminated: `--muted` (gray)
- **Labels:** Show count and percentage
- **Legend:** Bottom position

**Calculation:**
```typescript
function getStatusBreakdown(suppliers: SupplierOutsourcing[]): StatusBreakdown[] {
  const counts = suppliers.reduce((acc, s) => {
    acc[s.status] = (acc[s.status] || 0) + 1
    return acc
  }, {} as Record<OutsourcingStatus, number>)

  return Object.entries(counts).map(([status, count]) => ({
    name: status,
    value: count,
    percentage: Math.round((count / suppliers.length) * 100)
  }))
}
```

#### Category Breakdown (Bar Chart)

**Data Source:** `supplier.category`

**Chart Spec:**
- **Type:** Horizontal bar chart
- **Library:** Recharts `<BarChart>` + `<Bar>` (layout="vertical")
- **Color:** `--primary` (ink blue)
- **X-Axis:** Count (0 to max)
- **Y-Axis:** Category names
- **Data Labels:** Show count at end of bar

**Calculation:**
```typescript
function getCategoryBreakdown(suppliers: SupplierOutsourcing[]): CategoryBreakdown[] {
  const counts = suppliers.reduce((acc, s) => {
    acc[s.category] = (acc[s.category] || 0) + 1
    return acc
  }, {} as Record<OutsourcingCategory, number>)

  return Object.entries(counts)
    .map(([category, count]) => ({
      name: category,
      count,
      percentage: Math.round((count / suppliers.length) * 100)
    }))
    .sort((a, b) => b.count - a.count) // Descending by count
}
```

#### Risk Distribution (Bar Chart - Critical Only)

**Data Source:** `supplier.criticalFields.riskAssessment.risk`

**Chart Spec:**
- **Type:** Horizontal bar chart
- **Colors:**
  - High Risk: `--destructive` (red)
  - Medium Risk: `--chart-4` (amber)
  - Low Risk: `--chart-2` (sage green)
- **X-Axis:** Count
- **Y-Axis:** Risk levels

**Calculation:**
```typescript
function getRiskDistribution(suppliers: SupplierOutsourcing[]): RiskDistribution[] {
  const critical = suppliers.filter(s => s.criticality.isCritical)

  const counts = critical.reduce((acc, s) => {
    const risk = s.criticalFields?.riskAssessment.risk || 'Unknown'
    acc[risk] = (acc[risk] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return [
    { name: 'High Risk', count: counts[RiskLevel.HIGH] || 0 },
    { name: 'Medium Risk', count: counts[RiskLevel.MEDIUM] || 0 },
    { name: 'Low Risk', count: counts[RiskLevel.LOW] || 0 }
  ]
}
```

---

### 4. Provider Concentration Risk (Priority 4)

**CSSF Reference:** Concentration risk monitoring (implicit requirement)

**Data Source:** `supplier.serviceProvider.name`

**Calculation Logic:**
```typescript
function getProviderConcentration(suppliers: SupplierOutsourcing[]): ProviderConcentration[] {
  const total = suppliers.length
  const threshold = 10 // 10% concentration = high risk

  const counts = suppliers.reduce((acc, s) => {
    const provider = s.serviceProvider.name
    acc[provider] = (acc[provider] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const concentration = Object.entries(counts)
    .map(([provider, count]) => {
      const percentage = Math.round((count / total) * 100)
      let risk: 'High' | 'Medium' | 'Low' = 'Low'
      if (percentage >= 10) risk = 'High'
      else if (percentage >= 5) risk = 'Medium'

      return { provider, count, percentage, risk }
    })
    .filter(p => p.count > 1) // Only show providers with multiple arrangements
    .sort((a, b) => b.count - a.count) // Descending

  return concentration
}
```

**Display:**
- Table with columns: Provider Name | Arrangements | % of Total | Risk
- Warning banner if any provider exceeds 10% threshold
- Color-coded risk badges (red, amber, gray)

---

### 5. Geographic Distribution (Priority 5)

**CSSF Reference:** Geographic/jurisdictional risk (implicit)

**Data Sources:**
- `supplier.location.dataLocationCountry`
- `supplier.location.servicePerformanceCountries` (array)

**Calculation Logic:**
```typescript
function getGeographicDistribution(suppliers: SupplierOutsourcing[]): {
  dataLocation: GeographicBreakdown[]
  servicePerformance: ServicePerformanceBreakdown
} {
  const total = suppliers.length

  // Data location country
  const dataLocationCounts = suppliers.reduce((acc, s) => {
    const country = s.location.dataLocationCountry
    acc[country] = (acc[country] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dataLocation = Object.entries(dataLocationCounts)
    .map(([country, count]) => ({
      country,
      count,
      percentage: Math.round((count / total) * 100),
      jurisdiction: classifyJurisdiction(country) // 'EU', 'Non-EU', 'EEA'
    }))
    .sort((a, b) => b.count - a.count)

  // Service performance countries (EU-only, Mixed, Non-EU)
  const euOnly = suppliers.filter(s =>
    s.location.servicePerformanceCountries.every(c => isEU(c))
  ).length

  const nonEuOnly = suppliers.filter(s =>
    s.location.servicePerformanceCountries.every(c => !isEU(c))
  ).length

  const mixed = total - euOnly - nonEuOnly

  return {
    dataLocation,
    servicePerformance: {
      euOnly,
      mixed,
      nonEuOnly,
      euOnlyPercentage: Math.round((euOnly / total) * 100),
      mixedPercentage: Math.round((mixed / total) * 100),
      nonEuOnlyPercentage: Math.round((nonEuOnly / total) * 100)
    }
  }
}

function classifyJurisdiction(country: string): 'EU' | 'Non-EU' | 'EEA' {
  const euCountries = [
    'Luxembourg', 'Germany', 'France', 'Belgium', 'Ireland', 'Netherlands',
    'Italy', 'Spain', 'Portugal', 'Austria', 'Poland', 'Sweden', 'Denmark',
    'Finland', 'Greece', 'Czech Republic', 'Romania', 'Hungary', 'Croatia',
    'Slovakia', 'Slovenia', 'Bulgaria', 'Lithuania', 'Latvia', 'Estonia',
    'Cyprus', 'Malta'
  ]
  const eeaCountries = ['Norway', 'Iceland', 'Liechtenstein', 'Switzerland']

  if (euCountries.includes(country)) return 'EU'
  if (eeaCountries.includes(country)) return 'EEA'
  return 'Non-EU'
}

function isEU(country: string): boolean {
  return classifyJurisdiction(country) === 'EU'
}
```

**Display:**
- Table: Data Location Country | Count | % of Total | Jurisdictional Status
- Color-coded badges: ✅ EU (green), ⚠️ Non-EU (amber), ℹ️ EEA (blue)
- Summary: "Service Performance: EU-only: 55 (75%), Mixed: 15 (21%), Non-EU: 3 (4%)"

---

### 6. Critical Functions Deep Dive (Priority 6)

**CSSF Reference:** Point 55 analysis

**Data Sources:** `supplier.criticalFields.*`

**Calculation Logic:**
```typescript
function getCriticalFunctionsAnalysis(suppliers: SupplierOutsourcing[]): CriticalAnalysis {
  const critical = suppliers.filter(s => s.criticality.isCritical)
  const total = critical.length

  // Group relationships
  const partOfGroup = critical.filter(s =>
    s.criticalFields?.groupRelationship.isPartOfGroup
  ).length
  const ownedByGroup = critical.filter(s =>
    s.criticalFields?.groupRelationship.isOwnedByGroup
  ).length
  const independent = total - partOfGroup

  // Substitutability
  const easy = critical.filter(s =>
    s.criticalFields?.substitutability.outcome === SubstitutabilityOutcome.EASY
  ).length
  const difficult = critical.filter(s =>
    s.criticalFields?.substitutability.outcome === SubstitutabilityOutcome.DIFFICULT
  ).length
  const impossible = critical.filter(s =>
    s.criticalFields?.substitutability.outcome === SubstitutabilityOutcome.IMPOSSIBLE
  ).length

  // Sub-outsourcing
  const withSubContractors = critical.filter(s =>
    s.criticalFields?.subOutsourcing?.hasSubOutsourcing === true
  ).length
  const withoutSubContractors = total - withSubContractors

  return {
    total,
    groupRelationship: {
      partOfGroup,
      ownedByGroup,
      independent,
      partOfGroupPercentage: Math.round((partOfGroup / total) * 100),
      ownedByGroupPercentage: Math.round((ownedByGroup / total) * 100),
      independentPercentage: Math.round((independent / total) * 100)
    },
    substitutability: {
      easy,
      difficult,
      impossible,
      easyPercentage: Math.round((easy / total) * 100),
      difficultPercentage: Math.round((difficult / total) * 100),
      impossiblePercentage: Math.round((impossible / total) * 100)
    },
    subOutsourcing: {
      withSubContractors,
      withoutSubContractors,
      withPercentage: Math.round((withSubContractors / total) * 100),
      withoutPercentage: Math.round((withoutSubContractors / total) * 100)
    }
  }
}
```

**Display:**
- Card layout with three sections
- Color-coded indicators: ⚠️ for Difficult, 🚨 for Impossible substitutability
- Percentage breakdowns for each metric

---

### 7. Regulatory Notification Tracker (Priority 7)

**CSSF Reference:** Point 55.l - Regulatory Notification

**Data Source:** `supplier.criticalFields.regulatoryNotification.notificationDate`

**Calculation Logic:**
```typescript
function getRegulatoryNotificationStatus(suppliers: SupplierOutsourcing[]): NotificationStatus {
  const critical = suppliers.filter(s => s.criticality.isCritical)
  const total = critical.length

  const notified = critical.filter(s =>
    s.criticalFields?.regulatoryNotification?.notificationDate
  )

  const notNotified = critical.filter(s =>
    !s.criticalFields?.regulatoryNotification?.notificationDate
  )

  return {
    total,
    notifiedCount: notified.length,
    notNotifiedCount: notNotified.length,
    notifiedPercentage: Math.round((notified.length / total) * 100),
    notNotifiedPercentage: Math.round((notNotified.length / total) * 100),
    pendingNotifications: notNotified.map(s => ({
      referenceNumber: s.referenceNumber,
      providerName: s.serviceProvider.name,
      status: s.status,
      isNonCompliant: s.status === OutsourcingStatus.ACTIVE // Red flag if Active
    }))
  }
}
```

**Display:**
- Metric: "25 notified (89%), 3 not yet notified (11%)"
- Red alert 🚨 if any Active supplier is not notified
- List of pending notifications with reference numbers
- Status badge to distinguish Draft/Not Yet Active (acceptable) from Active (non-compliant)

---

## Technical Design

### Dependencies

**New Packages to Install:**
```bash
npm install recharts
npm install --save-dev @types/recharts
```

**Version:** `recharts@^2.10.0` (latest stable)

### Folder Structure

```
lib/
└── utils/
    └── dashboard-analytics.ts      # All calculation functions (new)

components/
└── shared/
    └── dashboard/
        ├── dashboard-view.tsx                # Main container (new)
        ├── compliance-alerts.tsx             # Alert section (new)
        ├── metrics-cards.tsx                 # 5 metric cards (new)
        ├── charts/
        │   ├── status-pie-chart.tsx          # Status breakdown (new)
        │   ├── category-bar-chart.tsx        # Category breakdown (new)
        │   ├── risk-bar-chart.tsx            # Risk distribution (new)
        │   └── chart-container.tsx           # Reusable wrapper (new)
        ├── tables/
        │   ├── provider-concentration-table.tsx  # Provider table (new)
        │   ├── geographic-distribution-table.tsx # Geographic table (new)
        │   └── pending-notifications-list.tsx    # Notification list (new)
        ├── critical-functions-card.tsx       # Critical analysis (new)
        └── data-completeness-card.tsx        # Pending fields (new)
```

### Type Definitions

```typescript
// lib/types/dashboard.ts (new file)

export interface OverdueAssessments {
  criticalityCount: number
  riskCount: number
  auditCount: number
  suppliers: SupplierOutsourcing[]
}

export interface UpcomingReviews {
  criticalityCount: number
  riskCount: number
  auditCount: number
  suppliers: SupplierOutsourcing[]
}

export interface UpcomingRenewals {
  total: number
  byMonth: Record<string, SupplierOutsourcing[]>
  suppliers: SupplierOutsourcing[]
}

export interface KeyMetrics {
  total: number
  critical: number
  criticalPercentage: number
  cloud: number
  cloudPercentage: number
  pending: number
  pendingPercentage: number
}

export interface StatusBreakdown {
  name: string
  value: number
  percentage: number
}

export interface CategoryBreakdown {
  name: string
  count: number
  percentage: number
}

export interface RiskDistribution {
  name: string
  count: number
}

export interface ProviderConcentration {
  provider: string
  count: number
  percentage: number
  risk: 'High' | 'Medium' | 'Low'
}

export interface GeographicBreakdown {
  country: string
  count: number
  percentage: number
  jurisdiction: 'EU' | 'Non-EU' | 'EEA'
}

export interface ServicePerformanceBreakdown {
  euOnly: number
  mixed: number
  nonEuOnly: number
  euOnlyPercentage: number
  mixedPercentage: number
  nonEuOnlyPercentage: number
}

export interface CriticalAnalysis {
  total: number
  groupRelationship: {
    partOfGroup: number
    ownedByGroup: number
    independent: number
    partOfGroupPercentage: number
    ownedByGroupPercentage: number
    independentPercentage: number
  }
  substitutability: {
    easy: number
    difficult: number
    impossible: number
    easyPercentage: number
    difficultPercentage: number
    impossiblePercentage: number
  }
  subOutsourcing: {
    withSubContractors: number
    withoutSubContractors: number
    withPercentage: number
    withoutPercentage: number
  }
}

export interface NotificationStatus {
  total: number
  notifiedCount: number
  notNotifiedCount: number
  notifiedPercentage: number
  notNotifiedPercentage: number
  pendingNotifications: {
    referenceNumber: string
    providerName: string
    status: OutsourcingStatus
    isNonCompliant: boolean
  }[]
}

export interface PendingFieldsMetrics {
  suppliersWithPending: number
  totalPendingFields: number
  completenessRate: number
  topIncomplete: SupplierOutsourcing[]
}
```

### Chart Color Mapping

**CSS Variables from globals.css:**
```typescript
// Use existing chart colors
const CHART_COLORS = {
  chart1: 'hsl(var(--chart-1))',  // navy - for primary data
  chart2: 'hsl(var(--chart-2))',  // sage - for secondary/low risk
  chart3: 'hsl(var(--chart-3))',  // terracotta - for accents
  chart4: 'hsl(var(--chart-4))',  // amber - for warnings
  chart5: 'hsl(var(--chart-5))',  // plum - for variety
  destructive: 'hsl(var(--destructive))', // red - for high risk/overdue
  muted: 'hsl(var(--muted))',     // gray - for inactive/terminated
  primary: 'hsl(var(--primary))'  // ink blue - for main charts
}
```

**Chart-Specific Colors:**

**Status Pie Chart:**
- Active: `--chart-1` (navy)
- Draft: `--chart-4` (amber)
- Not Yet Active: `--chart-2` (sage)
- Terminated: `--muted` (gray)

**Risk Bar Chart:**
- High: `--destructive` (red)
- Medium: `--chart-4` (amber)
- Low: `--chart-2` (sage)

**Generic Bar Charts:**
- Single color: `--primary` (ink blue)

### State Management

**No global state needed** - Dashboard is read-only view

**Props flow:**
```typescript
// suppliers/page.tsx
const [suppliers, setSuppliers] = useSessionStorage()

// Pass to dashboard
<DashboardView suppliers={suppliers} />

// DashboardView computes all metrics from suppliers prop
// No local state needed except for UI (expanded sections, etc.)
```

### Performance Considerations

**Current Scale:** 5 sample suppliers → Very fast
**Expected Scale:** 50-100 suppliers → Still fast
**Optimization Strategy:** None needed for Phase 1

**Future (if >100 suppliers):**
- Memoize calculations with `useMemo()`
- Lazy load chart components
- Virtualize long tables

### Accessibility

**WCAG AAA Requirements:**
- ✅ Color contrast 7:1 (use CSS variables, already compliant)
- ✅ Charts have text labels (not just color-coded)
- ✅ Tables have proper headers and ARIA labels
- ✅ Keyboard navigation (all shadcn components accessible)
- ✅ Screen reader support (semantic HTML, ARIA labels)
- ✅ Focus indicators (default Tailwind styles)

**Specific Implementations:**
- Alert sections: Use `role="alert"` for overdue items
- Charts: Add `aria-label` with data summary
- Tables: Use `<th scope="col">` for headers
- Metric cards: Use semantic `<article>` elements

---

## Implementation Phases

### Phase 1: MVP Dashboard (4-6 hours)

**Goal:** Core compliance monitoring with key metrics and basic charts

#### Sub-Phase 1.1: Setup & Infrastructure (30 min)

**Tasks:**
1. Install Recharts dependency
   ```bash
   npm install recharts
   npm install --save-dev @types/recharts
   ```
2. Create `lib/types/dashboard.ts` with all type definitions
3. Create folder structure: `components/shared/dashboard/`
4. Create `lib/utils/dashboard-analytics.ts` (stub file)

**Done means:**
- ✅ Recharts installed, no TypeScript errors
- ✅ Folder structure created
- ✅ Type definitions file exists and exports all interfaces

**Test:** Run `npm run build` - should succeed with 0 errors

---

#### Sub-Phase 1.2: Analytics Utilities (1 hour)

**Tasks:**
1. Implement date helper functions:
   - `daysBetween(dateString1, dateString2): number`
   - `addDays(date, days): Date`
   - `groupBy(array, keyFn): Record<string, T[]>`
2. Implement calculation functions:
   - `getOverdueAssessments(suppliers)`
   - `getUpcomingReviews(suppliers, days)`
   - `getUpcomingRenewals(suppliers, days)`
   - `getKeyMetrics(suppliers)`
   - `getPendingFieldsMetrics(suppliers)`

**Done means:**
- ✅ All 5 functions exported from `dashboard-analytics.ts`
- ✅ TypeScript types match return interfaces
- ✅ Date logic handles edge cases (invalid dates, missing fields)

**Test:**
- Import functions in suppliers/page.tsx
- Call with dummy suppliers array
- Console.log results - verify numbers match manual count

---

#### Sub-Phase 1.3: Compliance Alerts Section (1 hour)

**Tasks:**
1. Create `components/shared/dashboard/compliance-alerts.tsx`
2. Display overdue counts (criticality, risk, audit)
3. Display upcoming counts (criticality, risk, audit)
4. Display missing notifications count
5. Color-coded badges: Red (overdue), Amber (upcoming), Green (compliant)
6. Implement collapsible supplier lists (click to expand)

**Component Signature:**
```typescript
interface ComplianceAlertsProps {
  suppliers: SupplierOutsourcing[]
}

export function ComplianceAlerts({ suppliers }: ComplianceAlertsProps) {
  const overdue = getOverdueAssessments(suppliers)
  const upcoming = getUpcomingReviews(suppliers)
  const notifications = getRegulatoryNotificationStatus(suppliers)

  // Render alert cards...
}
```

**Done means:**
- ✅ Alert section renders with 3 cards (Overdue, Upcoming, Missing Notifications)
- ✅ Correct counts displayed
- ✅ Color-coded badges (destructive, amber, muted)
- ✅ Expandable lists show supplier reference numbers

**Test at localhost:3000:**
- Navigate to Dashboard view
- Verify overdue count matches suppliers with >365 day assessments
- Verify upcoming count matches 335-365 day range
- Verify missing notifications count matches critical suppliers without notificationDate

**PO Sign-Off Required:** ✋ Approve alert section before proceeding

---

#### Sub-Phase 1.4: Key Metrics Cards (45 min)

**Tasks:**
1. Create `components/shared/dashboard/metrics-cards.tsx`
2. Display 5 cards in grid layout:
   - Total Suppliers (count)
   - Critical Functions (count + percentage)
   - Cloud Services (count + percentage)
   - Pending Fields (count + percentage)
   - Completeness Rate (percentage with progress bar)

**Component Signature:**
```typescript
interface MetricsCardsProps {
  suppliers: SupplierOutsourcing[]
}

export function MetricsCards({ suppliers }: MetricsCardsProps) {
  const metrics = getKeyMetrics(suppliers)
  const pending = getPendingFieldsMetrics(suppliers)

  // Render 5 cards...
}
```

**Done means:**
- ✅ 5 cards displayed in responsive grid (5 cols on desktop, 2 on tablet, 1 on mobile)
- ✅ Cards use shadcn Card component
- ✅ Percentages shown in muted text
- ✅ Icons from lucide-react (Users, Shield, Cloud, Pin, CheckCircle)

**Test at localhost:3000:**
- Verify total count = 5 (dummy data)
- Verify critical count = 3 (60%)
- Verify cloud count = matches suppliers with category=Cloud
- Verify pending count = suppliers with pendingFields array

**PO Sign-Off Required:** ✋ Approve metrics cards before proceeding

---

#### Sub-Phase 1.5: Status & Category Charts (1.5 hours)

**Tasks:**
1. Create `components/shared/dashboard/charts/chart-container.tsx` (reusable wrapper)
2. Create `components/shared/dashboard/charts/status-pie-chart.tsx`
   - Recharts `<PieChart>` with custom colors
   - Legend at bottom
   - Labels show percentage
3. Create `components/shared/dashboard/charts/category-bar-chart.tsx`
   - Recharts `<BarChart>` horizontal layout
   - Primary color bars
   - Data labels at end of bars
4. Implement `getStatusBreakdown()` and `getCategoryBreakdown()` in analytics

**ChartContainer Props:**
```typescript
interface ChartContainerProps {
  title: string
  description?: string
  children: React.ReactNode
}
```

**Done means:**
- ✅ Both charts render correctly
- ✅ Colors use CSS variables (--chart-1, --chart-4, etc.)
- ✅ Responsive sizing (fits in dashboard grid)
- ✅ Accessible (aria-label on charts)

**Test at localhost:3000:**
- Verify pie chart shows 4 segments (Active, Draft, Not Yet Active, Terminated)
- Verify category bar chart shows all categories in descending order
- Verify colors match design spec
- Verify charts are readable and professional

**PO Sign-Off Required:** ✋ Approve charts before proceeding

---

#### Sub-Phase 1.6: Main Dashboard Container (45 min)

**Tasks:**
1. Create `components/shared/dashboard/dashboard-view.tsx`
2. Import and compose all Phase 1 components
3. Layout with proper spacing and sections
4. Add section headers with descriptions

**Component Structure:**
```typescript
export function DashboardView({ suppliers }: { suppliers: SupplierOutsourcing[] }) {
  return (
    <div className="space-y-8">
      {/* Compliance Alerts */}
      <ComplianceAlerts suppliers={suppliers} />

      {/* Metrics Cards */}
      <MetricsCards suppliers={suppliers} />

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <StatusPieChart suppliers={suppliers} />
        <CategoryBarChart suppliers={suppliers} />
      </div>
    </div>
  )
}
```

**Done means:**
- ✅ Dashboard renders all Phase 1 components
- ✅ Proper spacing and layout
- ✅ Section headers with CSSF references
- ✅ Professional appearance

**Test at localhost:3000:**
- Navigate to Dashboard tab
- Verify all sections render
- Verify layout is clean and professional
- Verify spacing matches design
- Test with filtered data (apply filters → switch to dashboard → verify metrics update)

**PO Sign-Off Required:** ✋ Approve Phase 1 MVP before proceeding to Phase 2

---

### Phase 2: Risk Management (2-3 hours)

**Goal:** Provider concentration and geographic distribution analysis

#### Sub-Phase 2.1: Risk Distribution Chart (45 min)

**Tasks:**
1. Create `components/shared/dashboard/charts/risk-bar-chart.tsx`
2. Implement `getRiskDistribution()` in analytics
3. Horizontal bar chart with color-coded risk levels
4. Show only critical suppliers (filter in component)

**Done means:**
- ✅ Chart shows 3 bars (High, Medium, Low)
- ✅ Colors: High=red, Medium=amber, Low=sage
- ✅ Data labels show counts
- ✅ Chart labeled "Critical Suppliers Only"

**Test at localhost:3000:**
- Verify counts match manual count of critical suppliers by risk level
- Verify colors are distinct and accessible

---

#### Sub-Phase 2.2: Upcoming Reviews Timeline (1 hour)

**Tasks:**
1. Create `components/shared/dashboard/upcoming-reviews-card.tsx`
2. Display upcoming assessments/audits in list format
3. Group by time period: "Next 30 days", "30-90 days"
4. Show counts for each type (criticality, risk, audit)

**Done means:**
- ✅ Card renders with two sections (30 days, 90 days)
- ✅ Counts are accurate
- ✅ Clean list layout with icons

**Test at localhost:3000:**
- Verify counts match date calculations
- Verify grouping is correct

---

#### Sub-Phase 2.3: Provider Concentration Table (1 hour)

**Tasks:**
1. Create `components/shared/dashboard/tables/provider-concentration-table.tsx`
2. Implement `getProviderConcentration()` in analytics
3. Table with 4 columns: Provider | Arrangements | % of Total | Risk
4. Color-coded risk badges
5. Warning banner if any provider >10%

**Done means:**
- ✅ Table shows only providers with multiple arrangements
- ✅ Sorted descending by count
- ✅ Risk badges color-coded
- ✅ Warning banner appears if threshold exceeded

**Test at localhost:3000:**
- Verify providers are grouped correctly
- Verify percentages are accurate
- Verify risk thresholds (High ≥10%, Medium ≥5%, Low <5%)
- Verify warning banner logic

**PO Sign-Off Required:** ✋ Approve provider concentration before proceeding

---

#### Sub-Phase 2.4: Geographic Distribution Table (1.5 hours)

**Tasks:**
1. Create `components/shared/dashboard/tables/geographic-distribution-table.tsx`
2. Implement `getGeographicDistribution()` and jurisdiction helper functions
3. Table: Data Location Country | Count | % | Jurisdictional Status
4. EU/Non-EU/EEA badges with icons
5. Summary row: Service performance breakdown

**Done means:**
- ✅ Table shows all data location countries
- ✅ Sorted descending by count
- ✅ Jurisdiction badges: ✅ EU (green), ⚠️ Non-EU (amber), ℹ️ EEA (blue)
- ✅ Summary shows EU-only, Mixed, Non-EU service performance counts

**Test at localhost:3000:**
- Verify jurisdiction classification (Luxembourg = EU, USA = Non-EU, Switzerland = EEA)
- Verify service performance logic (all countries in array must be EU for "EU-only")
- Verify percentages sum to 100%

**PO Sign-Off Required:** ✋ Approve Phase 2 risk management before proceeding to Phase 3

---

### Phase 3: Deep Dive Analytics (2-3 hours)

**Goal:** Critical functions analysis and regulatory notification tracking

#### Sub-Phase 3.1: Critical Functions Analysis Card (1.5 hours)

**Tasks:**
1. Create `components/shared/dashboard/critical-functions-card.tsx`
2. Implement `getCriticalFunctionsAnalysis()` in analytics
3. Display 3 sections:
   - Group Relationships (Part of Group, Owned by Group, Independent)
   - Substitutability (Easy, Difficult, Impossible)
   - Sub-Outsourcing (With/Without sub-contractors)
4. Color-coded indicators for risk (⚠️ Difficult, 🚨 Impossible)

**Done means:**
- ✅ Card shows 3 metric sections
- ✅ Percentages calculated correctly
- ✅ Icons/emojis for visual indicators
- ✅ Professional layout

**Test at localhost:3000:**
- Verify counts match manual count of critical suppliers
- Verify percentages accurate
- Verify only critical suppliers included in analysis
- Verify substitutability risk indicators display

---

#### Sub-Phase 3.2: Regulatory Notification Tracker (1 hour)

**Tasks:**
1. Create `components/shared/dashboard/tables/pending-notifications-list.tsx`
2. Implement `getRegulatoryNotificationStatus()` in analytics
3. Display:
   - Metric: "X notified (Y%), Z not yet notified (W%)"
   - List of pending notifications with reference numbers
   - Status badges (Draft, Not Yet Active, Active)
   - Red alert 🚨 if Active supplier not notified

**Done means:**
- ✅ Metric shows correct counts and percentages
- ✅ List shows only critical suppliers without notificationDate
- ✅ Red alert for Active suppliers (non-compliant)
- ✅ Amber/gray for Draft/Not Yet Active (acceptable)

**Test at localhost:3000:**
- Verify only critical suppliers checked
- Verify notificationDate presence checked correctly
- Verify Active suppliers flagged as non-compliant
- Verify Draft suppliers not flagged (expected to be pending)

---

#### Sub-Phase 3.3: Data Completeness Card (45 min)

**Tasks:**
1. Create `components/shared/dashboard/data-completeness-card.tsx`
2. Display:
   - Suppliers with pending fields count
   - Total pending fields count
   - Overall completeness rate with progress bar
   - Top 5 incomplete suppliers table

**Done means:**
- ✅ All 4 metrics displayed
- ✅ Progress bar visual (use shadcn Progress component)
- ✅ Top 5 table shows reference numbers and pending count
- ✅ Sorted descending by pending count

**Test at localhost:3000:**
- Verify pending fields count matches suppliers array
- Verify completeness rate calculation: (1 - (total pending / total possible)) * 100
- Verify top 5 sorted correctly

---

#### Sub-Phase 3.4: Integration & Polish (30 min)

**Tasks:**
1. Update `dashboard-view.tsx` to include Phase 2 and 3 components
2. Adjust layout and spacing
3. Add section dividers and headers
4. Final visual polish

**Done means:**
- ✅ All 7 indicators integrated into dashboard
- ✅ Sections clearly separated
- ✅ Headers with CSSF references where applicable
- ✅ Professional, clean appearance

**Test at localhost:3000:**
- Full end-to-end test of all dashboard features
- Verify layout on different screen sizes (desktop, tablet)
- Verify scroll behavior (long content)
- Verify color consistency

**PO Sign-Off Required:** ✋ Final approval of complete dashboard

---

## Test Plan

### Unit Tests (Future - Not in Phase 1)

**Test Coverage for Analytics Functions:**
```typescript
// lib/utils/dashboard-analytics.test.ts (future)

describe('getOverdueAssessments', () => {
  it('should identify suppliers with assessments >365 days old', () => {
    const result = getOverdueAssessments(mockSuppliers)
    expect(result.criticalityCount).toBe(2)
  })

  it('should handle missing dates gracefully', () => {
    const result = getOverdueAssessments(suppliersWithMissingDates)
    expect(result.criticalityCount).toBe(0)
  })

  it('should only check risk assessments for critical suppliers', () => {
    const result = getOverdueAssessments(mixedSuppliers)
    expect(result.riskCount).toBeLessThanOrEqual(criticalCount)
  })
})
```

**Not implemented in Phase 1** - Manual testing sufficient for 5 suppliers

---

### Visual QA Checklist (PO Performs)

#### Phase 1 MVP Testing

**Compliance Alerts Section:**
- [ ] Overdue count displays correct number
- [ ] Overdue suppliers are actually >365 days old (verify manually)
- [ ] Upcoming count displays correct number (335-365 day range)
- [ ] Missing notifications count matches critical suppliers without date
- [ ] Red badges for overdue items
- [ ] Amber badges for upcoming items
- [ ] Expandable lists show correct reference numbers
- [ ] Click to expand/collapse works smoothly

**Metrics Cards:**
- [ ] Total suppliers = 5 (or current count)
- [ ] Critical count = suppliers with isCritical=true
- [ ] Cloud count = suppliers with category=Cloud
- [ ] Pending count = suppliers with pendingFields.length > 0
- [ ] Percentages calculated correctly (manual verification)
- [ ] Cards are evenly sized and aligned
- [ ] Icons display correctly
- [ ] Text is readable and properly sized

**Status Pie Chart:**
- [ ] All status values represented (Active, Draft, Not Yet Active, Terminated)
- [ ] Percentages sum to 100%
- [ ] Colors match design spec (navy, amber, sage, gray)
- [ ] Legend displays at bottom
- [ ] Labels readable and not overlapping
- [ ] Chart is centered and properly sized

**Category Bar Chart:**
- [ ] All categories represented
- [ ] Bars sorted descending by count
- [ ] Data labels show correct counts
- [ ] Bars use primary color (ink blue)
- [ ] Chart is readable and professional
- [ ] Y-axis labels not truncated

**Overall Dashboard:**
- [ ] All sections render without errors
- [ ] Spacing is consistent (8 units between sections)
- [ ] Dashboard scrolls smoothly if content is long
- [ ] No visual glitches or overlapping elements
- [ ] Professional appearance suitable for management presentation

---

#### Phase 2 Risk Management Testing

**Risk Distribution Chart:**
- [ ] Only shows critical suppliers (verify count)
- [ ] Three bars: High, Medium, Low
- [ ] Colors: High=red, Medium=amber, Low=sage
- [ ] Counts match manual verification
- [ ] Chart labeled "Critical Suppliers Only"

**Upcoming Reviews Timeline:**
- [ ] Next 30 days section shows correct counts
- [ ] 30-90 days section shows correct counts
- [ ] Date ranges calculated correctly (verify samples)
- [ ] Grouped by assessment type (criticality, risk, audit)

**Provider Concentration Table:**
- [ ] Only shows providers with multiple arrangements
- [ ] Sorted descending by count
- [ ] Percentages accurate (sum may exceed 100% if suppliers share providers)
- [ ] Risk badges: High (≥10%), Medium (≥5%), Low (<5%)
- [ ] Warning banner appears if any provider ≥10%
- [ ] Table is readable and well-formatted

**Geographic Distribution Table:**
- [ ] All data location countries listed
- [ ] Sorted descending by count
- [ ] Percentages sum to 100%
- [ ] Jurisdiction badges correct: ✅ EU, ⚠️ Non-EU, ℹ️ EEA
- [ ] Luxembourg = EU (verify)
- [ ] USA = Non-EU (verify)
- [ ] Switzerland = EEA (verify)
- [ ] Service performance summary correct (EU-only, Mixed, Non-EU)

---

#### Phase 3 Deep Dive Testing

**Critical Functions Card:**
- [ ] Only includes critical suppliers (verify count)
- [ ] Group relationships percentages sum to 100%
- [ ] Substitutability percentages sum to 100%
- [ ] Sub-outsourcing percentages sum to 100%
- [ ] Icons display: ⚠️ for Difficult, 🚨 for Impossible
- [ ] All three sections clearly separated

**Regulatory Notification Tracker:**
- [ ] Only checks critical suppliers
- [ ] Notified count = critical suppliers WITH notificationDate
- [ ] Not notified count = critical suppliers WITHOUT notificationDate
- [ ] Percentages sum to 100%
- [ ] List shows correct reference numbers
- [ ] Active suppliers without notification show 🚨 (red alert)
- [ ] Draft/Not Yet Active suppliers show normal status badge

**Data Completeness Card:**
- [ ] Suppliers with pending count correct
- [ ] Total pending fields count correct (sum all pendingFields arrays)
- [ ] Completeness rate accurate (manual calculation verification)
- [ ] Progress bar visually represents percentage
- [ ] Top 5 table sorted descending by pending count
- [ ] Reference numbers correct

**Final Integration:**
- [ ] All 7 indicators present
- [ ] Layout is balanced and professional
- [ ] Section headers clear and descriptive
- [ ] CSSF references included where applicable
- [ ] Color scheme consistent throughout
- [ ] No TypeScript errors in console
- [ ] Dashboard loads within 2 seconds (with 5 suppliers)

---

### Edge Case Testing

#### Empty Data Scenarios

**Test: Zero suppliers**
- [ ] Dashboard shows "No data available" message
- [ ] Charts display empty state gracefully
- [ ] No division by zero errors
- [ ] No undefined/NaN values displayed

**Test: No critical suppliers**
- [ ] Risk distribution chart shows empty state
- [ ] Critical functions card shows "0 critical suppliers"
- [ ] Regulatory notification shows "N/A"
- [ ] No errors in console

**Test: No pending fields**
- [ ] Completeness rate = 100%
- [ ] Progress bar full
- [ ] "0 suppliers with pending fields" message
- [ ] Top incomplete table empty or hidden

---

#### Filtered Data Scenarios

**Test: Apply filters, switch to dashboard**
1. Go to Register List view
2. Apply filter: "Critical = Yes"
3. Switch to Dashboard tab
4. Verify metrics update to show only filtered suppliers
5. Verify all counts match filtered set (not all suppliers)

**Test: Apply search, switch to dashboard**
1. Apply global text search: "Cloud"
2. Switch to Dashboard
3. Verify metrics reflect search results
4. Switch back to List, clear search
5. Switch to Dashboard
6. Verify metrics revert to all suppliers

---

#### Data Quality Edge Cases

**Test: Missing dates**
- [ ] Suppliers with empty criticalityAssessmentDate excluded from overdue count
- [ ] Missing nextRenewalDate handled (no error, excluded from renewals)
- [ ] Missing notificationDate counted as "not notified"

**Test: Invalid dates**
- [ ] Invalid date strings (e.g., "invalid") don't crash dashboard
- [ ] Date calculation functions return 0 or safe default
- [ ] Error logged to console (optional)

**Test: Pending fields edge cases**
- [ ] Supplier with empty array `pendingFields: []` not counted as pending
- [ ] Supplier with undefined pendingFields not counted as pending
- [ ] Supplier with `pendingFields: ["field1"]` counted correctly (1 field)

---

## Risk Log & Mitigations

### Risk 1: Date Calculation Edge Cases

**Description:** Annual review logic (>365 days) may fail with:
- Leap years (366 days)
- Invalid date strings
- Missing dates (empty strings, undefined)
- Timezone differences

**Impact:** Medium - Incorrect overdue/upcoming counts

**Mitigation:**
- Use robust date library (date-fns) or built-in Date with try/catch
- Define `daysBetween()` function with error handling:
  ```typescript
  function daysBetween(dateStr1: string, dateStr2: Date): number {
    try {
      const date1 = new Date(dateStr1)
      if (isNaN(date1.getTime())) return Infinity // Invalid date = never overdue
      const diffMs = dateStr2.getTime() - date1.getTime()
      return Math.floor(diffMs / (1000 * 60 * 60 * 24))
    } catch {
      return Infinity
    }
  }
  ```
- Use 365-day threshold consistently (ignore leap years for simplicity)
- Test with edge case dates: "2024-02-29" (leap year), "invalid", "", undefined

**Status:** Mitigated in Sub-Phase 1.2

---

### Risk 2: Incomplete/Pending Data Handling

**Description:** Suppliers may have:
- Missing criticalFields object (non-critical suppliers)
- Missing cloudService object (non-cloud suppliers)
- Empty pending arrays
- Undefined optional fields

**Impact:** Low - Charts/tables may show incorrect data or crash

**Mitigation:**
- Use optional chaining: `supplier.criticalFields?.riskAssessment.risk`
- Filter before calculating: `const critical = suppliers.filter(s => s.criticality.isCritical)`
- Default values: `s.pendingFields?.length || 0`
- TypeScript strict mode catches most issues

**Status:** Mitigated by type system

---

### Risk 3: Provider/Country Name Inconsistencies

**Description:**
- Provider names may have typos: "AWS" vs "aws" vs "Amazon AWS"
- Country names may vary: "USA" vs "United States" vs "US"
- Classification errors: Is Switzerland EU or EEA?

**Impact:** Medium - Concentration/geographic metrics inaccurate

**Mitigation:**
- **Phase 1:** Accept data as-is (no normalization)
- **Future:** Add normalization layer:
  ```typescript
  function normalizeProviderName(name: string): string {
    return name.trim().toLowerCase()
  }

  const COUNTRY_ALIASES: Record<string, string> = {
    'USA': 'United States',
    'US': 'United States',
    'UK': 'United Kingdom',
    // ...
  }
  ```
- Document assumption: Country names must match exactly in dummy data
- Test with current dummy data (already consistent)

**Status:** Accepted for Phase 1, future enhancement

---

### Risk 4: Performance with Large Datasets

**Description:**
- Current: 5 suppliers → instant rendering
- Future: 100+ suppliers → potential slowdown
- Recharts may re-render unnecessarily

**Impact:** Low for Phase 1, Medium for future

**Mitigation:**
- **Phase 1:** No optimization needed (5 suppliers)
- **Future optimization:**
  - Memoize calculations: `const metrics = useMemo(() => getKeyMetrics(suppliers), [suppliers])`
  - Lazy load charts: `const PieChart = lazy(() => import('./charts/status-pie-chart'))`
  - Virtualize tables if >50 rows

**Status:** No action needed for Phase 1

---

### Risk 5: Browser Compatibility (Recharts)

**Description:**
- Recharts uses SVG, may not render in older browsers
- Chart colors may not support CSS custom properties in all browsers

**Impact:** Low - Target modern browsers (Chrome, Firefox, Edge, Safari)

**Mitigation:**
- Test in Chrome, Firefox, Edge (latest versions)
- Use fallback colors if CSS vars not supported (rare)
- Document browser requirements: "Modern browsers only (2023+)"

**Status:** Accepted risk, no action needed

---

### Risk 6: Accessibility Issues

**Description:**
- Charts may be hard to read for colorblind users
- Screen readers may not interpret charts correctly
- Keyboard navigation may not work for interactive elements

**Impact:** Medium - WCAG AAA requirement

**Mitigation:**
- Use high-contrast colors (already using CSS vars with 7:1 contrast)
- Add text labels to charts (not just color-coded)
- Add `aria-label` to charts with data summary:
  ```typescript
  <PieChart aria-label="Status breakdown: 55 Active, 10 Draft, 5 Not Yet Active, 3 Terminated">
  ```
- Use semantic HTML (`<table>`, `<th scope="col">`)
- Test with keyboard navigation (Tab, Enter, Space)

**Status:** Mitigated in implementation

---

## File Structure

### New Files (20 files)

```
lib/
├── types/
│   └── dashboard.ts                          # Type definitions (new)
└── utils/
    └── dashboard-analytics.ts                # All calculation functions (new)

components/
└── shared/
    └── dashboard/
        ├── dashboard-view.tsx                # Main container (new)
        ├── compliance-alerts.tsx             # Alert section (new)
        ├── metrics-cards.tsx                 # 5 metric cards (new)
        ├── upcoming-reviews-card.tsx         # Timeline (new)
        ├── data-completeness-card.tsx        # Pending fields (new)
        ├── critical-functions-card.tsx       # Critical analysis (new)
        ├── charts/
        │   ├── chart-container.tsx           # Reusable wrapper (new)
        │   ├── status-pie-chart.tsx          # Status breakdown (new)
        │   ├── category-bar-chart.tsx        # Category breakdown (new)
        │   └── risk-bar-chart.tsx            # Risk distribution (new)
        └── tables/
            ├── provider-concentration-table.tsx   # Provider table (new)
            ├── geographic-distribution-table.tsx  # Geographic table (new)
            └── pending-notifications-list.tsx     # Notification list (new)
```

### Modified Files (2 files)

```
app/
└── suppliers/
    └── page.tsx                              # Import DashboardView, pass suppliers prop

package.json                                  # Add recharts dependency
```

### Total Lines of Code Estimate

- `dashboard-analytics.ts`: ~400 lines (all calculations)
- `dashboard.ts` (types): ~150 lines
- Dashboard components: ~1,200 lines total
  - Main container: ~100 lines
  - Alerts: ~150 lines
  - Metrics cards: ~120 lines
  - Charts (4): ~400 lines (100 each)
  - Tables (3): ~350 lines
  - Cards (3): ~180 lines

**Total:** ~1,750 lines of new code

---

## Success Criteria

### Functional Requirements

- ✅ **All 7 indicators implemented:**
  1. Compliance Date Monitoring
  2. Pending Fields Indicator
  3. Overall Outsourcing Breakdown
  4. Provider Concentration Risk
  5. Geographic Distribution
  6. Critical Functions Deep Dive
  7. Regulatory Notification Tracker

- ✅ **Data accuracy:**
  - Overdue calculations use 365-day threshold correctly
  - Upcoming calculations use 335-365 day range
  - Percentages sum to 100% (where applicable)
  - Counts match manual verification

- ✅ **CSSF compliance:**
  - All relevant circular points referenced (54.i, 55.c, 55.f, 55.l)
  - Mandatory fields tracked correctly
  - Conditional logic (critical-only fields) applied correctly

- ✅ **Real-time updates:**
  - Dashboard reflects current supplier data
  - Metrics update when filters applied
  - No stale data displayed

---

### Non-Functional Requirements

- ✅ **Performance:**
  - Dashboard loads within 2 seconds (5 suppliers)
  - No lag when switching views
  - Charts render smoothly without flicker

- ✅ **Accessibility:**
  - WCAG AAA color contrast (7:1)
  - Charts have text labels and aria-labels
  - Keyboard navigation works for all interactive elements
  - Screen reader compatible

- ✅ **Visual Design:**
  - Professional appearance suitable for management
  - Consistent with existing app design (colors, spacing, typography)
  - Charts are readable and not cluttered
  - Responsive layout (desktop-first, tablet acceptable)

- ✅ **Code Quality:**
  - TypeScript: 0 errors, 0 warnings
  - ESLint: 0 errors
  - Build succeeds: `npm run build`
  - Follows project conventions (kebab-case files, PascalCase components)

---

### Acceptance Criteria (Final PO Sign-Off)

**The dashboard is complete when:**

1. ✅ All 7 indicators display correct data (verified manually)
2. ✅ All charts render without errors
3. ✅ All tables show accurate information
4. ✅ Color scheme matches design specification
5. ✅ Layout is professional and clean
6. ✅ Dashboard works with filtered data
7. ✅ No TypeScript/ESLint errors
8. ✅ Build succeeds
9. ✅ Accessibility requirements met (WCAG AAA)
10. ✅ PO has tested all visual QA checklist items

---

## Next Steps After Completion

### Immediate (Post-Dashboard)

1. **Update Documentation:**
   - Mark Dashboard as ✅ COMPLETE in ROADMAP.md
   - Update CLAUDE.md "What Works" section
   - Run `/log-update` to log dashboard completion
   - Update ARCHITECTURE.md with dashboard component structure

2. **User Testing:**
   - Share demo link with stakeholders
   - Gather feedback on metrics and visuals
   - Note any requests for additional indicators

3. **Performance Baseline:**
   - Test with 50 suppliers (add dummy data)
   - Measure load time
   - Document performance thresholds

---

### Future Enhancements (Phase 2 Features)

**Not in current scope, consider for future:**

1. **Historical Trends:**
   - Track metrics over time (monthly snapshots)
   - Line charts showing compliance rate evolution
   - Store historical data in localStorage/database

2. **Custom Dashboard:**
   - User preferences for which metrics to show
   - Reorderable sections (drag and drop)
   - Saved dashboard configurations

3. **Export Dashboard:**
   - Export metrics to Excel/PDF
   - Scheduled reports (weekly/monthly)
   - Email notifications

4. **Advanced Analytics:**
   - Cost analysis per category/provider
   - Time-to-renewal forecasting
   - Risk scoring algorithm

5. **Interactive Filters:**
   - Click chart segment to filter suppliers
   - Drill-down from metrics to supplier list
   - Breadcrumb navigation

---

## Appendix

### Calculation Reference

**Day Calculation Logic:**
```typescript
// 365-day threshold for annual reviews
const ANNUAL_THRESHOLD = 365
const UPCOMING_WARNING = 30 // 335-365 day range

function daysBetween(dateStr: string, currentDate: Date): number {
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return Infinity // Invalid = never overdue
  const diffMs = currentDate.getTime() - date.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

// Overdue: > 365 days
const isOverdue = daysBetween(assessmentDate, today) > ANNUAL_THRESHOLD

// Upcoming: 335-365 days (within 30 days of annual)
const isUpcoming = daysBetween(assessmentDate, today) >= (ANNUAL_THRESHOLD - UPCOMING_WARNING) &&
                   daysBetween(assessmentDate, today) <= ANNUAL_THRESHOLD
```

**Percentage Calculation:**
```typescript
// Always round to nearest integer
const percentage = Math.round((count / total) * 100)

// Completeness rate
const totalFields = 52 // CSSF fields per supplier
const totalPossible = suppliers.length * totalFields
const pendingCount = suppliers.reduce((sum, s) => sum + (s.pendingFields?.length || 0), 0)
const completenessRate = Math.round(((totalPossible - pendingCount) / totalPossible) * 100)
```

---

### Chart Configuration Reference

**Recharts Common Props:**
```typescript
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts'

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      labelLine={false}
      label={renderCustomLabel}
      outerRadius={80}
      fill="#8884d8"
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
      ))}
    </Pie>
    <Legend verticalAlign="bottom" height={36} />
  </PieChart>
</ResponsiveContainer>
```

**Custom Label Example:**
```typescript
const renderCustomLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent
}: any) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180))
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180))

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}
```

---

### Component Template

**Reusable Pattern for Dashboard Components:**
```typescript
// components/shared/dashboard/example-card.tsx

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { SupplierOutsourcing } from "@/lib/types/supplier"
import { getExampleMetric } from "@/lib/utils/dashboard-analytics"

interface ExampleCardProps {
  suppliers: SupplierOutsourcing[]
}

export function ExampleCard({ suppliers }: ExampleCardProps) {
  const metrics = getExampleMetric(suppliers)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Example Metric</CardTitle>
        <CardDescription>CSSF Circular 22/806, Point XX.x</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Metric display */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Count</span>
            <Badge variant="secondary">{metrics.count}</Badge>
          </div>

          {/* Chart or table */}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

**Plan Status:** ✅ Ready for Implementation
**Last Updated:** 2025-11-01
**Estimated Duration:** 8-12 hours (across 3 phases)
**Next Step:** Phase 1, Sub-Phase 1.1 - Setup & Infrastructure
