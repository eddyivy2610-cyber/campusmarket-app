import { apiGet, apiPost, apiDelete } from "./apiClient";

export type FollowTargetType = "user" | "store";

export interface FollowerRecord {
  followId: string;
  follower: {
    _id: string;
    name: string;
    email?: string;
    profile?: {
      displayName?: string;
      avatar?: string;
      handle?: string;
    };
  };
  followedAt: string;
}

export interface FollowingRecord {
  followId: string;
  targetType: FollowTargetType;
  targetId: string;
  target?: any;
  followedAt: string;
}

export interface FollowCountsResponse {
  success: boolean;
  targetId: string;
  targetType: FollowTargetType;
  followersCount: number;
  followingCount: number;
}

export const followService = {
  /**
   * Toggle follow status for a user or store (idempotent atomic operation)
   */
  toggleFollow: async (targetId: string, targetType: FollowTargetType = "user") => {
    return apiPost<{
      success: boolean;
      message: string;
      isFollowing: boolean;
      targetId: string;
      targetType: FollowTargetType;
    }>(`/follow/toggle/${targetId}?targetType=${targetType}`, { targetType });
  },

  /**
   * Check if current authenticated user follows a target user or store
   */
  checkFollowingStatus: async (targetId: string, targetType: FollowTargetType = "user") => {
    return apiGet<{
      success: boolean;
      isFollowing: boolean;
      targetId: string;
      targetType: FollowTargetType;
    }>(`/follow/status/${targetId}?targetType=${targetType}`);
  },

  /**
   * Explicit idempotent follow
   */
  follow: async (targetId: string, targetType: FollowTargetType = "user") => {
    return apiPost<{
      success: boolean;
      message: string;
      isFollowing: boolean;
      newlyFollowed: boolean;
      targetId: string;
      targetType: FollowTargetType;
    }>(`/follow/${targetId}?targetType=${targetType}`, { targetType });
  },

  /**
   * Explicit idempotent unfollow
   */
  unfollow: async (targetId: string, targetType: FollowTargetType = "user") => {
    return apiDelete<{
      success: boolean;
      message: string;
      isFollowing: boolean;
      newlyUnfollowed: boolean;
      targetId: string;
      targetType: FollowTargetType;
    }>(`/follow/${targetId}?targetType=${targetType}`);
  },

  /**
   * Get paginated followers of a user or store
   */
  getFollowers: async (
    targetId: string,
    page: number = 1,
    limit: number = 20,
    targetType: FollowTargetType = "user"
  ) => {
    return apiGet<{
      success: boolean;
      targetId: string;
      targetType: FollowTargetType;
      total: number;
      page: number;
      pages: number;
      count: number;
      followers: FollowerRecord[];
      data: FollowerRecord[];
    }>(`/follow/followers/${targetId}?page=${page}&limit=${limit}&targetType=${targetType}`);
  },

  /**
   * Get paginated following list for a user
   */
  getFollowing: async (
    userId: string,
    page: number = 1,
    limit: number = 20,
    targetType?: FollowTargetType
  ) => {
    const typeParam = targetType ? `&targetType=${targetType}` : "";
    return apiGet<{
      success: boolean;
      userId: string;
      total: number;
      page: number;
      pages: number;
      count: number;
      following: FollowingRecord[];
      data: FollowingRecord[];
    }>(`/follow/following/${userId}?page=${page}&limit=${limit}${typeParam}`);
  },

  /**
   * Get followers and following counts
   */
  getCounts: async (targetId: string, targetType: FollowTargetType = "user") => {
    return apiGet<FollowCountsResponse>(`/follow/counts/${targetId}?targetType=${targetType}`);
  },
};

export default followService;
