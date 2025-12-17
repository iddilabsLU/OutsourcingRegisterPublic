import { useEffect, useState, useCallback } from "react"
import type { EventLog, IssueRecord, CriticalMonitorRecord } from "@/lib/types/reporting"

interface UseReportingResult {
  events: EventLog[]
  issues: IssueRecord[]
  criticalMonitorRecords: CriticalMonitorRecord[]
  isLoading: boolean
  error: string | null
  refresh: () => Promise<void>
  addEvent: (event: EventLog) => Promise<number>
  updateEvent: (event: EventLog) => Promise<void>
  deleteEvent: (id: number) => Promise<void>
  addIssue: (issue: IssueRecord) => Promise<number>
  updateIssue: (issue: IssueRecord) => Promise<void>
  deleteIssue: (id: number) => Promise<void>
  upsertCriticalMonitorRecord: (record: CriticalMonitorRecord) => Promise<number>
  deleteCriticalMonitorRecord: (supplierReferenceNumber: string) => Promise<void>
}

export function useReporting(): UseReportingResult {
  const [events, setEvents] = useState<EventLog[]>([])
  const [issues, setIssues] = useState<IssueRecord[]>([])
  const [criticalMonitorRecords, setCriticalMonitorRecords] = useState<CriticalMonitorRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (typeof window === "undefined" || !window.electronAPI) {
      setError("Electron API unavailable")
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const [fetchedEvents, fetchedIssues, fetchedCriticalMonitor] = await Promise.all([
        window.electronAPI.getEvents(),
        window.electronAPI.getIssues(),
        window.electronAPI.getCriticalMonitorRecords(),
      ])
      setEvents(fetchedEvents)
      setIssues(fetchedIssues)
      setCriticalMonitorRecords(fetchedCriticalMonitor)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reporting data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addIssue = useCallback(
    async (issue: IssueRecord) => {
      if (!window.electronAPI) throw new Error("Electron API unavailable")
      const id = await window.electronAPI.addIssue(issue)
      await refresh()
      return id
    },
    [refresh]
  )

  const addEvent = useCallback(
    async (event: EventLog) => {
      if (!window.electronAPI) throw new Error("Electron API unavailable")
      const id = await window.electronAPI.addEvent(event)
      await refresh()
      return id
    },
    [refresh]
  )

  const updateEvent = useCallback(
    async (event: EventLog) => {
      if (!window.electronAPI) throw new Error("Electron API unavailable")
      await window.electronAPI.updateEvent(event)
      await refresh()
    },
    [refresh]
  )

  const deleteEvent = useCallback(
    async (id: number) => {
      if (!window.electronAPI) throw new Error("Electron API unavailable")
      await window.electronAPI.deleteEvent(id)
      await refresh()
    },
    [refresh]
  )

  const updateIssue = useCallback(
    async (issue: IssueRecord) => {
      if (!window.electronAPI) throw new Error("Electron API unavailable")
      await window.electronAPI.updateIssue(issue)
      await refresh()
    },
    [refresh]
  )

  const deleteIssue = useCallback(
    async (id: number) => {
      if (!window.electronAPI) throw new Error("Electron API unavailable")
      await window.electronAPI.deleteIssue(id)
      await refresh()
    },
    [refresh]
  )

  const upsertCriticalMonitorRecord = useCallback(
    async (record: CriticalMonitorRecord) => {
      if (!window.electronAPI) throw new Error("Electron API unavailable")
      const id = await window.electronAPI.upsertCriticalMonitorRecord(record)
      await refresh()
      return id
    },
    [refresh]
  )

  const deleteCriticalMonitorRecord = useCallback(
    async (supplierReferenceNumber: string) => {
      if (!window.electronAPI) throw new Error("Electron API unavailable")
      await window.electronAPI.deleteCriticalMonitorRecord(supplierReferenceNumber)
      await refresh()
    },
    [refresh]
  )

  useEffect(() => {
    void refresh()
  }, [refresh])

  return {
    events,
    issues,
    criticalMonitorRecords,
    isLoading,
    error,
    refresh,
    addEvent,
    updateEvent,
    deleteEvent,
    addIssue,
    updateIssue,
    deleteIssue,
    upsertCriticalMonitorRecord,
    deleteCriticalMonitorRecord,
  }
}
