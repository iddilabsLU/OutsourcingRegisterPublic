/**
 * Class Name Utility
 *
 * Combines Tailwind CSS classes intelligently.
 * Handles conflicts (e.g., if you add both "text-red-500" and "text-blue-500",
 * it keeps only the last one).
 *
 * This is used by shadcn/ui components. Don't modify unless you know what you're doing.
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
