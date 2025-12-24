/**
 * Data Models
 *
 * Example data model patterns for common entities.
 * These are templates - customize for your specific application.
 */

import type { Status } from "./index"

/**
 * Base Model
 * Common fields that most models share
 */
export interface BaseModel {
  id: string
  createdAt: string
  updatedAt: string
}

/**
 * Example: User Profile model
 * Extends the base User type with additional profile fields
 */
export interface UserProfile extends BaseModel {
  userId: string
  bio?: string
  website?: string
  location?: string
  phone?: string
  preferences?: {
    theme?: "light" | "dark" | "system"
    emailNotifications?: boolean
    language?: string
  }
}

/**
 * Example: Generic Item model
 * Template for list items (products, posts, etc.)
 */
export interface Item extends BaseModel {
  name: string
  description?: string
  status: Status
  metadata?: Record<string, unknown>
}

/**
 * Example: Category model
 * For organizing items into categories
 */
export interface Category extends BaseModel {
  name: string
  slug: string
  description?: string
  parentId?: string
  order?: number
}

/**
 * Example: Address model
 * Generic address structure
 */
export interface Address {
  id?: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  isDefault?: boolean
}

/**
 * Example: Comment model
 * Generic comment/note structure
 */
export interface Comment extends BaseModel {
  content: string
  authorId: string
  authorName?: string
  parentId?: string // For nested comments
  isEdited?: boolean
}

/**
 * Example: Attachment model
 * For file attachments
 */
export interface Attachment extends BaseModel {
  filename: string
  fileSize: number
  fileType: string
  url: string
  thumbnailUrl?: string
  uploadedBy: string
}

/**
 * Example: Activity Log model
 * For tracking user actions/system events
 */
export interface ActivityLog extends BaseModel {
  action: string
  entityType: string
  entityId: string
  userId?: string
  metadata?: Record<string, unknown>
  ipAddress?: string
}

/**
 * Add your own models here based on your application needs
 *
 * Examples for different types of applications:
 *
 * E-commerce:
 * - Product, Order, Cart, Payment
 *
 * CRM:
 * - Contact, Company, Deal, Task
 *
 * Project Management:
 * - Project, Task, Team, Milestone
 *
 * Content Management:
 * - Post, Page, Media, Author
 */
