import { apiGet, apiPost } from "./apiClient";

export const orderService = {
    /**
     * Fetch orders for the current user (as a seller)
     */
    getSellerOrders: async () => {
        return apiGet<any>("/order/seller/all");
    },

    /**
     * Create a new order
     */
    createOrder: async (data: any) => {
        return apiPost<any>("/order/create", data);
    }
};
