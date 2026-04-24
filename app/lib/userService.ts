import { apiPost, apiPatch } from "./apiClient";

export const userService = {
    /**
     * Upload an image to Cloudinary and update user profile avatar
     */
    updateAvatar: async (userId: string, file: File) => {
        const formData = new FormData();
        formData.append("images", file); // Reusing the /upload endpoint which expects "images"

        // 1. Upload to Cloudinary
        const uploadRes = await apiPost<{ success: boolean; urls: string[] }>("/upload", formData);
        
        if (!uploadRes.success || !uploadRes.urls?.[0]) {
            throw new Error("Failed to upload image");
        }

        const avatarUrl = uploadRes.urls[0];

        // 2. Update user profile
        const updateRes = await apiPatch<any>(`/api/users/update/${userId}`, {
            profile: {
                avatar: avatarUrl
            }
        });

        return {
            success: true,
            avatarUrl,
            data: updateRes
        };
    },

    /**
     * Update user cover photo
     */
    updateCoverPhoto: async (userId: string, file: File) => {
        const formData = new FormData();
        formData.append("images", file);

        const uploadRes = await apiPost<{ success: boolean; urls: string[] }>("/upload", formData);
        
        if (!uploadRes.success || !uploadRes.urls?.[0]) {
            throw new Error("Failed to upload image");
        }

        const coverUrl = uploadRes.urls[0];

        const updateRes = await apiPatch<any>(`/api/users/update/${userId}`, {
            profile: {
                coverPhoto: coverUrl
            }
        });

        return {
            success: true,
            coverUrl,
            data: updateRes
        };
    }
};
