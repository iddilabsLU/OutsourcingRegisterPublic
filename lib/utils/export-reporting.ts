import * as XLSX from "xlsx"
import type { EventLog, IssueRecord } from "@/lib/types/reporting"

const formatDate = (value?: string | null) => {
  if (!value) return ""
  const parsed = new Date(value)
  if (isNaN(parsed.getTime())) return ""
  const day = parsed.getUTCDate().toString().padStart(2, "0")
  const month = (parsed.getUTCMonth() + 1).toString().padStart(2, "0")
  const year = parsed.getUTCFullYear()
  return `${day}/${month}/${year}`
}

const formatEventType = (type?: string) =>
  (type ?? "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase())

const formatFollowUps = (followUps?: IssueRecord["followUps"]) => {
  if (!followUps || followUps.length === 0) return ""
  return followUps
    .map((f) => `${formatDate(f.date) || "—"} — ${f.note}`)
    .join("\n")
}

const buildFilename = (kind: "events" | "issues", scope: "all" | "filtered") => {
  const today = new Date()
  const yyyy = today.getFullYear()
  const mm = String(today.getMonth() + 1).padStart(2, "0")
  const dd = String(today.getDate()).padStart(2, "0")
  return `reporting-${kind}-${scope}-${yyyy}-${mm}-${dd}.xlsx`
}

const createSheet = (data: Record<string, string>[], headers: string[], widths: number[]) => {
  const worksheet = XLSX.utils.json_to_sheet(data)
  worksheet["!cols"] = widths.map((wch) => ({ wch }))
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1")
  for (let col = range.s.c; col <= range.e.c; col++) {
    const headerCell = XLSX.utils.encode_cell({ r: 0, c: col })
    if (worksheet[headerCell]) {
      worksheet[headerCell].s = {
        font: { bold: true },
        alignment: { horizontal: "left", vertical: "top" },
      }
    }
  }
  return worksheet
}

export const exportEventsToExcel = (events: EventLog[], scope: "all" | "filtered") => {
  const headers = [
    "Date",
    "Type",
    "Summary",
    "Severity",
    "Supplier",
    "Function",
    "Old Value",
    "New Value",
    "Risk Before",
    "Risk After",
  ]
  const widths = [12, 22, 50, 12, 25, 25, 20, 20, 12, 12]
  const rows = events.map((ev) => ({
    Date: formatDate(ev.date),
    Type: formatEventType(ev.type),
    Summary: ev.summary ?? "",
    Severity: ev.severity ?? "",
    Supplier: ev.supplierName ?? "",
    Function: ev.functionName ?? "",
    "Old Value": ev.oldValue ?? "",
    "New Value": ev.newValue ?? "",
    "Risk Before": ev.riskBefore ?? "",
    "Risk After": ev.riskAfter ?? "",
  }))

  const worksheet = createSheet(rows, headers, widths)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Events")
  XLSX.writeFile(workbook, buildFilename("events", scope))
}

export const exportIssuesToExcel = (issues: IssueRecord[], scope: "all" | "filtered") => {
  const headers = [
    "Title",
    "Description",
    "Status",
    "Severity",
    "Owner",
    "Supplier",
    "Function",
    "Opened",
    "Last Update",
    "Closed",
    "Due",
    "Follow-ups",
  ]
  const widths = [30, 50, 14, 12, 18, 25, 25, 12, 12, 12, 12, 40]
  const rows = issues.map((issue) => ({
    Title: issue.title,
    Description: issue.description,
    Status: issue.status,
    Severity: issue.severity ?? "",
    Owner: issue.owner ?? "",
    Supplier: issue.supplierName ?? "",
    Function: issue.functionName ?? "",
    Opened: formatDate(issue.dateOpened),
    "Last Update": formatDate(issue.dateLastUpdate),
    Closed: formatDate(issue.dateClosed ?? undefined),
    Due: formatDate(issue.dueDate),
    "Follow-ups": formatFollowUps(issue.followUps),
  }))

  const worksheet = createSheet(rows, headers, widths)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Issues")
  XLSX.writeFile(workbook, buildFilename("issues", scope))
}
