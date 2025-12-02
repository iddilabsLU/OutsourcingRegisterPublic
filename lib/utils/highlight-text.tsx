import React from "react"

/**
 * Highlights matching text within a string
 * Returns JSX with matching text wrapped in <mark> tags
 *
 * @param text - The text content to search within
 * @param searchTerm - The term to highlight (case-insensitive, partial matching)
 * @returns React element with highlighted matches
 */
export function highlightText(text: string, searchTerm: string): React.ReactNode {
  // Return original text if no search term
  if (!searchTerm || !searchTerm.trim()) {
    return text
  }

  // Return original text if text is empty
  if (!text) {
    return text
  }

  const trimmedSearch = searchTerm.trim()

  // Escape special regex characters in search term
  const escapedSearch = trimmedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

  // Create case-insensitive regex for partial matching
  const regex = new RegExp(`(${escapedSearch})`, "gi")

  // Split text by matches
  const parts = text.split(regex)

  // Return original if no matches
  if (parts.length === 1) {
    return text
  }

  // Wrap matches in <mark> tags
  return (
    <>
      {parts.map((part, index) => {
        // Check if this part matches the search term (case-insensitive)
        if (part.toLowerCase() === trimmedSearch.toLowerCase()) {
          return <mark key={index}>{part}</mark>
        }
        return <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </>
  )
}
