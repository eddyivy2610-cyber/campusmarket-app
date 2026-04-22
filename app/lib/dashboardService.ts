import { apiGet } from "./apiClient";

export const dashboardService = {
    /**
     * Fetch seller dashboard stats
     */
    getSellerStats: async () => {
        return apiGet<any>("/dashboard/seller-stats");
    }
};
