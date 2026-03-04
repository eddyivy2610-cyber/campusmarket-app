"use client";

export interface AdminUserRecord {
    email: string;
    username: string;
    password: string;
    createdAt: string;
}

export interface AdminSession {
    email: string;
    username: string;
    signedInAt: string;
}

const USERS_KEY = "campus_admin_users";
const SESSION_KEY = "campus_admin_session";

export const ADMIN_SIGNUP_KEY = "CM-ADMIN-KEY-2026";

function readUsers(): AdminUserRecord[] {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function writeUsers(users: AdminUserRecord[]) {
    if (typeof window === "undefined") return;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidUsername(username: string) {
    return /^[a-zA-Z0-9_.-]{3,24}$/.test(username.trim());
}

export function isValidPassword(password: string) {
    return password.length >= 8;
}

export function registerAdmin(input: { email: string; username: string; password: string; key: string }) {
    const email = input.email.trim().toLowerCase();
    const username = input.username.trim();

    if (!isValidEmail(email)) return { ok: false, error: "Enter a valid email address." as const };
    if (!isValidUsername(username)) return { ok: false, error: "Username must be 3-24 characters (letters, numbers, . _ -)." as const };
    if (!isValidPassword(input.password)) return { ok: false, error: "Password must be at least 8 characters." as const };
    if (input.key.trim() !== ADMIN_SIGNUP_KEY) return { ok: false, error: "Invalid admin key." as const };

    const users = readUsers();
    const emailTaken = users.some((u) => u.email === email);
    const usernameTaken = users.some((u) => u.username.toLowerCase() === username.toLowerCase());
    if (emailTaken) return { ok: false, error: "Email already registered." as const };
    if (usernameTaken) return { ok: false, error: "Username already taken." as const };

    users.push({
        email,
        username,
        password: input.password,
        createdAt: new Date().toISOString(),
    });
    writeUsers(users);
    return { ok: true as const };
}

export function signInAdmin(identity: string, password: string) {
    const value = identity.trim();
    if (!value || !password) return { ok: false, error: "Provide username/email and password." as const };

    const users = readUsers();
    const user = value.includes("@")
        ? users.find((u) => u.email === value.toLowerCase())
        : users.find((u) => u.username.toLowerCase() === value.toLowerCase());

    if (!user || user.password !== password) {
        return { ok: false, error: "Invalid credentials." as const };
    }

    const session: AdminSession = {
        email: user.email,
        username: user.username,
        signedInAt: new Date().toISOString(),
    };
    if (typeof window !== "undefined") {
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }
    return { ok: true as const, session };
}

export function getAdminSession(): AdminSession | null {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as AdminSession;
    } catch {
        return null;
    }
}

export function clearAdminSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(SESSION_KEY);
}
