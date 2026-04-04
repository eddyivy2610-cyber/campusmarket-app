import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility for conditionally joining CSS classes with Tailwind-specific merging.
 * Uses 'clsx' for conditional logic and 'tailwind-merge' to resolve conflicting styles.
 * 
 * @param inputs - Any number of class name values, including objects or conditional strings.
 * @returns A single, merged string of CSS classes.
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
