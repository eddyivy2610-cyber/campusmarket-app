import { apiGet } from "./apiClient";

export interface SellerStatsResponse {
    sellerId: string;
    generatedAt: string;
    listings: {
        total: number;
        active: number;
        inactive: number;
        products: number;
        services: number;
        categories: Array<{ category: string; count: number }>;
    };
    orders: {
        totalOrders: number;
        byStatus: {
            pending: number;
            confirmed: number;
            processing: number;
            shipped: number;
            delivered: number;
            cancelled: number;
            disputed: number;
        };
        activeOrdersCount: number;
        completedOrdersCount: number;
        cancelledOrdersCount: number;
        disputedOrdersCount: number;
    };
    orderValue: {
        completedOrderValue: number;
        completedOrderValueFormatted: string;
        activeOrderValue: number;
        activeOrderValueFormatted: string;
        currency: string;
    };
    audience: {
        followersCount: number;
        impressions: number;
    };
    store: {
        hasStore: boolean;
        storeId: string | null;
        storeName: string | null;
        storeRating: number;
        storedListingsCount: number;
        driftDetected: boolean;
    };
    recentActivity: Array<{
        id: string;
        orderId: string;
        status: string;
        totalAmount: number;
        priceFormatted: string;
        itemSummary: string;
        buyerDisplayName: string;
        createdAt: string;
    }>;
    topItems: Array<{
        id: string;
        title: string;
        views: number;
        price: number;
        priceFormatted: string;
        image: string;
        category: string;
        status: string;
    }>;
}

export const dashboardService = {
    /**
     * Fetch canonical seller dashboard statistics
     */
    getSellerStats: async (sellerId?: string) => {
        const query = sellerId ? `?sellerId=${encodeURIComponent(sellerId)}` : "";
        return apiGet<{ success: boolean; data: SellerStatsResponse }>(`/dashboard/seller-stats${query}`);
    }
};
