import { apiGet, apiPost } from "@/lib/apiClient";

export interface ReviewItem {
  id: string;
  sellerId?: string;
  storeId?: string;
  listingId?: string;
  rating: number;
  comment: string;
  images?: string[];
  createdAt: string;
  reviewer: {
    name: string;
    avatar?: string;
  };
}

export interface ReviewsResponse {
  success: boolean;
  data: ReviewItem[];
  hasMore: boolean;
  nextCursor?: string | null;
}

export interface SubmitReviewPayload {
  orderId: string;
  rating: number;
  comment: string;
  images?: string[];
}

export const reviewClient = {
  async getReviews(params: {
    sellerId?: string;
    storeId?: string;
    listingId?: string;
    cursor?: string;
    limit?: number;
  }): Promise<ReviewsResponse> {
    const query = new URLSearchParams();
    if (params.sellerId) query.set("sellerId", params.sellerId);
    if (params.storeId) query.set("storeId", params.storeId);
    if (params.listingId) query.set("listingId", params.listingId);
    if (params.cursor) query.set("cursor", params.cursor);
    if (params.limit) query.set("limit", params.limit.toString());

    return apiGet<ReviewsResponse>(`/api/reviews?${query.toString()}`);
  },

  async submitReview(payload: SubmitReviewPayload): Promise<{
    success: boolean;
    message: string;
    data: any;
  }> {
    return apiPost<{ success: boolean; message: string; data: any }>(
      "/api/reviews",
      payload
    );
  },
};
