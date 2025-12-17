"use client"

import { useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useReporting } from "@/hooks/use-reporting"
import { useDatabase } from "@/hooks/use-database"
import type { EventLog, IssueRecord, IssueStatus, CriticalMonitorRecord, CriticalMonitorView } from "@/lib/types/reporting"
import { cn } from "@/lib/utils/cn"
import { exportEventsToExcel, exportIssuesToExcel, exportCriticalMonitorToExcel } from "@/lib/utils/export-reporting"
import { toast } from "sonner"
import {
  CalendarClock,
  AlertCircle,
  CheckCircle2,
  Pencil,
  Trash2,
  ArrowRight,
  Building2,
  User,
  Clock,
  MessageSquare,
  Plus,
  Search,
  Download,
  XCircle,
  FolderOpen,
  Shield,
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"

type PeriodKey = "last30" | "last90" | "all" | "range"
type EventFormState = {
  type: string
  customType?: string
  summary: string
  date: string
  severity?: string
  supplierName?: string
  functionName?: string
  oldValue?: string
  newValue?: string
}

const PERIODS: { label: string; value: PeriodKey; days?: number }[] = [
  { label: "Last 30 days", value: "last30", days: 30 },
  { label: "Last 90 days", value: "last90", days: 90 },
  { label: "All time", value: "all" },
  { label: "Custom range", value: "range" },
]

const STATUS_COLORS: Record<IssueStatus, string> = {
  Open: "bg-amber-100 text-amber-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Blocked: "bg-red-100 text-red-800",
  Closed: "bg-emerald-100 text-emerald-800",
}

const EVENT_TYPES = [
  "status_changed",
  "risk_changed",
  "criticality_changed",
  "criticality_assessment_changed",
  "assessment_date_changed",
  "notification_date_changed",
  "start_date_changed",
  "renewal_date_changed",
  "end_date_changed",
  "pending_cleared",
  "supplier_created",
  "custom",
]

const SEVERITIES = ["Low", "Medium", "High", "Critical"]
const SEVERITY_NONE = "none"
const ISSUE_SEVERITIES = ["Low", "Medium", "High", "Critical"]
const DEFAULT_ISSUE_CATEGORIES = ["Due Diligence", "Internal Audit", "Risk Committee"]
const ADD_NEW_CATEGORY = "__add_new__"
const ALL_CATEGORIES = "__all__"

const formatEventType = (type: EventLog["type"]) =>
  (type ?? "").replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())

const formatDate = (value?: string | null) => {
  if (!value) return "—"
  const parsed = new Date(value)
  if (isNaN(parsed.getTime())) return value
  const day = parsed.getUTCDate().toString().padStart(2, "0")
  const month = (parsed.getUTCMonth() + 1).toString().padStart(2, "0")
  const year = parsed.getUTCFullYear()
  return `${day}/${month}/${year}`
}

const toInputDateValue = (value?: string | null) => {
  if (!value) return ""
  const parsed = new Date(value)
  if (isNaN(parsed.getTime())) return ""
  return parsed.toISOString().slice(0, 10)
}

const normalizeDateValue = (value?: string | null, fallbackToNow = true) => {
  const trimmed = value?.trim() ?? ""
  if (!trimmed) return fallbackToNow ? new Date().toISOString() : ""
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return new Date(`${trimmed}T00:00:00Z`).toISOString()
  }
  const parsed = new Date(trimmed)
  return isNaN(parsed.getTime()) ? trimmed : parsed.toISOString()
}

function withinPeriod(dateStr: string, period: PeriodKey): boolean {
  if (period === "all") return true
  if (period === "range") return true // handled separately with explicit range check
  const days = period === "last30" ? 30 : 90
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false
  const now = new Date()
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  return date >= cutoff
}

const withinCustomRange = (dateStr: string, start?: string, end?: string): boolean => {
  if (!start && !end) return true
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false
  if (start) {
    const s = new Date(start)
    if (!isNaN(s.getTime()) && date < s) return false
  }
  if (end) {
    const e = new Date(end)
    if (!isNaN(e.getTime()) && date > e) return false
  }
  return true
}

const ALL_PROVIDERS = "__all__"
const CATEGORY_ALL = "all"
const CATEGORY_CLOUD = "cloud"
const CATEGORY_SERVICES = "services"

