"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiGet } from "@/lib/apiClient";

interface User {
    id: string;
    name: string;
    email: string;
    handle: string;
    role: "user" | "pro";
    isStudent?: boolean;
    studentVerified?: boolean;
    tier?: "new" | "rising" | "trusted" | "elite";
    sellerStatus?: "none" | "pending" | "approved" | "rejected";
    avatar?: string;
    image?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
    isLoading: boolean;
    refreshUser: () => Promise<User | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Mock initial load - check localStorage
    useEffect(() => {
        const storedUser = localStorage.getItem("campus_user");
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem("campus_user", JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("campus_user");
    };

    const refreshUser = async () => {
        if (!user?.id) return null;
        try {
            const response: any = await apiGet(`users/${user.id}`);
            const userData = response?.data || response;
            const refreshed: User = {
                id: userData._id || userData.userId || user.id,
                name: userData.profile?.displayName || userData.personalDetails?.fullName || userData.name || user.email,
                email: userData.email || user.email,
                handle: userData.profile?.handle || user.handle,
                role: userData.role === "seller" ? "pro" : "user",
                isStudent: userData.studentStatus?.isStudent || false,
                studentVerified: userData.studentStatus?.isVerified || false,
                tier: user.tier,
                sellerStatus: user.sellerStatus,
                avatar: user.avatar,
                image: user.image,
            };
            setUser(refreshed);
            localStorage.setItem("campus_user", JSON.stringify(refreshed));
            return refreshed;
        } catch (e) {
            console.error("Failed to refresh user", e);
            return null;
        }
    };

    useEffect(() => {
        if (!user?.id || !user.isStudent || user.studentVerified) return;
        const interval = setInterval(() => {
            refreshUser();
        }, 60_000);
        return () => clearInterval(interval);
    }, [user?.id, user?.isStudent, user?.studentVerified]);

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
