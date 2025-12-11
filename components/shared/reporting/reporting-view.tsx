"use client"

import { useMemo, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useReporting } from "@/hooks/use-reporting"
import type { EventLog, IssueRecord, IssueStatus } from "@/lib/types/reporting"
import { cn } from "@/lib/utils/cn"

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
  riskBefore?: string
  riskAfter?: string
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

export function ReportingView() {
  const {
    events,
    issues,
    isLoading,
    error,
    addEvent,
    updateEvent,
    deleteEvent,
    addIssue,
    updateIssue,
    deleteIssue,
  } = useReporting()
  const [period, setPeriod] = useState<PeriodKey>("last30")
  const [searchTerm, setSearchTerm] = useState("")
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")
  const [editingEventId, setEditingEventId] = useState<number | null>(null)
  const [editingIssueId, setEditingIssueId] = useState<number | null>(null)
  const [editingIssueForm, setEditingIssueForm] = useState<IssueRecord | null>(null)
  const [followUpDrafts, setFollowUpDrafts] = useState<Record<number, string>>({})

  const [newIssue, setNewIssue] = useState<IssueRecord>({
    title: "",
    description: "",
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
    riskBefore: "",
    riskAfter: "",
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
        matchesSearch(issue.status) ||
        matchesSearch(issue.severity) ||
        matchesSearch(issue.owner) ||
        matchesSearch(issue.supplierName) ||
        matchesSearch(issue.functionName) ||
        followUpMatch
      )
    })
  }, [issues, period, searchTerm, matchesSearch, rangeStart, rangeEnd])

  const openIssues = filteredIssues.filter((issue) => issue.status !== "Closed")
  const closedInPeriod = filteredIssues.filter((issue) => issue.status === "Closed")

  const riskChanges = filteredEvents.filter((ev) => ev.type === "risk_changed")

  const handleCreateIssue = async () => {
    if (!newIssue.title.trim() || !newIssue.description.trim()) return
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
      riskBefore: newEvent.riskBefore?.trim() || undefined,
      riskAfter: newEvent.riskAfter?.trim() || undefined,
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
      riskBefore: "",
      riskAfter: "",
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
      riskBefore: event.riskBefore ?? "",
      riskAfter: event.riskAfter ?? "",
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
      riskBefore: editingEventForm.riskBefore?.trim() || undefined,
      riskAfter: editingEventForm.riskAfter?.trim() || undefined,
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

  const summaryCards = [
    { label: "Events", value: filteredEvents.length },
    { label: "Open issues", value: openIssues.length },
    { label: "Closed (period)", value: closedInPeriod.length },
    { label: "Risk changes", value: riskChanges.length },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Reporting</h2>
          <p className="text-sm text-muted-foreground">Period change log and issues for management reporting.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Input
            placeholder="Search events and issues"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sm:w-64"
          />
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
      </div>

      {isLoading && <div className="text-sm text-muted-foreground">Loading reporting data…</div>}
      {error && <div className="text-sm text-destructive">Reporting error: {error}</div>}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{card.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-3xl font-semibold">{card.value}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader>
            <CardTitle>Events in period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredEvents.length === 0 && <p className="text-sm text-muted-foreground">No events in this period.</p>}
            {filteredEvents.map((event) => (
              <div key={`${event.id}-${event.date}-${event.type}`} className="rounded-lg border p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formatEventType(event.type)}</Badge>
                    {event.supplierName && <span className="text-sm font-medium">{event.supplierName}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(event.date)}</span>
                    <Button variant="ghost" size="sm" onClick={() => startEditEvent(event)}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteEvent(event.id)}>
                      Delete
                    </Button>
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
                        placeholder="Supplier (optional)"
                        value={editingEventForm.supplierName}
                        onChange={(e) =>
                          setEditingEventForm((prev) => (prev ? { ...prev, supplierName: e.target.value } : prev))
                        }
                      />
                      <Input
                        placeholder="Function (optional)"
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
                    <div className="grid grid-cols-2 gap-2 md:col-span-2">
                      <Input
                        placeholder="Risk before"
                        value={editingEventForm.riskBefore}
                        onChange={(e) =>
                          setEditingEventForm((prev) => (prev ? { ...prev, riskBefore: e.target.value } : prev))
                        }
                      />
                      <Input
                        placeholder="Risk after"
                        value={editingEventForm.riskAfter}
                        onChange={(e) =>
                          setEditingEventForm((prev) => (prev ? { ...prev, riskAfter: e.target.value } : prev))
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
                    <div className="text-sm">{event.summary}</div>
                    {(event.oldValue || event.newValue) && (
                      <div className="text-xs text-muted-foreground">
                        {event.oldValue ?? "—"} → {event.newValue ?? "—"}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground flex flex-wrap gap-3">
                      {event.severity && <span>Severity: {event.severity}</span>}
                      {event.functionName && <span>Function: {event.functionName}</span>}
                      {event.riskBefore && <span>Risk before: {event.riskBefore}</span>}
                      {event.riskAfter && <span>Risk after: {event.riskAfter}</span>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Log Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
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
            {newEvent.type === "custom" && (
              <Input
                placeholder="Custom type"
                value={newEvent.customType}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, customType: e.target.value }))}
              />
            )}
            <Input
              placeholder="Summary"
              value={newEvent.summary}
              onChange={(e) => setNewEvent((prev) => ({ ...prev, summary: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                value={toInputDateValue(newEvent.date)}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, date: e.target.value }))}
              />
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
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Supplier (optional)"
                value={newEvent.supplierName}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, supplierName: e.target.value }))}
              />
              <Input
                placeholder="Function (optional)"
                value={newEvent.functionName}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, functionName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Old value"
                value={newEvent.oldValue}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, oldValue: e.target.value }))}
              />
              <Input
                placeholder="New value"
                value={newEvent.newValue}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, newValue: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Risk before"
                value={newEvent.riskBefore}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, riskBefore: e.target.value }))}
              />
              <Input
                placeholder="Risk after"
                value={newEvent.riskAfter}
                onChange={(e) => setNewEvent((prev) => ({ ...prev, riskAfter: e.target.value }))}
              />
            </div>
            <Button onClick={handleCreateEvent} disabled={!newEvent.summary.trim()}>
              Add Event
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Issues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredIssues.length === 0 && <p className="text-sm text-muted-foreground">No issues in this period.</p>}
            {filteredIssues.map((issue) => (
              <div key={issue.id ?? issue.title} className="rounded-lg border p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      {editingIssueId === issue.id && editingIssueForm ? (
                        <Input
                          value={editingIssueForm.title}
                          onChange={(e) =>
                            setEditingIssueForm((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                          }
                        />
                      ) : (
                        <span className="font-semibold">{issue.title}</span>
                      )}
                      <Badge className={cn("text-xs", STATUS_COLORS[issue.status])}>{issue.status}</Badge>
                      {issue.severity && <Badge variant="outline">{issue.severity}</Badge>}
                    </div>
                    {editingIssueId === issue.id && editingIssueForm ? (
                      <Textarea
                        value={editingIssueForm.description}
                        onChange={(e) =>
                          setEditingIssueForm((prev) => (prev ? { ...prev, description: e.target.value } : prev))
                        }
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">{issue.description}</p>
                    )}
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                      {editingIssueId === issue.id && editingIssueForm ? (
                        <>
                          <Input
                            placeholder="Supplier (optional)"
                            value={editingIssueForm.supplierName ?? ""}
                            onChange={(e) =>
                              setEditingIssueForm((prev) => (prev ? { ...prev, supplierName: e.target.value } : prev))
                            }
                          />
                          <Input
                            placeholder="Function (optional)"
                            value={editingIssueForm.functionName ?? ""}
                            onChange={(e) =>
                              setEditingIssueForm((prev) => (prev ? { ...prev, functionName: e.target.value } : prev))
                            }
                          />
                          <Input
                            placeholder="Owner"
                            value={editingIssueForm.owner ?? ""}
                            onChange={(e) =>
                              setEditingIssueForm((prev) => (prev ? { ...prev, owner: e.target.value } : prev))
                            }
                          />
                          <Input
                            type="date"
                            value={toInputDateValue(editingIssueForm.dueDate)}
                            onChange={(e) =>
                              setEditingIssueForm((prev) => (prev ? { ...prev, dueDate: e.target.value } : prev))
                            }
                          />
                          <Input
                            type="date"
                            value={toInputDateValue(editingIssueForm.dateOpened)}
                            onChange={(e) =>
                              setEditingIssueForm((prev) => (prev ? { ...prev, dateOpened: e.target.value } : prev))
                            }
                            placeholder="Opened on"
                          />
                          {editingIssueForm.status === "Closed" && (
                            <Input
                              type="date"
                              value={toInputDateValue(editingIssueForm.dateClosed)}
                              onChange={(e) =>
                                setEditingIssueForm((prev) => (prev ? { ...prev, dateClosed: e.target.value } : prev))
                              }
                              placeholder="Closed on"
                            />
                          )}
                          <Select
                            value={editingIssueForm.severity ?? ""}
                            onValueChange={(val) =>
                              setEditingIssueForm((prev) => (prev ? { ...prev, severity: val } : prev))
                            }
                          >
                            <SelectTrigger className="w-32">
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
                        </>
                      ) : (
                        <>
                          {issue.supplierName && <span>Supplier: {issue.supplierName}</span>}
                          {issue.functionName && <span>Function: {issue.functionName}</span>}
                          {issue.owner && <span>Owner: {issue.owner}</span>}
                          {issue.dueDate && <span>Due: {formatDate(issue.dueDate)}</span>}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 items-end">
                    <Select value={issue.status} onValueChange={(val) => handleStatusChange(issue, val as IssueStatus)}>
                      <SelectTrigger className="w-32">
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
                    <div className="flex gap-2">
                      {editingIssueId === issue.id ? (
                        <>
                          <Button size="sm" onClick={handleSaveIssueEdit} disabled={!editingIssueForm?.title?.trim()}>
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingIssueId(null)
                              setEditingIssueForm(null)
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" variant="ghost" onClick={() => startEditIssue(issue)}>
                          Edit
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => deleteIssue(issue.id!)} className="text-destructive">
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
                  <span>Opened: {formatDate(issue.dateOpened)}</span>
                  <span>Last update: {formatDate(issue.dateLastUpdate)}</span>
                  {issue.dueDate && <span>Due: {formatDate(issue.dueDate)}</span>}
                  {issue.dateClosed && <span>Closed: {formatDate(issue.dateClosed)}</span>}
                </div>
                {issue.followUps && issue.followUps.length > 0 && (
                  <div className="rounded-md bg-muted/40 p-2">
                    <div className="text-xs font-semibold mb-1">Follow-ups</div>
                    <div className="space-y-1">
                      {issue.followUps.map((f, idx) => (
                        <div key={`${issue.id}-fu-${idx}`} className="text-xs text-muted-foreground">
                          {formatDate(f.date)} — {f.note}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add follow-up"
                    value={followUpDrafts[issue.id ?? -1] ?? ""}
                    onChange={(e) => setFollowUpDrafts((prev) => ({ ...prev, [issue.id ?? -1]: e.target.value }))}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFollowUpAdd(issue)}
                    disabled={!followUpDrafts[issue.id ?? -1]?.trim()}
                  >
                    Add follow-up
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Issue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Title"
              value={newIssue.title}
              onChange={(e) => setNewIssue((prev) => ({ ...prev, title: e.target.value }))}
            />
            <Textarea
              placeholder="Description"
              value={newIssue.description}
              onChange={(e) => setNewIssue((prev) => ({ ...prev, description: e.target.value }))}
            />
            <Textarea
              placeholder="Follow-up (optional)"
              value={newIssueFollowUp}
              onChange={(e) => setNewIssueFollowUp(e.target.value)}
            />
            <Input
              placeholder="Owner"
              value={newIssue.owner}
              onChange={(e) => setNewIssue((prev) => ({ ...prev, owner: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Supplier (optional)"
                value={newIssue.supplierName}
                onChange={(e) => setNewIssue((prev) => ({ ...prev, supplierName: e.target.value }))}
              />
              <Input
                placeholder="Function (optional)"
                value={newIssue.functionName}
                onChange={(e) => setNewIssue((prev) => ({ ...prev, functionName: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
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
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                placeholder="Opened on"
                value={toInputDateValue(newIssue.dateOpened)}
                onChange={(e) => setNewIssue((prev) => ({ ...prev, dateOpened: e.target.value }))}
              />
              {newIssue.status === "Closed" && (
                <Input
                  type="date"
                  placeholder="Closed on"
                  value={toInputDateValue(newIssue.dateClosed)}
                  onChange={(e) => setNewIssue((prev) => ({ ...prev, dateClosed: e.target.value }))}
                />
              )}
            </div>
            <Input
              type="date"
              placeholder="Due date"
              value={toInputDateValue(newIssue.dueDate)}
              onChange={(e) => setNewIssue((prev) => ({ ...prev, dueDate: e.target.value }))}
            />
            <Button onClick={handleCreateIssue} disabled={!newIssue.title || !newIssue.description}>
              Add Issue
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