export function ReportingView() {
  const {
    events,
    issues,
    criticalMonitorRecords,
    isLoading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    addIssue,
    updateIssue,
    deleteIssue,
    upsertCriticalMonitorRecord,
  } = useReporting()
  const { suppliers } = useDatabase()
  const [period, setPeriod] = useState<PeriodKey>("last30")
  const [searchTerm, setSearchTerm] = useState("")
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [editingIssueId, setEditingIssueId] = useState<number | null>(null)
  const [editingIssueForm, setEditingIssueForm] = useState<IssueRecord | null>(null)
  const [followUpDrafts, setFollowUpDrafts] = useState<Record<number, string>>({})
  const [exportType, setExportType] = useState<"events" | "issues">("events")
  const [exportScope, setExportScope] = useState<"all" | "filtered">("filtered")
  const [issueStatusFilters, setIssueStatusFilters] = useState<Set<IssueStatus>>(new Set())
  const [issueCategoryFilter, setIssueCategoryFilter] = useState<string>("")
  const [customCategories, setCustomCategories] = useState<string[]>([])
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryInput, setNewCategoryInput] = useState("")

  // Critical Monitor state
  const [cmProviderFilter, setCmProviderFilter] = useState<string>("")
  const [cmCategoryFilter, setCmCategoryFilter] = useState<string>(CATEGORY_ALL)
  const [editingCmCell, setEditingCmCell] = useState<{ refNum: string; field: keyof CriticalMonitorRecord } | null>(null)
  const [editingCmValue, setEditingCmValue] = useState<string>("")

  const allCategories = useMemo(() => {
    // Combine default + custom + any categories from existing issues
    const fromIssues = issues.map((i) => i.category).filter((c) => c && c.trim())
    const combined = new Set([...DEFAULT_ISSUE_CATEGORIES, ...customCategories, ...fromIssues])
    return Array.from(combined).sort()
  }, [issues, customCategories])

  // Critical Outsourcing Monitor - computed values
  // Only include suppliers that are critical, active, AND have required fields filled (not pending)
  const criticalActiveSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      // Must be critical and active
      if (!s.criticality?.isCritical || s.status !== "Active") return false
      // Must have provider name (not empty/pending)
      const providerName = s.serviceProvider?.name?.trim()
      if (!providerName) return false
      // Must have category (not empty/pending)
      const category = s.category?.trim()
      if (!category) return false
      return true
    })
  }, [suppliers])

  const criticalMonitorView = useMemo((): CriticalMonitorView[] => {
    const monitorMap = new Map(criticalMonitorRecords.map((r) => [r.supplierReferenceNumber, r]))

    return criticalActiveSuppliers.map((supplier) => {
      const record = monitorMap.get(supplier.referenceNumber)
      const criticalFields = supplier.criticalFields

      return {
        id: record?.id,
        supplierReferenceNumber: supplier.referenceNumber,
        providerName: supplier.serviceProvider?.name ?? "",
        functionName: supplier.functionDescription?.name ?? "",
        category: supplier.category ?? "",
        contract: record?.contract,
        criticalityAssessmentDate: supplier.criticalityAssessmentDate,
        suitabilityAssessmentDate: record?.suitabilityAssessmentDate,
        riskAssessment: criticalFields?.riskAssessment?.lastAssessmentDate,
        auditReports: record?.auditReports,
        lastAuditDate: criticalFields?.audit?.lastAuditDate,
        cloudOfficer: supplier.cloudService?.cloudOfficer,
        resourceOperator: supplier.cloudService?.resourceOperator,
        coRoAssessmentDate: record?.coRoAssessmentDate,
        createdAt: record?.createdAt,
        updatedAt: record?.updatedAt,
      }
    })
  }, [criticalActiveSuppliers, criticalMonitorRecords])

  const filteredCriticalMonitor = useMemo(() => {
    return criticalMonitorView.filter((item) => {
      // Provider filter
      if (cmProviderFilter && item.providerName !== cmProviderFilter) return false
      // Category filter (Cloud vs Services)
      if (cmCategoryFilter === CATEGORY_CLOUD && item.category !== "Cloud") return false
      if (cmCategoryFilter === CATEGORY_SERVICES && item.category === "Cloud") return false
      return true
    })
  }, [criticalMonitorView, cmProviderFilter, cmCategoryFilter])

  const uniqueProviders = useMemo(() => {
    // Filter out any empty provider names to prevent Select.Item errors
    return Array.from(new Set(criticalMonitorView.map((item) => item.providerName)))
      .filter((name) => name && name.trim())
      .sort()
  }, [criticalMonitorView])

  const toggleStatusFilter = (status: IssueStatus) => {
    setIssueStatusFilters((prev) => {
      const next = new Set(prev)
      if (next.has(status)) {
        next.delete(status)
      } else {
        next.add(status)
      }
      return next
    })
  }

  const handleAddCustomCategory = () => {
    const trimmed = newCategoryInput.trim()
    if (trimmed && !allCategories.includes(trimmed)) {
      setCustomCategories((prev) => [...prev, trimmed])
    }
    setNewCategoryInput("")
    setIsAddingCategory(false)
  }

  const [newIssue, setNewIssue] = useState<IssueRecord>({
    title: "",
    description: "",
    category: "",
    status: "Open",
    severity: "Medium",
    owner: "",
    supplierName: "",
    functionName: "",
    dateOpened: new Date().toISOString(),
    dateLastUpdate: new Date().toISOString(),
    dateClosed: null,
    dueDate: "",
    followUps: [],
  })
  const [newIssueFollowUp, setNewIssueFollowUp] = useState("")

  const [newEvent, setNewEvent] = useState<EventFormState>({
    type: "status_changed",
    summary: "",
    date: new Date().toISOString(),
    severity: "",
    supplierName: "",
    functionName: "",
    oldValue: "",
    newValue: "",
    customType: "",
  })

  const [editingEventForm, setEditingEventForm] = useState<EventFormState | null>(null)

  const matchesSearch = useCallback(
    (text?: string | null) => (searchTerm ? (text ?? "").toLowerCase().includes(searchTerm.toLowerCase()) : true),
    [searchTerm]
  )

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (period === "range") {
        if (!withinCustomRange(ev.date, rangeStart, rangeEnd)) return false
      } else {
        if (!withinPeriod(ev.date, period)) return false
      }
      if (!searchTerm) return true
      return (
        matchesSearch(ev.summary) ||
        matchesSearch(ev.type) ||
        matchesSearch(ev.supplierName) ||
        matchesSearch(ev.functionName) ||
        matchesSearch(ev.severity) ||
        matchesSearch(ev.oldValue) ||
        matchesSearch(ev.newValue)
      )
    })
  }, [events, period, searchTerm, matchesSearch, rangeStart, rangeEnd])

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Status quick filter (if any are selected, only show matching statuses)
      if (issueStatusFilters.size > 0 && !issueStatusFilters.has(issue.status)) {
        return false
      }

      // Category filter
      if (issueCategoryFilter && issue.category !== issueCategoryFilter) {
        return false
      }

      const inPeriod =
        period === "range"
          ? withinCustomRange(issue.dateOpened, rangeStart, rangeEnd) ||
            (issue.dateClosed && withinCustomRange(issue.dateClosed, rangeStart, rangeEnd)) ||
            (issue.dateLastUpdate && withinCustomRange(issue.dateLastUpdate, rangeStart, rangeEnd))
          : withinPeriod(issue.dateOpened, period) ||
            (issue.dateClosed && withinPeriod(issue.dateClosed, period)) ||
            (issue.dateLastUpdate && withinPeriod(issue.dateLastUpdate, period))
      if (!inPeriod) return false
      if (!searchTerm) return true
      const followUpMatch = issue.followUps?.some((f) => matchesSearch(f.note))
      return (
        matchesSearch(issue.title) ||
        matchesSearch(issue.description) ||
        matchesSearch(issue.category) ||
        matchesSearch(issue.status) ||
        matchesSearch(issue.severity) ||
        matchesSearch(issue.owner) ||
        matchesSearch(issue.supplierName) ||
        matchesSearch(issue.functionName) ||
        followUpMatch
      )
    })
  }, [issues, period, searchTerm, matchesSearch, rangeStart, rangeEnd, issueStatusFilters, issueCategoryFilter])

  const openIssues = filteredIssues.filter((issue) => issue.status !== "Closed")
  const closedInPeriod = filteredIssues.filter((issue) => issue.status === "Closed")

  const newOutsourcing = filteredEvents.filter((ev) => ev.type === "supplier_created")

  const handleExportReporting = () => {
    const scope = exportScope
    const exportingEvents = exportType === "events"
    const dataset =
      scope === "all"
        ? exportingEvents
          ? events
          : issues
        : exportingEvents
          ? filteredEvents
          : filteredIssues

    if (!dataset.length) {
      toast.error("Nothing to export", {
        description: "The current selection contains no records.",
      })
      return
    }

    try {
      if (exportingEvents) {
        exportEventsToExcel(dataset as EventLog[], scope)
        toast.success("Events exported", {
          description: `Exported ${dataset.length} event(s) to Excel`,
        })
      } else {
        exportIssuesToExcel(dataset as IssueRecord[], scope)
        toast.success("Issues exported", {
          description: `Exported ${dataset.length} issue(s) to Excel`,
        })
      }
    } catch (err) {
      console.error("Reporting export failed:", err)
      toast.error("Export failed", {
        description: "An error occurred while generating the Excel file.",
      })
    }
  }

  const handleCreateIssue = async () => {
    if (!newIssue.title.trim() || !newIssue.description.trim() || !newIssue.category.trim()) return
    const nowIso = new Date().toISOString()
    const normalizedDateOpened = normalizeDateValue(newIssue.dateOpened, true)
    const normalizedDateClosed =
      newIssue.status === "Closed" ? normalizeDateValue(newIssue.dateClosed ?? nowIso, true) : null
    const normalizedDueDate = newIssue.dueDate ? normalizeDateValue(newIssue.dueDate, false) : ""

    const payload: IssueRecord = {
      ...newIssue,
      dateOpened: normalizedDateOpened,
      dateLastUpdate: normalizeDateValue(newIssue.dateLastUpdate ?? nowIso, true),
      dateClosed: normalizedDateClosed,
      dueDate: normalizedDueDate,
      followUps: newIssueFollowUp.trim()
        ? [
            {
              note: newIssueFollowUp.trim(),
              date: new Date().toISOString(),
            },
          ]
        : [],
    }
    await addIssue(payload)
    setNewIssue({
      title: "",
      description: "",
      category: "",
      status: "Open",
      severity: "Medium",
      owner: "",
      supplierName: "",
      functionName: "",
      dateOpened: new Date().toISOString(),
      dateLastUpdate: new Date().toISOString(),
      dateClosed: null,
      dueDate: "",
      followUps: [],
    })
    setNewIssueFollowUp("")
  }

  const resolveEventType = (form: EventFormState) => {
    if (form.type === "custom" && form.customType?.trim()) return form.customType.trim()
    return form.type
  }

  const handleCreateEvent = async () => {
    const eventType = resolveEventType(newEvent)
    if (!eventType || !newEvent.summary.trim()) return

    const payload: EventLog = {
      type: eventType,
      summary: newEvent.summary.trim(),
      date: normalizeDateValue(newEvent.date, true),
      severity: newEvent.severity?.trim() || undefined,
      supplierName: newEvent.supplierName?.trim() || undefined,
      functionName: newEvent.functionName?.trim() || undefined,
      oldValue: newEvent.oldValue?.trim() || undefined,
      newValue: newEvent.newValue?.trim() || undefined,
    }

    await addEvent(payload)
    setNewEvent({
      type: "status_changed",
      summary: "",
      date: new Date().toISOString(),
      severity: "",
      supplierName: "",
      functionName: "",
      oldValue: "",
      newValue: "",
      customType: "",
    })
  }

  const startEditEvent = (event: EventLog) => {
    setEditingEventId(event.id ?? null)
    setEditingEventForm({
      type: EVENT_TYPES.includes(event.type) ? event.type : "custom",
      customType: EVENT_TYPES.includes(event.type) ? "" : event.type,
      summary: event.summary,
      date: event.date,
      severity: event.severity ?? "",
      supplierName: event.supplierName ?? "",
      functionName: event.functionName ?? "",
      oldValue: event.oldValue ?? "",
      newValue: event.newValue ?? "",
    })
  }

  const handleSaveEditEvent = async () => {
    if (!editingEventId || !editingEventForm) return
    const eventType = resolveEventType(editingEventForm)
    if (!eventType || !editingEventForm.summary.trim()) return

    const payload: EventLog = {
      id: editingEventId,
      type: eventType,
      summary: editingEventForm.summary.trim(),
      date: normalizeDateValue(editingEventForm.date, true),
      severity: editingEventForm.severity?.trim() || undefined,
      supplierName: editingEventForm.supplierName?.trim() || undefined,
      functionName: editingEventForm.functionName?.trim() || undefined,
      oldValue: editingEventForm.oldValue?.trim() || undefined,
      newValue: editingEventForm.newValue?.trim() || undefined,
    }

    await updateEvent(payload)
    setEditingEventId(null)
    setEditingEventForm(null)
  }

  const startEditIssue = (issue: IssueRecord) => {
    setEditingIssueId(issue.id ?? null)
    setEditingIssueForm({ ...issue })
  }

  const handleSaveIssueEdit = async () => {
    if (!editingIssueId || !editingIssueForm) return
    const nowIso = new Date().toISOString()
    const normalizedDateOpened = normalizeDateValue(editingIssueForm.dateOpened, true)
    const normalizedDueDate = editingIssueForm.dueDate ? normalizeDateValue(editingIssueForm.dueDate, false) : ""
    const normalizedDateClosed =
      editingIssueForm.status === "Closed"
        ? normalizeDateValue(editingIssueForm.dateClosed ?? nowIso, true)
        : null
    await updateIssue({
      ...editingIssueForm,
      dateOpened: normalizedDateOpened,
      dueDate: normalizedDueDate,
      dateLastUpdate: nowIso,
      dateClosed: normalizedDateClosed,
    })
    setEditingIssueId(null)
    setEditingIssueForm(null)
  }

  const handleFollowUpAdd = async (issue: IssueRecord) => {
    const note = followUpDrafts[issue.id ?? -1]?.trim()
    if (!note) return
    const updatedFollowUps = [...(issue.followUps ?? []), { note, date: new Date().toISOString() }]
    await updateIssue({
      ...issue,
      followUps: updatedFollowUps,
      dateLastUpdate: new Date().toISOString(),
    })
    setFollowUpDrafts((prev) => ({ ...prev, [issue.id ?? -1]: "" }))
  }

  const handleDeleteEvent = async (id?: number) => {
    if (!id) return
    await deleteEvent(id)
    if (editingEventId === id) {
      setEditingEventId(null)
      setEditingEventForm(null)
    }
  }

  const handleStatusChange = async (issue: IssueRecord, status: IssueStatus) => {
    const closedDate = status === "Closed" ? issue.dateClosed ?? new Date().toISOString() : null
    await updateIssue({
      ...issue,
      status,
      dateLastUpdate: new Date().toISOString(),
      dateClosed: closedDate,
      followUps: issue.followUps,
    })
  }

  // Critical Monitor handlers
  const startEditCmCell = (refNum: string, field: keyof CriticalMonitorRecord, currentValue?: string) => {
    setEditingCmCell({ refNum, field })
    setEditingCmValue(currentValue ?? "")
  }

  const cancelEditCmCell = () => {
    setEditingCmCell(null)
    setEditingCmValue("")
  }

  const saveCmCell = async () => {
    if (!editingCmCell) return

    const existing = criticalMonitorRecords.find((r) => r.supplierReferenceNumber === editingCmCell.refNum)
    const record: CriticalMonitorRecord = {
      ...existing,
      supplierReferenceNumber: editingCmCell.refNum,
      [editingCmCell.field]: editingCmValue.trim() || undefined,
    }

    try {
      await upsertCriticalMonitorRecord(record)
      toast.success("Saved", { description: "Critical monitor record updated" })
    } catch (err) {
      console.error("Failed to save critical monitor record:", err)
      toast.error("Save failed", { description: "Could not update the record" })
    } finally {
      setEditingCmCell(null)
      setEditingCmValue("")
    }
  }

  const handleExportCriticalMonitor = () => {
    const data = filteredCriticalMonitor
    if (!data.length) {
      toast.error("Nothing to export", { description: "No critical outsourcing records match the current filters." })
      return
    }

    try {
      const scopeLabel = cmCategoryFilter === CATEGORY_ALL ? "all" : cmCategoryFilter
      exportCriticalMonitorToExcel(data, scopeLabel)
      toast.success("Exported", { description: `Exported ${data.length} critical outsourcing record(s) to Excel` })
    } catch (err) {
      console.error("Critical monitor export failed:", err)
      toast.error("Export failed", { description: "An error occurred while generating the Excel file." })
    }
  }

  const summaryCards = [
    {
      label: "Events",
      value: filteredEvents.length,
      icon: CalendarClock,
      tooltip: "Total events logged in the selected period",
      bgColor: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "New Outsourcing",
      value: newOutsourcing.length,
      icon: Plus,
      tooltip: "New outsourcing arrangements created in the period",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Open Issues",
      value: openIssues.length,
      icon: AlertCircle,
      tooltip: "Issues currently open or in progress",
      bgColor: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Closed (Period)",
      value: closedInPeriod.length,
      icon: CheckCircle2,
      tooltip: "Issues closed within the selected period",
      bgColor: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Reporting</h2>
          <p className="text-sm text-muted-foreground">Period change log and issues for management reporting.</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg bg-muted/30 border">
        {/* LEFT: Search + Period selector */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events and issues"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 sm:w-64"
            />
          </div>
          <Select value={period} onValueChange={(val) => setPeriod(val as PeriodKey)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {period === "range" && (
            <div className="flex gap-2">
              <Input
                type="date"
                value={rangeStart}
                onChange={(e) => setRangeStart(e.target.value)}
                aria-label="Start date"
              />
              <Input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} aria-label="End date" />
            </div>
          )}
        </div>

        {/* RIGHT: Export controls + button */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">Export:</Label>
            <Select value={exportType} onValueChange={(val) => setExportType(val as "events" | "issues")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Export type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="events">Events</SelectItem>
                <SelectItem value="issues">Issues</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium whitespace-nowrap">Scope:</Label>
            <Select value={exportScope} onValueChange={(val) => setExportScope(val as "all" | "filtered")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Scope" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="filtered">Filtered</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExportReporting} className="gap-2">
            <Download className="h-4 w-4" />
            Export to Excel
          </Button>
        </div>
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading reporting data…</div>}
      {error && <div className="text-sm text-destructive">Reporting error: {error}</div>}

      <TooltipProvider>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <Tooltip key={card.label}>
              <TooltipTrigger asChild>
                <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.label}
                    </CardTitle>
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center",
                        card.bgColor
                      )}
                    >
                      <card.icon className={cn("h-5 w-5", card.iconColor)} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold tracking-tight">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">In selected period</p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent>
                <p>{card.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-primary" />
              Events in period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredEvents.length === 0 && <p className="text-sm text-muted-foreground">No events in this period.</p>}
            {filteredEvents.map((event) => (
              <div
                key={`${event.id}-${event.date}-${event.type}`}
                className="group rounded-lg border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <CalendarClock className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="font-medium">
                          {formatEventType(event.type)}
                        </Badge>
                        {event.severity && (
                          <Badge
                            variant="outline"
                            className={cn(
                              event.severity === "Critical" && "bg-red-100 text-red-800 border-red-200",
                              event.severity === "High" && "bg-orange-100 text-orange-800 border-orange-200",
                              event.severity === "Medium" && "bg-amber-100 text-amber-800 border-amber-200",
                              event.severity === "Low" && "bg-slate-100 text-slate-600 border-slate-200"
                            )}
                          >
                            {event.severity}
                          </Badge>
                        )}
                      </div>
                      {event.supplierName && (
                        <span className="text-sm font-medium text-foreground truncate">
                          {event.supplierName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(event.date)}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => startEditEvent(event)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteEvent(event.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
                {editingEventId === event.id && editingEventForm ? (
                  <div className="grid gap-2 md:grid-cols-2">
                    <Select
                      value={editingEventForm.type}
                      onValueChange={(val) => setEditingEventForm((prev) => (prev ? { ...prev, type: val } : prev))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {formatEventType(t)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {editingEventForm.type === "custom" && (
                      <Input
                        placeholder="Custom type"
                        value={editingEventForm.customType}
                        onChange={(e) =>
                          setEditingEventForm((prev) => (prev ? { ...prev, customType: e.target.value } : prev))
                        }
                      />
                    )}
                    <Input
                      placeholder="Summary"
                      className="md:col-span-2"
                      value={editingEventForm.summary}
                      onChange={(e) =>
                        setEditingEventForm((prev) => (prev ? { ...prev, summary: e.target.value } : prev))
                      }
                    />
                    <Input
                      type="date"
                      value={toInputDateValue(editingEventForm.date)}
                      onChange={(e) =>
                        setEditingEventForm((prev) => (prev ? { ...prev, date: e.target.value } : prev))
                      }
                    />
                    <Select
                      value={
                        editingEventForm.severity && editingEventForm.severity.trim()
                          ? editingEventForm.severity
                          : SEVERITY_NONE
                      }
                      onValueChange={(val) =>
                        setEditingEventForm((prev) => (prev ? { ...prev, severity: val === SEVERITY_NONE ? "" : val } : prev))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={SEVERITY_NONE}>None</SelectItem>
                        {SEVERITIES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="grid grid-cols-2 gap-2 md:col-span-2">
                      <Input
                        placeholder="Supplier Name"
                        value={editingEventForm.supplierName}
                        onChange={(e) =>
                          setEditingEventForm((prev) => (prev ? { ...prev, supplierName: e.target.value } : prev))
                        }
                      />
                      <Input
                        placeholder="Outsourced Function"
                        value={editingEventForm.functionName}
                        onChange={(e) =>
                          setEditingEventForm((prev) => (prev ? { ...prev, functionName: e.target.value } : prev))
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 md:col-span-2">
                      <Input
                        placeholder="Old value"
                        value={editingEventForm.oldValue}
                        onChange={(e) =>
                          setEditingEventForm((prev) => (prev ? { ...prev, oldValue: e.target.value } : prev))
                        }
                      />
                      <Input
                        placeholder="New value"
                        value={editingEventForm.newValue}
                        onChange={(e) =>
                          setEditingEventForm((prev) => (prev ? { ...prev, newValue: e.target.value } : prev))
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 md:col-span-2">
                      <Button size="sm" onClick={handleSaveEditEvent} disabled={!editingEventForm.summary.trim()}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingEventId(null)
                          setEditingEventForm(null)
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-sm text-foreground break-words">{event.summary}</div>
                    {(event.oldValue || event.newValue) && (
                      <div className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-3 py-2 mt-2 flex-wrap">
                        <span className="text-muted-foreground break-words">{event.oldValue || "—"}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground break-words">{event.newValue || "—"}</span>
                      </div>
                    )}
                    {event.functionName && (
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-2">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {event.functionName}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 bg-muted/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-primary" />
              Log Event
            </CardTitle>
            <p className="text-sm text-muted-foreground">Record a new event in the change log</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Event Type</Label>
              <Select value={newEvent.type} onValueChange={(val) => setNewEvent((prev) => ({ ...prev, type: val }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {formatEventType(t)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newEvent.type === "custom" && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Custom Type</Label>
                <Input
                  placeholder="Enter custom type"
                  value={newEvent.customType}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, customType: e.target.value }))}
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Summary *</Label>
              <Input
                placeholder="Brief description of the event"
                value={newEvent.summary}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, summary: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={toInputDateValue(newEvent.date)}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Severity</Label>
                <Select
                  value={newEvent.severity && newEvent.severity.trim() ? newEvent.severity : SEVERITY_NONE}
                  onValueChange={(val) =>
                    setNewEvent((prev) => ({ ...prev, severity: val === SEVERITY_NONE ? "" : val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={SEVERITY_NONE}>None</SelectItem>
                    {SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Supplier</Label>
                <Input
                  placeholder="Supplier Name"
                  value={newEvent.supplierName}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, supplierName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Function</Label>
                <Input
                  placeholder="Outsourced Function"
                  value={newEvent.functionName}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, functionName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Old Value</Label>
                <Input
                  placeholder="Previous value"
                  value={newEvent.oldValue}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, oldValue: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">New Value</Label>
                <Input
                  placeholder="New value"
                  value={newEvent.newValue}
                  onChange={(e) => setNewEvent((prev) => ({ ...prev, newValue: e.target.value }))}
                />
              </div>
            </div>
            <Button onClick={handleCreateEvent} disabled={!newEvent.summary.trim()} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary" />
                Issues
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {filteredIssues.length} issue{filteredIssues.length !== 1 ? "s" : ""} in period
              </p>
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              {(["Open", "In Progress", "Blocked", "Closed"] as IssueStatus[]).map((status) => (
                <Button
                  key={status}
                  variant={issueStatusFilters.has(status) ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-7 text-xs",
                    !issueStatusFilters.has(status) && STATUS_COLORS[status],
                    issueStatusFilters.has(status) && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => toggleStatusFilter(status)}
                >
                  {status}
                </Button>
              ))}
              <div className="h-5 w-px bg-border mx-1" />
              <Select
                value={issueCategoryFilter || ALL_CATEGORIES}
                onValueChange={(val) => setIssueCategoryFilter(val === ALL_CATEGORIES ? "" : val)}
              >
                <SelectTrigger className="h-7 w-[160px] text-xs">
                  <FolderOpen className="h-3 w-3 mr-1" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CATEGORIES}>All Categories</SelectItem>
                  {allCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(issueStatusFilters.size > 0 || issueCategoryFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-muted-foreground"
                  onClick={() => {
                    setIssueStatusFilters(new Set())
                    setIssueCategoryFilter("")
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {filteredIssues.length === 0 && <p className="text-sm text-muted-foreground">No issues in this period.</p>}
            {filteredIssues.map((issue) => (
              <div
                key={issue.id ?? issue.title}
                className="group rounded-lg border bg-card p-4 transition-all duration-200 hover:shadow-md hover:border-primary/20"
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
                        issue.status === "Open" && "bg-amber-100",
                        issue.status === "In Progress" && "bg-blue-100",
                        issue.status === "Blocked" && "bg-red-100",
                        issue.status === "Closed" && "bg-emerald-100"
                      )}
                    >
                      {issue.status === "Closed" ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      ) : issue.status === "Blocked" ? (
                        <XCircle className="h-4 w-4 text-red-600" />
                      ) : (
                        <AlertCircle
                          className={cn(
                            "h-4 w-4",
                            issue.status === "Open" ? "text-amber-600" : "text-blue-600"
                          )}
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {editingIssueId === issue.id && editingIssueForm ? (
                          <Input
                            value={editingIssueForm.title}
                            className="font-semibold"
                            onChange={(e) =>
                              setEditingIssueForm((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                            }
                          />
                        ) : (
                          <span className="font-semibold text-foreground">{issue.title}</span>
                        )}
                        <Badge className={cn("text-xs", STATUS_COLORS[issue.status])}>{issue.status}</Badge>
                        {issue.severity && (
                          <Badge
                            variant="outline"
                            className={cn(
                              issue.severity === "Critical" && "bg-red-100 text-red-800 border-red-200",
                              issue.severity === "High" && "bg-orange-100 text-orange-800 border-orange-200",
                              issue.severity === "Medium" && "bg-amber-100 text-amber-800 border-amber-200",
                              issue.severity === "Low" && "bg-slate-100 text-slate-600 border-slate-200"
                            )}
                          >
                            {issue.severity}
                          </Badge>
                        )}
                      </div>
                      {editingIssueId === issue.id && editingIssueForm ? (
                        <Textarea
                          value={editingIssueForm.description}
                          className="min-h-[60px]"
                          onChange={(e) =>
                            setEditingIssueForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground break-words">{issue.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end shrink-0">
                    <Select value={issue.status} onValueChange={(val) => handleStatusChange(issue, val as IssueStatus)}>
                      <SelectTrigger className="w-[120px] h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Open", "In Progress", "Blocked", "Closed"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {editingIssueId === issue.id ? (
                        <>
                          <Button size="sm" className="h-7" onClick={handleSaveIssueEdit} disabled={!editingIssueForm?.title?.trim()}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7"
                            onClick={() => {
                              setEditingIssueId(null)
                              setEditingIssueForm(null)
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => startEditIssue(issue)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={() => deleteIssue(issue.id!)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Edit mode fields */}
                {editingIssueId === issue.id && editingIssueForm && (
                  <div className="grid grid-cols-2 gap-3 mb-3 pl-12">
                    <div className="space-y-1 col-span-2">
                      <Label className="text-xs text-muted-foreground">Category *</Label>
                      <Select
                        value={editingIssueForm.category ?? ""}
                        onValueChange={(val) => {
                          if (val === ADD_NEW_CATEGORY) {
                            setIsAddingCategory(true)
                          } else {
                            setEditingIssueForm((prev) => (prev ? { ...prev, category: val } : prev))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {allCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                          <SelectItem value={ADD_NEW_CATEGORY}>+ Add new category</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Supplier</Label>
                      <Input
                        placeholder="Supplier Name"
                        value={editingIssueForm.supplierName ?? ""}
                        onChange={(e) =>
                          setEditingIssueForm((prev) => (prev ? { ...prev, supplierName: e.target.value } : prev))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Function</Label>
                      <Input
                        placeholder="Outsourced Function"
                        value={editingIssueForm.functionName ?? ""}
                        onChange={(e) =>
                          setEditingIssueForm((prev) => (prev ? { ...prev, functionName: e.target.value } : prev))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Owner</Label>
                      <Input
                        placeholder="Responsible person"
                        value={editingIssueForm.owner ?? ""}
                        onChange={(e) =>
                          setEditingIssueForm((prev) => (prev ? { ...prev, owner: e.target.value } : prev))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Severity</Label>
                      <Select
                        value={editingIssueForm.severity ?? ""}
                        onValueChange={(val) =>
                          setEditingIssueForm((prev) => (prev ? { ...prev, severity: val } : prev))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Severity" />
                        </SelectTrigger>
                        <SelectContent>
                          {ISSUE_SEVERITIES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Due Date</Label>
                      <Input
                        type="date"
                        value={toInputDateValue(editingIssueForm.dueDate)}
                        onChange={(e) =>
                          setEditingIssueForm((prev) => (prev ? { ...prev, dueDate: e.target.value } : prev))
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Opened On</Label>
                      <Input
                        type="date"
                        value={toInputDateValue(editingIssueForm.dateOpened)}
                        onChange={(e) =>
                          setEditingIssueForm((prev) => (prev ? { ...prev, dateOpened: e.target.value } : prev))
                        }
                      />
                    </div>
                    {editingIssueForm.status === "Closed" && (
                      <div className="space-y-1 col-span-2">
                        <Label className="text-xs text-muted-foreground">Closed On</Label>
                        <Input
                          type="date"
                          value={toInputDateValue(editingIssueForm.dateClosed)}
                          onChange={(e) =>
                            setEditingIssueForm((prev) => (prev ? { ...prev, dateClosed: e.target.value } : prev))
                          }
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata row (view mode) */}
                {!(editingIssueId === issue.id) && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mb-3 pl-12">
                    {issue.category && (
                      <span className="flex items-center gap-1">
                        <FolderOpen className="h-3 w-3" />
                        {issue.category}
                      </span>
                    )}
                    {issue.supplierName && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {issue.supplierName}
                      </span>
                    )}
                    {issue.owner && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {issue.owner}
                      </span>
                    )}
                    {issue.dueDate && (
                      <span
                        className={cn(
                          "flex items-center gap-1",
                          new Date(issue.dueDate) < new Date() && issue.status !== "Closed" && "text-destructive font-medium"
                        )}
                      >
                        <Clock className="h-3 w-3" />
                        Due: {formatDate(issue.dueDate)}
                      </span>
                    )}
                  </div>
                )}

                {/* Timeline info */}
                <div className="flex gap-4 text-xs text-muted-foreground border-t pt-3 mb-3">
                  <span>Opened: {formatDate(issue.dateOpened)}</span>
                  <span>Updated: {formatDate(issue.dateLastUpdate)}</span>
                  {issue.dateClosed && <span>Closed: {formatDate(issue.dateClosed)}</span>}
                </div>

                {/* Follow-ups section */}
                {issue.followUps && issue.followUps.length > 0 && (
                  <div className="rounded-lg bg-muted/40 p-3 mb-3">
                    <div className="text-xs font-semibold text-foreground mb-2 flex items-center gap-2">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Follow-ups ({issue.followUps.length})
                    </div>
                    <div className="space-y-2 max-h-[120px] overflow-y-auto overflow-x-hidden">
                      {issue.followUps.map((f, idx) => (
                        <div key={`${issue.id}-fu-${idx}`} className="flex gap-2 text-xs min-w-0">
                          <span className="text-muted-foreground whitespace-nowrap shrink-0">{formatDate(f.date)}</span>
                          <span className="text-foreground break-all min-w-0 flex-1">{f.note}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add follow-up */}
                <div className="border-t pt-3">
                  <div className="flex gap-2 items-start">
                    <Textarea
                      placeholder="Add follow-up note..."
                      className="min-h-[36px] text-sm resize-none"
                      rows={1}
                      value={followUpDrafts[issue.id ?? -1] ?? ""}
                      onChange={(e) => setFollowUpDrafts((prev) => ({ ...prev, [issue.id ?? -1]: e.target.value }))}
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shrink-0 h-[36px]"
                      onClick={() => handleFollowUpAdd(issue)}
                      disabled={!followUpDrafts[issue.id ?? -1]?.trim()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="border-dashed border-2 bg-muted/20">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Plus className="h-5 w-5 text-primary" />
              New Issue
            </CardTitle>
            <p className="text-sm text-muted-foreground">Create a new issue to track</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Title *</Label>
              <Input
                placeholder="Brief issue title"
                value={newIssue.title}
                onChange={(e) => setNewIssue((prev) => ({ ...prev, title: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Description *</Label>
              <Textarea
                placeholder="Describe the issue in detail"
                className="min-h-[36px] text-sm resize-none"
                rows={1}
                value={newIssue.description}
                onChange={(e) => setNewIssue((prev) => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Category *</Label>
              {isAddingCategory ? (
                <div className="flex gap-2">
                  <Input
                    placeholder="New category name"
                    value={newCategoryInput}
                    onChange={(e) => setNewCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        if (newCategoryInput.trim()) {
                          handleAddCustomCategory()
                          setNewIssue((prev) => ({ ...prev, category: newCategoryInput.trim() }))
                        }
                      } else if (e.key === "Escape") {
                        setIsAddingCategory(false)
                        setNewCategoryInput("")
                      }
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newCategoryInput.trim()) {
                        handleAddCustomCategory()
                        setNewIssue((prev) => ({ ...prev, category: newCategoryInput.trim() }))
                      }
                    }}
                    disabled={!newCategoryInput.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setIsAddingCategory(false)
                      setNewCategoryInput("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Select
                  value={newIssue.category}
                  onValueChange={(val) => {
                    if (val === ADD_NEW_CATEGORY) {
                      setIsAddingCategory(true)
                    } else {
                      setNewIssue((prev) => ({ ...prev, category: val }))
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {allCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value={ADD_NEW_CATEGORY}>+ Add new category</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Initial Follow-up</Label>
              <Textarea
                placeholder="Optional initial note"
                className="min-h-[36px] text-sm resize-none"
                rows={1}
                value={newIssueFollowUp}
                onChange={(e) => setNewIssueFollowUp(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Owner</Label>
              <Input
                placeholder="Responsible person"
                value={newIssue.owner}
                onChange={(e) => setNewIssue((prev) => ({ ...prev, owner: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Supplier</Label>
                <Input
                  placeholder="Supplier Name"
                  value={newIssue.supplierName}
                  onChange={(e) => setNewIssue((prev) => ({ ...prev, supplierName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Function</Label>
                <Input
                  placeholder="Outsourced Function"
                  value={newIssue.functionName}
                  onChange={(e) => setNewIssue((prev) => ({ ...prev, functionName: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                <Select
                  value={newIssue.status}
                  onValueChange={(val) => setNewIssue((prev) => ({ ...prev, status: val as IssueStatus }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Open", "In Progress", "Blocked", "Closed"].map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Severity</Label>
                <Select
                  value={newIssue.severity}
                  onValueChange={(val) => setNewIssue((prev) => ({ ...prev, severity: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {ISSUE_SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Opened On</Label>
                <Input
                  type="date"
                  value={toInputDateValue(newIssue.dateOpened)}
                  onChange={(e) => setNewIssue((prev) => ({ ...prev, dateOpened: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Due Date</Label>
                <Input
                  type="date"
                  value={toInputDateValue(newIssue.dueDate)}
                  onChange={(e) => setNewIssue((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>
            {newIssue.status === "Closed" && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Closed On</Label>
                <Input
                  type="date"
                  value={toInputDateValue(newIssue.dateClosed)}
                  onChange={(e) => setNewIssue((prev) => ({ ...prev, dateClosed: e.target.value }))}
                />
              </div>
            )}
            <Button onClick={handleCreateIssue} disabled={!newIssue.title || !newIssue.description || !newIssue.category} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Issue
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Critical Outsourcing Monitor Section */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              Critical Outsourcing Monitor
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {filteredCriticalMonitor.length} of {criticalMonitorView.length} critical supplier(s)
              </span>
              <Button variant="outline" size="sm" onClick={handleExportCriticalMonitor} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Summary of critical active outsourcing arrangements. Fields marked with * can be edited directly.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Provider:</Label>
              <Select
                value={cmProviderFilter || ALL_PROVIDERS}
                onValueChange={(val) => setCmProviderFilter(val === ALL_PROVIDERS ? "" : val)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Providers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_PROVIDERS}>All Providers</SelectItem>
                  {uniqueProviders.map((provider) => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium whitespace-nowrap">Category:</Label>
              <Select value={cmCategoryFilter} onValueChange={setCmCategoryFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CATEGORY_ALL}>All</SelectItem>
                  <SelectItem value={CATEGORY_CLOUD}>Cloud</SelectItem>
                  <SelectItem value={CATEGORY_SERVICES}>Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(cmProviderFilter || cmCategoryFilter !== CATEGORY_ALL) && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
                onClick={() => {
                  setCmProviderFilter("")
                  setCmCategoryFilter(CATEGORY_ALL)
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {criticalMonitorView.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>No critical active suppliers found.</p>
              <p className="text-sm">Suppliers must be marked as Critical, have Active status, and have Provider Name and Category filled in (no pending fields).</p>
            </div>
          ) : filteredCriticalMonitor.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No suppliers match the current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[150px]">Provider Name</TableHead>
                    <TableHead className="min-w-[150px]">Function Name</TableHead>
                    <TableHead className="min-w-[90px]">Category</TableHead>
                    <TableHead className="min-w-[150px]">Contract *</TableHead>
                    <TableHead className="min-w-[130px]">Criticality Assessment</TableHead>
                    <TableHead className="min-w-[130px]">Suitability Assessment *</TableHead>
                    <TableHead className="min-w-[130px]">Risk Assessment Date</TableHead>
                    <TableHead className="min-w-[180px]">Audit Reports *</TableHead>
                    <TableHead className="min-w-[110px]">Last Audit</TableHead>
                    <TableHead className="min-w-[120px]">Cloud Officer</TableHead>
                    <TableHead className="min-w-[130px]">Resource Operator</TableHead>
                    <TableHead className="min-w-[130px]">CO & RO Assessment *</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCriticalMonitor.map((item) => (
                    <TableRow key={item.supplierReferenceNumber}>
                      <TableCell className="font-medium">{item.providerName || "—"}</TableCell>
                      <TableCell>{item.functionName || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={item.category === "Cloud" ? "default" : "secondary"}>
                          {item.category === "Cloud" ? "Cloud" : "Services"}
                        </Badge>
                      </TableCell>
                      {/* Contract - Editable */}
                      <TableCell
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          editingCmCell?.refNum === item.supplierReferenceNumber && editingCmCell?.field === "contract" && "bg-muted"
                        )}
                        onClick={() => {
                          if (editingCmCell?.refNum !== item.supplierReferenceNumber || editingCmCell?.field !== "contract") {
                            startEditCmCell(item.supplierReferenceNumber, "contract", item.contract)
                          }
                        }}
                      >
                        {editingCmCell?.refNum === item.supplierReferenceNumber && editingCmCell?.field === "contract" ? (
                          <Input
                            autoFocus
                            value={editingCmValue}
                            onChange={(e) => setEditingCmValue(e.target.value)}
                            onBlur={saveCmCell}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveCmCell()
                              if (e.key === "Escape") cancelEditCmCell()
                            }}
                            className="h-8"
                          />
                        ) : (
                          <span className={cn(!item.contract && "text-muted-foreground")}>{item.contract || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(item.criticalityAssessmentDate)}</TableCell>
                      {/* Suitability Assessment - Editable Date */}
                      <TableCell
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          editingCmCell?.refNum === item.supplierReferenceNumber && editingCmCell?.field === "suitabilityAssessmentDate" && "bg-muted"
                        )}
                        onClick={() => {
                          if (editingCmCell?.refNum !== item.supplierReferenceNumber || editingCmCell?.field !== "suitabilityAssessmentDate") {
                            startEditCmCell(item.supplierReferenceNumber, "suitabilityAssessmentDate", toInputDateValue(item.suitabilityAssessmentDate))
                          }
                        }}
                      >
                        {editingCmCell?.refNum === item.supplierReferenceNumber && editingCmCell?.field === "suitabilityAssessmentDate" ? (
                          <Input
                            type="date"
                            autoFocus
                            value={editingCmValue}
                            onChange={(e) => setEditingCmValue(e.target.value)}
                            onBlur={saveCmCell}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveCmCell()
                              if (e.key === "Escape") cancelEditCmCell()
                            }}
                            className="h-8"
                          />
                        ) : (
                          <span className={cn(!item.suitabilityAssessmentDate && "text-muted-foreground")}>
                            {formatDate(item.suitabilityAssessmentDate)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(item.riskAssessment)}</TableCell>
                      {/* Audit Reports - Editable */}
                      <TableCell
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          editingCmCell?.refNum === item.supplierReferenceNumber && editingCmCell?.field === "auditReports" && "bg-muted"
                        )}
                        onClick={() => {
                          if (editingCmCell?.refNum !== item.supplierReferenceNumber || editingCmCell?.field !== "auditReports") {
                            startEditCmCell(item.supplierReferenceNumber, "auditReports", item.auditReports)
                          }
                        }}
                      >
                        {editingCmCell?.refNum === item.supplierReferenceNumber && editingCmCell?.field === "auditReports" ? (
                          <Input
                            autoFocus
                            value={editingCmValue}
                            onChange={(e) => setEditingCmValue(e.target.value)}
                            onBlur={saveCmCell}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveCmCell()
                              if (e.key === "Escape") cancelEditCmCell()
                            }}
                            className="h-8"
                          />
                        ) : (
                          <span className={cn(!item.auditReports && "text-muted-foreground")}>{item.auditReports || "—"}</span>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(item.lastAuditDate)}</TableCell>
                      <TableCell>{item.cloudOfficer || <span className="text-muted-foreground">—</span>}</TableCell>
                      <TableCell>{item.resourceOperator || <span className="text-muted-foreground">—</span>}</TableCell>
                      {/* CO & RO Assessment - Editable Date */}
                      <TableCell
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          editingCmCell?.refNum === item.supplierReferenceNumber && editingCmCell?.field === "coRoAssessmentDate" && "bg-muted"
                        )}
                        onClick={() => {
                          if (editingCmCell?.refNum !== item.supplierReferenceNumber || editingCmCell?.field !== "coRoAssessmentDate") {
                            startEditCmCell(item.supplierReferenceNumber, "coRoAssessmentDate", toInputDateValue(item.coRoAssessmentDate))
                          }
                        }}
                      >
                        {editingCmCell?.refNum === item.supplierReferenceNumber && editingCmCell?.field === "coRoAssessmentDate" ? (
                          <Input
                            type="date"
                            autoFocus
                            value={editingCmValue}
                            onChange={(e) => setEditingCmValue(e.target.value)}
                            onBlur={saveCmCell}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") saveCmCell()
                              if (e.key === "Escape") cancelEditCmCell()
                            }}
                            className="h-8"
                          />
                        ) : (
                          <span className={cn(!item.coRoAssessmentDate && "text-muted-foreground")}>
                            {formatDate(item.coRoAssessmentDate)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
