"use client";

import { createContext, useContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { apiPost } from "@/lib/apiClient";

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
    sellerStatus: "none" | "pending" | "approved" | "verified" | "rejected";
    onboardingStep: "otp_verified" | "profile_completed" | "onboarding_choice" | "seller_pending" | "completed";
    avatar?: string;
    image?: string;
    campus?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => Promise<void>;
    isLoading: boolean;
    refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function deriveHandle(name?: string, email?: string, id?: string): string {
    const raw = (name || email?.split("@")[0] || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    return raw || id || "";
}

function cacheableProfile(userData: User) {
    return {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        handle: userData.handle || deriveHandle(userData.name, userData.email, userData.id),
        role: userData.role,
        isStudent: userData.isStudent,
        studentVerified: userData.studentVerified,
        emailVerified: userData.emailVerified,
        sellerStatus: userData.sellerStatus,
        onboardingStep: userData.onboardingStep,
        avatar: userData.avatar,
        image: userData.image,
        campus: userData.campus,
    };
}

function normalizeUserPayload(userData: any, fallback?: Partial<User> | null): User {
    const id = String(userData?._id || userData?.id || fallback?.id || "");
    const name =
        userData?.personalDetails?.fullName ||
        userData?.profile?.displayName ||
        userData?.name ||
        fallback?.name ||
        "";
    const email = userData?.email || fallback?.email || "";
    const handle =
        userData?.profile?.handle ||
        userData?.handle ||
        fallback?.handle ||
        deriveHandle(name, email, id);

    return {
        id,
        name,
        email,
        handle,
        role: userData?.role || fallback?.role || "buyer",
        isStudent:
            userData?.isStudent ??
            userData?.studentStatus?.isStudent ??
            fallback?.isStudent ??
            false,
        studentVerified:
            userData?.studentVerified ??
            userData?.studentStatus?.isVerified ??
            fallback?.studentVerified ??
            false,
        emailVerified: userData?.emailVerified ?? fallback?.emailVerified ?? true,
        tier: fallback?.tier || "new",
        sellerStatus: userData?.sellerStatus || fallback?.sellerStatus || "none",
        onboardingStep: userData?.onboardingStep || fallback?.onboardingStep || "completed",
        avatar: userData?.profile?.avatar || userData?.avatar || fallback?.avatar,
        image: userData?.profile?.avatar || userData?.image || userData?.avatar || fallback?.image,
        campus:
            userData?.campus ||
            userData?.profile?.campus ||
            userData?.studentStatus?.universityName ||
            fallback?.campus,
    };
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const userRef = useRef<User | null>(null);
    const lastRefreshAtRef = useRef<number>(0);

    useEffect(() => {
        userRef.current = user;
    }, [user]);

    const getStoredFallback = (): Partial<User> | null => {
        if (userRef.current) return userRef.current;
        try {
            const raw = localStorage.getItem("campus_user");
            if (raw) return JSON.parse(raw);
        } catch {
            // Ignore malformed storage
        }
        return null;
    };

    const refreshUser = useCallback(async (): Promise<User | null> => {
        try {
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
            const fallback = getStoredFallback();
            const refreshed = normalizeUserPayload(userData, fallback);

            userRef.current = refreshed;
            lastRefreshAtRef.current = Date.now();
            setUser(refreshed);
            try {
                localStorage.setItem("campus_user", JSON.stringify(cacheableProfile(refreshed)));
            } catch {}
            return refreshed;
        } catch (e: any) {
            if (e?.status === 401 || e?.status === 403) {
                // Explicit session expiration or revocation from server
                userRef.current = null;
                setUser(null);
                try {
                    localStorage.removeItem("campus_user");
                    localStorage.removeItem("campus_email_verified");
                } catch {}
            } else {
                // Transient network or server error: preserve existing cached session
                console.warn("Transient session refresh issue:", e?.message || e);
            }
            return userRef.current;
        }
    }, []);

    // Restore local state first, then refresh it from the server when possible.
    useEffect(() => {
        let isActive = true;
        const restoreSession = async () => {
            try {
                const storedUser = localStorage.getItem("campus_user");
                if (storedUser) {
                    const parsed = JSON.parse(storedUser);
                    const normalized = normalizeUserPayload(parsed, parsed);
                    userRef.current = normalized;
                    setUser(normalized);
                }
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }

            await refreshUser();

            if (isActive) setIsLoading(false);
        };

        void restoreSession();
        return () => {
            isActive = false;
        };
    }, [refreshUser]);

    // Sync state when apiClient performs a silent 401 token refresh
    useEffect(() => {
        const handleSilentRefresh = (event: Event) => {
            const customEvent = event as CustomEvent;
            if (customEvent.detail) {
                const fallback = getStoredFallback();
                const refreshed = normalizeUserPayload(customEvent.detail, fallback);
                userRef.current = refreshed;
                lastRefreshAtRef.current = Date.now();
                setUser(refreshed);
                try {
                    localStorage.setItem("campus_user", JSON.stringify(cacheableProfile(refreshed)));
                } catch {}
            }
        };

        window.addEventListener("campus_auth_refreshed", handleSilentRefresh);
        return () => {
            window.removeEventListener("campus_auth_refreshed", handleSilentRefresh);
        };
    }, []);

    // Proactively keep the 15-minute access token fresh for all active sessions
    // and refresh when the tab regains focus/visibility.
    useEffect(() => {
        if (!user?.id) return;

        // Refresh every 10 minutes (before 15-min access token expires),
        // or every 2 minutes while sellerStatus === "pending"
        const intervalMs = user.sellerStatus === "pending" ? 2 * 60 * 1000 : 10 * 60 * 1000;

        const intervalId = setInterval(() => {
            if (typeof document === "undefined" || document.visibilityState === "visible") {
                void refreshUser();
            }
        }, intervalMs);

        const handleVisibilityOrFocus = () => {
            if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
            // Refresh if more than 5 minutes have elapsed since last refresh
            if (Date.now() - lastRefreshAtRef.current > 5 * 60 * 1000) {
                void refreshUser();
            }
        };

        window.addEventListener("focus", handleVisibilityOrFocus);
        document.addEventListener("visibilitychange", handleVisibilityOrFocus);
        window.addEventListener("online", handleVisibilityOrFocus);

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("focus", handleVisibilityOrFocus);
            document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
            window.removeEventListener("online", handleVisibilityOrFocus);
        };
    }, [user?.id, user?.sellerStatus, refreshUser]);

    const login = (userData: User) => {
        const normalized = normalizeUserPayload(userData, userData);
        userRef.current = normalized;
        lastRefreshAtRef.current = Date.now();
        setUser(normalized);
        try {
            localStorage.setItem("campus_user", JSON.stringify(cacheableProfile(normalized)));
        } catch {}
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
            userRef.current = null;
            setUser(null);
            try {
                localStorage.removeItem("campus_user");
                localStorage.removeItem("campus_email_verified");
                localStorage.removeItem("ch_profile_identity_v1");
            } catch {}
            if (typeof window !== "undefined") {
                window.location.replace("/home");
            }
        }
    };

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
