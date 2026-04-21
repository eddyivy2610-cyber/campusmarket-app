"use client";
import { apiPost } from "./apiClient";

// Simple admin authentication wrapper using localStorage
// This is used for demonstration and client-side admin session persistence.
// In a production environment, this would verify tokens against a real backend.

const ADMIN_SESSION_KEY = "hive_admin_session";

export interface AdminSession {
    username: string;
    email: string;
    role: string;
    lastActive: number;
}

export function getAdminSession(): AdminSession | null {
    if (typeof window === "undefined") return null;
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (!session) return null;
    try {
        return JSON.parse(session) as AdminSession;
    } catch (e) {
        return null;
    }
}

export function clearAdminSession(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function signInAdmin(identity: string, password: string): Promise<{ ok: boolean; error: string; session?: AdminSession }> {
    try {
        // Real login call to backend
        const response: any = await apiPost("/auth/login", { 
            email: identity.includes("@") ? identity : undefined,
            phone: !identity.includes("@") ? identity : undefined,
            password 
        });

        if (response?.token && response?.user) {
            const user = response.user;
            
            // Check if user has admin role
            if (user.role !== "admin") {
                return { ok: false, error: "Access denied. You do not have administrator privileges." };
            }

            const session: AdminSession = {
                username: user.profile?.displayName || user.email.split("@")[0],
                email: user.email,
                role: user.role,
                lastActive: Date.now()
            };

            // Store token in standard campus_token for apiClient to use
            localStorage.setItem("campus_token", response.token);
            // Store admin-specific session
            localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));

            return { ok: true, error: "", session };
        }

        return { ok: false, error: "Invalid credentials." };
    } catch (err: any) {
        console.error("Admin sign in failed:", err);
        return { ok: false, error: err.message || "Failed to connect to the authentication server." };
    }
}

export function signOutAdmin(): void {
    clearAdminSession();
}

/**
 * Validates and mimics an admin registration process.
 * In a real-world scenario, this would create an account in the database.
 */
export function registerAdmin(data: { email: string; username: string; key: string }): { ok: boolean; error: string } {
    if (!data.email || !data.username) {
        return { ok: false, error: 'Email and Username are required.' };
    }

    // Example admin-key verification
    if (data.key !== "hive-admin-2025") {
        return { ok: false, error: 'Invalid admin registration key.' };
    }

    // Success simulation
    return { ok: true, error: '' };
}
