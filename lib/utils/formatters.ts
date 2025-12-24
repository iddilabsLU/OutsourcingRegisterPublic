/**
 * Data Formatting Utilities
 *
 * Functions for formatting data for display to users.
 * Keeps formatting consistent across the application.
 */

/**
 * Format date to readable string
 *
 * @param date - Date string, Date object, or timestamp
 * @param options - Intl.DateTimeFormat options
 *
 * @example
 * ```ts
 * formatDate("2025-10-06") // "Oct 6, 2025"
 * formatDate(new Date(), { dateStyle: "full" }) // "Monday, October 6, 2025"
 * ```
 */
export function formatDate(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  }
): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date

  return new Intl.DateTimeFormat("en-US", options).format(dateObj)
}

/**
 * Format date to short format (dd/mm/yy)
 *
 * @param date - Date string, Date object, or timestamp
 *
 * @example
 * ```ts
 * formatDateShort("2025-10-06") // "06/10/25"
 * formatDateShort(new Date(2024, 0, 15)) // "15/01/24"
 * ```
 */
export function formatDateShort(date: string | Date | number): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date
  const day = String(dateObj.getDate()).padStart(2, '0')
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const year = String(dateObj.getFullYear()).slice(-2)
  return `${day}/${month}/${year}`
}

/**
 * Format date and time
 *
 * @example
 * ```ts
 * formatDateTime("2025-10-06T14:30:00") // "Oct 6, 2025, 2:30 PM"
 * ```
 */
export function formatDateTime(
  date: string | Date | number,
  options: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }
): string {
  return formatDate(date, options)
}

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 *
 * @example
 * ```ts
 * formatRelativeTime(Date.now() - 3600000) // "1 hour ago"
 * formatRelativeTime(Date.now() + 86400000) // "in 1 day"
 * ```
 */
export function formatRelativeTime(date: string | Date | number): string {
  const dateObj = typeof date === "string" || typeof date === "number" ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })

  // Define time units
  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: "year", seconds: 31536000 },
    { unit: "month", seconds: 2592000 },
    { unit: "week", seconds: 604800 },
    { unit: "day", seconds: 86400 },
    { unit: "hour", seconds: 3600 },
    { unit: "minute", seconds: 60 },
    { unit: "second", seconds: 1 },
  ]

  // Find appropriate unit
  for (const { unit, seconds } of units) {
    const value = Math.floor(diffInSeconds / seconds)
    if (Math.abs(value) >= 1) {
      return rtf.format(-value, unit)
    }
  }

  return rtf.format(0, "second")
}

/**
 * Format currency
 *
 * @param amount - Number to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 *
 * @example
 * ```ts
 * formatCurrency(1234.56) // "$1,234.56"
 * formatCurrency(1234.56, "EUR", "de-DE") // "1.234,56 €"
 * ```
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount)
}

/**
 * Format number with separators
 *
 * @example
 * ```ts
 * formatNumber(1234567.89) // "1,234,567.89"
 * formatNumber(1234567.89, "de-DE") // "1.234.567,89"
 * ```
 */
export function formatNumber(value: number, locale: string = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value)
}

/**
 * Format percentage
 *
 * @example
 * ```ts
 * formatPercentage(0.1234) // "12.34%"
 * formatPercentage(0.5, 0) // "50%"
 * ```
 */
export function formatPercentage(
  value: number,
  decimals: number = 2,
  locale: string = "en-US"
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

/**
 * Format file size
 *
 * @example
 * ```ts
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1536000) // "1.5 MB"
 * formatFileSize(2048576000) // "2 GB"
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}

/**
 * Format phone number (US format)
 *
 * @example
 * ```ts
 * formatPhoneNumber("1234567890") // "(123) 456-7890"
 * formatPhoneNumber("123-456-7890") // "(123) 456-7890"
 * ```
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "")

  // Check if valid length
  if (cleaned.length !== 10) {
    return phone // Return original if not valid
  }

  // Format: (XXX) XXX-XXXX
  return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
}

/**
 * Truncate text with ellipsis
 *
 * @example
 * ```ts
 * truncateText("This is a long text", 10) // "This is a..."
 * truncateText("Short", 10) // "Short"
 * ```
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + "..."
}

/**
 * Format list of items
 *
 * @example
 * ```ts
 * formatList(["apple", "banana", "cherry"]) // "apple, banana, and cherry"
 * formatList(["apple", "banana"]) // "apple and banana"
 * ```
 */
export function formatList(items: string[], locale: string = "en-US"): string {
  return new Intl.ListFormat(locale, { style: "long", type: "conjunction" }).format(items)
}
