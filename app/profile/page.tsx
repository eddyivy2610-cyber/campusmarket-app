"use client";

/**
 * @BACKEND: PROFILE PAGE â€” Client redirect based on mock account type.
 *
 * Replace with:
 *   - GET /api/users/me → fetch authenticated user's profile
 *   - Render the profile page with real user data
 *   - If not authenticated, redirect to /login
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

export default function ProfileRedirect() {
    const router = useRouter();
    const { user, isLoading } = useAuth();

    useEffect(() => {
        if (isLoading) return;
        if (!user) {
            router.replace("/login");
            return;
        }
        const target = `/profile/${user.handle}`;
        router.replace(target);
    }, [isLoading, router, user]);

    return null;
}
