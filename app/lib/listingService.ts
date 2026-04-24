import { apiGet, apiPost, apiPut } from "./apiClient";

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

export const listingService = {
    /**
     * Fetch all active listings with optional filters
     */
    getActiveListings: async (filters: any = {}) => {
        const query = new URLSearchParams();
        if (filters.category) query.append("category", filters.category);
        if (filters.search) query.append("search", filters.search);
        if (filters.minPrice) query.append("minPrice", filters.minPrice.toString());
        if (filters.maxPrice) query.append("maxPrice", filters.maxPrice.toString());

        const queryString = query.toString();
        return apiGet<any>(`/listing/active${queryString ? `?${queryString}` : ""}`);
    },

    /**
     * Create a new listing
     */
    createListing: async (data: CreateListingData) => {
        return apiPost<any>("/listing/create", data);
    },

    /**
     * Upload images to Cloudinary via backend
     */
    uploadImages: async (files: File[]) => {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("images", file);
        });

        return apiPost<{ success: boolean; urls: string[] }>("/upload", formData);
    },

    /**
     * Fetch listings for the current user (for dashboard)
     */
    getUserListings: async () => {
        // This might need a new endpoint in the backend, 
        // but for now we'll assume there's one or we'll filter active ones
        return apiGet<any>("/listing/user/all");
    },
    /**
     * Admin: Fetch all listings with status filter
     */
    getAllAdminListings: async (status?: string) => {
        return apiGet<any>(`/listing/admin/all${status ? `?status=${status}` : ""}`);
    },

    /**
     * Fetch a single listing by ID or Slug
     */
    getListingById: async (id: string) => {
        return apiGet<any>(`/listing/single/${id}`);
    },

    /**
     * Admin: Approve a listing
     */
    approveListing: async (id: string) => {
        return apiPut<any>(`/listing/admin/approve/${id}`, {});
    },

    /**
     * Admin: Reject a listing
     */
    rejectListing: async (id: string, reason: string) => {
        return apiPut<any>(`/listing/admin/reject/${id}`, { reason });
    },
    /**
     * Update an existing listing
     */
    updateListing: async (id: string, data: Partial<CreateListingData>) => {
        return apiPut<any>(`/listing/update/${id}`, data);
    },
};
