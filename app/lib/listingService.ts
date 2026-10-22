import { apiGet, apiPost, apiPut } from "./apiClient";
import { uploadFileClient } from "./clientUpload";
import { LISTINGS_DB, getListingById as getMockListingById } from "../data/listings";

export interface CreateListingData {
    title: string;
    description: string;
    price: number;
    category: string;
    condition: string;
    images: string[];
    location: string;
    [key: string]: any;
}

function filterSeededListings(filters: any = {}) {
    return LISTINGS_DB.filter((item) => {
        if (filters.category && item.category.toLowerCase() !== String(filters.category).toLowerCase()) {
            return false;
        }
        if (filters.campus && item.campusSlug && item.campusSlug !== filters.campus && filters.campus !== "buk-kano-new") {
            return false;
        }
        if (filters.minPrice && item.price < Number(filters.minPrice)) {
            return false;
        }
        if (filters.maxPrice && item.price > Number(filters.maxPrice)) {
            return false;
        }
        if (filters.search) {
            const q = String(filters.search).toLowerCase();
            const matchTitle = item.title.toLowerCase().includes(q);
            const matchDesc = item.description.toLowerCase().includes(q);
            const matchLoc = item.location.toLowerCase().includes(q);
            return matchTitle || matchDesc || matchLoc;
        }
        return true;
    });
}

export const listingService = {
    /**
     * Fetch all active listings with optional filters.
     * Falls back to seeded ABU Zaria marketplace data when backend API is offline.
     */
    getActiveListings: async (filters: any = {}) => {
        try {
            const query = new URLSearchParams();
            query.append("status", "active");
            if (filters.category && filters.category !== "All") query.append("category", filters.category);
            if (filters.search) query.append("search", filters.search);
            if (filters.campus && filters.campus !== "All Campuses") query.append("campus", filters.campus);
            if (filters.minPrice) query.append("minPrice", filters.minPrice.toString());
            if (filters.maxPrice) query.append("maxPrice", filters.maxPrice.toString());
            if (filters.limit) query.append("limit", filters.limit.toString());
            if (filters.cursor) query.append("cursor", filters.cursor);

            const queryString = query.toString();
            const res = await apiGet<any>(`/listings${queryString ? `?${queryString}` : ""}`);
            if (res && Array.isArray(res.data) && res.data.length > 0) {
                return res;
            }
            return { success: true, data: filterSeededListings(filters) };
        } catch {
            return { success: true, data: filterSeededListings(filters) };
        }
    },

    /**
     * Create a new listing
     */
    createListing: async (data: CreateListingData) => {
        return apiPost<any>("/listings", data);
    },

    /**
     * Upload images to Cloudinary via canonical secure upload flow
     */
    uploadImages: async (files: File[]) => {
        const uploadPromises = files.map((file) => uploadFileClient(file, "listing_image"));
        const results = await Promise.all(uploadPromises);
        const successfulUrls = results.filter((r) => r.success && r.url).map((r) => r.url);
        if (successfulUrls.length === 0 && files.length > 0) {
            throw new Error("Failed to upload images. Please verify file formats (JPG, PNG, WEBP) and size limits.");
        }
        return { success: true, urls: successfulUrls };
    },

    /**
     * Fetch listings for the current user (for dashboard)
     */
    getUserListings: async () => {
        try {
            const res = await apiGet<any>("/listings?sellerId=me");
            if (res && Array.isArray(res.data) && res.data.length > 0) {
                return res;
            }
            return { success: true, data: LISTINGS_DB.slice(0, 4) };
        } catch {
            return { success: true, data: LISTINGS_DB.slice(0, 4) };
        }
    },

    /**
     * Admin: Fetch all listings with status filter
     */
    getAllAdminListings: async (status?: string) => {
        try {
            return await apiGet<any>(`/admin/listings${status ? `?status=${status}` : ""}`);
        } catch {
            return { success: true, data: LISTINGS_DB };
        }
    },

    /**
     * Fetch a single listing by ID or Slug
     */
    getListingById: async (id: string) => {
        try {
            const res = await apiGet<any>(`/listings/${id}`);
            if (res && res.data) {
                return res;
            }
        } catch {
            // Fallback to local seeded listing below
        }
        const local = getMockListingById(id) ?? LISTINGS_DB[0];
        return {
            success: true,
            data: {
                ...local,
                _id: String(local.id),
                sellerId: {
                    _id: local.sellerId,
                    profile: {
                        displayName: local.sellerName,
                        handle: local.sellerHandle,
                        avatar: "/placeholder.png",
                    },
                    studentStatus: {
                        isVerified: local.sellerVerificationType === "verified_student",
                    },
                    businessProfile:
                        local.sellerVerificationType === "verified_business"
                            ? { name: local.sellerName, isApproved: true }
                            : undefined,
                },
            },
        };
    },

    /**
     * Admin: Approve a listing
     */
    approveListing: async (id: string) => {
        return apiPut<any>(`/admin/listings/${id}`, { status: "active" });
    },

    /**
     * Admin: Reject a listing
     */
    rejectListing: async (id: string, reason: string) => {
        return apiPut<any>(`/admin/listings/${id}`, { status: "rejected", reason });
    },

    /**
     * Update an existing listing
     */
    updateListing: async (id: string, data: Partial<CreateListingData>) => {
        return apiPut<any>(`/listings/${id}`, data);
    },
};
