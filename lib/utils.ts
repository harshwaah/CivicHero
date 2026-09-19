import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { 
  getCategoryPlaceholder, 
  getCategoryPlaceholderAlt, 
  safeImageUrl as safeImgUrl,
  CIVIC_PLACEHOLDERS 
} from "./placeholders"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export { 
  getCategoryPlaceholder, 
  getCategoryPlaceholderAlt, 
  CIVIC_PLACEHOLDERS 
}

/**
 * Backward-compatible wrapper delegating to category-aware placeholder resolver
 */
export function getPlaceholderImage(category?: string, title?: string, description?: string): string {
  return getCategoryPlaceholder(category, title, description);
}

export function safeImageUrl(imageUrl?: string | null, category?: string, title?: string, description?: string): string {
  return safeImgUrl(imageUrl, category, title, description);
}


