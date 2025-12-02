/**
 * Generic File Upload Component
 *
 * Reusable file upload with drag-and-drop, preview, and validation.
 *
 * Features:
 * - Drag and drop support
 * - File type validation
 * - File size validation
 * - Preview for images
 * - Progress indicator (when uploading)
 * - Error handling
 *
 * @example
 * ```tsx
 * <FileUpload
 *   accept="image/*"
 *   maxSizeMB={5}
 *   onFileSelect={(file) => console.log(file)}
 *   onError={(error) => console.error(error)}
 * />
 * ```
 */

"use client"

import * as React from "react"
import { Upload, X, FileIcon, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

/**
 * FileUpload props
 */
export interface FileUploadProps {
  accept?: string // MIME types (e.g., "image/*", "application/pdf")
  maxSizeMB?: number // Maximum file size in megabytes
  onFileSelect?: (file: File) => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
  preview?: boolean // Show preview for images
}

export function FileUpload({
  accept = "*/*",
  maxSizeMB = 5,
  onFileSelect,
  onError,
  disabled = false,
  className,
  preview = true,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxSizeMB}MB`
    }

    // Check file type (basic check)
    if (accept !== "*/*") {
      const acceptedTypes = accept.split(",").map((t) => t.trim())
      const fileType = file.type
      const isAccepted = acceptedTypes.some((type) => {
        if (type.endsWith("/*")) {
          // Handle wildcard (e.g., "image/*")
          return fileType.startsWith(type.replace("/*", ""))
        }
        return fileType === type
      })

      if (!isAccepted) {
        return `File type must be: ${accept}`
      }
    }

    return null
  }

  // Handle file selection
  const handleFileSelect = (file: File) => {
    const error = validateFile(file)

    if (error) {
      onError?.(error)
      toast.error(error)
      return
    }

    setSelectedFile(file)
    onFileSelect?.(file)

    // Create preview for images
    if (preview && file.type.startsWith("image/")) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle file input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!disabled) {
      setIsDragging(true)
    }
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (disabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  // Clear selection
  const handleClear = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }

  // Click to browse
  const handleClick = () => {
    if (!disabled) {
      inputRef.current?.click()
    }
  }

  return (
    <div className={cn("w-full", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />

      {!selectedFile ? (
        <Card
          className={cn(
            "border-2 border-dashed transition-colors cursor-pointer",
            isDragging && "border-primary bg-primary/5",
            disabled && "opacity-50 cursor-not-allowed"
          )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-sm font-medium mb-1">
              {isDragging ? "Drop file here" : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-muted-foreground">
              {accept !== "*/*" ? `Accepted: ${accept}` : "Any file type"} (max {maxSizeMB}MB)
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {/* Preview or Icon */}
              <div className="flex-shrink-0">
                {previewUrl ? (
                  <div className="w-16 h-16 rounded overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                ) : selectedFile.type.startsWith("image/") ? (
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                    <FileIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>

              {/* Remove Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                disabled={disabled}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
