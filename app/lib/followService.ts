import { apiGet, apiPost } from "./apiClient";

export const followService = {
    /**
     * Toggle follow status for a user
     */
    toggleFollow: async (followingId: string) => {
        return apiPost<any>(`/follow/toggle/${followingId}`, {});
    },

    /**
     * Check if current user follows a target user
     */
    checkFollowingStatus: async (followingId: string) => {
        return apiGet<{ success: boolean; isFollowing: boolean }>(`/follow/status/${followingId}`);
    }
};
