import { apiPatch } from "./apiClient";
import { uploadFileClient } from "./clientUpload";

export const userService = {
    /**
     * Upload an image to Cloudinary via canonical secure flow and update user profile avatar
     */
    updateAvatar: async (userId: string, file: File) => {
        // 1. Direct upload via canonical upload flow
        const uploadRes = await uploadFileClient(file, "avatar");
        
        if (!uploadRes.success || !uploadRes.url) {
            throw new Error(uploadRes.error || "Failed to upload avatar");
        }

        const avatarUrl = uploadRes.url;

        // 2. Update user profile
        const updateRes = await apiPatch<any>(`/api/users/update/${userId}`, {
            "profile.avatar": avatarUrl
        });

        return {
            success: true,
            avatarUrl,
            data: updateRes
        };
    },

    /**
     * Update user cover photo via canonical secure flow
     */
    updateCoverPhoto: async (userId: string, file: File) => {
        const uploadRes = await uploadFileClient(file, "cover_image");
        
        if (!uploadRes.success || !uploadRes.url) {
            throw new Error(uploadRes.error || "Failed to upload cover photo");
        }

        const coverUrl = uploadRes.url;

        const updateRes = await apiPatch<any>(`/api/users/update/${userId}`, {
            "profile.coverImage": coverUrl
        });

        return {
            success: true,
            coverUrl,
            data: updateRes
        };
    }
};
