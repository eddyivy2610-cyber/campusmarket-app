import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { BASE_URL } from "./apiClient";

/**
 * A utility for conditionally joining CSS classes with Tailwind-specific merging.
 * Uses 'clsx' for conditional logic and 'tailwind-merge' to resolve conflicting styles.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Resolves an image path to a full URL if necessary.
 * Handles:
 * - Full URLs (http/https)
 * - Local paths (/uploads/...)
 * - Relative paths (uploads/...)
 * - Data URIs
 */
export function resolveImageUrl(path: string | null | undefined): string {
    if (!path) return "";
    
    // If it's already an absolute URL (including data URIs), return as is
    if (/^https?:\/\/|data:image\//i.test(path)) {
        return path;
    }
    
    // Ensure leading slash for relative paths
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    
    // If it starts with /uploads, it's a backend file
    if (normalizedPath.startsWith("/uploads")) {
        // Only prefix if BASE_URL is available and looks like a URL
        const base = BASE_URL || "http://localhost:4000";
        return `${base}${normalizedPath}`;
    }
    
    // Return path as is (might be a local public folder asset)
    return normalizedPath;
}
