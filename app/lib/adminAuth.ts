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
        // Real login call to dedicated admin auth backend
        const response: any = await apiPost("admin/auth/signin", { 
            identity,
            password 
        });

        if (response?.token && response?.user) {
            const user = response.user;
            
            const session: AdminSession = {
                username: user.username,
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

        return { ok: false, error: response?.message || "Invalid credentials." };
    } catch (err: any) {
        console.error("Admin sign in failed:", err);
        return { ok: false, error: err.message || "Failed to connect to the authentication server." };
    }
}

export function signOutAdmin(): void {
    clearAdminSession();
}

/**
 * Registers an admin account via the backend.
 */
export async function registerAdmin(data: { email: string; username: string; password?: string; key: string }): Promise<{ ok: boolean; error: string }> {
    try {
        if (!data.email || !data.username) {
            return { ok: false, error: 'Email and Username are required.' };
        }

        const response: any = await apiPost("admin/auth/signup", {
            email: data.email,
            username: data.username,
            password: data.password,
            adminKey: data.key
        });

        if (response?.admin) {
            return { ok: true, error: '' };
        }

        return { ok: false, error: response?.message || "Registration failed." };
    } catch (err: any) {
        console.error("Admin registration failed:", err);
        return { ok: false, error: err.message || "Failed to connect to the registration server." };
    }
}
