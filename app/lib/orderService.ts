import { apiGet, apiPost, apiPatch } from "./apiClient";

export interface OrderItemInput {
  listingId: string;
  quantity?: number;
}

export interface CreateOrderPayload {
  items?: OrderItemInput[];
  listingId?: string;
  quantity?: number;
  paymentMethod?: "cash" | "transfer" | "card";
  fulfillmentMethod?: "pickup" | "delivery";
  meetupLocation?: string;
  shippingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    phone?: string;
  };
  notes?: string;
}

export const orderService = {
  /**
   * Fetch orders for the current user as a seller
   */
  getSellerOrders: async (status?: string) => {
    const query = new URLSearchParams({ role: "seller" });
    if (status) query.set("status", status);
    return apiGet<any>(`/orders?${query.toString()}`);
  },

  /**
   * Fetch orders for the current user as a buyer
   */
  getBuyerOrders: async (status?: string) => {
    const query = new URLSearchParams({ role: "buyer" });
    if (status) query.set("status", status);
    return apiGet<any>(`/orders?${query.toString()}`);
  },

  /**
   * Fetch all orders (admin role)
   */
  getAllOrdersAdmin: async (status?: string) => {
    const query = new URLSearchParams({ role: "admin" });
    if (status) query.set("status", status);
    return apiGet<any>(`/orders?${query.toString()}`);
  },

  /**
   * Fetch a single order by ID or orderId (e.g. ORD-123456-CH)
   */
  getOrderById: async (id: string) => {
    return apiGet<any>(`/orders/${id}`);
  },

  /**
   * Create a new intended exchange order
   */
  createOrder: async (data: CreateOrderPayload) => {
    return apiPost<any>("/orders", data);
  },

  /**
   * Transition order status (confirmed, processing, delivered, cancelled, disputed)
   */
  updateOrderStatus: async (id: string, status: string, comment?: string) => {
    return apiPatch<any>(`/orders/${id}`, { status, comment });
  },
};
