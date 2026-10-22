"use client";

/**
 * Utility for managing hero banners in local storage.
 * Used for persistent hero banner carousels across the application.
 */

const STORAGE_KEY = "hero-banners";

/**
 * Reads the list of hero banner image sources from local storage.
 * @returns Array of banner image paths or base64 strings.
 */
export function readStoredHeroBanners(): string[] {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("Error reading hero banners from storage:", error);
        return [];
    }
}

/**
 * Saves a new hero banner to local storage and notifies listeners.
 * @param bannerSource - The source path or base64 string of the banner image.
 */
export function saveHeroBanner(bannerSource: string): void {
    if (typeof window === "undefined") return;
    try {
        const banners = readStoredHeroBanners();
        // Prevent duplicates and limit to a reasonable number of banners
        if (banners.includes(bannerSource)) return;
        
        const updatedBanners = [bannerSource, ...banners].slice(0, 5);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedBanners));
        
        // Dispatch custom event for cross-component updates on the same page
        window.dispatchEvent(new Event("hero-banners-updated"));
        
        // Also dispatch storage event for cross-tab updates (though usually handled by browser)
        // But localStorage.setItem already triggers 'storage' in other tabs.
    } catch (error) {
        console.error("Error saving hero banner to storage:", error);
    }
}

/**
 * Clears all stored hero banners.
 */
export function clearHeroBanners(): void {
    if (typeof window === "undefined") return;
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event("hero-banners-updated"));
    } catch (error) {
        console.error("Error clearing hero banners:", error);
    }
}
