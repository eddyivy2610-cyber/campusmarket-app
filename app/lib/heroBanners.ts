const HERO_BANNERS_STORAGE_KEY = "campusmarket.heroBanners";
const MAX_HERO_BANNERS = 6;

function isValidBannerUrl(value: unknown): value is string {
    return typeof value === "string" && value.trim().length > 0;
}

export function readStoredHeroBanners(): string[] {
    if (typeof window === "undefined") return [];

    try {
        const raw = window.localStorage.getItem(HERO_BANNERS_STORAGE_KEY);
        if (!raw) return [];

        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];

        return parsed.filter(isValidBannerUrl).slice(0, MAX_HERO_BANNERS);
    } catch {
        return [];
    }
}

export function saveHeroBanner(bannerUrl: string): string[] {
    if (typeof window === "undefined" || !isValidBannerUrl(bannerUrl)) return [];

    const existing = readStoredHeroBanners();
    const deduped = [bannerUrl, ...existing.filter((item) => item !== bannerUrl)];
    const next = deduped.slice(0, MAX_HERO_BANNERS);

    window.localStorage.setItem(HERO_BANNERS_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("hero-banners-updated"));

    return next;
}

