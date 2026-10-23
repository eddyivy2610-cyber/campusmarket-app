"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiPost } from "@/lib/apiClient";
import { toast } from "sonner";

interface User {
    id: string;
    name: string;
    email: string;
    handle: string;
    role: "buyer" | "seller" | "admin";
    isStudent?: boolean;
    studentVerified?: boolean;
    emailVerified?: boolean;
    tier?: "new" | "rising" | "trusted" | "elite";
    sellerStatus: "none" | "pending" | "approved" | "rejected";
    onboardingStep: "otp_verified" | "profile_completed" | "onboarding_choice" | "seller_pending" | "completed";
    avatar?: string;
    image?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
    refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function cacheableProfile(userData: User) {
    return {
        id: userData.id,
        name: userData.name,
        handle: userData.handle,
        avatar: userData.avatar,
        image: userData.image,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Restore local state first, then refresh it from the server when possible.
    useEffect(() => {
        let isActive = true;
        const restoreSession = async () => {
            const storedUser = localStorage.getItem("campus_user");
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    console.error("Failed to parse stored user", e);
                }
            }

            await refreshUser();

            if (isActive) setIsLoading(false);
        };

        void restoreSession();
        return () => {
            isActive = false;
        };
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("campus_user", JSON.stringify(cacheableProfile(userData)));
    };

    const logout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
                credentials: "include",
            });
        } catch {
            // Clear local state even if the network is unavailable.
        } finally {
            setUser(null);
            localStorage.removeItem("campus_user");
            localStorage.removeItem("campus_email_verified");
            localStorage.removeItem("ch_profile_identity_v1");
            if (typeof window !== "undefined") {
                window.location.replace("/home");
            }
        }
    };

    const refreshUser = async () => {
        try {
            // Call the refresh-token endpoint to get latest data and a fresh JWT
            let response: any;
            for (let attempt = 0; attempt < 3; attempt += 1) {
                try {
                    response = await apiPost("auth/refresh");
                    break;
                } catch (error: any) {
                    if (error?.status !== 503 || attempt === 2) throw error;
                    await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
                }
            }
            const userData = response?.user || response?.data || response;
            const refreshed: User = {
                id: userData._id || userData.id || user?.id || "",
                name: userData.personalDetails?.fullName || userData.profile?.displayName || userData.name || user?.name || "",
                email: userData.email || user?.email || "",
                handle: userData.profile?.handle || user?.handle || "",
                role: userData.role || user?.role || "buyer",
                isStudent: userData.isStudent ?? userData.studentStatus?.isStudent ?? user?.isStudent ?? false,
                studentVerified: userData.studentVerified ?? userData.studentStatus?.isVerified ?? user?.studentVerified ?? false,
                emailVerified: userData.emailVerified ?? user?.emailVerified ?? false,
                tier: user?.tier || "new",
                sellerStatus: userData.sellerStatus || "none",
                onboardingStep: userData.onboardingStep || "completed",
                avatar: userData.profile?.avatar || user?.avatar,
                image: userData.profile?.avatar || user?.image,
            };
            
            setUser(refreshed);
            localStorage.setItem("campus_user", JSON.stringify(cacheableProfile(refreshed)));
            return refreshed;
        } catch (e: any) {
            console.error("Failed to refresh user", e);
            if (e?.status !== 401) {
                toast.error("Session refresh failed: " + (e.message || "Unknown error"));
            }
            return null;
        }
    };

    useEffect(() => {
        if (!user?.id) return;
        
        // Poll more frequently if user is pending verification or seller approval
        const isPending = (!user.studentVerified && user.isStudent) || user.sellerStatus === "pending";
        if (!isPending) return;

        let timeoutId: NodeJS.Timeout;
        
        const poll = async () => {
            await refreshUser();
            timeoutId = setTimeout(poll, 30_000);
        };

        timeoutId = setTimeout(poll, 30_000);
        
        return () => clearTimeout(timeoutId);
    }, [user?.id, user?.isStudent, user?.studentVerified, user?.sellerStatus]);

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
