"use client";

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

export function signInAdmin(identity: string, password: string): { ok: boolean; error: string; session?: AdminSession } {
    // Basic local validation for demo purposes
    // Use 'admin' / 'admin123' as default credentials if not set
    if ((identity === 'admin' || identity === 'admin@campusmarket.com') && password === 'admin123') {
        const session: AdminSession = {
            username: 'Admin',
            email: 'admin@campusmarket.com',
            role: 'superuser',
            lastActive: Date.now()
        };
        localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
        return { ok: true, error: '', session };
    }
    
    return { ok: false, error: 'Invalid admin credentials. Use admin / admin123' };
}

export function signOutAdmin(): void {
    clearAdminSession();
}
